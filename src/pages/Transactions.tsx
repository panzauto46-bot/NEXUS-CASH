import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Search,
  Filter,
  Download,
  ExternalLink,
  QrCode,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  X,
} from 'lucide-react';
import { formatUsd } from '../utils/currency';
import { useDemoData, type DemoTransaction } from '../context/DemoDataContext';

type SortMode = 'newest' | 'oldest' | 'largest' | 'smallest';
type FeedbackTone = 'success' | 'error';
type SourceFilter = 'all' | 'seed' | 'live';
type MintFilter = 'all' | 'minted' | 'not_minted';

function buildQrPayload(transaction: DemoTransaction): string {
  const cleanId = transaction.id.replace(/[^a-zA-Z0-9-]/g, '');
  return `nexuscash://tx/${cleanId}?amount=${transaction.bch}&status=${transaction.status}`;
}

function txTimestamp(transaction: DemoTransaction): number {
  const parsed = Date.parse(`${transaction.date}T${transaction.time}:00`);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  const raw = value == null ? '' : String(value);
  if (!/[",\n]/.test(raw)) return raw;
  return `"${raw.replace(/"/g, '""')}"`;
}

function formatFileStamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

function todayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function DemoQr({ payload }: { payload: string }) {
  const matrix = useMemo(() => {
    const size = 15;
    return Array.from({ length: size * size }, (_, index) => {
      const code = payload.charCodeAt(index % payload.length);
      return (code + index * 7) % 3 === 0;
    });
  }, [payload]);

  return (
    <div
      className="grid h-44 w-44 gap-1 rounded-2xl bg-white p-2"
      style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}
    >
      {matrix.map((filled, index) => (
        <div
          key={index}
          className={`h-2.5 w-2.5 rounded-[2px] ${filled ? 'bg-nexus-onyx' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
}

export function Transactions() {
  const { isDark } = useTheme();
  const { transactions } = useDemoData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'failed'>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [mintFilter, setMintFilter] = useState<MintFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minBch, setMinBch] = useState('');
  const [maxBch, setMaxBch] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [qrTx, setQrTx] = useState<DemoTransaction | null>(null);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  const [copiedQr, setCopiedQr] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; tone: FeedbackTone } | null>(null);

  const cardBg = 'neo-panel';
  const textMain = isDark ? 'text-white' : 'text-nexus-text-light';
  const textSub = isDark ? 'text-nexus-gray' : 'text-nexus-sub-light';

  const todayTransactions = useMemo(() => {
    const today = todayKey();
    return transactions.filter(tx => tx.date === today);
  }, [transactions]);

  const totalTodayFiat = todayTransactions.reduce((sum, tx) => sum + tx.fiat, 0);
  const totalTodayBch = todayTransactions.reduce((sum, tx) => sum + tx.bch, 0);
  const successfulCount = transactions.filter(tx => tx.status === 'confirmed').length;
  const successRate = transactions.length === 0 ? 0 : Math.round((successfulCount / transactions.length) * 100);
  const mintedCount = transactions.filter(tx => tx.nftMinted).length;
  const totalTokens = transactions.reduce((sum, tx) => sum + tx.tokensGiven, 0);

  const statusCounts = useMemo(() => {
    return {
      all: transactions.length,
      confirmed: transactions.filter(tx => tx.status === 'confirmed').length,
      pending: transactions.filter(tx => tx.status === 'pending').length,
      failed: transactions.filter(tx => tx.status === 'failed').length,
    };
  }, [transactions]);

  const minBchValue = useMemo(() => {
    if (minBch.trim() === '') return null;
    const parsed = Number(minBch);
    return Number.isNaN(parsed) ? null : parsed;
  }, [minBch]);

  const maxBchValue = useMemo(() => {
    if (maxBch.trim() === '') return null;
    const parsed = Number(maxBch);
    return Number.isNaN(parsed) ? null : parsed;
  }, [maxBch]);

  const normalizedDateRange = useMemo(() => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      return { from: dateTo, to: dateFrom };
    }
    return { from: dateFrom, to: dateTo };
  }, [dateFrom, dateTo]);

  const filtered = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const next = transactions.filter(tx => {
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      if (sourceFilter !== 'all' && tx.source !== sourceFilter) return false;

      if (mintFilter === 'minted' && !tx.nftMinted) return false;
      if (mintFilter === 'not_minted' && tx.nftMinted) return false;

      if (normalizedDateRange.from && tx.date < normalizedDateRange.from) return false;
      if (normalizedDateRange.to && tx.date > normalizedDateRange.to) return false;

      if (minBchValue != null && tx.bch < minBchValue) return false;
      if (maxBchValue != null && tx.bch > maxBchValue) return false;

      if (!search) return true;

      const searchable = [
        tx.id,
        tx.customer,
        tx.items.join(' '),
        tx.date,
        tx.time,
        tx.status,
        tx.source,
        tx.receiptNftId ?? '',
        tx.blockHeight == null ? '' : String(tx.blockHeight),
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(search);
    });

    return [...next].sort((left, right) => {
      if (sortMode === 'largest') return right.bch - left.bch;
      if (sortMode === 'smallest') return left.bch - right.bch;
      if (sortMode === 'oldest') return txTimestamp(left) - txTimestamp(right);
      return txTimestamp(right) - txTimestamp(left);
    });
  }, [
    transactions,
    searchTerm,
    statusFilter,
    sourceFilter,
    mintFilter,
    normalizedDateRange,
    minBchValue,
    maxBchValue,
    sortMode,
  ]);

  const advancedFilterCount = useMemo(() => {
    const activeFilters = [
      sourceFilter !== 'all',
      mintFilter !== 'all',
      dateFrom !== '',
      dateTo !== '',
      minBch !== '',
      maxBch !== '',
      sortMode !== 'newest',
    ];
    return activeFilters.filter(Boolean).length;
  }, [sourceFilter, mintFilter, dateFrom, dateTo, minBch, maxBch, sortMode]);

  useEffect(() => {
    if (!selectedTx) return;
    if (filtered.some(tx => tx.id === selectedTx)) return;
    setSelectedTx(null);
  }, [filtered, selectedTx]);

  useEffect(() => {
    if (!copiedTxId) return;
    const timer = window.setTimeout(() => setCopiedTxId(null), 1500);
    return () => window.clearTimeout(timer);
  }, [copiedTxId]);

  useEffect(() => {
    if (!copiedQr) return;
    const timer = window.setTimeout(() => setCopiedQr(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copiedQr]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 2600);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const resetAdvancedFilters = () => {
    setSourceFilter('all');
    setMintFilter('all');
    setSortMode('newest');
    setDateFrom('');
    setDateTo('');
    setMinBch('');
    setMaxBch('');
    setFeedback({ message: 'Advanced filter reset.', tone: 'success' });
  };

  const exportCsv = () => {
    if (filtered.length === 0) {
      setFeedback({ message: 'No transaction matched current filters.', tone: 'error' });
      return;
    }

    const headers = [
      'tx_id',
      'status',
      'source',
      'customer_wallet',
      'items',
      'amount_bch',
      'amount_usd',
      'date',
      'time',
      'block_height',
      'nft_minted',
      'receipt_nft_id',
      'tokens_given',
    ];

    const rows = filtered.map(tx => [
      tx.id,
      tx.status,
      tx.source,
      tx.customer,
      tx.items.join(' | '),
      tx.bch.toFixed(4),
      tx.fiat.toFixed(2),
      tx.date,
      tx.time,
      tx.blockHeight ?? '',
      tx.nftMinted ? 'yes' : 'no',
      tx.receiptNftId ?? '',
      tx.tokensGiven,
    ]);

    const csv =
      '\uFEFF' +
      [headers, ...rows]
        .map(line => line.map(value => escapeCsvCell(value)).join(','))
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `transactions-${formatFileStamp(new Date())}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    setFeedback({
      message: `Exported ${filtered.length} transaction(s) to CSV.`,
      tone: 'success',
    });
  };

  const copyTransaction = async (transaction: DemoTransaction) => {
    const payload = JSON.stringify(
      {
        id: transaction.id,
        status: transaction.status,
        source: transaction.source,
        customer: transaction.customer,
        items: transaction.items,
        amountBch: transaction.bch,
        amountUsd: transaction.fiat,
        date: transaction.date,
        time: transaction.time,
        blockHeight: transaction.blockHeight,
        nftMinted: transaction.nftMinted,
        receiptNftId: transaction.receiptNftId ?? null,
        tokensGiven: transaction.tokensGiven,
      },
      null,
      2,
    );

    try {
      await navigator.clipboard.writeText(payload);
      setCopiedTxId(transaction.id);
      setFeedback({ message: `${transaction.id} copied to clipboard.`, tone: 'success' });
    } catch {
      setFeedback({ message: 'Clipboard access blocked by browser.', tone: 'error' });
    }
  };

  const openExplorer = (transaction: DemoTransaction) => {
    const url =
      transaction.blockHeight != null
        ? `https://explorer.bitcoin.com/bch/block/${transaction.blockHeight}`
        : `https://explorer.bitcoin.com/bch/search/${encodeURIComponent(transaction.id)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copyQrPayload = async () => {
    if (!qrTx) return;
    try {
      await navigator.clipboard.writeText(buildQrPayload(qrTx));
      setCopiedQr(true);
      setFeedback({ message: `QR payload for ${qrTx.id} copied.`, tone: 'success' });
    } catch {
      setFeedback({ message: 'Failed to copy QR payload.', tone: 'error' });
    }
  };

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
          { label: 'Successful Transactions', value: String(successfulCount), sub: `${successRate}% success rate` },
          { label: 'Receipt NFTs Minted', value: String(mintedCount), sub: 'Minted receipts' },
          { label: 'Tokens Distributed', value: String(totalTokens), sub: '$NEXUS Points' },
        ].map((summary, index) => (
          <div key={index} className={`rounded-2xl p-4 ${cardBg}`}>
            <p className={`text-xs font-medium ${textSub}`}>{summary.label}</p>
            <p className={`mt-1 text-xl font-bold ${textMain}`}>{summary.value}</p>
            <p className={`mt-0.5 text-[10px] ${textSub}`}>{summary.sub}</p>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl p-4 ${cardBg}`}>
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                isDark ? 'bg-white/5' : 'border border-nexus-border-light bg-gray-50'
              }`}
            >
              <Search className="h-4 w-4 text-nexus-gray" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                className={`w-48 bg-transparent text-sm outline-none ${
                  isDark ? 'text-white placeholder-nexus-gray' : 'text-nexus-text-light placeholder-nexus-sub-light'
                }`}
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'All', count: statusCounts.all },
                { id: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
                { id: 'pending', label: 'Pending', count: statusCounts.pending },
                { id: 'failed', label: 'Failed', count: statusCounts.failed },
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setStatusFilter(option.id as 'all' | 'confirmed' | 'pending' | 'failed')}
                  className={`rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                    statusFilter === option.id
                      ? 'bg-nexus-green/15 text-nexus-green'
                      : isDark
                        ? 'text-nexus-gray hover:bg-white/5'
                        : 'text-nexus-sub-light hover:bg-gray-100'
                  }`}
                >
                  {option.label} ({option.count})
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsAdvancedOpen(prev => !prev)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium cursor-pointer ${
                isAdvancedOpen
                  ? 'bg-nexus-green/15 text-nexus-green'
                  : isDark
                    ? 'bg-white/5 text-nexus-gray'
                    : 'border border-nexus-border-light bg-gray-50 text-nexus-sub-light'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              Advanced Filter
              {advancedFilterCount > 0 && (
                <span className="rounded-md bg-nexus-green/20 px-1.5 py-0.5 text-[10px] font-bold text-nexus-green">
                  {advancedFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-55 ${
                isDark ? 'bg-white/5 text-nexus-gray' : 'border border-nexus-border-light bg-gray-50 text-nexus-sub-light'
              }`}
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>
        </div>
        {feedback && (
          <p className={`mt-3 text-xs font-medium ${feedback.tone === 'success' ? 'text-nexus-green' : 'text-nexus-red'}`}>
            {feedback.message}
          </p>
        )}
      </div>

      {isAdvancedOpen && (
        <div className={`rounded-2xl p-4 ${cardBg}`}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${textSub}`}>Source</p>
              <select
                value={sourceFilter}
                onChange={event => setSourceFilter(event.target.value as SourceFilter)}
                className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-white'
                    : 'border-nexus-border-light bg-white text-nexus-text-light'
                }`}
              >
                <option value="all">All Sources</option>
                <option value="live">Live Checkout</option>
                <option value="seed">Seed Data</option>
              </select>
            </div>

            <div>
              <p className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${textSub}`}>Receipt NFT</p>
              <select
                value={mintFilter}
                onChange={event => setMintFilter(event.target.value as MintFilter)}
                className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-white'
                    : 'border-nexus-border-light bg-white text-nexus-text-light'
                }`}
              >
                <option value="all">Any</option>
                <option value="minted">Minted Only</option>
                <option value="not_minted">Not Minted</option>
              </select>
            </div>

            <div>
              <p className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${textSub}`}>Date From</p>
              <input
                type="date"
                value={dateFrom}
                onChange={event => setDateFrom(event.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-white'
                    : 'border-nexus-border-light bg-white text-nexus-text-light'
                }`}
              />
            </div>

            <div>
              <p className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${textSub}`}>Date To</p>
              <input
                type="date"
                value={dateTo}
                onChange={event => setDateTo(event.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-white'
                    : 'border-nexus-border-light bg-white text-nexus-text-light'
                }`}
              />
            </div>

            <div>
              <p className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${textSub}`}>Min BCH</p>
              <input
                type="number"
                min="0"
                step="0.0001"
                value={minBch}
                onChange={event => setMinBch(event.target.value)}
                placeholder="0.0000"
                className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-white placeholder-nexus-gray'
                    : 'border-nexus-border-light bg-white text-nexus-text-light placeholder-nexus-sub-light'
                }`}
              />
            </div>

            <div>
              <p className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${textSub}`}>Max BCH</p>
              <input
                type="number"
                min="0"
                step="0.0001"
                value={maxBch}
                onChange={event => setMaxBch(event.target.value)}
                placeholder="0.9999"
                className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-white placeholder-nexus-gray'
                    : 'border-nexus-border-light bg-white text-nexus-text-light placeholder-nexus-sub-light'
                }`}
              />
            </div>

            <div>
              <p className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${textSub}`}>Sort By</p>
              <select
                value={sortMode}
                onChange={event => setSortMode(event.target.value as SortMode)}
                className={`w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-white'
                    : 'border-nexus-border-light bg-white text-nexus-text-light'
                }`}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="largest">Largest BCH</option>
                <option value="smallest">Smallest BCH</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className={`text-xs ${textSub}`}>
              Showing <span className={textMain}>{filtered.length}</span> of <span className={textMain}>{transactions.length}</span> transaction(s)
            </p>
            <button
              onClick={resetAdvancedFilters}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium cursor-pointer ${
                isDark ? 'bg-white/5 text-nexus-gray' : 'border border-nexus-border-light bg-gray-50 text-nexus-sub-light'
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Advanced
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className={`rounded-2xl p-5 text-sm ${cardBg}`}>
            <p className={textMain}>No transactions found.</p>
            <p className={`mt-1 text-xs ${textSub}`}>Try relaxing filters or clearing the search keyword.</p>
          </div>
        )}

        {filtered.map(tx => (
          <div
            key={tx.id}
            onClick={() => setSelectedTx(selectedTx === tx.id ? null : tx.id)}
            className={`rounded-2xl p-4 transition-all duration-300 hover:scale-[1.005] cursor-pointer ${cardBg}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-4">
                <StatusIcon status={tx.status} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`font-mono text-sm font-bold ${textMain}`}>{tx.id}</span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        tx.status === 'confirmed'
                          ? 'bg-nexus-green/15 text-nexus-green'
                          : tx.status === 'pending'
                            ? 'bg-yellow-500/15 text-yellow-400'
                            : 'bg-nexus-red/15 text-nexus-red'
                      }`}
                    >
                      {tx.status}
                    </span>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${tx.source === 'live' ? 'bg-nexus-cyan/15 text-nexus-cyan' : isDark ? 'bg-white/10 text-nexus-gray' : 'bg-gray-100 text-nexus-sub-light'}`}>
                      {tx.source}
                    </span>
                  </div>
                  <p className={`mt-0.5 truncate font-mono text-xs ${textSub}`}>{tx.customer}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${textMain}`}>{tx.bch.toFixed(4)} BCH</p>
                <p className={`text-xs ${textSub}`}>{formatUsd(tx.fiat)}</p>
              </div>
            </div>

            {selectedTx === tx.id && (
              <div className={`mt-4 border-t pt-4 ${isDark ? 'border-white/5' : 'border-nexus-border-light'}`}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${textSub}`}>Items</p>
                    <div className="space-y-1">
                      {tx.items.map((item, index) => (
                        <p key={index} className={`text-xs ${textMain}`}>{item}</p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className={`mb-2 text-[10px] font-semibold uppercase tracking-wider ${textSub}`}>Details</p>
                    <div className="space-y-1 text-xs">
                      <p className={textSub}>Date: <span className={textMain}>{tx.date}</span></p>
                      <p className={textSub}>Time: <span className={textMain}>{tx.time}</span></p>
                      <p className={textSub}>Source: <span className={textMain}>{tx.source}</span></p>
                      {tx.blockHeight != null && <p className={textSub}>Block: <span className="text-nexus-cyan">#{tx.blockHeight}</span></p>}
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
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={event => {
                      event.stopPropagation();
                      setQrTx(tx);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-nexus-cyan/10 px-3 py-1.5 text-[10px] font-semibold text-nexus-cyan cursor-pointer"
                  >
                    <QrCode className="h-3 w-3" /> View QR
                  </button>
                  <button
                    onClick={event => {
                      event.stopPropagation();
                      openExplorer(tx);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-nexus-green/10 px-3 py-1.5 text-[10px] font-semibold text-nexus-green cursor-pointer"
                  >
                    <ExternalLink className="h-3 w-3" /> Explorer
                  </button>
                  <button
                    onClick={async event => {
                      event.stopPropagation();
                      await copyTransaction(tx);
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-semibold cursor-pointer ${
                      copiedTxId === tx.id
                        ? 'bg-nexus-green/10 text-nexus-green'
                        : isDark
                          ? 'bg-white/5 text-nexus-gray'
                          : 'bg-gray-100 text-nexus-sub-light'
                    }`}
                  >
                    <Copy className="h-3 w-3" /> {copiedTxId === tx.id ? 'Copied' : 'Copy TX'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {qrTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => setQrTx(null)}
        >
          <div
            onClick={event => event.stopPropagation()}
            className={`w-full max-w-sm rounded-2xl p-4 ${cardBg}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${textSub}`}>Demo QR</p>
                <h4 className={`text-sm font-bold ${textMain}`}>{qrTx.id}</h4>
                <p className={`text-xs ${textSub}`}>{qrTx.bch.toFixed(4)} BCH</p>
              </div>
              <button
                onClick={() => setQrTx(null)}
                className={`rounded-lg p-1.5 cursor-pointer ${
                  isDark ? 'bg-white/5 text-nexus-gray' : 'bg-gray-100 text-nexus-sub-light'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex justify-center">
              <DemoQr payload={buildQrPayload(qrTx)} />
            </div>

            <p className={`mt-3 break-all rounded-lg p-2 text-[10px] ${isDark ? 'bg-black/20 text-nexus-gray' : 'bg-gray-100 text-nexus-sub-light'}`}>
              {buildQrPayload(qrTx)}
            </p>

            <div className="mt-3 flex gap-2">
              <button
                onClick={copyQrPayload}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer ${
                  copiedQr
                    ? 'bg-nexus-green/15 text-nexus-green'
                    : isDark
                      ? 'bg-white/10 text-nexus-gray hover:text-white'
                      : 'bg-gray-100 text-nexus-sub-light hover:text-nexus-text-light'
                }`}
              >
                <Copy className="h-3.5 w-3.5" /> {copiedQr ? 'Copied Payload' : 'Copy Payload'}
              </button>
              <button
                onClick={() => setQrTx(null)}
                className={`flex items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer ${
                  isDark ? 'bg-white/10 text-nexus-gray hover:text-white' : 'bg-gray-100 text-nexus-sub-light hover:text-nexus-text-light'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
