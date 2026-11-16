class CreateNgoStoryDTO {
  constructor(body = {}) {
    this.title = (body.title || '').trim();
    this.summary = (body.summary || '').trim();
    this.district = (body.district || 'Karachi').trim();
    this.category = (body.category || 'Legal Aid & Human Rights').trim();
    this.officerName = (body.officerName || body.officer_name || 'NCHD Human Development Officer').trim();
    this.programName = (body.programName || body.program_name || 'NCHD Pro-Bono Legal Empowerment').trim();
    this.isFeatured = Boolean(body.isFeatured || body.is_featured);
  }

  validate() {
    const errors = [];
    if (!this.title) {
      errors.push('Story title/headline is required.');
    }
    if (!this.summary) {
      errors.push('Story summary/impact details are required.');
    }
    if (!this.district) {
      errors.push('Sindh district is required.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = CreateNgoStoryDTO;
