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