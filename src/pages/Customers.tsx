import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Search, Star, TrendingUp, ShoppingBag, Coins, ArrowUpRight, Crown, Award, Medal } from 'lucide-react';

const customers = [
  { id: 1, address: 'bitcoincash:qz3f...8a2c', totalSpent: 0.342, visits: 28, tokens: 1026, lastVisit: '2 hours ago', tier: 'Gold', trend: '+15%' },
  { id: 2, address: 'bitcoincash:qp7b...1d4e', totalSpent: 0.287, visits: 22, tokens: 861, lastVisit: '1 day ago', tier: 'Gold', trend: '+8%' },
  { id: 3, address: 'bitcoincash:qa1x...9f3b', totalSpent: 0.198, visits: 15, tokens: 594, lastVisit: '3 hours ago', tier: 'Silver', trend: '+22%' },
  { id: 4, address: 'bitcoincash:qc8m...2e7a', totalSpent: 0.156, visits: 12, tokens: 468, lastVisit: '5 hours ago', tier: 'Silver', trend: '+5%' },
  { id: 5, address: 'bitcoincash:q5dr...4c1f', totalSpent: 0.134, visits: 10, tokens: 402, lastVisit: '2 days ago', tier: 'Silver', trend: '-3%' },
  { id: 6, address: 'bitcoincash:qe9k...7b5d', totalSpent: 0.098, visits: 7, tokens: 294, lastVisit: '4 days ago', tier: 'Bronze', trend: '+12%' },
  { id: 7, address: 'bitcoincash:qf2n...3a8e', totalSpent: 0.076, visits: 5, tokens: 228, lastVisit: '1 week ago', tier: 'Bronze', trend: '+2%' },
  { id: 8, address: 'bitcoincash:qg6p...9d2c', totalSpent: 0.045, visits: 3, tokens: 135, lastVisit: '2 weeks ago', tier: 'Bronze', trend: '-8%' },
];

const tierConfig: Record<string, { icon: typeof Crown; color: string; bg: string }> = {
  Gold: { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  Silver: { icon: Award, color: 'text-nexus-gray', bg: 'bg-white/5' },
  Bronze: { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-600/10' },
};

export function Customers() {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');

  const cardBg = 'neo-panel';
  const textMain = isDark ? 'text-white' : 'text-nexus-text-light';
  const textSub = isDark ? 'text-nexus-gray' : 'text-nexus-sub-light';

  const filtered = customers.filter(c =>
    (selectedTier === 'All' || c.tier === selectedTier) &&
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Star, label: 'Loyal Customers', value: '34', sub: '>5 visits', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { icon: TrendingUp, label: 'Retention Rate', value: '72%', sub: '+5% vs last month', color: 'text-nexus-green', bg: 'bg-nexus-green/10' },
          { icon: ShoppingBag, label: 'Average Spend', value: '0.021 BCH', sub: 'Per transaction', color: 'text-nexus-cyan', bg: 'bg-nexus-cyan/10' },
          { icon: Coins, label: 'Active Tokens', value: '3,879', sub: 'Not redeemed yet', color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl p-5 ${cardBg}`}>
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className={`text-2xl font-bold ${textMain}`}>{s.value}</p>
            <p className={`mt-0.5 text-xs ${textSub}`}>{s.label}</p>
            <p className={`mt-1 text-[10px] font-medium ${s.color}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm
            ${isDark ? 'bg-white/5' : 'border border-nexus-border-light bg-white'}
          `}>
            <Search className="h-4 w-4 text-nexus-gray" />
            <input
              type="text"
              placeholder="Search wallet address..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-56 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-nexus-gray' : 'text-nexus-text-light placeholder-nexus-sub-light'}`}
            />
          </div>
          <div className="flex gap-1">
            {['All', 'Gold', 'Silver', 'Bronze'].map(tier => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-all cursor-pointer
                  ${selectedTier === tier ? 'bg-nexus-green/15 text-nexus-green' : isDark ? 'text-nexus-gray hover:bg-white/5' : 'text-nexus-sub-light hover:bg-gray-100'}
                `}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filtered.map(customer => {
          const tier = tierConfig[customer.tier];
          const TierIcon = tier.icon;
          return (
            <div key={customer.id} className={`rounded-2xl p-5 transition-all hover:scale-[1.01] ${cardBg}`}>
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-green to-nexus-cyan text-sm font-bold text-white">
                    #{customer.id}
                  </div>
                  <div>
                    <p className={`font-mono text-sm font-bold ${textMain}`}>{customer.address}</p>
                    <p className={`text-[10px] ${textSub}`}>Last visit: {customer.lastVisit}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold ${tier.bg} ${tier.color}`}>
                  <TierIcon className="h-3 w-3" />
                  {customer.tier}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                  <p className={`text-sm font-bold ${textMain}`}>{customer.totalSpent}</p>
                  <p className={`text-[10px] ${textSub}`}>Total BCH</p>
                </div>
                <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                  <p className={`text-sm font-bold ${textMain}`}>{customer.visits}</p>
                  <p className={`text-[10px] ${textSub}`}>Visits</p>
                </div>
                <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                  <p className="text-sm font-bold text-nexus-cyan">{customer.tokens}</p>
                  <p className={`text-[10px] ${textSub}`}>$NEXUS</p>
                </div>
              </div>

              <div className={`mt-3 flex items-center justify-between border-t pt-3 ${isDark ? 'border-white/5' : 'border-nexus-border-light'}`}>
                <div className={`flex items-center gap-1 text-xs font-semibold ${customer.trend.startsWith('+') ? 'text-nexus-green' : 'text-nexus-red'}`}>
                  <TrendingUp className="h-3 w-3" />
                  {customer.trend} activity
                </div>
                <button className="flex items-center gap-1 text-xs font-semibold text-nexus-cyan hover:underline cursor-pointer">
                  Details <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
