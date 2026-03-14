import { describe, it, expect, beforeAll } from "vitest";
import { encrypt, decrypt } from "../encryption";

beforeAll(() => {
  process.env.ENCRYPTION_SECRET = "test-secret-key-for-unit-tests-only";
});

describe("encryption", () => {
  it("encrypt() returns a string different from the input", () => {
    const plaintext = "sk_test_abc123";
    const encrypted = encrypt(plaintext);
    expect(encrypted).not.toBe(plaintext);
    expect(typeof encrypted).toBe("string");
  });

  it("decrypt() reverses encrypt() and returns original value", () => {
    const plaintext = "sk_test_abc123_secret_key";
    const encrypted = encrypt(plaintext);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("encrypt() with different inputs produces different outputs", () => {
    const encrypted1 = encrypt("key-one");
    const encrypted2 = encrypt("key-two");
    expect(encrypted1).not.toBe(encrypted2);
  });

  it("decrypt() with corrupted data throws an error", () => {
    expect(() => decrypt("invalid:data:here")).toThrow();
  });

  it("decrypt() with invalid format throws an error", () => {
    expect(() => decrypt("not-a-valid-format")).toThrow("Invalid encrypted string format");
  });

  it("encrypting empty string produces valid format but decrypt rejects empty data", () => {
    const encrypted = encrypt("");
    // Empty string encrypts to salt:iv:authTag: (empty data segment)
    // decrypt's validation rejects this as invalid format, which is correct behavior
    const parts = encrypted.split(":");
    expect(parts).toHaveLength(4);
    expect(parts[3]).toBe(""); // empty encrypted data
    expect(() => decrypt(encrypted)).toThrow("Invalid encrypted string format");
  });

  it("encrypted output has salt:iv:authTag:data format", () => {
    const encrypted = encrypt("test");
    const parts = encrypted.split(":");
    expect(parts).toHaveLength(4);
    // Salt is 16 bytes = 32 hex chars
    expect(parts[0]).toHaveLength(32);
    // IV is 16 bytes = 32 hex chars
    expect(parts[1]).toHaveLength(32);
    // Auth tag is 16 bytes = 32 hex chars
    expect(parts[2]).toHaveLength(32);
  });
});
