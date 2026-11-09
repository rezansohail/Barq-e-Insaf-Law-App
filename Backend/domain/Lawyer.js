/**
 * Domain Model representing a Lawyer Entity
 */
class Lawyer {
  constructor({
    id,
    name,
    email,
    phone,
    cnic,
    district,
    sbc_number,
    specialty,
    password,
    is_verified,
    verification_status,
    rating,
    total_ratings,
    experience_years,
    created_at,
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.cnic = cnic;
    this.district = district;
    this.sbc_number = sbc_number;
    this.specialty = specialty;
    this.password = password;
    this.is_verified = is_verified !== undefined ? is_verified : false;
    this.verification_status = verification_status || 'pending';
    this.rating = rating !== undefined ? Number(rating) : 5.0;
    this.total_ratings = total_ratings !== undefined ? Number(total_ratings) : 0;
    this.experience_years = experience_years !== undefined ? Number(experience_years) : 0;
    this.created_at = created_at;
  }

  /**
   * Sanitizes lawyer object for public/client responses (omits password hash)
   */
  toResponse() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      cnic: this.cnic,
      district: this.district,
      sbcNumber: this.sbc_number,
      specialty: this.specialty,
      isVerified: this.is_verified,
      verificationStatus: this.verification_status,
      rating: this.rating,
      totalRatings: this.total_ratings,
      createdAt: this.created_at,
    };
  }
}

module.exports = Lawyer;
