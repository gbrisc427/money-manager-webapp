import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Trash2, Save, Edit2, Plus, 
  ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight, 
  CircleDollarSign, Search, Repeat, Clock, XCircle, Tag, Loader2
} from "lucide-react";
import { getAccount, updateAccount, deleteAccount } from "../services/accountService";
import type { Account } from "../services/accountService";
import { 
  getTransactionsByAccount, createTransaction, deleteTransaction,
  createRecurringTransaction, getRecurringTransactions, cancelRecurringTransaction
} from "../services/transactionService";
import type { Transaction, TransactionRequest, RecurringTransaction } from "../services/transactionService";
import { getCategories, createCategory } from "../services/categoryService";
import type { Category } from "../services/categoryService";
import { Button } from "../components/ui/Button";
import { SUPPORTED_CURRENCIES, formatCurrency } from "../utils/currency";

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
  const [editCurrency, setEditCurrency] = useState("EUR");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados de carga de acciones CRUD
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [deletingTxId, setDeletingTxId] = useState<number | null>(null);
  const [cancelingRecId, setCancelingRecId] = useState<number | null>(null);

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

  // --- MODAL AÑADIR CATEGORÍA RÁPIDA ---
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newQuickCategory, setNewQuickCategory] = useState({
    name: "",
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    color: "#3b82f6"
  });

  // --- MODAL LISTA RECURRENTES ---
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [accountRecurringList, setAccountRecurringList] = useState<RecurringTransaction[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [accData, txData, catData] = await Promise.all([
        getAccount(accountId),
        getTransactionsByAccount(accountId),
        getCategories()
      ]);
      setAccount(accData);
      setEditName(accData.name);
      setEditType(accData.type);
      setEditCurrency(accData.currency || "EUR");
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
  }, [accountId, navigate]);

  useEffect(() => {
    if (!accountId) return;
    loadData();
  }, [accountId, loadData]);

  // --- LÓGICA RECURRENTES ---
  const openRecurringModal = async () => {
    try {
      const allRecurring = await getRecurringTransactions();
      const filtered = allRecurring.filter((r: RecurringTransaction) => 
          r.active && (r.account?.id === accountId || r.accountId === accountId)
      );
      setAccountRecurringList(filtered);
      setIsRecurringModalOpen(true);
    } catch (error) {
      console.error("Error cargando recurrentes", error);
    }
  };

  const handleCancelRecurring = async (recId: number) => {
    if (cancelingRecId !== null) return;
    if (!window.confirm("¿Cancelar suscripción?")) return;
    setCancelingRecId(recId);
    try {
      await cancelRecurringTransaction(recId);
      const updatedList = await getRecurringTransactions();
      const filtered = updatedList.filter((r: RecurringTransaction) => 
        r.active && (r.account?.id === accountId || r.accountId === accountId)
      );
      setAccountRecurringList(filtered);
    } catch (error) {
      console.error("Error cancelando", error);
    } finally {
      setCancelingRecId(null);
    }
  };

  // --- LÓGICA CREAR CATEGORÍA RÁPIDA ---
  const handleQuickCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingCategory || !newQuickCategory.name) return;
    setIsCreatingCategory(true);
    try {
        await createCategory(newQuickCategory);
        const updatedCats = await getCategories();
        setCategories(updatedCats);
        setIsCategoryModalOpen(false);
        
        const created = updatedCats.find(c => c.name === newQuickCategory.name && c.type === newQuickCategory.type);
        if (created) {
            setNewTransaction(prev => ({ ...prev, categoryId: created.id }));
        }

        setNewQuickCategory({ name: "", type: "EXPENSE", color: "#3b82f6" });
    } catch (error) {
        console.error("Error creando categoría rápida", error);
    } finally {
        setIsCreatingCategory(false);
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
    if (isUpdatingAccount) return;
    setIsUpdatingAccount(true);
    try {
      const updated = await updateAccount(accountId, {
        ...account!,
        name: editName,
        type: editType,
        currency: editCurrency
      });
      setAccount(updated);
      setIsEditing(false);
      await loadData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (isDeletingAccount) return;
    if (!confirm("¿Estás seguro de eliminar esta cuenta y TODAS sus transacciones?")) return;
    setIsDeletingAccount(true);
    try {
      await deleteAccount(accountId);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setIsDeletingAccount(false);
    }
  };

  const handleTypeChange = (type: "INCOME" | "EXPENSE") => {
    const validCategories = categories.filter(c => c.type === type);
    setNewTransaction(prev => ({
        ...prev,
        type: type,
        categoryId: validCategories.length > 0 ? validCategories[0].id : 0
    }));
    setNewQuickCategory(prev => ({ ...prev, type: type }));
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingTx || !newTransaction.categoryId || Number(newTransaction.amount) <= 0) return;
    
    setIsSubmittingTx(true);
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
    } finally {
      setIsSubmittingTx(false);
    }
  };

  const handleDeleteTransaction = async (txId: number) => {
    if (deletingTxId !== null) return;
    if (!confirm("¿Borrar movimiento?")) return;
    setDeletingTxId(txId);
    try {
      await deleteTransaction(txId);
      await loadData();
      if (currentTransactions.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingTxId(null);
    }
  };

  const filteredCategoriesForModal = categories.filter(cat => cat.type === newTransaction.type);

  if (!account) return <div className="p-6">Cargando...</div>;

  const currentAccountCurrency = account.currency || "EUR";

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
                  <button
                    onClick={handleUpdateAccount}
                    disabled={isUpdatingAccount}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingAccount ? <Loader2 size={18} className="animate-spin" /> : <Save size={18}/>}
                  </button>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"><Edit2 size={18}/></button>
                )}
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeletingAccount ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18}/>}
                </button>
              </div>
            </div>

            <div className="min-h-[140px] flex flex-col justify-center">
              {isEditing ? (
                <div className="space-y-3" >
                  <input 
                    disabled={isUpdatingAccount}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    placeholder="Nombre"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      disabled={isUpdatingAccount}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 bg-white" 
                      value={editType} 
                      onChange={e => setEditType(e.target.value)}
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Banco">Banco</option>
                      <option value="Tarjeta">Tarjeta</option>
                      <option value="Ahorro">Ahorro</option>
                      <option value="Inversión">Inversión</option>
                    </select>
                    <select
                      disabled={isUpdatingAccount}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 bg-white font-semibold"
                      value={editCurrency}
                      onChange={e => setEditCurrency(e.target.value)}
                    >
                      {SUPPORTED_CURRENCIES.map(curr => (
                        <option key={curr.code} value={curr.code}>
                          {curr.code} ({curr.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                  {editCurrency !== currentAccountCurrency && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                      Al guardar, el saldo actual y todos los movimientos de esta cuenta se convertirán automáticamente de {currentAccountCurrency} a {editCurrency} según el tipo de cambio oficial actual.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-800">{account.name}</h1>
                  <div className="flex items-center gap-2 mt-2 mb-4">
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full w-max">{account.type}</span>
                    <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full w-max">
                      {currentAccountCurrency}
                    </span>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-gray-500 text-sm">Saldo Actual</p>
                    <p className={`text-3xl font-mono font-bold ${account.balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                      {formatCurrency(account.balance, currentAccountCurrency)}
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
                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency || currentAccountCurrency)}
                      </td>
                      <td className="p-4 text-right w-14">
                        <button 
                          onClick={() => handleDeleteTransaction(tx.id)}
                          disabled={deletingTxId === tx.id}
                          className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <h3 className="text-xl font-bold text-gray-800">Añadir a {account.name} ({currentAccountCurrency})</h3>
              <button onClick={() => !isSubmittingTx && setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4 mb-2">
                <button
                  type="button"
                  disabled={isSubmittingTx}
                  onClick={() => handleTypeChange("EXPENSE")}
                  className={`p-3 rounded-xl flex items-center justify-center gap-2 font-bold border-2 transition-all ${newTransaction.type === 'EXPENSE' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                >
                  <ArrowDownCircle size={20}/> Gasto
                </button>
                <button
                  type="button"
                  disabled={isSubmittingTx}
                  onClick={() => handleTypeChange("INCOME")}
                  className={`p-3 rounded-xl flex items-center justify-center gap-2 font-bold border-2 transition-all ${newTransaction.type === 'INCOME' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                >
                  <ArrowUpCircle size={20}/> Ingreso
                </button>
              </div>

              <div 
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isRecurring ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-transparent'}`}
                onClick={() => !isSubmittingTx && setIsRecurring(!isRecurring)}
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
                  disabled={isSubmittingTx}
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                  placeholder="Ej: Cena, Factura..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Importe ({currentAccountCurrency})</label>
                    <input
                    type="number"
                    step="0.01"
                    required
                    disabled={isSubmittingTx}
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-mono disabled:bg-gray-50"
                    placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha</label>
                    <input
                    type="date"
                    required
                    disabled={isSubmittingTx}
                    value={newTransaction.date?.split('T')[0]} 
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                    />
                </div>
              </div>

              {/* SELECCIÓN DE CATEGORÍA CON ACCESO RÁPIDO */}
              <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Categoría</label>
                    <button 
                        type="button"
                        disabled={isSubmittingTx}
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1 hover:bg-indigo-50 px-2 py-0.5 rounded transition-colors"
                    >
                        <Plus size={12}/> Nueva
                    </button>
                  </div>
                  <select
                      disabled={isSubmittingTx}
                      className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-50"
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

              <Button
                type="submit"
                isLoading={isSubmittingTx}
                loadingText="Guardando..."
                className="py-4 shadow-lg mt-2"
              >
                {isRecurring ? 'Crear Recurrencia' : 'Añadir Movimiento'}
              </Button>

            </form>

            {/* --- MODAL ANIDADO: CREAR CATEGORÍA RÁPIDA --- */}
            {isCategoryModalOpen && (
                <div className="absolute inset-0 bg-white z-10 animate-fade-in flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Tag size={18} className="text-blue-500"/> Nueva Categoría
                        </h3>
                        <button onClick={() => !isCreatingCategory && setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
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
                                disabled={isCreatingCategory}
                                value={newQuickCategory.name}
                                onChange={(e) => setNewQuickCategory({ ...newQuickCategory, name: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                                placeholder="Ej: Regalos, Transporte..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Color</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="color" 
                                    disabled={isCreatingCategory}
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
                                disabled={isCreatingCategory}
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <Button 
                                type="submit" 
                                variant="blue"
                                fullWidth={false}
                                isLoading={isCreatingCategory}
                                loadingText="Guardando..."
                                className="flex-1 py-3 shadow-lg"
                            >
                                Guardar
                            </Button>
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
                                            {rec.type === 'INCOME' ? '+' : '-'}{formatCurrency(Math.abs(rec.amount), rec.currency || currentAccountCurrency)}
                                        </span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <button 
                                            onClick={() => handleCancelRecurring(rec.id)}
                                            disabled={cancelingRecId === rec.id}
                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
