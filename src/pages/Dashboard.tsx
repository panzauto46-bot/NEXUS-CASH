import { useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDemoData, type DemoTransaction } from '../context/DemoDataContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, Coins, Receipt, Users, Wallet, type LucideIcon } from 'lucide-react';

type TrendWindow = 'daily' | 'weekly' | 'monthly';

interface ParsedTransaction extends DemoTransaction {
  timestamp: Date;
}

interface TrendPoint {
  label: string;
  bch: number;
  fiat: number;
}

function toLocalDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseTransactionTimestamp(tx: DemoTransaction): Date {
  const parsed = new Date(`${tx.date}T${tx.time}:00`);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return new Date(`${tx.date}T00:00:00`);
}

function startOfDay(value: Date): Date {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(value: Date, amount: number): Date {
  const next = new Date(value);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfWeek(value: Date): Date {
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return startOfDay(addDays(value, diff));
}

function sumBch(transactions: ParsedTransaction[]): number {
  return Number(transactions.reduce((total, tx) => total + tx.bch, 0).toFixed(4));
}

function sumTokens(transactions: ParsedTransaction[]): number {
  return transactions.reduce((total, tx) => total + tx.tokensGiven, 0);
}

function uniqueCustomers(transactions: ParsedTransaction[]): number {
  return new Set(transactions.map(tx => tx.customer)).size;
}

function computeChangePct(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

function pctLabel(value: number): string {
  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

function buildTrendData(transactions: ParsedTransaction[], window: TrendWindow): TrendPoint[] {
  const now = new Date();
  const today = startOfDay(now);

  if (window === 'daily') {
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(today, index - 6);
      const nextDate = addDays(date, 1);
      const bucket = transactions.filter(tx => tx.timestamp >= date && tx.timestamp < nextDate);
      return {
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        bch: Number(bucket.reduce((sum, tx) => sum + tx.bch, 0).toFixed(4)),
        fiat: Number(bucket.reduce((sum, tx) => sum + tx.fiat, 0).toFixed(2)),
      };
    });
  }

  if (window === 'weekly') {
    const currentWeekStart = startOfWeek(now);
    return Array.from({ length: 6 }, (_, index) => {
      const weekStart = addDays(currentWeekStart, (index - 5) * 7);
      const weekEnd = addDays(weekStart, 7);
      const bucket = transactions.filter(tx => tx.timestamp >= weekStart && tx.timestamp < weekEnd);
      return {
        label: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bch: Number(bucket.reduce((sum, tx) => sum + tx.bch, 0).toFixed(4)),
        fiat: Number(bucket.reduce((sum, tx) => sum + tx.fiat, 0).toFixed(2)),
      };
    });
  }

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(monthStart.getFullYear(), monthStart.getMonth() + index - 5, 1);
    const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const bucket = transactions.filter(tx => tx.timestamp >= date && tx.timestamp < nextDate);
    return {
      label: date.toLocaleDateString('en-US', { month: 'short' }),
      bch: Number(bucket.reduce((sum, tx) => sum + tx.bch, 0).toFixed(4)),
      fiat: Number(bucket.reduce((sum, tx) => sum + tx.fiat, 0).toFixed(2)),
    };
  });
}

function buildHourlyData(transactions: ParsedTransaction[]) {
  const today = toLocalDate(new Date());
  const hours = Array.from({ length: 13 }, (_, index) => 8 + index);

  return hours.map(hour => {
    const count = transactions.filter(tx => {
      if (toLocalDate(tx.timestamp) !== today) return false;
      return tx.timestamp.getHours() === hour;
    }).length;

    return { hour: String(hour).padStart(2, '0'), tx: count };
  });
}

function StatCard({ icon: Icon, label, value, change, positive, isDark, delay }: {
  icon: LucideIcon;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  isDark: boolean;
  delay: number;
}) {
  return (
    <div className="neo-panel neo-cut p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-nexus-green/15">
            <Icon className="h-5 w-5 text-nexus-green" />
          </span>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-nexus-gray' : 'text-nexus-sub-light'}`}>
            {label}
          </p>
        </div>
        <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold
          ${positive ? 'bg-nexus-green/15 text-nexus-green' : 'bg-nexus-red/15 text-nexus-red'}
        `}>
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {change}
        </div>
      </div>
      <p className={`mt-4 text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-nexus-text-light'}`}>{value}</p>
      <p className={`mt-1 text-xs ${isDark ? 'text-nexus-gray' : 'text-nexus-sub-light'}`}>
        Live demo metrics from transaction stream
      </p>
    </div>
  );
}

export function Dashboard({ onOpenTransactions }: { onOpenTransactions?: () => void } = {}) {
  const { isDark } = useTheme();
  const { transactions, dashboardMetrics } = useDemoData();
  const [trendWindow, setTrendWindow] = useState<TrendWindow>('daily');
  const textMain = isDark ? 'text-white' : 'text-nexus-text-light';
  const textSub = isDark ? 'text-nexus-gray' : 'text-nexus-sub-light';
  const chartGrid = isDark ? '#2a3f42' : '#9fc3ba';

  const parsedTransactions = useMemo<ParsedTransaction[]>(
    () => transactions
      .map(tx => ({ ...tx, timestamp: parseTransactionTimestamp(tx) }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [transactions],
  );

  const trendData = useMemo(
    () => buildTrendData(parsedTransactions, trendWindow),
    [parsedTransactions, trendWindow],
  );

  const hourlyData = useMemo(
    () => buildHourlyData(parsedTransactions),
    [parsedTransactions],
  );

  const weeklyComparative = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const previousWeekStart = addDays(weekStart, -7);
    const previousWeekEnd = weekStart;
    const weekEnd = addDays(weekStart, 7);

    const current = parsedTransactions.filter(tx => tx.timestamp >= weekStart && tx.timestamp < weekEnd);
    const previous = parsedTransactions.filter(tx => tx.timestamp >= previousWeekStart && tx.timestamp < previousWeekEnd);

    return {
      currentBch: sumBch(current),
      previousBch: sumBch(previous),
      currentCount: current.length,
      previousCount: previous.length,
      currentMinted: sumTokens(current),
      previousMinted: sumTokens(previous),
      currentActiveCustomers: uniqueCustomers(current),
      previousActiveCustomers: uniqueCustomers(previous),
    };
  }, [parsedTransactions]);

  const bchChange = computeChangePct(weeklyComparative.currentBch, weeklyComparative.previousBch);
  const txChange = computeChangePct(weeklyComparative.currentCount, weeklyComparative.previousCount);
  const tokenChange = computeChangePct(weeklyComparative.currentMinted, weeklyComparative.previousMinted);
  const customerChange = computeChangePct(weeklyComparative.currentActiveCustomers, weeklyComparative.previousActiveCustomers);

  const tokenDistribution = useMemo(() => {
    const totalSupply = 100_000;
    const burned = 20_000;
    const distributed = dashboardMetrics.mintedTokens;
    const available = Math.max(totalSupply - burned - distributed, 0);
    return [
      { name: 'Distributed', value: distributed, color: '#0AC18E' },
      { name: 'Available', value: available, color: '#00E5FF' },
      { name: 'Burned', value: burned, color: '#FF4C4C' },
    ];
  }, [dashboardMetrics.mintedTokens]);

  const recentTransactions = parsedTransactions.slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="neo-page-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Total BCH This Week"
          value={`${weeklyComparative.currentBch.toFixed(4)} BCH`}
          change={pctLabel(bchChange)}
          positive={bchChange >= 0}
          isDark={isDark}
          delay={0}
        />
        <StatCard
          icon={Receipt}
          label="Total Transactions"
          value={weeklyComparative.currentCount.toString()}
          change={pctLabel(txChange)}
          positive={txChange >= 0}
          isDark={isDark}
          delay={80}
        />
        <StatCard
          icon={Coins}
          label="CashTokens Minted"
          value={weeklyComparative.currentMinted.toLocaleString()}
          change={pctLabel(tokenChange)}
          positive={tokenChange >= 0}
          isDark={isDark}
          delay={140}
        />
        <StatCard
          icon={Users}
          label="Active Customers"
          value={weeklyComparative.currentActiveCustomers.toString()}
          change={pctLabel(customerChange)}
          positive={customerChange >= 0}
          isDark={isDark}
          delay={200}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="neo-panel neo-cut p-5 xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className={`font-bold ${textMain}`}>BCH Volume Trend</h3>
              <p className={`text-xs ${textSub}`}>Live aggregate from transaction feed</p>
            </div>
            <div className="flex gap-1">
              {(['daily', 'weekly', 'monthly'] as const).map(label => (
                <button
                  key={label}
                  onClick={() => setTrendWindow(label)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer
                    ${trendWindow === label ? 'bg-nexus-green/15 text-nexus-green' : isDark ? 'text-nexus-gray hover:bg-white/8' : 'text-nexus-sub-light hover:bg-white/60'}
                  `}
                >
                  {label[0].toUpperCase() + label.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="bchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0AC18E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0AC18E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={chartGrid} />
              <XAxis dataKey="label" tick={{ fill: isDark ? '#A0AAB2' : '#23474b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: isDark ? '#A0AAB2' : '#23474b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: isDark ? '#13272a' : '#f7fffc',
                  border: isDark ? '1px solid rgba(136, 193, 180, 0.25)' : '1px solid #9bc8bc',
                  borderRadius: '12px',
                  color: isDark ? '#fff' : '#1a202c',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="bch" stroke="#0AC18E" fill="url(#bchGrad)" strokeWidth={2.5} dot={{ fill: '#0AC18E', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="neo-panel p-5">
          <h3 className={`mb-1 font-bold ${textMain}`}>Token Distribution</h3>
          <p className={`mb-4 text-xs ${textSub}`}>Computed from live minted points</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={tokenDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" stroke="none">
                {tokenDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: isDark ? '#13272a' : '#f7fffc',
                  border: isDark ? '1px solid rgba(136, 193, 180, 0.25)' : '1px solid #9bc8bc',
                  borderRadius: '12px',
                  color: isDark ? '#fff' : '#1a202c',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-2">
            {tokenDistribution.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                  <span className={textSub}>{item.name}</span>
                </div>
                <span className={`font-semibold ${textMain}`}>{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="neo-panel p-5">
          <h3 className={`mb-1 font-bold ${textMain}`}>Hourly Transactions</h3>
          <p className={`mb-4 text-xs ${textSub}`}>Today (08:00 - 20:00)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="4 4" stroke={chartGrid} />
              <XAxis dataKey="hour" tick={{ fill: isDark ? '#A0AAB2' : '#23474b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: isDark ? '#A0AAB2' : '#23474b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: isDark ? '#13272a' : '#f7fffc',
                  border: isDark ? '1px solid rgba(136, 193, 180, 0.25)' : '1px solid #9bc8bc',
                  borderRadius: '12px',
                  color: isDark ? '#fff' : '#1a202c',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="tx" fill="#00E5FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="neo-panel neo-cut p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className={`font-bold ${textMain}`}>Latest Transactions</h3>
              <p className={`text-xs ${textSub}`}>5 most recent transactions</p>
            </div>
            <button
              onClick={() => onOpenTransactions?.()}
              className="flex items-center gap-1 text-xs font-semibold text-nexus-green hover:underline cursor-pointer"
            >
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/5' : 'border-nexus-border-light'}`}>
                  {['ID', 'Customer', 'Items', 'BCH', 'Status', 'Time'].map(header => (
                    <th key={header} className={`py-2.5 text-left font-semibold ${textSub}`}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map(tx => (
                  <tr key={tx.id} className={`neo-table-row border-b ${isDark ? 'border-white/5' : 'border-nexus-border-light'} last:border-0`}>
                    <td className={`py-3 font-mono font-semibold ${textMain}`}>{tx.id}</td>
                    <td className="py-3 font-mono text-nexus-cyan">{tx.customer}</td>
                    <td className={`py-3 ${textSub}`}>{tx.items.length} items</td>
                    <td className={`py-3 font-semibold ${textMain}`}>{tx.bch} BCH</td>
                    <td className="py-3">
                      <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase
                        ${tx.status === 'confirmed' ? 'bg-nexus-green/15 text-nexus-green' :
                          tx.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400' :
                            'bg-nexus-red/15 text-nexus-red'}
                      `}>
                        {tx.status}
                      </span>
                    </td>
                    <td className={`py-3 ${textSub}`}>{tx.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
