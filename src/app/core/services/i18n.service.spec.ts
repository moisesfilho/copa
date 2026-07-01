import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('I18nService', () => {
  let service: I18nService;
  let mockStorage: any;
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    mockStorage = {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      })
    };
    vi.stubGlobal('localStorage', mockStorage);

    TestBed.configureTestingModule({
      providers: [I18nService]
    });
    service = TestBed.inject(I18nService);
  });

  afterEach(() => {
    mockStorage.clear();
    vi.unstubAllGlobals();
  });

  it('should be created with default language pt', () => {
    expect(service).toBeTruthy();
    expect(service.currentLang()).toBe('pt');
  });

  it('should load language from localStorage if available', () => {
    localStorage.setItem('language', 'en');
    const newService = new I18nService(); 
    expect(newService.currentLang()).toBe('en');
  });

  it('should toggle language', () => {
    expect(service.currentLang()).toBe('pt');
    service.toggleLanguage();
    expect(service.currentLang()).toBe('en');
    expect(localStorage.getItem('language')).toBe('en');

    service.toggleLanguage();
    expect(service.currentLang()).toBe('pt');
    expect(localStorage.getItem('language')).toBe('pt');
  });

  it('should set language directly', () => {
    service.setLanguage('en');
    expect(service.currentLang()).toBe('en');
    expect(localStorage.getItem('language')).toBe('en');
  });

  describe('translateStage', () => {
    beforeEach(() => {
      service.setLanguage('pt'); 
    });

    it('should return empty string if no name provided', () => {
      expect(service.translateStage(undefined)).toBe('');
    });

    it('should translate Round of 32 variations', () => {
      expect(service.translateStage('Round of 32')).toBe('16-avos de Final');
      expect(service.translateStage('16-avos de final')).toBe('16-avos de Final');
      expect(service.translateStage('segundas')).toBe('16-avos de Final');
    });

    it('should translate Round of 16 variations', () => {
      expect(service.translateStage('Round of 16')).toBe('Oitavas de Final');
      expect(service.translateStage('oitavas')).toBe('Oitavas de Final');
      expect(service.translateStage('eighth')).toBe('Oitavas de Final');
    });

    it('should translate Quarter Finals variations', () => {
      expect(service.translateStage('quarter finals')).toBe('Quartas de Final');
      expect(service.translateStage('quarta')).toBe('Quartas de Final');
    });

    it('should translate Semi Finals variations', () => {
      expect(service.translateStage('semi-final')).toBe('Semifinal');
      expect(service.translateStage('semifinal')).toBe('Semifinal');
    });

    it('should translate Third Place variations', () => {
      expect(service.translateStage('third place')).toBe('Disputa do 3º Lugar');
      expect(service.translateStage('terceiro')).toBe('Disputa do 3º Lugar');
      expect(service.translateStage('bronze')).toBe('Disputa do 3º Lugar');
    });

    it('should translate Final variations', () => {
      expect(service.translateStage('final')).toBe('Final');
      expect(service.translateStage('ouro')).toBe('Final');
      expect(service.translateStage('gold')).toBe('Final');
    });

    it('should return original name if no match found', () => {
      expect(service.translateStage('Group Stage')).toBe('Group Stage');
    });
  });
});
