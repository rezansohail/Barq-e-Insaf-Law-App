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
    cnic,
    address,
    dp,
    custom_sections,
    customSections,
    created_at,
    stats,
  }) {
    this.id = id;
    this.fullName = full_name || fullName || name || '';
    this.email = email || '';
    this.phone = phone || '';
    this.district = district || city || '';
    this.city = city || district || '';
    this.password = password;
    this.userId = user_id;
    this.cnic = cnic || '';
    this.address = address || '';
    this.dp = dp || this.getInitials();
    this.customSections = custom_sections || customSections || [];
    this.createdAt = created_at;
    this.stats = stats || null;
  }

  getInitials() {
    if (!this.fullName) return 'C';
    const parts = this.fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /**
   * Sanitizes citizen object for client responses (omits password hash)
   */
  toResponse() {
    const res = {
      id: this.id,
      fullName: this.fullName,
      name: this.fullName,
      email: this.email,
      phone: this.phone,
      district: this.district,
      city: this.city,
      cnic: this.cnic,
      address: this.address,
      dp: this.dp,
      customSections: typeof this.customSections === 'string' ? JSON.parse(this.customSections) : this.customSections,
      userId: this.userId,
      role: 'citizen',
      initials: this.getInitials(),
      createdAt: this.createdAt,
    };

    if (this.stats) {
      res.stats = this.stats;
    }

    return res;
  }
}

module.exports = Citizen;
