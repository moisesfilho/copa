import { Injectable, signal, computed } from '@angular/core';

export type Language = 'pt' | 'en';

export interface Translations {
  menu: any;
  filters: any;
  matches: any;
  dashboard: any;
  standings: any;
  match: any;
  about: any;
  settings: any;
  bracket: any;
  continents: { [key: string]: string };
}

import ptTranslations from '../i18n/pt.json';
import enTranslations from '../i18n/en.json';

const TRANSLATIONS: Record<Language, Translations> = {
  pt: ptTranslations as Translations,
  en: enTranslations as Translations
};

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  currentLang = signal<Language>(
    (typeof localStorage !== 'undefined' && localStorage ? localStorage.getItem('language') as Language : null) || 'pt'
  );

  t = computed(() => TRANSLATIONS[this.currentLang()]);

  toggleLanguage() {
    this.currentLang.update(lang => {
      const newLang = lang === 'pt' ? 'en' : 'pt';
      if (typeof localStorage !== 'undefined' && localStorage) {
        localStorage.setItem('language', newLang);
      }
      return newLang;
    });
  }

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem('language', lang);
    }
  }
}
