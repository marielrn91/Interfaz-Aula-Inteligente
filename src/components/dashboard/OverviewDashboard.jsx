import React from 'react';
import { WifiOff, Settings } from 'lucide-react';
import RadialGauge from '../charts/RadialGauge';
import {
  DualTrendChart,
  MultiSensorBarChart,
  DarkTelemetryRow,
} from '../charts/TelemetryCharts';
import NodeStatusGrid from './NodeStatusGrid';
import TelemetryTable from './TelemetryTable';
import RawPacketInspector from './RawPacketInspector';

export default function OverviewDashboard({
  history,
  ultimos,
  rawMessages,
  lastId,
  evaluations,
  violations,
  nodeStatuses,
  gatewayOnline,
  gatewayBaseUrl,
  gatewayError,
  onOpenDiagnostic,
  onOpenGatewaySettings,
}) {
  const latest = history[history.length - 1] || {};
  const getEval = (key) => evaluations.find((e) => e.variableKey === key) || {};

  const co2Eval = getEval('co2_ppm');
  const tempEval = getEval('temp_c');

  return (
    <div className="space-y-5">
      {/* Aviso si aún no responde el Gateway en http://192.168.4.1 */}
      {!gatewayOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                Esperando datos reales del Gateway ({gatewayBaseUrl}/api/ultimos)
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Asegúrate de conectar el Wi-Fi de tu laptop a la red{' '}
                <strong>GEMELO-L419</strong> (contraseña: <code className="font-mono">gemelo2026</code>).
                La interfaz consulta <code className="font-mono">{gatewayBaseUrl}/api/ultimos</code> y{' '}
                <code className="font-mono">/api/datos?desde={lastId}</code> automáticamente cada 2
                segundos. {gatewayError ? `(${gatewayError})` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenGatewaySettings}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer shrink-0"
          >
            <Settings className="w-3.5 h-3.5" />
            Configurar IP del Gateway
          </button>
        </div>
      )}

      {/* Row 1: 7 ESP32 Nodes Status Cards (/api/ultimos real data) */}
      <NodeStatusGrid
        nodeStatuses={nodeStatuses}
        onSelectNode={(nodeId) => onOpenDiagnostic(nodeId)}
      />

      {/* Row 2: 2 Principal Radial Gauges (CO2 & Temp) + Central Telemetry Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3">
          <RadialGauge
            title="Nodo 1 · CO2 (co2_ppm)"
            subtitle={`Nivel: ${latest.nivel || '--'} · Δ30s: ${latest.delta_30s ?? '--'} ppm`}
            value={co2Eval.value}
            displayText={co2Eval.displayValue}
            unit={co2Eval.unit || 'ppm'}
            min={350}
            max={2000}
            nominalMin={co2Eval.min ?? 400}
            nominalMax={co2Eval.max ?? 1000}
            status={co2Eval.status || 'SIN DATOS'}
            severity={co2Eval.severity || 'nominal'}
            iconName="Wind"
            timestamp={latest.timestamp || 'Sin datos aún'}
            extraBadge={
              latest.calentando === 1
                ? '🔥 calentando = 1 (Precalentando 3 min)'
                : `anomalias: ${co2Eval.anomalias || 'SIN_DATOS'}`
            }
            onClick={() => onOpenDiagnostic('nodo-1-co2')}
          />
        </div>

        <div className="lg:col-span-3">
          <RadialGauge
            title="Nodo 7 · Ambiente (temp_c)"
            subtitle={`Humedad: ${latest.hum_pct ?? '--'}% · Presión: ${latest.pres_hpa ?? '--'} hPa`}
            value={tempEval.value}
            displayText={tempEval.displayValue}
            unit={tempEval.unit || '°C'}
            min={10}
            max={40}
            nominalMin={tempEval.min ?? 20}
            nominalMax={tempEval.max ?? 26}
            status={tempEval.status || 'SIN DATOS'}
            severity={tempEval.severity || 'nominal'}
            iconName="Thermometer"
            timestamp={latest.timestamp || 'Sin datos aún'}
            extraBadge={`anomalias: ${tempEval.anomalias || 'SIN_DATOS'}`}
            onClick={() => onOpenDiagnostic('nodo-7-ambiente')}
          />
        </div>

        <div className="lg:col-span-6">
          <TelemetryTable
            evaluations={evaluations}
            violationsCount={violations.length}
            onSelectEvaluation={(id) => onOpenDiagnostic(id)}
          />
        </div>
      </div>

      {/* Row 3: Historical Charts fed from /api/datos?desde=ID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DualTrendChart history={history} />
        <MultiSensorBarChart history={history} />
      </div>

      {/* Row 4: Dark Telemetry Row covering all 7 nodes */}
      <DarkTelemetryRow history={history} />

      {/* Row 5: Live JSON Packet Inspector (/api/ultimos & /api/datos?desde=ID) */}
      <RawPacketInspector ultimos={ultimos} rawMessages={rawMessages} lastId={lastId} />
    </div>
  );
}
