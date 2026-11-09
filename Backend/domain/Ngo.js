/**
 * Domain Model representing an NGO / Media Entity
 */
class Ngo {
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
    organization_type,
    organizationType,
    registration_number,
    registrationNumber,
    is_verified,
    isVerified,
    verification_status,
    verificationStatus,
    status,
    role,
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
    this.organizationType = organization_type || organizationType || 'NGO / Media';
    this.registrationNumber = registration_number || registrationNumber;
    this.isVerified = is_verified !== undefined ? is_verified : Boolean(isVerified);
    this.verificationStatus = verification_status || verificationStatus || 'pending';
    this.status = status || 'Active';
    this.role = role || 'ngo';
    this.userId = user_id || userId;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }

  /**
   * Sanitizes NGO / Media object for client responses (omits password hash)
   */
  toResponse() {
    return {
      id: this.id,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      district: this.district,
      cnic: this.cnic,
      organizationType: this.organizationType,
      registrationNumber: this.registrationNumber,
      isVerified: this.isVerified,
      verificationStatus: this.verificationStatus,
      status: this.status,
      role: this.role,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Ngo;
