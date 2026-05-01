/**
 * Form Validation Utilities
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate email format
 */
export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return "Email tidak boleh kosong";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Format email tidak valid (contoh: user@email.com)";
  }

  return null;
}

/**
 * Validate username
 */
export function validateUsername(username: string): string | null {
  if (!username.trim()) {
    return "Username tidak boleh kosong";
  }

  if (username.trim().length < 3) {
    return "Username minimal 3 karakter";
  }

  if (username.length > 20) {
    return "Username maksimal 20 karakter";
  }

  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return "Username hanya boleh mengandung huruf, angka, underscore, dan dash";
  }

  return null;
}

/**
 * Validate password
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return "Password tidak boleh kosong";
  }

  if (password.length < 8) {
    return "Password minimal 8 karakter";
  }

  if (password.length > 50) {
    return "Password maksimal 50 karakter";
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return "Password harus mengandung huruf besar, huruf kecil, dan angka";
  }

  return null;
}

/**
 * Validate all registration fields
 */
export function validateRegistration(
  username: string,
  email: string,
  password: string
): ValidationResult {
  const errors: ValidationError[] = [];

  const usernameError = validateUsername(username);
  if (usernameError) {
    errors.push({ field: "username", message: usernameError });
  }

  const emailError = validateEmail(email);
  if (emailError) {
    errors.push({ field: "email", message: emailError });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.push({ field: "password", message: passwordError });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate PIN (4-6 digits)
 */
export function validatePin(pin: string): string | null {
  if (!pin.trim()) {
    return "PIN tidak boleh kosong";
  }

  if (!/^\d{4,6}$/.test(pin)) {
    return "PIN harus 4-6 digit angka";
  }

  return null;
}

/**
 * Validate children registration (username + pin)
 */
export function validateChildrenRegistration(
  username: string,
  pin: string
): ValidationResult {
  const errors: ValidationError[] = [];

  const usernameError = validateUsername(username);
  if (usernameError) {
    errors.push({ field: "username", message: usernameError });
  }

  const pinError = validatePin(pin);
  if (pinError) {
    errors.push({ field: "pin", message: pinError });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
