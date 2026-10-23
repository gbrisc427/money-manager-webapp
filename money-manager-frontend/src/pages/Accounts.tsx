import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Search, Wallet, ArrowLeft, Trash2, 
  Landmark, CreditCard, Banknote, PiggyBank, CircleDollarSign
} from "lucide-react";
import { getAccounts, createAccount, deleteAccount } from "../services/accountService";
import type { Account } from "../services/accountService";
import { Button } from "../components/ui/Button";
import { SUPPORTED_CURRENCIES, formatCurrency } from "../utils/currency";

const Accounts: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Estado del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "Banco",
    balance: "" as string | number,
    currency: "EUR"
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Error cargando cuentas", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !newAccount.name || newAccount.balance === "") return;

    setIsSubmitting(true);
    try {
      await createAccount({
        name: newAccount.name,
        type: newAccount.type,
        balance: Number(newAccount.balance),
        currency: newAccount.currency
      });
      
      setNewAccount({ name: "", type: "Banco", balance: "", currency: "EUR" });
      setIsModalOpen(false);
      await loadAccounts();
    } catch (error) {
      console.error("Error creando cuenta", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (deletingId !== null) return;
    if (!window.confirm("¿Seguro que quieres borrar esta cuenta y todos sus movimientos?")) return;
    setDeletingId(id);
    try {
      await deleteAccount(id);
      await loadAccounts();
    } catch (error) {
      console.error("Error borrando cuenta", error);
    } finally {
      setDeletingId(null);
    }
  };

  // Función auxiliar para elegir el icono según el tipo de cuenta
  const getAccountIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("banco")) return <Landmark className="text-indigo-600" size={24} />;
    if (t.includes("tarjeta")) return <CreditCard className="text-purple-600" size={24} />;
    if (t.includes("efectivo")) return <Banknote className="text-green-600" size={24} />;
    if (t.includes("ahorro")) return <PiggyBank className="text-pink-600" size={24} />;
    return <Wallet className="text-gray-600" size={24} />;
  };

  // Función para color de fondo del icono
  const getIconBg = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("banco")) return "bg-indigo-50";
    if (t.includes("tarjeta")) return "bg-purple-50";
    if (t.includes("efectivo")) return "bg-green-50";
    if (t.includes("ahorro")) return "bg-pink-50";
    return "bg-gray-50";
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f9f9f6] p-6">
      
      {/* CABECERA */}
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="text-indigo-600" /> Mis Cuentas
        </h2>
      </header>

      <div className="max-w-6xl mx-auto">
        
        {/* BARRA DE ACCIONES */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 flex-1">
                <Search className="text-gray-400" size={20}/>
                <input 
                    type="text" 
                    placeholder="Buscar cuenta..." 
                    className="flex-1 outline-none text-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2 justify-center whitespace-nowrap"
            >
                <Plus size={20}/> Nueva Cuenta
            </button>
        </div>

        {/* GRID DE CUENTAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full text-center text-gray-400 py-10">Cargando...</div>
          ) : filteredAccounts.length === 0 ? (
             <div className="col-span-full text-center text-gray-400 py-10">No tienes cuentas registradas.</div>
          ) : (
             filteredAccounts.map((acc) => (
                <div 
                  key={acc.id} 
                  onClick={() => navigate(`/accounts/${acc.id}`)}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl ${getIconBg(acc.type)}`}>
                        {getAccountIcon(acc.type)}
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, acc.id)}
                      disabled={deletingId === acc.id}
                      className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{acc.name}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{acc.type}</p>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {acc.currency || "EUR"}
                      </span>
                    </div>
                    <p className={`text-2xl font-mono font-bold ${acc.balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                      {formatCurrency(acc.balance, acc.currency)}
                    </p>
                  </div>

                  {/* Decoración visual en hover */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-50 rounded-full translate-x-8 translate-y-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
             ))
          )}
        </div>
      </div>

      {/* --- MODAL NUEVA CUENTA --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Crear Cuenta</h3>
              <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-6 space-y-5">
              
              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre de la cuenta</label>
                <div className="relative">
                    <Wallet className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                    placeholder="Ej: Banco Santander, Hucha..."
                    />
                </div>
              </div>

              {/* Tipo y Divisa */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                  <div className="relative">
                      <Landmark className="absolute left-3 top-3 text-gray-400" size={18}/>
                      <select
                          disabled={isSubmitting}
                          className="w-full border border-gray-200 rounded-lg p-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-50"
                          value={newAccount.type}
                          onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
                      >
                          <option value="Banco">Banco</option>
                          <option value="Efectivo">Efectivo</option>
                          <option value="Tarjeta">Tarjeta de Crédito</option>
                          <option value="Ahorro">Cuenta de Ahorro</option>
                          <option value="Inversión">Inversión</option>
                      </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Divisa</label>
                  <select
                      disabled={isSubmitting}
                      className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-50 font-semibold"
                      value={newAccount.currency}
                      onChange={(e) => setNewAccount({ ...newAccount, currency: e.target.value })}
                  >
                      {SUPPORTED_CURRENCIES.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.code} ({curr.symbol})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Saldo Inicial */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Saldo Inicial</label>
                <div className="relative">
                    <CircleDollarSign className="absolute left-3 top-3 text-gray-400" size={18}/>
                    <input
                    type="number"
                    step="0.01"
                    required
                    disabled={isSubmitting}
                    value={newAccount.balance}
                    onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-500 font-mono disabled:bg-gray-50"
                    placeholder="0.00"
                    />
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                loadingText="Creando cuenta..."
                className="py-4 shadow-lg mt-2"
              >
                Crear Cuenta
              </Button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Accounts;
