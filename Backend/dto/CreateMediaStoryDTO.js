class CreateMediaStoryDTO {
  constructor(body = {}) {
    this.title = (body.title || '').trim();
    this.summary = (body.summary || '').trim();
    this.district = (body.district || 'Karachi Central').trim();
    this.category = (body.category || 'Property & Land').trim();
    this.journalistName = (body.journalistName || body.journalist_name || 'KTN News Judicial Bureau').trim();
    this.broadcastUrl = (body.broadcastUrl || body.broadcast_url || '').trim();
    this.isBreaking = Boolean(body.isBreaking || body.is_breaking);
  }

  validate() {
    const errors = [];
    if (!this.title) {
      errors.push('Story headline/title is required.');
    }
    if (!this.summary) {
      errors.push('Story summary/synopsis is required.');
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

module.exports = CreateMediaStoryDTO;
