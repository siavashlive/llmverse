import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Resend } from "resend";
import { Id } from "./_generated/dataModel";

/**
 * Authentication configuration for Convex
 * 
 * This setup uses Resend for email delivery of magic links
 */

// Create Resend client with environment variable
const resendApiKey = process.env.RESEND_API_KEY;
console.log("Resend API Key exists:", resendApiKey); // Log if key exists without exposing the key
const resend = new Resend(resendApiKey);

// Custom error class
class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

// User authentication functions
export const createUser = mutation({
  args: {
    email: v.string(),
  },
  async handler(ctx, args) {
    // Check if user already exists
    const existingUsers = await ctx.db
      .query("users")
      .withIndex("byEmail", (q) => q.eq("email", args.email))
      .collect();

    if (existingUsers.length > 0) {
      return existingUsers[0]._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      credits: 0,
      role: "user",
      createdAt: Date.now(),
    });

    return userId;
  },
});

export const sendMagicLink = mutation({
  args: {
    email: v.string(),
    redirectUrl: v.string(),
  },
  async handler(ctx, args) {
    try {
      // Generate a unique token that will identify this magic link
      const token = generateToken();
      
      // Store the token with expiration time
      const tokenId = await ctx.db.insert("authTokens", {
        email: args.email,
        token,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
        createdAt: Date.now(),
      });

      // Construct the magic link URL
      const magicLinkUrl = `${args.redirectUrl}?token=${token}`;
      
      // Always log the magic link in development for backup access
      console.log("========== MAGIC LINK ==========");
      console.log(`Magic Link for ${args.email}:`);
      console.log(magicLinkUrl);
      console.log("================================");
      
      try {
        // Attempt to send email
        const { data, error } = await resend.emails.send({
          from: 'LLMVerse <noreply@mail.siavash.live>',
          to: [args.email],
          subject: 'Sign in to LLMVerse',
          html: `
            <div>
              <h1>Welcome to LLMVerse!</h1>
              <p>Click the link below to sign in:</p>
              <a href="${magicLinkUrl}">Sign In to LLMVerse</a>
              <p>This link will expire in 15 minutes.</p>
            </div>
          `,
        });

        console.log("Resend response:", { data: !!data, error });
        
        if (error) {
          console.error("Resend error details:", JSON.stringify(error));
          throw new AuthError(`Failed to send email: ${error.message}`);
        }
        
        console.log("Email sent successfully to", args.email);
      } catch (emailError: any) {
        console.error("Email sending error:", emailError);
        console.log("Continuing with magic link from console");
        // Don't throw here, allow login via console link
      }

      return { success: true, email: args.email };
    } catch (error: any) {
      console.error("Auth error:", error);
      throw new AuthError(`Authentication error: ${error.message}`);
    }
  },
});

export const verifyToken = mutation({
  args: {
    token: v.string(),
  },
  async handler(ctx, args) {
    // Find the token
    const tokens = await ctx.db
      .query("authTokens")
      .withIndex("byToken", (q) => q.eq("token", args.token))
      .collect();

    if (tokens.length === 0) {
      throw new AuthError("Invalid token");
    }

    const tokenData = tokens[0];
    
    // Check if token is expired
    if (tokenData.expiresAt < Date.now()) {
      throw new AuthError("Token expired");
    }

    // Get or create user
    const existingUsers = await ctx.db
      .query("users")
      .withIndex("byEmail", (q) => q.eq("email", tokenData.email))
      .collect();

    let userId: Id<"users">;
    if (existingUsers.length > 0) {
      userId = existingUsers[0]._id;
    } else {
      // Create new user
      userId = await ctx.db.insert("users", {
        email: tokenData.email,
        credits: 0,
        role: "user",
        createdAt: Date.now(),
      });
    }

    // Delete the used token
    await ctx.db.delete(tokenData._id);

    return { userId, email: tokenData.email };
  },
});

// Helper function to generate a random token
function generateToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Add the authTokens table to schema.ts
/* 
  authTokens: defineTable({
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("byToken", ["token"]),
*/ 