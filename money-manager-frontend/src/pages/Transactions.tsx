import React, { useEffect, useState } from "react";
import { Plus, Trash2, ArrowLeft, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
// Importamos SOLO funciones
import { getTransactions, createTransaction, deleteTransaction } from "../services/transactionService";
import { getCategories } from "../services/categoryService";
import { getAccounts } from "../services/accountService";

// Definiciones Locales
interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  accountName?: string;
  categoryId: number | string; // Puede venir como string del backend a veces
}

interface Category {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
}

interface Account {
  id: number;
  name: string;
  balance: number;
}

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  const [form, setForm] = useState({
    description: "",
    amount: "" as string | number,
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    accountId: "",
    categoryId: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [txData, catData, accData] = await Promise.all([
        getTransactions(),
        getCategories(),
        getAccounts()
      ]);
      setTransactions(txData as unknown as Transaction[]);
      setCategories(catData as unknown as Category[]);
      setAccounts(accData as unknown as Account[]);
    } catch (error) {
      console.error("Error cargando datos", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.accountId || !form.categoryId || Number(form.amount) <= 0) {
      alert("Por favor completa todos los campos correctamente");
      return;
    }

    try {
      await createTransaction({
        description: form.description,
        amount: Number(form.amount),
        type: form.type,
        accountId: Number(form.accountId),
        categoryId: form.categoryId 
      });
      fetchData();
      setForm({ ...form, description: "", amount: "" });
    } catch (error) {
      console.error("Error creando transacción", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar transacción? Se revertirá el saldo de la cuenta.")) return;
    try {
      await deleteTransaction(id);
      fetchData();
    } catch (error) {
      console.error("Error eliminando", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f6] p-6">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Movimientos</h2>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* Formulario */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Nueva Operación</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            
            <div className="lg:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Descripción</label>
              <input 
                type="text" 
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ej: Pago alquiler"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Monto</label>
              <input 
                type="number" 
                className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="0.00"
                min="0.01" step="0.01"
                value={form.amount}
                onChange={e => setForm({...form, amount: e.target.value})}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
              <select 
                className="w-full mt-1 p-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.type}
                onChange={e => setForm({...form, type: e.target.value as "INCOME" | "EXPENSE"})}
              >
                <option value="EXPENSE">Gasto (-)</option>
                <option value="INCOME">Ingreso (+)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Cuenta</label>
              <select 
                className="w-full mt-1 p-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.accountId}
                onChange={e => setForm({...form, accountId: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Categoría</label>
              <select 
                className="w-full mt-1 p-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.categoryId}
                onChange={e => setForm({...form, categoryId: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                {categories
                  .filter(c => c.type === form.type)
                  .map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-6 flex justify-end mt-2">
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 transition-colors shadow-sm">
                <Plus size={18} /> Registrar
              </button>
            </div>
          </form>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Fecha</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Descripción</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Cuenta</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Monto</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                 <tr><td colSpan={5} className="p-8 text-center text-gray-400">No hay movimientos recientes</td></tr>
              ) : transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                    {tx.type === 'INCOME' ? (
                      <ArrowUpCircle className="text-green-500 w-5 h-5" />
                    ) : (
                      <ArrowDownCircle className="text-red-500 w-5 h-5" />
                    )}
                    {tx.description}
                  </td>
                  <td className="p-4 text-sm text-gray-500">{tx.accountName}</td>
                  <td className={`p-4 text-right font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}${typeof tx.amount === 'number' ? tx.amount.toFixed(2) : tx.amount}
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleDelete(tx.id)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;