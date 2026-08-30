import {
  SwitchNode,
  Port,
  LinkConnection,
  STPVersion,
  CostStandard,
  ConvergenceResult,
  SyslogEntry,
  PortRole,
  PortState,
  BPDUFrame,
  STPTimers,
  DEFAULT_STP_TIMERS,
} from './types';
import { getLinkCost } from './costTable';

export function compareBridgeId(aPri: number, aMac: string, bPri: number, bMac: string): number {
  if (aPri !== bPri) {
    return aPri - bPri;
  }
  return aMac.localeCompare(bMac);
}

export function formatBridgeId(priority: number, mac: string, vlan: number = 1): string {
  return `${priority + vlan}.${mac.toLowerCase()}`;
}

/**
 * Main STP convergence engine.
 * Accepts Map<string, T> for switches, ports, links (type-safe with App.tsx).
 */
export function calculateSTPConvergence(
  switchesInput: Map<string, SwitchNode>,
  portsInput: Map<string, Port>,
  linksInput: Map<string, LinkConnection>,
  stpVersion: STPVersion = '802.1w',
  costStandard: CostStandard = 'short',
  timers: STPTimers = DEFAULT_STP_TIMERS
): ConvergenceResult {
  const switches = new Map<string, SwitchNode>();
  const ports = new Map<string, Port>();
  const links = new Map<string, LinkConnection>();
  const bpduFrames = new Map<string, BPDUFrame>();

  switchesInput.forEach((s) => switches.set(s.id, { ...s, isRoot: false, rootPathCost: Infinity, rootPortId: null, designatedRootId: null }));
  portsInput.forEach((p) => ports.set(p.id, { ...p, role: 'DISABLED', state: 'DISABLED' }));
  linksInput.forEach((l) => {
    const cost = l.customCost !== undefined && l.customCost > 0 ? l.customCost : getLinkCost(l.speed, costStandard);
    links.set(l.id, { ...l, cost });
  });

  const logs: SyslogEntry[] = [];
  const stepByStepLogs: SyslogEntry[][] = [];

  let stepCounter = 1;

  function addLog(
    category: SyslogEntry['category'],
    enMsg: string,
    trMsg: string,
    highlightSwitchId?: string,
    highlightLinkId?: string
  ) {
    const timeStr = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    const entry: SyslogEntry = {
      id: `log-${stepCounter}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: timeStr,
      stepNumber: stepCounter++,
      category,
      messageEn: enMsg,
      messageTr: trMsg,
      highlightSwitchId,
      highlightLinkId,
    };
    logs.push(entry);
    stepByStepLogs.push([...logs]);
  }

  addLog(
    'ENGINE',
    `Initializing ${stpVersion} convergence calculation (Cost Standard: ${costStandard.toUpperCase()})...`,
    `${stpVersion} yakınsama hesaplaması başlatılıyor (Maliyet Standardı: ${costStandard.toUpperCase()})...`
  );

  // Standard-Specific Initial Engine Logs (using dynamic timers)
  if (stpVersion === '802.1D') {
    addLog(
      'TIMER',
      `802.1D Classic STP Timers: Max Age = ${timers.maxAge}s, Hello = ${timers.helloTime}s, Forward Delay = ${timers.forwardDelay}s (${timers.forwardDelay * 2}s Total Convergence).`,
      `802.1D Klasik STP Zamanlayıcıları: Max Age = ${timers.maxAge}s, Hello = ${timers.helloTime}s, Forward Delay = ${timers.forwardDelay}s (Toplam ${timers.forwardDelay * 2}sn Yakınsama).`
    );
  } else if (stpVersion === '802.1w') {
    addLog(
      'TIMER',
      `802.1w RSTP Rapid Convergence: Proposal/Agreement (P/A) Handshake (~2s). Hello = ${timers.helloTime}s, Max Age = ${timers.maxAge}s.`,
      `802.1w RSTP Hızlı Yakınsama: Proposal/Agreement (P/A) El Sıkışması (~2sn). Hello = ${timers.helloTime}s, Max Age = ${timers.maxAge}s.`
    );
  } else if (stpVersion === '802.1s') {
    addLog(
      'TIMER',
      `802.1s MSTP (CIST/MST0): Region 'NOC-MST-1', Rev 1. Hello = ${timers.helloTime}s, Max Age = ${timers.maxAge}s, Fwd Delay = ${timers.forwardDelay}s.`,
      `802.1s MSTP (CIST/MST0): Bölge 'NOC-MST-1', Rev 1. Hello = ${timers.helloTime}s, Max Age = ${timers.maxAge}s, Fwd Delay = ${timers.forwardDelay}s.`
    );
  }

  if (switches.size === 0) {
    return { switches, ports, links, rootSwitchId: null, logs, stepByStepLogs, bpduFrames };
  }

  // Set active link ports to operational defaults
  links.forEach((link) => {
    if (link.status === 'UP') {
      const portA = ports.get(link.portAId);
      const portB = ports.get(link.portBId);
      if (portA) {
        portA.state = stpVersion === '802.1D' ? 'BLOCKING' : 'DISCARDING';
      }
      if (portB) {
        portB.state = stpVersion === '802.1D' ? 'BLOCKING' : 'DISCARDING';
      }
    }
  });

  // STEP 1: ROOT BRIDGE SELECTION
  let rootSwitch: SwitchNode | null = null;

  switches.forEach((sw) => {
    if (!rootSwitch) {
      rootSwitch = sw;
    } else {
      const cmp = compareBridgeId(sw.priority, sw.mac, rootSwitch.priority, rootSwitch.mac);
      if (cmp < 0) {
        rootSwitch = sw;
      }
    }
  });

  if (!rootSwitch) {
    return { switches, ports, links, rootSwitchId: null, logs, stepByStepLogs, bpduFrames };
  }

  const rootId = (rootSwitch as SwitchNode).id;
  const rootObj = switches.get(rootId)!;
  rootObj.isRoot = true;
  rootObj.rootPathCost = 0;
  rootObj.designatedRootId = rootId;

  addLog(
    'ROOT',
    `Switch ${rootObj.name} selected as ROOT BRIDGE (Lowest Bridge ID: ${formatBridgeId(rootObj.priority, rootObj.mac, rootObj.vlan)}).`,
    `${rootObj.name} anahtarı KÖK KÖPRÜ (Root Bridge) seçildi (En Düşük Bridge ID: ${formatBridgeId(rootObj.priority, rootObj.mac, rootObj.vlan)}).`,
    rootId
  );

  // STEP 2: PATH COST CALCULATION (Bellman-Ford Shortest Path to Root)
  const distances = new Map<string, { cost: number; viaPortId: string | null; neighborId: string | null }>();
  switches.forEach((sw, id) => {
    distances.set(id, { cost: id === rootId ? 0 : Infinity, viaPortId: null, neighborId: null });
  });

  let changed = true;
  let maxIterations = 50;

  while (changed && maxIterations > 0) {
    changed = false;
    maxIterations--;

    links.forEach((link) => {
      if (link.status !== 'UP') return;

      const pA = ports.get(link.portAId);
      const pB = ports.get(link.portBId);
      if (!pA || !pB) return;

      const swAId = pA.switchId;
      const swBId = pB.switchId;
      const distA = distances.get(swAId)!;
      const distB = distances.get(swBId)!;

      // Check route from A to B
      if (distA.cost !== Infinity) {
        const potentialCost = distA.cost + link.cost;
        if (potentialCost < distB.cost) {
          distances.set(swBId, { cost: potentialCost, viaPortId: link.portBId, neighborId: swAId });
          changed = true;
        } else if (potentialCost === distB.cost && distB.cost !== Infinity && distB.neighborId) {
          const currentNeighbor = switches.get(distB.neighborId)!;
          const newNeighbor = switches.get(swAId)!;
          const cmpBID = compareBridgeId(newNeighbor.priority, newNeighbor.mac, currentNeighbor.priority, currentNeighbor.mac);
          if (cmpBID < 0) {
            distances.set(swBId, { cost: potentialCost, viaPortId: link.portBId, neighborId: swAId });
            changed = true;
          }
        }
      }

      // Check route from B to A
      if (distB.cost !== Infinity) {
        const potentialCost = distB.cost + link.cost;
        if (potentialCost < distA.cost) {
          distances.set(swAId, { cost: potentialCost, viaPortId: link.portAId, neighborId: swBId });
          changed = true;
        } else if (potentialCost === distA.cost && distA.cost !== Infinity && distA.neighborId) {
          const currentNeighbor = switches.get(distA.neighborId)!;
          const newNeighbor = switches.get(swBId)!;
          const cmpBID = compareBridgeId(newNeighbor.priority, newNeighbor.mac, currentNeighbor.priority, currentNeighbor.mac);
          if (cmpBID < 0) {
            distances.set(swAId, { cost: potentialCost, viaPortId: link.portAId, neighborId: swBId });
            changed = true;
          }
        }
      }
    });
  }

  // Update rootPathCost for each switch
  switches.forEach((sw, swId) => {
    if (swId !== rootId) {
      const dist = distances.get(swId)!;
      sw.rootPathCost = dist.cost;
      sw.designatedRootId = rootId;
      addLog(
        'COST',
        `${sw.name} calculated Root Path Cost = ${sw.rootPathCost === Infinity ? 'Unreachable' : sw.rootPathCost}`,
        `${sw.name} Kök Yol Maliyeti (Root Path Cost) = ${sw.rootPathCost === Infinity ? 'Erişilemez' : sw.rootPathCost}`,
        swId
      );
    }
  });

  // STEP 3: ROOT PORT (RP) SELECTION ON NON-ROOT SWITCHES
  switches.forEach((sw, swId) => {
    if (swId === rootId) return;

    const candidatePorts: Array<{
      port: Port;
      linkCost: number;
      totalCost: number;
      senderSwitch: SwitchNode;
      senderPort: Port;
    }> = [];

    ports.forEach((p) => {
      if (p.switchId !== swId || !p.connectedLinkId) return;
      const link = links.get(p.connectedLinkId);
      if (!link || link.status !== 'UP') return;

      const otherPortId = link.portAId === p.id ? link.portBId : link.portAId;
      const otherPort = ports.get(otherPortId);
      if (!otherPort) return;

      const senderSwitch = switches.get(otherPort.switchId);
      if (!senderSwitch) return;

      const senderDist = distances.get(senderSwitch.id);
      if (!senderDist || senderDist.cost === Infinity) return;

      const totalCost = senderDist.cost + link.cost;
      candidatePorts.push({
        port: p,
        linkCost: link.cost,
        totalCost,
        senderSwitch,
        senderPort: otherPort,
      });
    });

    if (candidatePorts.length === 0) return;

    candidatePorts.sort((a, b) => {
      if (a.totalCost !== b.totalCost) return a.totalCost - b.totalCost;
      const cmpBID = compareBridgeId(a.senderSwitch.priority, a.senderSwitch.mac, b.senderSwitch.priority, b.senderSwitch.mac);
      if (cmpBID !== 0) return cmpBID;
      if (a.senderPort.priority !== b.senderPort.priority) return a.senderPort.priority - b.senderPort.priority;
      return a.senderPort.portNumber - b.senderPort.portNumber;
    });

    const winningRP = candidatePorts[0];
    winningRP.port.role = 'ROOT';
    winningRP.port.state = 'FORWARDING';
    sw.rootPortId = winningRP.port.id;

    const roleTag = stpVersion === '802.1s' ? 'ROOT PORT (CIST/MST0) [RP-M0]' : 'ROOT PORT [RP]';

    addLog(
      'ROLE',
      `${sw.name} port ${winningRP.port.name} designated as ${roleTag} (Cost: ${winningRP.totalCost} via ${winningRP.senderSwitch.name}).`,
      `${sw.name} bağlantı noktası ${winningRP.port.name} ${roleTag} olarak belirlendi (Maliyet: ${winningRP.totalCost}, ${winningRP.senderSwitch.name} üzerinden).`,
      swId,
      winningRP.port.connectedLinkId!
    );
  });

  // STEP 4: DESIGNATED PORT (DP) SELECTION PER LINK SEGMENT
  links.forEach((link) => {
    if (link.status !== 'UP') return;

    const pA = ports.get(link.portAId);
    const pB = ports.get(link.portBId);
    if (!pA || !pB) return;

    const swA = switches.get(pA.switchId)!;
    const swB = switches.get(pB.switchId)!;

    if (pA.role === 'ROOT') {
      pB.role = 'DESIGNATED';
      pB.state = 'FORWARDING';
      addLog(
        'ROLE',
        `Link ${swA.name}:${pA.name} <-> ${swB.name}:${pB.name} -> ${swB.name}:${pB.name} selected as DESIGNATED PORT [DP].`,
        `Bağlantı ${swA.name}:${pA.name} <-> ${swB.name}:${pB.name} -> ${swB.name}:${pB.name} ATANMIŞ PORT [DP] seçildi.`,
        swB.id,
        link.id
      );
      return;
    }
    if (pB.role === 'ROOT') {
      pA.role = 'DESIGNATED';
      pA.state = 'FORWARDING';
      addLog(
        'ROLE',
        `Link ${swA.name}:${pA.name} <-> ${swB.name}:${pB.name} -> ${swA.name}:${pA.name} selected as DESIGNATED PORT [DP].`,
        `Bağlantı ${swA.name}:${pA.name} <-> ${swB.name}:${pB.name} -> ${swA.name}:${pA.name} ATANMIŞ PORT [DP] seçildi.`,
        swA.id,
        link.id
      );
      return;
    }

    let winner: 'A' | 'B' = 'A';

    if (swA.rootPathCost !== swB.rootPathCost) {
      winner = swA.rootPathCost < swB.rootPathCost ? 'A' : 'B';
    } else {
      const cmpBID = compareBridgeId(swA.priority, swA.mac, swB.priority, swB.mac);
      if (cmpBID !== 0) {
        winner = cmpBID < 0 ? 'A' : 'B';
      } else if (pA.priority !== pB.priority) {
        winner = pA.priority < pB.priority ? 'A' : 'B';
      } else {
        winner = pA.portNumber < pB.portNumber ? 'A' : 'B';
      }
    }

    const dpPort = winner === 'A' ? pA : pB;
    const blockPort = winner === 'A' ? pB : pA;
    const dpSwitch = winner === 'A' ? swA : swB;
    const blockSwitch = winner === 'A' ? swB : swA;

    dpPort.role = 'DESIGNATED';
    dpPort.state = 'FORWARDING';

    const blockedRole: PortRole = swA.id === swB.id ? 'BACKUP' : 'ALTERNATE';
    const blockedState: PortState = stpVersion === '802.1D' ? 'BLOCKING' : 'DISCARDING';

    blockPort.role = blockedRole;
    blockPort.state = blockedState;

    addLog(
      'LOOP',
      `Potential loop detected on link segment ${swA.name}:${pA.name} <-> ${swB.name}:${pB.name}.`,
      `Segment üzerinde döngü riski algılandı: ${swA.name}:${pA.name} <-> ${swB.name}:${pB.name}.`,
      dpSwitch.id,
      link.id
    );

    const versionDesc =
      stpVersion === '802.1D'
        ? `BLOCKING state (${timers.forwardDelay}s Forward Delay timer)`
        : stpVersion === '802.1w'
        ? 'DISCARDING state (Immediate RSTP P/A cutoff)'
        : 'DISCARDING state (CIST/MST0 Instance blocking)';

    const versionDescTr =
      stpVersion === '802.1D'
        ? `BLOCKING durumuna (${timers.forwardDelay}sn İletim Gecikmesi zamanlayıcısı)`
        : stpVersion === '802.1w'
        ? 'DISCARDING durumuna (Anlık RSTP P/A kesintisi)'
        : 'DISCARDING durumuna (CIST/MST0 Örneklem engellemesi)';

    addLog(
      'BLOCK',
      `${dpSwitch.name}:${dpPort.name} set to DESIGNATED [DP]. ${blockSwitch.name}:${blockPort.name} placed in ${blockedRole} / ${versionDesc} to break loop.`,
      `${dpSwitch.name}:${dpPort.name} ATANMIŞ PORT [DP] yapıldı. ${blockSwitch.name}:${blockPort.name} döngüyü kırmak için ${blockedRole} / ${versionDescTr} alındı.`,
      blockSwitch.id,
      link.id
    );
  });

  // Root bridge ports: all designated except self-loop BACKUP ports
  ports.forEach((p) => {
    if (p.switchId === rootId && p.connectedLinkId) {
      const link = links.get(p.connectedLinkId);
      if (link && link.status === 'UP') {
        if (p.role !== 'BACKUP') {
          p.role = 'DESIGNATED';
          p.state = 'FORWARDING';
        }
      }
    }
  });

  // STEP 5: BUILD SIMULATED BPDU FRAMES PER LINK
  const rootBridgeIdStr = formatBridgeId(rootObj.priority, rootObj.mac, rootObj.vlan);
  links.forEach((link) => {
    if (link.status !== 'UP') return;
    const pA = ports.get(link.portAId);
    if (!pA) return;
    const senderSw = switches.get(pA.switchId);
    if (!senderSw) return;

    const senderBridgeIdStr = formatBridgeId(senderSw.priority, senderSw.mac, senderSw.vlan);

    const bpdu: BPDUFrame = {
      rootBridgeId: rootBridgeIdStr,
      rootPathCost: senderSw.rootPathCost === Infinity ? 0 : senderSw.rootPathCost,
      senderBridgeId: senderBridgeIdStr,
      senderPortId: pA.name,
      senderPortPriority: pA.priority,
      messageAge: 0,
      maxAge: timers.maxAge,
      helloTime: timers.helloTime,
      forwardDelay: timers.forwardDelay,
    };
    bpduFrames.set(link.id, bpdu);
  });

  addLog(
    'ENGINE',
    `Convergence complete for ${stpVersion}. Active Root Bridge: ${rootObj.name}. ${bpduFrames.size} BPDU frame(s) active.`,
    `${stpVersion} yakınsaması tamamlandı. Aktif Kök Köprü: ${rootObj.name}. ${bpduFrames.size} BPDU çerçevesi aktif.`
  );

  return {
    switches,
    ports,
    links,
    rootSwitchId: rootId,
    logs,
    stepByStepLogs,
    bpduFrames,
  };
}
