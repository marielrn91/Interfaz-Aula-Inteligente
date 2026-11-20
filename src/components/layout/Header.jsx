import React from 'react';
import {
  Play,
  Pause,
  Bell,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff,
  Sliders,
} from 'lucide-react';
import { SCENARIOS } from '../../data/nodesCatalog';

export default function Header({
  timestamp,
  connectionMode,
  onChangeConnectionMode,
  gatewayOnline,
  scenarioId,
  onScenarioChange,
  isPlaying,
  onTogglePlay,
  onSyncClock,
  clockSyncStatus,
  violations,
  onOpenDiagnostic,
}) {
  return (
    <header className="min-h-16 py-2 bg-slate-900 text-white px-4 md:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <div>
          <h1 className="text-sm md:text-base font-bold truncate">
            Gemelo Digital Aula L418 — Monitoreo y Diagnóstico Ambiental
          </h1>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Red: GEMELO-L419</span>
            <span>·</span>
            <span className="font-medium text-cyan-300">
              {connectionMode === 'simulator'
                ? 'Simulador de Datos Integrado'
                : 'Recepción Wi-Fi en Vivo (ESP32)'}
            </span>
            <span>·</span>
            <span className="text-slate-400">7 Nodos Sensores</span>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
          <Clock className="w-3 h-3" />
          {timestamp}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Selector de sólo 2 Modos: Simulación de Datos o Conexión Wi-Fi */}
        <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5 text-xs">
          {gatewayOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400 ml-2 mr-1 hidden sm:inline" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-amber-400 ml-2 mr-1 hidden sm:inline" />
          )}
          <select
            value={connectionMode}
            onChange={(e) => onChangeConnectionMode(e.target.value)}
            className="bg-transparent text-slate-100 text-xs font-semibold px-2 py-1 rounded focus:outline-none cursor-pointer"
            title="Seleccionar función: Simulación de Datos o Recepción Wi-Fi"
          >
            <option value="simulator" className="bg-slate-900">
              Modo: Simulación de Datos
            </option>
            <option value="hardware" className="bg-slate-900">
              Modo: Conexión Wi-Fi en Vivo
            </option>
          </select>
        </div>

        {/* Selector de escenario cuando se está en modo simulación */}
        {connectionMode === 'simulator' && (
          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5 text-xs">
            <Sliders className="w-3.5 h-3.5 text-indigo-400 ml-2 mr-1 hidden md:inline" />
            <select
              value={scenarioId}
              onChange={(e) => onScenarioChange(e.target.value)}
              className="bg-transparent text-slate-100 text-xs font-medium px-2 py-1 rounded focus:outline-none cursor-pointer"
              title="Seleccionar escenario de prueba"
            >
              {SCENARIOS.map((sc) => (
                <option key={sc.id} value={sc.id} className="bg-slate-900">
                  Escenario: {sc.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sincronizar Reloj del Sistema */}
        {connectionMode === 'hardware' && (
          <button
            onClick={onSyncClock}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
            title="Sincronizar reloj del sistema con el dispositivo Gateway"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">
              {clockSyncStatus?.includes('Hora OK') ? 'Reloj Sincronizado' : 'Sincronizar Reloj'}
            </span>
          </button>
        )}

        {/* Pausar / Reanudar actualización */}
        <button
          onClick={onTogglePlay}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
            isPlaying
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          title="Actualización automática de datos cada 2 segundos"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{isPlaying ? 'En vivo (2s)' : 'Pausado'}</span>
        </button>

        {/* Indicador de alertas */}
        <button
          onClick={() => onOpenDiagnostic(violations[0]?.id || null)}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            violations.length > 0
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/40 animate-pulse'
              : 'bg-slate-800 text-emerald-400 border border-slate-700 hover:bg-slate-700'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>
            {violations.length > 0
              ? `${violations.length} Alerta${violations.length > 1 ? 's' : ''}`
              : 'Óptimo'}
          </span>
        </button>
      </div>
    </header>
  );
}
