import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Bell, Search, Wallet } from 'lucide-react';

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  products: 'Product Catalog',
  transactions: 'Transactions',
  treasury: 'CashToken Treasury',
  customers: 'Customers',
  employees: 'Employee Management',
  settings: 'Settings',
};

export function Header({ activePage }: { activePage: string }) {
  const { isDark, toggleTheme } = useTheme();
  const title = pageTitles[activePage] || 'Dashboard';

  return (
    <header className="neo-panel neo-header sticky top-3 z-30 flex min-h-18 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
      <div className="min-w-0">
        <p className={`font-['Space_Grotesk'] text-[10px] uppercase tracking-[0.28em] ${isDark ? 'text-nexus-gray' : 'text-nexus-sub-light'}`}>
          N-Cash Control
        </p>
        <h2 className={`truncate text-lg font-bold ${isDark ? 'text-white' : 'text-nexus-text-light'}`}>
          {title}
        </h2>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <div className={`neo-input hidden items-center gap-2 px-3 py-2 text-sm md:flex ${isDark ? 'text-nexus-gray' : 'text-nexus-sub-light'}`}>
          <Search className="h-4 w-4" />
          <input
            type="text"
            placeholder="Search..."
            className={`w-40 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-nexus-gray' : 'text-nexus-text-light placeholder-nexus-sub-light'}`}
          />
        </div>

        {/* Wallet status */}
        <div className={`neo-wallet-pill hidden items-center gap-2 px-3 py-2 text-xs font-semibold sm:flex ${isDark ? 'text-nexus-green' : 'text-nexus-green-dark'}`}>
          <Wallet className="h-4 w-4" />
          <span>0.842 BCH</span>
        </div>

        {/* Notifications */}
        <button className={`neo-icon-btn relative p-2.5 cursor-pointer ${
          isDark ? 'text-nexus-gray hover:text-white' : 'text-nexus-sub-light hover:text-nexus-text-light'
        }`}>
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-nexus-red" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`neo-icon-btn p-2.5 cursor-pointer ${
            isDark ? 'text-nexus-gray hover:text-white' : 'text-nexus-sub-light hover:text-nexus-text-light'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Avatar */}
        <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-green to-nexus-cyan text-sm font-bold text-white shadow-lg shadow-nexus-green/20">
          O
        </div>
      </div>
    </header>
  );
}
