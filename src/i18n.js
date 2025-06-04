import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector'; // <-- Importa el detector

import en from './locales/en/translation.json';
import es from './locales/es/translation.json';

i18n
  // Usa el detector de idioma
  .use(LanguageDetector)
  // Pasa la instancia de i18n a react-i18next
  .use(initReactI18next)
  // Inicializa i18n
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    // IMPORTANT: Elimina 'lng: "es"' aquí.
    // El detector se encargará de establecer el idioma inicial.
    // Si no se encuentra un idioma guardado, usará el 'fallbackLng'.

    fallbackLng: 'es', // Si no se detecta ningún idioma guardado, o si el guardado no está disponible, usa 'es'
    debug: false, // Puedes ponerlo en true si quieres ver más logs de i18n en desarrollo

    // Configuración del detector
    detection: {
      order: ['localStorage', 'navigator'], // Prioridad: primero busca en localStorage, luego en el navegador
      caches: ['localStorage'], // Guarda el idioma en localStorage
    },

    interpolation: {
      escapeValue: false, // React ya se encarga de esto
    },
  });

export default i18n;