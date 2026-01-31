import React, { useEffect, useState } from "react";
import { Plus, Trash2, Tag, ArrowLeft } from "lucide-react";
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCat, setNewCat] = useState({ 
    name: "", 
    type: "EXPENSE" as "INCOME" | "EXPENSE", 
    color: "#3b82f6" 
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data as Category[]); 
    } catch (error) {
      console.error("Error cargando categorías", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name) return;
    try {
      await createCategory(newCat);
      setNewCat({ ...newCat, name: "" }); 
      loadCategories();
    } catch (error) {
      console.error("Error creando categoría", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Borrar categoría?")) return;
    try {
      await deleteCategory(id);
      loadCategories();
    } catch (error) {
      console.error("Error borrando categoría", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f6] p-6">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Tag className="text-blue-600" /> Categorías
        </h2>
      </header>

      <div className="max-w-4xl mx-auto">
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre</label>
            <input
              type="text"
              value={newCat.name}
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej: Supermercado"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
            <select
              value={newCat.type}
              onChange={(e) => setNewCat({ ...newCat, type: e.target.value as "INCOME" | "EXPENSE" })}
              className="border rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="EXPENSE">Gasto</option>
              <option value="INCOME">Ingreso</option>
            </select>
          </div>
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Color</label>
             <input 
               type="color" 
               value={newCat.color}
               onChange={(e) => setNewCat({...newCat, color: e.target.value})}
               className="h-10 w-16 p-1 rounded border cursor-pointer"
             />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors">
            <Plus size={20} /> Crear
          </button>
        </form>

        {/* Listado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center border-l-12" style={{ borderLeftColor: cat.color }}>
              <div>
                <p className="font-semibold text-gray-800">{cat.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {cat.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                </span>
              </div>
              <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;