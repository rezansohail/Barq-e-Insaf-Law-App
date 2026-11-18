import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = 'user_selected_language';

// English baseline dictionary
export const en = {
  common: {
    loading: 'Loading...',
    viewAll: 'View All',
    greetingHi: 'hi,',
    cancel: 'Cancel',
    submit: 'Submit',
    new: 'New'
  },
  start: {
    tagline: 'Your legal companion for swift justice',
    getStarted: 'GET STARTED',
    exploreApp: 'EXPLORE APP'
  },
  landing: {
    signIn: 'Sign In',
    exploreApp: 'Explore App',
    badge: 'SMART DECISIONS FOR LEGAL MATTERS',
    heroSubtitle: "Pakistan's Premier AI Legal Assistant & Verified Advocate Network",
    heroDesc: 'Instant AI legal guidance in Urdu & Sindhi for Pakistan Penal Code, Property, and Family laws, paired with Sindh Bar Council verified advocates.',
    searchPlaceholder: 'Ask legal question (PPC Section 302, Divorce, Property)...',
    askAi: 'Ask AI',
    exploreTitle: 'Explore Legal Access Across Pakistan',
    card1Tag: '24/7 AI LEGAL RESEARCH',
    card1Title: 'Pakistan Penal Code & Precedents',
    card2Tag: 'SBC VERIFIED ADVOCATES',
    card2Title: 'Verified Bar Council Advocate Network',
    card3Tag: 'BIOMETRIC CONTRACTS',
    card3Title: 'Digital Representation Agreements',
    whyTitle: 'Why Barq-e-Insaf?',
    feature1Title: 'Multilingual AI Legal Research',
    feature1Desc: 'Get instant responses in Urdu, Sindhi, and English for PPC, property disputes, and labor rights.',
    feature2Title: 'SBC Verified Advocate Directory',
    feature2Desc: 'Connect with certified Sindh Bar Council lawyers with transparent client ratings and misconduct reporting.',
    feature3Title: 'Biometric Contract Signing',
    feature3Desc: 'Sign Vakalatnama representation agreements securely with simulated biometric fingerprint verification.',
    ctaTitle: 'Ready to Get Started?',
    ctaSubtitle: 'Select your portal to log in as a Citizen, Verified Lawyer, or NGO Administrator.',
    ctaBtn: 'GET STARTED'
  },
  auth: {
    loginTab: 'LOGIN',
    signupTab: 'SIGN UP',
    securePortalLogin: 'SECURE PORTAL LOGIN',
    credentialsRequired: 'Authorized credentials required',
    fullName: 'Full Name',
    fullNamePlaceholder: 'e.g. Ali Khan',
    phone: 'Phone Number',
    phonePlaceholder: '0300 1234567',
    cnic: 'CNIC (Sindh Only)',
    district: 'District',
    selectDistrict: 'Select Sindh District',
    sbcLicense: 'SBC Bar License Number',
    specialty: 'Legal Specialty',
    specialtyPlaceholder: 'Criminal / Property / Family',
    emailLabel: 'Email Address',
    emailPlaceholder: 'user@barqeinsaf.pk',
    passwordLabel: 'Password',
    enterPassword: 'Enter password',
    confirmPassword: 'Confirm Password',
    passwordsMatch: '✓ Passwords match',
    passwordsDoNotMatch: '✗ Passwords do not match',
    passwordCriteria: 'Password criteria:',
    charRequirement: 'At least 8 characters',
    lowercaseRequirement: 'One lowercase letter (a-z)',
    numberRequirement: 'One number (0-9)',
    symbolRequirement: 'One special symbol (!@#...)',
    rememberMe: 'Remember Me',
    forgotPassword: 'Forgot password?',
    loginBtn: 'LOGIN',
    registerBtn: 'REGISTER',
    resetPassword: 'Reset Password',
    resetDesc: 'Enter your registered email address to receive password reset instructions.',
    sendResetLink: 'Send Reset Link',
    quickFillKtn: '⚡ Quick-Fill KTN News Credentials',
    quickFillNchd: '⚡ Quick-Fill NCHD Credentials',
    portals: {
      citizen: { label: 'Citizen Portal', subLabel: 'Legal Empowerment for Citizens' },
      lawyer: { label: 'Lawyer Portal', subLabel: 'Advocate Legal Practice' },
      ngo: { label: 'NGO - National commission for human development (NCHD)', subLabel: 'Institutional Human Development Portal' },
      media: { label: 'Media - KTN news', subLabel: 'Court Reporting & Broadcast Journalism' },
      admin: { label: 'Admin Panel', subLabel: 'Sindh Bar Council Governance' }
    }
  },
  citizen: {
    buildCase: 'BUILD YOUR CASE',
    buildCaseSub: 'Start legal intake with facts, sections & evidence'
  },
  lawyer: {
    sbcAdvocate: 'SINDH BAR COUNCIL ADVOCATE',
    licence: 'Licence:',
    sbcVerified: '✓ SBC Verified',
    pendingVerification: 'Pending Verification',
    activeCases: 'Active Cases',
    newRequests: 'New Requests',
    completed: 'Completed',
    newClientRequests: 'New Client Requests',
    noPendingRequests: 'No pending case requests at this time.',
    chamberQuickActions: 'Chamber Quick Actions',
    institutionalPartners: 'Institutional Partners: Legal Aid & Media',
    viewInfo: 'View Info, Mission & Contact Email'
  },
  admin: {
    controlPanel: 'Admin Control Panel',
    governance: 'Sindh Bar Council Governance',
    overview: 'App Ecosystem Overview',
    adminGovernance: 'Administrative Governance',
    auditLog: 'System & Security Audit Log'
  }
};

// Urdu translations
export const ur = {
  common: {
    loading: 'لوڈ ہو رہا ہے...',
    viewAll: 'تمام دیکھیں',
    greetingHi: 'سلام،',
    cancel: 'منسوخ کریں',
    submit: 'جمع کرائیں',
    new: 'نیا'
  },
  start: {
    tagline: 'فوری انصاف کے لیے آپ کا قانونی ساتھی',
    getStarted: 'شروع کریں',
    exploreApp: 'ایپ دیکھیں'
  },
  landing: {
    signIn: 'لاگ ان کریں',
    exploreApp: 'ایپ دیکھیں',
    badge: 'قانونی معاملات کے لیے دانشمندانہ فیصلے',
    heroSubtitle: 'پاکستان کا سب سے پہلا AI قانونی معاون اور تصدیق شدہ وکلاء نیٹ ورک',
    heroDesc: 'پاکستان پینل کوڈ، جائیداد، اور خاندانی قوانین کے لیے اردو اور سندھی میں فوری AI رہنمائی، سندھ بار کونسل کے تصدیق شدہ وکلاء کے ساتھ۔',
    searchPlaceholder: 'قانونی سوال پوچھیں (تعزیراتِ پاکستان 302، طلاق، جائیداد)...',
    askAi: 'AI سے پوچھیں',
    exploreTitle: 'پورے پاکستان میں قانونی رسائی دریافت کریں',
    card1Tag: '24/7 AI قانونی تحقیق',
    card1Title: 'پاکستان پینل کوڈ اور قانونی نظائر',
    card2Tag: 'سندھ بار کونسل کے تصدیق شدہ وکلاء',
    card2Title: 'تصدیق شدہ وکلاء کا نیٹ ورک',
    card3Tag: 'بائیو میٹرک معاہدے',
    card3Title: 'ڈیجیٹل وکالت نامہ و نمائندگی',
    whyTitle: 'برقِ انصاف کیوں؟',
    feature1Title: 'کثیر لسانی AI قانونی تحقیق',
    feature1Desc: 'PPC، جائیداد کے تنازعات، اور مزدوری کے حقوق پر اردو، سندھی اور انگریزی میں فوری جوابات حاصل کریں۔',
    feature2Title: 'سندھ بار کونسل تصدیق شدہ وکلاء',
    feature2Desc: 'کلائنٹ کی درجہ بندی اور شفافیت کے ساتھ سندھ بار کونسل کے مصدقہ وکلاء سے رابطہ کریں۔',
    feature3Title: 'بائیو میٹرک معاہدے پر دستخط',
    feature3Desc: 'بائیومیٹرک تصدیق کے ساتھ وکالت نامہ محفوظ طریقے سے ڈیجیٹل دستخط کریں۔',
    ctaTitle: 'شروع کرنے کے لیے تیار ہیں؟',
    ctaSubtitle: 'شہری، تصدیق شدہ وکیل، یا این جی او کے طور پر لاگ ان کریں۔',
    ctaBtn: 'شروع کریں'
  },
  auth: {
    loginTab: 'لاگ ان',
    signupTab: 'رجسٹر کریں',
    securePortalLogin: 'محفوظ پورٹل لاگ ان',
    credentialsRequired: 'مجاز اسناد درکار ہیں',
    fullName: 'پورا نام',
    fullNamePlaceholder: 'مثلاً علی خان',
    phone: 'فون نمبر',
    phonePlaceholder: '0300 1234567',
    cnic: 'شناختی کارڈ (صرف سندھ)',
    district: 'ضلع',
    selectDistrict: 'سندھ کا ضلع منتخب کریں',
    sbcLicense: 'سندھ بار کونسل لائسنس نمبر',
    specialty: 'قانونی مہارت',
    specialtyPlaceholder: 'فوجداری / جائیداد / فیملی',
    emailLabel: 'ای میل ایڈریس',
    emailPlaceholder: 'user@barqeinsaf.pk',
    passwordLabel: 'پاس ورڈ',
    enterPassword: 'پاس ورڈ درج کریں',
    confirmPassword: 'پاس ورڈ کی تصدیق کریں',
    passwordsMatch: '✓ پاس ورڈ مل گئے ہیں',
    passwordsDoNotMatch: '✗ پاس ورڈ مماثل نہیں ہیں',
    passwordCriteria: 'پاس ورڈ کا معیار:',
    charRequirement: 'کم از کم 8 حروف',
    lowercaseRequirement: 'ایک چھوٹا حرف (a-z)',
    numberRequirement: 'ایک نمبر (0-9)',
    symbolRequirement: 'ایک خصوصی علامت (!@#...)',
    rememberMe: 'مجھے یاد رکھیں',
    forgotPassword: 'پاس ورڈ بھول گئے؟',
    loginBtn: 'لاگ ان کریں',
    registerBtn: 'رجسٹر کریں',
    resetPassword: 'پاس ورڈ دوبارہ ترتیب دیں',
    resetDesc: 'پاس ورڈ دوبارہ ترتیب دینے کی ہدایات کے لیے اپنا رجسٹرڈ ای میل درج کریں۔',
    sendResetLink: 'ری سیٹ لنک بھیجیں',
    quickFillKtn: '⚡ KTN نیوز کی اسناد درج کریں',
    quickFillNchd: '⚡ NCHD کی اسناد درج کریں',
    portals: {
      citizen: { label: 'شہری پورٹل', subLabel: 'شہریوں کے لیے قانونی بااختیاری' },
      lawyer: { label: 'وکیل پورٹل', subLabel: 'وکالت کی قانونی پریکٹس' },
      ngo: { label: 'این جی او - این سی ایچ ڈی', subLabel: 'انسانی ترقیاتی پورٹل' },
      media: { label: 'میڈیا - کے ٹی این نیوز', subLabel: 'عدالتی رپورٹنگ اور نشریاتی صحافت' },
      admin: { label: 'ایڈمن پینل', subLabel: 'سندھ بار کونسل نظم و نسق' }
    }
  },
  citizen: {
    buildCase: 'اپنا کیس بنائیں',
    buildCaseSub: 'حقائق، دفعات اور شواہد کے ساتھ قانونی کارروائی شروع کریں'
  },
  lawyer: {
    sbcAdvocate: 'سندھ بار کونسل ایڈووکیٹ',
    licence: 'لائسنس:',
    sbcVerified: '✓ مصدقہ وکیل',
    pendingVerification: 'تصدیق زیر التواء',
    activeCases: 'فعال مقدمات',
    newRequests: 'نئی درخواستیں',
    completed: 'مکمل شدہ',
    newClientRequests: 'نئی موکل درخواستیں',
    noPendingRequests: 'اس وقت کوئی نئی درخواست نہیں ہے۔',
    chamberQuickActions: 'چیمبر فوری کارروائیاں',
    institutionalPartners: 'ادارہ جاتی شراکت دار: قانونی امداد اور میڈیا',
    viewInfo: 'معلومات و رابطہ دیکھیں'
  },
  admin: {
    controlPanel: 'ایڈمن کنٹرول پینل',
    governance: 'سندھ بار کونسل نظم و نسق',
    overview: 'ایپ سسٹم کا جائزہ',
    adminGovernance: 'انتظامی نظم و نسق',
    auditLog: 'سسٹم اور سیکیورٹی آڈٹ لاگ'
  }
};

// Sindhi translations
export const sd = {
  common: {
    loading: 'لوڊ ٿي رهيو آهي...',
    viewAll: 'سمورا ڏسو',
    greetingHi: 'سلام،',
    cancel: 'رد ڪريو',
    submit: 'جمع ڪرايو',
    new: 'نئون'
  },
  start: {
    tagline: 'تيز انصاف لاءِ اوهان جو قانوني ساٿي',
    getStarted: 'شروع ڪريو',
    exploreApp: 'ايپ ڏسو'
  },
  landing: {
    signIn: 'داخل ٿيو',
    exploreApp: 'ايپ ڏسو',
    badge: 'قانوني معاملن لاءِ دانشمند فيصلا',
    heroSubtitle: 'پاڪستان جو پهريون AI قانوني مددگار ۽ تصديق ٿيل وڪيل نيٽ ورڪ',
    heroDesc: 'پاڪستان پينل ڪوڊ، ملڪيت، ۽ فيملي قانونن بابت سنڌي ۽ اردو ۾ ترت AI رهنمائي، سنڌ بار ڪائونسل جي تصديق ٿيل وڪيلن سان گڏ۔',
    searchPlaceholder: 'قانوني سوال پڇو (PPC قلم 302، طلاق، ملڪيت)...',
    askAi: 'AI کان پڇو',
    exploreTitle: 'سڄي سنڌ ۽ پاڪستان ۾ قانوني رسائي ڳوليو',
    card1Tag: '24/7 AI قانوني تحقيق',
    card1Title: 'پاڪستان پينل ڪوڊ ۽ نظيرون',
    card2Tag: 'تصديق ٿيل وڪيل',
    card2Title: 'سنڌ بار ڪائونسل وڪيل نيٽ ورڪ',
    card3Tag: 'بايوميٽرڪ معاهدا',
    card3Title: 'ڊجيٽل وڪالت نامو معاهدو',
    whyTitle: 'برق انصاف ڇو؟',
    feature1Title: 'گهڻ ٻوليائي AI قانوني تحقيق',
    feature1Desc: 'سنڌي، اردو ۽ انگريزي ۾ ملڪيت، تڪرارن ۽ مزدور حقن تي ترت جواب حاصل ڪريو.',
    feature2Title: 'سنڌ بار ڪائونسل تصديق ٿيل وڪيل',
    feature2Desc: 'شفاف ريٽنگ ۽ شڪايتن جي جانچ سان تصديق ٿيل وڪيلن سان رابطو ڪريو.',
    feature3Title: 'بايوميٽرڪ معاهدي تي صحيحيون',
    feature3Desc: 'بايوميٽرڪ فنگر پرنٽ تصديق سان محفوظ ڊجيٽل وڪالت نامو تيار ڪريو.',
    ctaTitle: 'شروع ڪرڻ لاءِ تيار آهيو؟',
    ctaSubtitle: 'شهري، وڪيل يا اين جي او انتظاميا طور لاگ ان ٿيو.',
    ctaBtn: 'شروع ڪريو'
  },
  auth: {
    loginTab: 'لاگ ان',
    signupTab: 'رجسٽر',
    securePortalLogin: 'محفوظ پورٽل لاگ ان',
    credentialsRequired: 'صحيح لاگ ان تفصيل گهربل آهن',
    fullName: 'پورو نالو',
    fullNamePlaceholder: 'مثال طور: علي خان',
    phone: 'فون نمبر',
    phonePlaceholder: '0300 1234567',
    cnic: 'شناختي ڪارڊ (صرف سنڌ)',
    district: 'ضلعو',
    selectDistrict: 'سنڌ جو ضلعو چونڊيو',
    sbcLicense: 'سنڌ بار ڪائونسل لائسنس نمبر',
    specialty: 'قانوني مهارت',
    specialtyPlaceholder: 'فوجداري / ملڪيت / خانداني',
    emailLabel: 'اي ميل ايڊريس',
    emailPlaceholder: 'user@barqeinsaf.pk',
    passwordLabel: 'پاسورڊ',
    enterPassword: 'پاسورڊ داخل ڪريو',
    confirmPassword: 'پاسورڊ جي تصديق ڪريو',
    passwordsMatch: '✓ پاسورڊ برابر آهن',
    passwordsDoNotMatch: '✗ پاسورڊ برابر ناهن',
    passwordCriteria: 'پاسورڊ معيار:',
    charRequirement: 'گھٽ ۾ گھٽ 8 اکر',
    lowercaseRequirement: 'هڪ ننڍو اکر (a-z)',
    numberRequirement: 'هڪ نمبر (0-9)',
    symbolRequirement: 'هڪ خاص نشاني (!@#...)',
    rememberMe: 'مون کي ياد رکو',
    forgotPassword: 'پاسورڊ وسري ويو؟',
    loginBtn: 'لاگ ان ڪريو',
    registerBtn: 'رجسٽر ڪريو',
    resetPassword: 'پاسورڊ بحال ڪريو',
    resetDesc: 'پاسورڊ مٽائڻ لاءِ پنهنجي رجسٽرڊ اي ميل داخل ڪريو.',
    sendResetLink: 'لنڪ موڪليو',
    quickFillKtn: '⚡ KTN نيوز تفصيل خودڪار لکو',
    quickFillNchd: '⚡ NCHD تفصيل خودڪار لکو',
    portals: {
      citizen: { label: 'شهري پورٽل', subLabel: 'شهرين لاءِ قانوني بااختياري' },
      lawyer: { label: 'وڪيل پورٽل', subLabel: 'وڪالت جي قانوني پريڪٽس' },
      ngo: { label: 'اين جي او - NCHD', subLabel: 'اداراتي ترقياتي پورٽل' },
      media: { label: 'ميڊيا - KTN نيوز', subLabel: 'عدالتي رپورٽنگ ۽ صحافت' },
      admin: { label: 'ايڊمن پينل', subLabel: 'سنڌ بار ڪائونسل انتظاميا' }
    }
  },
  citizen: {
    buildCase: 'پنهنجو ڪيس ٺاهيو',
    buildCaseSub: 'حقيقتن، شقن ۽ ثبوتن سان قانوني ڪاروائي شروع ڪريو'
  },
  lawyer: {
    sbcAdvocate: 'سنڌ بار ڪائونسل ايڊووڪيٽ',
    licence: 'لائسنس:',
    sbcVerified: '✓ تصديق ٿيل وڪيل',
    pendingVerification: 'تصديق التوا ۾',
    activeCases: 'هلندڙ ڪيس',
    newRequests: 'نئين درخواستون',
    completed: 'مڪمل ٿيل',
    newClientRequests: 'نئين موڪل درخواستون',
    noPendingRequests: 'هن وقت ڪا به نئين درخواست ناهي.',
    chamberQuickActions: 'چيمبر ترت ڪارروايون',
    institutionalPartners: 'اداراتي ساٿي: قانوني امداد ۽ ميڊيا',
    viewInfo: 'معلومات ڏسو'
  },
  admin: {
    controlPanel: 'ايڊمن ڪنٽرول پينل',
    governance: 'سنڌ بار ڪائونسل انتظاميا',
    overview: 'ايپ جو جائزو',
    adminGovernance: 'انتظامي نظام',
    auditLog: 'سيڪيورٽي آڊٽ لاگ'
  }
};

const resources = {
  en: { translation: en },
  ur: { translation: ur },
  sd: { translation: sd }
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Load saved user language preference on startup
AsyncStorage.getItem(LANGUAGE_KEY).then((savedLang) => {
  if (savedLang && ['en', 'ur', 'sd'].includes(savedLang)) {
    i18n.changeLanguage(savedLang);
  }
});

export const setLanguage = async (lang) => {
  if (['en', 'ur', 'sd'].includes(lang)) {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    await i18n.changeLanguage(lang);
  }
};

export default i18n;
