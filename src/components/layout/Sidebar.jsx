import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Radio,
  School,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { GATEWAY_CONFIG } from '../../data/nodesCatalog';

export default function Sidebar({
  activeTab,
  onSelectTab,
  violationsCount,
  onlineNodesCount,
  totalNodesCount,
  connectionMode,
  gatewayOnline,
}) {
  const navItems = [
    { id: 'overview', label: 'Monitor del Aula', icon: LayoutDashboard },
    {
      id: 'diagnostic',
      label: 'Diagnóstico y Recomendaciones',
      icon: ShieldAlert,
      badge: violationsCount > 0 ? violationsCount : null,
    },
    { id: 'gateway', label: 'Simulador y Conexión Wi-Fi', icon: Radio },
  ];

  const sourceLabel =
    connectionMode === 'hardware'
      ? 'Red Wi-Fi (ESP32)'
      : 'Simulador de Datos';

  return (
    <aside className="w-16 md:w-64 bg-slate-950 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800">
      <div>
        <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-extrabold text-white tracking-tight">
              Aula Pensante <span className="text-cyan-400">L418</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Red: {GATEWAY_CONFIG.ssid} · 7 Nodos Sensores
            </div>
          </div>
        </div>

        <nav className="p-2.5 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden md:inline">{item.label}</span>
                </span>
                {item.badge && (
                  <span className="hidden md:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-red-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-800/80 hidden md:block space-y-2.5">
        {/* Fuente de Telemetría */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Modo de Operación
            </span>
            {gatewayOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            )}
          </div>
          <div className="mt-1 text-xs font-bold text-white truncate">
            {sourceLabel}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-400">
            Actualización continua cada 2s
          </div>
        </div>

        {/* Estado Global */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Estado General del Aula
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            {onlineNodesCount === 0 ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-amber-300">
                  Esperando conexión...
                </span>
              </>
            ) : violationsCount === 0 ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">
                  ESTADO ÓPTIMO ({onlineNodesCount}/{totalNodesCount} Nodos)
                </span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-bold text-red-400">
                  {violationsCount}{' '}
                  {violationsCount === 1 ? 'ALERTA ACTIVA' : 'ALERTAS ACTIVAS'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
