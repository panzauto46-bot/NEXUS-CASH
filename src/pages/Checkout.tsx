import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useDemoData } from '../context/DemoDataContext';
import { formatUsd } from '../utils/currency';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  LoaderCircle,
  QrCode,
  ShoppingCart,
  Wallet,
  XCircle,
} from 'lucide-react';

function DemoQr({ payload }: { payload: string }) {
  const matrix = useMemo(() => {
    const size = 15;
    return Array.from({ length: size * size }, (_, i) => {
      const code = payload.charCodeAt(i % payload.length);
      return (code + i * 7) % 3 === 0;
    });
  }, [payload]);

  return (
    <div
      className="grid h-44 w-44 gap-1 rounded-2xl bg-white p-2"
      style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}
    >
      {matrix.map((filled, idx) => (
        <div
          key={idx}
          className={`h-2.5 w-2.5 rounded-[2px] ${filled ? 'bg-nexus-onyx' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
}

function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function Checkout({ onOpenProducts }: { onOpenProducts: () => void }) {
  const { isDark } = useTheme();
  const {
    products,
    cartLines,
    cartCount,
    cartTotalUsd,
    cartTotalBch,
    customerWallet,
    activeCheckout,
    addToCart,
    updateCartQuantity,
    setCustomerWallet,
    startCheckout,
    submitDemoPayment,
    clearCheckoutSession,
  } = useDemoData();

  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ticker = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(ticker);
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const cardBg = 'neo-panel';
  const textMain = isDark ? 'text-white' : 'text-nexus-text-light';
  const textSub = isDark ? 'text-nexus-gray' : 'text-nexus-sub-light';

  const paymentCountdown = activeCheckout
    ? Math.max(0, Math.ceil((activeCheckout.expiresAt - now) / 1000))
    : 0;

  const statusMeta = useMemo(() => {
    if (!activeCheckout) return { label: '-', color: textSub, progress: 0 };

    switch (activeCheckout.status) {
      case 'awaiting_payment':
        return { label: 'Awaiting Payment', color: 'text-yellow-400', progress: 20 };
      case 'broadcasting':
        return { label: 'Broadcasting TX', color: 'text-nexus-cyan', progress: 45 };
      case 'confirming':
        return { label: 'Waiting Block Confirmation', color: 'text-nexus-cyan', progress: 75 };
      case 'confirmed':
        return { label: 'Confirmed + Minted', color: 'text-nexus-green', progress: 100 };
      case 'failed':
        return { label: 'Failed', color: 'text-nexus-red', progress: 100 };
      case 'expired':
        return { label: 'Expired', color: 'text-nexus-red', progress: 100 };
      default:
        return { label: '-', color: textSub, progress: 0 };
    }
  }, [activeCheckout, textSub]);

  const copyPaymentUri = async () => {
    if (!activeCheckout) return;
    try {
      await navigator.clipboard.writeText(activeCheckout.paymentUri);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const openWallet = () => {
    if (!activeCheckout) return;
    window.open(activeCheckout.paymentUri, '_blank', 'noopener,noreferrer');
  };

  const isProcessing =
    activeCheckout?.status === 'broadcasting' || activeCheckout?.status === 'confirming';

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl p-4 ${cardBg}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-nexus-green">Live Demo Mode</p>
            <h3 className={`text-xl font-bold ${textMain}`}>Checkout to Mint Flow</h3>
            <p className={`text-xs ${textSub}`}>
              1) create order 2) pay BCH 3) auto monitor mempool 4) auto mint loyalty CashToken + NFT receipt.
            </p>
          </div>
          <button
            onClick={onOpenProducts}
            className={`rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer ${
              isDark ? 'bg-white/5 text-nexus-gray hover:text-white' : 'bg-white text-nexus-sub-light hover:text-nexus-text-light'
            }`}
          >
            Back to Product Catalog
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className={`xl:col-span-2 rounded-2xl p-4 ${cardBg}`}>
          <div className="mb-3 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-nexus-cyan" />
            <h4 className={`font-bold ${textMain}`}>1. Select Items</h4>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map(product => (
              <div key={product.id} className={`rounded-xl p-3 ${isDark ? 'bg-white/5' : 'bg-white/80'}`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className={`rounded-lg px-2 py-1 text-[10px] font-bold tracking-[0.15em] ${isDark ? 'bg-white/10 text-nexus-cyan' : 'bg-gray-100 text-nexus-green'}`}>
                    {product.image}
                  </span>
                  <span className={`text-[10px] ${textSub}`}>{product.sku}</span>
                </div>
                <p className={`text-sm font-semibold ${textMain}`}>{product.name}</p>
                <p className={`text-xs ${textSub}`}>{formatUsd(product.price)} | {product.priceBch} BCH</p>
                <button
                  onClick={() => addToCart(product.id)}
                  className="mt-3 w-full rounded-lg bg-nexus-green px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-nexus-green-dark cursor-pointer"
                >
                  Add to Order
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl p-4 ${cardBg}`}>
          <div className="mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-nexus-green" />
            <h4 className={`font-bold ${textMain}`}>2. Checkout</h4>
          </div>
          <div className="space-y-3">
            <div>
              <label className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${textSub}`}>Customer Wallet</label>
              <input
                type="text"
                value={customerWallet}
                onChange={event => setCustomerWallet(event.target.value)}
                className={`mt-1 w-full rounded-xl border px-3 py-2 text-xs outline-none ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-white placeholder-nexus-gray'
                    : 'border-nexus-border-light bg-white text-nexus-text-light placeholder-nexus-sub-light'
                }`}
                placeholder="bitcoincash:q..."
              />
            </div>
            <div className={`rounded-xl p-3 ${isDark ? 'bg-white/5' : 'bg-white/80'}`}>
              <div className="flex items-center justify-between text-xs">
                <span className={textSub}>Items</span>
                <span className={textMain}>{cartCount}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className={textSub}>Subtotal</span>
                <span className={textMain}>{formatUsd(cartTotalUsd)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className={textSub}>Pay BCH</span>
                <span className="font-semibold text-nexus-green">{cartTotalBch} BCH</span>
              </div>
            </div>
            <div className="space-y-2">
              {cartLines.length === 0 && (
                <p className={`text-xs ${textSub}`}>Cart is empty. Add products from the left panel.</p>
              )}
              {cartLines.map(line => (
                <div key={line.product.id} className={`flex items-center justify-between rounded-lg p-2 ${isDark ? 'bg-white/5' : 'bg-white/80'}`}>
                  <div className="min-w-0">
                    <p className={`truncate text-xs font-semibold ${textMain}`}>{line.product.name}</p>
                    <p className={`text-[10px] ${textSub}`}>{formatUsd(line.lineTotalUsd)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateCartQuantity(line.product.id, line.quantity - 1)}
                      className={`h-6 w-6 rounded-md text-xs font-bold cursor-pointer ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-nexus-text-light'}`}
                    >
                      -
                    </button>
                    <span className={`w-5 text-center text-xs ${textMain}`}>{line.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(line.product.id, line.quantity + 1)}
                      className={`h-6 w-6 rounded-md text-xs font-bold cursor-pointer ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-nexus-text-light'}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={startCheckout}
              disabled={cartCount === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-nexus-green px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-nexus-green-dark disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              Generate BCH Payment QR <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {activeCheckout && (
        <div className={`rounded-2xl p-4 ${cardBg}`}>
          <div className="mb-3 flex items-center gap-2">
            <QrCode className="h-4 w-4 text-nexus-cyan" />
            <h4 className={`font-bold ${textMain}`}>3. Live Payment Engine</h4>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className={`rounded-xl p-4 ${isDark ? 'bg-white/5' : 'bg-white/80'}`}>
              <p className={`mb-2 text-xs font-semibold ${textSub}`}>Scan QR to Pay</p>
              <DemoQr payload={activeCheckout.paymentUri} />
              <div className="mt-3 space-y-2">
                <button
                  onClick={copyPaymentUri}
                  className={`flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer ${
                    copied ? 'bg-nexus-green/15 text-nexus-green' : isDark ? 'bg-white/10 text-nexus-gray hover:text-white' : 'bg-gray-100 text-nexus-sub-light hover:text-nexus-text-light'
                  }`}
                >
                  <Copy className="h-3.5 w-3.5" /> {copied ? 'Copied URI' : 'Copy Payment URI'}
                </button>
                <button
                  onClick={openWallet}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-nexus-cyan/15 px-3 py-2 text-xs font-semibold text-nexus-cyan cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open Wallet
                </button>
              </div>
            </div>

            <div className={`rounded-xl p-4 lg:col-span-2 ${isDark ? 'bg-white/5' : 'bg-white/80'}`}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <p className={`text-xs ${textSub}`}>Tx ID: <span className={textMain}>{activeCheckout.txId}</span></p>
                <p className={`text-xs ${textSub}`}>Wallet: <span className={textMain}>{activeCheckout.customer}</span></p>
                <p className={`text-xs ${textSub}`}>Pay BCH: <span className="font-semibold text-nexus-green">{activeCheckout.amountBch} BCH</span></p>
                <p className={`text-xs ${textSub}`}>Fiat: <span className={textMain}>{formatUsd(activeCheckout.amountUsd)}</span></p>
                <p className={`text-xs ${textSub}`}>Status: <span className={`font-semibold ${statusMeta.color}`}>{statusMeta.label}</span></p>
                <p className={`text-xs ${textSub}`}>Expires In: <span className={paymentCountdown === 0 ? 'font-semibold text-nexus-red' : textMain}>{formatCountdown(paymentCountdown)}</span></p>
                {activeCheckout.networkRef && (
                  <p className={`text-xs ${textSub}`}>Network Ref: <span className={textMain}>{activeCheckout.networkRef}</span></p>
                )}
              </div>

              <div className="mt-3">
                <div className={`h-2 w-full overflow-hidden rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <div
                    className={`h-full transition-all duration-500 ${
                      activeCheckout.status === 'failed' || activeCheckout.status === 'expired'
                        ? 'bg-nexus-red'
                        : 'bg-nexus-green'
                    }`}
                    style={{ width: `${statusMeta.progress}%` }}
                  />
                </div>
                <p className={`mt-1 text-[10px] ${textSub}`}>
                  Live network pipeline: broadcast {'->'} mempool {'->'} block confirmation.
                </p>
              </div>

              <p className={`mt-3 break-all rounded-lg p-2 text-[10px] ${isDark ? 'bg-black/20 text-nexus-gray' : 'bg-gray-100 text-nexus-sub-light'}`}>
                {activeCheckout.paymentUri}
              </p>

              {activeCheckout.status === 'awaiting_payment' && (
                <div className="mt-4">
                  <button
                    onClick={submitDemoPayment}
                    disabled={paymentCountdown === 0}
                    className="flex items-center gap-1.5 rounded-lg bg-nexus-green/15 px-3 py-2 text-xs font-semibold text-nexus-green cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Pay with Demo Wallet
                  </button>
                </div>
              )}

              {isProcessing && (
                <div className="mt-4 rounded-xl border border-nexus-cyan/25 bg-nexus-cyan/10 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-nexus-cyan">
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    Monitoring BCH Network
                  </p>
                  <p className={`mt-1 text-xs ${textSub}`}>Order sedang diproses otomatis oleh live demo engine.</p>
                </div>
              )}

              {activeCheckout.status === 'confirmed' && (
                <div className="mt-4 rounded-xl border border-nexus-green/25 bg-nexus-green/10 p-3">
                  <p className="text-xs font-bold text-nexus-green">Payment Confirmed</p>
                  <p className={`mt-1 text-xs ${textSub}`}>CashToken Minted: +{activeCheckout.tokenReward} $NEXUS points</p>
                  <p className={`text-xs ${textSub}`}>NFT Receipt: <span className={textMain}>{activeCheckout.receiptNftId}</span></p>
                </div>
              )}

              {(activeCheckout.status === 'failed' || activeCheckout.status === 'expired') && (
                <div className="mt-4 rounded-xl border border-nexus-red/25 bg-nexus-red/10 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-nexus-red">
                    {activeCheckout.status === 'expired' ? <Clock3 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                    {activeCheckout.status === 'expired' ? 'Payment Expired' : 'Payment Failed'}
                  </p>
                  <p className={`mt-1 text-xs ${textSub}`}>{activeCheckout.failureReason ?? 'No token or NFT minted. Retry payment.'}</p>
                </div>
              )}

              <button
                onClick={clearCheckoutSession}
                className={`mt-3 rounded-lg px-3 py-1.5 text-[10px] font-semibold cursor-pointer ${
                  isDark ? 'bg-white/10 text-nexus-gray hover:text-white' : 'bg-gray-100 text-nexus-sub-light hover:text-nexus-text-light'
                }`}
              >
                Clear Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
