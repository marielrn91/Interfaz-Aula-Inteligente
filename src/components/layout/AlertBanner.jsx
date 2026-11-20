import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function AlertBanner({ violations, onOpenDiagnostic }) {
  if (!violations || violations.length === 0) return null;

  const first = violations[0];

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 md:px-6 py-3 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/15 shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-200">
              Alerta Activa en el Aula ({violations.length} alerta
              {violations.length > 1 ? 's' : ''})
            </div>
            <div className="text-sm font-semibold">
              {first.sensorShort}: {first.detail}
              {violations.length > 1 && ` (+${violations.length - 1} más)`}
            </div>
          </div>
        </div>
        <button
          onClick={() => onOpenDiagnostic(first.id)}
          className="inline-flex items-center gap-2 bg-white text-red-700 hover:bg-amber-50 font-bold text-xs px-4 py-2 rounded-lg shadow transition-all shrink-0 cursor-pointer"
        >
          Ver Diagnóstico y Recomendaciones
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
