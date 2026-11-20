import React from 'react';
import {
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Wifi,
  Info,
} from 'lucide-react';
import { GATEWAY_CONFIG, SCENARIOS } from '../../data/nodesCatalog';

export default function GatewayGuideView({
  connectionMode,
  onChangeConnectionMode,
  gatewayOnline,
  gatewayError,
  onSyncClock,
  clockSyncStatus,
  scenarioId,
  onScenarioChange,
}) {
  return (
    <div className="space-y-6">
      {/* Sección 1: Selección entre las 2 funciones del sistema */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-600" />
              Funciones del Sistema: Simulación de Datos y Recepción Wi-Fi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecciona si deseas interactuar con el simulador interactivo o recibir las lecturas en vivo transmitidas por los sensores a través de la red Wi-Fi del aula.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
              gatewayOnline
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {gatewayOnline ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            {connectionMode === 'simulator'
              ? 'Simulación de Datos Activa'
              : gatewayOnline
              ? 'Conectado a la Red Wi-Fi'
              : 'Esperando conexión Wi-Fi'}
          </span>
        </div>

        {/* Las 2 únicas tarjetas de modo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Función 1: Simulación de datos */}
          <button
            onClick={() => onChangeConnectionMode('simulator')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
              connectionMode === 'simulator'
                ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-200'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                1. Simulación de Datos
              </span>
              {connectionMode === 'simulator' && (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
                  EN USO
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Permite simular el comportamiento de todos los sensores del aula (calidad de aire, sonido, aforo, clima, iluminación y acceso). Ideal para demostraciones y evaluación de alertas de contingencia sin necesidad de hardware.
            </p>
          </button>

          {/* Función 2: Conexión Wi-Fi */}
          <button
            onClick={() => onChangeConnectionMode('hardware')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
              connectionMode === 'hardware'
                ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-200'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-indigo-600" />
                2. Recepción de Datos por Wi-Fi
              </span>
              {connectionMode === 'hardware' && (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
                  EN USO
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Recibe lecturas reales transmitidas por los sensores físicos del aula a través del punto de acceso Wi-Fi <strong>{GATEWAY_CONFIG.ssid}</strong>.
            </p>
          </button>
        </div>

        {/* Panel explicativo para la conexión Wi-Fi */}
        {connectionMode === 'hardware' && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 mt-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-600" />
              Pasos para Recibir Datos por Wi-Fi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-indigo-600 block mb-1">Paso 1: Conexión Wi-Fi</span>
                Conecta tu laptop o dispositivo a la red Wi-Fi: <strong>{GATEWAY_CONFIG.ssid}</strong> (Contraseña: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">{GATEWAY_CONFIG.password}</span>).
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-indigo-600 block mb-1">Paso 2: Enlace Automático</span>
                La interfaz se comunicará automáticamente con el receptor del aula en <span className="font-mono text-slate-700">http://192.168.4.1</span>.
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-indigo-600 block mb-1">Paso 3: Sincronización</span>
                  Alinea el reloj del sistema para registrar las marcas de tiempo precisas.
                </div>
                <button
                  onClick={onSyncClock}
                  className="mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer w-full"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sincronizar Reloj
                </button>
                {clockSyncStatus && (
                  <span className="text-[10px] text-slate-500 text-center block mt-1">
                    {clockSyncStatus.includes('Hora OK') ? '✓ Reloj alineado' : clockSyncStatus}
                  </span>
                )}
              </div>
            </div>
            {gatewayError && (
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Estado de conexión: Asegúrate de estar conectado a la red Wi-Fi <strong>{GATEWAY_CONFIG.ssid}</strong>.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección 2: Simulador de Escenarios y Anomalías */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            Simulador de Escenarios del Aula
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Selecciona cualquiera de los escenarios para observar cómo reacciona la interfaz y qué recomendaciones preventivas se generan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {SCENARIOS.map((sc) => {
            const active = scenarioId === sc.id && connectionMode === 'simulator';
            return (
              <div
                key={sc.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  active
                    ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-200 shadow-sm'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div>
                  <span
                    className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-2 ${
                      sc.id === 'nominal'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {sc.badge}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug">{sc.label}</h4>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                    {sc.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (connectionMode !== 'simulator') {
                      onChangeConnectionMode('simulator');
                    }
                    onScenarioChange(sc.id);
                  }}
                  className={`mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  {active ? '✓ Escenario Activo' : 'Simular escenario de anomalía'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
