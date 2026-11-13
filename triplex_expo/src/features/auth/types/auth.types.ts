import type { User } from '../../../core/api/schemas';

export interface LoginEmailCredentials {
  email: string;
  password: string;
}

export interface LoginUsernameCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  isLoading: boolean;
  /** User-safe message from the last failed action (an `AppError.message`). */
  error: string | null;
  login: (credentials: LoginEmailCredentials | LoginUsernameCredentials) => Promise<User>;
  register: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
  clearError: () => void;
  /** Replace the signed-in user with a fresher copy from the server (no effect when signed out). */
  updateUser: (user: User) => void;
}
