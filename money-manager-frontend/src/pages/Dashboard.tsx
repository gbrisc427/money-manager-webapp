import React, { useEffect, useState } from "react";
import { UserCircle, Plus, Wallet, CreditCard, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../services/profileService";
import { getAccounts, createAccount } from "../services/accountService";
import type { Account } from "../services/accountService";

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<{ name?: string; email?: string } | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: "", type: "Efectivo" });

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name) return;
    try {
      await createAccount(newAccount);
      setNewAccount({ name: "", type: "Efectivo" }); 
      setIsModalOpen(false);
      const updatedAccounts = await getAccounts();
      setAccounts(updatedAccounts);
    } catch (error) {
      console.error("Error creando cuenta", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, accountsData] = await Promise.all([
          getUserProfile(),
          getAccounts()
        ]);
        setProfile(profileData);
        setAccounts(accountsData);
      } catch (err) {
        console.error("Error cargando datos del dashboard", err);
      }
    };
    fetchData();
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

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

      <main className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{profile?.name || 'Usuario'}</span>
          </h1>
          <p className="text-gray-500 mt-1">Balance total actual:</p>
          <p className={`text-4xl font-extrabold mt-2 ${totalBalance >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
            ${totalBalance.toFixed(2)}
          </p>
        </div>

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
              onClick={() => setIsModalOpen(true)} 
              className="min-w-[200px] bg-gray-50 p-5 rounded-xl border-2 border-dashed border-gray-300 flex flex-col justify-center items-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all text-gray-400 hover:text-indigo-600 min-h-[140px] snap-start"
            >
              <div className="p-3 bg-white rounded-full shadow-sm mb-2">
                <Plus size={24} />
              </div>
              <span className="font-medium whitespace-nowrap">Nueva Cuenta</span>
            </div>

          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"> 
          
          <div 
            onClick={() => navigate("/transactions")} 
            className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all group flex items-center gap-4"
          >
            <div className="p-4 bg-indigo-100 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Movimientos</h3>
              <p className="text-gray-500 text-sm">Registra ingresos y gastos.</p>
            </div>
          </div>

          <div 
            onClick={() => navigate("/categories")} 
            className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group flex items-center gap-4"
          >
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Crear Nueva Cuenta</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Nombre</label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ej: Ahorros Vacaciones"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Tipo</label>
                <select
                  value={newAccount.type}
                  onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg p-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Banco">Banco</option>
                  <option value="Tarjeta">Tarjeta Crédito</option>
                  <option value="Ahorro">Ahorro</option>
                  <option value="Inversión">Inversión</option>
                </select>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-lg">Cancelar</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">Crear Cuenta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;