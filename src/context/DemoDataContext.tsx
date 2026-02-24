import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
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
  status: 'awaiting_payment' | 'confirmed' | 'failed';
  tokenReward: number;
  receiptNftId: string;
  orderLines: Array<{ productId: string; quantity: number }>;
}

interface DashboardMetrics {
  totalBch: number;
  totalTransactions: number;
  mintedTokens: number;
  activeCustomers: number;
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
  createProduct: (input: Omit<DemoProduct, 'id' | 'priceBch'>) => void;
  updateProduct: (productId: string, patch: Partial<Omit<DemoProduct, 'id'>>) => void;
  deleteProduct: (productId: string) => void;
  syncBchRate: () => void;
  addToCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCustomerWallet: (wallet: string) => void;
  startCheckout: () => void;
  simulateConfirmPayment: () => void;
  simulateFailedPayment: () => void;
  clearCheckoutSession: () => void;
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

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [bchUsdRate, setBchUsdRate] = useState<number>(BCH_TO_USD);
  const [lastRateSyncAt, setLastRateSyncAt] = useState<Date | null>(new Date());
  const [products, setProducts] = useState<DemoProduct[]>(() => withRate(demoProducts, BCH_TO_USD));
  const [transactions, setTransactions] = useState<DemoTransaction[]>(() => createSeedTransactions());
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerWallet, setCustomerWallet] = useState('bitcoincash:qrx9...newbuyer');
  const [activeCheckout, setActiveCheckout] = useState<CheckoutSession | null>(null);

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

  const startCheckout = () => {
    if (cartLines.length === 0) return;

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
      tokenReward,
      receiptNftId,
      orderLines: cart.map(line => ({ productId: line.productId, quantity: line.quantity })),
    });
    setCart([]);
  };

  const simulateConfirmPayment = () => {
    if (!activeCheckout) return;
    const randomHeight = 831200 + Math.floor(Math.random() * 500);

    setTransactions(prev => prev.map(tx => {
      if (tx.id !== activeCheckout.txId) return tx;
      return {
        ...tx,
        status: 'confirmed',
        nftMinted: true,
        tokensGiven: activeCheckout.tokenReward,
        blockHeight: randomHeight,
        receiptNftId: activeCheckout.receiptNftId,
      };
    }));

    if (activeCheckout.orderLines.length > 0) {
      setProducts(prevProducts => prevProducts.map(product => {
        const orderedLine = activeCheckout.orderLines.find(line => line.productId === product.id);
        if (!orderedLine) return product;
        if (product.stock === UNLIMITED_STOCK) return product;
        const nextStock = Math.max(0, product.stock - orderedLine.quantity);
        return { ...product, stock: nextStock };
      }));
    }

    setActiveCheckout(prev => prev ? { ...prev, status: 'confirmed' } : null);
  };

  const simulateFailedPayment = () => {
    if (!activeCheckout) return;

    setTransactions(prev => prev.map(tx => {
      if (tx.id !== activeCheckout.txId) return tx;
      return {
        ...tx,
        status: 'failed',
        nftMinted: false,
        tokensGiven: 0,
        blockHeight: null,
      };
    }));

    setActiveCheckout(prev => prev ? { ...prev, status: 'failed' } : null);
  };

  const clearCheckoutSession = () => setActiveCheckout(null);

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
        createProduct,
        updateProduct,
        deleteProduct,
        syncBchRate,
        addToCart,
        updateCartQuantity,
        clearCart,
        setCustomerWallet,
        startCheckout,
        simulateConfirmPayment,
        simulateFailedPayment,
        clearCheckoutSession,
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
