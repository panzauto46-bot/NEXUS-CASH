import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface AuthPayload {
  googleEmail: string | null;
  walletAddress: string | null;
}

interface AuthContextType {
  googleEmail: string | null;
  walletAddress: string | null;
  isAuthenticated: boolean;
  connectGoogle: (email: string) => { ok: true } | { ok: false; error: string };
  connectWallet: (wallet: string) => { ok: true } | { ok: false; error: string };
  quickDemoLogin: () => void;
  logout: () => void;
}

const STORAGE_KEY = 'ncash-auth-session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function validateGmail(email: string): boolean {
  return /^[^\s@]+@gmail\.com$/i.test(email.trim());
}

function validateWallet(address: string): boolean {
  const trimmed = address.trim();
  if (!trimmed.startsWith('bitcoincash:')) return false;
  return trimmed.length >= 14;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<AuthPayload>;
      setGoogleEmail(parsed.googleEmail ?? null);
      setWalletAddress(parsed.walletAddress ?? null);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const payload: AuthPayload = { googleEmail, walletAddress };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [googleEmail, walletAddress]);

  const connectGoogle: AuthContextType['connectGoogle'] = (email: string) => {
    const value = email.trim().toLowerCase();
    if (!validateGmail(value)) {
      return { ok: false, error: 'Gunakan akun Gmail yang valid (contoh: nama@gmail.com).' };
    }
    setGoogleEmail(value);
    return { ok: true };
  };

  const connectWallet: AuthContextType['connectWallet'] = (wallet: string) => {
    const value = wallet.trim();
    if (!validateWallet(value)) {
      return { ok: false, error: 'Gunakan alamat BCH valid, diawali bitcoincash: ...' };
    }
    setWalletAddress(value);
    return { ok: true };
  };

  const logout = () => {
    setGoogleEmail(null);
    setWalletAddress(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const quickDemoLogin = () => {
    setGoogleEmail('demo.ncash@gmail.com');
    setWalletAddress('bitcoincash:qdemo...wallet');
  };

  const isAuthenticated = Boolean(googleEmail && walletAddress);

  const value = useMemo<AuthContextType>(() => ({
    googleEmail,
    walletAddress,
    isAuthenticated,
    connectGoogle,
    connectWallet,
    quickDemoLogin,
    logout,
  }), [googleEmail, walletAddress, isAuthenticated]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
