import React from 'react';
import { ExternalLink, Cpu, MapPin } from 'lucide-react';
import { SENSORS_CATALOG } from '../data/sensorsCatalog';
import SensorIcon from './SensorIcon';

export default function SensorCatalogView({ violations }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-600" />
          Catálogo de Sensores del Aula Inteligente (Kit Completo)
        </h2>
        <p className="text-xs text-slate-500">
          Lista completa de módulos con SKU, cantidad en kit, protocolo de comunicación y enlace
          directo a Naylamp Mechatronics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {SENSORS_CATALOG.map((sensor, idx) => {
          const hasViolation = violations.some((v) => v.sensorId === sensor.id);
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
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Sensor #{idx + 1} · SKU: {sensor.sku}
                      </span>
                      <h3 className="text-sm font-bold text-slate-800 leading-snug">
                        {sensor.name}
                      </h3>
                    </div>
                  </div>
                </div>

                {sensor.replaces && (
                  <div className="mt-2.5 text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded-md px-2.5 py-1">
                    {sensor.replaces}
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Cantidad en Kit</span>
                    <strong className="text-slate-800">
                      0{sensor.quantity} {sensor.quantity === 1 ? 'unidad' : 'unidades'}
                    </strong>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Protocolo / Bus</span>
                    <strong className="text-slate-800">{sensor.protocol}</strong>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{sensor.location}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center justify-between w-full gap-2">
                  <a
                    href={sensor.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Ver en Naylamp
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {sensor.categoryLink && (
                    <a
                      href={sensor.categoryLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-slate-400 hover:text-slate-600 hover:underline"
                    >
                      Categoría general
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
