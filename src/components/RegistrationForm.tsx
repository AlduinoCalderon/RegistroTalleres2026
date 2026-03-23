import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { AlertCircle, CheckCircle2, Loader2, School, User, Hash, Phone, CalendarCheck } from 'lucide-react';

interface Taller {
  id: string;
  nombre_tematica: string;
  tallerista: string;
  dia: 'Jueves' | 'Viernes';
  capacidad_maxima: number;
  lugares_ocupados: number;
  requerimientos?: string;
}

export default function RegistrationForm() {
  const [talleresJueves, setTalleresJueves] = useState<Taller[]>([]);
  const [talleresViernes, setTalleresViernes] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);

  const [nombre, setNombre] = useState('');
  const [escuela, setEscuela] = useState('');
  const [cct, setCct] = useState('');
  const [telefono, setTelefono] = useState('');
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
    if (!tallerJuevesId || !tallerViernesId) {
      setError('Debes seleccionar un taller diferente para cada uno de los 2 días.');
      return;
    }

    if (!telefono.match(/^\d{10}$/)) {
      setError('El teléfono debe tener exactamente 10 dígitos numéricos.');
      return;
    }

    if (tallerJuevesId && tallerViernesId) {
      const tJ = talleresJueves.find(t => t.id === tallerJuevesId);
      const tV = talleresViernes.find(t => t.id === tallerViernesId);
      
      const normalizeStr = (str: string) => str.toLowerCase().replace(/[^a-záéíóúüñ0-9]/g, '');
      
      if (normalizeStr(tJ?.nombre_tematica || 'j') === normalizeStr(tV?.nombre_tematica || 'v')) {
        setError('Debes seleccionar un taller diferente para cada uno de los 2 días.');
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
        p_telefono: telefono,
        p_taller_jueves_id: tallerJuevesId,
        p_taller_viernes_id: tallerViernesId
      };

      const { data, error } = await supabase.rpc('inscribir_maestro', args);

      if (error) {
        setError(error.message || 'Error desconocido al registrarte. Quizás algún taller ya se llenó.');
      } else {
        setSuccessData({ ...data, nombre_maestro: nombre });
        fetchTalleres(); // Refresh capacities
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado.');
    }
    setSubmitting(false);
  };

  if (successData) {
    return (
      <div className="max-w-3xl mx-auto mt-10 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-br from-green-500 to-emerald-700 p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-24 h-24 text-green-100 drop-shadow-md" />
          </div>
          <h2 className="text-4xl font-extrabold mb-2 tracking-tight">¡Registro Exitoso!</h2>
          <div className="mt-6 bg-red-600 border-4 border-yellow-300 p-4 rounded-xl shadow-2xl animate-pulse">
            <p className="text-white text-xl md:text-2xl font-black uppercase tracking-wider text-shadow-md">
              ¡DETERNERSE! Te recomendamos tomar una captura de pantalla de esta página.
            </p>
            <p className="text-yellow-100 mt-2 font-bold text-lg">
              Guarda este folio en tu celular para el día del evento.
            </p>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="bg-indigo-100 p-3 rounded-full text-indigo-700">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Participante</p>
              <p className="text-xl font-bold text-gray-800">{successData.nombre_maestro}</p>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            {successData.jueves_consecutivo && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">JUEVES</div>
                <div className="pr-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-1 leading-tight">{successData.tematica_jueves}</h3>
                  <p className="text-blue-700 font-medium mb-4">Imparte: {successData.tallerista_jueves}</p>

                  {successData.requerimientos_jueves && (
                    <div className="bg-white/80 p-3 rounded-lg border border-blue-200 mb-4 text-sm text-gray-700">
                      <strong className="text-blue-800 block mb-1">Requerimientos:</strong>
                      {successData.requerimientos_jueves}
                    </div>
                  )}

                  <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-200">
                    <CalendarCheck className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-600 font-medium">Folio asignado:</span>
                    <span className="text-xl font-black text-blue-700">#{successData.jueves_consecutivo}</span>
                  </div>
                </div>
              </div>
            )}

            {successData.viernes_consecutivo && (
              <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">VIERNES</div>
                <div className="pr-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-1 leading-tight">{successData.tematica_viernes}</h3>
                  <p className="text-purple-700 font-medium mb-4">Imparte: {successData.tallerista_viernes}</p>

                  {successData.requerimientos_viernes && (
                    <div className="bg-white/80 p-3 rounded-lg border border-purple-200 mb-4 text-sm text-gray-700">
                      <strong className="text-purple-800 block mb-1">Requerimientos:</strong>
                      {successData.requerimientos_viernes}
                    </div>
                  )}

                  <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-purple-200">
                    <CalendarCheck className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-600 font-medium">Folio asignado:</span>
                    <span className="text-xl font-black text-purple-700">#{successData.viernes_consecutivo}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setSuccessData(null);
              setNombre(''); setEscuela(''); setCct(''); setTelefono('');
              setTallerJuevesId(''); setTallerViernesId('');
            }}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 px-6 rounded-xl transition-colors shadow-lg"
          >
            Registrar otro participante
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white text-center">
        <h2 className="text-3xl font-extrabold tracking-tight">Inscripción a Talleres</h2>
        <p className="text-blue-100 mt-2 text-lg">Completa tus datos y selecciona un taller diferente para cada día.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-200 shadow-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-5">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Datos Personales</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Nombre Completo del Docente
            </label>
            <input
              type="text" required value={nombre} onChange={e => setNombre(e.target.value)}
              className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-3 bg-gray-50 focus:bg-white transition-colors"
              placeholder="Ej. Juan Pérez García"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <School className="w-4 h-4 text-blue-600" /> Escuela de Procedencia
              </label>
              <input
                type="text" required value={escuela} onChange={e => setEscuela(e.target.value)}
                className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-3 bg-gray-50 focus:bg-white transition-colors"
                placeholder="Ej. Esc. Prim. Morelos"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <Hash className="w-4 h-4 text-blue-600" /> Clave CT (CCT)
              </label>
              <input
                type="text" required value={cct} onChange={e => setCct(e.target.value)}
                className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-3 bg-gray-50 focus:bg-white transition-colors"
                placeholder="Ej. 09DPR1234X"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" /> Teléfono (10 dígitos)
              </label>
              <input
                type="tel" required value={telefono} onChange={e => setTelefono(e.target.value.replace(/\D/g, ''))}
                maxLength={10} minLength={10}
                className="w-full border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-3 bg-gray-50 focus:bg-white transition-colors"
                placeholder="Ej. 5512345678"
              />
              <p className="text-xs text-gray-500 mt-1.5 ml-1">Para control interno exclusivo. Solo se permite un registro por número.</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 pt-2">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Selección de Talleres</h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100">
              <Loader2 className="animate-spin w-8 h-8 mb-3 text-blue-500" />
              <span className="font-medium text-sm">Cargando catálogo de talleres...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 shadow-sm relative">
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl">OBLIGATORIO</div>
                <label className="block text-sm font-bold text-blue-900 mb-3">Taller para el día JUEVES</label>
                <select
                  value={tallerJuevesId} onChange={e => setTallerJuevesId(e.target.value)} required
                  className="w-full border-blue-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-3.5 bg-white font-medium text-gray-700 cursor-pointer"
                >
                  <option value="" disabled>-- Selecciona tu taller del jueves --</option>
                  {talleresJueves.map(t => {
                    const lleno = t.lugares_ocupados >= t.capacidad_maxima;
                    return (
                      <option key={t.id} value={t.id} disabled={lleno}>
                        {lleno ? '❌ [LLENO] ' : '✅'} {t.nombre_tematica} - Imparte: {t.tallerista} {lleno ? '' : `(${t.capacidad_maxima - t.lugares_ocupados} lugares disponibles)`}
                      </option>
                    )
                  })}
                </select>
                {tallerJuevesId && talleresJueves.find(t => t.id === tallerJuevesId)?.requerimientos && (
                  <div className="mt-3 bg-blue-100/50 p-3 rounded-lg text-sm text-blue-900 border border-blue-200">
                    <strong>Requerimientos de material:</strong> {talleresJueves.find(t => t.id === tallerJuevesId)?.requerimientos}
                  </div>
                )}
              </div>

              <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100 shadow-sm relative">
                <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl">OBLIGATORIO</div>
                <label className="block text-sm font-bold text-purple-900 mb-3">Taller para el día VIERNES</label>
                <select
                  value={tallerViernesId} onChange={e => setTallerViernesId(e.target.value)} required
                  className="w-full border-purple-200 rounded-xl shadow-sm focus:border-purple-500 focus:ring-purple-500 border p-3.5 bg-white font-medium text-gray-700 cursor-pointer"
                >
                  <option value="" disabled>-- Selecciona tu taller del viernes --</option>
                  {talleresViernes.map(t => {
                    const lleno = t.lugares_ocupados >= t.capacidad_maxima;
                    return (
                      <option key={t.id} value={t.id} disabled={lleno}>
                        {lleno ? '❌ [LLENO] ' : '✅'} {t.nombre_tematica} - Imparte: {t.tallerista} {lleno ? '' : `(${t.capacidad_maxima - t.lugares_ocupados} lugares disponibles)`}
                      </option>
                    )
                  })}
                </select>
                {tallerViernesId && talleresViernes.find(t => t.id === tallerViernesId)?.requerimientos && (
                  <div className="mt-3 bg-purple-100/50 p-3 rounded-lg text-sm text-purple-900 border border-purple-200">
                    <strong>Requerimientos de material:</strong> {talleresViernes.find(t => t.id === tallerViernesId)?.requerimientos}
                  </div>
                )}
              </div>
            </div>
          )}
          <p className="text-sm font-medium text-amber-700 bg-amber-50 p-3 rounded-lg flex items-start gap-2 border border-amber-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            Recuerda que debes elegir un taller diferente para cada día. Si el botón no te deja continuar, verifica tus selecciones.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || loading || !tallerJuevesId || !tallerViernesId}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {submitting ? <><Loader2 className="animate-spin w-6 h-6" /> Procesando Registro Seguro...</> : 'Confirmar e Inscribirse'}
          </button>
        </div>
      </form>
    </div>
  );
}
