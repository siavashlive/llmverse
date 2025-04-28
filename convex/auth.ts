import { convexAuth } from "@convex-dev/auth/server";
import { Email } from "@convex-dev/auth/providers/Email";
import { type EmailConfig, type EmailUserConfig } from "@convex-dev/auth/server";
import authConfig from "./auth.config";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { Resend } from "resend";

/**
 * Authentication configuration for Convex
 * 
 * This setup uses Resend for email delivery of magic links
 */

// Define the type for the parameters passed to sendVerificationRequest
interface VerificationRequestParams {
  identifier: string; // This is the email address
  url: string;        // The magic link URL
  token: string;      // The verification token
  provider: EmailConfig; // The provider configuration
  // theme: Theme; // Theme object might also be passed, add if needed
}

// Define the email sending function using Resend
async function sendVerificationRequest({ 
  identifier: email, 
  url, 
  token, 
  provider 
}: VerificationRequestParams) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error("CRITICAL: RESEND_API_KEY is not set. Cannot send email.");
    // Log link for development/backup
    console.log("========== RESEND NOT CONFIGURED - MAGIC LINK ==========");
    console.log(`Magic Link for ${email}:`);
    console.log(url);
    console.log("=========================================================");
    return; // Stop if Resend isn't configured
  }

  const resend = new Resend(resendApiKey);

  try {
    await resend.emails.send({
      from: provider.from!, // Use the 'from' address from the config
      to: [email],
      subject: 'Sign in to LLMVerse',
      html: `
        <div>
          <h1>Welcome to LLMVerse!</h1>
          <p>Click the link below to sign in:</p>
          <a href="${url}">Sign In to LLMVerse</a>
          <p>This link includes a token: ${token} and will expire shortly.</p>
        </div>
      `,
    });
    console.log(`Magic link email sent to ${email} (token: ${token})`);
    console.log("========== MAGIC LINK ==========");
    console.log(`Magic Link for ${email}:`);
    console.log(url);
    console.log("================================");
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Log link even if email fails
    console.log("========== FAILED EMAIL - MAGIC LINK ==========");
    console.log(`Magic Link for ${email}:`);
    console.log(url);
    console.log("=============================================");
  }
}

// Check Resend API Key at startup (optional, but good practice)
if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn("WARNING: RESEND_API_KEY is not set in production environment! Email sending will fail.");
}

// Find the email provider config
const emailProvider = authConfig.providers.find(p => p.id === 'resend') as EmailUserConfig;
if (!emailProvider) {
  throw new Error("Resend email provider configuration not found in auth.config.ts");
}

// Initialize Convex Auth, passing the sendVerificationRequest function
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Email({
      ...emailProvider, // Spread the basic config from auth.config.ts
      sendVerificationRequest, // Provide the sending function defined above
    })
  ],
});

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
    const existingUser = await ctx.db
      .query("users")
      .withIndex("byEmail", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      console.log(`User already exists: ${args.email}, ID: ${existingUser._id}`);
      return existingUser._id;
    }

    console.log(`Creating new user: ${args.email}`);
    const userId = await ctx.db.insert("users", {
      email: args.email,
      credits: 0, // Default credits as per PRD
      role: "user",
      createdAt: Date.now(),
    });
    console.log(`New user created: ${args.email}, ID: ${userId}`);

    return userId;
  },
});

// Note: The old sendMagicLink and verifyToken functions are removed as 
// @convex-dev/auth handles this flow via the configuration in auth.config.ts 
// and the exported signIn/signOut actions.

// Helper function (can be kept if needed)
function generateToken() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
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