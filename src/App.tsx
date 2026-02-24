import { useEffect, useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Transactions } from './pages/Transactions';
import { Treasury } from './pages/Treasury';
import { Customers } from './pages/Customers';
import { Employees } from './pages/Employees';
import { Settings } from './pages/Settings';

function AppContent() {
  const { isDark } = useTheme();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 1023px)');
    const syncCollapsed = (event?: MediaQueryListEvent) => {
      setSidebarCollapsed(event ? event.matches : query.matches);
    };
    syncCollapsed();
    query.addEventListener('change', syncCollapsed);
    return () => query.removeEventListener('change', syncCollapsed);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <Products />;
      case 'transactions': return <Transactions />;
      case 'treasury': return <Treasury />;
      case 'customers': return <Customers />;
      case 'employees': return <Employees />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={`app-shell transition-colors duration-300 ${isDark ? 'bg-nexus-onyx' : 'bg-nexus-bg-light'}`}>
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <div
        className={`ml-[82px] min-h-screen transition-[margin-left] duration-250 ease-out ${sidebarCollapsed ? 'lg:ml-[82px]' : 'lg:ml-[282px]'}`}
      >
        <div className="px-3 pt-3 sm:px-5 sm:pt-5">
          <Header activePage={activePage} />
        </div>
        <main className="p-3 sm:p-5">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
