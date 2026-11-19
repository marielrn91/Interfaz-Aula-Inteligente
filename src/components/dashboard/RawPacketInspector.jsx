import React, { useState } from 'react';
import { Code2, ChevronDown, ChevronUp } from 'lucide-react';

export default function RawPacketInspector({ ultimos, rawMessages, lastId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState('ultimos');

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">
              Inspector de Paquetes JSON del Gateway (Formato paquetes.h)
            </h3>
            <p className="text-[11px] text-slate-400">
              Ver estructura cruda de <code className="font-mono text-cyan-300">/api/ultimos</code>{' '}
              y líneas NDJSON de{' '}
              <code className="font-mono text-cyan-300">/api/datos?desde={lastId}</code>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold">
          <span>{isOpen ? 'Ocultar JSON' : 'Inspeccionar JSON'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('ultimos')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === 'ultimos'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                GET /api/ultimos ({ultimos.length} nodos)
              </button>
              <button
                onClick={() => setViewMode('datos')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  viewMode === 'datos'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                GET /api/datos?desde=0 (JSON por línea · último id={lastId})
              </button>
            </div>
            <span className="text-[11px] text-slate-400">
              Nota: Los campos técnicos (mac, seq, gw_ms, uptime_ms, perdidos, anom_bits) viajan en
              msg.
            </span>
          </div>

          {viewMode === 'ultimos' ? (
            <pre className="bg-slate-950 text-cyan-300 p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed border border-slate-800">
              {JSON.stringify(ultimos, null, 2)}
            </pre>
          ) : (
            <pre className="bg-slate-950 text-emerald-300 p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed border border-slate-800">
              {rawMessages
                .slice(-14)
                .map((m) => JSON.stringify(m))
                .join('\n')}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
