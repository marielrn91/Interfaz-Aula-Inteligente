import React from 'react';
import {
  AlertTriangle,
  Wrench,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  Sparkles,
  HeartHandshake,
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
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <HeartHandshake className="w-5 h-5" />
            </div>
            Cuidado del Aula: Diagnóstico y Recomendaciones Prácticas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Orientación clara para estudiantes, profesores y personal para mantener un espacio saludable de clase.
          </p>
        </div>
        <button
          onClick={onBackToOverview}
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Monitor de Bienestar
        </button>
      </div>

      {violations.length === 0 ? (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-md">
          <div className="p-5 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-950/20 shrink-0">
            <Sparkles className="w-10 h-10" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-0.5 rounded-full inline-block mb-2 shadow-2xs">
              Todo en Orden · UTEC L418
            </span>
            <h3 className="text-xl font-black text-slate-900">
              El Aula L418 Presenta Condiciones Ideales para Estudiar
            </h3>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed">
              La calidad del aire (oxigenación), temperatura, silencio, iluminación y aforo se encuentran en sus niveles más saludables. Los estudiantes pueden concentrarse al máximo sin riesgos de fatiga ni pesadez.
            </p>
            <p className="text-xs text-emerald-800 font-medium mt-3 bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200 inline-block">
              💡 <strong>Sugerencia</strong>: Puedes probar situaciones de contingencia (como aumento de CO₂ o ruido exterior) seleccionando un escenario en la barra superior.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Selector de Alertas Activas si hay más de una */}
          {violations.length > 1 && (
            <div className="space-y-2.5">
              <div className="text-xs font-black uppercase tracking-wider text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Situaciones que Requieren Atención en el Aula ({violations.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {violations.map((v) => {
                  const isSelected = activeViolation?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => onSelectViolation(v.id)}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-200 shadow-md'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-2 text-xs font-bold text-rose-800">
                          <SensorIcon name={v.icon} className="w-4 h-4" />
                          {v.sensorShort}
                        </span>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                          {v.translatedStatus || v.status}
                        </span>
                      </div>
                      <div className="text-lg font-black text-slate-900 font-mono">
                        {v.value} {v.value !== 'Sin señal' ? v.unit : ''}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate font-medium">{v.variableLabel}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeViolation && (
            <div className="space-y-5">
              {/* Tarjeta de Resumen de la Situación con Fondo Sólido */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 border border-rose-800 flex flex-wrap items-center justify-between gap-5 shadow-lg">
                <div className="flex items-center gap-4">
                  <div
                    className="p-4 rounded-2xl text-white shrink-0 shadow-lg"
                    style={{ backgroundColor: activeViolation.color || '#e11d48' }}
                  >
                    <SensorIcon name={activeViolation.icon} className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 block">
                      Aviso de Confort · {activeViolation.sensorShort}
                    </span>
                    <h3 className="text-xl md:text-2xl font-black mt-1 text-white">
                      {activeViolation.diagnostic?.mainEvent || activeViolation.detail}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      {activeViolation.referenceNote}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-800/90 rounded-2xl px-4 py-2.5 border border-slate-700 text-right shadow-inner">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Medición Actual
                    </span>
                    <span className="text-xl font-black text-cyan-300 font-mono">
                      {activeViolation.value} {activeViolation.value !== 'Sin señal' ? activeViolation.unit : ''}
                    </span>
                  </div>
                  <div className="bg-rose-600 rounded-2xl px-4 py-2.5 border border-rose-400 text-right shadow-md">
                    <span className="text-[10px] text-rose-100 block uppercase font-bold">
                      Estado
                    </span>
                    <span className="text-sm font-black text-white">
                      {activeViolation.translatedStatus || activeViolation.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Bloques Claros y Humanos con Colores Vivos y Atractivos */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* 1. Causas en el Salón */}
                <div className="bg-amber-50 rounded-3xl border-2 border-amber-200 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-amber-200/80">
                      <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-black text-slate-900">
                        ¿Por qué sucede esto en el aula?
                      </h3>
                    </div>
                    <ul className="space-y-3 text-xs text-slate-700">
                      {activeViolation.diagnostic?.rootCauses?.map((cause, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 bg-white p-3 rounded-xl border border-amber-200 shadow-2xs"
                        >
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                          <span className="leading-relaxed font-medium">{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-5 pt-3 border-t border-amber-200/60 text-[11px] text-amber-800 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Condiciones cotidianas que provocan esta variación
                  </div>
                </div>

                {/* 2. Impacto en los Alumnos */}
                <div className="bg-rose-50 rounded-3xl border-2 border-rose-200 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-rose-200/80">
                      <div className="p-2 rounded-xl bg-rose-500 text-white shadow-xs">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-black text-slate-900">
                        ¿Cómo afecta a los estudiantes?
                      </h3>
                    </div>
                    <ul className="space-y-3 text-xs text-slate-700">
                      {activeViolation.diagnostic?.effects?.map((effect, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 bg-white p-3 rounded-xl border border-rose-200 shadow-2xs"
                        >
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                          <span className="leading-relaxed font-medium">{effect}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-5 pt-3 border-t border-rose-200/60 text-[11px] text-rose-800 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Efecto directo en atención, fatiga o comodidad
                  </div>
                </div>

                {/* 3. Acciones Recomendadas Inmediatas */}
                <div className="bg-indigo-50 rounded-3xl border-2 border-indigo-200 p-6 shadow-md flex flex-col justify-between ring-1 ring-indigo-300">
                  <div>
                    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-indigo-200/80">
                      <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-black text-indigo-950">
                        ¿Qué podemos hacer para mejorar el aula?
                      </h3>
                    </div>
                    <ol className="space-y-3 text-xs text-slate-700">
                      {activeViolation.diagnostic?.immediateRecommendation?.map((rec, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 bg-white p-3 rounded-xl border border-indigo-200 shadow-xs"
                        >
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed font-bold text-slate-800">
                            {rec}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="mt-5 pt-3 border-t border-indigo-200/60 text-[11px] text-indigo-800 font-extrabold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    Medidas prácticas que resuelven el aviso en pocos minutos
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
