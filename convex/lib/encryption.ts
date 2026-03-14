/**
 * AES-256-GCM encryption for sensitive data (social tokens).
 * Uses Web Crypto API available in Convex runtime.
 * Requires TOKEN_ENCRYPTION_KEY env var (base64-encoded 32-byte key).
 *
 * Generate a key: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */

const ALGORITHM = "AES-GCM";
const IV_LENGTH = 12; // 96-bit IV for AES-GCM

function getEncryptionKey(): string {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error("TOKEN_ENCRYPTION_KEY environment variable is not set");
  }
  return key;
}

async function importKey(rawKeyBase64: string): Promise<CryptoKey> {
  const rawKey = Uint8Array.from(atob(rawKeyBase64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", rawKey, { name: ALGORITHM }, false, [
    "encrypt",
    "decrypt",
  ]);
}

/**
 * Encrypt a plaintext string. Returns "iv:ciphertext" in base64.
 */
export async function encrypt(plaintext: string): Promise<string> {
  const key = await importKey(getEncryptionKey());
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded
  );

  const ivBase64 = btoa(String.fromCharCode(...iv));
  const cipherBase64 = btoa(
    String.fromCharCode(...new Uint8Array(cipherBuffer))
  );

  return `${ivBase64}:${cipherBase64}`;
}

/**
 * Decrypt an "iv:ciphertext" base64 string back to plaintext.
 * If the value doesn't look encrypted (no colon separator), returns it as-is
 * for backward compatibility with existing unencrypted tokens.
 */
export async function decrypt(encrypted: string): Promise<string> {
  // Backward compat: if no colon, it's a legacy plaintext token
  if (!encrypted.includes(":")) {
    return encrypted;
  }

  const [ivBase64, cipherBase64] = encrypted.split(":", 2);
  if (!ivBase64 || !cipherBase64) {
    return encrypted;
  }

  try {
    const key = await importKey(getEncryptionKey());
    const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
    const cipherData = Uint8Array.from(atob(cipherBase64), (c) =>
      c.charCodeAt(0)
    );

    const plainBuffer = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      cipherData
    );

    return new TextDecoder().decode(plainBuffer);
  } catch {
    // If decryption fails, assume it's a legacy plaintext token
    return encrypted;
  }
}
