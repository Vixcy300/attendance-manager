const crypto = require('crypto');

// 32-byte encryption key (using env variable or a secure fallback)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'saveetha_attendance_manager_secure_aes256_key_32bytes!';
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts clear text using AES-256-CBC
 * @param {string} text Clear text password
 * @returns {string} Encrypted text in format iv:encryptedHex
 */
function encrypt(text) {
  if (!text) return '';
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption failed:', error);
    return '';
  }
}

/**
 * Decrypts encrypted text using AES-256-CBC
 * @param {string} text Encrypted text in format iv:encryptedHex
 * @returns {string} Decrypted clear text
 */
function decrypt(text) {
  if (!text) return '';
  try {
    const textParts = text.split(':');
    if (textParts.length < 2) return '';
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

module.exports = { encrypt, decrypt };
