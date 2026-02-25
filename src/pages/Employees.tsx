import { type FormEvent, useMemo, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Plus,
  Shield,
  ShieldCheck,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Clock,
  Receipt,
  UserCog,
  Search,
  X,
} from 'lucide-react';
import { useDemoData, type DemoEmployee, type EmployeeRole, type EmployeeShift, type EmployeeStatus, type DemoTransaction } from '../context/DemoDataContext';

interface EmployeeForm {
  name: string;
  email: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  shift: EmployeeShift;
}

interface EmployeePerformance {
  transactions: number;
  lastActiveAt: number | null;
}

const shifts: EmployeeShift[] = ['Morning (08:00-15:00)', 'Evening (15:00-22:00)', 'All'];

function txTimestamp(tx: DemoTransaction): number {
  const parsed = Date.parse(`${tx.date}T${tx.time}:00`);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function relativeTime(timestamp: number | null): string {
  if (!timestamp) return 'No activity';
  const now = Date.now();
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (seconds < 60) return 'Now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

function defaultForm(): EmployeeForm {
  return {
    name: '',
    email: '',
    role: 'cashier',
    status: 'active',
    shift: 'Morning (08:00-15:00)',
  };
}

export function Employees() {
  const { isDark } = useTheme();
  const {
    employees,
    transactions,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployeeStatus,
  } = useDemoData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | EmployeeRole>('all');
  const [form, setForm] = useState<EmployeeForm>(defaultForm);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const cardBg = 'neo-panel';
  const textMain = isDark ? 'text-white' : 'text-nexus-text-light';
  const textSub = isDark ? 'text-nexus-gray' : 'text-nexus-sub-light';

  const performanceMap = useMemo(() => {
    const map = new Map<string, EmployeePerformance>();
    employees.forEach(employee => {
      map.set(employee.id, { transactions: 0, lastActiveAt: null });
    });

    const assignableCashiers = employees.filter(employee => employee.role === 'cashier');
    if (assignableCashiers.length === 0) return map;

    const ordered = [...transactions]
      .filter(tx => tx.status !== 'failed')
      .sort((left, right) => txTimestamp(left) - txTimestamp(right));

    ordered.forEach(tx => {
      const numeric = Number(tx.id.replace(/\D/g, ''));
      const index = Number.isFinite(numeric) ? numeric % assignableCashiers.length : 0;
      const assignee = assignableCashiers[index];
      const snapshot = map.get(assignee.id);
      if (!snapshot) return;
      snapshot.transactions += 1;
      const ts = txTimestamp(tx);
      snapshot.lastActiveAt = snapshot.lastActiveAt == null ? ts : Math.max(snapshot.lastActiveAt, ts);
    });

    return map;
  }, [employees, transactions]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee =>
      (roleFilter === 'all' || employee.role === roleFilter) &&
      [employee.name, employee.email, employee.id].join(' ').toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [employees, roleFilter, searchTerm]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(defaultForm());
    setShowForm(true);
  };

  const openEditForm = (employee: DemoEmployee) => {
    setEditingId(employee.id);
    setForm({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      status: employee.status,
      shift: employee.shift,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingId(null);
    setForm(defaultForm());
    setShowForm(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      name: form.name,
      email: form.email,
      role: form.role,
      status: form.status,
      shift: form.shift,
    };

    const result = editingId
      ? updateEmployee(editingId, payload)
      : createEmployee(payload);

    if (!result.ok) {
      setFeedback({ tone: 'error', message: result.error });
      return;
    }

    setFeedback({ tone: 'success', message: editingId ? 'Employee updated.' : 'Employee added.' });
    closeForm();
  };

  const handleDelete = (employee: DemoEmployee) => {
    const confirmed = window.confirm(`Delete employee ${employee.name}?`);
    if (!confirmed) return;
    const result = deleteEmployee(employee.id);
    if (!result.ok) {
      setFeedback({ tone: 'error', message: result.error });
      return;
    }
    setFeedback({ tone: 'success', message: 'Employee deleted.' });
  };

  const handleToggle = (employee: DemoEmployee) => {
    const result = toggleEmployeeStatus(employee.id);
    if (!result.ok) {
      setFeedback({ tone: 'error', message: result.error });
      return;
    }
    setFeedback({
      tone: 'success',
      message: `${employee.name} is now ${employee.status === 'active' ? 'inactive' : 'active'}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={`rounded-2xl p-5 ${cardBg}`}>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-green/10">
              <ShieldCheck className="h-5 w-5 text-nexus-green" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${textMain}`}>Owner</h4>
              <p className={`text-xs ${textSub}`}>Full system access</p>
            </div>
          </div>
          <ul className={`space-y-1.5 text-xs ${textSub}`}>
            <li>- Can update product pricing</li>
            <li>- Can withdraw and sweep BCH</li>
            <li>- Can manage staff and settings</li>
            <li>- Can access analytics and reports</li>
          </ul>
        </div>
        <div className={`rounded-2xl p-5 ${cardBg}`}>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-cyan/10">
              <Shield className="h-5 w-5 text-nexus-cyan" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${textMain}`}>Cashier</h4>
              <p className={`text-xs ${textSub}`}>Restricted access</p>
            </div>
          </div>
          <ul className={`space-y-1.5 text-xs ${textSub}`}>
            <li>- Can process sales transactions</li>
            <li>- Can generate payment QR codes</li>
            <li>- Cannot change product prices</li>
            <li>- Cannot withdraw funds</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
            isDark ? 'bg-white/5' : 'border border-nexus-border-light bg-white'
          }`}>
            <Search className="h-4 w-4 text-nexus-gray" />
            <input
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Search employee..."
              className={`w-52 bg-transparent text-sm outline-none ${
                isDark ? 'text-white placeholder-nexus-gray' : 'text-nexus-text-light placeholder-nexus-sub-light'
              }`}
            />
          </div>
          <div className="flex gap-1">
            {([
              { id: 'all', label: 'All' },
              { id: 'owner', label: 'Owner' },
              { id: 'cashier', label: 'Cashier' },
            ] as const).map(option => (
              <button
                key={option.id}
                onClick={() => setRoleFilter(option.id)}
                className={`rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                  roleFilter === option.id
                    ? 'bg-nexus-green/15 text-nexus-green'
                    : isDark
                      ? 'text-nexus-gray hover:bg-white/5'
                      : 'text-nexus-sub-light hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 rounded-xl bg-nexus-green px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-nexus-green-dark cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      {feedback && (
        <div className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium ${
          feedback.tone === 'success' ? 'bg-nexus-green/15 text-nexus-green' : 'bg-nexus-red/15 text-nexus-red'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="rounded-md p-1 hover:bg-black/10 cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className={`rounded-2xl p-5 ${cardBg}`}>
          <div className="mb-4 flex items-center justify-between">
            <h4 className={`text-sm font-bold ${textMain}`}>{editingId ? 'Edit Employee' : 'Add New Employee'}</h4>
            <button
              type="button"
              onClick={closeForm}
              className={`rounded-lg p-1.5 cursor-pointer ${isDark ? 'bg-white/10 text-nexus-gray' : 'bg-gray-100 text-nexus-sub-light'}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <input
              value={form.name}
              onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
              placeholder="Full Name"
              className={`rounded-xl border px-3 py-2.5 text-sm outline-none ${
                isDark ? 'border-white/10 bg-white/5 text-white' : 'border-nexus-border-light bg-gray-50 text-nexus-text-light'
              }`}
            />
            <input
              value={form.email}
              onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))}
              placeholder="Email"
              className={`rounded-xl border px-3 py-2.5 text-sm outline-none ${
                isDark ? 'border-white/10 bg-white/5 text-white' : 'border-nexus-border-light bg-gray-50 text-nexus-text-light'
              }`}
            />
            <select
              value={form.role}
              onChange={event => setForm(prev => ({ ...prev, role: event.target.value as EmployeeRole }))}
              className={`rounded-xl border px-3 py-2.5 text-sm outline-none ${
                isDark ? 'border-white/10 bg-white/5 text-white' : 'border-nexus-border-light bg-gray-50 text-nexus-text-light'
              }`}
            >
              <option value="cashier">Cashier</option>
              <option value="owner">Owner</option>
            </select>
            <select
              value={form.shift}
              onChange={event => setForm(prev => ({ ...prev, shift: event.target.value as EmployeeShift }))}
              className={`rounded-xl border px-3 py-2.5 text-sm outline-none ${
                isDark ? 'border-white/10 bg-white/5 text-white' : 'border-nexus-border-light bg-gray-50 text-nexus-text-light'
              }`}
            >
              {shifts.map(shift => (
                <option key={shift} value={shift}>{shift}</option>
              ))}
            </select>
            <select
              value={form.status}
              onChange={event => setForm(prev => ({ ...prev, status: event.target.value as EmployeeStatus }))}
              className={`rounded-xl border px-3 py-2.5 text-sm outline-none ${
                isDark ? 'border-white/10 bg-white/5 text-white' : 'border-nexus-border-light bg-gray-50 text-nexus-text-light'
              }`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="rounded-xl bg-nexus-green px-4 py-2 text-xs font-semibold text-white hover:bg-nexus-green-dark cursor-pointer">
              {editingId ? 'Update Employee' : 'Save Employee'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className={`rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer ${
                isDark ? 'bg-white/5 text-nexus-gray' : 'bg-gray-100 text-nexus-sub-light'
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {filteredEmployees.map(employee => {
          const performance = performanceMap.get(employee.id) ?? { transactions: 0, lastActiveAt: null };
          return (
            <div key={employee.id} className={`rounded-2xl p-5 transition-all ${cardBg}`}>
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white font-bold ${
                    employee.role === 'owner' ? 'bg-gradient-to-br from-nexus-green to-nexus-cyan' : isDark ? 'bg-white/10' : 'bg-gray-200'
                  }`}>
                    {employee.role === 'owner' ? <ShieldCheck className="h-6 w-6" /> : <UserCog className={`h-6 w-6 ${isDark ? 'text-nexus-gray' : 'text-nexus-sub-light'}`} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold ${textMain}`}>{employee.name}</h4>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        employee.role === 'owner' ? 'bg-nexus-green/15 text-nexus-green' : 'bg-nexus-cyan/15 text-nexus-cyan'
                      }`}>
                        {employee.role}
                      </span>
                      <span className={`h-2 w-2 rounded-full ${employee.status === 'active' ? 'bg-nexus-green' : 'bg-nexus-gray'}`} />
                    </div>
                    <p className={`text-xs ${textSub}`}>{employee.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Receipt className={`h-3 w-3 ${textSub}`} />
                      <span className={`text-sm font-bold ${textMain}`}>{performance.transactions}</span>
                    </div>
                    <p className={`text-[10px] ${textSub}`}>Transactions</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Clock className={`h-3 w-3 ${textSub}`} />
                      <span className={`text-xs font-medium ${textMain}`}>{relativeTime(performance.lastActiveAt)}</span>
                    </div>
                    <p className={`text-[10px] ${textSub}`}>{employee.shift}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleToggle(employee)}
                      className={`rounded-lg p-2 transition-all cursor-pointer ${isDark ? 'text-nexus-gray hover:bg-white/5' : 'text-nexus-sub-light hover:bg-gray-100'}`}
                    >
                      {employee.status === 'active' ? <ToggleRight className="h-5 w-5 text-nexus-green" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => openEditForm(employee)}
                      className={`rounded-lg p-2 transition-all cursor-pointer ${isDark ? 'text-nexus-gray hover:bg-white/5' : 'text-nexus-sub-light hover:bg-gray-100'}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(employee)}
                      className="rounded-lg p-2 text-nexus-red transition-all hover:bg-nexus-red/10 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
