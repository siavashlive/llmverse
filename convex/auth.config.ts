import { type EmailUserConfig } from "@convex-dev/auth/server";

// Define the basic configuration for the email provider
// The actual sending logic will be implemented in convex/auth.ts
const emailProviderConfig: EmailUserConfig = {
  id: "resend", // This ID must match the one used in convex/auth.ts
  from: 'LLMVerse <noreply@mail.siavash.live>', // Use your verified Resend domain
  // sendVerificationRequest is intentionally omitted here
  // It will be provided dynamically in convex/auth.ts
};

export default {
  providers: [
    // You could add more providers here (e.g., Google, GitHub)
    emailProviderConfig,
  ],
}; 