import React, { useState, useEffect, useRef } from 'react';
import {
  SwitchNode,
  Port,
  LinkConnection,
  SyslogEntry,
  Language,
  STPVersion,
  MSTPInstance,
} from '../core/types';
import { getTranslation } from '../core/i18n';
import {
  Terminal,
  Table,
  Zap,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  ShieldAlert,
  Server,
  Layers,
  Activity,
} from 'lucide-react';

interface SidePanelProps {
  activeTab: number;
  setActiveTab: (t: number) => void;
  logs: SyslogEntry[];
  stepByStepLogs: SyslogEntry[][];
  currentStepIndex: number;
  setCurrentStepIndex: (idx: number) => void;
  switches: Map<string, SwitchNode>;
  ports: Map<string, Port>;
  links: Map<string, LinkConnection>;
  rootSwitchId: string | null;
  lang: Language;
  stpVersion: STPVersion;
  onToggleLinkStatus: (linkId: string) => void;
  onHighlightLog: (switchId?: string, linkId?: string) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  activeTab,
  setActiveTab,
  logs,
  stepByStepLogs,
  currentStepIndex,
  setCurrentStepIndex,
  switches,
  ports,
  links,
  rootSwitchId,
  lang,
  stpVersion,
  onToggleLinkStatus,
  onHighlightLog,
}) => {
  const t = getTranslation(lang);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Log Filtering & Search State
  const [logFilter, setLogFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Auto-play state for step-by-step trace
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex(currentStepIndex >= stepByStepLogs.length - 1 ? currentStepIndex : currentStepIndex + 1);
        if (currentStepIndex >= stepByStepLogs.length - 1) {
          setIsPlaying(false);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, stepByStepLogs.length, setCurrentStepIndex]);

  // Current visible logs based on playback step index
  const visibleLogs = stepByStepLogs[currentStepIndex] || logs;

  const filteredLogs = visibleLogs.filter((l) => {
    const msg = lang === 'tr' ? l.messageTr : l.messageEn;
    const matchesCategory = logFilter === 'ALL' || l.category === logFilter;
    const matchesSearch = msg.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Auto-scroll log console to bottom when new logs arrive!
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [filteredLogs.length, logs.length]);

  // Calculate Metrics
  const totalSwitches = switches.size;
  const activeLinks = Array.from(links.values()).filter((l) => l.status === 'UP').length;
  const blockedPorts = Array.from(ports.values()).filter(
    (p) => p.role === 'ALTERNATE' || p.role === 'BACKUP'
  ).length;

  // MSTP Dummy Instances Data
  const mstpInstances: MSTPInstance[] = [
    { instanceId: 0, name: 'CIST (Default)', vlans: 'VLAN 1, Default', rootSwitchId: rootSwitchId || 'N/A' },
    { instanceId: 1, name: 'MSTI 1 (Prod)', vlans: 'VLAN 10, 20, 30', rootSwitchId: Array.from(switches.keys())[0] || 'N/A' },
    { instanceId: 2, name: 'MSTI 2 (Voice/Mgmt)', vlans: 'VLAN 40, 50, 100', rootSwitchId: Array.from(switches.keys())[1] || rootSwitchId || 'N/A' },
  ];

  return (
    <div className="w-full h-full bg-[#111827] border-l border-[#1f293d] flex flex-col overflow-hidden select-none">
      {/* Top Tabs Header */}
      <div className="h-10 bg-[#0d1322] border-b border-[#1f293d] flex items-center px-1 shrink-0 font-mono text-xs">
        <button
          onClick={() => setActiveTab(1)}
          className={`flex items-center space-x-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 1
              ? 'border-cyan-400 text-cyan-300 bg-[#111827]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>{t.tabSyslog}</span>
        </button>

        <button
          onClick={() => setActiveTab(2)}
          className={`flex items-center space-x-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 2
              ? 'border-cyan-400 text-cyan-300 bg-[#111827]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>{t.tabTable}</span>
        </button>

        <button
          onClick={() => setActiveTab(3)}
          className={`flex items-center space-x-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 3
              ? 'border-cyan-400 text-cyan-300 bg-[#111827]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{t.tabFailover}</span>
        </button>
      </div>

      {/* TAB 1: BPDU LOG & STEP-BY-STEP TRACE */}
      {activeTab === 1 && (
        <div className="flex-1 flex flex-col overflow-hidden p-2 space-y-2">
          {/* Step Playback Toolbar */}
          <div className="bg-[#0b0f19] border border-[#1f293d] rounded p-2 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">{t.stepPlayback}:</span>
              <span className="text-cyan-400 font-bold">
                {currentStepIndex + 1} / {Math.max(stepByStepLogs.length, 1)}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex(Math.max(0, currentStepIndex - 1));
                }}
                disabled={currentStepIndex === 0}
                className="p-1 bg-[#1e293b] hover:bg-[#334155] disabled:opacity-40 text-slate-200 rounded"
                title={t.prevStep}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center space-x-1 px-2 py-1 rounded font-semibold transition-colors ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? t.pausePlay : t.autoPlay}</span>
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex(Math.min(stepByStepLogs.length - 1, currentStepIndex + 1));
                }}
                disabled={currentStepIndex >= stepByStepLogs.length - 1}
                className="p-1 bg-[#1e293b] hover:bg-[#334155] disabled:opacity-40 text-slate-200 rounded"
                title={t.nextStep}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Log Filters & Search Bar */}
          <div className="flex items-center space-x-2 font-mono text-xs">
            <div className="flex items-center bg-[#0b0f19] border border-[#1f293d] rounded px-2 py-1 flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <input
                type="text"
                placeholder="Search trace logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none w-full text-xs"
              />
            </div>

            <div className="flex items-center bg-[#0b0f19] border border-[#1f293d] rounded px-2 py-1">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="bg-transparent text-slate-300 focus:outline-none text-xs"
              >
                <option value="ALL" className="bg-[#111827]">
                  {t.allCategories}
                </option>
                <option value="ROOT" className="bg-[#111827]">
                  ROOT
                </option>
                <option value="COST" className="bg-[#111827]">
                  COST
                </option>
                <option value="ROLE" className="bg-[#111827]">
                  ROLE
                </option>
                <option value="BLOCK" className="bg-[#111827]">
                  BLOCK
                </option>
                <option value="ACTION" className="bg-[#111827]">
                  ACTION
                </option>
                <option value="LOOP" className="bg-[#111827]">
                  LOOP
                </option>
              </select>
            </div>
          </div>

          {/* Syslog Output Console (Auto-scrolled to Bottom) */}
          <div
            ref={logsContainerRef}
            className="flex-1 bg-[#0b0f19] border border-[#1f293d] rounded p-2 overflow-y-auto font-mono text-xs space-y-1.5"
          >
            {filteredLogs.length === 0 ? (
              <div className="text-slate-500 italic p-4 text-center">{t.noLogsYet}</div>
            ) : (
              filteredLogs.map((entry) => {
                let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
                if (entry.category === 'ROOT') badgeStyle = 'bg-amber-950 text-amber-300 border-amber-700';
                if (entry.category === 'ROLE') badgeStyle = 'bg-emerald-950 text-emerald-300 border-emerald-700';
                if (entry.category === 'COST') badgeStyle = 'bg-cyan-950 text-cyan-300 border-cyan-700';
                if (entry.category === 'ACTION') badgeStyle = 'bg-purple-950 text-purple-300 border-purple-700';
                if (entry.category === 'BLOCK' || entry.category === 'LOOP')
                  badgeStyle = 'bg-rose-950 text-rose-300 border-rose-700';

                const msg = lang === 'tr' ? entry.messageTr : entry.messageEn;

                return (
                  <div
                    key={entry.id}
                    onClick={() => onHighlightLog(entry.highlightSwitchId, entry.highlightLinkId)}
                    className="p-1.5 rounded hover:bg-[#1f293d]/50 cursor-pointer transition-colors border border-transparent hover:border-[#334155] flex items-start space-x-2 leading-relaxed"
                  >
                    <span className="text-slate-500 text-[10px] shrink-0 pt-0.5">{entry.timestamp}</span>
                    <span
                      className={`text-[9px] px-1 py-0.5 rounded border uppercase font-bold shrink-0 ${badgeStyle}`}
                    >
                      STP-{entry.category}
                    </span>
                    <span className="text-slate-200 text-[11px] font-mono break-all">{msg}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SWITCH & PORT TABLE */}
      {activeTab === 2 && (
        <div className="flex-1 overflow-y-auto p-2 space-y-4 font-mono text-xs">
          {/* Section 1: Switch Summary Table */}
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-2 pb-1 border-b border-[#1f293d]">
              <Server className="w-4 h-4" />
              <span>SWITCH MATRIX (BRIDGE IDs)</span>
            </div>

            <div className="overflow-x-auto border border-[#1f293d] rounded">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0b0f19] text-slate-400 border-b border-[#1f293d]">
                    <th className="p-2">{t.switchName}</th>
                    <th className="p-2">{t.priority}</th>
                    <th className="p-2">{t.macAddress}</th>
                    <th className="p-2">{t.rootPathCost}</th>
                    <th className="p-2">{t.role}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f293d] text-slate-200">
                  {Array.from(switches.values()).map((sw) => {
                    const isRoot = sw.id === rootSwitchId;
                    return (
                      <tr key={sw.id} className="hover:bg-[#1e293b]/40">
                        <td className="p-2 font-bold text-slate-100 flex items-center space-x-1">
                          {isRoot && <span className="text-amber-400">★</span>}
                          <span>{sw.name}</span>
                        </td>
                        <td className="p-2 text-amber-400 font-bold">{sw.priority}</td>
                        <td className="p-2 text-slate-400">{sw.mac}</td>
                        <td className="p-2 text-cyan-400">{isRoot ? '0 (ROOT)' : sw.rootPathCost}</td>
                        <td className="p-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isRoot
                                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {isRoot ? 'ROOT BRIDGE' : 'NON-ROOT'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Port Roles & States Table */}
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 font-bold mb-2 pb-1 border-b border-[#1f293d]">
              <Table className="w-4 h-4" />
              <span>PORT ROLES &amp; STATES TABLE</span>
            </div>

            <div className="overflow-x-auto border border-[#1f293d] rounded">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0b0f19] text-slate-400 border-b border-[#1f293d]">
                    <th className="p-2">{t.portName}</th>
                    <th className="p-2">{t.switchName}</th>
                    <th className="p-2">{t.portPriority}</th>
                    <th className="p-2">{t.role}</th>
                    <th className="p-2">{t.state}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f293d] text-slate-200">
                  {Array.from(ports.values()).map((p) => {
                    const sw = switches.get(p.switchId);
                    let roleBadge = 'bg-slate-800 text-slate-300';
                    if (p.role === 'ROOT') roleBadge = 'bg-emerald-950 text-emerald-300 border border-emerald-700';
                    if (p.role === 'DESIGNATED') roleBadge = 'bg-cyan-950 text-cyan-300 border border-cyan-700';
                    if (p.role === 'ALTERNATE') roleBadge = 'bg-amber-950 text-amber-300 border border-amber-700';

                    return (
                      <tr key={p.id} className="hover:bg-[#1e293b]/40">
                        <td className="p-2 font-bold">{p.name}</td>
                        <td className="p-2 text-slate-300">{sw?.name || 'N/A'}</td>
                        <td className="p-2 text-slate-400">{p.priority}.{p.portNumber}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${roleBadge}`}>
                            {p.role}
                          </span>
                        </td>
                        <td className="p-2 font-mono">
                          <span
                            className={
                              p.state === 'FORWARDING'
                                ? 'text-emerald-400 font-bold'
                                : 'text-amber-400 font-bold'
                            }
                          >
                            {p.state}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: MSTP Multi-Instance Framework Matrix */}
          {stpVersion === '802.1s' && (
            <div>
              <div className="flex items-center space-x-2 text-amber-400 font-bold mb-2 pb-1 border-b border-[#1f293d]">
                <Layers className="w-4 h-4" />
                <span>{t.mstpTitle}</span>
              </div>

              <div className="overflow-x-auto border border-[#1f293d] rounded">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0b0f19] text-slate-400 border-b border-[#1f293d]">
                      <th className="p-2">{t.mstpInstance}</th>
                      <th className="p-2">{t.vlansMapped}</th>
                      <th className="p-2">{t.instanceRoot}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f293d] text-slate-200">
                    {mstpInstances.map((inst) => {
                      const rootSw = switches.get(inst.rootSwitchId);
                      return (
                        <tr key={inst.instanceId} className="hover:bg-[#1e293b]/40">
                          <td className="p-2 font-bold text-amber-300">{inst.name}</td>
                          <td className="p-2 text-slate-300">{inst.vlans}</td>
                          <td className="p-2 text-cyan-400 font-bold">{rootSw?.name || inst.rootSwitchId}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TRAFFIC & FAILOVER SIMULATOR */}
      {activeTab === 3 && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4 font-mono text-xs">
          {/* Topology Metrics Cards */}
          <div className="space-y-2">
            <div className="text-cyan-400 font-bold pb-1 border-b border-[#1f293d] flex items-center space-x-1.5">
              <Activity className="w-4 h-4" />
              <span>{t.metricsTitle}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#0b0f19] border border-[#1f293d] p-2.5 rounded">
                <div className="text-slate-400 text-[10px] uppercase">{t.totalSwitches}</div>
                <div className="text-xl font-bold text-slate-100">{totalSwitches}</div>
              </div>

              <div className="bg-[#0b0f19] border border-[#1f293d] p-2.5 rounded">
                <div className="text-slate-400 text-[10px] uppercase">{t.totalLinks}</div>
                <div className="text-xl font-bold text-emerald-400">{activeLinks} Active</div>
              </div>

              <div className="bg-[#0b0f19] border border-[#1f293d] p-2.5 rounded">
                <div className="text-slate-400 text-[10px] uppercase">{t.activeLoopsBlocked}</div>
                <div className="text-xl font-bold text-amber-400">{blockedPorts} Ports</div>
              </div>

              <div className="bg-[#0b0f19] border border-[#1f293d] p-2.5 rounded">
                <div className="text-slate-400 text-[10px] uppercase">{t.rootSwitchId}</div>
                <div className="text-sm font-bold text-amber-400 truncate">
                  {switches.get(rootSwitchId || '')?.name || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Failover Simulator Section */}
          <div className="space-y-2">
            <div className="text-rose-400 font-bold pb-1 border-b border-[#1f293d] flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>{t.failoverTitle}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">{t.failoverDesc}</p>

            {/* List of links with instant Cut/Restore button */}
            <div className="space-y-1.5 pt-1">
              {Array.from(links.values()).map((link) => {
                const pA = ports.get(link.portAId);
                const pB = ports.get(link.portBId);
                const swA = switches.get(link.switchAId);
                const swB = switches.get(link.switchBId);

                const isDown = link.status === 'DOWN';

                return (
                  <div
                    key={link.id}
                    className="bg-[#0b0f19] border border-[#1f293d] p-2 rounded flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-200">
                        {swA?.name}:{pA?.name} &lt;--&gt; {swB?.name}:{pB?.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Speed: {link.speed} | Cost: {link.cost}
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleLinkStatus(link.id)}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                        isDown
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 hover:bg-emerald-900'
                          : 'bg-rose-950 text-rose-300 border border-rose-700 hover:bg-rose-900'
                      }`}
                    >
                      {isDown ? 'RESTORE (UP)' : 'CUT (DOWN)'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
