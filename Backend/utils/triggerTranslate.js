const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Triggers frontend auto-translation whenever a new record or account is created.
 * Runs 'npm run translate' in the Frontend directory to synchronize Urdu (ur.json)
 * and Sindhi (sd.json) with newly created records and accounts.
 *
 * @param {Object} [newRecord] - Optional record or account details to record in en.json
 */
function triggerTranslate(newRecord = null) {
  try {
    const frontendDir = path.resolve(__dirname, '../../Frontend');

    // If new record or account details provided, register them in en.json for translation
    if (newRecord && typeof newRecord === 'object') {
      const enPath = path.join(frontendDir, 'locales', 'en.json');
      if (fs.existsSync(enPath)) {
        try {
          const enContent = fs.readFileSync(enPath, 'utf8');
          const en = JSON.parse(enContent);
          if (!en.records) en.records = {};
          let changed = false;

          const candidateFields = [
            newRecord.name,
            newRecord.fullName,
            newRecord.title,
            newRecord.caseTitle,
            newRecord.organizationName,
            newRecord.district,
            newRecord.category,
            newRecord.grievanceStatement,
          ].filter(Boolean);

          for (const val of candidateFields) {
            if (typeof val === 'string' && val.trim().length > 1) {
              const clean = val.trim();
              if (!en.records[clean]) {
                en.records[clean] = clean;
                changed = true;
              }
            }
          }

          if (changed) {
            fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
          }
        } catch (readErr) {
          console.warn('[TRANSLATE-TRIGGER] Warning updating en.json:', readErr.message);
        }
      }
    }

    // Command: npm run translate inside Frontend directory
    const command = 'npm run translate';
    console.log(`[TRANSLATE-TRIGGER] Executing '${command}' in ${frontendDir}...`);

    exec(command, { cwd: frontendDir, timeout: 90000 }, (error, stdout, stderr) => {
      if (error) {
        console.warn(`[TRANSLATE-TRIGGER] Translation execution note: ${error.message}`);
      } else {
        console.log('[TRANSLATE-TRIGGER] Frontend translations synced successfully.');
      }
    });
  } catch (err) {
    console.warn('[TRANSLATE-TRIGGER] Error initiating translation:', err.message);
  }
}

module.exports = { triggerTranslate };
