import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Trash2, Save, Edit2, Plus, 
  ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight, 
  CircleDollarSign, Search, Repeat, Clock, XCircle, Tag 
} from "lucide-react";
import { getAccount, updateAccount, deleteAccount } from "../services/accountService";
import type { Account } from "../services/accountService";
import { 
  getTransactionsByAccount, createTransaction, deleteTransaction,
  createRecurringTransaction, getRecurringTransactions, cancelRecurringTransaction
} from "../services/transactionService";
import type { Transaction, TransactionRequest, RecurringTransaction } from "../services/transactionService";
import { getCategories, createCategory } from "../services/categoryService"; // <--- Importamos createCategory
import type { Category } from "../services/categoryService";

const ITEMS_PER_PAGE = 10;

const AccountDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const accountId = Number(id);

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  // --- MODAL AÑADIR MOVIMIENTO ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [newTransaction, setNewTransaction] = useState<TransactionRequest>({
    description: "",
    amount: 0,
    type: "EXPENSE",
    accountId: accountId, 
    categoryId: 0,
    date: new Date().toISOString().split('T')[0]
  });

  // --- MODAL AÑADIR CATEGORÍA RÁPIDA (NUEVO) ---
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newQuickCategory, setNewQuickCategory] = useState({
    name: "",
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    color: "#3b82f6"
  });

  // --- MODAL LISTA RECURRENTES ---
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [accountRecurringList, setAccountRecurringList] = useState<RecurringTransaction[]>([]);

  useEffect(() => {
    if (!accountId) return;
    loadData();
  }, [accountId]);

  const loadData = async () => {
    try {
      const [accData, txData, catData] = await Promise.all([
        getAccount(accountId),
        getTransactionsByAccount(accountId),
        getCategories()
      ]);
      setAccount(accData);
      setEditName(accData.name);
      setEditType(accData.type);
      setTransactions(txData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setCategories(catData);
      
      const defaultExpenseCats = catData.filter(c => c.type === "EXPENSE");
      setNewTransaction(prev => ({
        ...prev,
        categoryId: defaultExpenseCats.length > 0 ? defaultExpenseCats[0].id : 0
      }));

    } catch (error) {
      console.error("Error cargando detalles", error);
      navigate("/accounts"); 
    }
  };

  // --- LÓGICA RECURRENTES ---
  const openRecurringModal = async () => {
    try {
      const allRecurring = await getRecurringTransactions();
      const filtered = allRecurring.filter((r: any) => 
          r.active && (r.account?.id === accountId || r.accountId === accountId)
      );
      setAccountRecurringList(filtered);
      setIsRecurringModalOpen(true);
    } catch (error) {
      console.error("Error cargando recurrentes", error);
    }
  };

  const handleCancelRecurring = async (recId: number) => {
    if (!window.confirm("¿Cancelar suscripción?")) return;
    try {
      await cancelRecurringTransaction(recId);
      const updatedList = await getRecurringTransactions();
      const filtered = updatedList.filter((r: any) => 
        r.active && (r.account?.id === accountId || r.accountId === accountId)
      );
      setAccountRecurringList(filtered);
    } catch (error) {
      console.error("Error cancelando", error);
    }
  };

  // --- LÓGICA CREAR CATEGORÍA RÁPIDA ---
  const handleQuickCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuickCategory.name) return;
    try {
        // 1. Crear la categoría
        await createCategory(newQuickCategory);
        
        // 2. Recargar categorías
        const updatedCats = await getCategories();
        setCategories(updatedCats);
        
        // 3. Cerrar modal de categoría (volvemos al de transacción)
        setIsCategoryModalOpen(false);
        
        // 4. Opcional: Seleccionar la nueva categoría automáticamente
        // Buscamos la categoría recién creada (asumiendo que es la última o por nombre)
        const created = updatedCats.find(c => c.name === newQuickCategory.name && c.type === newQuickCategory.type);
        if (created) {
            setNewTransaction(prev => ({ ...prev, categoryId: created.id }));
        }

        // 5. Resetear formulario
        setNewQuickCategory({ name: "", type: "EXPENSE", color: "#3b82f6" });

    } catch (error) {
        console.error("Error creando categoría rápida", error);
    }
  };

  // --- LÓGICA GENERAL ---
  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const handleUpdateAccount = async () => {
    try {
      const updated = await updateAccount(accountId, { ...account!, name: editName, type: editType });
      setAccount(updated);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("¿Estás seguro de eliminar esta cuenta y TODAS sus transacciones?")) return;
    try {
      await deleteAccount(accountId);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  const handleTypeChange = (type: "INCOME" | "EXPENSE") => {
    const validCategories = categories.filter(c => c.type === type);
    setNewTransaction(prev => ({
        ...prev,
        type: type,
        categoryId: validCategories.length > 0 ? validCategories[0].id : 0
    }));
    // Sincronizar el tipo para el modal de nueva categoría también
    setNewQuickCategory(prev => ({ ...prev, type: type }));
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.categoryId || Number(newTransaction.amount) <= 0) return;
    
    try {
      const payload = {
        ...newTransaction,
        amount: Number(newTransaction.amount),
        categoryId: Number(newTransaction.categoryId),
        accountId: accountId
      };

      if (isRecurring) {
        await createRecurringTransaction(payload);
      } else {
        await createTransaction(payload);
      }

      await loadData(); 
      setIsModalOpen(false);
      setIsRecurring(false);
      
      const defaultExpenseCats = categories.filter(c => c.type === "EXPENSE");
      setNewTransaction({ 
        description: "", 
        amount: 0, 
        type: "EXPENSE",
        accountId: accountId,
        categoryId: defaultExpenseCats.length > 0 ? defaultExpenseCats[0].id : 0,
        date: new Date().toISOString().split('T')[0]
      });
      setCurrentPage(1); 
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTransaction = async (txId: number) => {
    if (!confirm("¿Borrar movimiento?")) return;
    try {
      await deleteTransaction(txId);
      await loadData();
      if (currentTransactions.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredCategoriesForModal = categories.filter(cat => cat.type === newTransaction.type);

  if (!account) return <div className="p-6">Cargando...</div>;

  return (
    <div className="h-screen bg-[#f9f9f6] p-6 flex flex-col overflow-hidden">
      
      <header className="flex items-center gap-4 mb-6 flex-shrink-0">
        <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CircleDollarSign className="text-indigo-600" /> Detalles de {account.name}
        </h2>
      </header>

      <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* COLUMNA IZQUIERDA: INFO Y RECURRENTES */}
        <div className="w-full lg:w-1/3 flex-shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-gray-500 text-sm font-bold uppercase">Información</h3>
              <div className="flex gap-2">
                {isEditing ? (
                  <button onClick={handleUpdateAccount} className="p-2 text-green-600 hover:bg-green-50 rounded-full"><Save size={18}/></button>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"><Edit2 size={18}/></button>
                )}
                <button onClick={handleDeleteAccount} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><Trash2 size={18}/></button>
              </div>
            </div>

            <div className="min-h-[140px] flex flex-col justify-center">
              {isEditing ? (
                <div className="space-y-3" >
                  <input 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    placeholder="Nombre"
                  />
                  <select 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={editType} 
                    onChange={e => setEditType(e.target.value)}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Banco">Banco</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Ahorro">Ahorro</option>
                  </select>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-800">{account.name}</h1>
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mt-2 mb-4 w-max">{account.type}</span>
                  <div className="pt-4 border-t">
                    <p className="text-gray-500 text-sm">Saldo Actual</p>
                    <p className={`text-3xl font-mono font-bold ${account.balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                      ${account.balance.toFixed(2)}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
                <button 
                    onClick={openRecurringModal}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 py-3 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
                >
                    <Clock size={18} /> Suscripciones de Cuenta
                </button>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: HISTORIAL */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          
          <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-auto flex-1">
                <Search size={16} className="text-gray-400"/>
                <input 
                    type="text" 
                    placeholder="Buscar movimiento..." 
                    className="outline-none text-sm w-full text-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             
             <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap text-sm"
            >
                <Plus size={16}/> Añadir Movimiento
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-0 relative">
            {currentTransactions.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <div className="bg-gray-50 p-4 rounded-full mb-2"><ArrowUpCircle size={24} className="opacity-30"/></div>
                <p>No hay movimientos.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-gray-100">
                  {currentTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {tx.type === 'INCOME' ? (
                            <div className="bg-green-100 p-2 rounded-full text-green-600 flex-shrink-0"><ArrowUpCircle size={20}/></div>
                          ) : (
                            <div className="bg-red-100 p-2 rounded-full text-red-600 flex-shrink-0"><ArrowDownCircle size={20}/></div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate">{tx.description}</p>
                            <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`p-4 text-right font-bold whitespace-nowrap ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}${typeof tx.amount === 'number' ? tx.amount.toFixed(2) : tx.amount}
                      </td>
                      <td className="p-4 text-right w-14">
                        <button 
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {filteredTransactions.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-sm flex-shrink-0">
               <span className="text-gray-500 hidden sm:inline">
                 {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredTransactions.length)} de {filteredTransactions.length}
               </span>
               <div className="flex gap-2 ml-auto">
                 <button 
                   onClick={goToPrevPage} disabled={currentPage === 1}
                   className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                 >
                   <ChevronLeft size={16}/> Ant.
                 </button>
                 <span className="flex items-center px-2 font-medium">{currentPage}</span>
                 <button 
                   onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0}
                   className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                 >
                   Sig. <ChevronRight size={16}/>
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL PARA AÑADIR MOVIMIENTO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in relative">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Añadir a {account.name}</h3>
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
                  placeholder="Ej: Cena, Factura..."
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

              {/* SELECCIÓN DE CATEGORÍA CON ACCESO RÁPIDO */}
              <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Categoría</label>
                    {/* Botón para abrir modal de crear categoría */}
                    <button 
                        type="button"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1 hover:bg-indigo-50 px-2 py-0.5 rounded transition-colors"
                    >
                        <Plus size={12}/> Nueva
                    </button>
                  </div>
                  <select
                      className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      value={newTransaction.categoryId}
                      onChange={(e) => setNewTransaction({ ...newTransaction, categoryId: parseInt(e.target.value) })}
                  >
                      {filteredCategoriesForModal.length > 0 ? (
                        filteredCategoriesForModal.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))
                      ) : (
                        <option value={0}>Sin categorías disponibles</option>
                      )}
                  </select>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 mt-2">
                {isRecurring ? 'Crear Recurrencia' : 'Añadir Movimiento'}
              </button>

            </form>

            {/* --- MODAL ANIDADO: CREAR CATEGORÍA RÁPIDA --- */}
            {isCategoryModalOpen && (
                <div className="absolute inset-0 bg-white z-10 animate-fade-in flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Tag size={18} className="text-blue-500"/> Nueva Categoría
                        </h3>
                        <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                    <form onSubmit={handleQuickCreateCategory} className="p-6 flex-1 flex flex-col gap-4">
                        
                        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm mb-2">
                            Estás creando una categoría de <strong>{newQuickCategory.type === 'INCOME' ? 'Ingreso' : 'Gasto'}</strong>.
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                            <input
                                type="text"
                                required
                                autoFocus
                                value={newQuickCategory.name}
                                onChange={(e) => setNewQuickCategory({ ...newQuickCategory, name: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: Regalos, Transporte..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Color</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="color" 
                                    value={newQuickCategory.color}
                                    onChange={(e) => setNewQuickCategory({...newQuickCategory, color: e.target.value})}
                                    className="h-10 w-20 p-1 rounded border cursor-pointer"
                                />
                                <span className="text-sm text-gray-400">Elige un color identificativo.</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200"
                            >
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
          </div>
        </div>
      )}

      {/* --- MODAL DE SUSCRIPCIONES --- */}
      {isRecurringModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                 <Clock size={20} className="text-indigo-600"/> Suscripciones: {account.name}
              </h3>
              <button onClick={() => setIsRecurringModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
                {accountRecurringList.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        No hay suscripciones activas en esta cuenta.
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="text-sm text-gray-500 border-b">
                            <tr>
                                <th className="pb-3">Concepto</th>
                                <th className="pb-3 text-right">Importe</th>
                                <th className="pb-3 text-center">Cancelar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accountRecurringList.map(rec => (
                                <tr key={rec.id} className="border-b border-gray-50 last:border-0">
                                    <td className="py-4 font-medium text-gray-700">
                                        {rec.description}
                                        <div className="text-xs text-gray-400 font-normal">
                                            Prox: {new Date(rec.nextPaymentDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="py-4 text-right font-bold">
                                        <span className={rec.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}>
                                            {rec.type === 'INCOME' ? '+' : '-'}${Math.abs(rec.amount).toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <button 
                                            onClick={() => handleCancelRecurring(rec.id)}
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
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
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountDetail;