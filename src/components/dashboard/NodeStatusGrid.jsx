import React from 'react';
import { WifiOff, Clock, AlertTriangle, CheckCircle2, Radio } from 'lucide-react';
import SensorIcon from '../common/SensorIcon';

export default function NodeStatusGrid({ nodeStatuses, onSelectNode }) {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Lecturas en Tiempo Real de los 7 Nodos ESP32 (/api/ultimos)
          </h3>
          <p className="text-xs text-slate-500">
            Datos extraídos directamente de <code className="font-mono text-indigo-600">s.msg</code> · Si{' '}
            <code className="font-mono text-indigo-600">hace_s &gt; 60</code>, el sensor está
            apagado o desconectado.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {nodeStatuses.map((node) => {
          const msg = node.msg || {};
          const hasPacket = node.hasReceivedPacket;
          const primaryVal = hasPacket ? msg[node.primaryField] : undefined;
          const isNull = primaryVal === null || primaryVal === undefined;
          const isBad = node.severity !== 'nominal';
          const primaryVar = node.variables[0];

          return (
            <div
              key={node.id}
              onClick={() => onSelectNode(node.id)}
              className={`bg-white rounded-xl border p-3.5 shadow-sm cursor-pointer transition-all hover:shadow-md flex flex-col justify-between ${
                !hasPacket
                  ? 'border-slate-200 opacity-85'
                  : node.isOffline
                  ? 'border-red-400 bg-red-50/30 ring-2 ring-red-100'
                  : isBad
                  ? 'border-red-300 ring-2 ring-red-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Top row: Nodo # + tipo + hace_s */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900 text-cyan-300">
                    Nodo {node.nodo} · {node.tipo}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      !hasPacket
                        ? 'bg-slate-100 text-slate-400'
                        : node.isOffline
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                    title="Segundos desde el último dato recibido en el gateway"
                  >
                    {node.isOffline ? (
                      <WifiOff className="w-3 h-3" />
                    ) : (
                      <Clock className="w-2.5 h-2.5" />
                    )}
                    {hasPacket && node.hace_s !== null ? `${node.hace_s}s` : '--'}
                  </span>
                </div>

                {/* Title & Icon */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {node.shortName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {node.inoFile}
                    </div>
                  </div>
                  <div
                    className="p-1.5 rounded-lg text-white shrink-0"
                    style={{ backgroundColor: node.color }}
                  >
                    <SensorIcon name={node.icon} className="w-4 h-4" />
                  </div>
                </div>

                {/* Primary Value */}
                <div className="my-2 py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-medium">
                    {primaryVar?.label} (<code className="font-mono">{node.primaryField}</code>)
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span
                      className={`text-xl font-extrabold font-mono ${
                        !hasPacket
                          ? 'text-slate-400'
                          : isBad
                          ? 'text-red-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {!hasPacket
                        ? '--'
                        : isNull
                        ? 'null'
                        : node.primaryField === 'puerta_abierta'
                        ? primaryVal === 1
                          ? 'ABIERTA (1)'
                          : 'CERRADA (0)'
                        : primaryVal}
                    </span>
                    {hasPacket && !isNull && node.primaryField !== 'puerta_abierta' && (
                      <span className="text-xs font-semibold text-slate-400">
                        {primaryVar?.unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Secondary fields from msg */}
                <div className="space-y-1 text-[11px]">
                  {node.secondaryFields.map((sf) => {
                    const raw = hasPacket ? msg[sf.key] : undefined;
                    const formatted = !hasPacket
                      ? '--'
                      : raw === null || raw === undefined
                      ? 'null'
                      : sf.formatter
                      ? sf.formatter(raw)
                      : sf.formatSigned && Number(raw) > 0
                      ? `+${raw} ${sf.unit}`
                      : `${raw} ${sf.unit}`.trim();

                    return (
                      <div
                        key={sf.key}
                        className="flex items-center justify-between text-slate-600 gap-1"
                      >
                        <span className="text-slate-400 truncate" title={sf.key}>
                          {sf.label}:
                        </span>
                        <span className="font-mono font-semibold text-slate-800 truncate">
                          {formatted}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer: anomalias field */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                <span className="text-[10px] text-slate-400 font-mono">anomalias:</span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full truncate max-w-[140px] ${
                    !hasPacket
                      ? 'bg-slate-100 text-slate-500'
                      : node.isOffline || isBad
                      ? 'bg-red-100 text-red-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                  title={node.anomalias}
                >
                  {!hasPacket ? (
                    <Radio className="w-2.5 h-2.5 shrink-0" />
                  ) : node.isOffline || isBad ? (
                    <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                  )}
                  <span className="truncate">
                    {!hasPacket
                      ? 'ESPERANDO'
                      : node.isOffline
                      ? 'HACE_S > 60'
                      : node.anomalias}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
