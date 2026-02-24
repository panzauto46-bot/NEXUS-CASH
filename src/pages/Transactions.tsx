import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Search, Filter, Download, ExternalLink, QrCode, Copy, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatUsd } from '../utils/currency';
import { useDemoData } from '../context/DemoDataContext';

export function Transactions() {
  const { isDark } = useTheme();
  const { transactions } = useDemoData();
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
  const totalTodayBch = transactions.reduce((sum, tx) => sum + tx.bch, 0);
  const successfulCount = transactions.filter(tx => tx.status === 'confirmed').length;
  const mintedCount = transactions.filter(tx => tx.nftMinted).length;
  const totalTokens = transactions.reduce((sum, tx) => sum + tx.tokensGiven, 0);

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'confirmed') return <CheckCircle2 className="h-4 w-4 text-nexus-green" />;
    if (status === 'pending') return <Clock className="h-4 w-4 text-yellow-400" />;
    return <XCircle className="h-4 w-4 text-nexus-red" />;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Today', value: `${totalTodayBch.toFixed(4)} BCH`, sub: formatUsd(totalTodayFiat) },
          { label: 'Successful Transactions', value: String(successfulCount), sub: `${transactions.length === 0 ? 0 : Math.round((successfulCount / transactions.length) * 100)}% success rate` },
          { label: 'Receipt NFTs Minted', value: String(mintedCount), sub: 'Minted receipts' },
          { label: 'Tokens Distributed', value: String(totalTokens), sub: '$NEXUS Points' },
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
                      {tx.receiptNftId && <p className={textSub}>Receipt ID: <span className={textMain}>{tx.receiptNftId}</span></p>}
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
