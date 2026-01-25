import React, { useEffect, useState } from "react";
import { Plus, Trash2, Wallet, ArrowLeft, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAccounts, createAccount, deleteAccount } from "../services/accountService";

interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
}

const Accounts: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [newAccount, setNewAccount] = useState({ name: "", type: "Efectivo", balance: 0.0});

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data as unknown as Account[]);
    } catch (error) {
      console.error("Error cargando cuentas", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name) return;
    try {
      await createAccount(newAccount);
      setNewAccount({ name: "", type: "Efectivo", balance: 0.0 });
      loadAccounts();
    } catch (error) {
      console.error("Error creando cuenta", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Borrar esta cuenta? Se perderá el historial de saldo asociado.")) return;
    try {
      await deleteAccount(id);
      loadAccounts();
    } catch (error) {
      console.error("Error borrando cuenta", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f6] p-6">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="text-indigo-600" /> Mis Cuentas
        </h2>
      </header>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre de la Cuenta</label>
            <input
              type="text"
              value={newAccount.name}
              onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Ej: Banco Principal, Ahorros..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
            <select
              value={newAccount.type}
              onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
              className="border rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none min-w-[150px]"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Banco">Banco</option>
              <option value="Tarjeta">Tarjeta Crédito</option>
              <option value="Ahorro">Ahorro</option>
            </select>
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 transition-colors">
            <Plus size={20} /> Añadir
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((acc) => (
            <div key={acc.id} 
            onClick={() => navigate(`/accounts/${acc.id}`)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-2 bg-indigo-500"></div>
              
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{acc.name}</h3>
                  <p className="text-gray-500 text-sm">{acc.type}</p>
                  <p className={`font-mono font-bold mt-1 ${acc.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${acc.balance.toFixed(2)}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => handleDelete(acc.id)} 
                className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all"
                title="Eliminar cuenta"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          
          {accounts.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-400 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
              <p>No tienes cuentas registradas. Añade una para empezar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Accounts;