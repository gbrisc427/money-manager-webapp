import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Search, ArrowUpCircle, ArrowDownCircle, 
  Trash2, Repeat, ArrowLeft, DollarSign, Clock, XCircle 
} from "lucide-react";
import { 
  getTransactions, createTransaction, deleteTransaction, 
  createRecurringTransaction, getRecurringTransactions, cancelRecurringTransaction 
} from "../services/transactionService";
import type { Transaction, TransactionRequest, RecurringTransaction } from "../services/transactionService";
import { getAccounts } from "../services/accountService";
import type { Account } from "../services/accountService";
import { getCategories } from "../services/categoryService";
import type { Category } from "../services/categoryService";

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal Crear
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<TransactionRequest>({
    description: "",
    amount: 0,
    type: "EXPENSE",
    accountId: 0,
    categoryId: 0,
    date: new Date().toISOString().split('T')[0]
  });
  const [isRecurring, setIsRecurring] = useState(false);

  // Modal y Estado para Gestionar Recurrentes
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [recurringList, setRecurringList] = useState<RecurringTransaction[]>([]);

  // Filtros
  const filteredCategories = categories.filter(cat => cat.type === newTransaction.type);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [txData, accData, catData] = await Promise.all([
        getTransactions(),
        getAccounts(),
        getCategories()
      ]);
      setTransactions(txData);
      setAccounts(accData);
      setCategories(catData);
      
      const defaultExpenseCats = catData.filter(c => c.type === "EXPENSE");
      if (accData.length > 0) {
        setNewTransaction(prev => ({
            ...prev,
            accountId: accData[0].id,
            categoryId: defaultExpenseCats.length > 0 ? defaultExpenseCats[0].id : 0
        }));
      }
    } catch (error) {
      console.error("Error cargando datos", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar lista de recurrentes al abrir su modal
  const openRecurringModal = async () => {
    try {
      const data = await getRecurringTransactions();
      setRecurringList(data.filter(r => r.active)); 
      setIsRecurringModalOpen(true);
    } catch (error) {
      console.error("Error cargando recurrentes", error);
    }
  };

  // Cancelar suscripción
  const handleCancelRecurring = async (id: number) => {
    if (!window.confirm("¿Seguro que quieres cancelar esta suscripción? Dejará de cobrarse automáticamente.")) return;
    try {
      await cancelRecurringTransaction(id);
      const updatedList = await getRecurringTransactions();
      setRecurringList(updatedList.filter(r => r.active));
    } catch (error) {
      console.error("Error cancelando", error);
    }
  };

  const handleTypeChange = (type: "INCOME" | "EXPENSE") => {
    const validCategories = categories.filter(c => c.type === type);
    setNewTransaction(prev => ({
        ...prev,
        type: type,
        categoryId: validCategories.length > 0 ? validCategories[0].id : 0
    }));
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newTransaction.categoryId === 0) {
        return; // Salimos silenciosamente si no hay categoría
      }
      if (isRecurring) {
        await createRecurringTransaction(newTransaction);
      } else {
        await createTransaction(newTransaction);
      }
      
      setIsModalOpen(false);
      setIsRecurring(false);
      
      const defaultExpenseCats = categories.filter(c => c.type === "EXPENSE");
      setNewTransaction({ 
        ...newTransaction, 
        description: "", 
        amount: 0, 
        type: "EXPENSE",
        categoryId: defaultExpenseCats.length > 0 ? defaultExpenseCats[0].id : 0
      });
      loadData();
    } catch (error) {
      console.error("Error creando transacción", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que quieres borrar este movimiento?")) return;
    try {
      await deleteTransaction(id);
      loadData();
    } catch (error) {
      console.error("Error borrando", error);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.accountName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f9f9f6] p-6">
      
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <DollarSign className="text-indigo-600" /> Movimientos
        </h2>
      </header>

      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 flex-1">
                <Search className="text-gray-400" size={20}/>
                <input 
                    type="text" 
                    placeholder="Buscar por concepto o cuenta..." 
                    className="flex-1 outline-none text-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* BOTÓN SUSCRIPCIONES */}
            <button 
                onClick={openRecurringModal}
                className="bg-white text-gray-700 border border-gray-200 px-4 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 justify-center"
            >
                <Clock size={20} className="text-indigo-500"/> Suscripciones
            </button>

            {/* BOTÓN NUEVO MOVIMIENTO */}
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2 justify-center whitespace-nowrap"
            >
                <Plus size={20}/> Nuevo Movimiento
            </button>
        </div>

        {/* LISTA DE TRANSACCIONES */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No hay movimientos registrados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Fecha</th>
                    <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Concepto</th>
                    <th className="p-4 font-semibold text-gray-600 whitespace-nowrap">Cuenta</th>
                    <th className="p-4 font-semibold text-gray-600 text-right whitespace-nowrap">Importe</th>
                    <th className="p-4 font-semibold text-gray-600 text-center whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-gray-500 text-sm whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="p-4">
                          <div className="font-medium text-gray-800">{t.description}</div>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">ID Cat: {t.categoryId}</span>
                      </td>
                      <td className="p-4 text-gray-600 text-sm whitespace-nowrap">{t.accountName}</td>
                      <td className="p-4 text-right font-bold whitespace-nowrap">
                        <span className={t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}>
                          {t.type === 'INCOME' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL DE GESTIÓN DE RECURRENTES --- */}
      {isRecurringModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                 <Clock size={20} className="text-indigo-600"/> Suscripciones Activas
              </h3>
              <button onClick={() => setIsRecurringModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
                {recurringList.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        No tienes ninguna suscripción activa.
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="text-sm text-gray-500 border-b">
                            <tr>
                                <th className="pb-3">Concepto</th>
                                <th className="pb-3 text-right">Importe</th>
                                <th className="pb-3 text-right">Próximo Pago</th>
                                <th className="pb-3 text-center">Cancelar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recurringList.map(rec => (
                                <tr key={rec.id} className="border-b border-gray-50 last:border-0">
                                    <td className="py-4 font-medium text-gray-700">{rec.description}</td>
                                    <td className="py-4 text-right font-bold">
                                        <span className={rec.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}>
                                            {rec.type === 'INCOME' ? '+' : '-'}${Math.abs(rec.amount).toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right text-sm text-gray-500">
                                        {new Date(rec.nextPaymentDate).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 text-center">
                                        <button 
                                            onClick={() => handleCancelRecurring(rec.id)}
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                                            title="Cancelar suscripción"
                                        >
                                            <XCircle size={20}/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="p-4 bg-gray-50 text-center text-xs text-gray-400">
                Las suscripciones canceladas dejarán de generar movimientos automáticamente.
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CREAR MOVIMIENTO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Registrar Movimiento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange("EXPENSE")}
                  className={`p-3 rounded-xl flex items-center justify-center gap-2 font-bold border-2 transition-all ${newTransaction.type === 'EXPENSE' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                >
                  <ArrowDownCircle size={20}/> Gasto
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("INCOME")}
                  className={`p-3 rounded-xl flex items-center justify-center gap-2 font-bold border-2 transition-all ${newTransaction.type === 'INCOME' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                >
                  <ArrowUpCircle size={20}/> Ingreso
                </button>
              </div>

              <div 
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isRecurring ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-transparent'}`}
                onClick={() => setIsRecurring(!isRecurring)}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${isRecurring ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'}`}>
                    {isRecurring && <Plus size={14} className="text-white rotate-45" />}
                </div>
                <div className="flex-1">
                    <p className={`text-sm font-bold ${isRecurring ? 'text-indigo-700' : 'text-gray-600'}`}>Hacer Recurrente (Mensual)</p>
                    <p className="text-xs text-gray-400">Se creará automáticamente el día 1 de cada mes.</p>
                </div>
                <Repeat className={isRecurring ? "text-indigo-500" : "text-gray-300"} size={20}/>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Concepto</label>
                <input
                  type="text"
                  required
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: Compra Mercadona"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Importe</label>
                    <input
                    type="number"
                    step="0.01"
                    required
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha</label>
                    <input
                    type="date"
                    required
                    value={newTransaction.date?.split('T')[0]} 
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cuenta</label>
                    <select
                        className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        value={newTransaction.accountId}
                        onChange={(e) => setNewTransaction({ ...newTransaction, accountId: parseInt(e.target.value) })}
                    >
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
                    <select
                        className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        value={newTransaction.categoryId}
                        onChange={(e) => setNewTransaction({ ...newTransaction, categoryId: parseInt(e.target.value) })}
                    >
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))
                        ) : (
                          <option value={0}>Sin categorías disponibles</option>
                        )}
                    </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 mt-2">
                {isRecurring ? 'Configurar Recurrencia' : 'Guardar Movimiento'}
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;