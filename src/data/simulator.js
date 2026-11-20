import { generateNodeMessagesForScenario } from './gatewaySimulator';
import {
  formatUltimosToSnapshot,
  evaluateGatewayState,
} from '../utils/packetFormatter';

export function createInitialGatewayHistory(scenarioId = 'nominal', count = 16) {
  const snapshots = [];
  let lastUltimos = [];
  const allMessages = [];
  const now = Date.now();

  for (let i = count - 1; i >= 0; i--) {
    const t = now - i * 2000;
    const { ultimos, nuevosDatos } = generateNodeMessagesForScenario(scenarioId, t);
    lastUltimos = ultimos;
    allMessages.push(...nuevosDatos);
    snapshots.push(formatUltimosToSnapshot(ultimos));
  }

  const maxId = allMessages.length > 0 ? allMessages[allMessages.length - 1].id : 0;

  return {
    snapshots,
    ultimos: lastUltimos,
    rawMessages: allMessages.slice(-80),
    lastId: maxId,
  };
}

export { generateNodeMessagesForScenario, formatUltimosToSnapshot, evaluateGatewayState };
