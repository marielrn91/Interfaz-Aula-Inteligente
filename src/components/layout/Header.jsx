import React from 'react';
import {
  Play,
  Pause,
  Bell,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';

export default function Header({
  timestamp,
  lastId,
  gatewayBaseUrl,
  gatewayOnline,
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
            Gemelo Digital L419 — Telemetría Real de Sensores (Gateway ESP32)
          </h1>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Red: GEMELO-L419</span>
            <span>·</span>
            <span className="font-mono text-cyan-300">{gatewayBaseUrl}</span>
            <span>·</span>
            <span>Último id: #{lastId}</span>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
          <Clock className="w-3 h-3" />
          {timestamp}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Estado de conexión al Gateway Real */}
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border ${
            gatewayOnline
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
          }`}
        >
          {gatewayOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>{gatewayOnline ? 'Gateway Conectado' : 'Esperando Gateway...'}</span>
        </span>

        {/* Sync Gateway Clock (/api/hora?epoch_ms=...) */}
        <button
          onClick={onSyncClock}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
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
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
            isPlaying
              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          title="Lectura automática de /api/ultimos y /api/datos cada 2 segundos"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{isPlaying ? 'Leyendo (2s)' : 'Pausado'}</span>
        </button>

        {/* Alert indicator pill */}
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
              ? `${violations.length} Anomalía${violations.length > 1 ? 's' : ''}`
              : 'Sin Alertas'}
          </span>
        </button>
      </div>
    </header>
  );
}
