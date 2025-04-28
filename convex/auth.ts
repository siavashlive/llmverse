import { convexAuth } from "@convex-dev/auth/server";
import { Email } from "@convex-dev/auth/providers/Email"; 
import { type EmailConfig } from "@convex-dev/auth/server"; // Import necessary types
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { Resend } from "resend"; // Import Resend here

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

// Initialize Convex Auth directly with the full Email provider config
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Email({
      id: "resend", // Explicitly define ID here
      from: 'LLMVerse <noreply@mail.siavash.live>', // Explicitly define from here
      sendVerificationRequest, // Provide the sending function defined above
    })
  ],
});

// --- User Creation (Keep if needed for initial user setup) ---
// NOTE: @convex-dev/auth might handle user creation automatically on first sign-in.
// This custom function might only be needed if you have specific logic 
// (like setting initial credits/role) that the default doesn't cover.
// Verify if the library handles creation before keeping this long-term.

export const createUser = mutation({
  args: {
    email: v.string(),
  },
  async handler(ctx, args) {
    const existingUser = await ctx.db
      .query("users")
      // Use the default index on the email field provided by authTables
      .withIndex("email", (q) => q.eq("email", args.email)) 
      .first();

    if (existingUser) {
      console.log(`User already exists: ${args.email}, ID: ${existingUser._id}`);
      // Potentially update existing user fields if needed upon re-login/creation attempt
      // Example: await ctx.db.patch(existingUser._id, { lastLogin: Date.now() });
      return existingUser._id;
    }

    console.log(`Creating new user: ${args.email}`);
    // Insert only the fields you need to customize beyond what @convex-dev/auth provides
    const userId = await ctx.db.insert("users", {
      email: args.email, 
      credits: 0, // Custom field: Default credits as per PRD
      role: "user",   // Custom field: Default role
      // name: args.email.split('@')[0], // Optionally set a default name
      // createdAt is likely handled by Convex or @convex-dev/auth
    });
    console.log(`New user created: ${args.email}, ID: ${userId}`);

    return userId;
  },
});

// Note: The old sendMagicLink and verifyToken functions are removed as 
// @convex-dev/auth handles this flow via the configuration in auth.config.ts 
// and the exported signIn/signOut actions.