import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Save, Edit2, Plus, ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight, CircleDollarSign  } from "lucide-react";
import { getAccount, updateAccount, deleteAccount } from "../services/accountService";
import type { Account } from "../services/accountService";
import { getTransactionsByAccount, createTransaction, deleteTransaction } from "../services/transactionService";
import type { Transaction } from "../services/transactionService";
import { getCategories } from "../services/categoryService";
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

  const [currentPage, setCurrentPage] = useState(1);

  const [txForm, setTxForm] = useState({
    description: "",
    amount: "" as string | number,
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    categoryId: 0
  });

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
    } catch (error) {
      console.error("Error cargando detalles", error);
      navigate("/accounts"); 
    }
  };


  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTransactions = transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.categoryId || Number(txForm.amount) <= 0) {
      alert("Revisa los campos");
      return;
    }
    try {
      await createTransaction({
        description: txForm.description,
        amount: Number(txForm.amount),
        type: txForm.type,
        categoryId: Number(txForm.categoryId),
        accountId: accountId
      });
      await loadData(); 
      setTxForm({ ...txForm, description: "", amount: "" });
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

  if (!account) return <div className="p-6">Cargando...</div>;

  return (
    <div className="h-screen bg-[#f9f9f6] p-6 flex flex-col overflow-hidden">
      
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CircleDollarSign  className="text-indigo-600" /> Detalles de {account.name}</h2>
      </header>

      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        <div className="space-y-6 overflow-y-auto pr-2">
          
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
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-700 font-bold mb-4">Añadir Movimiento</h3>
            <form onSubmit={handleCreateTransaction} className="space-y-3">
              <input 
                type="text" 
                placeholder="Descripción" 
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={txForm.description}
                onChange={e => setTxForm({...txForm, description: e.target.value})}
              />
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-1/2 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={txForm.amount}
                  onChange={e => setTxForm({...txForm, amount: e.target.value})}
                />
                <select 
                  className="w-1/2 border p-2 rounded-lg outline-none bg-white focus:ring-2 focus:ring-indigo-500"
                  value={txForm.type}
                  onChange={e => setTxForm({...txForm, type: e.target.value as any})}
                >
                  <option value="EXPENSE">Gasto</option>
                  <option value="INCOME">Ingreso</option>
                </select>
              </div>
              <select 
                className="w-full border p-2 rounded-lg outline-none bg-white focus:ring-2 focus:ring-indigo-500"
                value={txForm.categoryId}
                onChange={e => setTxForm({...txForm, categoryId: Number(e.target.value)})}
              >
                <option value={0}>Categoría...</option>
                {categories.filter(c => c.type === txForm.type).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium flex justify-center items-center gap-2 transition-colors">
                <Plus size={18}/> Añadir
              </button>
            </form>
          </div>

        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Historial de la Cuenta</h3>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{transactions.length} movs.</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-0 relative">
            {currentTransactions.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <div className="bg-gray-50 p-4 rounded-full mb-2"><ArrowUpCircle size={24} className="opacity-30"/></div>
                <p>No hay movimientos en esta página.</p>
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

          {transactions.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-sm">
               <span className="text-gray-500 hidden sm:inline">
                 {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, transactions.length)} de {transactions.length}
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
    </div>
  );
};

export default AccountDetail;