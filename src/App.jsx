import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  fetchGatewayUltimos,
  fetchGatewayDatosDesde,
} from './services/gatewayApi';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AlertBanner from './components/layout/AlertBanner';
import OverviewDashboard from './components/dashboard/OverviewDashboard';
import DiagnosticView from './components/diagnostics/DiagnosticView';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  // Dos únicas funciones: 'simulator' (simulación interactiva de datos) | 'hardware' (recepción Wi-Fi en vivo)
  const [connectionMode, setConnectionMode] = useState('simulator');
  const [gatewayOnline, setGatewayOnline] = useState(true);

  const [scenarioId, setScenarioId] = useState('nominal');
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedViolationId, setSelectedViolationId] = useState(null);

  const initialData = useMemo(() => createInitialGatewayHistory('nominal', 16), []);
  const [history, setHistory] = useState(initialData.snapshots);
  const [ultimos, setUltimos] = useState(initialData.ultimos);
  const lastIdRef = useRef(initialData.lastId);

  // Cambio entre las dos funciones: Simulación de datos o Recepción Wi-Fi
  const handleChangeConnectionMode = (newMode) => {
    setConnectionMode(newMode);
    if (newMode === 'hardware') {
      lastIdRef.current = 0;
      setHistory([]);
      setUltimos([]);
      setGatewayOnline(false);
    } else {
      const seeded = createInitialGatewayHistory(scenarioId, 16);
      setHistory(seeded.snapshots);
      setUltimos(seeded.ultimos);
      lastIdRef.current = seeded.lastId;
      setGatewayOnline(true);
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
        }
      } catch {
        if (!isMounted) return;
        setGatewayOnline(false);
      }
    };

    pollGateway();
    const timer = setInterval(pollGateway, GATEWAY_CONFIG.pollIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [isPlaying, connectionMode, scenarioId]);

  const { evaluations, violations } = useMemo(
    () => evaluateGatewayState(history, ultimos),
    [history, ultimos]
  );

  const openDiagnosticForViolation = (idOrNodeId) => {
    setSelectedViolationId(idOrNodeId);
    setActiveTab('diagnostic');
  };

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800">
      {/* Barra lateral de navegación con fondo navy y acentos brillantes */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        violationsCount={violations.length}
        connectionMode={connectionMode}
        gatewayOnline={gatewayOnline}
      />

      {/* Área Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra Superior Elegante con Acentos Cyan */}
        <Header
          connectionMode={connectionMode}
          onChangeConnectionMode={handleChangeConnectionMode}
          gatewayOnline={gatewayOnline}
          scenarioId={scenarioId}
          onScenarioChange={handleScenarioChange}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          violations={violations}
          onOpenDiagnostic={openDiagnosticForViolation}
        />

        {/* Banner de aviso cuando se detecta alguna condición a resolver */}
        <AlertBanner
          violations={violations}
          onOpenDiagnostic={openDiagnosticForViolation}
        />

        {/* Vistas Principales (Solo 2: Bienestar del Aula y Recomendaciones) */}
        <main className="p-4 md:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewDashboard
              history={history}
              evaluations={evaluations}
              connectionMode={connectionMode}
              onSwitchToSimulator={() => handleChangeConnectionMode('simulator')}
              gatewayOnline={gatewayOnline}
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
        </main>
      </div>
    </div>
  );
}
