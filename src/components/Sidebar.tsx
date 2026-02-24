import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Package, Receipt, Coins, Users, UserCog,
  Settings, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Product Catalog', icon: Package },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'treasury', label: 'CashToken Treasury', icon: Coins },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'employees', label: 'Employees', icon: UserCog },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export function Sidebar({ activePage, setActivePage, collapsed, setCollapsed }: SidebarProps) {
  const { isDark } = useTheme();
  const isCompact = collapsed;

  return (
    <aside className={`
      ${isCompact ? 'w-[82px] p-2.5' : 'w-[82px] p-2.5 lg:w-[282px] lg:p-4'}
      fixed left-0 top-0 z-40 transition-[width,padding] duration-250 ease-out
    `}>
      <div className={`neo-panel sidebar-frame flex flex-col overflow-hidden ${isCompact ? 'rounded-[26px]' : ''}`}>
        <div className={`flex ${isCompact ? 'justify-center px-2 py-3' : 'items-center gap-3 px-3 py-4'} ${isDark ? 'border-b border-white/10' : 'border-b border-nexus-border-light/70'}`}>
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-green to-nexus-cyan shadow-lg shadow-nexus-green/20">
            <Zap className="h-5 w-5 text-white" fill="white" />
          </div>
          {!isCompact && (
            <div className="hidden overflow-hidden lg:block">
              <h1 className={`truncate text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-nexus-text-light'}`}>
                NexusCash
              </h1>
              <p className="font-['Space_Grotesk'] text-[10px] uppercase tracking-[0.28em] text-nexus-green">
                Commerce OS
              </p>
            </div>
          )}
        </div>

        {!isCompact && (
          <div className={`px-3 pt-3 text-[10px] font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-nexus-gray' : 'text-nexus-sub-light'}`}>
            <span className="hidden lg:block">Navigation</span>
          </div>
        )}

        <nav className={`flex-1 overflow-y-auto ${isCompact ? 'space-y-1 px-1.5 py-2' : 'space-y-1.5 px-2 py-2'}`}>
          {navItems.map(item => {
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`
                  neo-nav-item flex items-center text-sm font-medium transition-all duration-150 cursor-pointer
                  ${isCompact ? 'mx-auto h-11 w-11 justify-center rounded-2xl px-0 py-0' : 'w-full gap-3 px-3 py-2.5'}
                  ${active
                    ? 'neo-nav-item-active text-nexus-green'
                    : isDark
                      ? 'text-nexus-gray hover:text-white'
                      : 'text-nexus-sub-light hover:text-nexus-text-light'}
                `}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-nexus-green' : ''}`} />
                {!isCompact && <span className="hidden truncate lg:block">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className={`px-2 py-2.5 ${isDark ? 'border-t border-white/10' : 'border-t border-nexus-border-light/70'}`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`neo-icon-btn flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer ${
              isCompact
                ? `mx-auto h-10 w-10 rounded-2xl p-0 ${isDark ? 'text-nexus-gray hover:text-white' : 'text-nexus-sub-light hover:text-nexus-text-light'}`
                : `w-full px-3 py-2 ${isDark ? 'text-nexus-gray hover:text-white' : 'text-nexus-sub-light hover:text-nexus-text-light'}`
            }`}
          >
            {isCompact ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden lg:block">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
