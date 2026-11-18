const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.resolve(__dirname, '../locales');
const EN_PATH = path.join(LOCALES_DIR, 'en.json');
const UR_PATH = path.join(LOCALES_DIR, 'ur.json');
const SD_PATH = path.join(LOCALES_DIR, 'sd.json');

// Translate via Google Translate's free API
async function translateText(text, targetLang) {
  if (!text || typeof text !== 'string') return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0].map((item) => item[0]).join('');
    }
  } catch (err) {
    console.warn(`[AutoTranslate] Fallback error for "${text}":`, err.message);
  }
  return text;
}

// Recursively traverse and translate missing keys
async function syncAndTranslate(enObj, targetObj, targetLang) {
  const result = { ...(targetObj || {}) };

  for (const key of Object.keys(enObj)) {
    const val = enObj[key];

    if (typeof val === 'object' && val !== null) {
      result[key] = await syncAndTranslate(val, result[key] || {}, targetLang);
    } else if (typeof val === 'string') {
      // If missing or untranslated, translate now
      if (!result[key] || result[key] === val) {
        process.stdout.write(`  Translating [${targetLang.toUpperCase()}]: "${val}"... `);
        const translated = await translateText(val, targetLang);
        result[key] = translated;
        console.log(`-> "${translated}"`);
        // Gentle rate-limiting delay
        await new Promise((r) => setTimeout(r, 60));
      }
    }
  }

  return result;
}

async function main() {
  console.log('====================================================');
  console.log(' ⚡ BARQ-E-INSAF 1-CLICK AI TRANSLATOR');
  console.log(' Languages: English -> Urdu (اردو) & Sindhi (سنڌي)');
  console.log('====================================================\n');

  if (!fs.existsSync(EN_PATH)) {
    console.error('Error: en.json not found at', EN_PATH);
    process.exit(1);
  }

  const enData = JSON.parse(fs.readFileSync(EN_PATH, 'utf8'));
  const urData = fs.existsSync(UR_PATH) ? JSON.parse(fs.readFileSync(UR_PATH, 'utf8')) : {};
  const sdData = fs.existsSync(SD_PATH) ? JSON.parse(fs.readFileSync(SD_PATH, 'utf8')) : {};

  console.log('▶ Checking & Translating Urdu (اردو)...');
  const updatedUr = await syncAndTranslate(enData, urData, 'ur');
  fs.writeFileSync(UR_PATH, JSON.stringify(updatedUr, null, 2), 'utf8');
  console.log('✓ Urdu (ur.json) successfully updated!\n');

  console.log('▶ Checking & Translating Sindhi (سنڌي)...');
  const updatedSd = await syncAndTranslate(enData, sdData, 'sd');
  fs.writeFileSync(SD_PATH, JSON.stringify(updatedSd, null, 2), 'utf8');
  console.log('✓ Sindhi (sd.json) successfully updated!\n');

  console.log('====================================================');
  console.log('🎉 ALL TRANSLATIONS GENERATED & SAVED SUCCESSFULLY!');
  console.log('Open your app and tap the floating Language button to test!');
  console.log('====================================================');
}

main().catch((err) => {
  console.error('Translation error:', err);
  process.exit(1);
});
