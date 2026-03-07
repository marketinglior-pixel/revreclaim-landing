import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";

/** Static salt used in the legacy (3-part) format — kept for backward compatibility only. */
const LEGACY_SALT = "revreclaim-salt";

function deriveKey(salt: Buffer | string): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("ENCRYPTION_SECRET environment variable is not set");
  }
  return scryptSync(secret, salt, 32);
}

/**
 * Encrypt a plaintext string (e.g., a Stripe API key).
 * Returns a string in format: salt:iv:authTag:encryptedData (all hex-encoded).
 *
 * Each encryption generates a unique random salt, so identical plaintexts
 * produce different ciphertexts and an exposed ENCRYPTION_SECRET alone
 * cannot derive the key without the per-record salt.
 */
export function encrypt(plaintext: string): string {
  const salt = randomBytes(16);
  const key = deriveKey(salt);
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // New 4-part format: salt:iv:authTag:encryptedData
  return `${salt.toString("hex")}:${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt an encrypted string back to plaintext.
 *
 * Supports two formats for backward compatibility:
 * - Legacy  (3-part): iv:authTag:encryptedData  (static salt)
 * - Current (4-part): salt:iv:authTag:encryptedData (per-record salt)
 */
export function decrypt(encryptedString: string): string {
  const parts = encryptedString.split(":");

  let salt: Buffer | string;
  let ivHex: string;
  let authTagHex: string;
  let encrypted: string;

  if (parts.length === 4) {
    // New format: salt:iv:authTag:encryptedData
    [, ivHex, authTagHex, encrypted] = parts;
    salt = Buffer.from(parts[0], "hex");
  } else if (parts.length === 3) {
    // Legacy format: iv:authTag:encryptedData (static salt)
    [ivHex, authTagHex, encrypted] = parts;
    salt = LEGACY_SALT;
  } else {
    throw new Error("Invalid encrypted string format");
  }

  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error("Invalid encrypted string format");
  }

  const key = deriveKey(salt);
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
