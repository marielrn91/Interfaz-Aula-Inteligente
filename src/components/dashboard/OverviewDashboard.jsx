import React from 'react';
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
  onOpenDiagnostic,
}) {
  const latest = history[history.length - 1] || {};
  const getEval = (key) => evaluations.find((e) => e.variableKey === key) || {};

  const co2Eval = getEval('co2_ppm');
  const tempEval = getEval('temp_c');

  return (
    <div className="space-y-5">
      {/* Row 1: 7 ESP32 Nodes Status Cards (/api/ultimos formatted) */}
      <NodeStatusGrid
        nodeStatuses={nodeStatuses}
        onSelectNode={(nodeId) => onOpenDiagnostic(nodeId)}
      />

      {/* Row 2: 2 Principal Radial Gauges (CO2 & Temp) + Central Telemetry Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3">
          <RadialGauge
            title="Nodo 1 · CO2 (co2_ppm)"
            subtitle={`Nivel: ${latest.nivel || 'NORMAL'} · Δ30s: ${latest.delta_30s ?? 0} ppm`}
            value={co2Eval.value}
            unit={co2Eval.unit || 'ppm'}
            min={350}
            max={2000}
            nominalMin={co2Eval.min ?? 400}
            nominalMax={co2Eval.max ?? 1000}
            status={co2Eval.status || 'NOMINAL'}
            severity={co2Eval.severity || 'nominal'}
            iconName="Wind"
            timestamp={latest.timestamp}
            extraBadge={
              latest.calentando === 1
                ? '🔥 calentando = 1 (Precalentando 3 min)'
                : `anomalias: ${co2Eval.anomalias || 'NINGUNA'}`
            }
            onClick={() => onOpenDiagnostic('nodo-1-co2')}
          />
        </div>

        <div className="lg:col-span-3">
          <RadialGauge
            title="Nodo 7 · Ambiente (temp_c)"
            subtitle={`Humedad: ${latest.hum_pct ?? '--'}% · Presión: ${latest.pres_hpa ?? '--'} hPa`}
            value={tempEval.value}
            unit={tempEval.unit || '°C'}
            min={10}
            max={40}
            nominalMin={tempEval.min ?? 20}
            nominalMax={tempEval.max ?? 26}
            status={tempEval.status || 'NOMINAL'}
            severity={tempEval.severity || 'nominal'}
            iconName="Thermometer"
            timestamp={latest.timestamp}
            extraBadge={`anomalias: ${tempEval.anomalias || 'NINGUNA'}`}
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
