import React, { useEffect, useState } from "react";
import { 
  Plus, Search, ArrowUpCircle, ArrowDownCircle, 
  Trash2, Tag, ArrowLeft 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCategories, createCategory, deleteCategory } from "../services/categoryService";

interface Category {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
  userId: number;
}

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el Buscador
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCat, setNewCat] = useState({ 
    name: "", 
    type: "EXPENSE" as "INCOME" | "EXPENSE", 
    color: "#3b82f6" 
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data as Category[]); 
    } catch (error) {
      console.error("Error cargando categorías", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name) return;
    try {
      await createCategory(newCat);
      setNewCat({ name: "", type: "EXPENSE", color: "#3b82f6" }); // Reset
      setIsModalOpen(false); // Cerrar modal
      loadCategories();
    } catch (error) {
      console.error("Error creando categoría", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Borrar categoría? Se perderá la referencia en los movimientos antiguos.")) return;
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (error) {
      console.error("Error borrando categoría", error);
    }
  };

  // Filtrar categorías según el buscador
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f9f9f6] p-6">
      
      {/* CABECERA (Idéntica a Transactions) */}
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Tag className="text-blue-600" /> Categorías
        </h2>
      </header>

      <div className="max-w-5xl mx-auto">
        
        {/* BARRA DE ACCIONES: Buscador + Botón Nueva */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 flex-1">
                <Search className="text-gray-400" size={20}/>
                <input 
                    type="text" 
                    placeholder="Buscar categoría..." 
                    className="flex-1 outline-none text-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2 justify-center whitespace-nowrap"
            >
                <Plus size={20}/> Nueva Categoría
            </button>
        </div>

        {/* LISTADO DE TARJETAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
             <div className="col-span-full text-center text-gray-400 py-10">Cargando...</div>
          ) : filteredCategories.length === 0 ? (
             <div className="col-span-full text-center text-gray-400 py-10">No se encontraron categorías.</div>
          ) : (
             filteredCategories.map((cat) => (
                <div key={cat.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center transition-transform hover:scale-[1.02]" style={{ borderLeft: `6px solid ${cat.color}` }}>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{cat.name}</p>
                    <span className={`text-xs px-2 py-1 rounded-md font-bold mt-1 inline-block ${cat.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {cat.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(cat.id)} className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
             ))
          )}
        </div>
      </div>

      {/* --- MODAL NUEVA CATEGORÍA --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Nueva Categoría</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Selector de Tipo (Estilo Botones Grandes) */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setNewCat({...newCat, type: "EXPENSE"})}
                  className={`p-3 rounded-xl flex items-center justify-center gap-2 font-bold border-2 transition-all ${newCat.type === 'EXPENSE' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                >
                  <ArrowDownCircle size={20}/> Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setNewCat({...newCat, type: "INCOME"})}
                  className={`p-3 rounded-xl flex items-center justify-center gap-2 font-bold border-2 transition-all ${newCat.type === 'INCOME' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                >
                  <ArrowUpCircle size={20}/> Ingreso
                </button>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Gimnasio, Alquiler..."
                />
              </div>

              {/* Color */}
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Color Etiqueta</label>
                 <div className="flex items-center gap-4">
                    <input 
                        type="color" 
                        value={newCat.color}
                        onChange={(e) => setNewCat({...newCat, color: e.target.value})}
                        className="h-12 w-20 p-1 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <div className="text-sm text-gray-500">
                        Elige un color para identificar tus movimientos en los gráficos.
                    </div>
                 </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 mt-2">
                Guardar Categoría
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Categories;