import React, { useEffect, useState } from "react";
import { 
  UserCircle, Plus, Wallet, CreditCard, ArrowRight, X, 
  PieChart as PieIcon, BarChart3, Landmark, CircleDollarSign, Target, Trash2 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

import { getUserProfile } from "../services/profileService";
import { getAccounts, createAccount } from "../services/accountService";
import type { Account } from "../services/accountService";
import { getCategoryStats, getMonthlyStats } from "../services/transactionService";
import type { CategoryStat, MonthlyStat } from "../services/transactionService";
import { getBudgets, createBudget, deleteBudget } from "../services/budgetService"; // <--- NUEVO
import type { Budget } from "../services/budgetService"; // <--- NUEVO
import { getCategories } from "../services/categoryService"; // <--- NUEVO
import type { Category } from "../services/categoryService"; // <--- NUEVO

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<{ name?: string; email?: string } | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  // Estados para gráficos y presupuestos
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]); // <--- NUEVO
  const [categories, setCategories] = useState<Category[]>([]); // <--- NUEVO

  const navigate = useNavigate();
  
  // MODAL CREAR CUENTA
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "Banco",
    balance: "" as string | number
  });

  // MODAL CREAR PRESUPUESTO (NUEVO)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    categoryId: 0,
    amount: "" as string | number
  });

  // --- CARGA DE DATOS ---
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
      try {
        const [profileData, accountsData, catStatsData, monthData, budgetsData, allCats] = await Promise.all([
          getUserProfile(),
          getAccounts(),
          getCategoryStats(),
          getMonthlyStats(),
          getBudgets(),     // <--- Cargar presupuestos
          getCategories()   // <--- Cargar categorías (para el select del modal)
        ]);
        setProfile(profileData);
        setAccounts(accountsData);
        setCategoryStats(catStatsData);
        setMonthlyStats(monthData);
        setBudgets(budgetsData);
        setCategories(allCats);
      } catch (err) {
        console.error("Error cargando datos del dashboard", err);
      }
  };

  // --- HANDLERS CUENTAS ---
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name || newAccount.balance === "") return;
    try {
      await createAccount({
        name: newAccount.name,
        type: newAccount.type,
        balance: Number(newAccount.balance)
      });
      setNewAccount({ name: "", type: "Banco", balance: "" }); 
      setIsAccountModalOpen(false);
      const updatedAccounts = await getAccounts();
      setAccounts(updatedAccounts);
    } catch (error) {
      console.error("Error creando cuenta", error);
    }
  };

  // --- HANDLERS PRESUPUESTOS (NUEVO) ---
  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.categoryId || !newBudget.amount) return;
    try {
        await createBudget({
            categoryId: Number(newBudget.categoryId),
            amount: Number(newBudget.amount)
        });
        setNewBudget({ categoryId: 0, amount: "" });
        setIsBudgetModalOpen(false);
        // Recargar solo los presupuestos para actualizar barras
        const updatedBudgets = await getBudgets();
        setBudgets(updatedBudgets);
    } catch (error) {
        console.error("Error creando presupuesto", error);
    }
  };

  const handleDeleteBudget = async (id: number) => {
      if(!confirm("¿Eliminar este límite de gasto?")) return;
      try {
          await deleteBudget(id);
          const updatedBudgets = await getBudgets();
          setBudgets(updatedBudgets);
      } catch (error) {
          console.error(error);
      }
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const currencyFormatter = (value: number | string | undefined) => {
    if (value === undefined || value === null) return "$0.00";
    return `$${Number(value).toFixed(2)}`;
  };

  // Función para color de barra de progreso
  const getProgressColor = (percentage: number) => {
      if (percentage >= 100) return "bg-red-500";
      if (percentage >= 75) return "bg-yellow-500";
      return "bg-green-500";
  };

  return (
    <div className="min-h-screen bg-[#f9f9f6] p-6">
      <header className="flex items-center gap-2 justify-end mb-6">
         <div className="text-right mr-2 hidden sm:block">
            <p className="text-sm font-bold text-gray-700">{profile?.name}</p>
            <p className="text-xs text-gray-500">{profile?.email}</p>
         </div>
         <UserCircle 
          className="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity"
          stroke="url(#grad)" 
          onClick={() => navigate("/profile")}
        />
        <svg width="0" height="0">
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
          </defs>
        </svg>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* SECCIÓN DE BIENVENIDA Y SALDO */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{profile?.name || 'Usuario'}</span>
          </h1>
          <p className="text-gray-500 mt-1">Balance total actual:</p>
          <p className={`text-4xl font-extrabold mt-2 ${totalBalance >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
            ${totalBalance.toFixed(2)}
          </p>
        </div>

        {/* SECCIÓN DE GRÁFICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <BarChart3 className="text-indigo-500" size={20}/> Balance Mensual
            </h3>
            <div className="h-[300px] w-full">
              {monthlyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                    <RechartsTooltip cursor={{fill: '#f9f9f9'}} formatter={(value: number | undefined) => [`$${Number(value || 0).toFixed(2)}`]} />
                    <Legend />
                    <Bar name="Ingresos" dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar name="Gastos" dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No hay datos suficientes</div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <PieIcon className="text-pink-500" size={20}/> Distribución de Gastos
            </h3>
            <div className="h-[300px] w-full flex items-center justify-center">
              {categoryStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="totalAmount"
                      nameKey="categoryName"
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#cccccc'} stroke="none" />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={currencyFormatter} />
                    <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '12px'}}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No hay gastos registrados</div>
              )}
            </div>
          </div>
        </div>

        {/* --- NUEVA SECCIÓN: PRESUPUESTOS (BUDGETS) --- */}
        <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Target className="text-orange-500" size={20}/> Objetivos de Gasto
                </h2>
                <button 
                    onClick={() => setIsBudgetModalOpen(true)}
                    className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1"
                >
                    <Plus size={16}/> Definir Límite
                </button>
            </div>

            {budgets.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
                    No tienes presupuestos definidos. ¡Crea uno para controlar tus gastos!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.map(b => (
                        <div key={b.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative group">
                            <button 
                                onClick={() => handleDeleteBudget(b.id)}
                                className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={16}/>
                            </button>

                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">Categoría</div>
                                    <div className="font-bold text-gray-800 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: b.categoryColor}}></div>
                                        {b.categoryName}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-800">${b.spentAmount.toFixed(0)}</div>
                                    <div className="text-xs text-gray-500">de ${b.limitAmount.toFixed(0)}</div>
                                </div>
                            </div>
                            
                            {/* Barra de Progreso */}
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${getProgressColor(b.percentage)}`} 
                                    style={{ width: `${Math.min(b.percentage, 100)}%` }}
                                ></div>
                            </div>
                            <div className="text-right mt-1 text-xs font-bold text-gray-400">
                                {b.percentage.toFixed(0)}%
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* LISTA DE CUENTAS */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Wallet className="text-indigo-500" size={20}/> Mis Cuentas
            </h2>
            <button onClick={() => navigate("/accounts")} className="text-sm text-indigo-600 hover:underline flex items-center">
              Ver todas <ArrowRight size={14} className="ml-1"/>
            </button>
          </div>

         <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {accounts.map((acc) => (
              <div 
                key={acc.id} 
                onClick={() => navigate(`/accounts/${acc.id}`)} 
                className="min-w-[280px] bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group snap-start"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <CreditCard size={20} />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {acc.type}
                  </span>
                </div>
                <h3 className="font-bold text-gray-700 truncate">{acc.name}</h3>
                <p className={`text-xl font-bold mt-1 ${acc.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                  ${acc.balance.toFixed(2)}
                </p>
              </div>
            ))}

            <div 
              onClick={() => setIsAccountModalOpen(true)} 
              className="min-w-[200px] bg-gray-50 p-5 rounded-xl border-2 border-dashed border-gray-300 flex flex-col justify-center items-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all text-gray-400 hover:text-indigo-600 min-h-[140px] snap-start"
            >
              <div className="p-3 bg-white rounded-full shadow-sm mb-2">
                <Plus size={24} />
              </div>
              <span className="font-medium whitespace-nowrap">Nueva Cuenta</span>
            </div>
          </div>
        </div>

        {/* ACCESOS RÁPIDOS */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"> 
          <div onClick={() => navigate("/transactions")} className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all group flex items-center gap-4">
            <div className="p-4 bg-indigo-100 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Movimientos</h3>
              <p className="text-gray-500 text-sm">Registra ingresos y gastos.</p>
            </div>
          </div>

          <div onClick={() => navigate("/categories")} className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group flex items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Categorías</h3>
              <p className="text-gray-500 text-sm">Organiza tus etiquetas.</p>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL CREAR CUENTA --- */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Crear Cuenta</h3>
              <button onClick={() => setIsAccountModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                <div className="relative">
                    <Wallet className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input
                    type="text"
                    required
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ej: Ahorros"
                    />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                <div className="relative">
                    <Landmark className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <select
                        className="w-full border border-gray-200 rounded-lg p-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        value={newAccount.type}
                        onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
                    >
                        <option value="Banco">Banco</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Tarjeta">Tarjeta Crédito</option>
                        <option value="Ahorro">Ahorro</option>
                        <option value="Inversión">Inversión</option>
                    </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Saldo Inicial</label>
                <div className="relative">
                    <CircleDollarSign className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input
                    type="number"
                    step="0.01"
                    required
                    value={newAccount.balance}
                    onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    placeholder="0.00"
                    />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 mt-2">
                Crear Cuenta
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL CREAR PRESUPUESTO --- */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Definir Límite de Gasto</h3>
              <button onClick={() => setIsBudgetModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="p-6 space-y-5">
              <div>
                 <p className="text-sm text-gray-500 mb-4">Elige una categoría y define cuánto quieres gastar como máximo al mes.</p>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
                 <select 
                    className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={newBudget.categoryId}
                    onChange={(e) => setNewBudget({ ...newBudget, categoryId: Number(e.target.value) })}
                 >
                    <option value={0}>Selecciona categoría...</option>
                    {categories.filter(c => c.type === 'EXPENSE').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                 </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Límite Mensual</label>
                <div className="relative">
                    <CircleDollarSign className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input
                    type="number"
                    step="0.01"
                    required
                    value={newBudget.amount}
                    onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    placeholder="Ej: 200.00"
                    />
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 mt-2">
                Guardar Presupuesto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;