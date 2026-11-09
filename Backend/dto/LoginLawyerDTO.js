/**
 * Data Transfer Object (DTO) for Lawyer Login
 * Validates and sanitizes email and password from the Lawyer Login Screen
 */
class LoginLawyerDTO {
  constructor({ email, password }) {
    this.email = email ? email.trim().toLowerCase() : '';
    this.password = password || '';
  }

  validate() {
    const errors = [];

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email) {
      errors.push('Email address is required.');
    } else if (!emailRegex.test(this.email)) {
      errors.push('Please provide a valid email address.');
    }

    // Password validation
    if (!this.password) {
      errors.push('Password is required.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = LoginLawyerDTO;
