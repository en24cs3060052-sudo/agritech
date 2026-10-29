const D = {
  en: { dashboard: 'Dashboard', farms: 'My Farms', crops: 'Crops & Soil', weather: 'Weather', shop: 'Resources', community: 'Experts & Community', admin: 'Admin', logout: 'Log out', login: 'Log in', register: 'Create account', welcome: 'Welcome', alerts: 'Pest alerts', save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete', add: 'Add' },
  hi: { dashboard: 'डैशबोर्ड', farms: 'मेरे खेत', crops: 'फसल और मिट्टी', weather: 'मौसम', shop: 'कृषि सामग्री', community: 'विशेषज्ञ और समुदाय', admin: 'एडमिन', logout: 'लॉग आउट', login: 'लॉग इन', register: 'खाता बनाएँ', welcome: 'स्वागत है', alerts: 'कीट चेतावनी', save: 'सहेजें', cancel: 'रद्द करें', edit: 'बदलें', delete: 'हटाएँ', add: 'जोड़ें' }
};
export const getLang = () => localStorage.getItem('lang') || 'en';
export const t = k => (D[getLang()] || D.en)[k] || D.en[k] || k;
