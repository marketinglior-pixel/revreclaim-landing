import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("ENCRYPTION_SECRET environment variable is not set");
  }
  // Derive a 32-byte key from the secret
  return scryptSync(secret, "revreclaim-salt", 32);
}

/**
 * Encrypt a plaintext string (e.g., a Stripe API key).
 * Returns a string in format: iv:authTag:encryptedData (all hex-encoded)
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt an encrypted string back to plaintext.
 * Expects format: iv:authTag:encryptedData (all hex-encoded)
 */
export function decrypt(encryptedString: string): string {
  const key = getKey();
  const [ivHex, authTagHex, encrypted] = encryptedString.split(":");

  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error("Invalid encrypted string format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
