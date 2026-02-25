import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BCH_TO_USD } from '../utils/currency';

export type TransactionStatus = 'confirmed' | 'pending' | 'failed';

export interface DemoProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  priceBch: number;
  stock: number;
  category: 'Food' | 'Beverage';
  image: string;
}

export interface DemoTransaction {
  id: string;
  customer: string;
  items: string[];
  bch: number;
  fiat: number;
  status: TransactionStatus;
  time: string;
  date: string;
  nftMinted: boolean;
  tokensGiven: number;
  blockHeight: number | null;
  receiptNftId?: string;
  source: 'seed' | 'live';
}

interface CartLine {
  productId: string;
  quantity: number;
}

export interface CheckoutSession {
  txId: string;
  customer: string;
  amountUsd: number;
  amountBch: number;
  paymentAddress: string;
  paymentUri: string;
  status: 'awaiting_payment' | 'broadcasting' | 'confirming' | 'confirmed' | 'failed' | 'expired';
  requestedTokenReward: number;
  tokenReward: number;
  receiptNftId: string;
  orderLines: Array<{ productId: string; quantity: number }>;
  createdAt: number;
  expiresAt: number;
  paidAt?: number;
  confirmedAt?: number;
  networkRef?: string;
  failureReason?: string;
  mintNote?: string;
}

interface DashboardMetrics {
  totalBch: number;
  totalTransactions: number;
  mintedTokens: number;
  activeCustomers: number;
}

export type SweepTrigger = 'manual' | 'auto';

export interface TreasurySnapshot {
  totalSupply: number;
  distributedSupply: number;
  burnedSupply: number;
  availableSupply: number;
  hotWalletBch: number;
  coldWalletBch: number;
  sweepThresholdBch: number;
  autoMintEnabled: boolean;
  autoSweepEnabled: boolean;
  projectedSweepAmountBch: number;
}

export interface TreasurySweepEvent {
  id: string;
  trigger: SweepTrigger;
  amountBch: number;
  createdAt: number;
  hotWalletAfterBch: number;
  coldWalletAfterBch: number;
}

interface DemoDataContextValue {
  products: DemoProduct[];
  bchUsdRate: number;
  lastRateSyncAt: Date | null;
  transactions: DemoTransaction[];
  cartLines: Array<{ product: DemoProduct; quantity: number; lineTotalUsd: number; lineTotalBch: number }>;
  cartCount: number;
  cartTotalUsd: number;
  cartTotalBch: number;
  customerWallet: string;
  activeCheckout: CheckoutSession | null;
  dashboardMetrics: DashboardMetrics;
  treasurySnapshot: TreasurySnapshot;
  treasurySweeps: TreasurySweepEvent[];
  pendingMintTransactions: DemoTransaction[];
  createProduct: (input: Omit<DemoProduct, 'id' | 'priceBch'>) => void;
  updateProduct: (productId: string, patch: Partial<Omit<DemoProduct, 'id'>>) => void;
  deleteProduct: (productId: string) => void;
  syncBchRate: () => void;
  addToCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomerWallet: (wallet: string) => void;
  startCheckout: () => void;
  submitDemoPayment: () => void;
  clearCheckoutSession: () => void;
  setTreasuryAutoMintEnabled: (enabled: boolean) => void;
  setTreasuryAutoSweepEnabled: (enabled: boolean) => void;
  setTreasurySweepThreshold: (threshold: number) => void;
  sweepToColdWallet: (amountBch?: number) => boolean;
  burnTreasurySupply: (amount: number) => boolean;
  mintPendingTransaction: (txId: string) => boolean;
}

const demoProducts: DemoProduct[] = [
  { id: '1', name: 'Americano Coffee', sku: 'BEV-001', price: 1.68, priceBch: 0.0056, stock: 999, category: 'Beverage', image: 'AM' },
  { id: '2', name: 'Special Fried Rice', sku: 'FOD-001', price: 2.34, priceBch: 0.0078, stock: 50, category: 'Food', image: 'FR' },
  { id: '3', name: 'Butter Croissant', sku: 'FOD-002', price: 1.2, priceBch: 0.004, stock: 25, category: 'Food', image: 'CR' },
  { id: '4', name: 'Matcha Latte', sku: 'BEV-002', price: 2.13, priceBch: 0.0071, stock: 999, category: 'Beverage', image: 'ML' },
  { id: '5', name: 'Classic Burger', sku: 'FOD-003', price: 2.79, priceBch: 0.0093, stock: 30, category: 'Food', image: 'BG' },
  { id: '6', name: 'Fresh Orange Juice', sku: 'BEV-003', price: 1.32, priceBch: 0.0044, stock: 999, category: 'Beverage', image: 'OJ' },
  { id: '7', name: 'Carbonara Pasta', sku: 'FOD-004', price: 3.21, priceBch: 0.0107, stock: 20, category: 'Food', image: 'PS' },
  { id: '8', name: 'Cheesecake Slice', sku: 'FOD-005', price: 1.86, priceBch: 0.0062, stock: 15, category: 'Food', image: 'CK' },
];

const merchantAddress = 'bitcoincash:qph7w9merchant8qv8xdem0m28jk4alhjk2jv7r3';
const UNLIMITED_STOCK = 999;
const CHECKOUT_EXPIRY_MS = 5 * 60 * 1000;
const BROADCAST_DELAY_MS = 1200;
const CONFIRMATION_BASE_DELAY_MS = 3200;
const CONFIRMATION_RANDOM_DELAY_MS = 2200;
const TREASURY_TOTAL_SUPPLY = 100_000;
const TREASURY_BASE_BURNED = 20_000;
const TREASURY_BASE_DISTRIBUTED = 44_717;
const TREASURY_INITIAL_HOT_WALLET_BCH = 0.842;
const TREASURY_INITIAL_COLD_WALLET_BCH = 2.4;
const TREASURY_DEFAULT_SWEEP_THRESHOLD_BCH = 1;
const TREASURY_MIN_HOT_RESERVE_BCH = 0.2;
const TREASURY_MAX_SWEEP_THRESHOLD_BCH = 25;

const DemoDataContext = createContext<DemoDataContextValue | undefined>(undefined);

function roundTo(value: number, digits: number): number {
  const base = Math.pow(10, digits);
  return Math.round(value * base) / base;
}

function toBch(usdValue: number, rate: number): number {
  if (rate <= 0) return 0;
  return roundTo(usdValue / rate, 4);
}

function withRate(products: DemoProduct[], rate: number): DemoProduct[] {
  return products.map(product => ({
    ...product,
    priceBch: toBch(product.price, rate),
  }));
}

function normalizeProductInput(input: Omit<DemoProduct, 'id' | 'priceBch'>): Omit<DemoProduct, 'id' | 'priceBch'> {
  const cleanName = input.name.trim();
  const cleanSku = input.sku.trim().toUpperCase();
  const cleanImage = input.image.trim().toUpperCase().slice(0, 2) || cleanName.slice(0, 2).toUpperCase();
  const cleanPrice = roundTo(Math.max(input.price, 0), 2);
  const cleanStock = input.stock === UNLIMITED_STOCK ? UNLIMITED_STOCK : Math.max(0, Math.round(input.stock));
  const cleanCategory = input.category === 'Food' ? 'Food' : 'Beverage';

  return {
    name: cleanName,
    sku: cleanSku,
    image: cleanImage,
    price: cleanPrice,
    stock: cleanStock,
    category: cleanCategory,
  };
}

function getNextProductId(products: DemoProduct[]): string {
  const highest = products.reduce((max, product) => {
    const value = Number(product.id);
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);
  return String(highest + 1);
}

function formatLocalDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLocalTime(value: Date): string {
  const hour = String(value.getHours()).padStart(2, '0');
  const minute = String(value.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
}

function getNowParts() {
  const now = new Date();
  return { date: formatLocalDate(now), time: formatLocalTime(now) };
}

function buildSeedTimestamp(dayOffset: number, hour: number, minute: number) {
  const value = new Date();
  value.setDate(value.getDate() - dayOffset);
  value.setHours(hour, minute, 0, 0);
  return {
    date: formatLocalDate(value),
    time: formatLocalTime(value),
  };
}

function createSeedTransactions(): DemoTransaction[] {
  const templates = [
    { id: 'TX-0042', customer: 'bitcoincash:qz3f...8a2c', items: ['Americano Coffee x2', 'Butter Croissant x1'], bch: 0.0152, fiat: 4.56, status: 'confirmed' as const, token: 46, block: 831204, nft: 'NFT-RCP-0042', dayOffset: 0, hour: 14, minute: 32 },
    { id: 'TX-0041', customer: 'bitcoincash:qp7b...1d4e', items: ['Matcha Latte x1'], bch: 0.0071, fiat: 2.13, status: 'confirmed' as const, token: 21, block: 831203, nft: 'NFT-RCP-0041', dayOffset: 0, hour: 14, minute: 24 },
    { id: 'TX-0040', customer: 'bitcoincash:qa1x...9f3b', items: ['Classic Burger x1', 'Fresh Orange Juice x2', 'Carbonara Pasta x1', 'Cheesecake Slice x1'], bch: 0.0328, fiat: 9.84, status: 'pending' as const, token: 0, block: null, nft: undefined, dayOffset: 1, hour: 13, minute: 55 },
    { id: 'TX-0039', customer: 'bitcoincash:qc8m...2e7a', items: ['Special Fried Rice x1', 'Americano Coffee x1'], bch: 0.0134, fiat: 4.02, status: 'confirmed' as const, token: 40, block: 831201, nft: 'NFT-RCP-0039', dayOffset: 2, hour: 13, minute: 15 },
    { id: 'TX-0038', customer: 'bitcoincash:q5dr...4c1f', items: ['Carbonara Pasta x2'], bch: 0.0214, fiat: 6.42, status: 'failed' as const, token: 0, block: null, nft: undefined, dayOffset: 3, hour: 12, minute: 48 },
    { id: 'TX-0037', customer: 'bitcoincash:qe9k...7b5d', items: ['Cheesecake Slice x3'], bch: 0.0186, fiat: 5.58, status: 'confirmed' as const, token: 56, block: 831198, nft: 'NFT-RCP-0037', dayOffset: 4, hour: 12, minute: 20 },
    { id: 'TX-0036', customer: 'bitcoincash:qf2n...3a8e', items: ['Americano Coffee x1', 'Matcha Latte x1'], bch: 0.0127, fiat: 3.81, status: 'confirmed' as const, token: 38, block: 831195, nft: 'NFT-RCP-0036', dayOffset: 5, hour: 11, minute: 42 },
    { id: 'TX-0035', customer: 'bitcoincash:qg6p...9d2c', items: ['Classic Burger x2', 'Fresh Orange Juice x2'], bch: 0.0274, fiat: 8.22, status: 'confirmed' as const, token: 82, block: 831192, nft: 'NFT-RCP-0035', dayOffset: 6, hour: 10, minute: 18 },
  ];

  return templates.map(template => {
    const timestamp = buildSeedTimestamp(template.dayOffset, template.hour, template.minute);
    return {
      id: template.id,
      customer: template.customer,
      items: template.items,
      bch: template.bch,
      fiat: template.fiat,
      status: template.status,
      time: timestamp.time,
      date: timestamp.date,
      nftMinted: Boolean(template.nft),
      tokensGiven: template.token,
      blockHeight: template.block,
      receiptNftId: template.nft,
      source: 'seed' as const,
    };
  });
}

function getNextTransactionId(transactions: DemoTransaction[]): string {
  const highest = transactions.reduce((max, tx) => {
    const value = Number(tx.id.replace('TX-', ''));
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 40);
  return `TX-${String(highest + 1).padStart(4, '0')}`;
}

function randomNetworkRef(txId: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `mempool-${txId.toLowerCase()}-${suffix}`;
}

function txTimestamp(tx: DemoTransaction): number {
  const parsed = Date.parse(`${tx.date}T${tx.time}:00`);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function nextSweepId(): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `SWP-${Date.now()}-${suffix}`;
}

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [bchUsdRate, setBchUsdRate] = useState<number>(BCH_TO_USD);
  const [lastRateSyncAt, setLastRateSyncAt] = useState<Date | null>(new Date());
  const [products, setProducts] = useState<DemoProduct[]>(() => withRate(demoProducts, BCH_TO_USD));
  const [transactions, setTransactions] = useState<DemoTransaction[]>(() => createSeedTransactions());
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerWallet, setCustomerWallet] = useState('bitcoincash:qrx9...newbuyer');
  const [activeCheckout, setActiveCheckout] = useState<CheckoutSession | null>(null);
  const [additionalBurnedTokens, setAdditionalBurnedTokens] = useState(0);
  const [hotWalletBch, setHotWalletBch] = useState(TREASURY_INITIAL_HOT_WALLET_BCH);
  const [coldWalletBch, setColdWalletBch] = useState(TREASURY_INITIAL_COLD_WALLET_BCH);
  const [sweepThresholdBch, setSweepThresholdBchState] = useState(TREASURY_DEFAULT_SWEEP_THRESHOLD_BCH);
  const [autoMintEnabled, setAutoMintEnabled] = useState(true);
  const [autoSweepEnabled, setAutoSweepEnabled] = useState(false);
  const [treasurySweeps, setTreasurySweeps] = useState<TreasurySweepEvent[]>([]);
  const broadcastingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cartLines = useMemo(() => {
    return cart
      .map(line => {
        const product = products.find(p => p.id === line.productId);
        if (!product) return null;
        return {
          product,
          quantity: line.quantity,
          lineTotalUsd: roundTo(product.price * line.quantity, 2),
          lineTotalBch: roundTo(product.priceBch * line.quantity, 4),
        };
      })
      .filter((line): line is { product: DemoProduct; quantity: number; lineTotalUsd: number; lineTotalBch: number } => Boolean(line));
  }, [cart, products]);

  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotalUsd = roundTo(cartLines.reduce((sum, line) => sum + line.lineTotalUsd, 0), 2);
  const cartTotalBch = toBch(cartTotalUsd, bchUsdRate);

  const dashboardMetrics = useMemo<DashboardMetrics>(() => {
    const totalBch = roundTo(transactions.reduce((sum, tx) => sum + tx.bch, 0), 4);
    const totalTransactions = transactions.length;
    const mintedTokens = transactions.reduce((sum, tx) => sum + tx.tokensGiven, 0);
    const activeCustomers = new Set(transactions.map(tx => tx.customer)).size;
    return { totalBch, totalTransactions, mintedTokens, activeCustomers };
  }, [transactions]);

  const treasurySnapshot = useMemo<TreasurySnapshot>(() => {
    const mintedFromTransactions = transactions.reduce((sum, tx) => sum + tx.tokensGiven, 0);
    const rawDistributed = TREASURY_BASE_DISTRIBUTED + mintedFromTransactions;
    const distributedSupply = Math.min(TREASURY_TOTAL_SUPPLY, Math.max(0, rawDistributed));
    const rawBurned = TREASURY_BASE_BURNED + additionalBurnedTokens;
    const burnedSupply = Math.min(TREASURY_TOTAL_SUPPLY - distributedSupply, Math.max(0, rawBurned));
    const availableSupply = Math.max(TREASURY_TOTAL_SUPPLY - distributedSupply - burnedSupply, 0);
    const sweepableNow = Math.max(hotWalletBch - TREASURY_MIN_HOT_RESERVE_BCH, 0);
    const projectedSweepAmountBch =
      autoSweepEnabled && hotWalletBch >= sweepThresholdBch
        ? roundTo(sweepableNow, 4)
        : 0;

    return {
      totalSupply: TREASURY_TOTAL_SUPPLY,
      distributedSupply,
      burnedSupply,
      availableSupply,
      hotWalletBch,
      coldWalletBch,
      sweepThresholdBch,
      autoMintEnabled,
      autoSweepEnabled,
      projectedSweepAmountBch,
    };
  }, [
    transactions,
    additionalBurnedTokens,
    hotWalletBch,
    coldWalletBch,
    sweepThresholdBch,
    autoMintEnabled,
    autoSweepEnabled,
  ]);

  const pendingMintTransactions = useMemo(() => {
    return [...transactions]
      .filter(tx => tx.status === 'confirmed' && tx.tokensGiven === 0)
      .sort((left, right) => txTimestamp(right) - txTimestamp(left));
  }, [transactions]);

  const createProduct = (input: Omit<DemoProduct, 'id' | 'priceBch'>) => {
    const normalized = normalizeProductInput(input);
    if (!normalized.name || normalized.price <= 0) return;

    setProducts(prev => {
      const nextProduct: DemoProduct = {
        ...normalized,
        id: getNextProductId(prev),
        priceBch: toBch(normalized.price, bchUsdRate),
      };
      return [nextProduct, ...prev];
    });
  };

  const updateProduct = (productId: string, patch: Partial<Omit<DemoProduct, 'id'>>) => {
    setProducts(prev => {
      const nextProducts = prev.map(product => {
        if (product.id !== productId) return product;
        const merged = normalizeProductInput({
          name: patch.name ?? product.name,
          sku: patch.sku ?? product.sku,
          image: patch.image ?? product.image,
          price: patch.price ?? product.price,
          stock: patch.stock ?? product.stock,
          category: patch.category ?? product.category,
        });
        return {
          ...product,
          ...merged,
          priceBch: toBch(merged.price, bchUsdRate),
        };
      });

      setCart(prevCart => prevCart.flatMap(line => {
        const product = nextProducts.find(item => item.id === line.productId);
        if (!product) return [];
        if (product.stock === UNLIMITED_STOCK) return [line];
        if (product.stock <= 0) return [];
        return [{ ...line, quantity: Math.min(line.quantity, product.stock) }];
      }));

      return nextProducts;
    });
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
    setCart(prev => prev.filter(line => line.productId !== productId));
    setActiveCheckout(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        orderLines: prev.orderLines.filter(line => line.productId !== productId),
      };
    });
  };

  const syncBchRate = () => {
    const drift = (Math.random() * 0.08) - 0.04;
    const nextRate = roundTo(Math.min(700, Math.max(180, bchUsdRate * (1 + drift))), 2);
    setBchUsdRate(nextRate);
    setLastRateSyncAt(new Date());
    setProducts(prev => withRate(prev, nextRate));
  };

  const addToCart = (productId: string) => {
    setCart(prev => {
      const product = products.find(item => item.id === productId);
      if (!product) return prev;
      const existing = prev.find(line => line.productId === productId);
      const nextQty = existing ? existing.quantity + 1 : 1;
      if (product.stock !== UNLIMITED_STOCK && nextQty > product.stock) return prev;
      if (!existing) return [...prev, { productId, quantity: 1 }];
      return prev.map(line => line.productId === productId ? { ...line, quantity: nextQty } : line);
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev => {
      if (quantity <= 0) return prev.filter(line => line.productId !== productId);
      const product = products.find(item => item.id === productId);
      if (!product) return prev.filter(line => line.productId !== productId);
      const safeQuantity = product.stock === UNLIMITED_STOCK ? quantity : Math.min(quantity, product.stock);
      if (safeQuantity <= 0) return prev.filter(line => line.productId !== productId);
      const existing = prev.find(line => line.productId === productId);
      if (!existing) return [...prev, { productId, quantity: safeQuantity }];
      return prev.map(line => line.productId === productId ? { ...line, quantity: safeQuantity } : line);
    });
  };

  const clearCart = () => setCart([]);

  const setTreasuryAutoMintEnabled = (enabled: boolean) => {
    setAutoMintEnabled(Boolean(enabled));
  };

  const setTreasuryAutoSweepEnabled = (enabled: boolean) => {
    setAutoSweepEnabled(Boolean(enabled));
  };

  const setTreasurySweepThreshold = (threshold: number) => {
    if (!Number.isFinite(threshold)) return;
    const normalized = roundTo(
      Math.min(TREASURY_MAX_SWEEP_THRESHOLD_BCH, Math.max(TREASURY_MIN_HOT_RESERVE_BCH, threshold)),
      3,
    );
    setSweepThresholdBchState(normalized);
  };

  const recordSweep = (
    amountBch: number,
    trigger: SweepTrigger,
    hotWalletAfterBch: number,
    coldWalletAfterBch: number,
  ) => {
    const event: TreasurySweepEvent = {
      id: nextSweepId(),
      trigger,
      amountBch: roundTo(amountBch, 4),
      createdAt: Date.now(),
      hotWalletAfterBch: roundTo(hotWalletAfterBch, 4),
      coldWalletAfterBch: roundTo(coldWalletAfterBch, 4),
    };
    setTreasurySweeps(prev => [event, ...prev].slice(0, 30));
  };

  const executeSweep = (trigger: SweepTrigger, amountBch?: number): boolean => {
    const sweepable = roundTo(Math.max(hotWalletBch - TREASURY_MIN_HOT_RESERVE_BCH, 0), 4);
    if (sweepable <= 0) return false;

    const requested = amountBch == null ? sweepable : roundTo(Math.max(0, amountBch), 4);
    const finalAmount = Math.min(requested, sweepable);
    if (finalAmount <= 0) return false;

    const nextHotWallet = roundTo(hotWalletBch - finalAmount, 4);
    const nextColdWallet = roundTo(coldWalletBch + finalAmount, 4);
    setHotWalletBch(nextHotWallet);
    setColdWalletBch(nextColdWallet);
    recordSweep(finalAmount, trigger, nextHotWallet, nextColdWallet);
    return true;
  };

  const sweepToColdWallet = (amountBch?: number) => executeSweep('manual', amountBch);

  const burnTreasurySupply = (amount: number): boolean => {
    const burnAmount = Math.max(0, Math.floor(amount));
    if (burnAmount <= 0) return false;
    if (burnAmount > treasurySnapshot.availableSupply) return false;
    setAdditionalBurnedTokens(prev => prev + burnAmount);
    return true;
  };

  const mintPendingTransaction = (txId: string): boolean => {
    const target = transactions.find(tx => tx.id === txId);
    if (!target) return false;
    if (target.status !== 'confirmed') return false;
    if (target.tokensGiven > 0) return false;

    const requestedReward = Math.max(5, Math.round(target.fiat * 8));
    const mintable = Math.min(requestedReward, treasurySnapshot.availableSupply);
    if (mintable <= 0) return false;

    setTransactions(prev => prev.map(tx => {
      if (tx.id !== txId) return tx;
      if (tx.status !== 'confirmed' || tx.tokensGiven > 0) return tx;
      return {
        ...tx,
        nftMinted: true,
        tokensGiven: mintable,
        receiptNftId: tx.receiptNftId ?? `NFT-RCP-${tx.id.replace('TX-', '')}`,
      };
    }));

    setActiveCheckout(prev => {
      if (!prev || prev.txId !== txId) return prev;
      return {
        ...prev,
        tokenReward: mintable,
        mintNote: undefined,
      };
    });

    return true;
  };

  const clearPaymentTimers = () => {
    if (broadcastingTimerRef.current) {
      clearTimeout(broadcastingTimerRef.current);
      broadcastingTimerRef.current = null;
    }
    if (confirmationTimerRef.current) {
      clearTimeout(confirmationTimerRef.current);
      confirmationTimerRef.current = null;
    }
  };

  const settleCheckoutAsConfirmed = (session: CheckoutSession) => {
    const randomHeight = 831200 + Math.floor(Math.random() * 500);
    let transitionedToConfirmed = false;
    const mintableFromTreasury = Math.min(session.requestedTokenReward, treasurySnapshot.availableSupply);
    const mintedReward = autoMintEnabled ? mintableFromTreasury : 0;
    const mintNote =
      !autoMintEnabled
        ? 'Auto-mint OFF. Mint this reward from CashToken Treasury.'
        : mintedReward <= 0
          ? 'Treasury supply is depleted. Reward cannot be minted.'
          : undefined;

    setTransactions(prev => prev.map(tx => {
      if (tx.id !== session.txId) return tx;
      if (tx.status === 'confirmed') return tx;
      transitionedToConfirmed = true;
      return {
        ...tx,
        status: 'confirmed',
        nftMinted: mintedReward > 0,
        tokensGiven: mintedReward,
        blockHeight: randomHeight,
        receiptNftId: mintedReward > 0 ? session.receiptNftId : undefined,
      };
    }));

    if (transitionedToConfirmed) {
      if (session.orderLines.length > 0) {
        setProducts(prevProducts => prevProducts.map(product => {
          const orderedLine = session.orderLines.find(line => line.productId === product.id);
          if (!orderedLine) return product;
          if (product.stock === UNLIMITED_STOCK) return product;
          const nextStock = Math.max(0, product.stock - orderedLine.quantity);
          return { ...product, stock: nextStock };
        }));
      }

      const incomingHotWallet = roundTo(hotWalletBch + session.amountBch, 4);
      let nextHotWallet = incomingHotWallet;
      let sweptAmount = 0;

      if (autoSweepEnabled && incomingHotWallet >= sweepThresholdBch) {
        sweptAmount = roundTo(Math.max(incomingHotWallet - TREASURY_MIN_HOT_RESERVE_BCH, 0), 4);
        if (sweptAmount > 0) {
          nextHotWallet = roundTo(incomingHotWallet - sweptAmount, 4);
        }
      }

      setHotWalletBch(nextHotWallet);

      if (sweptAmount > 0) {
        const nextColdWallet = roundTo(coldWalletBch + sweptAmount, 4);
        setColdWalletBch(nextColdWallet);
        recordSweep(sweptAmount, 'auto', nextHotWallet, nextColdWallet);
      }
    }

    setActiveCheckout(prev => {
      if (!prev || prev.txId !== session.txId) return prev;
      if (prev.status === 'confirmed') return prev;
      return {
        ...prev,
        status: 'confirmed',
        tokenReward: mintedReward,
        confirmedAt: Date.now(),
        failureReason: undefined,
        mintNote,
      };
    });

    clearPaymentTimers();
  };

  const settleCheckoutAsFailed = (
    session: CheckoutSession,
    nextStatus: 'failed' | 'expired',
    reason: string,
  ) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id !== session.txId) return tx;
      if (tx.status === 'confirmed') return tx;
      return {
        ...tx,
        status: 'failed',
        nftMinted: false,
        tokensGiven: 0,
        blockHeight: null,
      };
    }));

    setActiveCheckout(prev => {
      if (!prev || prev.txId !== session.txId) return prev;
      if (prev.status === 'confirmed') return prev;
      return {
        ...prev,
        status: nextStatus,
        failureReason: reason,
        mintNote: undefined,
      };
    });

    clearPaymentTimers();
  };

  const startCheckout = () => {
    if (cartLines.length === 0) return;

    clearPaymentTimers();

    const txId = getNextTransactionId(transactions);
    const { date, time } = getNowParts();
    const paymentUri = `${merchantAddress}?amount=${cartTotalBch}`;
    const tokenReward = Math.max(5, Math.round(cartTotalUsd * 8));
    const receiptNftId = `NFT-RCP-${txId.replace('TX-', '')}`;

    const pendingTx: DemoTransaction = {
      id: txId,
      customer: customerWallet.trim() || 'bitcoincash:qunknown',
      items: cartLines.map(line => `${line.product.name} x${line.quantity}`),
      bch: cartTotalBch,
      fiat: cartTotalUsd,
      status: 'pending',
      time,
      date,
      nftMinted: false,
      tokensGiven: 0,
      blockHeight: null,
      source: 'live',
    };

    setTransactions(prev => [pendingTx, ...prev]);
    setActiveCheckout({
      txId,
      customer: pendingTx.customer,
      amountUsd: cartTotalUsd,
      amountBch: cartTotalBch,
      paymentAddress: merchantAddress,
      paymentUri,
      status: 'awaiting_payment',
      requestedTokenReward: tokenReward,
      tokenReward,
      receiptNftId,
      orderLines: cart.map(line => ({ productId: line.productId, quantity: line.quantity })),
      createdAt: Date.now(),
      expiresAt: Date.now() + CHECKOUT_EXPIRY_MS,
      mintNote: undefined,
    });
    setCart([]);
  };

  const submitDemoPayment = () => {
    if (!activeCheckout) return;
    if (activeCheckout.status !== 'awaiting_payment') return;

    if (Date.now() >= activeCheckout.expiresAt) {
      settleCheckoutAsFailed(activeCheckout, 'expired', 'Payment request expired. Generate a new QR.');
      return;
    }

    clearPaymentTimers();

    const checkoutSnapshot = activeCheckout;
    const networkRef = randomNetworkRef(checkoutSnapshot.txId);
    const now = Date.now();

    setActiveCheckout(prev => {
      if (!prev || prev.txId !== checkoutSnapshot.txId) return prev;
      if (prev.status !== 'awaiting_payment') return prev;
      return {
        ...prev,
        status: 'broadcasting',
        paidAt: now,
        networkRef,
        failureReason: undefined,
      };
    });

    const confirmationDelay =
      CONFIRMATION_BASE_DELAY_MS +
      Math.floor(Math.random() * CONFIRMATION_RANDOM_DELAY_MS);

    broadcastingTimerRef.current = setTimeout(() => {
      setActiveCheckout(prev => {
        if (!prev || prev.txId !== checkoutSnapshot.txId) return prev;
        if (prev.status !== 'broadcasting') return prev;
        return { ...prev, status: 'confirming' };
      });
    }, BROADCAST_DELAY_MS);

    confirmationTimerRef.current = setTimeout(() => {
      const expired = Date.now() >= checkoutSnapshot.expiresAt;
      if (expired) {
        settleCheckoutAsFailed(checkoutSnapshot, 'expired', 'Payment window expired before block confirmation.');
        return;
      }

      const shouldConfirm = Math.random() < 0.9;
      if (shouldConfirm) {
        settleCheckoutAsConfirmed(checkoutSnapshot);
        return;
      }

      settleCheckoutAsFailed(checkoutSnapshot, 'failed', 'Network timeout while waiting for confirmation.');
    }, BROADCAST_DELAY_MS + confirmationDelay);
  };

  const clearCheckoutSession = () => {
    clearPaymentTimers();
    setActiveCheckout(null);
  };

  useEffect(() => {
    return () => {
      clearPaymentTimers();
    };
  }, []);

  useEffect(() => {
    if (!activeCheckout || activeCheckout.status !== 'awaiting_payment') return;
    const remainingMs = activeCheckout.expiresAt - Date.now();
    if (remainingMs <= 0) {
      settleCheckoutAsFailed(activeCheckout, 'expired', 'Payment request expired. Generate a new QR.');
      return;
    }

    const expiryTimer = setTimeout(() => {
      settleCheckoutAsFailed(activeCheckout, 'expired', 'Payment request expired. Generate a new QR.');
    }, remainingMs + 50);

    return () => clearTimeout(expiryTimer);
  }, [activeCheckout]);

  return (
    <DemoDataContext.Provider
      value={{
        products,
        bchUsdRate,
        lastRateSyncAt,
        transactions,
        cartLines,
        cartCount,
        cartTotalUsd,
        cartTotalBch,
        customerWallet,
        activeCheckout,
        dashboardMetrics,
        treasurySnapshot,
        treasurySweeps,
        pendingMintTransactions,
        createProduct,
        updateProduct,
        deleteProduct,
        syncBchRate,
        addToCart,
        updateCartQuantity,
        clearCart,
        setCustomerWallet,
        startCheckout,
        submitDemoPayment,
        clearCheckoutSession,
        setTreasuryAutoMintEnabled,
        setTreasuryAutoSweepEnabled,
        setTreasurySweepThreshold,
        sweepToColdWallet,
        burnTreasurySupply,
        mintPendingTransaction,
      }}
    >
      {children}
    </DemoDataContext.Provider>
  );
}

export function useDemoData() {
  const ctx = useContext(DemoDataContext);
  if (!ctx) throw new Error('useDemoData must be used within DemoDataProvider');
  return ctx;
}
