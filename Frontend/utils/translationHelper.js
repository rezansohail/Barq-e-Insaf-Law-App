import React from 'react';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getCachedTranslation, autoTranslatePhrase } from '../services/autoTranslateService';

// Sindh Districts Mapping (English -> Urdu & Sindhi)
export const SINDH_DISTRICTS_TRANSLATIONS = {
  'Karachi': { ur: 'کراچی', sd: 'ڪراچي' },
  'Karachi Central': { ur: 'کراچی سینٹرل', sd: 'ڪراچي سينٽرل' },
  'Karachi East': { ur: 'کراچی ایسٹ', sd: 'ڪراچي ايسٽ' },
  'Karachi South': { ur: 'کراچی ساؤتھ', sd: 'ڪراچي سائوٿ' },
  'Karachi West': { ur: 'کراچی ویسٹ', sd: 'ڪراچي ويسٽ' },
  'Malir': { ur: 'ملیر', sd: 'ملير' },
  'Korangi': { ur: 'کورنگی', sd: 'ڪورنگي' },
  'Hyderabad': { ur: 'حیدرآباد', sd: 'حيدرآباد' },
  'Sukkur': { ur: 'سکھر', sd: 'سکر' },
  'Larkana': { ur: 'لاڑکانہ', sd: 'لاڙڪاڻو' },
  'Mirpur Khas': { ur: 'میرپور خاص', sd: 'ميرپور خاص' },
  'Nawabshah': { ur: 'نوابشاہ', sd: 'نوابشاهه' },
  'Shaheed Benazirabad': { ur: 'شہید بینظیر آباد', sd: 'شهيد بينظير آباد' },
  'Badin': { ur: 'بدین', sd: 'بدين' },
  'Thatta': { ur: 'ٹھٹھہ', sd: 'ٺٽو' },
  'Sujawal': { ur: 'سجاول', sd: 'سجاول' },
  'Tharparkar': { ur: 'تھرپارکر', sd: 'ٿرپارڪر' },
  'Umerkot': { ur: 'عمرکوٹ', sd: 'عمرڪوٽ' },
  'Jacobabad': { ur: 'جیکب آباد', sd: 'جئڪب آباد' },
  'Kashmore': { ur: 'کشمور', sd: 'ڪشمور' },
  'Shikarpur': { ur: 'شکارپور', sd: 'شڪارپور' },
  'Ghotki': { ur: 'گھوٹکی', sd: 'گهوٽڪي' },
  'Khairpur': { ur: 'خیرپور', sd: 'خيرپور' },
  'Dadu': { ur: 'دادو', sd: 'دادو' },
  'Jamshoro': { ur: 'جامشورو', sd: 'ڄامشورو' },
  'Sanghar': { ur: 'سانگھڑ', sd: 'سانگهڙ' },
  'Matiari': { ur: 'مٹیاری', sd: 'مٽياري' },
  'Tando Allahyar': { ur: 'ٹنڈو الہ یار', sd: 'ٽنڊو الهيار' },
  'Tando Muhammad Khan': { ur: 'ٹنڈو محمد خان', sd: 'ٽنڊو محمد خان' },
  'Naushahro Feroze': { ur: 'نوشہرو فیروز', sd: 'نوشهرو فيروز' },
  'Qambar Shahdadkot': { ur: 'قمبر شہدادکوٹ', sd: 'قنبر شهدادڪوٽ' },
};

// Legal Categories Mapping
export const LEGAL_CATEGORIES_TRANSLATIONS = {
  'Property & Land Rights': { ur: 'جائیداد اور اراضی کے حقوق', sd: 'ملڪيت ۽ زميني حق' },
  'Property & Land Dispute': { ur: 'جائیداد اور اراضی کا تنازعہ', sd: 'ملڪيت ۽ زميني تڪرار' },
  'Family & Custody': { ur: 'خاندانی اور تحویل کے تنازعات', sd: 'خانداني ۽ سرپرستي جا تڪرار' },
  'Criminal PPC Defense': { ur: 'فوجداری مقدمات و دفاع', sd: 'فوجداري ڪيس ۽ دفاع' },
  'Civil & Contract': { ur: 'دیوانی و معاہداتی تنازعات', sd: 'ديواني ۽ معاهدي جا تڪرار' },
  'Corporate & Civil Law': { ur: 'کارپوریٹ و دیوانی قانون', sd: 'ڪارپوريٽ ۽ ديواني قانون' },
};

// Courts Mapping
export const COURTS_TRANSLATIONS = {
  'District & Sessions Court': { ur: 'ڈسٹرکٹ اینڈ سیشن کورٹ', sd: 'ضلعي ۽ سيشن ڪورٽ' },
  'Sindh High Court': { ur: 'سندھ ہائی کورٹ', sd: 'سنڌ هاءِ ڪورٽ' },
  'Family Court': { ur: 'فیملی کورٹ', sd: 'فيملي ڪورٽ' },
  'Anti-Encroachment Tribunal': { ur: 'اینٹی انکروچمنٹ ٹریبونل', sd: 'اينٽي انڪروچمينٽ ٽربيونل' },
  'Sindh Court': { ur: 'سندھ عدلیہ', sd: 'سنڌ عدالت' },
};

// Comprehensive Global Phrases Dictionary (Direct English -> Urdu / Sindhi)
export const GLOBAL_PHRASES = {
  // Splash & Common Branding
  'Barq e Insaf': { ur: 'برقِ انصاف', sd: 'برق انصاف' },
  'Barq-e-Insaf': { ur: 'برقِ انصاف', sd: 'برق انصاف' },
  'BARQ-E-INSAF': { ur: 'برقِ انصاف', sd: 'برق انصاف' },
  'Smart Decisions for Legal Matters': { ur: 'قانونی معاملات کے لیے دانشمندانہ فیصلے', sd: 'قانوني معاملن لاءِ دانشمند فيصلا' },
  'hi,': { ur: 'سلام،', sd: 'سلام،' },
  'Hi,': { ur: 'سلام،', sd: 'سلام،' },
  'View All': { ur: 'تمام دیکھیں', sd: 'سمورا ڏسو' },
  'See All': { ur: 'سب دیکھیں', sd: 'سمورا ڏسو' },
  'All Cases': { ur: 'تمام مقدمات', sd: 'سمورا ڪيس' },
  'Urgent': { ur: 'فوری', sd: 'فوري' },
  'URGENT': { ur: 'فوری', sd: 'فوري' },
  'Featured': { ur: 'نمایاں', sd: 'خاص' },
  'FEATURED': { ur: 'نمایاں', sd: 'خاص' },
  'Breaking': { ur: 'بریکنگ', sd: 'تازو بريڪنگ' },
  'BREAKING': { ur: 'بریکنگ', sd: 'تازو بريڪنگ' },
  'Published': { ur: 'شائع شدہ', sd: 'شايع ٿيل' },
  'New': { ur: 'نیا', sd: 'نئون' },
  'Completed': { ur: 'مکمل شدہ', sd: 'مڪمل ٿيل' },
  'Active': { ur: 'فعال', sd: 'هلندڙ' },
  'Pending': { ur: 'زیرِ التواء', sd: 'التوا ۾' },
  'Resolved': { ur: 'حل شدہ', sd: 'حل ٿيل' },
  'Cancel': { ur: 'منسوخ کریں', sd: 'رد ڪريو' },
  'Submit': { ur: 'جمع کرائیں', sd: 'جمع ڪرايو' },
  'Loading...': { ur: 'لوڈ ہو رہا ہے...', sd: 'لوڊ ٿي رهيو آهي...' },
  'Leads': { ur: 'درخواستیں', sd: 'درخواستون' },
  'Requests': { ur: 'درخواستیں', sd: 'درخواستون' },

  // Citizen Portal
  'CITIZEN PORTAL': { ur: 'شہری پورٹل', sd: 'شهري پورٽل' },
  'Citizen Portal': { ur: 'شہری پورٹل', sd: 'شهري پورٽل' },
  'BUILD YOUR CASE': { ur: 'اپنا کیس بنائیں', sd: 'پنهنجو ڪيس ٺاهيو' },
  'Start legal intake with facts, sections & evidence': {
    ur: 'حقائق، دفعات اور شواہد کے ساتھ قانونی کارروائی شروع کریں',
    sd: 'حقيقتن، شقن ۽ ثبوتن سان قانوني ڪاروائي شروع ڪريو',
  },
  'Verified Advocates': { ur: 'مصدقہ وکلاء', sd: 'تصديق ٿيل وڪيل' },
  'Request Legal Consultation →': { ur: 'قانونی مشاورت کی درخواست ←', sd: 'قانوني صلاح لاءِ درخواست ←' },
  'My Active Cases': { ur: 'میرے فعال مقدمات', sd: 'منهنجا هلندڙ ڪيس' },
  'No Active Cases Yet': { ur: 'ابھی تک کوئی فعال مقدمہ نہیں', sd: 'في الحال ڪو به هلندڙ ڪيس ناهي' },
  "Tap here or 'Build Your Case' above to start your first legal dossier.": {
    ur: "پہلا قانونی کیس شروع کرنے کے لیے یہاں یا 'اپنا کیس بنائیں' پر ٹیپ کریں۔",
    sd: "پنهنجو پهريون قانوني ڪيس شروع ڪرڻ لاءِ هتي ٽيپ ڪريو.",
  },
  'Institutional Legal Aid & Media Support': {
    ur: 'ادارہ جاتی قانونی امداد اور میڈیا معاونت',
    sd: 'ادارتي قانوني مدد ۽ ميڊيا سهڪار',
  },
  'GOVT / NGO LEGAL AID': { ur: 'سرکاری / این جی او قانونی امداد', sd: 'سرڪاري / اين جي او قانوني مدد' },
  'Legal Counsel': { ur: 'قانونی وکیل', sd: 'قانوني صلاحڪار' },
  'SBC VERIFIED': { ur: 'بار کونسل تصدیق شدہ', sd: 'بار ڪائونسل تصديق ٿيل' },
  'SBC Verified': { ur: 'بار کونسل تصدیق شدہ', sd: 'بار ڪائونسل تصديق ٿيل' },
  'Active Legal Representation & Dossier Vault': { ur: 'فعال قانونی وکالت اور ثبوت والٹ', sd: 'فعال قانوني وڪالت ۽ ثبوت والٽ' },
  'National Commission for Human Development (NCHD)': {
    ur: 'قومی کمیشن برائے انسانی ترقی (NCHD)',
    sd: 'نيشنل ڪميشن فار هيومن ڊولپمينٽ (NCHD)',
  },
  'Grassroots legal aid, adult literacy & community relief': {
    ur: 'نچلی سطح پر قانونی امداد، خواندگی اور کمیونٹی ریلیف',
    sd: 'هيٺين سطح تي قانوني مدد، تعليم ۽ عوامي رليف',
  },
  '24/7 BROADCAST JOURNALISM': { ur: '24/7 نشریاتی صحافت', sd: '24/7 نشرياتي صحافت' },
  'KTN News (Kawish Television Network)': {
    ur: 'کے ٹی این نیوز (کاوش ٹیلی ویژن نیٹ ورک)',
    sd: 'ڪي ٽي اين نيوز (ڪاوش ٽيليويزن نيٽ ورڪ)',
  },
  'Court reporting, investigative journalism & public grievance desk': {
    ur: 'عدالتی رپورٹنگ، تحقیقاتی صحافت اور عوامی شکایات ڈیسک',
    sd: 'عدالتي رپورٽنگ، تحقيقاتي صحافت ۽ عوامي شڪايت ڊيسڪ',
  },

  // Lawyer Portal
  'SINDH BAR COUNCIL ADVOCATE': { ur: 'سندھ بار کونسل ایڈووکیٹ', sd: 'سنڌ بار ڪائونسل ايڊووڪيٽ' },
  'Licence:': { ur: 'لائسنس:', sd: 'لائسنس:' },
  'Pending Verification': { ur: 'تصدیق زیرِ التواء', sd: 'تصديق التوا ۾' },
  '✓ SBC Verified': { ur: '✓ تصدیق شدہ بار کونسل', sd: '✓ تصديق ٿيل بار ڪائونسل' },
  'Active Cases': { ur: 'فعال مقدمات', sd: 'هلندڙ ڪيس' },
  'New Requests': { ur: 'نئی درخواستیں', sd: 'نئيون درخواستون' },
  'New Client Requests': { ur: 'نئی موکل درخواستیں', sd: 'نئيون موڪل درخواستون' },
  'Chamber Quick Actions': { ur: 'چیمبر کے فوری اقدامات', sd: 'چيمبر جا تڪڙا قدم' },
  'Case Requests': { ur: 'کیس کی درخواستیں', sd: 'ڪيس جون درخواستون' },
  'My Schedule': { ur: 'میرا شیڈول', sd: 'منهنجو شيڊول' },
  'My Cases': { ur: 'میرے مقدمات', sd: 'منهنجا ڪيس' },
  'Other Lawyers': { ur: 'دیگر وکلاء', sd: 'ٻيا وڪيل' },
  'No pending case requests at this time.': {
    ur: 'اس وقت موکلین کی کوئی نئی درخواست نہیں ہے۔',
    sd: 'هن وقت موڪلن جي ڪا به نئين درخواست ناهي.',
  },
  'Institutional Partners: Legal Aid & Media': {
    ur: 'ادارہ جاتی شراکت دار: قانونی امداد و میڈیا',
    sd: 'ادارتي ڀائيوار: قانوني مدد ۽ ميڊيا',
  },
  'COMMUNITY LEGAL AID & EDUCATION': {
    ur: 'عوامی قانونی امداد اور شعور',
    sd: 'عوامي قانوني مدد ۽ آگاهي',
  },
  'View Info, Mission & Contact Email': {
    ur: 'معلومات، مشن اور رابطہ ای میل دیکھیں',
    sd: 'معلومات، مشن ۽ رابطو اي ميل ڏسو',
  },

  'Admin Control Panel': { ur: 'ایڈمن کنٹرول پینل', sd: 'ايڊمن ڪنٽرول پينل' },
  'Sindh Bar Council Governance': { ur: 'سندھ بار کونسل حکمرانی', sd: 'سنڌ بار ڪائونسل انتظاميه' },
  'App Ecosystem Overview': { ur: 'ایپ ایکو سسٹم جائزہ', sd: 'ايپ ماحوليات جو جائزو' },
  'Administrative Governance': { ur: 'انتظامی حکمرانی', sd: 'انتظامي حڪمراني' },
  'System & Security Audit Log': { ur: 'سسٹم اور سیکیورٹی آڈٹ لاگ', sd: 'سسٽم ۽ سيڪيورٽي آڊٽ لاگ' },
  'Lawyer Management': { ur: 'وکلاء کا انتظام', sd: 'وڪيلن جو انتظام' },
  'Citizen Management': { ur: 'شہریوں کا انتظام', sd: 'شهرين جو انتظام' },
  'NGO & Media Registry': { ur: 'این جی او اور میڈیا رجسٹری', sd: 'اين جي او ۽ ميڊيا رجسٽري' },
  'Cloud DB Status': { ur: 'کلاؤڈ ڈیٹا بیس حیثیت', sd: 'ڪلائوڊ ڊيٽابيس حيثيت' },
  'Verify SBC licenses': { ur: 'سندھ بار لائسنس کی تصدیق کریں', sd: 'سنڌ بار لائسنس جي تصديق ڪريو' },
  'Manage vaults & cases': { ur: 'والٹس اور مقدمات کا انتظام', sd: 'والٽس ۽ ڪيسن جو انتظام' },
  'NCHD & KTN News': { ur: 'این سی ایچ ڈی اور کے ٹی این نیوز', sd: 'اين سي ايڇ ڊي ۽ ڪي ٽي اين نيوز' },
  'Postgres & API status': { ur: 'پوسٹگری اور اے پی آئی حیثیت', sd: 'پوسٽگري ۽ اي پي آءِ حيثيت' },
  'ADMIN GOVERNANCE CONSOLE': { ur: 'ایڈمن کنٹرول و حکمرانی', sd: 'ايڊمن ڪنٽرول ۽ انتظام' },
  'Sindh Bar Council · High Court Supervisory & Verification Engine': {
    ur: 'سندھ بار کونسل · ہائی کورٹ نگرانی و تصدیقی نظام',
    sd: 'سنڌ بار ڪائونسل · هاءِ ڪورٽ نگراني ۽ تصديقي نظام',
  },
  'SYSTEM OVERVIEW & AUDIT': { ur: 'نظام کا جائزہ اور آڈٹ', sd: 'نظام جو جائزو ۽ آڊٽ' },
  'Registered Lawyers': { ur: 'رجسٹرڈ وکلاء', sd: 'رجسٽرڊ وڪيل' },
  'Registered Citizens': { ur: 'رجسٹرڈ شہری', sd: 'رجسٽرڊ شهري' },
  'Accredited NGOs/Media': { ur: 'منظور شدہ این جی او / میڈیا', sd: 'منظور ٿيل اين جي او / ميڊيا' },
  'Active Vault Cases': { ur: 'فعال والٹ مقدمات', sd: 'هلندڙ والٽ ڪيس' },
  'Disposed Legal Cases': { ur: 'حل شدہ مقدمات', sd: 'حل ٿيل ڪيس' },
  'Verify Lawyers': { ur: 'وکلاء کی تصدیق', sd: 'وڪيلن جي تصديق' },
  'Manage Citizens': { ur: 'شہریوں کا انتظام', sd: 'شهرين جو انتظام' },
  'NGO Partnerships': { ur: 'این جی او شراکت داری', sd: 'اين جي او ڀائيواري' },
  'System Diagnostics': { ur: 'سسٹم کی جانچ', sd: 'سسٽم جي چڪاس' },
  'INFRASTRUCTURE HEALTH': { ur: 'انفراسٹرکچر کی حیثیت', sd: 'انفراسٽرڪچر جي حيثيت' },
  'Sindh Bar Council Registry Audit': { ur: 'سندھ بار کونسل رجسٹری آڈٹ', sd: 'سنڌ بار ڪائونسل رجسٽري آڊٽ' },
  'Neon PostgreSQL Cloud Database': { ur: 'نیون پوسٹگری کلاؤڈ ڈیٹا بیس', sd: 'نيون پوسٽگري ڪلائوڊ ڊيٽابيس' },
  'Evidence Vault Integrity Check': { ur: 'شواہد والٹ کی سیکیورٹی جانچ', sd: 'ثبوت والٽ جي سيڪيورٽي چڪاس' },

  // Auth / Role Titles
  'Legal Empowerment for Citizens': { ur: 'شہریوں کے لیے قانونی بااختیاری', sd: 'شهرين لاءِ قانوني بااختياري' },
  'Advocate Legal Practice': { ur: 'وکلاء کی قانونی پریکٹس', sd: 'وڪيلن جي قانوني پريڪٽس' },
  'NGO - National commission for human development (NCHD)': {
    ur: 'این جی او - قومی کمیشن برائے انسانی ترقی (NCHD)',
    sd: 'اين جي او - نيشنل ڪميشن فار هيومن ڊولپمينٽ (NCHD)',
  },
  'Institutional Human Development Portal': {
    ur: 'ادارہ جاتی انسانی ترقیاتی پورٹل',
    sd: 'ادارتي انساني ترقياتي پورٽل',
  },
  'Media - KTN news': { ur: 'میڈیا - کے ٹی این نیوز', sd: 'ميڊيا - ڪي ٽي اين نيوز' },
  'Court Reporting & Broadcast Journalism': {
    ur: 'عدالتی رپورٹنگ اور نشریاتی صحافت',
    sd: 'عدالتي رپورٽنگ ۽ نشرياتي صحافت',
  },
  'Admin Panel': { ur: 'ایڈمن پینل', sd: 'ايڊمن پينل' },

  // NGO & Media Portal
  'Citizen Legal Aid Requests (Urgent)': {
    ur: 'شہریوں کی قانونی امداد کی درخواستیں (فوری)',
    sd: 'شهرين جي قانوني مدد جون درخواستون (فوري)',
  },
  'CITIZEN LEGAL AID REQUESTS (URGENT)': {
    ur: 'شہریوں کی قانونی امداد کی درخواستیں (فوری)',
    sd: 'شهرين جي قانوني مدد جون درخواستون (فوري)',
  },
  'Citizen Legal Aid Requests': {
    ur: 'شہریوں کی قانونی امداد کی درخواستیں',
    sd: 'شهرين جي قانوني مدد جون درخواستون',
  },
  'Citizen Coverage Leads (Urgent)': {
    ur: 'شہری کوریج کی درخواستیں (فوری)',
    sd: 'شهرين جون ڪوريج درخواستون (فوري)',
  },
  'CITIZEN COVERAGE LEADS (URGENT)': {
    ur: 'شہری کوریج کی درخواستیں (فوری)',
    sd: 'شهرين جون ڪوريج درخواستون (فوري)',
  },
  'Citizen Coverage Leads': {
    ur: 'شہری کوریج کی درخواستیں',
    sd: 'شهرين جون ڪوريج درخواستون',
  },
  'Encrypted Relay Active': { ur: 'محفوظ خفیہ رابطہ فعال', sd: 'محفوظ خفيه رابطو فعال' },
  'Anonymous Relay Available': { ur: 'محفوظ گمنام رابطہ دستیاب', sd: 'محفوظ اڻڄاتل رابطو موجود' },
  'IMPACT VERIFIED': { ur: 'اثرات کی تصدیق شدہ', sd: 'اثرن جي تصديق ٿيل' },
  'BROADCAST VERIFIED': { ur: 'مصدقہ نشریات', sd: 'تصديق ٿيل نشريات' },
  'Broadcast Verified': { ur: 'مصدقہ نشریات', sd: 'تصديق ٿيل نشريات' },
  'Field Stories & Impact Reports': { ur: 'فیلڈ رپورٹس اور انسانی حقوق اثرات', sd: 'فيلڊ ڪهاڻيون ۽ انساني حقن وارا اثر' },
  'FIELD STORIES & IMPACT REPORTS': { ur: 'فیلڈ رپورٹس اور انسانی حقوق اثرات', sd: 'فيلڊ ڪهاڻيون اور انساني حقن وارا اثر' },
  'Recent Verified Broadcasts': { ur: 'حالیہ مصدقہ نشریات', sd: 'تازو نشر ٿيل تصديقي خبرون' },
  'RECENT VERIFIED BROADCASTS': { ur: 'حالیہ مصدقہ نشریات', sd: 'تازو نشر ٿيل تصديقي خبرون' },
  'Inspect Details 🔍': { ur: 'تفصیلات دیکھیں 🔍', sd: 'تفصيل ڏسو 🔍' },
  'Inspect Details': { ur: 'تفصیلات دیکھیں', sd: 'تفصيل ڏسو' },
  'Read Official Story 📖': { ur: 'سرکاری خبر پڑھیں 📖', sd: 'سرڪاري خبر پڙهو 📖' },
  'Read Impact Story 📖': { ur: 'مکمل رپورٹ پڑھیں 📖', sd: 'مڪمل رپورٽ پڙهو 📖' },
  'Offer Legal Aid': { ur: 'قانونی امداد پیش کریں', sd: 'قانوني مدد پيش ڪريو' },
  '✓ Aid Granted': { ur: '✓ امداد منظور شدہ', sd: '✓ مدد منظور ٿيل' },
  'Investigate Case': { ur: 'کیس کی جانچ کریں', sd: 'ڪيس جي جاچ ڪريو' },
  'Under Investigation': { ur: 'زیرِ تحقیقات', sd: 'جاچ هيٺ' },
  '✓ Under Investigation': { ur: '✓ زیرِ تحقیقات', sd: '✓ جاچ هيٺ' },
  '+ Publish Story': { ur: '+ فیلڈ رپورٹ شائع کریں', sd: '+ فيلڊ رپورٽ شايع ڪريو' },

  // Top Header Menu
  'Profile': { ur: 'پروفائل', sd: 'پروفائل' },
  'Light Mode': { ur: 'لائٹ موڈ', sd: 'لائيٽ موڊ' },
  'Dark Mode': { ur: 'ڈارک موڈ', sd: 'ڊارڪ موڊ' },
  'Language / Translation': { ur: 'زبان / ترجمہ', sd: 'ٻولي / ترجما' },
  'Sign Out': { ur: 'لاگ آؤٹ', sd: 'لاگ آئوٽ' },
  'Barq-e-Insaf Active': { ur: 'برقِ انصاف فعال', sd: 'برق انصاف فعال' },
  'MEDIA PORTAL': { ur: 'میڈیا پورٹل', sd: 'ميڊيا پورٽل' },
  'CITIZEN PORTAL': { ur: 'شہری پورٹل', sd: 'شهري پورٽل' },
  'LAWYER PORTAL': { ur: 'وکیل پورٹل', sd: 'وڪيل پورٽل' },
  'NGO PORTAL': { ur: 'این جی او پورٹل', sd: 'اين جي او پورٽل' },
  'ADMIN PORTAL': { ur: 'ایڈمن پورٹل', sd: 'ايڊمن پورٽل' },

  // Common Case Titles
  'Gulshan Plot Encroachment Dispute (Updated Title)': {
    ur: 'گلشن پلاٹ پر غیر قانونی قبضہ کا تنازعہ (اپ ڈیٹ شدہ)',
    sd: 'گلشن پلاٽ تي غير قانوني قبضي جو تڪرار (اپڊيٽ ٿيل)',
  },
  'Gulshan Plot Encroachment Dispute': {
    ur: 'گلشن پلاٹ پر غیر قانونی قبضہ کا تنازعہ',
    sd: 'گلشن پلاٽ تي غير قانوني قبضي جو تڪرار',
  },
  'Investigation: Land Grabbing Nexus in Scheme 33 Exposed': {
    ur: 'تحقیقات: اسکیم 33 میں اراضی قبضہ مافیا بے نقاب',
    sd: 'جاچ: اسڪيم 33 ۾ قبضا مافيا بي نقاب',
  },
};

// App Name by Language
export function getTranslatedAppName(lang = 'en') {
  if (lang === 'ur') return 'برقِ انصاف';
  if (lang === 'sd') return 'برق انصاف';
  return 'Barq-e-Insaf';
}

// Translate District
export function translateDistrict(districtName, lang = 'en') {
  if (!districtName || lang === 'en') return districtName;
  const match = SINDH_DISTRICTS_TRANSLATIONS[districtName];
  if (match && match[lang]) return match[lang];

  // If district contains percentage e.g. "Karachi (66.7%)"
  for (const [key, trans] of Object.entries(SINDH_DISTRICTS_TRANSLATIONS)) {
    if (districtName.startsWith(key)) {
      return districtName.replace(key, trans[lang] || key);
    }
  }
  return districtName;
}

// Translate Legal Category
export function translateCategory(category, lang = 'en') {
  if (!category || lang === 'en') return category;
  const match = LEGAL_CATEGORIES_TRANSLATIONS[category];
  if (match && match[lang]) return match[lang];
  return category;
}

// Translate Court Name
export function translateCourt(court, lang = 'en') {
  if (!court || lang === 'en') return court;
  const match = COURTS_TRANSLATIONS[court];
  if (match && match[lang]) return match[lang];
  return court;
}

/**
 * Universal text translator function
 * Handles keys, exact phrases, patterns, and dynamic async AI fallback
 */
export function translateAnyText(text, targetLang = 'en', i18nInstance = null) {
  if (!text || typeof text !== 'string' || targetLang === 'en') return text;
  const clean = text.trim();
  if (!clean) return text;

  // 1. Check i18next key lookup if available
  if (i18nInstance && typeof i18nInstance.t === 'function') {
    const res = i18nInstance.t(clean, { defaultValue: '' });
    if (res && res !== clean) return res;
  }

  // 2. Check Global Phrases dictionary
  if (GLOBAL_PHRASES[clean]?.[targetLang]) {
    return GLOBAL_PHRASES[clean][targetLang];
  }

  // 3. Case-insensitive check in Global Phrases
  const lower = clean.toLowerCase();
  for (const [k, v] of Object.entries(GLOBAL_PHRASES)) {
    if (k.toLowerCase() === lower && v[targetLang]) {
      return v[targetLang];
    }
  }

  // 4. Check District / Category / Court
  if (SINDH_DISTRICTS_TRANSLATIONS[clean]?.[targetLang]) return SINDH_DISTRICTS_TRANSLATIONS[clean][targetLang];
  if (LEGAL_CATEGORIES_TRANSLATIONS[clean]?.[targetLang]) return LEGAL_CATEGORIES_TRANSLATIONS[clean][targetLang];
  if (COURTS_TRANSLATIONS[clean]?.[targetLang]) return COURTS_TRANSLATIONS[clean][targetLang];

  // 5. Check District prefix pattern: e.g. "Verified Advocates in Karachi"
  if (clean.startsWith('Verified Advocates in ')) {
    const dist = clean.replace('Verified Advocates in ', '');
    const transDist = translateDistrict(dist, targetLang);
    return targetLang === 'ur' ? `${transDist} میں مصدقہ وکلاء` : `${transDist} ۾ تصديق ٿيل وڪيل`;
  }
  if (clean.startsWith('District: ')) {
    const parts = clean.split('·');
    const distPart = parts[0].replace('District: ', '').trim();
    const transDist = translateDistrict(distPart, targetLang);
    const suffix = targetLang === 'ur' ? 'فعال قانونی وکالت اور ثبوت والٹ' : 'فعال قانوني وڪالت ۽ ثبوت والٽ';
    return targetLang === 'ur' ? `ضلع: ${transDist} · ${suffix}` : `ضلعو: ${transDist} · ${suffix}`;
  }
  if (clean.startsWith('hi, ') || clean.startsWith('Hi, ')) {
    const name = clean.replace(/^[hH]i,\s*/, '');
    return `سلام، ${name}`;
  }

  // 6. Runtime cache from previous sessions / seed
  const cached = getCachedTranslation(clean, targetLang);
  if (cached) return cached;

  // 7. Background AI translate for any new/unseen text
  autoTranslatePhrase(clean, targetLang);

  return text;
}

// Hook that wraps everything for React components
export function useAppTranslation() {
  const { t: rawT, i18n } = useTranslation();
  const currentLang = i18n?.language || 'en';

  const t = (keyOrPhrase, fallback) => {
    if (!keyOrPhrase) return '';
    if (currentLang === 'en') return fallback || keyOrPhrase;

    // Check raw i18next first
    const i18nVal = rawT(keyOrPhrase, { defaultValue: '' });
    if (i18nVal && i18nVal !== keyOrPhrase) {
      return i18nVal;
    }

    // Try phrase lookup
    return translateAnyText(fallback || keyOrPhrase, currentLang, { t: rawT });
  };

  return {
    t,
    currentLang,
    appName: getTranslatedAppName(currentLang),
    translateDistrict: (d) => translateDistrict(d, currentLang),
    translateCategory: (c) => translateCategory(c, currentLang),
    translateCourt: (c) => translateCourt(c, currentLang),
    translateDynamic: (text) => translateAnyText(text, currentLang, { t: rawT }),
  };
}

/**
 * Reusable AutoText Component:
 * Automatically translates any text passed as children into active language!
 */
export function AutoText({ children, style, ...props }) {
  const { translateDynamic } = useAppTranslation();
  let content = children;
  if (typeof children === 'string') {
    content = translateDynamic(children);
  }
  return <Text style={style} {...props}>{content}</Text>;
}

export default useAppTranslation;