/**
 * Data Transfer Object (DTO) for Media Partner Registration
 * Validates and sanitizes inputs for Media partner accounts
 */
class RegisterMediaDTO {
  constructor({
    fullName,
    name,
    full_name,
    channelName,
    channel_name,
    resourcePerson,
    resource_person,
    phone,
    cnic,
    district,
    email,
    password,
    confirmPassword,
    mediaType,
    media_type,
    registrationNumber,
    registration_number,
  }) {
    this.fullName = (fullName || name || full_name || channelName || channel_name || '').trim();
    this.channelName = (channelName || channel_name || this.fullName).trim();
    this.resourcePerson = (resourcePerson || resource_person || '').trim();
    this.phone = phone ? phone.trim() : '';
    this.cnic = cnic ? cnic.trim() : null;
    this.district = district ? district.trim() : 'Sindh';
    this.email = email ? email.trim().toLowerCase() : '';
    this.password = password || '';
    this.confirmPassword = confirmPassword || '';
    this.mediaType = (mediaType || media_type || 'News Channel').trim();
    this.registrationNumber = (registrationNumber || registration_number || '').trim() || null;
  }

  validate() {
    const errors = [];

    // 1. Full Name / Channel Name
    if (!this.fullName || this.fullName.length < 2) {
      errors.push('Media Name / Channel Name is required.');
    }

    // 2. Phone Number
    if (!this.phone) {
      errors.push('Phone Number is required.');
    }

    // 3. District
    if (!this.district) {
      errors.push('District is required.');
    }

    // 4. Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email) {
      errors.push('Email Address is required.');
    } else if (!emailRegex.test(this.email)) {
      errors.push('Please enter a valid email address.');
    }

    // 5. Password Complexity
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

    // 6. Confirm password match if provided
    if (this.confirmPassword && this.password !== this.confirmPassword) {
      errors.push('Passwords do not match.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = RegisterMediaDTO;
