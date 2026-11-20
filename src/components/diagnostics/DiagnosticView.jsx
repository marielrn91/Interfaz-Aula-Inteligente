import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Wrench,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
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
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            Diagnóstico del Aula y Recomendaciones de Acción
          </h2>
          <p className="text-xs text-slate-500">
            Detección automática de condiciones fuera de rango y sugerencias prácticas de mitigación.
          </p>
        </div>
        <button
          onClick={onBackToOverview}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer"
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
              Aula L418 en Estado Óptimo — Todos los Parámetros Saludables
            </h3>
            <p className="text-sm text-emerald-700 mt-1">
              Los 7 sensores reportan niveles ideales de calidad del aire (CO₂), acústica, iluminación,
              temperatura y ventilación. No se requiere ninguna acción correctiva en este momento.
            </p>
            <p className="text-xs text-emerald-600 mt-2">
              Tip: Puedes simular un escenario de anomalía desde la pestaña &quot;Simulador y Conexión Wi-Fi&quot; para comprobar cómo responde el sistema ante contingencias.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Selector de Alertas Activas si hay más de una */}
          {violations.length > 1 && (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Alertas Activas en el Aula ({violations.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {violations.map((v) => {
                  const isSelected = activeViolation?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => onSelectViolation(v.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-red-50 border-red-400 ring-2 ring-red-200 shadow-sm'
                          : 'bg-white border-red-200 hover:border-red-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700">
                          <SensorIcon name={v.icon} className="w-4 h-4" />
                          {v.sensorShort}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-600 text-white">
                          {v.translatedStatus || v.status}
                        </span>
                      </div>
                      <div className="text-base font-bold text-slate-900">
                        {v.value} {v.value !== 'Sin señal' ? v.unit : ''}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{v.variableLabel}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeViolation && (
            <div className="space-y-4">
              {/* Tarjeta de Resumen del Evento */}
              <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className="p-3 rounded-xl text-white shrink-0"
                    style={{ backgroundColor: activeViolation.color || '#4f46e5' }}
                  >
                    <SensorIcon name={activeViolation.icon} className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                      Alerta Detectada · {activeViolation.sensorName}
                    </span>
                    <h3 className="text-lg font-bold mt-0.5">
                      {activeViolation.diagnostic?.mainEvent || activeViolation.detail}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {activeViolation.referenceNote}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-800 rounded-lg px-3.5 py-2 border border-slate-700 text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                      Medición Actual
                    </span>
                    <span className="text-lg font-extrabold text-cyan-300 font-mono">
                      {activeViolation.value} {activeViolation.value !== 'Sin señal' ? activeViolation.unit : ''}
                    </span>
                  </div>
                  <div className="bg-red-600/90 rounded-lg px-3.5 py-2 border border-red-500 text-right">
                    <span className="text-[10px] text-red-100 block uppercase font-semibold">
                      Estado
                    </span>
                    <span className="text-sm font-extrabold text-white">
                      {activeViolation.translatedStatus || activeViolation.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Bloques Principales: Causas, Consecuencias y Recomendaciones */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 1. Causas Posibles */}
                <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-amber-100">
                      <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Causas Posibles
                      </h3>
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-700">
                      {activeViolation.diagnostic?.rootCauses?.map((cause, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100/70"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                          <span className="leading-relaxed">{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Factores que pudieron originar la variación
                  </div>
                </div>

                {/* 2. Consecuencias en el Aula */}
                <div className="bg-white rounded-xl border border-rose-200 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-rose-100">
                      <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Consecuencias en el Aula
                      </h3>
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-700">
                      {activeViolation.diagnostic?.effects?.map((effect, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 bg-rose-50/60 p-2.5 rounded-lg border border-rose-100/70"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                          <span className="leading-relaxed">{effect}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Impacto en confort, concentración o seguridad
                  </div>
                </div>

                {/* 3. Recomendaciones de Acción */}
                <div className="bg-white rounded-xl border-2 border-indigo-200 p-5 shadow-sm flex flex-col justify-between ring-1 ring-indigo-100">
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-indigo-100">
                      <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-indigo-950">
                        Recomendaciones de Acción
                      </h3>
                    </div>
                    <ol className="space-y-2.5 text-xs text-slate-700">
                      {activeViolation.diagnostic?.immediateRecommendation?.map((rec, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100"
                        >
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed font-medium text-slate-800">
                            {rec}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-indigo-700 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    Medidas correctivas inmediatas
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
