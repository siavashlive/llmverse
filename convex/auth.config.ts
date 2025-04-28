import { type EmailUserConfig } from "@convex-dev/auth/server";
import { Resend } from "resend";

// Define the configuration for the email provider
const emailProviderConfig: EmailUserConfig = {
  id: "resend", // This ID must match the one used in convex/auth.ts
  from: 'LLMVerse <noreply@mail.siavash.live>', // Use your verified Resend domain
  
  // Function to send the verification request (magic link email)
  async sendVerificationRequest({ identifier: email, url, token }) {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("CRITICAL: RESEND_API_KEY is not set. Cannot send email.");
      // Log the link for development/backup even if email sending fails
      console.log("========== RESEND NOT CONFIGURED - MAGIC LINK ==========");
      console.log(`Magic Link for ${email}:`);
      console.log(url);
      console.log("=========================================================");
      // Consider throwing an error or returning a specific status if email is critical
      return; 
    }

    const resend = new Resend(resendApiKey);

    try {
      await resend.emails.send({
        from: this.from!, // Use the 'from' address defined above
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
      // Also log for development/backup
      console.log("========== MAGIC LINK ==========");
      console.log(`Magic Link for ${email}:`);
      console.log(url);
      console.log("================================");
    } catch (error) {
      console.error("Failed to send verification email:", error);
      // Log the URL even if email fails for development purposes
      console.log("========== FAILED EMAIL - MAGIC LINK ==========");
      console.log(`Magic Link for ${email}:`);
      console.log(url);
      console.log("=============================================");
      // Do not re-throw the error here, as the user might still use the console link
    }
  },
};

export default {
  providers: [
    // You could add more providers here (e.g., Google, GitHub)
    emailProviderConfig,
  ],
}; 