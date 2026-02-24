import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Plus, Search, Edit2, Trash2, Package, RefreshCw } from 'lucide-react';
import { BCH_TO_USD, formatUsd } from '../utils/currency';
import { useDemoData } from '../context/DemoDataContext';

export function Products({ onOpenCheckout }: { onOpenCheckout: () => void }) {
  const { isDark } = useTheme();
  const { products, addToCart, cartCount } = useDemoData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const cardBg = 'neo-panel';
  const textMain = isDark ? 'text-white' : 'text-nexus-text-light';
  const textSub = isDark ? 'text-nexus-gray' : 'text-nexus-sub-light';

  const categories = ['All', 'Food', 'Beverage'];
  const filtered = products.filter(p =>
    (selectedCategory === 'All' || p.category === selectedCategory) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className={`flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5 text-sm sm:w-72
            ${isDark ? 'bg-white/5 text-nexus-gray' : 'border border-nexus-border-light bg-white text-nexus-sub-light'}
          `}>
            <Search className="h-4 w-4 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-nexus-gray' : 'text-nexus-text-light placeholder-nexus-sub-light'}`}
            />
          </div>
          <div className="flex gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-medium transition-all cursor-pointer
                  ${selectedCategory === cat ? 'bg-nexus-green/15 text-nexus-green' : isDark ? 'text-nexus-gray hover:bg-white/5' : 'border border-nexus-border-light bg-white text-nexus-sub-light hover:bg-gray-100'}
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all cursor-pointer
            ${isDark ? 'bg-white/5 text-nexus-gray hover:text-white' : 'border border-nexus-border-light bg-white text-nexus-sub-light hover:text-nexus-text-light'}
          `}>
            <RefreshCw className="h-3.5 w-3.5" /> Sync BCH Price
          </button>
          <button
            onClick={onOpenCheckout}
            className="flex items-center gap-2 rounded-xl bg-nexus-green px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-nexus-green-dark cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Checkout ({cartCount})
          </button>
        </div>
      </div>

      <div className={`flex flex-col items-start justify-between gap-3 rounded-2xl p-4 sm:flex-row sm:items-center ${cardBg}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-cyan/10">
            <RefreshCw className="h-5 w-5 text-nexus-cyan" />
          </div>
          <div>
            <p className={`text-sm font-bold ${textMain}`}>Auto Conversion Engine</p>
            <p className={`text-xs ${textSub}`}>1 BCH = {formatUsd(BCH_TO_USD)} | Updated 30s ago | Slippage: 0.5%</p>
          </div>
        </div>
        <span className="rounded-lg bg-nexus-green/15 px-3 py-1.5 text-[10px] font-bold uppercase text-nexus-green">Live</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(product => (
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
                    onClick={() => addToCart(product.id)}
                    className="rounded-lg bg-nexus-green/15 px-2 py-2 text-[10px] font-semibold text-nexus-green transition-all hover:bg-nexus-green/25 cursor-pointer"
                  >
                    Add
                  </button>
                  <button className={`rounded-lg p-2 transition-all cursor-pointer ${isDark ? 'text-nexus-gray hover:bg-white/5' : 'text-nexus-sub-light hover:bg-gray-100'}`}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button className="rounded-lg p-2 text-nexus-red transition-all hover:bg-nexus-red/10 cursor-pointer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className={`mt-3 flex items-center gap-1.5 text-[10px] ${textSub}`}>
                <Package className="h-3 w-3" />
                <span>Stock: {product.stock === 999 ? 'Unlimited' : product.stock}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
