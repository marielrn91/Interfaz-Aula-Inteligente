import React from 'react';
import {
  Radio,
  Wifi,
  Sliders,
  RefreshCw,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { SCENARIOS, NODES_CATALOG, GATEWAY_CONFIG } from '../../data/nodesCatalog';

export default function GatewayGuideView({
  connectionMode,
  onChangeConnectionMode,
  gatewayBaseUrl,
  onChangeGatewayBaseUrl,
  gatewayOnline,
  gatewayError,
  onSyncClock,
  clockSyncStatus,
  scenarioId,
  onScenarioChange,
  lastId,
}) {
  return (
    <div className="space-y-6">
      {/* Section 1: Gateway Connection & Endpoints Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-600" />
              Conexión al Gateway ESP32 (Red Wi-Fi: {GATEWAY_CONFIG.ssid})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configura la extracción de datos en tiempo real desde{' '}
              <code className="font-mono text-indigo-600">http://192.168.4.1</code>, desde{' '}
              <code className="font-mono text-indigo-600">python simulador_gateway.py</code> (
              <code className="font-mono">http://localhost:8000</code>), o usa el simulador integrado.
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
              ? 'Simulador Integrado Activo'
              : gatewayOnline
              ? `Conectado a ${gatewayBaseUrl}`
              : 'Sin respuesta HTTP (Respaldo Simulador Activo)'}
          </span>
        </div>

        {/* Mode Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => onChangeConnectionMode('hardware')}
            className={`text-left p-4 rounded-xl border transition-all ${
              connectionMode === 'hardware'
                ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold uppercase text-indigo-700">
                Modo 1 · Placas ESP32 Reales
              </span>
              <Wifi className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-sm font-bold text-slate-800 font-mono">
              http://192.168.4.1
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Conectar la laptop a la red Wi-Fi <strong>GEMELO-L419</strong> (contraseña:{' '}
              <code className="font-mono">gemelo2026</code>).
            </p>
          </button>

          <button
            onClick={() => onChangeConnectionMode('python')}
            className={`text-left p-4 rounded-xl border transition-all ${
              connectionMode === 'python'
                ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold uppercase text-emerald-700">
                Modo 2 · Simulador Python Local
              </span>
              <Terminal className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-sm font-bold text-slate-800 font-mono">
              http://localhost:8000
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ejecutar en terminal <code className="font-mono">python simulador_gateway.py</code> para
              probar sin tener las placas.
            </p>
          </button>

          <button
            onClick={() => onChangeConnectionMode('simulator')}
            className={`text-left p-4 rounded-xl border transition-all ${
              connectionMode === 'simulator'
                ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold uppercase text-cyan-700">
                Modo 3 · Simulador en Navegador
              </span>
              <Sliders className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-sm font-bold text-slate-800">
              Inyección Directa de Paquetes
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Genera exactamente la estructura JSON de <code className="font-mono">/api/ultimos</code> y{' '}
              <code className="font-mono">/api/datos</code> cada 2s.
            </p>
          </button>
        </div>

        {/* Custom URL & /api/hora sync bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <label className="text-xs font-semibold text-slate-600">URL del Gateway:</label>
            <input
              type="text"
              value={gatewayBaseUrl}
              onChange={(e) => onChangeGatewayBaseUrl(e.target.value)}
              className="text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="http://192.168.4.1"
            />
            <button
              onClick={onSyncClock}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Enviar Hora (/api/hora?epoch_ms=...)
            </button>
            {clockSyncStatus && (
              <span className="text-xs font-mono text-slate-500">{clockSyncStatus}</span>
            )}
          </div>
          {gatewayError && connectionMode !== 'simulator' && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
              Aviso HTTP: {gatewayError} (Mostrando datos de respaldo con el mismo formato JSON)
            </div>
          )}
        </div>

        {/* Endpoints documentation table from Step 4 */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800 text-slate-100">
                <th className="py-2 px-3 rounded-tl-lg font-semibold">Dirección (Endpoint)</th>
                <th className="py-2 px-3 font-semibold">Qué devuelve / Cómo lo usa la interfaz</th>
                <th className="py-2 px-3 rounded-tr-lg font-semibold">Frecuencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2 px-3 font-mono font-bold text-indigo-700">
                  {gatewayBaseUrl}/api/ultimos
                </td>
                <td className="py-2 px-3 text-slate-600">
                  El último mensaje de cada uno de los 7 nodos dentro de{' '}
                  <code className="font-mono">msg</code>, junto con <code className="font-mono">hace_s</code> y{' '}
                  <code className="font-mono">anomalias</code>.
                </td>
                <td className="py-2 px-3 font-semibold text-emerald-700">Cada 2 segundos</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-bold text-indigo-700">
                  {gatewayBaseUrl}/api/datos?desde={lastId}
                </td>
                <td className="py-2 px-3 text-slate-600">
                  Todos los mensajes guardados, uno por línea (NDJSON). Se cambia el 0 por el último{' '}
                  <code className="font-mono">id</code> recibido (<code className="font-mono">#{lastId}</code>)
                  para pedir solo los nuevos.
                </td>
                <td className="py-2 px-3 font-semibold text-emerald-700">Incremental (2s)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-bold text-indigo-700">
                  {gatewayBaseUrl}/api/hora?epoch_ms=HORA
                </td>
                <td className="py-2 px-3 text-slate-600">
                  Le da la hora actual de la laptop en milisegundos (<code className="font-mono">Date.now()</code>)
                  al gateway para que <code className="font-mono">ts</code> no venga <code className="font-mono">null</code>.
                </td>
                <td className="py-2 px-3 font-semibold text-indigo-700">Al abrir / Manual</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Interactive Scenario Simulator */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            Simulador de Escenarios y Anomalías (Formato paquetes.h)
          </h3>
          <p className="text-xs text-slate-500">
            Prueba cómo responde la interfaz ante cada anomalía oficial de los 7 nodos (
            <code className="font-mono">CO2_CRITICO</code>, <code className="font-mono">GAS_DETECTADO</code>,{' '}
            <code className="font-mono">ILUMINACION_BAJA</code>,{' '}
            <code className="font-mono">PUERTA_ABIERTA_PROLONGADA</code>,{' '}
            <code className="font-mono">FALLO_SENSOR</code> con valores <code className="font-mono">null</code> y{' '}
            <code className="font-mono">hace_s &gt; 60</code>).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {SCENARIOS.map((sc) => {
            const active = scenarioId === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  if (connectionMode !== 'simulator') {
                    onChangeConnectionMode('simulator');
                  }
                  onScenarioChange(sc.id);
                }}
                className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  active && connectionMode === 'simulator'
                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <span
                    className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-1.5 ${
                      sc.id === 'nominal'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {sc.badge}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800">{sc.label}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">{sc.description}</p>
                </div>
                <div className="mt-3 text-[11px] font-semibold text-indigo-600">
                  {active && connectionMode === 'simulator'
                    ? '✓ Escenario Activo'
                    : 'Inyectar paquetes →'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 3: Quick Hardware Setup & Troubleshooting from Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600" />
            Configuración en Arduino IDE para los Nodos y Gateway
          </h3>
          <p className="text-xs text-slate-600">
            En <code className="font-mono font-bold">gateway_ap/gateway_ap.ino</code> junto con{' '}
            <code className="font-mono font-bold">paquetes.h</code>, abrir el Monitor Serie (115200) para
            obtener la MAC STA y configurarla en cada nodo:
          </p>
          <pre className="bg-slate-900 text-cyan-300 p-3 rounded-lg text-[11px] font-mono overflow-x-auto">
{`const char* SSID_ROUTER = "GEMELO-L419";
uint8_t MAC_GATEWAY[6] = {0x58, 0x2A, 0xBD, 0x72, 0x03, 0xDC};`}
          </pre>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="py-1.5 px-2 font-semibold">Nodo</th>
                  <th className="py-1.5 px-2 font-semibold">Tipo</th>
                  <th className="py-1.5 px-2 font-semibold">Archivo Arduino</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {NODES_CATALOG.map((n) => (
                  <tr key={n.nodo}>
                    <td className="py-1.5 px-2 font-bold">Nodo {n.nodo}</td>
                    <td className="py-1.5 px-2 font-mono text-indigo-600">{n.tipo}</td>
                    <td className="py-1.5 px-2 font-mono">{n.inoFile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            Solución de Problemas Comunes (Guía L419)
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <strong className="text-slate-800 block">
                1. No aparece la red GEMELO-L419
              </strong>
              <span className="text-slate-600">
                Revisar que el gateway esté encendido y con el programa{' '}
                <code className="font-mono">gateway_ap.ino</code> cargado.
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <strong className="text-slate-800 block">
                2. La página http://192.168.4.1 no abre
              </strong>
              <span className="text-slate-600">
                Revisar que la laptop esté conectada a <code className="font-mono">GEMELO-L419</code> (clave:{' '}
                <code className="font-mono">gemelo2026</code>) y escribir <code className="font-mono">http://</code>{' '}
                (no <code className="font-mono">https://</code>).
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <strong className="text-slate-800 block">
                3. Un sensor no aparece o hace_s &gt; 60
              </strong>
              <span className="text-slate-600">
                Revisar en ese sensor <code className="font-mono">SSID_ROUTER = &quot;GEMELO-L419&quot;</code> y{' '}
                <code className="font-mono">MAC_GATEWAY</code>. En el Monitor Serie el último número debe
                ser <code className="font-mono">1</code>.
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <strong className="text-slate-800 block">
                4. &quot;ts&quot; viene null
              </strong>
              <span className="text-slate-600">
                La interfaz llama automáticamente a <code className="font-mono">/api/hora?epoch_ms=...</code>{' '}
                al iniciar, o puedes pulsar el botón &quot;Sincronizar /api/hora&quot; en la barra superior.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
