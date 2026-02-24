import { useTheme } from '../context/ThemeContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Coins, Send, ArrowDownToLine, Shield, Flame, TrendingUp, AlertTriangle, Wallet } from 'lucide-react';
import { BCH_TO_USD, formatUsd } from '../utils/currency';

const supplyHistory = [
  { day: 'Jan 1', supply: 100000, distributed: 0 },
  { day: 'Jan 5', supply: 95000, distributed: 5000 },
  { day: 'Jan 8', supply: 88000, distributed: 12000 },
  { day: 'Jan 11', supply: 78000, distributed: 22000 },
  { day: 'Jan 13', supply: 65000, distributed: 35000 },
  { day: 'Jan 15', supply: 55000, distributed: 45000 },
];

const recentMints = [
  { address: 'qz3f...8a2c', amount: 46, tx: 'TX-0042', time: '2 min ago' },
  { address: 'qp7b...1d4e', amount: 21, tx: 'TX-0041', time: '8 min ago' },
  { address: 'qc8m...2e7a', amount: 40, tx: 'TX-0039', time: '25 min ago' },
  { address: 'qe9k...7b5d', amount: 56, tx: 'TX-0037', time: '45 min ago' },
  { address: 'qf2n...3a8e', amount: 38, tx: 'TX-0036', time: '1 hour ago' },
];

export function Treasury() {
  const { isDark } = useTheme();
  const cardBg = 'neo-panel';
  const textMain = isDark ? 'text-white' : 'text-nexus-text-light';
  const textSub = isDark ? 'text-nexus-gray' : 'text-nexus-sub-light';
  const hotWalletBch = 0.842;
  const hotWalletUsd = hotWalletBch * BCH_TO_USD;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Coins, label: 'Total Supply', value: '100,000', sub: '$NEXUS Points', color: 'text-nexus-green', bg: 'bg-nexus-green/10' },
          { icon: Send, label: 'Distributed', value: '45,000', sub: '45% of supply', color: 'text-nexus-cyan', bg: 'bg-nexus-cyan/10' },
          { icon: Shield, label: 'Available', value: '35,000', sub: 'Ready to mint', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { icon: Flame, label: 'Burned', value: '20,000', sub: '20% destroyed', color: 'text-nexus-red', bg: 'bg-nexus-red/10' },
        ].map((item, i) => (
          <div key={i} className={`rounded-2xl p-5 ${cardBg}`}>
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
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-nexus-green/10">
              <Wallet className="h-6 w-6 text-nexus-green" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${textMain}`}>Settlement and Sweeping</h3>
              <p className={`text-sm ${textSub}`}>Hot wallet balance: <span className="font-bold text-nexus-green">{hotWalletBch} BCH</span> (~ {formatUsd(hotWalletUsd)})</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-xl bg-nexus-green px-5 py-3 text-sm font-bold text-white shadow-lg shadow-nexus-green/20 transition-all hover:bg-nexus-green-dark cursor-pointer">
              <ArrowDownToLine className="h-4 w-4" /> Sweep to Cold Wallet
            </button>
          </div>
        </div>
        <div className={`mt-4 flex items-center gap-3 rounded-xl p-3 ${isDark ? 'border border-yellow-500/10 bg-yellow-500/5' : 'border border-yellow-200 bg-yellow-50'}`}>
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-400" />
          <p className="text-xs text-yellow-500">Recommendation: sweep BCH to cold wallet when balance exceeds 1 BCH for stronger security.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={`rounded-2xl p-5 ${cardBg}`}>
          <h3 className={`mb-1 font-bold ${textMain}`}>Supply Trend</h3>
          <p className={`mb-4 text-xs ${textSub}`}>Supply decline during distribution</p>
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
              <p className={`text-xs ${textSub}`}>Latest token transfers</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-nexus-green/15 px-2.5 py-1 text-[10px] font-bold text-nexus-green">
              <TrendingUp className="h-3 w-3" /> Auto-mint ON
            </div>
          </div>
          <div className="space-y-3">
            {recentMints.map((mint, i) => (
              <div key={i} className={`flex items-center justify-between rounded-xl p-3 ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-nexus-cyan/10">
                    <Coins className="h-4 w-4 text-nexus-cyan" />
                  </div>
                  <div>
                    <p className={`font-mono text-xs font-semibold ${textMain}`}>{mint.address}</p>
                    <p className={`text-[10px] ${textSub}`}>{mint.tx} | {mint.time}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-nexus-green">+{mint.amount} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
