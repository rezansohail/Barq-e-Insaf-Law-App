/**
 * Domain Model representing a Citizen Entity
 */
class Citizen {
  constructor({
    id,
    full_name,
    fullName,
    name,
    email,
    phone,
    district,
    city,
    password,
    user_id,
    created_at,
  }) {
    this.id = id;
    this.fullName = full_name || fullName || name;
    this.email = email;
    this.phone = phone;
    this.district = district || city;
    this.city = city || district;
    this.password = password;
    this.userId = user_id;
    this.createdAt = created_at;
  }

  /**
   * Sanitizes citizen object for client responses (omits password hash)
   */
  toResponse() {
    return {
      id: this.id,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      district: this.district,
      city: this.city,
      userId: this.userId,
      role: 'citizen',
      createdAt: this.createdAt,
    };
  }
}

module.exports = Citizen;
