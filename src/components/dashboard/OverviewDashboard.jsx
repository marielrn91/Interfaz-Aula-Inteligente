import React from 'react';
import { WifiOff, Settings, PlayCircle } from 'lucide-react';
import RadialGauge from '../charts/RadialGauge';
import {
  DualTrendChart,
  MultiSensorBarChart,
  DarkTelemetryRow,
} from '../charts/TelemetryCharts';
import NodeStatusGrid from './NodeStatusGrid';
import TelemetryTable from './TelemetryTable';

export default function OverviewDashboard({
  history,
  evaluations,
  violations,
  nodeStatuses,
  connectionMode,
  onSwitchToSimulator,
  gatewayOnline,
  onOpenDiagnostic,
  onOpenGatewaySettings,
}) {
  const latest = history[history.length - 1] || {};
  const getEval = (key) => evaluations.find((e) => e.variableKey === key) || {};

  const co2Eval = getEval('co2_ppm');
  const tempEval = getEval('temp_c');

  const co2LevelLabel =
    latest.co2_ppm >= 1500
      ? 'Crítico (Ventilar urgente)'
      : latest.co2_ppm >= 1000
      ? 'Alerta (Abrir ventanas)'
      : 'Calidad de aire óptima';

  const tempLevelLabel =
    latest.temp_c > 26
      ? 'Temperatura elevada'
      : latest.temp_c < 20
      ? 'Ambiente frío'
      : 'Confort térmico ideal';

  return (
    <div className="space-y-5">
      {/* Banner de aviso si está en modo Wi-Fi y esperando conexión */}
      {connectionMode !== 'simulator' && !gatewayOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                Esperando datos desde el Gateway Wi-Fi
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Asegúrate de que tu computadora esté conectada a la red Wi-Fi <strong>GEMELO-L419</strong>. También puedes cambiar a la función de <strong>Simulación de Datos</strong> para probar todas las funciones de inmediato.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onSwitchToSimulator}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              Activar Simulación de Datos
            </button>
            <button
              onClick={onOpenGatewaySettings}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              Guía de Conexión
            </button>
          </div>
        </div>
      )}

      {/* Fila 1: Tarjetas de los 7 Sensores del Aula */}
      <NodeStatusGrid
        nodeStatuses={nodeStatuses}
        onSelectNode={(nodeId) => onOpenDiagnostic(nodeId)}
      />

      {/* Fila 2: 2 Indicadores Radiales Principales (CO2 y Temperatura) + Matriz de Parámetros */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3">
          <RadialGauge
            title="Nodo 1 · Calidad del Aire (CO₂)"
            subtitle={co2LevelLabel}
            value={co2Eval.value}
            displayText={co2Eval.displayValue}
            unit={co2Eval.unit || 'ppm'}
            min={350}
            max={2000}
            nominalMin={co2Eval.min ?? 400}
            nominalMax={co2Eval.max ?? 1000}
            status={co2Eval.status || 'En espera'}
            severity={co2Eval.severity || 'nominal'}
            iconName="Wind"
            timestamp={latest.timestamp || 'En espera'}
            extraBadge={
              latest.calentando === 1
                ? 'Sensor en estabilización inicial'
                : co2Eval.severity === 'nominal'
                ? 'Nivel de Aire Saludable'
                : 'Alerta de Ventilación Requerida'
            }
            onClick={() => onOpenDiagnostic('nodo-1-co2')}
          />
        </div>

        <div className="lg:col-span-3">
          <RadialGauge
            title="Nodo 7 · Clima Ambiental"
            subtitle={tempLevelLabel}
            value={tempEval.value}
            displayText={tempEval.displayValue}
            unit={tempEval.unit || '°C'}
            min={10}
            max={40}
            nominalMin={tempEval.min ?? 20}
            nominalMax={tempEval.max ?? 26}
            status={tempEval.status || 'En espera'}
            severity={tempEval.severity || 'nominal'}
            iconName="Thermometer"
            timestamp={latest.timestamp || 'En espera'}
            extraBadge={
              tempEval.severity === 'nominal'
                ? 'Confort Térmico Adecuado'
                : 'Fuera de Rango de Confort'
            }
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

      {/* Fila 3: Gráficas de Tendencia Histórica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DualTrendChart history={history} />
        <MultiSensorBarChart history={history} />
      </div>

      {/* Fila 4: Monitoreo Integral de Todas las Variables del Aula */}
      <DarkTelemetryRow history={history} />
    </div>
  );
}
