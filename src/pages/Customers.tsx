import { useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDemoData, type DemoTransaction } from '../context/DemoDataContext';
import {
  Search,
  Star,
  TrendingUp,
  ShoppingBag,
  Coins,
  ArrowUpRight,
  Crown,
  Award,
  Medal,
  X,
  Copy,
} from 'lucide-react';

type TierFilter = 'All' | 'Gold' | 'Silver' | 'Bronze';
type CustomerTier = Exclude<TierFilter, 'All'>;

interface CustomerSnapshot {
  id: number;
  address: string;
  totalSpentBch: number;
  visits: number;
  tokens: number;
  lastVisitAt: number;
  tier: CustomerTier;
  trendPct: number;
  transactions: DemoTransaction[];
}

const tierConfig: Record<CustomerTier, { icon: typeof Crown; color: string; bg: string }> = {
  Gold: { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  Silver: { icon: Award, color: 'text-nexus-gray', bg: 'bg-white/5' },
  Bronze: { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-600/10' },
};

function txTimestamp(tx: DemoTransaction): number {
  const parsed = Date.parse(`${tx.date}T${tx.time}:00`);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function relativeTime(timestamp: number): string {
  const now = Date.now();
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return `${Math.floor(seconds / 604800)} weeks ago`;
}

function tierFromCustomer(visits: number, tokens: number, totalSpentBch: number): CustomerTier {
  if (visits >= 20 || tokens >= 800 || totalSpentBch >= 0.24) return 'Gold';
  if (visits >= 8 || tokens >= 300 || totalSpentBch >= 0.1) return 'Silver';
  return 'Bronze';
}

function trendForCustomer(transactions: DemoTransaction[]): number {
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const currentWindowStart = now - sevenDaysMs;
  const previousWindowStart = now - (sevenDaysMs * 2);
  const current = transactions.filter(tx => {
    const ts = txTimestamp(tx);
    return ts >= currentWindowStart;
  }).length;
  const previous = transactions.filter(tx => {
    const ts = txTimestamp(tx);
    return ts >= previousWindowStart && ts < currentWindowStart;
  }).length;
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function compactAddress(value: string): string {
  if (value.length <= 20) return value;
  return `${value.slice(0, 14)}...${value.slice(-4)}`;
}

export function Customers() {
  const { isDark } = useTheme();
  const { transactions, settings } = useDemoData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<TierFilter>('All');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const cardBg = 'neo-panel';
  const textMain = isDark ? 'text-white' : 'text-nexus-text-light';
  const textSub = isDark ? 'text-nexus-gray' : 'text-nexus-sub-light';

  const customers = useMemo<CustomerSnapshot[]>(() => {
    const grouped = new Map<string, DemoTransaction[]>();

    transactions
      .filter(tx => tx.status !== 'failed')
      .forEach(tx => {
        const key = tx.customer.trim().toLowerCase();
        const existing = grouped.get(key) ?? [];
        grouped.set(key, [...existing, tx]);
      });

    return [...grouped.entries()]
      .map(([_, txs], index) => {
        const ordered = [...txs].sort((left, right) => txTimestamp(right) - txTimestamp(left));
        const confirmed = ordered.filter(tx => tx.status === 'confirmed');
        const totalSpentBch = Number(confirmed.reduce((sum, tx) => sum + tx.bch, 0).toFixed(4));
        const visits = ordered.length;
        const tokens = ordered.reduce((sum, tx) => sum + tx.tokensGiven, 0);
        const lastVisitAt = txTimestamp(ordered[0]);
        const address = ordered[0]?.customer ?? '';
        const tier = tierFromCustomer(visits, tokens, totalSpentBch);
        const trendPct = trendForCustomer(ordered);
        return {
          id: index + 1,
          address,
          totalSpentBch,
          visits,
          tokens,
          lastVisitAt,
          tier,
          trendPct,
          transactions: ordered,
        };
      })
      .sort((left, right) => right.totalSpentBch - left.totalSpentBch);
  }, [transactions]);

  const filtered = useMemo(() => {
    return customers.filter(customer =>
      (selectedTier === 'All' || customer.tier === selectedTier) &&
      customer.address.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [customers, selectedTier, searchTerm]);

  const selectedCustomer = useMemo(() => {
    if (!selectedAddress) return null;
    return customers.find(customer => customer.address === selectedAddress) ?? null;
  }, [customers, selectedAddress]);

  const summary = useMemo(() => {
    const loyalCustomers = customers.filter(customer => customer.visits >= 5).length;
    const returningCustomers = customers.filter(customer => customer.visits > 1).length;
    const retentionRate = customers.length === 0 ? 0 : Math.round((returningCustomers / customers.length) * 100);
    const confirmedTransactions = transactions.filter(tx => tx.status === 'confirmed');
    const avgSpendBch = confirmedTransactions.length === 0
      ? 0
      : confirmedTransactions.reduce((sum, tx) => sum + tx.bch, 0) / confirmedTransactions.length;
    const activeTokens = customers.reduce((sum, customer) => sum + customer.tokens, 0);
    return {
      loyalCustomers,
      retentionRate,
      avgSpendBch,
      activeTokens,
    };
  }, [customers, transactions]);

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Star,
            label: 'Loyal Customers',
            value: summary.loyalCustomers.toString(),
            sub: '>= 5 visits',
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
          },
          {
            icon: TrendingUp,
            label: 'Retention Rate',
            value: `${summary.retentionRate}%`,
            sub: 'Returning customers',
            color: 'text-nexus-green',
            bg: 'bg-nexus-green/10',
          },
          {
            icon: ShoppingBag,
            label: 'Average Spend',
            value: `${summary.avgSpendBch.toFixed(4)} BCH`,
            sub: 'Per confirmed tx',
            color: 'text-nexus-cyan',
            bg: 'bg-nexus-cyan/10',
          },
          {
            icon: Coins,
            label: 'Active Tokens',
            value: summary.activeTokens.toLocaleString(),
            sub: `${settings.tokenName} in circulation`,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
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

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm ${
            isDark ? 'bg-white/5' : 'border border-nexus-border-light bg-white'
          }`}>
            <Search className="h-4 w-4 text-nexus-gray" />
            <input
              type="text"
              placeholder="Search wallet address..."
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              className={`w-56 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-nexus-gray' : 'text-nexus-text-light placeholder-nexus-sub-light'}`}
            />
          </div>
          <div className="flex gap-1">
            {(['All', 'Gold', 'Silver', 'Bronze'] as const).map(tier => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                  selectedTier === tier
                    ? 'bg-nexus-green/15 text-nexus-green'
                    : isDark
                      ? 'text-nexus-gray hover:bg-white/5'
                      : 'text-nexus-sub-light hover:bg-gray-100'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className={`rounded-2xl p-6 ${cardBg}`}>
          <p className={`text-sm font-semibold ${textMain}`}>No customer matched this filter.</p>
          <p className={`mt-1 text-xs ${textSub}`}>Complete transactions from checkout to generate customer profiles.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filtered.map((customer, index) => {
          const tier = tierConfig[customer.tier];
          const TierIcon = tier.icon;
          const trendPositive = customer.trendPct >= 0;

          return (
            <div key={customer.address} className={`rounded-2xl p-5 transition-all hover:scale-[1.01] ${cardBg}`}>
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-green to-nexus-cyan text-sm font-bold text-white">
                    #{index + 1}
                  </div>
                  <div>
                    <p className={`font-mono text-sm font-bold ${textMain}`}>{compactAddress(customer.address)}</p>
                    <p className={`text-[10px] ${textSub}`}>Last visit: {relativeTime(customer.lastVisitAt)}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold ${tier.bg} ${tier.color}`}>
                  <TierIcon className="h-3 w-3" />
                  {customer.tier}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                  <p className={`text-sm font-bold ${textMain}`}>{customer.totalSpentBch.toFixed(4)}</p>
                  <p className={`text-[10px] ${textSub}`}>Total BCH</p>
                </div>
                <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                  <p className={`text-sm font-bold ${textMain}`}>{customer.visits}</p>
                  <p className={`text-[10px] ${textSub}`}>Visits</p>
                </div>
                <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                  <p className="text-sm font-bold text-nexus-cyan">{customer.tokens}</p>
                  <p className={`text-[10px] ${textSub}`}>{settings.tokenName}</p>
                </div>
              </div>

              <div className={`mt-3 flex items-center justify-between border-t pt-3 ${isDark ? 'border-white/5' : 'border-nexus-border-light'}`}>
                <div className={`flex items-center gap-1 text-xs font-semibold ${trendPositive ? 'text-nexus-green' : 'text-nexus-red'}`}>
                  <TrendingUp className={`h-3 w-3 ${trendPositive ? '' : 'rotate-180'}`} />
                  {trendPositive ? '+' : ''}{customer.trendPct.toFixed(0)}% activity
                </div>
                <button
                  onClick={() => setSelectedAddress(customer.address)}
                  className="flex items-center gap-1 text-xs font-semibold text-nexus-cyan hover:underline cursor-pointer"
                >
                  Details <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={() => setSelectedAddress(null)}>
          <div
            className={`w-full max-w-2xl rounded-2xl p-5 ${cardBg}`}
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${textSub}`}>Customer Profile</p>
                <h3 className={`font-mono text-sm font-bold ${textMain}`}>{selectedCustomer.address}</h3>
                <p className={`text-xs ${textSub}`}>{selectedCustomer.transactions.length} transactions</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyAddress(selectedCustomer.address)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold cursor-pointer ${
                    copied ? 'bg-nexus-green/15 text-nexus-green' : isDark ? 'bg-white/10 text-nexus-gray' : 'bg-gray-100 text-nexus-sub-light'
                  }`}
                >
                  <Copy className="h-3 w-3" /> {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={() => setSelectedAddress(null)}
                  className={`rounded-lg p-1.5 cursor-pointer ${isDark ? 'bg-white/10 text-nexus-gray' : 'bg-gray-100 text-nexus-sub-light'}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className={`rounded-xl p-3 ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                <p className={`text-[10px] ${textSub}`}>Total BCH</p>
                <p className={`text-sm font-bold ${textMain}`}>{selectedCustomer.totalSpentBch.toFixed(4)} BCH</p>
              </div>
              <div className={`rounded-xl p-3 ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                <p className={`text-[10px] ${textSub}`}>Total Visits</p>
                <p className={`text-sm font-bold ${textMain}`}>{selectedCustomer.visits}</p>
              </div>
              <div className={`rounded-xl p-3 ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                <p className={`text-[10px] ${textSub}`}>Reward Tokens</p>
                <p className="text-sm font-bold text-nexus-cyan">{selectedCustomer.tokens} {settings.tokenName}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <p className={`text-xs font-semibold ${textMain}`}>Latest Transactions</p>
              {selectedCustomer.transactions.slice(0, 6).map(tx => (
                <div key={tx.id} className={`flex items-center justify-between rounded-xl p-2.5 ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                  <div>
                    <p className={`font-mono text-xs font-semibold ${textMain}`}>{tx.id}</p>
                    <p className={`text-[10px] ${textSub}`}>{tx.date} {tx.time} | {tx.status}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-semibold ${textMain}`}>{tx.bch.toFixed(4)} BCH</p>
                    <p className={`text-[10px] ${textSub}`}>+{tx.tokensGiven} {settings.tokenName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
