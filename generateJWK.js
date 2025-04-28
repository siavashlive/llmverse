const fs = require('fs');
const jose = require('node-jose');

async function convertPemToJwk() {
  // Read the PEM file
  const privateKeyPem = fs.readFileSync('./private_key.pem', 'utf8');
  
  // Convert PEM to JWK
  const keystore = jose.JWK.createKeyStore();
  const key = await keystore.add(privateKeyPem, 'pem');
  
  // Get the public JWK
  const publicJwk = key.toJSON();
  
  // Add the 'use' property required by Convex
  publicJwk.use = 'sig';
  
  // Wrap in the format expected by Convex
  const jwks = {
    keys: [publicJwk]
  };
  
  // Output formatted JWK
  console.log('JWKS=' + JSON.stringify(jwks));
  
  // Output private key in the format needed for .env file
  const privateKeyFormatted = privateKeyPem.replace(/\n/g, "\\n");
  console.log('\nCONVEX_AUTH_PRIVATE_KEY="' + privateKeyFormatted + '"');
}

convertPemToJwk().catch(err => console.error(err)); 