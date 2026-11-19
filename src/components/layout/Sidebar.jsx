import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Cpu,
  Radio,
  School,
  Wifi,
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
    { id: 'overview', label: 'Monitor General', icon: LayoutDashboard },
    {
      id: 'diagnostic',
      label: 'Diagnóstico y Anomalías',
      icon: ShieldAlert,
      badge: violationsCount > 0 ? violationsCount : null,
    },
    { id: 'gateway', label: 'Gateway & Simulador', icon: Radio },
    { id: 'catalog', label: 'Catálogo de 7 Nodos', icon: Cpu },
  ];

  return (
    <aside className="w-16 md:w-64 bg-slate-950 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800">
      <div>
        <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-extrabold text-white tracking-tight">
              Gemelo <span className="text-cyan-400">L419</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Red: {GATEWAY_CONFIG.ssid} · 7 Nodos ESP32
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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
        {/* Gateway Wi-Fi AP info */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Fuente de Datos
            </span>
            <Wifi
              className={`w-3.5 h-3.5 ${
                gatewayOnline ? 'text-cyan-400' : 'text-amber-400'
              }`}
            />
          </div>
          <div className="mt-1 text-xs font-bold text-white truncate">
            {connectionMode === 'hardware'
              ? 'Gateway ESP32 (192.168.4.1)'
              : connectionMode === 'python'
              ? 'Simulador Python (:8000)'
              : 'Simulador Integrado JS'}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-400">
            Polling: /api/ultimos cada 2s
          </div>
        </div>

        {/* Estado Global */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Estado Global del Aula L419
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            {violationsCount === 0 ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">
                  NOMINAL ({onlineNodesCount}/{totalNodesCount} Nodos)
                </span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-bold text-red-400">
                  {violationsCount}{' '}
                  {violationsCount === 1 ? 'ANOMALÍA ACTIVA' : 'ANOMALÍAS ACTIVAS'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
