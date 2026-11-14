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
    city,
    sbc_number,
    specialty,
    password,
    is_verified,
    verification_status,
    rating,
    total_ratings,
    experience_years,
    bio,
    education,
    past_experience,
    office_address,
    is_available,
    office_hours,
    created_at,
    stats,
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.cnic = cnic;
    this.district = district;
    this.city = city || district;
    this.sbc_number = sbc_number;
    this.specialty = specialty;
    this.password = password;
    this.is_verified = is_verified !== undefined ? is_verified : false;
    this.verification_status = verification_status || 'pending';
    this.rating = rating !== undefined ? Number(rating) : 5.0;
    this.total_ratings = total_ratings !== undefined ? Number(total_ratings) : 0;
    this.experience_years = experience_years !== undefined ? Number(experience_years) : 0;
    this.bio = bio || '';
    this.education = education || '';
    this.past_experience = past_experience || '';
    this.office_address = office_address || '';
    this.is_available = is_available !== undefined ? is_available : true;
    this.office_hours = office_hours || [];
    this.created_at = created_at;
    this.stats = stats || null;
  }

  /**
   * Generates initials from name (e.g., 'Adv. Tariq Hassan' -> 'TH')
   */
  getInitials() {
    if (!this.name) return 'L';
    const cleanName = this.name.replace(/^(Adv\.?|Advocate|Barrister|Mr\.?|Ms\.?)\s+/i, '').trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /**
   * Sanitizes lawyer object for public/client responses (omits password hash)
   */
  toResponse() {
    const res = {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      cnic: this.cnic,
      district: this.district,
      city: this.city,
      sbcNumber: this.sbc_number,
      specialty: this.specialty,
      isVerified: this.is_verified,
      verificationStatus: this.verification_status,
      rating: this.rating,
      totalRatings: this.total_ratings,
      experienceYears: this.experience_years,
      bio: this.bio,
      education: this.education,
      pastExperience: this.past_experience,
      officeAddress: this.office_address,
      isAvailable: this.is_available,
      officeHours: this.office_hours,
      initials: this.getInitials(),
      createdAt: this.created_at,
    };

    if (this.stats) {
      res.stats = this.stats;
    }

    return res;
  }
}

module.exports = Lawyer;
