import { useTheme } from '../context/ThemeContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, Coins, Receipt, Users, Wallet, type LucideIcon } from 'lucide-react';

const revenueData = [
  { day: 'Mon', bch: 0.42, fiat: 126 },
  { day: 'Tue', bch: 0.68, fiat: 204 },
  { day: 'Wed', bch: 0.55, fiat: 165 },
  { day: 'Thu', bch: 0.91, fiat: 273 },
  { day: 'Fri', bch: 1.23, fiat: 369 },
  { day: 'Sat', bch: 1.56, fiat: 468 },
  { day: 'Sun', bch: 1.12, fiat: 336 },
];

const hourlyData = [
  { hour: '08', tx: 4 }, { hour: '09', tx: 8 }, { hour: '10', tx: 12 },
  { hour: '11', tx: 18 }, { hour: '12', tx: 25 }, { hour: '13', tx: 22 },
  { hour: '14', tx: 15 }, { hour: '15', tx: 19 }, { hour: '16', tx: 23 },
  { hour: '17', tx: 28 }, { hour: '18', tx: 20 }, { hour: '19', tx: 14 },
  { hour: '20', tx: 8 },
];

const tokenDistribution = [
  { name: 'Distributed', value: 45000, color: '#0AC18E' },
  { name: 'Available', value: 35000, color: '#00E5FF' },
  { name: 'Burned', value: 20000, color: '#FF4C4C' },
];

const recentTransactions = [
  { id: 'TX-0042', customer: '0x3f...8a2c', items: 3, bch: 0.0245, status: 'confirmed', time: '2 min ago' },
  { id: 'TX-0041', customer: '0x7b...1d4e', items: 1, bch: 0.0089, status: 'confirmed', time: '8 min ago' },
  { id: 'TX-0040', customer: '0xa1...9f3b', items: 5, bch: 0.0512, status: 'pending', time: '12 min ago' },
  { id: 'TX-0039', customer: '0xc8...2e7a', items: 2, bch: 0.0178, status: 'confirmed', time: '25 min ago' },
  { id: 'TX-0038', customer: '0x5d...4c1f', items: 4, bch: 0.0367, status: 'failed', time: '32 min ago' },
];

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
        Weekly performance status
      </p>
    </div>
  );
}

export function Dashboard() {
  const { isDark } = useTheme();
  const textMain = isDark ? 'text-white' : 'text-nexus-text-light';
  const textSub = isDark ? 'text-nexus-gray' : 'text-nexus-sub-light';
  const chartGrid = isDark ? '#2a3f42' : '#9fc3ba';

  return (
    <div className="space-y-5">
      <div className="neo-page-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wallet} label="Total BCH This Week" value="6.47 BCH" change="+23.5%" positive={true} isDark={isDark} delay={0} />
        <StatCard icon={Receipt} label="Total Transactions" value="156" change="+12.3%" positive={true} isDark={isDark} delay={80} />
        <StatCard icon={Coins} label="CashTokens Minted" value="4,680" change="+8.7%" positive={true} isDark={isDark} delay={140} />
        <StatCard icon={Users} label="Active Customers" value="89" change="-2.1%" positive={false} isDark={isDark} delay={200} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="neo-panel neo-cut p-5 xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className={`font-bold ${textMain}`}>Daily BCH Volume</h3>
              <p className={`text-xs ${textSub}`}>Trend over the last 7 days</p>
            </div>
            <div className="flex gap-1">
              {['Daily', 'Weekly', 'Monthly'].map((label, i) => (
                <button
                  key={label}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer
                    ${i === 0 ? 'bg-nexus-green/15 text-nexus-green' : isDark ? 'text-nexus-gray hover:bg-white/8' : 'text-nexus-sub-light hover:bg-white/60'}
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="bchGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0AC18E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0AC18E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={chartGrid} />
              <XAxis dataKey="day" tick={{ fill: isDark ? '#A0AAB2' : '#23474b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: isDark ? '#A0AAB2' : '#23474b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: isDark ? '#13272a' : '#f7fffc',
                  border: isDark ? '1px solid rgba(136, 193, 180, 0.25)' : '1px solid #9bc8bc',
                  borderRadius: '12px',
                  color: isDark ? '#fff' : '#1a202c',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="bch" stroke="#0AC18E" fill="url(#bchGrad)" strokeWidth={2.5} dot={{ fill: '#0AC18E', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="neo-panel p-5">
          <h3 className={`mb-1 font-bold ${textMain}`}>Token Distribution</h3>
          <p className={`mb-4 text-xs ${textSub}`}>$NEXUS points supply</p>
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
                  fontSize: '12px'
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
          <p className={`mb-4 text-xs ${textSub}`}>Today</p>
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
                  fontSize: '12px'
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
            <button className="flex items-center gap-1 text-xs font-semibold text-nexus-green hover:underline cursor-pointer">
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
                    <td className={`py-3 ${textSub}`}>{tx.items} items</td>
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
