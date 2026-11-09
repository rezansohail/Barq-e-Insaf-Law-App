/**
 * Data Transfer Object (DTO) for Admin Registration
 * Validates and sanitizes inputs from the Admin Signup Screen
 * Enforces security key validation to prevent unauthorized users from registering as Admin
 */
class RegisterAdminDTO {
  constructor({
    fullName,
    name,
    full_name,
    phone,
    cnic,
    district,
    email,
    password,
    confirmPassword,
    adminSecretKey,
    admin_secret_key,
    isSuperAdmin,
  }) {
    this.fullName = (fullName || name || full_name || '').trim();
    this.phone = phone ? phone.trim() : '';
    this.cnic = cnic ? cnic.trim() : null;
    this.district = district ? district.trim() : '';
    this.email = email ? email.trim().toLowerCase() : '';
    this.password = password || '';
    this.confirmPassword = confirmPassword || '';
    this.adminSecretKey = (adminSecretKey || admin_secret_key || '').trim();
    this.isSuperAdmin = Boolean(isSuperAdmin);
  }

  validate() {
    const errors = [];

    // 1. Full Name
    if (!this.fullName || this.fullName.length < 3) {
      errors.push('Full Name is required and must be at least 3 characters long.');
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

    // 7. Admin Secret Key validation
    // Industry standard protection: Prevents normal users from creating admin accounts
    const expectedSecretKey = process.env.ADMIN_SECRET_KEY || 'barqeinsaf-admin-secret-2026';
    if (!this.adminSecretKey) {
      errors.push('Admin Secret Key is required to create an Admin account.');
    } else if (this.adminSecretKey !== expectedSecretKey) {
      errors.push('Unauthorized: Invalid Admin Secret Key.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = RegisterAdminDTO;
