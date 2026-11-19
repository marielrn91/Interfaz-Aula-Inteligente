import React from 'react';
import {
  Play,
  Pause,
  Bell,
  Clock,
  RefreshCw,
  Wifi,
} from 'lucide-react';
import { SCENARIOS } from '../../data/nodesCatalog';

export default function Header({
  timestamp,
  lastId,
  connectionMode,
  onChangeConnectionMode,
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
            Gemelo Digital L419 — Monitor Gateway ESP32 & Diagnóstico Causal
          </h1>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>SSID: GEMELO-L419</span>
            <span>·</span>
            <span>Último msg id: #{lastId}</span>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
          <Clock className="w-3 h-3" />
          {timestamp}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Source mode selector: Hardware Gateway / Python Localhost / Integrated Simulator */}
        <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5 text-xs">
          <Wifi className="w-3.5 h-3.5 text-cyan-400 ml-2 mr-1 hidden sm:inline" />
          <select
            value={connectionMode}
            onChange={(e) => onChangeConnectionMode(e.target.value)}
            className="bg-transparent text-slate-100 text-xs font-semibold px-2 py-1 rounded focus:outline-none cursor-pointer"
            title="Seleccionar origen de datos del Gateway"
          >
            <option value="simulator" className="bg-slate-900">
              Simulador Integrado (Paquetes JSON)
            </option>
            <option value="hardware" className="bg-slate-900">
              Gateway Real (http://192.168.4.1)
            </option>
            <option value="python" className="bg-slate-900">
              Simulador Python (http://localhost:8000)
            </option>
          </select>
        </div>

        {/* Scenario switcher when in integrated simulator mode */}
        {connectionMode === 'simulator' && (
          <select
            value={scenarioId}
            onChange={(e) => onScenarioChange(e.target.value)}
            className="hidden lg:block bg-slate-800 text-slate-100 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            title="Simular escenario de paquetes de los 7 nodos"
          >
            {SCENARIOS.map((sc) => (
              <option key={sc.id} value={sc.id}>
                Escenario: {sc.label}
              </option>
            ))}
          </select>
        )}

        {/* Sync Gateway Clock (/api/hora?epoch_ms=...) */}
        <button
          onClick={onSyncClock}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700 hover:bg-slate-700 transition-colors"
          title="Sincronizar hora del Gateway: GET /api/hora?epoch_ms=Date.now()"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">
            {clockSyncStatus || 'Sincronizar /api/hora'}
          </span>
        </button>

        {/* Play / Pause 2-second polling */}
        <button
          onClick={onTogglePlay}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
            isPlaying
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          title="Lectura automática cada 2 segundos"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{isPlaying ? 'Polling 2s' : 'Pausado'}</span>
        </button>

        {/* Alert indicator pill */}
        <button
          onClick={() => onOpenDiagnostic(violations[0]?.id || null)}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
            violations.length > 0
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/40 animate-pulse'
              : 'bg-slate-800 text-emerald-400 border border-slate-700 hover:bg-slate-700'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>
            {violations.length > 0
              ? `${violations.length} Anomalía${violations.length > 1 ? 's' : ''}`
              : 'Nominal'}
          </span>
        </button>
      </div>
    </header>
  );
}
