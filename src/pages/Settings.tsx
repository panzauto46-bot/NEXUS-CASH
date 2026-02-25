import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDemoData, type DemoSettings } from '../context/DemoDataContext';
import { Sun, Moon, Globe, Wallet, Bell, Shield, Database, Save, ExternalLink, RefreshCw, RotateCcw } from 'lucide-react';

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative h-7 w-14 rounded-full cursor-pointer ${on ? 'bg-nexus-green' : 'bg-gray-300 dark:bg-white/10'}`}
    >
      <span className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-7' : 'translate-x-0'}`} />
    </button>
  );
}

function formatSyncTime(value: Date | null): string {
  if (!value) return 'never';
  return value.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const {
    settings,
    updateSettings,
    resetSettings,
    bchUsdRate,
    lastRateSyncAt,
    syncBchRate,
    treasurySnapshot,
  } = useDemoData();
  const [draft, setDraft] = useState<DemoSettings>(settings);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const cardBg = 'neo-panel';
  const textMain = isDark ? 'text-white' : 'text-nexus-text-light';
  const textSub = isDark ? 'text-nexus-gray' : 'text-nexus-sub-light';
  const inputBg = isDark
    ? 'bg-white/5 text-white border border-white/10 placeholder-nexus-gray'
    : 'bg-gray-50 text-nexus-text-light border border-nexus-border-light placeholder-nexus-sub-light';

  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(settings), [draft, settings]);

  const setDraftPatch = <K extends keyof DemoSettings>(key: K, value: DemoSettings[K]) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const result = updateSettings(draft);
    if (!result.ok) {
      setFeedback({ tone: 'error', message: result.error });
      return;
    }
    setFeedback({ tone: 'success', message: 'Settings saved successfully.' });
  };

  const handleReset = () => {
    resetSettings();
    setFeedback({ tone: 'success', message: 'Settings restored to default.' });
  };

  const handleSyncRate = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    window.setTimeout(() => {
      syncBchRate();
      setIsSyncing(false);
      setFeedback({ tone: 'success', message: 'BCH rate synced.' });
    }, 400);
  };

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 2400);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  return (
    <div className="max-w-4xl space-y-6">
      {feedback && (
        <div className={`rounded-xl px-3 py-2 text-xs font-medium ${
          feedback.tone === 'success' ? 'bg-nexus-green/15 text-nexus-green' : 'bg-nexus-red/15 text-nexus-red'
        }`}>
          {feedback.message}
        </div>
      )}

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
            <Switch on={isDark} onToggle={toggleTheme} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textMain}`}>Language</p>
              <p className={`text-xs ${textSub}`}>Choose your preferred interface language</p>
            </div>
            <select
              value={draft.language}
              onChange={event => setDraftPatch('language', event.target.value as 'English' | 'Indonesian')}
              className={`rounded-xl px-3 py-2 text-sm outline-none ${inputBg}`}
            >
              <option value="English">English</option>
              <option value="Indonesian">Indonesian</option>
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
            <label className={`text-xs font-semibold ${textSub}`}>Hot Wallet Address (Checkout)</label>
            <input
              type="text"
              value={draft.hotWalletAddress}
              onChange={event => setDraftPatch('hotWalletAddress', event.target.value)}
              className={`mt-1.5 w-full rounded-xl px-3 py-2.5 font-mono text-sm outline-none ${inputBg}`}
            />
          </div>
          <div>
            <label className={`text-xs font-semibold ${textSub}`}>Cold Wallet Address (Treasury)</label>
            <input
              type="text"
              value={draft.coldWalletAddress}
              onChange={event => setDraftPatch('coldWalletAddress', event.target.value)}
              className={`mt-1.5 w-full rounded-xl px-3 py-2.5 font-mono text-sm outline-none ${inputBg}`}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={`text-xs font-semibold ${textSub}`}>Auto-Sweep Threshold</label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="number"
                  value={draft.autoSweepThresholdBch}
                  onChange={event => setDraftPatch('autoSweepThresholdBch', Number(event.target.value))}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`}
                />
                <span className={`rounded-xl px-3 py-2.5 text-sm font-medium ${isDark ? 'bg-white/5 text-nexus-gray' : 'border border-nexus-border-light bg-gray-50 text-nexus-sub-light'}`}>BCH</span>
              </div>
            </div>
            <div className="flex items-end">
              <div className="w-full rounded-xl bg-nexus-cyan/10 px-3 py-2">
                <p className="text-[10px] text-nexus-cyan">Current Hot Wallet</p>
                <p className={`text-xs font-semibold ${textMain}`}>{treasurySnapshot.hotWalletBch.toFixed(4)} BCH</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textMain}`}>Auto Sweep Engine</p>
              <p className={`text-xs ${textSub}`}>Automatically move BCH from hot wallet to cold wallet</p>
            </div>
            <Switch on={draft.autoSweepEnabled} onToggle={() => setDraftPatch('autoSweepEnabled', !draft.autoSweepEnabled)} />
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
            <select
              value={draft.priceOracle}
              onChange={event => setDraftPatch('priceOracle', event.target.value as DemoSettings['priceOracle'])}
              className={`mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`}
            >
              <option>CoinGecko API (Free)</option>
              <option>Binance API</option>
              <option>Custom Oracle</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-xs font-semibold ${textSub}`}>Fiat Currency</label>
              <select
                value={draft.fiatCurrency}
                onChange={event => setDraftPatch('fiatCurrency', event.target.value as DemoSettings['fiatCurrency'])}
                className={`mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`}
              >
                <option>USD - US Dollar</option>
                <option>EUR - Euro</option>
              </select>
            </div>
            <div>
              <label className={`text-xs font-semibold ${textSub}`}>Slippage Tolerance</label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="number"
                  value={draft.slippageTolerancePct}
                  step="0.1"
                  onChange={event => setDraftPatch('slippageTolerancePct', Number(event.target.value))}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`}
                />
                <span className={`rounded-xl px-3 py-2.5 text-sm font-medium ${isDark ? 'bg-white/5 text-nexus-gray' : 'border border-nexus-border-light bg-gray-50 text-nexus-sub-light'}`}>%</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={`text-xs font-semibold ${textSub}`}>Price Refresh Interval</label>
              <select
                value={draft.priceRefreshIntervalSec}
                onChange={event => setDraftPatch('priceRefreshIntervalSec', Number(event.target.value) as 15 | 30 | 60)}
                className={`mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`}
              >
                <option value={15}>Every 15 seconds</option>
                <option value={30}>Every 30 seconds</option>
                <option value={60}>Every 60 seconds</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleSyncRate}
                className="flex items-center gap-2 rounded-xl bg-nexus-cyan/15 px-3 py-2.5 text-xs font-semibold text-nexus-cyan cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Rate'}
              </button>
              <p className={`text-xs ${textSub}`}>
                1 BCH = <span className={textMain}>{bchUsdRate.toFixed(2)} USD</span> | {formatSyncTime(lastRateSyncAt)}
              </p>
            </div>
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
              <input
                type="text"
                value={draft.tokenName}
                onChange={event => setDraftPatch('tokenName', event.target.value)}
                className={`mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`}
              />
            </div>
            <div>
              <label className={`text-xs font-semibold ${textSub}`}>Reward Rate (pts/USD)</label>
              <input
                type="number"
                value={draft.rewardRate}
                onChange={event => setDraftPatch('rewardRate', Number(event.target.value))}
                className={`mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textMain}`}>Auto-mint Loyalty Token</p>
              <p className={`text-xs ${textSub}`}>Automatically send tokens after payment confirmation</p>
            </div>
            <Switch
              on={draft.autoMintLoyaltyToken}
              onToggle={() => setDraftPatch('autoMintLoyaltyToken', !draft.autoMintLoyaltyToken)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textMain}`}>Digital Receipt NFT</p>
              <p className={`text-xs ${textSub}`}>Mint NFT as transaction proof</p>
            </div>
            <Switch
              on={draft.digitalReceiptNft}
              onToggle={() => setDraftPatch('digitalReceiptNft', !draft.digitalReceiptNft)}
            />
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
            {
              key: 'notificationIncomingPayments' as const,
              label: 'Incoming Payments',
              desc: 'Alert when BCH payment is received',
            },
            {
              key: 'notificationFailedTransactions' as const,
              label: 'Failed Transactions',
              desc: 'Warn on timeout or failed transaction',
            },
            {
              key: 'notificationSweepReminder' as const,
              label: 'Sweep Reminder',
              desc: 'Notify when wallet exceeds sweep threshold',
            },
            {
              key: 'notificationNewCustomers' as const,
              label: 'New Customers',
              desc: 'Notify on first-time buyer wallet',
            },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${textMain}`}>{item.label}</p>
                <p className={`text-xs ${textSub}`}>{item.desc}</p>
              </div>
              <Switch
                on={draft[item.key]}
                onToggle={() => setDraftPatch(item.key, !draft[item.key])}
              />
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
            <input
              type="password"
              value={draft.cashierPin}
              maxLength={4}
              onChange={event => setDraftPatch('cashierPin', event.target.value)}
              className={`mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm outline-none ${inputBg}`}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${textMain}`}>Two-Factor Authentication</p>
              <p className={`text-xs ${textSub}`}>Additional protection for owner access</p>
            </div>
            <Switch
              on={draft.twoFactorEnabled}
              onToggle={() => setDraftPatch('twoFactorEnabled', !draft.twoFactorEnabled)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <a href="#" className={`flex items-center gap-1 text-xs font-medium ${textSub} hover:text-nexus-cyan`}>
            <ExternalLink className="h-3 w-3" /> API Documentation
          </a>
          <span className={`text-xs ${textSub}`}>|</span>
          <span className={`text-xs ${textSub}`}>v1.1.0-demo</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold cursor-pointer ${
              isDark ? 'bg-white/5 text-nexus-gray' : 'bg-gray-100 text-nexus-sub-light'
            }`}
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="flex items-center gap-2 rounded-xl bg-nexus-green px-6 py-3 text-sm font-bold text-white shadow-lg shadow-nexus-green/20 transition-all hover:bg-nexus-green-dark cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
