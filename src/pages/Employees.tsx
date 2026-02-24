import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Plus, Shield, ShieldCheck, Edit2, Trash2, ToggleLeft, ToggleRight, Clock, Receipt, UserCog } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  role: 'owner' | 'cashier';
  status: 'active' | 'inactive';
  email: string;
  transactions: number;
  lastActive: string;
  shift: string;
}

const employees: Employee[] = [
  { id: 1, name: 'Ahmad Rizky', role: 'owner', status: 'active', email: 'ahmad@ncash.io', transactions: 0, lastActive: 'Now', shift: 'All' },
  { id: 2, name: 'Siti Nurhaliza', role: 'cashier', status: 'active', email: 'siti@ncash.io', transactions: 45, lastActive: '5 min ago', shift: 'Morning (08:00-15:00)' },
  { id: 3, name: 'Budi Santoso', role: 'cashier', status: 'active', email: 'budi@ncash.io', transactions: 38, lastActive: '2 hours ago', shift: 'Evening (15:00-22:00)' },
  { id: 4, name: 'Dewi Lestari', role: 'cashier', status: 'inactive', email: 'dewi@ncash.io', transactions: 22, lastActive: '3 days ago', shift: 'Morning (08:00-15:00)' },
  { id: 5, name: 'Eko Prasetyo', role: 'cashier', status: 'active', email: 'eko@ncash.io', transactions: 51, lastActive: '30 min ago', shift: 'Evening (15:00-22:00)' },
];

export function Employees() {
  const { isDark } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const cardBg = 'neo-panel';
  const textMain = isDark ? 'text-white' : 'text-nexus-text-light';
  const textSub = isDark ? 'text-nexus-gray' : 'text-nexus-sub-light';

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

      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-bold ${textMain}`}>Employee List</h3>
          <p className={`text-xs ${textSub}`}>{employees.length} employees registered</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-nexus-green px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-nexus-green-dark cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      {showForm && (
        <div className={`rounded-2xl p-5 ${cardBg}`}>
          <h4 className={`mb-4 text-sm font-bold ${textMain}`}>Add New Employee</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Full Name', placeholder: 'John Doe', type: 'text' },
              { label: 'Email', placeholder: 'john@ncash.io', type: 'email' },
              { label: 'Role', placeholder: '', type: 'select' },
              { label: 'Shift', placeholder: '', type: 'select2' },
            ].map((field, i) => (
              <div key={i}>
                <label className={`text-xs font-semibold ${textSub}`}>{field.label}</label>
                {field.type === 'select' ? (
                  <select className={`mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm outline-none ${isDark ? 'border border-white/10 bg-white/5 text-white' : 'border border-nexus-border-light bg-gray-50 text-nexus-text-light'}`}>
                    <option>Cashier</option>
                    <option>Owner</option>
                  </select>
                ) : field.type === 'select2' ? (
                  <select className={`mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm outline-none ${isDark ? 'border border-white/10 bg-white/5 text-white' : 'border border-nexus-border-light bg-gray-50 text-nexus-text-light'}`}>
                    <option>Morning (08:00-15:00)</option>
                    <option>Evening (15:00-22:00)</option>
                    <option>All</option>
                  </select>
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className={`mt-1.5 w-full rounded-xl px-3 py-2.5 text-sm outline-none ${isDark ? 'border border-white/10 bg-white/5 text-white placeholder-nexus-gray' : 'border border-nexus-border-light bg-gray-50 text-nexus-text-light placeholder-nexus-sub-light'}`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button className="rounded-xl bg-nexus-green px-4 py-2 text-xs font-semibold text-white hover:bg-nexus-green-dark cursor-pointer">
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer ${isDark ? 'bg-white/5 text-nexus-gray' : 'bg-gray-100 text-nexus-sub-light'}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {employees.map(emp => (
          <div key={emp.id} className={`rounded-2xl p-5 transition-all ${cardBg}`}>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white font-bold
                  ${emp.role === 'owner' ? 'bg-gradient-to-br from-nexus-green to-nexus-cyan' : isDark ? 'bg-white/10' : 'bg-gray-200'}
                `}>
                  {emp.role === 'owner' ? <ShieldCheck className="h-6 w-6" /> : <UserCog className="h-6 w-6 text-nexus-gray" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold ${textMain}`}>{emp.name}</h4>
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase
                      ${emp.role === 'owner' ? 'bg-nexus-green/15 text-nexus-green' : 'bg-nexus-cyan/15 text-nexus-cyan'}
                    `}>
                      {emp.role}
                    </span>
                    {emp.status === 'active' ? (
                      <span className="h-2 w-2 rounded-full bg-nexus-green" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-nexus-gray" />
                    )}
                  </div>
                  <p className={`text-xs ${textSub}`}>{emp.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Receipt className={`h-3 w-3 ${textSub}`} />
                    <span className={`text-sm font-bold ${textMain}`}>{emp.transactions}</span>
                  </div>
                  <p className={`text-[10px] ${textSub}`}>Transactions</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Clock className={`h-3 w-3 ${textSub}`} />
                    <span className={`text-xs font-medium ${textMain}`}>{emp.lastActive}</span>
                  </div>
                  <p className={`text-[10px] ${textSub}`}>{emp.shift}</p>
                </div>
                <div className="flex gap-1">
                  <button className={`rounded-lg p-2 transition-all cursor-pointer ${isDark ? 'text-nexus-gray hover:bg-white/5' : 'text-nexus-sub-light hover:bg-gray-100'}`}>
                    {emp.status === 'active' ? <ToggleRight className="h-5 w-5 text-nexus-green" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <button className={`rounded-lg p-2 transition-all cursor-pointer ${isDark ? 'text-nexus-gray hover:bg-white/5' : 'text-nexus-sub-light hover:bg-gray-100'}`}>
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg p-2 text-nexus-red transition-all hover:bg-nexus-red/10 cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
