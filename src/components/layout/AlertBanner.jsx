import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function AlertBanner({ violations, onOpenDiagnostic }) {
  if (!violations || violations.length === 0) return null;

  const first = violations[0];

  return (
    <div className="bg-rose-600 text-white px-4 md:px-6 py-3.5 shadow-lg border-b border-rose-800">
      <div className="flex flex-wrap items-center justify-between gap-3 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/20 shadow-xs shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-amber-200">
              Aviso de Confort en el Aula ({violations.length} activo
              {violations.length > 1 ? 's' : ''})
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              {first.sensorShort}: {first.detail}
              {violations.length > 1 && ` (+${violations.length - 1} más)`}
            </div>
          </div>
        </div>
        <button
          onClick={() => onOpenDiagnostic(first.id)}
          className="inline-flex items-center gap-2 bg-white text-rose-700 hover:bg-amber-50 font-extrabold text-xs px-4 py-2 rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
        >
          Ver Recomendaciones de Acción
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
