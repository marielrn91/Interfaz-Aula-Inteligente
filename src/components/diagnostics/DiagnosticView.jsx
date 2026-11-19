import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Wrench,
  ArrowLeft,
  Zap,
  Code2,
} from 'lucide-react';
import SensorIcon from '../common/SensorIcon';

export default function DiagnosticView({
  violations,
  selectedViolationId,
  onSelectViolation,
  onBackToOverview,
}) {
  const activeViolation =
    violations.find(
      (v) => v.id === selectedViolationId || v.sensorId === selectedViolationId
    ) ||
    violations[0] ||
    null;

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            Diagnóstico Causal OR-AND de Anomalías del Gateway (GEMELO-L419)
          </h2>
          <p className="text-xs text-slate-500">
            Evalúa códigos de <code className="font-mono">anomalias</code> reportados en{' '}
            <code className="font-mono">/api/ultimos</code>, fallos de sensor (<code className="font-mono">null</code>)
            y desconexión (<code className="font-mono">hace_s &gt; 60</code>).
          </p>
        </div>
        <button
          onClick={onBackToOverview}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al Monitor General
        </button>
      </div>

      {violations.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 shrink-0">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-900">
              7/7 Nodos con anomalias: &quot;NINGUNA&quot; — Aula L419 en Estado Nominal
            </h3>
            <p className="text-sm text-emerald-700 mt-1">
              Todos los nodos ESP32 están transmitiendo con <code className="font-mono">hace_s &lt; 60</code> y
              sus mediciones en <code className="font-mono">msg</code> se encuentran dentro de los parámetros
              estándar.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Active Violations Cards */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Anomalías y Violaciones Activas ({violations.length})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {violations.map((v) => {
                const isSelected = activeViolation?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => onSelectViolation(v.id)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-red-50 border-red-400 ring-2 ring-red-200 shadow-sm'
                        : 'bg-white border-red-200 hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700">
                        <SensorIcon name={v.icon} className="w-4 h-4" />
                        Nodo {v.nodo} ({v.tipo}) · {v.variableLabel}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-600 text-white">
                        {v.status}
                      </span>
                    </div>
                    <div className="text-lg font-extrabold font-mono text-slate-900">
                      {v.value}{' '}
                      <span className="text-xs font-semibold text-slate-500">
                        {v.value !== 'null' ? v.unit : ''}
                      </span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">{v.detail}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                        anomalias: {v.anomalias}
                      </span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                        hace_s: {v.hace_s}s
                      </span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded">{v.inoFile}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {activeViolation && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                    Evento Principal Activo · {activeViolation.sensorName} ({activeViolation.inoFile})
                  </span>
                  <h3 className="text-base font-bold mt-0.5">
                    {activeViolation.diagnostic.mainEvent}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeViolation.diagnostic.logicNote}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700">
                    anomalias: {activeViolation.anomalias}
                  </span>
                  <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-red-600 text-white">
                    {activeViolation.variableKey}: {activeViolation.value}{' '}
                    {activeViolation.value !== 'null' ? activeViolation.unit : ''}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Causas Raíz (OR) */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Causas Raíz Posibles (Lógica OR)
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {activeViolation.diagnostic.rootCauses.map((c, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 bg-amber-50/70 p-2.5 rounded-lg border border-amber-100"
                      >
                        <span className="font-bold text-amber-600 mt-0.5">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Efectos (AND) */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                    Efectos en el Sistema (Lógica AND)
                  </h3>
                  <div className="space-y-2 text-xs">
                    {activeViolation.diagnostic.effects.map((e, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-purple-50 border border-purple-100 text-purple-900 flex items-start gap-2"
                      >
                        <Zap className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <span>{e}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recomendación Inmediata */}
                <div className="bg-white rounded-xl border-2 border-indigo-200 p-4 shadow-sm">
                  <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2 mb-3">
                    <Wrench className="w-4 h-4 text-indigo-600" />
                    Recomendación Inmediata
                  </h3>
                  <ol className="space-y-2 text-xs text-slate-700">
                    {activeViolation.diagnostic.immediateRecommendation.map((rec, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Paquete JSON exacto recibido del nodo en conflicto */}
              {activeViolation.msg && (
                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-2">
                    <Code2 className="w-4 h-4" />
                    Paquete JSON Crudo (<code className="font-mono">s.msg</code>) recibido del Nodo{' '}
                    {activeViolation.nodo} ({activeViolation.tipo})
                  </div>
                  <pre className="bg-slate-950 text-emerald-300 p-3 rounded-lg text-[11px] font-mono overflow-x-auto border border-slate-800">
                    {JSON.stringify(activeViolation.msg, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
