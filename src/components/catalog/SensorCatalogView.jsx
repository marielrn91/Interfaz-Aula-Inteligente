import React from 'react';
import { ExternalLink, Cpu, MapPin, FileCode2, AlertCircle } from 'lucide-react';
import { NODES_CATALOG } from '../../data/nodesCatalog';
import SensorIcon from '../common/SensorIcon';

export default function SensorCatalogView({ violations }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-600" />
          Catálogo de los 7 Nodos ESP32 y Esquema de Paquetes (paquetes.h)
        </h2>
        <p className="text-xs text-slate-500">
          Especificación de cada nodo sensor conectado a la red{' '}
          <code className="font-mono font-bold text-slate-700">GEMELO-L419</code>: archivo Arduino (
          <code className="font-mono">.ino</code>), campos JSON en <code className="font-mono">msg</code> y
          anomalías posibles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {NODES_CATALOG.map((sensor) => {
          const hasViolation = violations.some((v) => v.sensorId === sensor.id);
          const allFields = [
            sensor.primaryField,
            ...sensor.secondaryFields.map((s) => s.key),
          ].filter((v, i, a) => a.indexOf(v) === i);

          return (
            <div
              key={sensor.id}
              className={`bg-white rounded-xl border p-5 shadow-sm flex flex-col justify-between transition-all ${
                hasViolation ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2.5 rounded-xl text-white shadow-sm"
                      style={{ backgroundColor: sensor.color }}
                    >
                      <SensorIcon name={sensor.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-cyan-300">
                          Nodo {sensor.nodo} · tipo: &quot;{sensor.tipo}&quot;
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          SKU: {sensor.sku}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 leading-snug mt-1">
                        {sensor.name}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Arduino file & MAC info */}
                <div className="mt-3 flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 text-xs">
                  <span className="flex items-center gap-1.5 font-mono text-indigo-700 font-semibold">
                    <FileCode2 className="w-3.5 h-3.5" />
                    {sensor.inoFile}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    MAC: {sensor.mac}
                  </span>
                </div>

                {/* Campos principales en msg */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Datos Principales en msg (JSON)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {allFields.map((field) => (
                      <code
                        key={field}
                        className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100"
                      >
                        {field}
                      </code>
                    ))}
                  </div>
                </div>

                {/* Anomalías posibles */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                    Anomalías Posibles
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {sensor.possibleAnomalies.map((anom) => (
                      <span
                        key={anom}
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200"
                      >
                        {anom}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Cantidad en Kit</span>
                    <strong className="text-slate-800">
                      0{sensor.quantity} {sensor.quantity === 1 ? 'unidad' : 'unidades'}
                    </strong>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Protocolo / Radio</span>
                    <strong className="text-slate-800">{sensor.protocol}</strong>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{sensor.location}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={sensor.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Ver componente en Naylamp
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[10px] font-mono text-slate-400">
                  SSID_ROUTER = &quot;GEMELO-L419&quot;
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
