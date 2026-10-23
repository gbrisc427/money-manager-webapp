import React, { useEffect, useState } from "react";
import { 
  UserCircle, Plus, Wallet, CreditCard, ArrowRight, X, 
  PieChart as PieIcon, BarChart3, Landmark, CircleDollarSign, Target, Trash2,
  Trophy, TrendingUp 
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
import { getBudgets, createBudget, deleteBudget } from "../services/budgetService";
import type { Budget } from "../services/budgetService";
import { getCategories } from "../services/categoryService";
import type { Category } from "../services/categoryService";
import { getGoals, createGoal, addFundsToGoal, deleteGoal } from "../services/goalService";
import type { SavingsGoal } from "../services/goalService";
import { Button } from "../components/ui/Button";
import { SUPPORTED_CURRENCIES, formatCurrency } from "../utils/currency";

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<{ name?: string; email?: string } | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  const navigate = useNavigate();
  
  // MODALES
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [fundsAmount, setFundsAmount] = useState("");

  // ESTADOS DE CARGA CRUD
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);
  const [isSubmittingBudget, setIsSubmittingBudget] = useState(false);
  const [isSubmittingGoal, setIsSubmittingGoal] = useState(false);
  const [isSubmittingFunds, setIsSubmittingFunds] = useState(false);
  const [deletingBudgetId, setDeletingBudgetId] = useState<number | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<number | null>(null);

  // ESTADOS FORMULARIOS
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "Banco",
    balance: "" as string | number,
    currency: "EUR"
  });
  const [newBudget, setNewBudget] = useState({ categoryId: 0, amount: "" as string | number });
  const [newGoal, setNewGoal] = useState({ name: "", targetAmount: "" as string | number, color: "#10b981" });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
      try {
        const [profileData, accountsData, catStatsData, monthData, budgetsData, allCats, goalsData] = await Promise.all([
          getUserProfile(),
          getAccounts(),
          getCategoryStats(),
          getMonthlyStats(),
          getBudgets(),
          getCategories(),
          getGoals()
        ]);
        setProfile(profileData);
        setAccounts(accountsData);
        setCategoryStats(catStatsData);
        setMonthlyStats(monthData);
        setBudgets(budgetsData);
        setCategories(allCats);
        setGoals(goalsData);
      } catch (err) {
        console.error("Error cargando datos", err);
      }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingAccount || !newAccount.name || newAccount.balance === "") return;
    setIsSubmittingAccount(true);
    try {
      await createAccount({
        name: newAccount.name,
        type: newAccount.type,
        balance: Number(newAccount.balance),
        currency: newAccount.currency
      });
      setNewAccount({ name: "", type: "Banco", balance: "", currency: "EUR" }); 
      setIsAccountModalOpen(false);
      const updatedAccounts = await getAccounts();
      setAccounts(updatedAccounts);
    } catch (error) {
      console.error("Error creando cuenta", error);
    } finally {
      setIsSubmittingAccount(false);
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingBudget || !newBudget.categoryId || !newBudget.amount) return;
    setIsSubmittingBudget(true);
    try {
        await createBudget({ categoryId: Number(newBudget.categoryId), amount: Number(newBudget.amount) });
        setNewBudget({ categoryId: 0, amount: "" });
        setIsBudgetModalOpen(false);
        setBudgets(await getBudgets());
    } catch (error) {
        console.error("Error creando presupuesto", error);
    } finally {
        setIsSubmittingBudget(false);
    }
  };

  const handleDeleteBudget = async (id: number) => {
      if (deletingBudgetId !== null) return;
      if(!confirm("¿Eliminar este límite de gasto?")) return;
      setDeletingBudgetId(id);
      try {
        await deleteBudget(id);
        setBudgets(await getBudgets());
      } catch (error) {
        console.error(error);
      } finally {
        setDeletingBudgetId(null);
      }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingGoal || !newGoal.name || !newGoal.targetAmount) return;
    setIsSubmittingGoal(true);
    try {
        await createGoal({
            name: newGoal.name,
            targetAmount: Number(newGoal.targetAmount),
            color: newGoal.color,
            currentAmount: 0
        });
        setNewGoal({ name: "", targetAmount: "", color: "#10b981" });
        setIsGoalModalOpen(false);
        setGoals(await getGoals());
    } catch (error) {
        console.error(error);
    } finally {
        setIsSubmittingGoal(false);
    }
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingFunds || !selectedGoalId || !fundsAmount) return;
    setIsSubmittingFunds(true);
    try {
        await addFundsToGoal(selectedGoalId, Number(fundsAmount));
        setFundsAmount("");
        setSelectedGoalId(null);
        setIsAddFundsModalOpen(false);
        setGoals(await getGoals());
    } catch (error) {
        console.error(error);
    } finally {
        setIsSubmittingFunds(false);
    }
  };

  const handleDeleteGoal = async (id: number) => {
      if (deletingGoalId !== null) return;
      if(!confirm("¿Borrar esta meta de ahorro?")) return;
      setDeletingGoalId(id);
      try {
        await deleteGoal(id);
        setGoals(await getGoals());
      } catch (error) {
        console.error(error);
      } finally {
        setDeletingGoalId(null);
      }
  };

  const openAddFundsModal = (id: number) => {
      setSelectedGoalId(id);
      setIsAddFundsModalOpen(true);
  };

  // Opción 1: Agrupación del balance total por divisa activa (EUR y/o USD)
  const balancesByCurrency = accounts.reduce<Record<string, number>>((accMap, acc) => {
    const curr = (acc.currency || "EUR").toUpperCase();
    accMap[curr] = (accMap[curr] || 0) + acc.balance;
    return accMap;
  }, {});
  const currencyEntries = Object.entries(balancesByCurrency);

  const currencyFormatter = (value: number | string | undefined) => {
    return formatCurrency(value, "EUR");
  };

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
        {/* SECCIÓN 1: BIENVENIDA Y SALDO AGRUPADO POR DIVISA */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{profile?.name || 'Usuario'}</span>
          </h1>
          <p className="text-gray-500 mt-1">Balance total actual:</p>
          {currencyEntries.length === 0 ? (
            <p className="text-4xl font-extrabold mt-2 text-gray-900">
              {formatCurrency(0, "EUR")}
            </p>
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mt-2">
              {currencyEntries.map(([curr, total], idx) => (
                <React.Fragment key={curr}>
                  {idx > 0 && <span className="text-3xl font-light text-gray-300">|</span>}
                  <span className={`text-4xl font-extrabold ${total >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
                    {formatCurrency(total, curr)}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* SECCIÓN 2: LISTA DE CUENTAS */}
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {acc.type}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                      {acc.currency || "EUR"}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-700 truncate">{acc.name}</h3>
                <p className={`text-xl font-bold mt-1 ${acc.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                  {formatCurrency(acc.balance, acc.currency)}
                </p>
              </div>
            ))}
            <div 
              onClick={() => setIsAccountModalOpen(true)} 
              className="min-w-[200px] bg-gray-50 p-5 rounded-xl border-2 border-dashed border-gray-300 flex flex-col justify-center items-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all text-gray-400 hover:text-indigo-600 min-h-[140px] snap-start"
            >
              <div className="p-3 bg-white rounded-full shadow-sm mb-2"><Plus size={24} /></div>
              <span className="font-medium whitespace-nowrap">Nueva Cuenta</span>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: GRÁFICOS */}
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
                    <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val} €`} />
                    <RechartsTooltip cursor={{fill: '#f9f9f9'}} formatter={(value: number | undefined) => [formatCurrency(value, "EUR")]} />
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

        {/* SECCIÓN 4: OBJETIVOS DE GASTO (PRESUPUESTOS) */}
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
                    No tienes presupuestos definidos.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.map(b => (
                        <div key={b.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative group">
                            <button
                              onClick={() => handleDeleteBudget(b.id)}
                              disabled={deletingBudgetId === b.id}
                              className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    <div className="text-2xl font-bold text-gray-800">{b.spentAmount.toFixed(0)} €</div>
                                    <div className="text-xs text-gray-500">de {b.limitAmount.toFixed(0)} €</div>
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-500 ${getProgressColor(b.percentage)}`} style={{ width: `${Math.min(b.percentage, 100)}%` }}></div>
                            </div>
                            <div className="text-right mt-1 text-xs font-bold text-gray-400">{b.percentage.toFixed(0)}%</div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* SECCIÓN 5: METAS DE AHORRO */}
        <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Trophy className="text-yellow-500" size={20}/> Metas de Ahorro
                </h2>
                <button 
                    onClick={() => setIsGoalModalOpen(true)}
                    className="text-sm font-bold text-green-600 bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                >
                    <Plus size={16}/> Nueva Meta
                </button>
            </div>

            {goals.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
                    Aún no tienes metas de ahorro. ¡Crea una para ese viaje soñado!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(g => {
                        const percent = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
                        return (
                            <div key={g.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative group overflow-hidden">
                                <div className="absolute bottom-0 left-0 h-1 bg-green-500 transition-all duration-1000" style={{width: `${percent}%`}}></div>
                                
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-full bg-green-50 text-green-600">
                                        <Trophy size={20}/>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openAddFundsModal(g.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full" title="Añadir dinero">
                                            <TrendingUp size={18}/>
                                        </button>
                                        <button
                                          onClick={() => handleDeleteGoal(g.id)}
                                          disabled={deletingGoalId === g.id}
                                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 size={18}/>
                                        </button>
                                    </div>
                                </div>
                                
                                <h3 className="text-lg font-bold text-gray-800 mb-1">{g.name}</h3>
                                <div className="flex justify-between items-end mb-2">
                                    <div className="text-3xl font-bold text-gray-800">{g.currentAmount.toFixed(0)} €</div>
                                    <div className="text-sm text-gray-400 font-medium mb-1"> / {g.targetAmount.toFixed(0)} €</div>
                                </div>
                                <div className="text-xs font-bold text-green-600 uppercase tracking-wider">
                                    {percent.toFixed(0)}% Completado
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* SECCIÓN 6: ACCESOS RÁPIDOS */}
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

      {/* --- MODALES (CUENTAS, PRESUPUESTOS, METAS...) --- */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Crear Cuenta</h3>
              <button onClick={() => !isSubmittingAccount && setIsAccountModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateAccount} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                <div className="relative">
                    <Wallet className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input type="text" required disabled={isSubmittingAccount} value={newAccount.name} onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })} className="w-full border border-gray-200 rounded-lg p-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50" placeholder="Ej: Ahorros"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                  <div className="relative">
                      <Landmark className="absolute left-3 top-3 text-gray-400" size={18}/>
                      <select disabled={isSubmittingAccount} className="w-full border border-gray-200 rounded-lg p-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-50" value={newAccount.type} onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}>
                          <option value="Banco">Banco</option><option value="Efectivo">Efectivo</option><option value="Tarjeta">Tarjeta Crédito</option><option value="Ahorro">Ahorro</option><option value="Inversión">Inversión</option>
                      </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Divisa</label>
                  <select
                    disabled={isSubmittingAccount}
                    className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-50 font-semibold"
                    value={newAccount.currency}
                    onChange={(e) => setNewAccount({ ...newAccount, currency: e.target.value })}
                  >
                    {SUPPORTED_CURRENCIES.map(curr => (
                      <option key={curr.code} value={curr.code}>
                        {curr.code} ({curr.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Saldo Inicial</label>
                <div className="relative">
                    <CircleDollarSign className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input type="number" step="0.01" required disabled={isSubmittingAccount} value={newAccount.balance} onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })} className="w-full border border-gray-200 rounded-lg p-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-500 font-mono disabled:bg-gray-50" placeholder="0.00"/>
                </div>
              </div>
              <Button
                type="submit"
                isLoading={isSubmittingAccount}
                loadingText="Creando cuenta..."
                className="py-4 shadow-lg mt-2"
              >
                Crear Cuenta
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRESUPUESTOS */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Definir Límite de Gasto</h3>
              <button onClick={() => !isSubmittingBudget && setIsBudgetModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateBudget} className="p-6 space-y-5">
              <div>
                 <p className="text-sm text-gray-500 mb-4">Elige una categoría y define cuánto quieres gastar como máximo al mes.</p>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
                 <select disabled={isSubmittingBudget} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-50" value={newBudget.categoryId} onChange={(e) => setNewBudget({ ...newBudget, categoryId: Number(e.target.value) })}>
                    <option value={0}>Selecciona categoría...</option>
                    {categories.filter(c => c.type === 'EXPENSE').map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                 </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Límite Mensual</label>
                <div className="relative">
                    <CircleDollarSign className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input type="number" step="0.01" required disabled={isSubmittingBudget} value={newBudget.amount} onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })} className="w-full border border-gray-200 rounded-lg p-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-500 font-mono disabled:bg-gray-50" placeholder="Ej: 200.00"/>
                </div>
              </div>
              <Button
                type="submit"
                isLoading={isSubmittingBudget}
                loadingText="Guardando..."
                className="py-4 shadow-lg mt-2"
              >
                Guardar Presupuesto
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL METAS */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Nueva Meta de Ahorro</h3>
              <button onClick={() => !isSubmittingGoal && setIsGoalModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateGoal} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Objetivo</label>
                <input type="text" required disabled={isSubmittingGoal} value={newGoal.name} onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })} className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50" placeholder="Ej: Viaje a Japón"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cantidad Objetivo</label>
                <div className="relative">
                    <CircleDollarSign className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input type="number" step="0.01" required disabled={isSubmittingGoal} value={newGoal.targetAmount} onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })} className="w-full border border-gray-200 rounded-lg p-3 pl-10 outline-none focus:ring-2 focus:ring-green-500 font-mono disabled:bg-gray-50" placeholder="0.00"/>
                </div>
              </div>
              <Button
                type="submit"
                variant="success"
                isLoading={isSubmittingGoal}
                loadingText="Creando meta..."
                className="py-4 shadow-lg mt-2"
              >
                Crear Meta
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AÑADIR FONDOS */}
      {isAddFundsModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Añadir Ahorros</h3>
              <button onClick={() => !isSubmittingFunds && setIsAddFundsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddFunds} className="p-6 space-y-5">
              <div>
                <p className="text-sm text-gray-500 mb-4">¿Cuánto dinero quieres destinar a esta meta hoy?</p>
                <div className="relative">
                    <CircleDollarSign className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input type="number" step="0.01" required disabled={isSubmittingFunds} value={fundsAmount} onChange={(e) => setFundsAmount(e.target.value)} className="w-full border border-gray-200 rounded-lg p-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xl font-bold text-gray-800 disabled:bg-gray-50" placeholder="0.00" autoFocus/>
                </div>
              </div>
              <Button
                type="submit"
                isLoading={isSubmittingFunds}
                loadingText="Añadiendo..."
                className="py-4 shadow-lg mt-2"
              >
                Añadir Fondos
              </Button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
