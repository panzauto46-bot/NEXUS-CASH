import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDemoData, type DemoTransaction } from '../context/DemoDataContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Coins,
  Send,
  ArrowDownToLine,
  Shield,
  Flame,
  TrendingUp,
  AlertTriangle,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { BCH_TO_USD, formatUsd } from '../utils/currency';

type FeedbackTone = 'success' | 'error';

interface SupplyPoint {
  day: string;
  supply: number;
  distributed: number;
}

function txTimestamp(tx: DemoTransaction): number {
  const parsed = Date.parse(`${tx.date}T${tx.time}:00`);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function compactWallet(wallet: string): string {
  if (wallet.length <= 14) return wallet;
  return `${wallet.slice(0, 10)}...${wallet.slice(-4)}`;
}

function relativeTime(timestamp: number, now: number): string {
  const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export function Treasury() {
  const { isDark } = useTheme();
  const {
    transactions,
    treasurySnapshot,
    treasurySweeps,
    pendingMintTransactions,
    setTreasuryAutoMintEnabled,
    setTreasuryAutoSweepEnabled,
    setTreasurySweepThreshold,
    sweepToColdWallet,
    burnTreasurySupply,
    mintPendingTransaction,
  } = useDemoData();
  const [feedback, setFeedback] = useState<{ tone: FeedbackTone; message: string } | null>(null);
  const [burnAmount, setBurnAmount] = useState('100');
  const [thresholdInput, setThresholdInput] = useState(String(treasurySnapshot.sweepThresholdBch));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const ticker = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(ticker);
  }, []);

  useEffect(() => {
    setThresholdInput(String(treasurySnapshot.sweepThresholdBch));
  }, [treasurySnapshot.sweepThresholdBch]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 2500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const cardBg = 'neo-panel';
  const textMain = isDark ? 'text-white' : 'text-nexus-text-light';
  const textSub = isDark ? 'text-nexus-gray' : 'text-nexus-sub-light';
  const hotWalletUsd = treasurySnapshot.hotWalletBch * BCH_TO_USD;
  const coldWalletUsd = treasurySnapshot.coldWalletBch * BCH_TO_USD;
  const sweepableNow = Math.max(treasurySnapshot.hotWalletBch - 0.2, 0);
  const shouldSweepNow = treasurySnapshot.hotWalletBch >= treasurySnapshot.sweepThresholdBch;

  const recentMints = useMemo(() => {
    return [...transactions]
      .filter(tx => tx.status === 'confirmed' && tx.tokensGiven > 0)
      .sort((left, right) => txTimestamp(right) - txTimestamp(left))
      .slice(0, 6);
  }, [transactions]);

  const supplyHistory = useMemo<SupplyPoint[]>(() => {
    const mintedTx = [...transactions]
      .filter(tx => tx.status === 'confirmed' && tx.tokensGiven > 0)
      .sort((left, right) => txTimestamp(left) - txTimestamp(right))
      .slice(-7);

    if (mintedTx.length === 0) {
      return [
        {
          day: 'Now',
          supply: Math.max(treasurySnapshot.totalSupply - treasurySnapshot.distributedSupply, 0),
          distributed: treasurySnapshot.distributedSupply,
        },
      ];
    }

    const mintedWindow = mintedTx.reduce((sum, tx) => sum + tx.tokensGiven, 0);
    let runningDistributed = Math.max(treasurySnapshot.distributedSupply - mintedWindow, 0);
    const points = mintedTx.map(tx => {
      runningDistributed += tx.tokensGiven;
      return {
        day: tx.id,
        supply: Math.max(treasurySnapshot.totalSupply - runningDistributed, 0),
        distributed: runningDistributed,
      };
    });

    if (points.length === 1) {
      points.unshift({
        day: 'Base',
        supply: Math.max(treasurySnapshot.totalSupply - (runningDistributed - mintedTx[0].tokensGiven), 0),
        distributed: Math.max(runningDistributed - mintedTx[0].tokensGiven, 0),
      });
    }

    return points;
  }, [transactions, treasurySnapshot.totalSupply, treasurySnapshot.distributedSupply]);

  const applyThreshold = () => {
    const parsed = Number(thresholdInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setFeedback({ tone: 'error', message: 'Sweep threshold invalid.' });
      return;
    }
    setTreasurySweepThreshold(parsed);
    setFeedback({ tone: 'success', message: 'Sweep threshold updated.' });
  };

  const triggerManualSweep = () => {
    const swept = sweepToColdWallet();
    if (!swept) {
      setFeedback({ tone: 'error', message: 'Hot wallet too small to sweep (reserve 0.2 BCH).' });
      return;
    }
    setFeedback({ tone: 'success', message: 'Sweep to cold wallet completed.' });
  };

  const handleBurnSupply = () => {
    const parsed = Number(burnAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setFeedback({ tone: 'error', message: 'Burn amount must be greater than zero.' });
      return;
    }
    const burned = burnTreasurySupply(parsed);
    if (!burned) {
      setFeedback({ tone: 'error', message: 'Burn failed. Check available treasury supply.' });
      return;
    }
    setFeedback({ tone: 'success', message: `Burned ${Math.floor(parsed).toLocaleString()} tokens.` });
  };

  const triggerManualMint = (txId: string) => {
    const minted = mintPendingTransaction(txId);
    if (!minted) {
      setFeedback({ tone: 'error', message: `Mint failed for ${txId}.` });
      return;
    }
    setFeedback({ tone: 'success', message: `Mint completed for ${txId}.` });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Coins,
            label: 'Total Supply',
            value: treasurySnapshot.totalSupply.toLocaleString(),
            sub: '$NEXUS Points',
            color: 'text-nexus-green',
            bg: 'bg-nexus-green/10',
          },
          {
            icon: Send,
            label: 'Distributed',
            value: treasurySnapshot.distributedSupply.toLocaleString(),
            sub: `${((treasurySnapshot.distributedSupply / treasurySnapshot.totalSupply) * 100).toFixed(1)}% of supply`,
            color: 'text-nexus-cyan',
            bg: 'bg-nexus-cyan/10',
          },
          {
            icon: Shield,
            label: 'Available',
            value: treasurySnapshot.availableSupply.toLocaleString(),
            sub: 'Ready to mint',
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
          },
          {
            icon: Flame,
            label: 'Burned',
            value: treasurySnapshot.burnedSupply.toLocaleString(),
            sub: `${((treasurySnapshot.burnedSupply / treasurySnapshot.totalSupply) * 100).toFixed(1)}% destroyed`,
            color: 'text-nexus-red',
            bg: 'bg-nexus-red/10',
          },
        ].map(item => (
          <div key={item.label} className={`rounded-2xl p-5 ${cardBg}`}>
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <p className={`text-2xl font-bold ${textMain}`}>{item.value}</p>
            <p className={`mt-0.5 text-xs ${textSub}`}>{item.label}</p>
            <p className={`mt-1 text-[10px] font-medium ${item.color}`}>{item.sub}</p>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl p-5 ${cardBg}`}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-nexus-green/10">
                <Wallet className="h-6 w-6 text-nexus-green" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${textMain}`}>Settlement and Sweeping</h3>
                <p className={`text-sm ${textSub}`}>
                  Hot wallet: <span className="font-bold text-nexus-green">{treasurySnapshot.hotWalletBch.toFixed(4)} BCH</span> (~ {formatUsd(hotWalletUsd)})
                </p>
                <p className={`text-xs ${textSub}`}>
                  Cold wallet: <span className={textMain}>{treasurySnapshot.coldWalletBch.toFixed(4)} BCH</span> (~ {formatUsd(coldWalletUsd)})
                </p>
              </div>
            </div>
            <button
              onClick={triggerManualSweep}
              className="flex items-center gap-2 rounded-xl bg-nexus-green px-5 py-3 text-sm font-bold text-white shadow-lg shadow-nexus-green/20 transition-all hover:bg-nexus-green-dark cursor-pointer"
            >
              <ArrowDownToLine className="h-4 w-4" /> Sweep to Cold Wallet
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <button
              onClick={() => setTreasuryAutoMintEnabled(!treasurySnapshot.autoMintEnabled)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer ${
                treasurySnapshot.autoMintEnabled
                  ? 'bg-nexus-green/15 text-nexus-green'
                  : isDark
                    ? 'bg-white/10 text-nexus-gray'
                    : 'bg-gray-100 text-nexus-sub-light'
              }`}
            >
              Auto-mint: {treasurySnapshot.autoMintEnabled ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setTreasuryAutoSweepEnabled(!treasurySnapshot.autoSweepEnabled)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer ${
                treasurySnapshot.autoSweepEnabled
                  ? 'bg-nexus-cyan/15 text-nexus-cyan'
                  : isDark
                    ? 'bg-white/10 text-nexus-gray'
                    : 'bg-gray-100 text-nexus-sub-light'
              }`}
            >
              Auto-sweep: {treasurySnapshot.autoSweepEnabled ? 'ON' : 'OFF'}
            </button>
            <div className={`rounded-xl px-3 py-2 ${isDark ? 'bg-white/5' : 'bg-white/80'}`}>
              <p className={`text-[10px] ${textSub}`}>Sweep threshold (BCH)</p>
              <div className="mt-1 flex items-center gap-2">
                <input
                  value={thresholdInput}
                  onChange={event => setThresholdInput(event.target.value)}
                  className={`w-full rounded-lg border px-2 py-1 text-xs outline-none ${
                    isDark
                      ? 'border-white/10 bg-white/10 text-white'
                      : 'border-nexus-border-light bg-white text-nexus-text-light'
                  }`}
                />
                <button
                  onClick={applyThreshold}
                  className="rounded-lg bg-nexus-cyan/15 px-2 py-1 text-[10px] font-semibold text-nexus-cyan cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
            <div className={`rounded-xl px-3 py-2 ${isDark ? 'bg-white/5' : 'bg-white/80'}`}>
              <p className={`text-[10px] ${textSub}`}>Burn available supply</p>
              <div className="mt-1 flex items-center gap-2">
                <input
                  value={burnAmount}
                  onChange={event => setBurnAmount(event.target.value)}
                  className={`w-full rounded-lg border px-2 py-1 text-xs outline-none ${
                    isDark
                      ? 'border-white/10 bg-white/10 text-white'
                      : 'border-nexus-border-light bg-white text-nexus-text-light'
                  }`}
                />
                <button
                  onClick={handleBurnSupply}
                  className="rounded-lg bg-nexus-red/15 px-2 py-1 text-[10px] font-semibold text-nexus-red cursor-pointer"
                >
                  Burn
                </button>
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-3 rounded-xl p-3 ${isDark ? 'border border-yellow-500/10 bg-yellow-500/5' : 'border border-yellow-200 bg-yellow-50'}`}>
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-400" />
            <p className="text-xs text-yellow-500">
              {shouldSweepNow
                ? `Hot wallet exceeded threshold. Sweepable now: ${sweepableNow.toFixed(4)} BCH.`
                : `Recommendation: keep at least ${treasurySnapshot.sweepThresholdBch.toFixed(3)} BCH threshold for secure sweeping.`}
            </p>
          </div>

          {feedback && (
            <p className={`text-xs font-semibold ${feedback.tone === 'success' ? 'text-nexus-green' : 'text-nexus-red'}`}>
              {feedback.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={`rounded-2xl p-5 ${cardBg}`}>
          <h3 className={`mb-1 font-bold ${textMain}`}>Supply Trend</h3>
          <p className={`mb-4 text-xs ${textSub}`}>Live curve based on latest mint activity</p>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={supplyHistory}>
              <defs>
                <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0AC18E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0AC18E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00E5FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2a2a34' : '#e2e8f0'} />
              <XAxis dataKey="day" tick={{ fill: isDark ? '#A0AAB2' : '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: isDark ? '#A0AAB2' : '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: isDark ? '#1E1E24' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', borderRadius: '12px', color: isDark ? '#fff' : '#1a202c', fontSize: '12px' }} />
              <Area type="monotone" dataKey="supply" stroke="#0AC18E" fill="url(#supplyGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="distributed" stroke="#00E5FF" fill="url(#distGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={`rounded-2xl p-5 ${cardBg}`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className={`font-bold ${textMain}`}>Recent Minting</h3>
              <p className={`text-xs ${textSub}`}>Latest confirmed reward transfers</p>
            </div>
            <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold ${treasurySnapshot.autoMintEnabled ? 'bg-nexus-green/15 text-nexus-green' : 'bg-nexus-red/15 text-nexus-red'}`}>
              <TrendingUp className="h-3 w-3" /> Auto-mint {treasurySnapshot.autoMintEnabled ? 'ON' : 'OFF'}
            </div>
          </div>
          <div className="space-y-3">
            {recentMints.length === 0 && (
              <p className={`rounded-xl p-3 text-xs ${isDark ? 'bg-white/[0.03] text-nexus-gray' : 'bg-gray-50 text-nexus-sub-light'}`}>
                No mint activity yet. Complete a checkout payment first.
              </p>
            )}
            {recentMints.map(mint => (
              <div key={mint.id} className={`flex items-center justify-between rounded-xl p-3 ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nexus-cyan/10">
                    <Coins className="h-4 w-4 text-nexus-cyan" />
                  </div>
                  <div>
                    <p className={`font-mono text-xs font-semibold ${textMain}`}>{compactWallet(mint.customer)}</p>
                    <p className={`text-[10px] ${textSub}`}>{mint.id} | {mint.time}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-nexus-green">+{mint.tokensGiven} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className={`rounded-2xl p-5 ${cardBg}`}>
          <h3 className={`mb-1 font-bold ${textMain}`}>Manual Mint Queue</h3>
          <p className={`mb-4 text-xs ${textSub}`}>Confirmed payments waiting for reward mint</p>
          <div className="space-y-3">
            {pendingMintTransactions.length === 0 && (
              <p className={`rounded-xl p-3 text-xs ${isDark ? 'bg-white/[0.03] text-nexus-gray' : 'bg-gray-50 text-nexus-sub-light'}`}>
                Queue empty.
              </p>
            )}
            {pendingMintTransactions.map(tx => (
              <div key={tx.id} className={`flex items-center justify-between rounded-xl p-3 ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                <div>
                  <p className={`font-mono text-xs font-semibold ${textMain}`}>{tx.id}</p>
                  <p className={`text-[10px] ${textSub}`}>{compactWallet(tx.customer)} | {tx.bch.toFixed(4)} BCH</p>
                </div>
                <button
                  onClick={() => triggerManualMint(tx.id)}
                  className="rounded-lg bg-nexus-green/15 px-3 py-1.5 text-[10px] font-semibold text-nexus-green cursor-pointer"
                >
                  Mint Now
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl p-5 ${cardBg}`}>
          <h3 className={`mb-1 font-bold ${textMain}`}>Sweep Activity</h3>
          <p className={`mb-4 text-xs ${textSub}`}>Recent hot-to-cold wallet settlements</p>
          <div className="space-y-3">
            {treasurySweeps.length === 0 && (
              <p className={`rounded-xl p-3 text-xs ${isDark ? 'bg-white/[0.03] text-nexus-gray' : 'bg-gray-50 text-nexus-sub-light'}`}>
                No sweep executed yet.
              </p>
            )}
            {treasurySweeps.slice(0, 6).map(event => (
              <div key={event.id} className={`rounded-xl p-3 ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-semibold ${textMain}`}>{event.amountBch.toFixed(4)} BCH</p>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${event.trigger === 'auto' ? 'bg-nexus-cyan/15 text-nexus-cyan' : 'bg-nexus-green/15 text-nexus-green'}`}>
                    {event.trigger}
                  </span>
                </div>
                <p className={`mt-1 text-[10px] ${textSub}`}>
                  Hot: {event.hotWalletAfterBch.toFixed(4)} BCH | Cold: {event.coldWalletAfterBch.toFixed(4)} BCH
                </p>
                <p className={`mt-1 flex items-center gap-1 text-[10px] ${textSub}`}>
                  {event.trigger === 'auto' ? <Clock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                  {relativeTime(event.createdAt, now)}
                </p>
              </div>
            ))}
          </div>
          <div className={`mt-4 rounded-xl p-3 ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
            <p className={`text-xs ${textSub}`}>Projected auto-sweep right now</p>
            <p className={`mt-1 text-sm font-bold ${treasurySnapshot.projectedSweepAmountBch > 0 ? 'text-nexus-cyan' : textMain}`}>
              {treasurySnapshot.projectedSweepAmountBch.toFixed(4)} BCH
            </p>
            <p className={`mt-1 text-[10px] ${textSub}`}>
              {treasurySnapshot.projectedSweepAmountBch > 0
                ? 'Auto-sweep will move this amount on next confirmed payment.'
                : 'Enable auto-sweep and keep hot wallet above threshold to trigger automatic settlement.'}
            </p>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl p-4 ${cardBg}`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            {treasurySnapshot.autoMintEnabled ? (
              <CheckCircle2 className="h-4 w-4 text-nexus-green" />
            ) : (
              <XCircle className="h-4 w-4 text-nexus-red" />
            )}
            <p className={`text-xs font-semibold ${textMain}`}>Treasury Engine Status</p>
          </div>
          <p className={`text-xs ${textSub}`}>
            Mint queue: {pendingMintTransactions.length} | Sweepable now: {sweepableNow.toFixed(4)} BCH
          </p>
        </div>
      </div>
    </div>
  );
}
