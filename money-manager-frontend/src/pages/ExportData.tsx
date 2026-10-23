import React, { useState } from "react";
import { ArrowLeft, Download, Calendar, FileSpreadsheet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { downloadExcel } from "../services/exportService";

const ExportData: React.FC = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await downloadExcel(startDate, endDate);
    } catch (error) {
      console.error("Error exportando", error);
      alert("Hubo un error al generar el archivo. Verifica tu sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f6] p-6">
      
      {/* HEADER (Alineado a la izquierda, igual que el resto de páginas) */}
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/profile")} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Download className="text-indigo-600" /> Exportar Datos
        </h2>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-5xl mx-auto flex justify-center">
        
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet className="text-green-600" size={32}/>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Descargar Historial</h3>
                <p className="text-gray-500 mt-2">Genera un archivo Excel (.xlsx) con todos tus movimientos para analizarlos externamente.</p>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Desde</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input 
                                type="date" 
                                className="w-full border border-gray-200 rounded-xl p-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Hasta</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input 
                                type="date" 
                                className="w-full border border-gray-200 rounded-xl p-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleDownload}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? 'Generando...' : (
                        <>
                            <Download size={20}/> Descargar Excel
                        </>
                    )}
                </button>
                
                <p className="text-xs text-center text-gray-400">
                    Si no seleccionas fechas, se descargarán todos los movimientos históricos.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ExportData;