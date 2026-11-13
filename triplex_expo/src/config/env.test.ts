import { resolveBaseUrl } from './env';

describe('resolveBaseUrl', () => {
  describe('development without an override', () => {
    it('uses the host loopback alias on the Android emulator', () => {
      expect(resolveBaseUrl({ os: 'android', isDev: true })).toBe('http://10.0.2.2:3000/api/');
    });

    it('uses localhost on the iOS simulator', () => {
      expect(resolveBaseUrl({ os: 'ios', isDev: true })).toBe('http://localhost:3000/api/');
    });
  });

  describe('with an override', () => {
    it('wins over the dev default on every platform', () => {
      const override = 'http://192.168.1.20:3000/api';
      expect(resolveBaseUrl({ override, os: 'android', isDev: true })).toBe(`${override}/`);
      expect(resolveBaseUrl({ override, os: 'ios', isDev: true })).toBe(`${override}/`);
    });

    it('is used in release builds', () => {
      expect(
        resolveBaseUrl({ override: 'https://api.example.com/api', os: 'ios', isDev: false }),
      ).toBe('https://api.example.com/api/');
    });

    it('does not double the trailing slash and trims whitespace', () => {
      expect(
        resolveBaseUrl({ override: '  https://api.example.com/api/  ', os: 'ios', isDev: false }),
      ).toBe('https://api.example.com/api/');
    });

    it('rejects a value that is not an http(s) URL', () => {
      expect(() => resolveBaseUrl({ override: 'api.example.com', os: 'ios', isDev: true })).toThrow(
        /http:\/\/ or https:\/\//,
      );
    });
  });

  describe('release builds without an override', () => {
    it.each(['ios', 'android'])('throws on %s instead of silently targeting localhost', (os) => {
      expect(() => resolveBaseUrl({ os, isDev: false })).toThrow(/EXPO_PUBLIC_API_URL must be set/);
    });

    it('treats a blank override as missing', () => {
      expect(() => resolveBaseUrl({ override: '   ', os: 'ios', isDev: false })).toThrow(
        /EXPO_PUBLIC_API_URL must be set/,
      );
    });
  });
});
