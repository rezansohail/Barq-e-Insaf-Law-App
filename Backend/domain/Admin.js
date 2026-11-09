/**
 * Domain Model representing an Admin Entity
 */
class Admin {
  constructor({
    id,
    full_name,
    fullName,
    name,
    email,
    phone,
    district,
    cnic,
    password,
    role,
    is_super_admin,
    isSuperAdmin,
    user_id,
    userId,
    created_at,
    updated_at,
  }) {
    this.id = id;
    this.fullName = full_name || fullName || name;
    this.email = email;
    this.phone = phone;
    this.district = district;
    this.cnic = cnic;
    this.password = password;
    this.role = role || 'admin';
    this.isSuperAdmin = is_super_admin !== undefined ? is_super_admin : Boolean(isSuperAdmin);
    this.userId = user_id || userId;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }

  /**
   * Sanitizes admin object for client responses (omits password hash)
   */
  toResponse() {
    return {
      id: this.id,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      district: this.district,
      cnic: this.cnic,
      role: this.role,
      isSuperAdmin: this.isSuperAdmin,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Admin;
