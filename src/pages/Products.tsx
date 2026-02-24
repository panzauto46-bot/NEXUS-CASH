import { type FormEvent, useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  RefreshCw,
  Save,
  X,
  CircleCheck,
  CircleAlert,
} from 'lucide-react';
import { formatUsd } from '../utils/currency';
import { useDemoData, type DemoProduct } from '../context/DemoDataContext';

type CategoryFilter = 'All' | 'Food' | 'Beverage';
type EditorMode = 'create' | 'edit';

interface ProductForm {
  name: string;
  sku: string;
  category: 'Food' | 'Beverage';
  price: string;
  stock: string;
  unlimitedStock: boolean;
  image: string;
}

const UNLIMITED_STOCK = 999;

function initialsFromName(name: string): string {
  const value = name.trim();
  if (!value) return 'NP';
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function buildAutoSku(category: 'Food' | 'Beverage', products: DemoProduct[], editingId?: string): string {
  const prefix = category === 'Food' ? 'FOD' : 'BEV';
  const used = new Set(
    products
      .filter(product => product.id !== editingId)
      .map(product => product.sku.toUpperCase()),
  );

  let index = 1;
  while (index < 9999) {
    const candidate = `${prefix}-${String(index).padStart(3, '0')}`;
    if (!used.has(candidate)) return candidate;
    index += 1;
  }
  return `${prefix}-9999`;
}

function getEmptyForm(products: DemoProduct[]): ProductForm {
  return {
    name: '',
    sku: buildAutoSku('Food', products),
    category: 'Food',
    price: '',
    stock: '0',
    unlimitedStock: false,
    image: '',
  };
}

export function Products({ onOpenCheckout }: { onOpenCheckout: () => void }) {
  const { isDark } = useTheme();
  const {
    products,
    cartLines,
    addToCart,
    cartCount,
    bchUsdRate,
    lastRateSyncAt,
    syncBchRate,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useDemoData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [editorMode, setEditorMode] = useState<EditorMode>('create');
  const [editorProductId, setEditorProductId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [form, setForm] = useState<ProductForm>(() => getEmptyForm(products));

  const cardBg = 'neo-panel';
  const textMain = isDark ? 'text-white' : 'text-nexus-text-light';
  const textSub = isDark ? 'text-nexus-gray' : 'text-nexus-sub-light';
  const categories: CategoryFilter[] = ['All', 'Food', 'Beverage'];

  const inCartByProductId = useMemo(() => {
    const map = new Map<string, number>();
    for (const line of cartLines) map.set(line.product.id, line.quantity);
    return map;
  }, [cartLines]);

  const filtered = useMemo(() => {
    return products.filter(product =>
      (selectedCategory === 'All' || product.category === selectedCategory) &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [products, selectedCategory, searchTerm]);

  const lastSyncLabel = useMemo(() => {
    if (!lastRateSyncAt) return 'never';
    return lastRateSyncAt.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [lastRateSyncAt]);

  const resetForm = () => {
    setForm(getEmptyForm(products));
    setFormError('');
  };

  const openCreateEditor = () => {
    setEditorMode('create');
    setEditorProductId(null);
    setForm(getEmptyForm(products));
    setFormError('');
    setIsEditorOpen(true);
  };

  const openEditEditor = (product: DemoProduct) => {
    setEditorMode('edit');
    setEditorProductId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: String(product.price),
      stock: product.stock === UNLIMITED_STOCK ? '0' : String(product.stock),
      unlimitedStock: product.stock === UNLIMITED_STOCK,
      image: product.image,
    });
    setFormError('');
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditorProductId(null);
    setFormError('');
    resetForm();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    const name = form.name.trim();
    const price = Number(form.price);
    const stock = form.unlimitedStock ? UNLIMITED_STOCK : Number(form.stock);
    const sku = (form.sku.trim() || buildAutoSku(form.category, products, editorProductId ?? undefined)).toUpperCase();
    const image = form.image.trim().toUpperCase() || initialsFromName(name);

    if (!name) {
      setFormError('Product name wajib diisi.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Harga USD harus lebih dari 0.');
      return;
    }
    if (!form.unlimitedStock && (!Number.isFinite(stock) || stock < 0)) {
      setFormError('Stock harus angka 0 atau lebih.');
      return;
    }

    const payload = {
      name,
      sku,
      category: form.category,
      price,
      stock: form.unlimitedStock ? UNLIMITED_STOCK : Math.round(stock),
      image,
    };

    if (editorMode === 'create') {
      createProduct(payload);
      setNotice({ kind: 'success', message: 'Product baru berhasil ditambahkan.' });
    } else if (editorProductId) {
      updateProduct(editorProductId, payload);
      setNotice({ kind: 'success', message: 'Product berhasil diupdate.' });
    }

    closeEditor();
  };

  const handleSyncRate = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    window.setTimeout(() => {
      syncBchRate();
      setIsSyncing(false);
      setNotice({ kind: 'success', message: 'Kurs BCH berhasil disinkronkan.' });
    }, 450);
  };

  const handleDelete = (product: DemoProduct) => {
    const confirmed = window.confirm(`Delete "${product.name}" dari product catalog?`);
    if (!confirmed) return;
    deleteProduct(product.id);
    setNotice({ kind: 'success', message: `Product "${product.name}" berhasil dihapus.` });
  };

  const handleAddToCart = (product: DemoProduct) => {
    const inCart = inCartByProductId.get(product.id) ?? 0;
    const remaining = product.stock === UNLIMITED_STOCK ? Infinity : product.stock - inCart;
    if (remaining <= 0) {
      setNotice({ kind: 'error', message: `Stock "${product.name}" habis untuk cart saat ini.` });
      return;
    }
    addToCart(product.id);
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
            notice.kind === 'success'
              ? 'bg-nexus-green/15 text-nexus-green'
              : 'bg-nexus-red/15 text-nexus-red'
          }`}
        >
          {notice.kind === 'success' ? <CircleCheck className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}
          <span>{notice.message}</span>
          <button
            onClick={() => setNotice(null)}
            className="ml-auto rounded-md p-1 transition-all hover:bg-black/10 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div
            className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm sm:w-72 ${
              isDark
                ? 'bg-white/5 text-nexus-gray'
                : 'border border-nexus-border-light bg-white text-nexus-sub-light'
            }`}
          >
            <Search className="h-4 w-4 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              className={`w-full bg-transparent text-sm outline-none ${
                isDark ? 'text-white placeholder-nexus-gray' : 'text-nexus-text-light placeholder-nexus-sub-light'
              }`}
            />
          </div>
          <div className="flex gap-1">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-nexus-green/15 text-nexus-green'
                    : isDark
                      ? 'text-nexus-gray hover:bg-white/5'
                      : 'border border-nexus-border-light bg-white text-nexus-sub-light hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-nowrap">
          <button
            onClick={handleSyncRate}
            disabled={isSyncing}
            className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
              isDark
                ? 'bg-white/5 text-nexus-gray hover:text-white'
                : 'border border-nexus-border-light bg-white text-nexus-sub-light hover:text-nexus-text-light'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync BCH Price'}
          </button>
          <button
            onClick={openCreateEditor}
            className="flex items-center gap-2 rounded-xl bg-nexus-cyan/20 px-3 py-2.5 text-xs font-semibold text-nexus-cyan transition-all hover:bg-nexus-cyan/30 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
          <button
            onClick={onOpenCheckout}
            className="flex items-center gap-2 rounded-xl bg-nexus-green px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-nexus-green-dark cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Checkout ({cartCount})
          </button>
        </div>
      </div>

      {isEditorOpen && (
        <form onSubmit={handleSubmit} className={`rounded-2xl p-4 ${cardBg}`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-nexus-cyan">
                {editorMode === 'create' ? 'Create Product' : 'Edit Product'}
              </p>
              <p className={`text-xs ${textSub}`}>
                {editorMode === 'create' ? 'Tambahkan item baru ke katalog demo.' : 'Ubah data produk langsung di katalog demo.'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={closeEditor}
                className={`rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer ${
                  isDark ? 'bg-white/10 text-nexus-gray hover:text-white' : 'bg-gray-100 text-nexus-sub-light hover:text-nexus-text-light'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-nexus-green px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-nexus-green-dark cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                {editorMode === 'create' ? 'Save Product' : 'Update Product'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input
              value={form.name}
              onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
              placeholder="Product name"
              className={`rounded-xl border px-3 py-2 text-xs outline-none ${
                isDark
                  ? 'border-white/10 bg-white/5 text-white placeholder-nexus-gray'
                  : 'border-nexus-border-light bg-white text-nexus-text-light placeholder-nexus-sub-light'
              }`}
            />
            <input
              value={form.sku}
              onChange={event => setForm(prev => ({ ...prev, sku: event.target.value }))}
              placeholder="SKU (auto if empty)"
              className={`rounded-xl border px-3 py-2 text-xs outline-none ${
                isDark
                  ? 'border-white/10 bg-white/5 text-white placeholder-nexus-gray'
                  : 'border-nexus-border-light bg-white text-nexus-text-light placeholder-nexus-sub-light'
              }`}
            />
            <select
              value={form.category}
              onChange={event =>
                setForm(prev => ({
                  ...prev,
                  category: event.target.value as 'Food' | 'Beverage',
                  sku: prev.sku || buildAutoSku(event.target.value as 'Food' | 'Beverage', products, editorProductId ?? undefined),
                }))
              }
              className={`rounded-xl border px-3 py-2 text-xs outline-none ${
                isDark
                  ? 'border-white/10 bg-white/5 text-white'
                  : 'border-nexus-border-light bg-white text-nexus-text-light'
              }`}
            >
              <option value="Food">Food</option>
              <option value="Beverage">Beverage</option>
            </select>
            <input
              value={form.image}
              onChange={event => setForm(prev => ({ ...prev, image: event.target.value.slice(0, 2) }))}
              placeholder="Image initials (ex: AM)"
              className={`rounded-xl border px-3 py-2 text-xs outline-none ${
                isDark
                  ? 'border-white/10 bg-white/5 text-white placeholder-nexus-gray'
                  : 'border-nexus-border-light bg-white text-nexus-text-light placeholder-nexus-sub-light'
              }`}
            />
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={event => setForm(prev => ({ ...prev, price: event.target.value }))}
              placeholder="USD price"
              className={`rounded-xl border px-3 py-2 text-xs outline-none ${
                isDark
                  ? 'border-white/10 bg-white/5 text-white placeholder-nexus-gray'
                  : 'border-nexus-border-light bg-white text-nexus-text-light placeholder-nexus-sub-light'
              }`}
            />
            <input
              type="number"
              min="0"
              step="1"
              disabled={form.unlimitedStock}
              value={form.unlimitedStock ? '' : form.stock}
              onChange={event => setForm(prev => ({ ...prev, stock: event.target.value }))}
              placeholder="Stock"
              className={`rounded-xl border px-3 py-2 text-xs outline-none disabled:opacity-60 ${
                isDark
                  ? 'border-white/10 bg-white/5 text-white placeholder-nexus-gray'
                  : 'border-nexus-border-light bg-white text-nexus-text-light placeholder-nexus-sub-light'
              }`}
            />
            <label className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
              isDark ? 'border-white/10 bg-white/5 text-nexus-gray' : 'border-nexus-border-light bg-white text-nexus-sub-light'
            }`}>
              <input
                type="checkbox"
                checked={form.unlimitedStock}
                onChange={event => setForm(prev => ({ ...prev, unlimitedStock: event.target.checked }))}
                className="h-3.5 w-3.5"
              />
              Unlimited stock
            </label>
            <div className={`flex items-center rounded-xl px-3 py-2 text-[11px] ${textSub}`}>
              Preview BCH: {Number(form.price) > 0 ? `${(Number(form.price) / bchUsdRate).toFixed(4)} BCH` : '-'}
            </div>
          </div>

          {formError && (
            <p className="mt-3 text-xs font-medium text-nexus-red">{formError}</p>
          )}
        </form>
      )}

      <div className={`flex flex-col items-start justify-between gap-3 rounded-2xl p-4 sm:flex-row sm:items-center ${cardBg}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-cyan/10">
            <RefreshCw className="h-5 w-5 text-nexus-cyan" />
          </div>
          <div>
            <p className={`text-sm font-bold ${textMain}`}>Auto Conversion Engine</p>
            <p className={`text-xs ${textSub}`}>
              1 BCH = {formatUsd(bchUsdRate)} | Updated {lastSyncLabel} | Slippage: 0.5%
            </p>
          </div>
        </div>
        <span className="rounded-lg bg-nexus-green/15 px-3 py-1.5 text-[10px] font-bold uppercase text-nexus-green">Live</span>
      </div>

      {filtered.length === 0 && (
        <div className={`rounded-2xl p-6 text-center ${cardBg}`}>
          <p className={`text-sm font-semibold ${textMain}`}>No products found</p>
          <p className={`mt-1 text-xs ${textSub}`}>Coba ubah search/filter atau tambah produk baru.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(product => {
          const inCart = inCartByProductId.get(product.id) ?? 0;
          const availableStock = product.stock === UNLIMITED_STOCK ? Infinity : Math.max(product.stock - inCart, 0);
          const isOutOfStock = availableStock === 0;
          const stockLabel = product.stock === UNLIMITED_STOCK ? 'Unlimited' : String(product.stock);
          return (
            <div key={product.id} className={`overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] ${cardBg}`}>
              <div className={`flex h-32 items-center justify-center ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                <span className={`rounded-xl px-4 py-2 font-['Space_Grotesk'] text-xl font-bold tracking-[0.22em] ${isDark ? 'bg-white/5 text-nexus-cyan' : 'bg-white text-nexus-green'}`}>
                  {product.image}
                </span>
              </div>
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h4 className={`text-sm font-bold ${textMain}`}>{product.name}</h4>
                    <p className={`text-[10px] font-mono ${textSub}`}>{product.sku}</p>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${isDark ? 'bg-white/5 text-nexus-gray' : 'bg-gray-100 text-nexus-sub-light'}`}>
                    {product.category}
                  </span>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className={`text-lg font-bold ${textMain}`}>{formatUsd(product.price)}</p>
                    <p className="text-xs font-semibold text-nexus-green">{product.priceBch} BCH</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className={`rounded-lg px-2 py-2 text-[10px] font-semibold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                        isOutOfStock
                          ? 'bg-nexus-red/10 text-nexus-red'
                          : 'bg-nexus-green/15 text-nexus-green hover:bg-nexus-green/25'
                      }`}
                    >
                      {isOutOfStock ? 'Full' : 'Add'}
                    </button>
                    <button
                      onClick={() => openEditEditor(product)}
                      className={`rounded-lg p-2 transition-all cursor-pointer ${
                        isDark ? 'text-nexus-gray hover:bg-white/5' : 'text-nexus-sub-light hover:bg-gray-100'
                      }`}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="rounded-lg p-2 text-nexus-red transition-all hover:bg-nexus-red/10 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className={`mt-3 flex items-center gap-1.5 text-[10px] ${textSub}`}>
                  <Package className="h-3 w-3" />
                  <span>Stock: {stockLabel}</span>
                  {inCart > 0 && <span>| In cart: {inCart}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
