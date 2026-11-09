/**
 * Data Transfer Object (DTO) for Citizen Registration
 * Validates and sanitizes inputs from the Citizen Signup Screen
 */
class RegisterCitizenDTO {
  constructor({ fullName, name, full_name, phone, district, email, password, confirmPassword }) {
    this.fullName = (fullName || name || full_name || '').trim();
    this.phone = phone ? phone.trim() : '';
    this.district = district ? district.trim() : '';
    this.email = email ? email.trim().toLowerCase() : '';
    this.password = password || '';
    this.confirmPassword = confirmPassword || '';
  }

  validate() {
    const errors = [];

    // Full Name
    if (!this.fullName || this.fullName.length < 3) {
      errors.push('Full Name is required and must be at least 3 characters.');
    }

    // Phone Number
    if (!this.phone) {
      errors.push('Phone Number is required.');
    }

    // District
    if (!this.district) {
      errors.push('District is required.');
    }

    // Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email) {
      errors.push('Email Address is required.');
    } else if (!emailRegex.test(this.email)) {
      errors.push('Please enter a valid email address.');
    }

    // Password Complexity (Matches UI: 8+ chars, 1 lowercase, 1 number, 1 special char)
    if (!this.password) {
      errors.push('Password is required.');
    } else {
      if (this.password.length < 8) {
        errors.push('Password must be at least 8 characters long.');
      }
      if (!/[a-z]/.test(this.password)) {
        errors.push('Password must contain at least one lowercase letter (a-z).');
      }
      if (!/[0-9]/.test(this.password)) {
        errors.push('Password must contain at least one number (0-9).');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(this.password)) {
        errors.push('Password must contain at least one special character (!@#...).');
      }
    }

    // Confirm password match if provided
    if (this.confirmPassword && this.password !== this.confirmPassword) {
      errors.push('Passwords do not match.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = RegisterCitizenDTO;
