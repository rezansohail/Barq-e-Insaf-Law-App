/**
 * Data Transfer Object (DTO) for Lawyer Registration
 * Validates and sanitizes inputs from the Lawyer Signup Screen
 */
class RegisterLawyerDTO {
  constructor({ name, phone, cnic, district, sbcNumber, sbc_number, specialty, email, password, confirmPassword }) {
    this.name = name ? name.trim() : '';
    this.phone = phone ? phone.trim() : '';
    this.cnic = cnic ? cnic.trim() : '';
    this.district = district ? district.trim() : '';
    this.sbcNumber = (sbcNumber || sbc_number || '').trim();
    this.specialty = specialty ? specialty.trim() : '';
    this.email = email ? email.trim().toLowerCase() : '';
    this.password = password || '';
    this.confirmPassword = confirmPassword || '';
  }

  validate() {
    const errors = [];

    // Full Name
    if (!this.name || this.name.length < 3) {
      errors.push('Full Name is required and must be at least 3 characters.');
    }

    // Phone Number
    if (!this.phone) {
      errors.push('Phone Number is required.');
    }

    // CNIC validation (Accepts formats like 42101-1234567-1 or 4210112345671)
    const cnicRegex = /^[0-9]{5}-?[0-9]{7}-?[0-9]{1}$/;
    if (!this.cnic) {
      errors.push('CNIC is required.');
    } else if (!cnicRegex.test(this.cnic)) {
      errors.push('Invalid CNIC format. Example: 42101-1234567-1');
    }

    // District
    if (!this.district) {
      errors.push('District is required.');
    }

    // SBC Number (Sindh Bar Council registration number)
    if (!this.sbcNumber) {
      errors.push('SBC (Sindh Bar Council) Registration Number is required.');
    }

    // Specialty
    if (!this.specialty) {
      errors.push('Legal Specialty is required (e.g. Property, Family Law).');
    }

    // Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email) {
      errors.push('Email Address is required.');
    } else if (!emailRegex.test(this.email)) {
      errors.push('Please enter a valid email address.');
    }

    // Password Complexity (Matches UI requirements: 8+ chars, 1 lowercase, 1 number, 1 special char)
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

module.exports = RegisterLawyerDTO;
