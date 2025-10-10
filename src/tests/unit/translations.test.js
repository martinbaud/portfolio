import { describe, it, expect } from 'vitest';
import { getBrowserLanguage, getTranslation } from '../../translations';

describe('Translations - Unit Tests', () => {
  describe('getBrowserLanguage', () => {
    it('returns a valid language code', () => {
      const lang = getBrowserLanguage();
      expect(['en', 'es', 'fr']).toContain(lang);
    });

    it('returns "en" as fallback', () => {
      const originalNavigator = global.navigator;
      Object.defineProperty(global, 'navigator', {
        value: { language: 'xx-XX' },
        writable: true
      });

      const lang = getBrowserLanguage();
      expect(lang).toBe('en');

      global.navigator = originalNavigator;
    });
  });

  describe('getTranslation', () => {
    it('returns translation object for English', () => {
      const t = getTranslation('en');
      expect(t).toHaveProperty('nav');
      expect(t).toHaveProperty('hero');
      expect(t).toHaveProperty('github');
      expect(t).toHaveProperty('projects');
      expect(t).toHaveProperty('skills');
      expect(t).toHaveProperty('footer');
    });

    it('returns translation object for Spanish', () => {
      const t = getTranslation('es');
      expect(t).toHaveProperty('nav');
      expect(t.nav).toHaveProperty('about');
    });

    it('returns translation object for French', () => {
      const t = getTranslation('fr');
      expect(t).toHaveProperty('nav');
      expect(t.nav).toHaveProperty('about');
    });

    it('returns English translations as fallback for invalid language', () => {
      const t = getTranslation('invalid');
      const enTranslation = getTranslation('en');
      expect(t).toEqual(enTranslation);
    });

    it('has consistent structure across all languages', () => {
      const en = getTranslation('en');
      const es = getTranslation('es');
      const fr = getTranslation('fr');

      expect(Object.keys(en)).toEqual(Object.keys(es));
      expect(Object.keys(en)).toEqual(Object.keys(fr));
    });

    it('has all navigation keys in all languages', () => {
      const languages = ['en', 'es', 'fr'];
      const expectedNavKeys = ['about', 'github', 'projects', 'skills', 'contact'];

      languages.forEach(lang => {
        const t = getTranslation(lang);
        expectedNavKeys.forEach(key => {
          expect(t.nav).toHaveProperty(key);
          expect(typeof t.nav[key]).toBe('string');
        });
      });
    });
  });
});
