// Define the basic configuration for the email provider as a plain object
// The actual sending logic will be implemented in convex/auth.ts
const authConfig = {
  providers: [
    {
      id: "resend", // This ID must match the one used in convex/auth.ts
      type: "email", // Explicitly specify the type
      from: 'LLMVerse <noreply@mail.siavash.live>', // Use your verified Resend domain
      // sendVerificationRequest is intentionally omitted here
      // It will be provided dynamically in convex/auth.ts
    },
    // You could add more providers here (e.g., Google, GitHub)
  ],
};

export default authConfig; 