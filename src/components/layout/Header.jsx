import React from 'react';
import {
  Play,
  Pause,
  Bell,
  Wifi,
  WifiOff,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { SCENARIOS } from '../../data/nodesCatalog';
import utecLogo from '../../assets/utec-logo.jpg';

export default function Header({
  connectionMode,
  onChangeConnectionMode,
  gatewayOnline,
  scenarioId,
  onScenarioChange,
  isPlaying,
  onTogglePlay,
  violations,
  onOpenDiagnostic,
}) {
  return (
    <header className="min-h-16 py-2.5 bg-slate-900 text-white px-4 md:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shadow-md sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-white p-1 shadow-md flex items-center justify-center shrink-0 border border-slate-700/80 md:hidden">
          <img
            src={utecLogo}
            alt="UTEC Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-extrabold truncate text-white tracking-tight flex items-center gap-1.5">
              <span>UTEC</span>
              <span className="text-cyan-400 font-semibold">— Aula Pensante L418</span>
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs">
              Bienestar &amp; Confort
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Campus Barranco</span>
            <span>·</span>
            <span className="font-semibold text-cyan-300">
              {connectionMode === 'simulator'
                ? 'Simulador de Datos'
                : 'Conexión Wi-Fi en Vivo'}
            </span>
            <span>·</span>
            <span className="text-slate-400">Supervisión Continua</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Selector de Modo: Simulación o Wi-Fi con estilo moderno y colorido */}
        <div className="flex items-center bg-slate-800/90 rounded-xl border border-slate-700 p-0.5 text-xs shadow-inner">
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
            <option value="simulator" className="bg-slate-900 text-white">
              Modo: Simulación de Datos
            </option>
            <option value="hardware" className="bg-slate-900 text-white">
              Modo: Conexión Wi-Fi en Vivo
            </option>
          </select>
        </div>

        {/* Selector de escenario cuando se está en modo simulación */}
        {connectionMode === 'simulator' && (
          <div className="flex items-center bg-slate-800/90 rounded-xl border border-indigo-500/50 p-0.5 text-xs shadow-inner">
            <Sliders className="w-3.5 h-3.5 text-indigo-400 ml-2 mr-1 hidden md:inline" />
            <select
              value={scenarioId}
              onChange={(e) => onScenarioChange(e.target.value)}
              className="bg-transparent text-slate-100 text-xs font-medium px-2 py-1 rounded focus:outline-none cursor-pointer"
              title="Seleccionar escenario para simular"
            >
              {SCENARIOS.map((sc) => (
                <option key={sc.id} value={sc.id} className="bg-slate-900 text-white">
                  Escenario: {sc.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pausar / Reanudar actualización con brillo cian */}
        <button
          onClick={onTogglePlay}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
            isPlaying
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25 shadow-xs shadow-cyan-950'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          title="Actualización automática de datos cada 2 segundos"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{isPlaying ? 'En vivo (2s)' : 'Pausado'}</span>
        </button>

        {/* Indicador de bienestar / alertas colorido */}
        <button
          onClick={() => onOpenDiagnostic(violations[0]?.id || null)}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-md ${
            violations.length > 0
              ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-950/60 animate-pulse'
              : 'bg-emerald-950 text-emerald-300 border border-emerald-700 hover:bg-emerald-900 shadow-emerald-950/40'
          }`}
        >
          {violations.length > 0 ? (
            <Bell className="w-3.5 h-3.5" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>
            {violations.length > 0
              ? `${violations.length} Aviso${violations.length > 1 ? 's' : ''}`
              : 'Ambiente Ideal'}
          </span>
        </button>
      </div>
    </header>
  );
}
