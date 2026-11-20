import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import SensorIcon from '../common/SensorIcon';

export default function TelemetryTable({ evaluations, violationsCount, onSelectEvaluation }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Matriz de Parámetros y Estado por Variable
          </h3>
          <p className="text-xs text-slate-400">
            Monitoreo continuo de los estándares de confort ambiental y seguridad en el aula.
          </p>
        </div>
        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
            violationsCount === 0
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {violationsCount === 0 ? 'Todo Óptimo' : `${violationsCount} Alerta(s)`}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-800 text-slate-100">
              <th className="py-2 px-2.5 rounded-tl-lg font-semibold">Sensor</th>
              <th className="py-2 px-2.5 font-semibold">Variable Monitoreada</th>
              <th className="py-2 px-2.5 font-semibold">Medición Actual</th>
              <th className="py-2 px-2.5 font-semibold">Rango Recomendado</th>
              <th className="py-2 px-2.5 font-semibold">Última Lectura</th>
              <th className="py-2 px-2.5 rounded-tr-lg font-semibold text-right">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {evaluations.map((ev) => {
              const isBad = ev.severity !== 'nominal';
              return (
                <tr
                  key={ev.id}
                  onClick={() => onSelectEvaluation(ev.id)}
                  className={`cursor-pointer transition-colors ${
                    isBad ? 'bg-red-50/80 hover:bg-red-100/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-2 px-2.5 text-[11px] text-slate-700">
                    <span className="font-bold text-slate-900">Nodo {ev.nodo}</span> · {ev.sensorShort}
                  </td>
                  <td className="py-2 px-2.5 font-medium text-slate-800 flex items-center gap-2">
                    <SensorIcon
                      name={ev.icon}
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: ev.color }}
                    />
                    <span>{ev.variableLabel}</span>
                  </td>
                  <td className="py-2 px-2.5 font-mono font-bold text-slate-900">
                    {ev.displayValue} {ev.value !== null && ev.value !== 'Sin señal' ? ev.unit : ''}
                  </td>
                  <td className="py-2 px-2.5 text-slate-500">
                    {ev.min} – {ev.max} {ev.unit}
                  </td>
                  <td className="py-2 px-2.5 text-[11px]">
                    <span
                      className={
                        ev.isOffline ? 'text-red-600 font-bold' : 'text-slate-500'
                      }
                    >
                      {ev.isOffline ? 'Desconectado' : ev.hace_s !== null ? `Hace ${ev.hace_s}s` : '--'}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isBad
                          ? 'bg-red-600 text-white'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isBad ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      {ev.translatedStatus || ev.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
