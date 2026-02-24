import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Search, Filter, Download, ExternalLink, QrCode, Copy, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatUsd } from '../utils/currency';

const transactions = [
  { id: 'TX-0042', customer: 'bitcoincash:qz3f...8a2c', items: ['Americano Coffee x2', 'Butter Croissant x1'], bch: 0.0152, fiat: 4.56, status: 'confirmed', time: '14:32', date: '2024-01-15', nftMinted: true, tokensGiven: 46, blockHeight: 831204 },
  { id: 'TX-0041', customer: 'bitcoincash:qp7b...1d4e', items: ['Matcha Latte x1'], bch: 0.0071, fiat: 2.13, status: 'confirmed', time: '14:24', date: '2024-01-15', nftMinted: true, tokensGiven: 21, blockHeight: 831203 },
  { id: 'TX-0040', customer: 'bitcoincash:qa1x...9f3b', items: ['Classic Burger x1', 'Fresh Orange Juice x2', 'Carbonara Pasta x1', 'Cheesecake Slice x1'], bch: 0.0328, fiat: 9.84, status: 'pending', time: '14:18', date: '2024-01-15', nftMinted: false, tokensGiven: 0, blockHeight: null },
  { id: 'TX-0039', customer: 'bitcoincash:qc8m...2e7a', items: ['Special Fried Rice x1', 'Americano Coffee x1'], bch: 0.0134, fiat: 4.02, status: 'confirmed', time: '13:55', date: '2024-01-15', nftMinted: true, tokensGiven: 40, blockHeight: 831201 },
  { id: 'TX-0038', customer: 'bitcoincash:q5dr...4c1f', items: ['Carbonara Pasta x2'], bch: 0.0214, fiat: 6.42, status: 'failed', time: '13:42', date: '2024-01-15', nftMinted: false, tokensGiven: 0, blockHeight: null },
  { id: 'TX-0037', customer: 'bitcoincash:qe9k...7b5d', items: ['Cheesecake Slice x3'], bch: 0.0186, fiat: 5.58, status: 'confirmed', time: '13:15', date: '2024-01-15', nftMinted: true, tokensGiven: 56, blockHeight: 831198 },
  { id: 'TX-0036', customer: 'bitcoincash:qf2n...3a8e', items: ['Americano Coffee x1', 'Matcha Latte x1'], bch: 0.0127, fiat: 3.81, status: 'confirmed', time: '12:48', date: '2024-01-15', nftMinted: true, tokensGiven: 38, blockHeight: 831195 },
  { id: 'TX-0035', customer: 'bitcoincash:qg6p...9d2c', items: ['Classic Burger x2', 'Fresh Orange Juice x2'], bch: 0.0274, fiat: 8.22, status: 'confirmed', time: '12:20', date: '2024-01-15', nftMinted: true, tokensGiven: 82, blockHeight: 831192 },
];

export function Transactions() {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  const cardBg = 'neo-panel';
  const textMain = isDark ? 'text-white' : 'text-nexus-text-light';
  const textSub = isDark ? 'text-nexus-gray' : 'text-nexus-sub-light';

  const filtered = transactions.filter(tx =>
    (statusFilter === 'all' || tx.status === statusFilter) &&
    (tx.id.toLowerCase().includes(searchTerm.toLowerCase()) || tx.customer.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalTodayFiat = transactions.reduce((sum, tx) => sum + tx.fiat, 0);

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'confirmed') return <CheckCircle2 className="h-4 w-4 text-nexus-green" />;
    if (status === 'pending') return <Clock className="h-4 w-4 text-yellow-400" />;
    return <XCircle className="h-4 w-4 text-nexus-red" />;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Today', value: '0.1486 BCH', sub: formatUsd(totalTodayFiat) },
          { label: 'Successful Transactions', value: '6', sub: '75% success rate' },
          { label: 'Receipt NFTs Minted', value: '6', sub: 'Today' },
          { label: 'Tokens Distributed', value: '283', sub: '$NEXUS Points' },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl p-4 ${cardBg}`}>
            <p className={`text-xs font-medium ${textSub}`}>{s.label}</p>
            <p className={`mt-1 text-xl font-bold ${textMain}`}>{s.value}</p>
            <p className={`mt-0.5 text-[10px] ${textSub}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className={`flex flex-col items-start justify-between gap-3 rounded-2xl p-4 sm:flex-row sm:items-center ${cardBg}`}>
        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm
            ${isDark ? 'bg-white/5' : 'border border-nexus-border-light bg-gray-50'}
          `}>
            <Search className="h-4 w-4 text-nexus-gray" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-48 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-nexus-gray' : 'text-nexus-text-light placeholder-nexus-sub-light'}`}
            />
          </div>
          <div className="flex gap-1">
            {['all', 'confirmed', 'pending', 'failed'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-xl px-3 py-2 text-xs font-medium capitalize transition-all cursor-pointer
                  ${statusFilter === s ? 'bg-nexus-green/15 text-nexus-green' : isDark ? 'text-nexus-gray hover:bg-white/5' : 'text-nexus-sub-light hover:bg-gray-100'}
                `}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium cursor-pointer ${isDark ? 'bg-white/5 text-nexus-gray' : 'border border-nexus-border-light bg-gray-50 text-nexus-sub-light'}`}>
            <Filter className="h-3.5 w-3.5" /> Advanced Filter
          </button>
          <button className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium cursor-pointer ${isDark ? 'bg-white/5 text-nexus-gray' : 'border border-nexus-border-light bg-gray-50 text-nexus-sub-light'}`}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(tx => (
          <div
            key={tx.id}
            onClick={() => setSelectedTx(selectedTx === tx.id ? null : tx.id)}
            className={`rounded-2xl p-4 transition-all duration-300 hover:scale-[1.005] cursor-pointer ${cardBg}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <StatusIcon status={tx.status} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-sm font-bold ${textMain}`}>{tx.id}</span>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase
                      ${tx.status === 'confirmed' ? 'bg-nexus-green/15 text-nexus-green' :
                        tx.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400' :
                          'bg-nexus-red/15 text-nexus-red'}
                    `}>
                      {tx.status}
                    </span>
                  </div>
                  <p className={`mt-0.5 font-mono text-xs ${textSub}`}>{tx.customer}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${textMain}`}>{tx.bch} BCH</p>
                <p className={`text-xs ${textSub}`}>{formatUsd(tx.fiat)}</p>
              </div>
            </div>

            {selectedTx === tx.id && (
              <div className={`mt-4 border-t pt-4 ${isDark ? 'border-white/5' : 'border-nexus-border-light'}`}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${textSub}`}>Items</p>
                    <div className="space-y-1">
                      {tx.items.map((item, i) => (
                        <p key={i} className={`text-xs ${textMain}`}>{item}</p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${textSub}`}>Details</p>
                    <div className="space-y-1 text-xs">
                      <p className={textSub}>Date: <span className={textMain}>{tx.date}</span></p>
                      <p className={textSub}>Time: <span className={textMain}>{tx.time}</span></p>
                      {tx.blockHeight && <p className={textSub}>Block: <span className="text-nexus-cyan">#{tx.blockHeight}</span></p>}
                    </div>
                  </div>
                  <div>
                    <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${textSub}`}>CashTokens</p>
                    <div className="space-y-1 text-xs">
                      <p className={textSub}>Receipt NFT: <span className={tx.nftMinted ? 'text-nexus-green' : 'text-nexus-red'}>{tx.nftMinted ? 'Minted' : 'No'}</span></p>
                      <p className={textSub}>$NEXUS: <span className="text-nexus-cyan">+{tx.tokensGiven} pts</span></p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex items-center gap-1.5 rounded-lg bg-nexus-cyan/10 px-3 py-1.5 text-[10px] font-semibold text-nexus-cyan cursor-pointer">
                    <QrCode className="h-3 w-3" /> View QR
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg bg-nexus-green/10 px-3 py-1.5 text-[10px] font-semibold text-nexus-green cursor-pointer">
                    <ExternalLink className="h-3 w-3" /> Explorer
                  </button>
                  <button className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-semibold cursor-pointer ${isDark ? 'bg-white/5 text-nexus-gray' : 'bg-gray-100 text-nexus-sub-light'}`}>
                    <Copy className="h-3 w-3" /> Copy TX
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
