import { create } from 'zustand';

import {
  applyThemePreference,
  loadThemePreference,
  saveThemePreference,
  type ThemePreference,
} from '../model/theme';

interface ThemeState {
  preference: ThemePreference;
  /** True once the saved choice has been read AND applied — gate the first render on it. */
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setPreference: (preference: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: 'system',
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const preference = await loadThemePreference();
    applyThemePreference(preference);
    set({ preference, hydrated: true });
  },

  setPreference: (preference) => {
    applyThemePreference(preference);
    set({ preference });
    void saveThemePreference(preference);
  },
}));
