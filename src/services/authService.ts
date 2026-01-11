import { User } from '@/types';
import { storage, sessionStorage } from './localStorage';

interface StoredUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  password: string; // Hashed password (simple implementation)
  createdAt: string;
}

const USERS_STORAGE_KEY = 'users';
const CURRENT_USER_KEY = 'current_user';

// Simple password hashing (for demo purposes - not cryptographically secure)
const hashPassword = (password: string): string => {
  return btoa(password); // Base64 encoding (simple, not secure - use proper hashing in production)
};

// Generate unique user ID
const generateUserId = (): string => {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Get all users from storage
const getUsers = (): Record<string, StoredUser> => {
  return storage.get<Record<string, StoredUser>>(USERS_STORAGE_KEY) || {};
};

// Save users to storage
const saveUsers = (users: Record<string, StoredUser>): void => {
  storage.set(USERS_STORAGE_KEY, users);
};

// Get current user from session
export const getCurrentUser = (): User | null => {
  return sessionStorage.get<User>(CURRENT_USER_KEY);
};

// Save current user to session
const setCurrentUser = (user: User | null): void => {
  if (user) {
    sessionStorage.set(CURRENT_USER_KEY, user);
  } else {
    sessionStorage.remove(CURRENT_USER_KEY);
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const users = getUsers();
    const userEntry = Object.values(users).find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!userEntry) {
      throw new Error("We couldn't find an account with that email. Want to create one? 💗");
    }

    if (userEntry.password !== hashPassword(password)) {
      throw new Error("That password doesn't match. No worries — try again! ✨");
    }

    const user: User = {
      uid: userEntry.uid,
      email: userEntry.email,
      displayName: userEntry.displayName,
      photoURL: userEntry.photoURL,
    };

    setCurrentUser(user);
    return user;
  } catch (error: any) {
    if (error.message.includes("couldn't find") || error.message.includes("doesn't match")) {
      throw error;
    }
    throw new Error("Something went wrong. Don't worry — we'll figure it out together! 💗");
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string
): Promise<User> => {
  try {
    const users = getUsers();

    // Check if email already exists
    const existingUser = Object.values(users).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      throw new Error('This email is already registered. Want to sign in instead? 🌟');
    }

    if (password.length < 6) {
      throw new Error('Please use a stronger password (at least 6 characters) for your security 💪');
    }

    const uid = generateUserId();
    const now = new Date().toISOString();

    const newUser: StoredUser = {
      uid,
      email: email.toLowerCase(),
      displayName: displayName || null,
      photoURL: null,
      password: hashPassword(password),
      createdAt: now,
    };

    users[uid] = newUser;
    saveUsers(users);

    const user: User = {
      uid,
      email: newUser.email,
      displayName: newUser.displayName,
      photoURL: null,
    };

    setCurrentUser(user);
    return user;
  } catch (error: any) {
    if (error.message.includes('already registered') || error.message.includes('stronger password')) {
      throw error;
    }
    throw new Error("Something went wrong. Don't worry — we'll figure it out together! 💗");
  }
};

export const signInWithGoogle = async (): Promise<User> => {
  // For local storage version, Google sign-in creates a new account or finds existing
  // In a real implementation, you'd integrate with Google OAuth
  throw new Error('Google Sign-In is not available in offline mode. Please use email/password instead. 💗');
};

export const signOut = async (): Promise<void> => {
  try {
    setCurrentUser(null);
  } catch (error) {
    throw new Error('Failed to sign out. Please try again.');
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  // For local storage version, we can't send emails
  // In a real implementation, you'd send a reset link
  const users = getUsers();
  const userEntry = Object.values(users).find((u) => u.email.toLowerCase() === email.toLowerCase());
  
  if (!userEntry) {
    throw new Error("We couldn't find an account with that email. Want to create one? 💗");
  }

  // In a real app, you'd send an email here
  throw new Error('Password reset is not available in offline mode. Please create a new account if needed. 💗');
};

// Helper to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
