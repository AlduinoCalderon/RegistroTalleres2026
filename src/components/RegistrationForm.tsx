import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { AlertCircle, CheckCircle2, Loader2, School, User, Hash } from 'lucide-react';

interface Taller {
  id: string;
  nombre_tematica: string;
  dia: 'Jueves' | 'Viernes';
  capacidad_maxima: number;
  lugares_ocupados: number;
}

export default function RegistrationForm() {
  const [talleresJueves, setTalleresJueves] = useState<Taller[]>([]);
  const [talleresViernes, setTalleresViernes] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [cct, setCct] = useState('');
  const [tallerJuevesId, setTallerJuevesId] = useState('');
  const [tallerViernesId, setTallerViernesId] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    fetchTalleres();
  }, []);

  const fetchTalleres = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('talleres')
      .select('*')
      .order('nombre_tematica', { ascending: true });

    if (error) {
      console.error('Error fetching talleres', error);
      setError('Error al cargar la lista de talleres. Por favor intenta de nuevo más tarde.');
    } else if (data) {
      setTalleresJueves(data.filter(t => t.dia === 'Jueves'));
      setTalleresViernes(data.filter(t => t.dia === 'Viernes'));
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tallerJuevesId && !tallerViernesId) {
      setError('Por favor selecciona al menos un taller.');
      return;
    }

    if (tallerJuevesId && tallerViernesId) {
      const tJ = talleresJueves.find(t => t.id === tallerJuevesId);
      const tV = talleresViernes.find(t => t.id === tallerViernesId);
      if (tJ?.nombre_tematica === tV?.nombre_tematica) {
        setError('No puedes seleccionar la misma temática para ambos días.');
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      const args: any = {
        p_nombre_maestro: nombre,
        p_escuela: escuela,
        p_cct: cct,
      };
      if (tallerJuevesId) args.p_taller_jueves_id = tallerJuevesId;
      if (tallerViernesId) args.p_taller_viernes_id = tallerViernesId;

      const { data, error } = await supabase.rpc('inscribir_maestro', args);

      if (error) {
        setError(error.message || 'Error desconocido al registrarte. Quizás el taller ya se llenó.');
      } else {
        setSuccessData(data);
        fetchTalleres(); // Refresh capacities
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado.');
    }
    setSubmitting(false);
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-green-100 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Registro Exitoso!</h2>
        <p className="text-gray-600 mb-8 text-lg">Tu inscripción se ha guardado correctamente. Por favor, toma captura o anota tus números de registro.</p>
        
        <div className="flex flex-col gap-4 text-left bg-gray-50 p-6 rounded-lg mb-8">
          <div className="flex border-b border-gray-200 pb-2">
            <span className="font-semibold w-1/3 text-gray-600">Nombre:</span>
            <span className="w-2/3">{nombre}</span>
          </div>
          {successData.jueves_consecutivo && (
            <div className="flex border-b border-gray-200 pb-2 items-center">
              <span className="font-semibold w-1/3 text-gray-600">Lugar Jueves:</span>
              <span className="w-2/3 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                  Lugar #{successData.jueves_consecutivo}
                </span>
              </span>
            </div>
          )}
          {successData.viernes_consecutivo && (
            <div className="flex pb-2 items-center">
              <span className="font-semibold w-1/3 text-gray-600">Lugar Viernes:</span>
              <span className="w-2/3 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-800 text-sm font-bold px-3 py-1 rounded-full">
                  Lugar #{successData.viernes_consecutivo}
                </span>
              </span>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => {
            setSuccessData(null);
            setNombre(''); setEscuela(''); setCct('');
            setTallerJuevesId(''); setTallerViernesId('');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Registrar otro maestro
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center">
        <h2 className="text-2xl font-bold">Formulario de Inscripción</h2>
        <p className="text-blue-100 mt-2">Selecciona un taller para jueves, viernes o ambos días.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 border border-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Datos Personales</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" /> Nombre del Maestro
            </label>
            <input 
              type="text" required value={nombre} onChange={e => setNombre(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5"
              placeholder="Juan Pérez"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <School className="w-4 h-4 text-gray-500" /> Escuela
              </label>
              <input 
                type="text" required value={escuela} onChange={e => setEscuela(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5"
                placeholder="Escuela Primaria Morelos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" /> Clave CT (CCT)
              </label>
              <input 
                type="text" required value={cct} onChange={e => setCct(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5"
                placeholder="09DPR1234X"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Selección de Talleres</h3>
          
          {loading ? (
            <div className="flex items-center justify-center p-8 text-gray-500">
              <Loader2 className="animate-spin w-6 h-6 mr-2" /> Cargando talleres disponibles...
            </div>
          ) : (
            <>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Taller del Jueves</label>
                <select 
                  value={tallerJuevesId} onChange={e => setTallerJuevesId(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 bg-white"
                >
                  <option value="">-- No tomaré taller el jueves --</option>
                  {talleresJueves.map(t => {
                    const lleno = t.lugares_ocupados >= t.capacidad_maxima;
                    return (
                      <option key={t.id} value={t.id} disabled={lleno}>
                        {t.nombre_tematica} {lleno ? '(LLENO)' : `(${t.capacidad_maxima - t.lugares_ocupados} lugares disponibles)`}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Taller del Viernes</label>
                <select 
                  value={tallerViernesId} onChange={e => setTallerViernesId(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2.5 bg-white"
                >
                  <option value="">-- No tomaré taller el viernes --</option>
                  {talleresViernes.map(t => {
                    const lleno = t.lugares_ocupados >= t.capacidad_maxima;
                    return (
                      <option key={t.id} value={t.id} disabled={lleno}>
                        {t.nombre_tematica} {lleno ? '(LLENO)' : `(${t.capacidad_maxima - t.lugares_ocupados} lugares disponibles)`}
                      </option>
                    )
                  })}
                </select>
              </div>
            </>
          )}
          <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
            Recuerda que no puedes seleccionar la misma temática para ambos días.
          </p>
        </div>

        <div className="pt-6">
          <button 
            type="submit" 
            disabled={submitting || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-md disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {submitting ? <><Loader2 className="animate-spin w-5 h-5"/> Procesando Registro...</> : 'Inscribirse a Talleres'}
          </button>
        </div>
      </form>
    </div>
  );
}
