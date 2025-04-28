import { SignJWT } from 'jose';
import { importPKCS8 } from 'jose';

// This function would run on the client to generate a signed JWT
export async function signToken(userId: string): Promise<string> {
  if (!process.env.CONVEX_AUTH_PRIVATE_KEY) {
    throw new Error('Missing CONVEX_AUTH_PRIVATE_KEY environment variable');
  }

  try {
    // Import the PKCS8 private key
    const privateKey = await importPKCS8(
      process.env.CONVEX_AUTH_PRIVATE_KEY,
      'RS256'
    );

    // Create the issuer URL (should match your Convex configuration)
    const issuer = process.env.CONVEX_SITE_URL || 'http://localhost:3000';

    // Create and sign the JWT
    const token = await new SignJWT({
      sub: userId, // Subject (user identifier)
    })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt()
      .setIssuer(issuer)
      .setAudience('convex') // Must match applicationID in auth.config.ts
      .setExpirationTime('1h')
      .sign(privateKey);

    return token;
  } catch (error) {
    console.error('Error signing token:', error);
    throw error;
  }
} 