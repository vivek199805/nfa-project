import crypto from 'crypto';

/**
 * Generates a secure OTP (One-Time Password) of the specified length.
 * Uses cryptographically secure random number generation for security.
 * @param {number} length - The length of the OTP (default: 6).
 * @returns {string} The generated OTP as a string of digits.
 */
function generateOtp(length = 6) {
  if (length < 1 || length > 10) {
    throw new Error('OTP length must be between 1 and 10.');
  }
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += crypto.randomInt(0, 10).toString();
  }
  return otp;
}

export default generateOtp;