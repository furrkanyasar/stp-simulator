import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { STPVersion, CostStandard, Language, SwitchNode, Port, LinkConnection, LinkSpeed, SyslogEntry, STPTimers, DEFAULT_STP_TIMERS } from './core/types';
import { PRESET_TOPOLOGIES } from './core/presets';
import { calculateSTPConvergence } from './core/stpEngine';
import { getLinkCost } from './core/costTable';
import { Header } from './components/Header';
import { TopologyCanvas } from './components/TopologyCanvas';
import { SyslogPanel } from './components/SyslogPanel';
import { SwitchInspectorModal } from './components/SwitchInspectorModal';
import { LinkInspectorModal } from './components/LinkInspectorModal';
import { GuidedTourModal } from './components/GuidedTourModal';
import { BPDUViewerModal } from './components/BPDUViewerModal';
import { STPTimersModal } from './components/STPTimersModal';
import { getTranslation } from './core/i18n';

export const App: React.FC = () => {
  const [stpVersion, setStpVersion] = useState<STPVersion>('802.1w');
  const [costStandard, setCostStandard] = useState<CostStandard>('short');
  const [lang, setLang] = useState<Language>('tr');
  const [wiringMode, setWiringMode] = useState<boolean>(false);
  const [recalcNonce, setRecalcNonce] = useState<number>(0);
  const [stpTimers, setStpTimers] = useState<STPTimers>({ ...DEFAULT_STP_TIMERS });

  // Tour Modal State
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  // BPDU Viewer State
  const [bpduViewerLinkId, setBpduViewerLinkId] = useState<string | null>(null);

  // STP Timers Modal State
  const [isTimersOpen, setIsTimersOpen] = useState<boolean>(false);

  // Real-Time Operator Action Logs State (capped at 500)
  const [operatorLogs, setOperatorLogs] = useState<SyslogEntry[]>([]);

  // Selection & Inspector State
  const [selectedSwitchId, setSelectedSwitchId] = useState<string | null>(null);
  const [editingSwitch, setEditingSwitch] = useState<SwitchNode | null>(null);
  const [editingLink, setEditingLink] = useState<LinkConnection | null>(null);

  // Initial Topology Data
  const defaultPreset = PRESET_TOPOLOGIES.find((p) => p.id === 'triangle') || PRESET_TOPOLOGIES[0];
  const [switchesMap, setSwitchesMap] = useState<Map<string, SwitchNode>>(() => new Map(defaultPreset.switches.map(s => [s.id, s])));
  const [portsMap, setPortsMap] = useState<Map<string, Port>>(() => new Map(defaultPreset.ports.map(p => [p.id, p])));
  const [linksMap, setLinksMap] = useState<Map<string, LinkConnection>>(() => new Map(defaultPreset.links.map(l => [l.id, l])));

  const t = getTranslation(lang);

  const addOperatorLog = useCallback((category: SyslogEntry['category'], messageEn: string, messageTr: string) => {
    const timeStr = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    const entry: SyslogEntry = {
      id: `op-log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: timeStr,
      category,
      messageEn,
      messageTr,
    };
    setOperatorLogs((prev) => [...prev, entry].slice(-500));
  }, []);

  // Compute STP Convergence (operatorLogs merged in render, NOT in useMemo deps to avoid re-calc cascade)
  const baseConvergence = useMemo(() => {
    return calculateSTPConvergence(switchesMap, portsMap, linksMap, stpVersion, costStandard, stpTimers);
  }, [switchesMap, portsMap, linksMap, stpVersion, costStandard, stpTimers, recalcNonce]);

  // Merge operator logs at render time (cheap concat, no STP re-calc)
  const convergence = useMemo(() => ({
    ...baseConvergence,
    logs: [...baseConvergence.logs, ...operatorLogs],
  }), [baseConvergence, operatorLogs]);

  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_TOPOLOGIES.find((p) => p.id === presetId);
    if (!preset) return;
    setSwitchesMap(new Map(preset.switches.map(s => [s.id, s])));
    setPortsMap(new Map(preset.ports.map(p => [p.id, p])));
    setLinksMap(new Map(preset.links.map(l => [l.id, l])));
    setSelectedSwitchId(null);
    setEditingSwitch(null);
    setEditingLink(null);

    const name = lang === 'tr' ? preset.nameTr : preset.nameEn;
    addOperatorLog('ACTION', `Loaded preset topology: ${name}`, `Hazır topoloji yüklendi: ${name}`);
  };

  const handleRecalculate = () => {
    addOperatorLog('ENGINE', 'Manual convergence recalculation triggered by NOC operator.', 'NOC operatörü tarafından manuel yakınsama tetiklendi.');
    setRecalcNonce((prev) => prev + 1);
  };

  const handleAddSwitch = () => {
    const nextIdx = switchesMap.size + 1;
    const newSwId = `sw-${Date.now()}`;
    const hexMac = nextIdx.toString(16).padStart(2, '0');
    const swName = `SW-${nextIdx}`;
    const newMac = `00:50:56:A1:B2:${hexMac}`;

    const newSw: SwitchNode = {
      id: newSwId,
      name: swName,
      priority: 32768,
      mac: newMac,
      vlan: 1,
      x: 280 + (nextIdx % 3) * 70,
      y: 180 + (nextIdx % 2) * 70,
      isRoot: false,
      rootPathCost: Infinity,
      rootPortId: null,
      designatedRootId: null,
    };

    const p1: Port = { id: `${newSwId}-p1`, name: 'Gi0/1', switchId: newSwId, priority: 128, portNumber: 1, role: 'DISABLED', state: 'DISABLED', connectedLinkId: null };
    const p2: Port = { id: `${newSwId}-p2`, name: 'Gi0/2', switchId: newSwId, priority: 128, portNumber: 2, role: 'DISABLED', state: 'DISABLED', connectedLinkId: null };

    setSwitchesMap((prev) => new Map(prev).set(newSwId, newSw));
    setPortsMap((prev) => {
      const next = new Map(prev);
      next.set(p1.id, p1);
      next.set(p2.id, p2);
      return next;
    });

    addOperatorLog('ACTION', `Added new switch ${swName} (Priority: 32768, MAC: ${newMac}).`, `Yeni anahtar eklendi: ${swName} (Öncelik: 32768, MAC: ${newMac}).`);
  };

  const handleDeleteSwitch = (switchId: string) => {
    const sw = switchesMap.get(switchId);
    const swPorts = Array.from(portsMap.values()).filter((p) => p.switchId === switchId).map((p) => p.id);

    setLinksMap((prev) => {
      const next = new Map(prev);
      Array.from(next.values()).forEach((l) => {
        if (swPorts.includes(l.portAId) || swPorts.includes(l.portBId)) {
          next.delete(l.id);
        }
      });
      return next;
    });

    setPortsMap((prev) => {
      const next = new Map(prev);
      swPorts.forEach((pId) => next.delete(pId));
      return next;
    });

    setSwitchesMap((prev) => {
      const next = new Map(prev);
      next.delete(switchId);
      return next;
    });

    if (selectedSwitchId === switchId) setSelectedSwitchId(null);
    if (editingSwitch?.id === switchId) setEditingSwitch(null);
    addOperatorLog('ACTION', `Deleted switch ${sw?.name || switchId}.`, `${sw?.name || switchId} anahtarı silindi.`);
  };

  const handleUpdateSwitchPosition = (id: string, x: number, y: number) => {
    setSwitchesMap((prev) => {
      const sw = prev.get(id);
      if (!sw) return prev;
      const updated = { ...sw, x, y };
      return new Map(prev).set(id, updated);
    });
  };

  const handleSaveSwitch = (updatedSw: SwitchNode) => {
    setSwitchesMap((prev) => new Map(prev).set(updatedSw.id, updatedSw));
    addOperatorLog(
      'ACTION',
      `Updated switch ${updatedSw.name} (Priority: ${updatedSw.priority}, MAC: ${updatedSw.mac}).`,
      `${updatedSw.name} anahtarı güncellendi (Öncelik: ${updatedSw.priority}, MAC: ${updatedSw.mac}).`
    );
  };

  const handleSaveLink = (updatedLink: LinkConnection) => {
    setLinksMap((prev) => new Map(prev).set(updatedLink.id, updatedLink));

    if (updatedLink.status === 'DOWN') {
      addOperatorLog(
        'ACTION',
        `Link ${updatedLink.id} set to LINK DOWN (Shutdown). Failover convergence triggered!`,
        `Hat ${updatedLink.id} KESİLDİ (LINK DOWN / Shutdown). Yedekleme yakınsaması tetiklendi!`
      );
    } else {
      addOperatorLog(
        'ACTION',
        `Link ${updatedLink.id} set to LINK UP (Operational). Speed: ${updatedLink.speed}.`,
        `Hat ${updatedLink.id} AKTİF YAPILDI (LINK UP). Hız: ${updatedLink.speed}.`
      );
    }
  };

  const handleToggleLinkStatus = (linkId: string) => {
    setLinksMap((prev) => {
      const link = prev.get(linkId);
      if (!link) return prev;
      const newStatus = link.status === 'UP' ? 'DOWN' : 'UP';
      const updated = { ...link, status: newStatus as 'UP' | 'DOWN' };

      if (newStatus === 'DOWN') {
        addOperatorLog('ACTION', `Simulated link failure (LINK DOWN) on ${linkId}.`, `${linkId} üzerinde hat kesintisi simüle edildi (HAT KESİK).`);
      } else {
        addOperatorLog('ACTION', `Restored link (LINK UP) on ${linkId}.`, `${linkId} hattı tekrar bağlandı (HAT AKTİF).`);
      }

      return new Map(prev).set(linkId, updated);
    });
  };

  const handleChangeLinkSpeed = (linkId: string, speed: LinkSpeed) => {
    setLinksMap((prev) => {
      const link = prev.get(linkId);
      if (!link) return prev;
      const updated = { ...link, speed };
      addOperatorLog('ACTION', `Changed link ${linkId} speed to ${speed}.`, `${linkId} hat hızı ${speed} olarak değiştirildi.`);
      return new Map(prev).set(linkId, updated);
    });
  };

  const handleDeleteLink = (linkId: string) => {
    setLinksMap((prev) => {
      const next = new Map(prev);
      next.delete(linkId);
      return next;
    });

    setPortsMap((prev) => {
      const next = new Map(prev);
      Array.from(next.values()).forEach((p) => {
        if (p.connectedLinkId === linkId) {
          next.set(p.id, { ...p, connectedLinkId: null });
        }
      });
      return next;
    });

    if (editingLink?.id === linkId) setEditingLink(null);
    if (bpduViewerLinkId === linkId) setBpduViewerLinkId(null);
    addOperatorLog('ACTION', `Deleted cable link ${linkId}.`, `${linkId} kablo bağlantısı silindi.`);
  };

  const handleConnectPorts = (portAId: string, portBId: string) => {
    const portA = portsMap.get(portAId);
    const portB = portsMap.get(portBId);
    if (!portA || !portB || portA.switchId === portB.switchId) return;

    const swA = switchesMap.get(portA.switchId);
    const swB = switchesMap.get(portB.switchId);

    let targetAId = portA.id;
    let targetBId = portB.id;
    const nextPortsMap = new Map(portsMap);

    if (portA.connectedLinkId) {
      const freeA = Array.from(nextPortsMap.values()).find(
        (p) => p.switchId === portA.switchId && !p.connectedLinkId && p.id !== portA.id
      );
      if (freeA) targetAId = freeA.id;
      else {
        const nextNum = Array.from(nextPortsMap.values()).filter((p) => p.switchId === portA.switchId).length + 1;
        targetAId = `${portA.switchId}-p${nextNum}-${Date.now()}`;
        nextPortsMap.set(targetAId, {
          id: targetAId,
          name: `Gi0/${nextNum}`,
          switchId: portA.switchId,
          priority: 128,
          portNumber: nextNum,
          role: 'DISABLED',
          state: 'DISABLED',
          connectedLinkId: null,
        });
      }
    }

    if (portB.connectedLinkId) {
      const freeB = Array.from(nextPortsMap.values()).find(
        (p) => p.switchId === portB.switchId && !p.connectedLinkId && p.id !== portB.id
      );
      if (freeB) targetBId = freeB.id;
      else {
        const nextNum = Array.from(nextPortsMap.values()).filter((p) => p.switchId === portB.switchId).length + 1;
        targetBId = `${portB.switchId}-p${nextNum}-${Date.now()}`;
        nextPortsMap.set(targetBId, {
          id: targetBId,
          name: `Gi0/${nextNum}`,
          switchId: portB.switchId,
          priority: 128,
          portNumber: nextNum,
          role: 'DISABLED',
          state: 'DISABLED',
          connectedLinkId: null,
        });
      }
    }

    const finalPortA = nextPortsMap.get(targetAId)!;
    const finalPortB = nextPortsMap.get(targetBId)!;

    const newLinkId = `link-${Date.now()}`;
    const newLink: LinkConnection = {
      id: newLinkId,
      switchAId: portA.switchId,
      portAId: targetAId,
      switchBId: portB.switchId,
      portBId: targetBId,
      speed: '100M',
      cost: getLinkCost('100M', costStandard),
      status: 'UP',
    };

    setLinksMap((prev) => new Map(prev).set(newLinkId, newLink));

    nextPortsMap.set(targetAId, { ...finalPortA, connectedLinkId: newLinkId });
    nextPortsMap.set(targetBId, { ...finalPortB, connectedLinkId: newLinkId });
    setPortsMap(nextPortsMap);

    addOperatorLog(
      'ACTION',
      `Connected cable from ${swA?.name}:${finalPortA.name} to ${swB?.name}:${finalPortB.name}.`,
      `${swA?.name}:${finalPortA.name} ile ${swB?.name}:${finalPortB.name} arasına kablo bağlandı.`
    );
  };

  const handleDisconnectPort = (portId: string) => {
    const port = portsMap.get(portId);
    if (!port || !port.connectedLinkId) return;
    const sw = switchesMap.get(port.switchId);
    handleDeleteLink(port.connectedLinkId);
    addOperatorLog('ACTION', `Disconnected port ${sw?.name}:${port.name}.`, `${sw?.name}:${port.name} portundaki kablo söküldü.`);
  };

  const handleAddPortToSwitch = (switchId: string): string => {
    const swPorts = Array.from(portsMap.values()).filter((p) => p.switchId === switchId);
    const nextNum = swPorts.length + 1;
    const newPortId = `${switchId}-p${nextNum}-${Date.now()}`;
    const newPort: Port = {
      id: newPortId,
      name: `Gi0/${nextNum}`,
      switchId,
      priority: 128,
      portNumber: nextNum,
      role: 'DISABLED',
      state: 'DISABLED',
      connectedLinkId: null,
    };
    setPortsMap((prev) => new Map(prev).set(newPortId, newPort));
    return newPortId;
  };

  const handleClearCanvas = () => {
    setSwitchesMap(new Map());
    setPortsMap(new Map());
    setLinksMap(new Map());
    setSelectedSwitchId(null);
    setEditingSwitch(null);
    setEditingLink(null);
    setBpduViewerLinkId(null);
    setWiringMode(false);
    addOperatorLog('ACTION', 'Cleared canvas.', 'Tuval üzerindeki tüm cihazlar ve kablolar temizlendi.');
  };

  const handleSetStpVersion = (v: STPVersion) => {
    setStpVersion(v);
    if (v === '802.1D') {
      setCostStandard('short');
      addOperatorLog(
        'COST',
        '802.1D Classic STP selected: Auto-switched Path Cost standard to IEEE Short 16-bit (1G = 4, 100M = 19).',
        '802.1D Klasik STP seçildi: Yol Maliyeti standardı otomatik olarak IEEE Kısa 16-bit yapıldı (1G = 4, 100M = 19).'
      );
    } else {
      setCostStandard('long');
      addOperatorLog(
        'COST',
        `${v} selected: Auto-switched Path Cost standard to IEEE 802.1t Long 32-bit (1G = 20000, 100M = 200000).`,
        `${v} seçildi: Yol Maliyeti standardı otomatik olarak IEEE 802.1t Uzun 32-bit yapıldı (1G = 20000, 100M = 200000).`
      );
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      <Header
        stpVersion={stpVersion}
        setStpVersion={handleSetStpVersion}
        costStandard={costStandard}
        setCostStandard={setCostStandard}
        lang={lang}
        setLang={setLang}
        onSelectPreset={handleSelectPreset}
        onRecalculate={handleRecalculate}
        onAddSwitch={handleAddSwitch}
        onClearCanvas={handleClearCanvas}
        onOpenHelp={() => setIsTourOpen(true)}
        onOpenTimers={() => setIsTimersOpen(true)}
        wiringMode={wiringMode}
        setWiringMode={setWiringMode}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Topology Canvas (65% Width) */}
        <div className="w-[65%] h-full relative border-r border-[#1f293d]">
          <TopologyCanvas
            switches={convergence.switches}
            ports={convergence.ports}
            links={convergence.links}
            rootSwitchId={convergence.rootSwitchId}
            lang={lang}
            stpVersion={stpVersion}
            costStandard={costStandard}
            selectedSwitchId={selectedSwitchId}
            onSelectSwitch={setSelectedSwitchId}
            onUpdateSwitchPosition={handleUpdateSwitchPosition}
            onEditSwitch={setEditingSwitch}
            onDeleteSwitch={handleDeleteSwitch}
            onEditLink={setEditingLink}
            onToggleLinkStatus={handleToggleLinkStatus}
            onChangeLinkSpeed={handleChangeLinkSpeed}
            onDeleteLink={handleDeleteLink}
            onConnectPorts={handleConnectPorts}
            onDisconnectPort={handleDisconnectPort}
            onAddPortToSwitch={handleAddPortToSwitch}
            wiringMode={wiringMode}
            setWiringMode={setWiringMode}
          />
        </div>

        {/* Right Syslog Panel (35% Width) */}
        <div className="w-[35%] h-full">
          <SyslogPanel logs={convergence.logs} lang={lang} />
        </div>
      </div>

      {/* Switch Inspector Modal */}
      <SwitchInspectorModal
        sw={editingSwitch}
        onClose={() => setEditingSwitch(null)}
        onSave={handleSaveSwitch}
        onDeleteSwitch={handleDeleteSwitch}
        lang={lang}
      />

      {/* Link Inspector Modal (UP/DOWN Failover Simulator & Speed Selector) */}
      <LinkInspectorModal
        link={editingLink}
        onClose={() => setEditingLink(null)}
        onSave={handleSaveLink}
        onDeleteLink={handleDeleteLink}
        lang={lang}
        stpVersion={stpVersion}
        costStandard={costStandard}
        onViewBPDU={(linkId: string) => { setEditingLink(null); setBpduViewerLinkId(linkId); }}
      />

      {/* BPDU Frame Viewer Modal */}
      <BPDUViewerModal
        isOpen={!!bpduViewerLinkId}
        onClose={() => setBpduViewerLinkId(null)}
        link={bpduViewerLinkId ? (convergence.links.get(bpduViewerLinkId) || null) : null}
        bpdu={bpduViewerLinkId ? (convergence.bpduFrames.get(bpduViewerLinkId) || null) : null}
        switches={convergence.switches}
        ports={convergence.ports}
        lang={lang}
      />

      {/* STP Timers Modal */}
      <STPTimersModal
        isOpen={isTimersOpen}
        onClose={() => setIsTimersOpen(false)}
        timers={stpTimers}
        onSave={(t) => {
          setStpTimers(t);
          addOperatorLog(
            'TIMER',
            `STP Timers updated: Max Age=${t.maxAge}s, Hello=${t.helloTime}s, Fwd Delay=${t.forwardDelay}s.`,
            `STP Zamanlayıcıları güncellendi: Max Age=${t.maxAge}s, Hello=${t.helloTime}s, Fwd Delay=${t.forwardDelay}s.`
          );
        }}
        lang={lang}
      />

      {/* Guided Tour Modal */}
      <GuidedTourModal isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} lang={lang} />
    </div>
  );
};
