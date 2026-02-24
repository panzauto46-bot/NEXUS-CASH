import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Globe, Wallet, Bell, Shield, Database, Save, ExternalLink } from 'lucide-react';

function Switch({ on }: { on: boolean }) {
  return (
    <button className={`relative h-7 w-14 rounded-full cursor-pointer ${on ? 'bg-nexus-green' : 'bg-gray-300 dark:bg-white/10'}`}>
      <span className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-7' : 'translate-x-0'}`} />
    </button>
  );
}

export function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const cardBg = 'neo-panel';
  const textMain = isDark ? 'text-white' : 'text-nexus-text-light';
  const textSub = isDark ? 'text-nexus-gray' : 'text-nexus-sub-light';
  const inputBg = isDark
    ? 'bg-white/5 text-white border border-white/10 placeholder-nexus-gray'
    : 'bg-gray-50 text-nexus-text-light border border-nexus-border-light placeholder-nexus-sub-light';

  return (
    <div className="max-w-4xl space-y-6">
      <div className={`rounded-2xl p-5 ${cardBg}`}>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-cyan/10">
            {isDark ? <Moon className="h-5 w-5 text-nexus-cyan" /> : <Sun className="h-5 w-5 text-amber-500" />}
          </div>
          <div>
            <h3 className={`font-bold ${textMain}`}>Appearance</h3>
            <p className={`text-xs ${textSub}`}>Customize dashboard visuals</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textMain}`}>Dark Mode</p>
              <p className={`text-xs ${textSub}`}>Reduce eye strain in low-light environments</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative h-7 w-14 rounded-full transition-all cursor-pointer ${isDark ? 'bg-nexus-green' : 'bg-gray-300'}`}
            >
              <span className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textMain}`}>Language</p>
              <p className={`text-xs ${textSub}`}>Choose your preferred interface language</p>
            </div>
            <select className={`rounded-xl px-3 py-2 text-sm outline-none ${inputBg}`}>
              <option>English</option>
              <option>Indonesian</option>
            </select>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl p-5 ${cardBg}`}>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-green/10">
            <Wallet className="h-5 w-5 text-nexus-green" />
          </div>
          <div>
            <h3 className={`font-bold ${textMain}`}>Wallet Configuration</h3>
            <p className={`text-xs ${textSub}`}>BCH addresses for receiving payments</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className={`text-xs font-semibold ${textSub}`}>Hot Wallet Address (Cashier)</label>
            <input
              type="text"
              defaultValue="bitcoincash:qz7x8mh5j9v3k2n..."
              className={`mt-1.5 w-full rounded-xl px-3 py-2.5 font-mono text-sm outline-none ${inputBg}`}
            />
          </div>
          <div>
            <label className={`text-xs font-semibold ${textSub}`}>Cold Wallet Address (Owner)</label>
            <input
              type="text"
              defaultValue="bitcoincash:qp4r2nm8k6w1..."
              className={`mt-1.5 w-full rounded-xl px-3 py-2.5 font-mono text-sm outline-none ${inputBg}`}
            />
          </div>
          <div>
            <label className={`text-xs font-semibold ${textSub}`}>Auto-Sweep Threshold</label>
            <div className="mt-1.5 flex gap-2">
              <input type="number" defaultValue="1.0" className={`flex-1 rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`} />
              <span className={`rounded-xl px-3 py-2.5 text-sm font-medium ${isDark ? 'bg-white/5 text-nexus-gray' : 'border border-nexus-border-light bg-gray-50 text-nexus-sub-light'}`}>BCH</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl p-5 ${cardBg}`}>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-cyan/10">
            <Globe className="h-5 w-5 text-nexus-cyan" />
          </div>
          <div>
            <h3 className={`font-bold ${textMain}`}>API and Exchange Rate</h3>
            <p className={`text-xs ${textSub}`}>Configure BCH price feed source</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className={`text-xs font-semibold ${textSub}`}>Price Oracle</label>
            <select className={`mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`}>
              <option>CoinGecko API (Free)</option>
              <option>Binance API</option>
              <option>Custom Oracle</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-xs font-semibold ${textSub}`}>Fiat Currency</label>
              <select className={`mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`}>
                <option>USD - US Dollar</option>
                <option>EUR - Euro</option>
              </select>
            </div>
            <div>
              <label className={`text-xs font-semibold ${textSub}`}>Slippage Tolerance</label>
              <div className="mt-1.5 flex gap-2">
                <input type="number" defaultValue="0.5" step="0.1" className={`flex-1 rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`} />
                <span className={`rounded-xl px-3 py-2.5 text-sm font-medium ${isDark ? 'bg-white/5 text-nexus-gray' : 'border border-nexus-border-light bg-gray-50 text-nexus-sub-light'}`}>%</span>
              </div>
            </div>
          </div>
          <div>
            <label className={`text-xs font-semibold ${textSub}`}>Price Refresh Interval</label>
            <select className={`mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`}>
              <option>Every 15 seconds</option>
              <option>Every 30 seconds</option>
              <option>Every 60 seconds</option>
            </select>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl p-5 ${cardBg}`}>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10">
            <Database className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <h3 className={`font-bold ${textMain}`}>CashToken Configuration</h3>
            <p className={`text-xs ${textSub}`}>Loyalty token and receipt NFT options</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-xs font-semibold ${textSub}`}>Token Name</label>
              <input type="text" defaultValue="$NEXUS" className={`mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`} />
            </div>
            <div>
              <label className={`text-xs font-semibold ${textSub}`}>Reward Rate (%)</label>
              <input type="number" defaultValue="3" className={`mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textMain}`}>Auto-mint Loyalty Token</p>
              <p className={`text-xs ${textSub}`}>Automatically send tokens after payment confirmation</p>
            </div>
            <Switch on={true} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textMain}`}>Digital Receipt NFT</p>
              <p className={`text-xs ${textSub}`}>Mint NFT as transaction proof</p>
            </div>
            <Switch on={true} />
          </div>
        </div>
      </div>

      <div className={`rounded-2xl p-5 ${cardBg}`}>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-red/10">
            <Bell className="h-5 w-5 text-nexus-red" />
          </div>
          <div>
            <h3 className={`font-bold ${textMain}`}>Notifications</h3>
            <p className={`text-xs ${textSub}`}>Manage system alerts</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Incoming Payments', desc: 'Alert when BCH payment is received', on: true },
            { label: 'Failed Transactions', desc: 'Warn on timeout or failed transaction', on: true },
            { label: 'Sweep Reminder', desc: 'Notify when wallet exceeds sweep threshold', on: true },
            { label: 'New Customers', desc: 'Notify on first-time buyer wallet', on: false },
          ].map((n, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${textMain}`}>{n.label}</p>
                <p className={`text-xs ${textSub}`}>{n.desc}</p>
              </div>
              <Switch on={n.on} />
            </div>
          ))}
        </div>
      </div>

      <div className={`rounded-2xl p-5 ${cardBg}`}>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-green/10">
            <Shield className="h-5 w-5 text-nexus-green" />
          </div>
          <div>
            <h3 className={`font-bold ${textMain}`}>Security</h3>
            <p className={`text-xs ${textSub}`}>Account security settings</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className={`text-xs font-semibold ${textSub}`}>Cashier PIN (4 digits)</label>
            <input type="password" defaultValue="1234" maxLength={4} className={`mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textMain}`}>Two-Factor Authentication</p>
              <p className={`text-xs ${textSub}`}>Additional protection for owner access</p>
            </div>
            <button className={`rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer ${isDark ? 'bg-white/5 text-nexus-gray' : 'bg-gray-100 text-nexus-sub-light'}`}>
              Setup 2FA
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <a href="#" className={`flex items-center gap-1 text-xs font-medium ${textSub} hover:text-nexus-cyan`}>
            <ExternalLink className="h-3 w-3" /> API Documentation
          </a>
          <span className={`text-xs ${textSub}`}>|</span>
          <span className={`text-xs ${textSub}`}>v1.0.0-beta</span>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-nexus-green px-6 py-3 text-sm font-bold text-white shadow-lg shadow-nexus-green/20 transition-all hover:bg-nexus-green-dark cursor-pointer">
          <Save className="h-4 w-4" /> Save Settings
        </button>
      </div>
    </div>
  );
}
