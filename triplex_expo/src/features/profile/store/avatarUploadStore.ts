import { create } from 'zustand';

/** Progress of the profile-picture upload: `null` when idle, else 0–100 (0 while the photo is being prepared). */
export const useAvatarUploadStore = create<{
  progress: number | null;
  set: (progress: number | null) => void;
}>((set) => ({ progress: null, set: (progress) => set({ progress }) }));
