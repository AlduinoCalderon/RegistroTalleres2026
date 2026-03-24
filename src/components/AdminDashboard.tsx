import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, LogOut, Loader2, Users } from 'lucide-react';

interface Taller {
  id: string;
  nombre_tematica: string;
  tallerista: string;
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
      // Fetch registrations for this workshop (Phone is implicitly EXCLUDED here)
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
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      const lineHeight = 5; // compact line spacing

      // Header data
      const fecha = taller.dia === 'Jueves' ? 'Jueves 26 de marzo de 2026' : 'Viernes 27 de marzo de 2026';

      // Pre-calculate wrapped lines at font size 10 (used inside drawHeader)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const tallerLabelW = doc.getTextWidth('Taller:   ');
      const imparteLabelW = doc.getTextWidth('Imparte:  ');
      const nombreLines = doc.splitTextToSize(taller.nombre_tematica, contentWidth - tallerLabelW);
      const imparteLines = doc.splitTextToSize(taller.tallerista, contentWidth - imparteLabelW);

      // Helper function: draws the full header on any page
      const drawHeader = () => {
        // ── Fecha: sola, arriba a la derecha (fuente pequeña, muy compacta) ──
        const fechaY = 7;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(fecha, pageWidth - margin, fechaY, { align: 'right' });

        // ── Taller: nombre con wrap, debajo de la fecha ──
        const tallerY = fechaY + 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Taller:', margin, tallerY);
        doc.setFont('helvetica', 'normal');
        doc.text(nombreLines, margin + tallerLabelW, tallerY);

        // ── Imparte: debajo del nombre (también con wrap) ──
        const imparteY = tallerY + (nombreLines.length - 1) * lineHeight + 6;
        doc.setFont('helvetica', 'bold');
        doc.text('Imparte:', margin, imparteY);
        doc.setFont('helvetica', 'normal');
        doc.text(imparteLines, margin + imparteLabelW, imparteY);
      };

      // Draw header on page 1
      drawHeader();

      // Dynamic tableStartY: fecha(7) + gap(6) + taller lines + gap(6) + imparte lines + gap(5)
      const tableStartY =
        7 + 6 +
        (nombreLines.length - 1) * lineHeight +
        6 +
        (imparteLines.length - 1) * lineHeight +
        6 + 5;

      // Table data
      const tableData = registros.map((reg) => [
        reg.numero_consecutivo.toString(),
        reg.participantes.nombre_maestro,
        reg.participantes.escuela,
        reg.participantes.cct,
        '' // space for signature
      ]);

      // Add empty rows if not full
      for (let i = registros.length + 1; i <= taller.capacidad_maxima; i++) {
        tableData.push([i.toString(), '', '', '', '']);
      }

      autoTable(doc, {
        startY: tableStartY,
        head: [['N°', 'Nombre del Maestro', 'Escuela', 'CCT', 'Firma']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138] },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 65 },
          2: { cellWidth: 45 },
          3: { cellWidth: 28 },
          4: { cellWidth: 35 }
        },
        styles: { fontSize: 9, cellPadding: 1.5, minCellHeight: 8, valign: 'middle' },
        // Redraw header on every new page
        didDrawPage: () => {
          drawHeader();
        },
        // Reserve header space on pages 2, 3, …
        margin: { top: tableStartY }
      });

      // Normalize filename: remove diacritics, then replace non-alphanumeric with underscore
      const normalizedName = taller.nombre_tematica
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/gi, '_');
      doc.save(`Asistencia_${taller.dia}_${normalizedName}.pdf`);

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
          <div key={t.id} className="bg-white border text-gray-800 border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-shadow p-6 flex flex-col h-full relative overflow-hidden">
            {t.dia === 'Jueves' ? (
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">JUEVES</div>
            ) : (
              <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">VIERNES</div>
            )}

            <div className="flex justify-between items-start mb-4 mt-2">
              <span className="flex items-center text-sm text-gray-700 font-bold bg-gray-100 px-3 py-1 rounded-full">
                <Users className="w-4 h-4 mr-2 text-blue-600" /> {t.lugares_ocupados}/{t.capacidad_maxima} lugares
              </span>
            </div>

            <h3 className="text-xl font-bold mb-1 leading-tight">{t.nombre_tematica}</h3>
            <p className="text-sm font-medium text-gray-500 mb-4 flex-1">Imparte: {t.tallerista}</p>

            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div
                className={`h-2.5 rounded-full ${t.dia === 'Jueves' ? 'bg-blue-600' : 'bg-purple-600'}`}
                style={{ width: `${(t.lugares_ocupados / t.capacidad_maxima) * 100}%` }}
              ></div>
            </div>

            <button
              onClick={() => generatePDF(t)}
              className={`w-full flex items-center justify-center gap-2 border font-medium py-3 rounded-xl transition ${t.dia === 'Jueves' ? 'border-blue-200 hover:bg-blue-50 text-blue-700' : 'border-purple-200 hover:bg-purple-50 text-purple-700'}`}
            >
              <FileText className="w-5 h-5" /> Descargar Lista PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
