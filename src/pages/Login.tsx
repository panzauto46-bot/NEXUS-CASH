import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, LogIn, Mail, Wallet, Zap, Rocket } from 'lucide-react';

export function Login() {
  const { isDark, toggleTheme } = useTheme();
  const { googleEmail, walletAddress, connectGoogle, connectWallet, quickDemoLogin } = useAuth();
  const [emailInput, setEmailInput] = useState(googleEmail ?? '');
  const [walletInput, setWalletInput] = useState(walletAddress ?? '');
  const [error, setError] = useState('');

  const handleConnectGoogle = () => {
    const result = connectGoogle(emailInput);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
  };

  const handleConnectWallet = () => {
    const result = connectWallet(walletInput);
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
            Sebelum masuk dashboard, user harus login pakai <span className="font-semibold text-nexus-green">Gmail Google</span> dan
            menghubungkan <span className="font-semibold text-nexus-cyan">Wallet BCH</span>.
          </p>

          <button
            onClick={quickDemoLogin}
            className="mb-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-nexus-green to-nexus-cyan px-4 py-2 text-xs font-bold text-white shadow-lg shadow-nexus-green/20 cursor-pointer"
          >
            <Rocket className="h-3.5 w-3.5" />
            Quick Demo Login (1 klik)
          </button>

          <div className="space-y-4">
            <div className={`rounded-2xl p-4 ${isDark ? 'bg-white/5' : 'bg-white/80'}`}>
              <div className="mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-nexus-green" />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-nexus-text-light'}`}>Google Gmail</h3>
              </div>
              <input
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="nama@gmail.com"
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-white placeholder-nexus-gray'
                    : 'border-nexus-border-light bg-white text-nexus-text-light placeholder-nexus-sub-light'
                }`}
              />
              <button
                onClick={handleConnectGoogle}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-nexus-green px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-nexus-green-dark cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                Connect Google
              </button>
              {googleEmail && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-nexus-green">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {googleEmail}
                </p>
              )}
            </div>

            <div className={`rounded-2xl p-4 ${isDark ? 'bg-white/5' : 'bg-white/80'}`}>
              <div className="mb-3 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-nexus-cyan" />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-nexus-text-light'}`}>BCH Wallet</h3>
              </div>
              <input
                type="text"
                value={walletInput}
                onChange={e => setWalletInput(e.target.value)}
                placeholder="bitcoincash:q..."
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-white placeholder-nexus-gray'
                    : 'border-nexus-border-light bg-white text-nexus-text-light placeholder-nexus-sub-light'
                }`}
              />
              <button
                onClick={handleConnectWallet}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-nexus-cyan px-4 py-2.5 text-xs font-bold text-white transition-all hover:opacity-90 cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                Connect Wallet
              </button>
              {walletAddress && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-nexus-green">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {walletAddress}
                </p>
              )}
              <p className={`mt-2 text-[11px] ${textSubClass(isDark)}`}>
                Demo format: `bitcoincash:qdemo...wallet`
              </p>
            </div>
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

function textSubClass(isDark: boolean) {
  return isDark ? 'text-nexus-gray' : 'text-nexus-sub-light';
}
