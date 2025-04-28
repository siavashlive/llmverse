import { convexAuth } from "@convex-dev/auth/server";
import { Email } from "@convex-dev/auth/providers/email";
import authConfig from "./auth.config";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * Authentication configuration for Convex
 * 
 * This setup uses Resend for email delivery of magic links
 */

// Check if RESEND_API_KEY is set, critical for email provider
if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
  console.error("CRITICAL: RESEND_API_KEY is not set in production environment!");
  // Consider throwing an error in production if Resend is essential
  // throw new Error("RESEND_API_KEY must be set in production");
}

// Initialize Convex Auth
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    // Ensure the config object is correctly typed and passed
    Email(authConfig.providers.find(p => p.id === 'resend') as any)
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
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      credits: 0,
      role: "user",
      createdAt: Date.now(),
    });

    return userId;
  },
});

// Note: sendMagicLink is now handled by the Email provider config in auth.config.ts
// This function might become obsolete or need repurposing.

// Note: verifyToken is largely handled by the @convex-dev/auth library now.
// This function might become obsolete.
export const verifyToken_Legacy = mutation({
  // Renamed to avoid conflict if needed, otherwise remove
  args: {
    token: v.string(),
  },
  async handler(ctx, args) {
    // This logic is likely superseded by @convex-dev/auth internal handling.
    // It's kept here for reference but should probably be removed.
    console.warn("verifyToken_Legacy is likely obsolete. Use @convex-dev/auth flow.");
    try {
      const tokens = await ctx.db
        .query("authTokens")
        .withIndex("byToken", (q) => q.eq("token", args.token))
        .collect();

      if (tokens.length === 0) {
        throw new AuthError("Invalid token (legacy check)");
      }
      const tokenData = tokens[0];
      if (tokenData.expiresAt < Date.now()) {
        throw new AuthError("Token expired (legacy check)");
      }

      const existingUser = await ctx.db
        .query("users")
        .withIndex("byEmail", (q) => q.eq("email", tokenData.email))
        .first();

      let userId: Id<"users">;
      if (existingUser) {
        userId = existingUser._id;
      } else {
        userId = await ctx.db.insert("users", {
          email: tokenData.email,
          credits: 0,
          role: "user",
          createdAt: Date.now(),
        });
      }
      await ctx.db.delete(tokenData._id);
      return { userId: userId.toString(), email: tokenData.email };
    } catch (error: any) {
      console.error("Legacy Token verification error:", error);
      throw new AuthError(error.message || "Legacy Token verification failed");
    }
  },
});

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