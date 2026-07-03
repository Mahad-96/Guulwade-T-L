import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'so' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav & General
    home: 'Home',
    about: 'About Us',
    services: 'Our Services',
    tracking: 'Shipment Tracking',
    booking: 'Book Shipment',
    quote: 'Request Quote',
    fleet: 'Fleet',
    warehouse: 'Warehouse',
    careers: 'Careers',
    blog: 'Blog',
    contact: 'Contact Us',
    dashboard: 'Dashboard',
    admin: 'Admin Portal',
    logout: 'Log Out',
    login: 'Log In',
    register: 'Register',
    currency: 'Currency',
    language: 'Language',
    // Hero
    heroTitle: 'Guulwade Transportation & Logistics',
    heroSubtitle: 'Connecting the Horn of Africa to Global Trade Lanes with Trust, Speed, and Security.',
    getStarted: 'Get Started',
    trackShipment: 'Track Shipment',
    enterTrackingNum: 'Enter Tracking Number (e.g., GTL-2026-000154)',
    track: 'Track',
    // Stats
    statCountries: 'Countries Connected',
    statVehicles: 'Active Fleet Vehicles',
    statDelivered: 'Delivered Packages',
    statWarehouses: 'Strategic Warehouses',
    // Services
    serviceLocalTrans: 'Local Transportation',
    serviceLocalTransDesc: 'Reliable city-to-city cargo truck operations connecting main regional supply networks.',
    serviceFreightForward: 'Freight Forwarding',
    serviceFreightForwardDesc: 'Seamless customs clearances and cargo shipping across key regional ports.',
    serviceAirCargo: 'Air Cargo',
    serviceAirCargoDesc: 'Express 24-hour delivery flights connecting Mogadishu, Hargeisa, Nairobi, & Addis Ababa.',
    serviceSeaFreight: 'Sea Freight',
    serviceSeaFreightDesc: 'Container vessel shipments (FCL/LCL) through Indian Ocean & Red Sea shipping corridors.',
    serviceCustomsClearance: 'Customs Clearance',
    serviceCustomsClearanceDesc: 'Speedy customs handling, pre-clearances, and legal documentation at sea & air terminals.',
    serviceWarehousing: 'Smart Warehousing',
    serviceWarehousingDesc: 'Modern inventory logistics, secure 24/7 dry & cold storage hubs in key trade cities.',
    // Footer
    footerDesc: 'Guulwade Transportation & Logistics is a premier global logistics company providing end-to-end supply chain management solutions with world-class efficiency.',
    quickLinks: 'Quick Links',
    contactInfo: 'Contact Information',
    copyright: '© 2026 Guulwade Transportation & Logistics. All rights reserved.',
    terms: 'Terms & Conditions',
    privacy: 'Privacy Policy',
    // Dashboards & Messages
    welcomeBack: 'Welcome back',
    unauthorized: 'Unauthorized Access',
    loading: 'Loading...'
  },
  so: {
    // Nav & General
    home: 'Hoyga',
    about: 'Nagu Saabsan',
    services: 'Adeegyada',
    tracking: 'La-socoshada Rarka',
    booking: 'Dalbo Shixnad',
    quote: 'Codso Qiimaha',
    fleet: 'Gaadiidka',
    warehouse: 'Bakhaarada',
    careers: 'Shaqooyinka',
    blog: 'Baloogga',
    contact: 'La Xiriir',
    dashboard: 'Maamulka',
    admin: 'Xarunta Admin',
    logout: 'Ka Bax',
    login: 'Gali',
    register: 'Isdiiwaangeli',
    currency: 'Lacagta',
    language: 'Luuqadda',
    // Hero
    heroTitle: 'Guulwade Gaadiidka & Saadka',
    heroSubtitle: 'Isku xirka Geeska Afrika iyo Wadooyinka Ganacsiga Caalamiga ah oo leh Kalsooni, Degdeg iyo Amni.',
    getStarted: 'Bilaaw hadda',
    trackShipment: 'Dabagalka Shixnadda',
    enterTrackingNum: 'Geli Lambarka Dabagalka (Tusaale, GTL-2026-000154)',
    track: 'Baar',
    // Stats
    statCountries: 'Wadamada Isku Xiran',
    statVehicles: 'Gawaarida Hawlgala',
    statDelivered: 'Xirmooyinka La Gaarsiiyay',
    statWarehouses: 'Bakhaarada Istiraatiijiga ah',
    // Services
    serviceLocalTrans: 'Raridda Gudaha',
    serviceLocalTransDesc: 'Adeegyo xamuul oo la isku halleyn karo oo isku xira shabakadaha saadka ee gobolka.',
    serviceFreightForward: 'Gudbinta Xamuulka',
    serviceFreightForwardDesc: 'Nadiifinta kastamka ee fudud iyo rarida shixnadaha ee dekedaha muhiimka ah.',
    serviceAirCargo: 'Xamuulka Cirka',
    serviceAirCargoDesc: 'Duulimaadyo degdeg ah oo 24-saac ah oo isku xira Muqdisho, Hargeysa, Nairobi, & Addis Ababa.',
    serviceSeaFreight: 'Xamuulka Badda',
    serviceSeaFreightDesc: 'Rarida weelasha (FCL/LCL) ee dhex mara dariiqyada badweynta Hindiya iyo badda Cas.',
    serviceCustomsClearance: 'Sifaynta Kastamka',
    serviceCustomsClearanceDesc: 'Maareynta kastamka oo degdeg ah iyo dukumiintiyada sharciga ah ee dekedaha iyo madaarada.',
    serviceWarehousing: 'Bakhaaro Casri ah',
    serviceWarehousingDesc: 'Saadka alaabada casriga ah, bakhaaro ammaan ah oo habeen iyo dhinac ah oo ku yaal magaalooyinka ganacsiga.',
    // Footer
    footerDesc: 'Guulwade Gaadiidka & Saadka waa shirkad saadka caalamiga ah oo bixisa xalal dhameystiran oo ku saabsan silsilada saadka oo leh hufnaan heer caalami ah.',
    quickLinks: 'Xiriirinta Degdega ah',
    contactInfo: 'Macluumaadka Xiriirka',
    copyright: '© 2026 Guulwade Gaadiidka & Saadka. Xuquuqda oo dhan waa dhowran tahay.',
    terms: 'Shuruudaha & Adeegga',
    privacy: 'Xeerka Ilaalinta Xogta',
    // Dashboards & Messages
    welcomeBack: 'Kuso dhowow',
    unauthorized: 'Gelid Loo Diiday',
    loading: 'Waa la rari doonaa...'
  },
  ar: {
    // Nav & General
    home: 'الرئيسية',
    about: 'من نحن',
    services: 'خدماتنا',
    tracking: 'تتبع الشحنات',
    booking: 'حجز شحنة',
    quote: 'طلب تسعيرة',
    fleet: 'الأسطول',
    warehouse: 'المستودعات',
    careers: 'الوظائف',
    blog: 'المدونة',
    contact: 'اتصل بنا',
    dashboard: 'لوحة التحكم',
    admin: 'بوابة المسؤول',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    currency: 'العملة',
    language: 'اللغة',
    // Hero
    heroTitle: 'جولوادي للنقل والخدمات اللوجستية',
    heroSubtitle: 'ربط القرن الأفريقي بممرات التجارة العالمية بكل ثقة وسرعة وأمان.',
    getStarted: 'ابدأ الآن',
    trackShipment: 'تتبع الشحنة',
    enterTrackingNum: 'أدخل رقم التتبع (مثال: GTL-2026-000154)',
    track: 'تتبع',
    // Stats
    statCountries: 'دول متصلة',
    statVehicles: 'الأسطول النشط',
    statDelivered: 'شحنات تم تسليمها',
    statWarehouses: 'مستودعات استراتيجية',
    // Services
    serviceLocalTrans: 'النقل المحلي',
    serviceLocalTransDesc: 'عمليات نقل بري موثوقة للبضائع بين المدن تربط شبكات الإمداد الإقليمية الرئيسية.',
    serviceFreightForward: 'شحن البضائع وتمريرها',
    serviceFreightForwardDesc: 'تخليص جمركي سلس وشحن بضائع عبر الموانئ الإقليمية الرئيسية.',
    serviceAirCargo: 'الشحن الجوي',
    serviceAirCargoDesc: 'رحلات شحن سريعة على مدار 24 ساعة تربط بين مقديشو، هرجيسا، نيروبي، وأديس أبابا.',
    serviceSeaFreight: 'الشحن البحري',
    serviceSeaFreightDesc: 'شحن الحاويات الكاملة والمشتركة عبر ممرات شحن المحيط الهندي والبحر الأحمر.',
    serviceCustomsClearance: 'التخليص الجمركي',
    serviceCustomsClearanceDesc: 'تخليص جمركي سريع، ومعالجة مسبقة، وتوثيق قانوني في الموانئ والمطارات.',
    serviceWarehousing: 'مستودعات ذكية',
    serviceWarehousingDesc: 'خدمات لوجستية حديثة، مستودعات جافة ومبردة آمنة على مدار الساعة في المدن التجارية.',
    // Footer
    footerDesc: 'جولوادي للنقل والخدمات اللوجستية هي شركة رائدة في مجال الخدمات اللوجستية العالمية تقدم حلولاً متكاملة لسلاسل الإمداد بكفاءة عالمية.',
    quickLinks: 'روابط سريعة',
    contactInfo: 'معلومات الاتصال',
    copyright: '© 2026 جولوادي للنقل والخدمات اللوجستية. كل الحقوق محفوظة.',
    terms: 'الشروط والأحكام',
    privacy: 'سياسة الخصوصية',
    // Dashboards & Messages
    welcomeBack: 'مرحباً بك مجدداً',
    unauthorized: 'غير مصرح بالدخول',
    loading: 'جاري التحميل...'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('guulwade_lang');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('guulwade_lang', language);
    // Support RTL for Arabic
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
