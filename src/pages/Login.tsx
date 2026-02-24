import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Mail, Wallet, Zap } from 'lucide-react';

export function Login() {
  const { isDark, toggleTheme } = useTheme();
  const { googleEmail, walletAddress, connectGoogle, connectWallet } = useAuth();
  const [error, setError] = useState('');

  const handleConnectGoogle = () => {
    const result = connectGoogle('demo.ncash@gmail.com');
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
  };

  const handleConnectWallet = () => {
    const result = connectWallet('bitcoincash:qdemo...wallet');
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
  };

  return (
    <div className={`min-h-screen p-4 sm:p-8 ${isDark ? 'bg-nexus-onyx' : 'bg-nexus-bg-light'}`}>
      <div className="mx-auto max-w-6xl">
        <div className="neo-panel flex-1 rounded-3xl p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-green to-nexus-cyan shadow-lg shadow-nexus-green/20">
                <Zap className="h-6 w-6 text-white" fill="white" />
              </div>
              <div>
                <p className={`text-[10px] uppercase tracking-[0.26em] ${isDark ? 'text-nexus-gray' : 'text-nexus-sub-light'}`}>
                  NexusCash
                </p>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-nexus-text-light'}`}>
                  Login Required
                </h1>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className={`rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer ${
                isDark ? 'bg-white/10 text-white' : 'bg-white text-nexus-sub-light'
              }`}
            >
              {isDark ? 'Light' : 'Dark'}
            </button>
          </div>

          <p className={`mb-5 text-sm ${isDark ? 'text-nexus-gray' : 'text-nexus-sub-light'}`}>
            Klik ikon <span className="font-semibold text-nexus-green">Gmail</span> dan <span className="font-semibold text-nexus-cyan">Wallet BCH</span> untuk login demo.
          </p>

          <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              onClick={handleConnectGoogle}
              className={`rounded-2xl border p-5 text-left transition-all cursor-pointer ${
                googleEmail
                  ? 'border-nexus-green/40 bg-nexus-green/10'
                  : isDark
                    ? 'border-white/10 bg-white/5 hover:border-nexus-green/30'
                    : 'border-nexus-border-light bg-white/80 hover:border-nexus-green/30'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <Mail className="h-5 w-5 text-nexus-green" />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-nexus-text-light'}`}>Google Gmail</h3>
              </div>
              <p className={`text-xs ${isDark ? 'text-nexus-gray' : 'text-nexus-sub-light'}`}>
                Tap icon untuk connect
              </p>
              {googleEmail && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-nexus-green">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                </p>
              )}
            </button>

            <button
              onClick={handleConnectWallet}
              className={`rounded-2xl border p-5 text-left transition-all cursor-pointer ${
                walletAddress
                  ? 'border-nexus-cyan/40 bg-nexus-cyan/10'
                  : isDark
                    ? 'border-white/10 bg-white/5 hover:border-nexus-cyan/30'
                    : 'border-nexus-border-light bg-white/80 hover:border-nexus-cyan/30'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-nexus-cyan" />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-nexus-text-light'}`}>BCH Wallet</h3>
              </div>
              <p className={`text-xs ${isDark ? 'text-nexus-gray' : 'text-nexus-sub-light'}`}>
                Tap icon untuk connect
              </p>
              {walletAddress && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-nexus-green">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                </p>
              )}
            </button>
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-nexus-red/30 bg-nexus-red/10 px-3 py-2 text-xs text-nexus-red">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
