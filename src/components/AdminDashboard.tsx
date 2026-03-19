import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, LogOut, Loader2, Users } from 'lucide-react';

interface Taller {
  id: string;
  nombre_tematica: string;
  dia: string;
  capacidad_maxima: number;
  lugares_ocupados: number;
}

interface Registro {
  numero_consecutivo: number;
  participantes: {
    nombre_maestro: string;
    escuela: string;
    cct: string;
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingDesc, setGeneratingDesc] = useState<string | null>(null);

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_auth');
    if (!isAuth) {
      navigate('/admin');
      return;
    }
    fetchTalleres();
  }, [navigate]);

  const fetchTalleres = async () => {
    const { data, error } = await supabase
      .from('talleres')
      .select('*')
      .order('dia', { ascending: true })
      .order('nombre_tematica', { ascending: true });
    
    if (data) setTalleres(data);
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/admin');
  };

  const generatePDF = async (taller: Taller) => {
    setGeneratingDesc(`Generando PDF para ${taller.nombre_tematica}...`);
    try {
      // Fetch registrations for this workshop
      const { data, error } = await supabase
        .from('registros')
        .select(`
          numero_consecutivo,
          participantes (
            nombre_maestro,
            escuela,
            cct
          )
        `)
        .eq('taller_id', taller.id)
        .order('numero_consecutivo', { ascending: true });

      if (error) throw error;

      const registros = data as unknown as Registro[];

      const doc = new jsPDF();
      
      // Header
      const fecha = taller.dia === 'Jueves' ? 'Jueves 26 de marzo de 2026' : 'Viernes 27 de marzo de 2026';
      doc.setFontSize(12);
      // Taller a la izquierda
      doc.text(`Taller: ${taller.nombre_tematica}`, 14, 15);
      // Fecha a la derecha (el ancho A4 por defecto es 210, así que usamos 196)
      doc.text(`Fecha: ${fecha}`, 196, 15, { align: 'right' });

      // Table data
      const tableData = registros.map((reg) => [
        reg.numero_consecutivo.toString(),
        reg.participantes.nombre_maestro,
        reg.participantes.escuela,
        reg.participantes.cct,
        '' // Empty space for signature
      ]);

      // Add empty rows if not full (optional, but good for printable lists)
      for (let i = registros.length + 1; i <= taller.capacidad_maxima; i++) {
        tableData.push([i.toString(), '', '', '', '']);
      }

      autoTable(doc, {
        startY: 20,
        head: [['N°', 'Nombre del Maestro', 'Escuela', 'CCT', 'Firma']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138] }, // text-blue-900 equivalent
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 65 },
          2: { cellWidth: 45 },
          3: { cellWidth: 28 },
          4: { cellWidth: 35 }
        },
        styles: { fontSize: 9, cellPadding: 2, minCellHeight: 9, valign: 'middle' }
      });

      doc.save(`Asistencia_${taller.dia}_${taller.nombre_tematica.replace(/[^a-z0-9]/gi, '_')}.pdf`);
      
    } catch (err) {
      console.error(err);
      alert('Hubo un error al generar el PDF. Revisa la consola para más detalles.');
    } finally {
      setGeneratingDesc(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Panel de Administración</h2>
          <p className="text-gray-500">Gestión de talleres e impresión de listas.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 py-2 px-4 rounded-lg font-medium transition"
        >
          <LogOut className="w-5 h-5" /> Cerrar Sesión
        </button>
      </div>

      {generatingDesc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl flex items-center gap-4">
            <Loader2 className="animate-spin text-blue-600 w-6 h-6" />
            <span className="font-medium text-gray-800">{generatingDesc}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {talleres.map(t => (
          <div key={t.id} className="bg-white border text-gray-800 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${t.dia === 'Jueves' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                {t.dia}
              </span>
              <span className="flex items-center text-sm text-gray-500 font-medium">
                <Users className="w-4 h-4 mr-1" /> {t.lugares_ocupados}/{t.capacidad_maxima}
              </span>
            </div>
            
            <h3 className="text-xl font-bold mb-2 flex-1">{t.nombre_tematica}</h3>

            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(t.lugares_ocupados / t.capacidad_maxima) * 100}%` }}></div>
            </div>

            <button
              onClick={() => generatePDF(t)}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg transition"
            >
              <FileText className="w-5 h-5" /> Descargar Lista PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
