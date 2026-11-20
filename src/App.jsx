import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GATEWAY_CONFIG } from './data/nodesCatalog';
import {
  createInitialGatewayHistory,
  generateNodeMessagesForScenario,
} from './data/simulator';
import {
  formatUltimosToSnapshot,
  mergeMessagesIntoSnapshots,
  evaluateGatewayState,
} from './utils/packetFormatter';
import {
  syncGatewayClock,
  fetchGatewayUltimos,
  fetchGatewayDatosDesde,
} from './services/gatewayApi';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AlertBanner from './components/layout/AlertBanner';
import OverviewDashboard from './components/dashboard/OverviewDashboard';
import DiagnosticView from './components/diagnostics/DiagnosticView';
import GatewayGuideView from './components/gateway/GatewayGuideView';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  // Dos únicas funciones: 'simulator' (simulación interactiva de datos) | 'hardware' (recepción Wi-Fi en vivo)
  const [connectionMode, setConnectionMode] = useState('simulator');
  const [gatewayOnline, setGatewayOnline] = useState(true);
  const [gatewayError, setGatewayError] = useState(null);
  const [clockSyncStatus, setClockSyncStatus] = useState(() => `Hora OK (${Date.now()})`);

  const [scenarioId, setScenarioId] = useState('nominal');
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedViolationId, setSelectedViolationId] = useState(null);

  const initialData = useMemo(() => createInitialGatewayHistory('nominal', 16), []);
  const [history, setHistory] = useState(initialData.snapshots);
  const [ultimos, setUltimos] = useState(initialData.ultimos);
  const lastIdRef = useRef(initialData.lastId);

  // Sincronización del reloj con el Gateway Wi-Fi
  const handleSyncClock = useCallback(
    async (mode = connectionMode) => {
      const epochMs = Date.now();
      if (mode === 'simulator') {
        setClockSyncStatus(`Hora OK (${epochMs})`);
        setGatewayOnline(true);
        return;
      }
      setClockSyncStatus('Sincronizando...');
      const res = await syncGatewayClock(GATEWAY_CONFIG.defaultGatewayUrl);
      if (res.ok) {
        setClockSyncStatus(`Hora OK (${res.epoch_ms})`);
        setGatewayOnline(true);
        setGatewayError(null);
      } else {
        setClockSyncStatus('Sin respuesta Wi-Fi');
      }
    },
    [connectionMode]
  );

  // Cambio entre las dos funciones: Simulación de datos o Recepción Wi-Fi
  const handleChangeConnectionMode = (newMode) => {
    setConnectionMode(newMode);
    setGatewayError(null);
    if (newMode === 'hardware') {
      lastIdRef.current = 0;
      setHistory([]);
      setUltimos([]);
      setGatewayOnline(false);
      handleSyncClock('hardware');
    } else {
      const seeded = createInitialGatewayHistory(scenarioId, 16);
      setHistory(seeded.snapshots);
      setUltimos(seeded.ultimos);
      lastIdRef.current = seeded.lastId;
      setGatewayOnline(true);
      setClockSyncStatus(`Hora OK (${Date.now()})`);
    }
  };

  // Cambio de escenario en el simulador de datos
  const handleScenarioChange = (newScenarioId) => {
    setScenarioId(newScenarioId);
    const seeded = createInitialGatewayHistory(newScenarioId, 16);
    setHistory(seeded.snapshots);
    setUltimos(seeded.ultimos);
    lastIdRef.current = seeded.lastId;
  };

  // Verificación inicial de conexión Wi-Fi al cargar
  useEffect(() => {
    syncGatewayClock(GATEWAY_CONFIG.defaultGatewayUrl).then((res) => {
      if (res.ok) {
        setClockSyncStatus(`Hora OK (${res.epoch_ms})`);
      }
    });
  }, []);

  // Ciclo de lectura cada 2 segundos
  useEffect(() => {
    if (!isPlaying) return;

    let isMounted = true;

    const pollGateway = async () => {
      if (connectionMode === 'simulator') {
        const { ultimos: nextUltimos } =
          generateNodeMessagesForScenario(scenarioId, Date.now());
        if (!isMounted) return;
        const snap = formatUltimosToSnapshot(nextUltimos);
        setUltimos(nextUltimos);
        setHistory((prev) => [...prev.slice(-19), snap]);
        if (snap.maxMsgId > lastIdRef.current) {
          lastIdRef.current = snap.maxMsgId;
        }
        setGatewayOnline(true);
        setGatewayError(null);
        return;
      }

      // Modo Conexión Wi-Fi
      try {
        const [fetchedUltimos, fetchedDatos] = await Promise.all([
          fetchGatewayUltimos(GATEWAY_CONFIG.defaultGatewayUrl),
          fetchGatewayDatosDesde(GATEWAY_CONFIG.defaultGatewayUrl, lastIdRef.current).catch(() => []),
        ]);

        if (!isMounted) return;

        if (Array.isArray(fetchedUltimos)) {
          const snap = formatUltimosToSnapshot(fetchedUltimos);
          setUltimos(fetchedUltimos);

          if (Array.isArray(fetchedDatos) && fetchedDatos.length > 0) {
            setHistory((prev) => mergeMessagesIntoSnapshots(prev, fetchedDatos, 20));
            const maxFromDatos = fetchedDatos.reduce(
              (acc, item) => Math.max(acc, item?.id || 0),
              lastIdRef.current
            );
            const nextId = Math.max(maxFromDatos, snap.maxMsgId);
            lastIdRef.current = nextId;
          } else if (fetchedUltimos.length > 0) {
            setHistory((prev) => [...prev.slice(-19), snap]);
            if (snap.maxMsgId > lastIdRef.current) {
              lastIdRef.current = snap.maxMsgId;
            }
          }

          setGatewayOnline(true);
          setGatewayError(null);
        }
      } catch (err) {
        if (!isMounted) return;
        setGatewayOnline(false);
        setGatewayError(
          `Esperando conexión con red Wi-Fi GEMELO-L419 (${err.message || 'sin respuesta'})`
        );
      }
    };

    pollGateway();
    const timer = setInterval(pollGateway, GATEWAY_CONFIG.pollIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [isPlaying, connectionMode, scenarioId]);

  const { evaluations, violations, nodeStatuses } = useMemo(
    () => evaluateGatewayState(history, ultimos),
    [history, ultimos]
  );

  const latest = history[history.length - 1] || {};
  const onlineNodesCount = nodeStatuses.filter(
    (n) => n.hasReceivedPacket && !n.isOffline
  ).length;

  const openDiagnosticForViolation = (idOrNodeId) => {
    setSelectedViolationId(idOrNodeId);
    setActiveTab('diagnostic');
  };

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      {/* Barra lateral de navegación */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        violationsCount={violations.length}
        onlineNodesCount={onlineNodesCount}
        totalNodesCount={nodeStatuses.length}
        connectionMode={connectionMode}
        gatewayOnline={gatewayOnline}
      />

      {/* Área Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra Superior */}
        <Header
          timestamp={latest.timestamp || 'En espera...'}
          connectionMode={connectionMode}
          onChangeConnectionMode={handleChangeConnectionMode}
          gatewayOnline={gatewayOnline}
          scenarioId={scenarioId}
          onScenarioChange={handleScenarioChange}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onSyncClock={() => handleSyncClock(connectionMode)}
          clockSyncStatus={clockSyncStatus}
          violations={violations}
          onOpenDiagnostic={openDiagnosticForViolation}
        />

        {/* Banner de alerta cuando se detecta alguna anomalía */}
        <AlertBanner
          violations={violations}
          onOpenDiagnostic={openDiagnosticForViolation}
        />

        {/* Vistas Principales */}
        <main className="p-4 md:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewDashboard
              history={history}
              evaluations={evaluations}
              violations={violations}
              nodeStatuses={nodeStatuses}
              connectionMode={connectionMode}
              onSwitchToSimulator={() => handleChangeConnectionMode('simulator')}
              gatewayOnline={gatewayOnline}
              gatewayError={gatewayError}
              onOpenDiagnostic={openDiagnosticForViolation}
              onOpenGatewaySettings={() => setActiveTab('gateway')}
            />
          )}

          {activeTab === 'diagnostic' && (
            <DiagnosticView
              violations={violations}
              selectedViolationId={selectedViolationId}
              onSelectViolation={setSelectedViolationId}
              onBackToOverview={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'gateway' && (
            <GatewayGuideView
              connectionMode={connectionMode}
              onChangeConnectionMode={handleChangeConnectionMode}
              gatewayOnline={gatewayOnline}
              gatewayError={gatewayError}
              onSyncClock={() => handleSyncClock(connectionMode)}
              clockSyncStatus={clockSyncStatus}
              scenarioId={scenarioId}
              onScenarioChange={handleScenarioChange}
            />
          )}
        </main>
      </div>
    </div>
  );
}
