import { User, UserRole } from '../types';

// Hardcoded users (in production, these would be in a database)
const USERS: Record<string, { password: string; role: UserRole }> = {
  'hannawintz': {
    password: 'pplpwithfire',
    role: 'admin'
  },
  'guest': {
    password: 'guest2026',
    role: 'viewer'
  }
};

const AUTH_STORAGE_KEY = 'running-planner-auth';

/**
 * Attempt to log in with username and password
 */
export function login(username: string, password: string): User | null {
  const user = USERS[username];
  
  if (!user || user.password !== password) {
    return null;
  }

  const userData: User = {
    username,
    role: user.role
  };

  // Store in sessionStorage (clears when browser closes)
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
  
  return userData;
}

/**
 * Get the currently logged in user
 */
export function getCurrentUser(): User | null {
  try {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

/**
 * Check if user is logged in
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Check if user has admin (edit) permissions
 */
export function canEdit(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

/**
 * Log out the current user
 */
export function logout(): void {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

