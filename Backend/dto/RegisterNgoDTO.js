/**
 * Data Transfer Object (DTO) for NGO / Media Registration
 * Validates and sanitizes inputs from the NGO / Media Signup Screen
 */
class RegisterNgoDTO {
  constructor({
    fullName,
    name,
    full_name,
    organizationName,
    organization_name,
    resourcePerson,
    resource_person,
    contactPerson,
    contact_person,
    phone,
    cnic,
    district,
    email,
    password,
    confirmPassword,
    organizationType,
    organization_type,
    registrationNumber,
    registration_number,
  }) {
    this.fullName = (fullName || name || full_name || organizationName || organization_name || '').trim();
    this.resourcePerson = (resourcePerson || resource_person || contactPerson || contact_person || '').trim();
    this.phone = phone ? phone.trim() : '';
    this.cnic = cnic ? cnic.trim() : null;
    this.district = district ? district.trim() : '';
    this.email = email ? email.trim().toLowerCase() : '';
    this.password = password || '';
    this.confirmPassword = confirmPassword || '';
    this.organizationType = (organizationType || organization_type || 'Human Development / Legal Aid').trim();
    this.registrationNumber = (registrationNumber || registration_number || '').trim() || null;
  }

  validate() {
    const errors = [];

    // 1. Full / Organization Name
    if (!this.fullName || this.fullName.length < 3) {
      errors.push('Full Name or Organization Name is required and must be at least 3 characters long.');
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

    // 5. Password Complexity (Matches UI rules: 8+ chars, 1 lowercase, 1 number, 1 special char)
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

module.exports = RegisterNgoDTO;
