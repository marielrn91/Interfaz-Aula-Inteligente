import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GATEWAY_CONFIG } from './data/nodesCatalog';
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
  const [gatewayBaseUrl, setGatewayBaseUrl] = useState(GATEWAY_CONFIG.defaultGatewayUrl);
  const [gatewayOnline, setGatewayOnline] = useState(false);
  const [gatewayError, setGatewayError] = useState(null);
  const [clockSyncStatus, setClockSyncStatus] = useState(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedViolationId, setSelectedViolationId] = useState(null);

  // Estado alimentado exclusivamente por los datos reales del Gateway (/api/ultimos y /api/datos)
  const [history, setHistory] = useState([]);
  const [ultimos, setUltimos] = useState([]);
  const [rawMessages, setRawMessages] = useState([]);
  const [lastId, setLastId] = useState(0);
  const lastIdRef = useRef(0);

  useEffect(() => {
    lastIdRef.current = lastId;
  }, [lastId]);

  // Paso 4 / Punto 6: GET /api/hora?epoch_ms=Date.now()
  const handleSyncClock = useCallback(
    async (targetUrl = gatewayBaseUrl) => {
      setClockSyncStatus('Sincronizando...');
      const res = await syncGatewayClock(targetUrl);
      if (res.ok) {
        setClockSyncStatus(`Hora OK (${res.epoch_ms})`);
        setGatewayOnline(true);
        setGatewayError(null);
      } else {
        setClockSyncStatus('Sin respuesta /api/hora');
      }
    },
    [gatewayBaseUrl]
  );

  // Al cambiar la URL del Gateway, reiniciar puntero `desde=0` y sincronizar hora
  const handleChangeGatewayBaseUrl = (newUrl) => {
    setGatewayBaseUrl(newUrl);
    lastIdRef.current = 0;
    setLastId(0);
    setHistory([]);
    setUltimos([]);
    setRawMessages([]);
  };

  // Al abrir la interfaz: enviar hora actual en milisegundos al Gateway una vez
  useEffect(() => {
    syncGatewayClock(gatewayBaseUrl).then((res) => {
      if (res.ok) {
        setClockSyncStatus(`Hora OK (${res.epoch_ms})`);
        setGatewayOnline(true);
      }
    });
  }, [gatewayBaseUrl]);

  // Ciclo de lectura cada 2 segundos: GET /api/ultimos y GET /api/datos?desde=ID
  useEffect(() => {
    if (!isPlaying) return;

    let isMounted = true;

    const pollRealGateway = async () => {
      try {
        const [fetchedUltimos, fetchedDatos] = await Promise.all([
          fetchGatewayUltimos(gatewayBaseUrl),
          fetchGatewayDatosDesde(gatewayBaseUrl, lastIdRef.current).catch(() => []),
        ]);

        if (!isMounted) return;

        if (Array.isArray(fetchedUltimos)) {
          const snap = formatUltimosToSnapshot(fetchedUltimos);
          setUltimos(fetchedUltimos);

          if (Array.isArray(fetchedDatos) && fetchedDatos.length > 0) {
            setRawMessages((prev) => [...prev, ...fetchedDatos].slice(-100));
            setHistory((prev) => mergeMessagesIntoSnapshots(prev, fetchedDatos, 20));
            const maxFromDatos = fetchedDatos.reduce(
              (acc, item) => Math.max(acc, item?.id || 0),
              lastIdRef.current
            );
            const nextId = Math.max(maxFromDatos, snap.maxMsgId);
            lastIdRef.current = nextId;
            setLastId(nextId);
          } else if (fetchedUltimos.length > 0) {
            setHistory((prev) => [...prev.slice(-19), snap]);
            if (snap.maxMsgId > lastIdRef.current) {
              lastIdRef.current = snap.maxMsgId;
              setLastId(snap.maxMsgId);
            }
          }

          setGatewayOnline(true);
          setGatewayError(null);
        }
      } catch (err) {
        if (!isMounted) return;
        setGatewayOnline(false);
        setGatewayError(
          `Sin respuesta de ${gatewayBaseUrl}/api/ultimos (${err.message || 'timeout'})`
        );
      }
    };

    // Llamada inmediata al montar / activar y luego cada 2 segundos
    pollRealGateway();
    const timer = setInterval(pollRealGateway, GATEWAY_CONFIG.pollIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [isPlaying, gatewayBaseUrl]);

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
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        violationsCount={violations.length}
        onlineNodesCount={onlineNodesCount}
        totalNodesCount={nodeStatuses.length}
        gatewayBaseUrl={gatewayBaseUrl}
        gatewayOnline={gatewayOnline}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          timestamp={latest.timestamp || 'Esperando datos...'}
          lastId={lastId}
          gatewayBaseUrl={gatewayBaseUrl}
          gatewayOnline={gatewayOnline}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onSyncClock={() => handleSyncClock(gatewayBaseUrl)}
          clockSyncStatus={clockSyncStatus}
          violations={violations}
          onOpenDiagnostic={openDiagnosticForViolation}
        />

        {/* Alert Banner when any real anomaly or violation is active */}
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
              gatewayOnline={gatewayOnline}
              gatewayBaseUrl={gatewayBaseUrl}
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

          {activeTab === 'catalog' && (
            <SensorCatalogView violations={violations} />
          )}

          {activeTab === 'gateway' && (
            <GatewayGuideView
              gatewayBaseUrl={gatewayBaseUrl}
              onChangeGatewayBaseUrl={handleChangeGatewayBaseUrl}
              gatewayOnline={gatewayOnline}
              gatewayError={gatewayError}
              onSyncClock={() => handleSyncClock(gatewayBaseUrl)}
              clockSyncStatus={clockSyncStatus}
              lastId={lastId}
            />
          )}
        </main>
      </div>
    </div>
  );
}
