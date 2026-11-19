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
import SensorCatalogView from './components/catalog/SensorCatalogView';
import GatewayGuideView from './components/gateway/GatewayGuideView';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [connectionMode, setConnectionMode] = useState('simulator'); // 'simulator' | 'hardware' | 'python'
  const [gatewayBaseUrl, setGatewayBaseUrl] = useState(GATEWAY_CONFIG.defaultGatewayUrl);
  const [gatewayOnline, setGatewayOnline] = useState(true);
  const [gatewayError, setGatewayError] = useState(null);
  const [clockSyncStatus, setClockSyncStatus] = useState(() => `Hora OK (${Date.now()})`);

  const [scenarioId, setScenarioId] = useState('nominal');
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedViolationId, setSelectedViolationId] = useState(null);

  const initialData = useMemo(() => createInitialGatewayHistory('nominal', 16), []);
  const [history, setHistory] = useState(initialData.snapshots);
  const [ultimos, setUltimos] = useState(initialData.ultimos);
  const [rawMessages, setRawMessages] = useState(initialData.rawMessages);
  const [lastId, setLastId] = useState(initialData.lastId);
  const lastIdRef = useRef(initialData.lastId);

  useEffect(() => {
    lastIdRef.current = lastId;
  }, [lastId]);

  // Sincronizar /api/hora?epoch_ms=Date.now() según punto 6 de la guía
  const handleSyncClock = useCallback(
    async (targetUrl = gatewayBaseUrl, mode = connectionMode) => {
      const epochMs = Date.now();
      if (mode === 'simulator') {
        setClockSyncStatus(`Hora OK (${epochMs})`);
        return;
      }
      setClockSyncStatus('Sincronizando...');
      const res = await syncGatewayClock(targetUrl);
      if (res.ok) {
        setClockSyncStatus(`Hora sincronizada (${res.epoch_ms})`);
        setGatewayOnline(true);
        setGatewayError(null);
      } else {
        setClockSyncStatus('Sin conexión a /api/hora');
      }
    },
    [gatewayBaseUrl, connectionMode]
  );

  // Cambio de modo de conexión (Gateway Real 192.168.4.1 / Python localhost:8000 / Simulador JS)
  const handleChangeConnectionMode = (newMode) => {
    setConnectionMode(newMode);
    setGatewayError(null);
    if (newMode === 'hardware') {
      const url = GATEWAY_CONFIG.defaultGatewayUrl;
      setGatewayBaseUrl(url);
      lastIdRef.current = 0;
      setLastId(0);
      handleSyncClock(url, 'hardware');
    } else if (newMode === 'python') {
      const url = GATEWAY_CONFIG.localSimulatorUrl;
      setGatewayBaseUrl(url);
      lastIdRef.current = 0;
      setLastId(0);
      handleSyncClock(url, 'python');
    } else {
      setGatewayOnline(true);
      setClockSyncStatus(`Hora local (${Date.now()})`);
    }
  };

  // Cambio de escenario en el simulador integrado
  const handleScenarioChange = (newScenarioId) => {
    setScenarioId(newScenarioId);
    const seeded = createInitialGatewayHistory(newScenarioId, 16);
    setHistory(seeded.snapshots);
    setUltimos(seeded.ultimos);
    setRawMessages(seeded.rawMessages);
    setLastId(seeded.lastId);
    lastIdRef.current = seeded.lastId;
  };

  // Al abrir la interfaz: enviar /api/hora?epoch_ms=Date.now() al gateway
  useEffect(() => {
    syncGatewayClock(GATEWAY_CONFIG.defaultGatewayUrl);
  }, []);

  // Ciclo de lectura cada 2 segundos (/api/ultimos y /api/datos?desde=ID)
  useEffect(() => {
    if (!isPlaying) return;

    const pollGateway = async () => {
      if (connectionMode === 'simulator') {
        const { ultimos: nextUltimos, nuevosDatos } =
          generateNodeMessagesForScenario(scenarioId, Date.now());
        const snap = formatUltimosToSnapshot(nextUltimos);
        setUltimos(nextUltimos);
        setHistory((prev) => [...prev.slice(-15), snap]);
        setRawMessages((prev) => [...prev, ...nuevosDatos].slice(-70));
        if (snap.maxMsgId > lastIdRef.current) {
          lastIdRef.current = snap.maxMsgId;
          setLastId(snap.maxMsgId);
        }
        setGatewayOnline(true);
        return;
      }

      try {
        const fetchedUltimos = await fetchGatewayUltimos(gatewayBaseUrl);
        const fetchedDatos = await fetchGatewayDatosDesde(
          gatewayBaseUrl,
          lastIdRef.current
        );

        if (Array.isArray(fetchedUltimos) && fetchedUltimos.length > 0) {
          const snap = formatUltimosToSnapshot(fetchedUltimos);
          setUltimos(fetchedUltimos);

          if (Array.isArray(fetchedDatos) && fetchedDatos.length > 0) {
            setRawMessages((prev) => [...prev, ...fetchedDatos].slice(-70));
            setHistory((prev) => mergeMessagesIntoSnapshots(prev, fetchedDatos, 16));
            const maxFromDatos = fetchedDatos.reduce(
              (acc, item) => Math.max(acc, item?.id || 0),
              lastIdRef.current
            );
            const nextId = Math.max(maxFromDatos, snap.maxMsgId);
            lastIdRef.current = nextId;
            setLastId(nextId);
          } else {
            setHistory((prev) => [...prev.slice(-15), snap]);
            if (snap.maxMsgId > lastIdRef.current) {
              lastIdRef.current = snap.maxMsgId;
              setLastId(snap.maxMsgId);
            }
          }

          setGatewayOnline(true);
          setGatewayError(null);
        }
      } catch (err) {
        setGatewayOnline(false);
        setGatewayError(
          `No se pudo leer ${gatewayBaseUrl}/api/ultimos (${err.message || 'timeout'})`
        );
      }
    };

    const timer = setInterval(pollGateway, GATEWAY_CONFIG.pollIntervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, connectionMode, gatewayBaseUrl, scenarioId]);

  const { evaluations, violations, nodeStatuses } = useMemo(
    () => evaluateGatewayState(history, ultimos),
    [history, ultimos]
  );

  const latest = history[history.length - 1] || {};
  const onlineNodesCount = nodeStatuses.filter((n) => !n.isOffline).length;

  const openDiagnosticForViolation = (idOrNodeId) => {
    setSelectedViolationId(idOrNodeId);
    setActiveTab('diagnostic');
  };

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        violationsCount={violations.length}
        onlineNodesCount={onlineNodesCount}
        totalNodesCount={nodeStatuses.length}
        connectionMode={connectionMode}
        gatewayOnline={gatewayOnline}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          timestamp={latest.timestamp || '--:--:--'}
          lastId={lastId}
          connectionMode={connectionMode}
          onChangeConnectionMode={handleChangeConnectionMode}
          scenarioId={scenarioId}
          onScenarioChange={handleScenarioChange}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onSyncClock={() => handleSyncClock(gatewayBaseUrl, connectionMode)}
          clockSyncStatus={clockSyncStatus}
          violations={violations}
          onOpenDiagnostic={openDiagnosticForViolation}
        />

        {/* Alert Banner when any anomaly or violation is active */}
        <AlertBanner
          violations={violations}
          onOpenDiagnostic={openDiagnosticForViolation}
        />

        {/* Main View Router */}
        <main className="p-4 md:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewDashboard
              history={history}
              ultimos={ultimos}
              rawMessages={rawMessages}
              lastId={lastId}
              evaluations={evaluations}
              violations={violations}
              nodeStatuses={nodeStatuses}
              onOpenDiagnostic={openDiagnosticForViolation}
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

          {activeTab === 'catalog' && (
            <SensorCatalogView violations={violations} />
          )}

          {activeTab === 'gateway' && (
            <GatewayGuideView
              connectionMode={connectionMode}
              onChangeConnectionMode={handleChangeConnectionMode}
              gatewayBaseUrl={gatewayBaseUrl}
              onChangeGatewayBaseUrl={setGatewayBaseUrl}
              gatewayOnline={gatewayOnline}
              gatewayError={gatewayError}
              onSyncClock={() => handleSyncClock(gatewayBaseUrl, connectionMode)}
              clockSyncStatus={clockSyncStatus}
              scenarioId={scenarioId}
              onScenarioChange={handleScenarioChange}
              lastId={lastId}
            />
          )}
        </main>
      </div>
    </div>
  );
}
