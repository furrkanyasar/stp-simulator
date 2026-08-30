import React, { useState, useRef, useEffect } from 'react';
import { SwitchNode, Port, LinkConnection, Language, LinkSpeed, STPVersion, CostStandard } from '../core/types';
import { getTranslation } from '../core/i18n';

const SHORT_COST: Record<LinkSpeed, number> = { '100G': 1, '40G': 1, '10G': 2, '1G': 4, '100M': 19, '10M': 100 };
const LONG_COST: Record<LinkSpeed, number> = { '100G': 200, '40G': 500, '10G': 2000, '1G': 20000, '100M': 200000, '10M': 2000000 };
function getLinkCostForDisplay(speed: LinkSpeed, standard: CostStandard): number {
  return standard === 'short' ? (SHORT_COST[speed] ?? 19) : (LONG_COST[speed] ?? 200000);
}
import { Crown, Network, Plug, Play, Pause, Sliders, ZoomIn, ZoomOut, RotateCcw, Scissors, Trash2, Cpu } from 'lucide-react';

interface TopologyCanvasProps {
  switches: Map<string, SwitchNode>;
  ports: Map<string, Port>;
  links: Map<string, LinkConnection>;
  rootSwitchId: string | null;
  lang: Language;
  stpVersion?: STPVersion;
  costStandard?: CostStandard;
  selectedSwitchId: string | null;
  onSelectSwitch: (id: string | null) => void;
  onUpdateSwitchPosition: (id: string, x: number, y: number) => void;
  onEditSwitch: (sw: SwitchNode) => void;
  onDeleteSwitch: (switchId: string) => void;
  onEditLink: (link: LinkConnection) => void;
  onToggleLinkStatus: (linkId: string) => void;
  onChangeLinkSpeed: (linkId: string, speed: LinkSpeed) => void;
  onDeleteLink: (linkId: string) => void;
  onConnectPorts: (portAId: string, portBId: string) => void;
  onDisconnectPort: (portId: string) => void;
  onAddPortToSwitch: (switchId: string) => string;
  wiringMode: boolean;
  setWiringMode: (val: boolean) => void;
  highlightLinkId?: string;
  highlightSwitchId?: string;
}

export const TopologyCanvas: React.FC<TopologyCanvasProps> = ({
  switches,
  ports,
  links,
  rootSwitchId,
  lang,
  stpVersion = '802.1w',
  costStandard = 'short',
  selectedSwitchId,
  onSelectSwitch,
  onUpdateSwitchPosition,
  onEditSwitch,
  onDeleteSwitch,
  onEditLink,
  onToggleLinkStatus,
  onChangeLinkSpeed,
  onDeleteLink,
  onConnectPorts,
  onDisconnectPort,
  onAddPortToSwitch,
  wiringMode,
  setWiringMode,
  highlightLinkId,
  highlightSwitchId,
}) => {
  const t = getTranslation(lang);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Zoom & Pan State
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Node Dragging State
  const [draggingSwitchId, setDraggingSwitchId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Wiring Wizard State
  const [wiringSourcePortId, setWiringSourcePortId] = useState<string | null>(null);
  const [wiringSourceSwitchId, setWiringSourceSwitchId] = useState<string | null>(null);
  const [portModalSwitchId, setPortModalSwitchId] = useState<string | null>(null);

  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [animateTraffic, setAnimateTraffic] = useState<boolean>(true);

  const getConnectedTargetInfo = (port: Port) => {
    if (!port.connectedLinkId) return null;
    const link = links.get(port.connectedLinkId);
    if (!link) return null;
    const otherPortId = link.portAId === port.id ? link.portBId : link.portAId;
    const otherPort = ports.get(otherPortId);
    if (!otherPort) return null;
    const otherSw = switches.get(otherPort.switchId);
    return `${otherSw?.name || 'SW'}:${otherPort.name}`;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoomLevel((prev) => Math.max(0.4, Math.min(2.2, Number((prev + zoomDelta).toFixed(2)))));
  };

  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (e.button === 0 && !draggingSwitchId) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseDownSwitch = (e: React.MouseEvent, sw: SwitchNode) => {
    e.stopPropagation();

    if (wiringMode) {
      setPortModalSwitchId(sw.id);
      return;
    }

    onSelectSwitch(sw.id);
    setSelectedLinkId(null);
    setDraggingSwitchId(sw.id);
    setDragOffset({
      x: (e.clientX - panOffset.x) / zoomLevel - sw.x,
      y: (e.clientY - panOffset.y) / zoomLevel - sw.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (wiringMode && wiringSourcePortId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const currentCanvasX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
      const currentCanvasY = (e.clientY - rect.top - panOffset.y) / zoomLevel;
      setMousePos({ x: currentCanvasX, y: currentCanvasY });
    }

    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggingSwitchId && !wiringMode) {
      const newX = (e.clientX - panOffset.x) / zoomLevel - dragOffset.x;
      const newY = (e.clientY - panOffset.y) / zoomLevel - dragOffset.y;
      onUpdateSwitchPosition(draggingSwitchId, Math.round(newX), Math.round(newY));
    }
  };

  // Global window listeners for drag & pan to prevent getting stuck when mouse leaves canvas
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setPanOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      } else if (draggingSwitchId && !wiringMode) {
        const newX = (e.clientX - panOffset.x) / zoomLevel - dragOffset.x;
        const newY = (e.clientY - panOffset.y) / zoomLevel - dragOffset.y;
        onUpdateSwitchPosition(draggingSwitchId, Math.round(newX), Math.round(newY));
      }
    };

    const handleGlobalMouseUp = () => {
      setIsPanning(false);
      setDraggingSwitchId(null);
    };

    if (isPanning || draggingSwitchId) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isPanning, draggingSwitchId, panStart, dragOffset, panOffset, zoomLevel, wiringMode, onUpdateSwitchPosition]);

  // Escape key listener to cleanly exit modal or cancel wiring mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setWiringSourcePortId(null);
        setWiringSourceSwitchId(null);
        setPortModalSwitchId(null);
        setSelectedLinkId(null);
        if (wiringMode) setWiringMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wiringMode, setWiringMode]);

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingSwitchId(null);
  };

  const getPortCoordinates = (port: Port) => {
    const sw = switches.get(port.switchId);
    if (!sw) return { x: 0, y: 0 };

    const swPorts = Array.from(ports.values()).filter((p) => p.switchId === sw.id);
    const portIndex = swPorts.findIndex((p) => p.id === port.id);

    const col = portIndex % 2;
    const row = Math.floor(portIndex / 2);

    const px = sw.x + (col === 0 ? 50 : 145);
    const py = sw.y + 76 + row * 26;
    return { x: px, y: py };
  };

  const handleSelectPortInModal = (portId: string) => {
    if (!wiringSourcePortId) {
      setWiringSourcePortId(portId);
      const port = ports.get(portId);
      if (port) setWiringSourceSwitchId(port.switchId);
      setPortModalSwitchId(null);
    } else {
      onConnectPorts(wiringSourcePortId, portId);
      setWiringSourcePortId(null);
      setWiringSourceSwitchId(null);
      setPortModalSwitchId(null);
    }
  };

  const resetView = () => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  const protocolBadgeText =
    stpVersion === '802.1D'
      ? '802.1D ⏱️ 30s'
      : stpVersion === '802.1w'
      ? '802.1w ⚡ 2s'
      : '802.1s 🌐 MST0';

  return (
    <div
      id="tour-step-canvas"
      ref={canvasRef}
      onMouseDown={handleMouseDownCanvas}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onClick={() => {
        onSelectSwitch(null);
        setSelectedLinkId(null);
      }}
      className={`relative w-full h-full bg-[#0b0f19] overflow-hidden select-none ${
        isPanning ? 'cursor-grabbing' : wiringMode ? 'cursor-crosshair' : 'cursor-grab'
      }`}
      style={{
        backgroundImage: 'radial-gradient(#1f293d 1px, transparent 1px)',
        backgroundSize: `${24 * zoomLevel}px ${24 * zoomLevel}px`,
        backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
      }}
    >
      {/* Top Banner Toolbar */}
      <div className="absolute top-2 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
        <div className="bg-[#111827]/95 border border-[#1f293d] backdrop-blur-sm px-3 py-1.5 rounded text-[11px] text-slate-300 font-mono flex items-center space-x-2 shadow-lg">
          {wiringMode ? (
            <Plug className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          ) : (
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span className="font-bold">
            {wiringMode
              ? wiringSourcePortId
                ? `${t.wiringStep2} (Source: ${ports.get(wiringSourcePortId)?.name})`
                : t.wiringStep1
              : `MODE: ${protocolBadgeText} | ${t.wiringBannerOff}`}
          </span>
        </div>

        {/* Controls Toolbar */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <div className="flex items-center bg-[#111827] border border-[#1f293d] rounded p-0.5 font-mono text-xs text-slate-300 shadow-md">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(2))))}
              className="p-1 hover:bg-[#1e293b] text-slate-300 rounded"
              title={t.zoomOut}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="px-2 font-bold text-[11px] text-cyan-400">
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              onClick={() => setZoomLevel((prev) => Math.min(2.2, Number((prev + 0.1).toFixed(2))))}
              className="p-1 hover:bg-[#1e293b] text-slate-300 rounded"
              title={t.zoomIn}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={resetView}
              className="p-1 hover:bg-[#1e293b] text-slate-400 hover:text-slate-200 rounded border-l border-[#1f293d] ml-1"
              title={t.zoomReset}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <button
            id="tour-step-wiring"
            onClick={() => {
              setWiringMode(!wiringMode);
              setWiringSourcePortId(null);
              setWiringSourceSwitchId(null);
              setPortModalSwitchId(null);
            }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono border transition-all ${
              wiringMode
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-lg'
                : 'bg-[#111827] text-slate-300 border-[#1f293d] hover:border-slate-500'
            }`}
          >
            <Plug className="w-3.5 h-3.5" />
            <span>{wiringMode ? t.wiringModeOn : t.wiringModeOff}</span>
          </button>

          <button
            onClick={() => setAnimateTraffic(!animateTraffic)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono border transition-all ${
              animateTraffic
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-700/80'
                : 'bg-[#111827] text-slate-400 border-[#1f293d]'
            }`}
          >
            {animateTraffic ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{t.trafficSimulation}: {animateTraffic ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Scaled & Panned Canvas Viewport */}
      <div
        className="w-full h-full origin-top-left"
        style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})` }}
      >
        {/* SVG Links Layer (z-0 for lines) - overflow: visible ensures cables are never clipped */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-0" style={{ overflow: 'visible' }}>
          {Array.from(links.values()).map((link) => {
            const portA = ports.get(link.portAId);
            const portB = ports.get(link.portBId);
            if (!portA || !portB) return null;

            const coordA = getPortCoordinates(portA);
            const coordB = getPortCoordinates(portB);

            const isDown = link.status === 'DOWN';
            const isBlocked =
              portA.state === 'BLOCKING' ||
              portA.state === 'DISCARDING' ||
              portB.state === 'BLOCKING' ||
              portB.state === 'DISCARDING';
            const isHighlighted = link.id === highlightLinkId;

            const midX = (coordA.x + coordB.x) / 2;
            const midY = (coordA.y + coordB.y) / 2;

            let strokeColor = '#38bdf8';
            let strokeDasharray = 'none';

            if (isDown) {
              strokeColor = '#ef4444';
              strokeDasharray = '6 6';
            } else if (isBlocked) {
              strokeColor = '#f59e0b';
              strokeDasharray = '8 6';
            }

            const computedCost = getLinkCostForDisplay(link.speed, costStandard);
            const effectiveCost = (link.customCost !== undefined && link.customCost > 0)
              ? link.customCost
              : computedCost;
            const displayCostText = isDown
              ? 'DOWN'
              : `COST: ${effectiveCost.toLocaleString('tr-TR')}`;

            return (
              <g key={link.id} className="pointer-events-auto cursor-pointer">
                <line
                  x1={coordA.x}
                  y1={coordA.y}
                  x2={coordB.x}
                  y2={coordB.y}
                  stroke={isHighlighted ? '#eab308' : strokeColor}
                  strokeWidth={isHighlighted ? 4 : isDown ? 3.5 : 3}
                  strokeDasharray={strokeDasharray}
                  className="transition-colors hover:stroke-cyan-300"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    onEditLink(link);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEditLink(link);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLinkId(selectedLinkId === link.id ? null : link.id);
                  }}
                />

                {animateTraffic && !isDown && !isBlocked && (
                  <circle r="3.5" fill="#38bdf8" className="animate-ping">
                    <animateMotion
                      path={`M ${coordA.x} ${coordA.y} L ${coordB.x} ${coordB.y}`}
                      dur={`${
                        link.speed === '10G' ? '0.8s' : link.speed === '1G' ? '1.2s' : link.speed === '100M' ? '1.8s' : '2.5s'
                      }`}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Center Bandwidth/Cost Badge */}
                <g
                  transform={`translate(${midX}, ${midY})`}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    onEditLink(link);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLinkId(selectedLinkId === link.id ? null : link.id);
                  }}
                >
                  <rect
                    x="-42"
                    y="-10"
                    width="84"
                    height="20"
                    rx="4"
                    fill={isDown ? '#450a0a' : isBlocked ? '#451a03' : '#0f172a'}
                    stroke={isDown ? '#f87171' : isBlocked ? '#f59e0b' : (link.customCost ? '#f59e0b' : '#38bdf8')}
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill={isDown ? '#fca5a5' : isBlocked ? '#fde68a' : '#7dd3fc'}
                    fontSize="9.5"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    {displayCostText}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Cable Drag Line */}
          {wiringSourcePortId && (
            <g>
              {(() => {
                const startPort = ports.get(wiringSourcePortId);
                if (!startPort) return null;
                const startCoord = getPortCoordinates(startPort);
                return (
                  <line
                    x1={startCoord.x}
                    y1={startCoord.y}
                    x2={mousePos.x}
                    y2={mousePos.y}
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeDasharray="4 4"
                  />
                );
              })()}
            </g>
          )}
        </svg>

        {/* Switch Nodes Layer (z-10) */}
        {Array.from(switches.values()).map((sw) => {
          const isRoot = sw.id === rootSwitchId;
          const isSelected = sw.id === selectedSwitchId;
          const isHighlighted = sw.id === highlightSwitchId;
          const swPorts = Array.from(ports.values()).filter((p) => p.switchId === sw.id);

          return (
            <div
              key={sw.id}
              onMouseDown={(e) => handleMouseDownSwitch(e, sw)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onEditSwitch(sw);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEditSwitch(sw);
              }}
              className={`absolute z-10 w-[195px] bg-[#111827] border-2 rounded-lg shadow-2xl p-2.5 transition-shadow ${
                isRoot
                  ? 'border-amber-400 shadow-amber-950/50 ring-2 ring-amber-400/30'
                  : isSelected
                  ? 'border-cyan-400 shadow-cyan-950/50'
                  : isHighlighted
                  ? 'border-yellow-400 ring-2 ring-yellow-500/50'
                  : 'border-[#1f293d] hover:border-slate-500'
              }`}
              style={{
                left: `${sw.x}px`,
                top: `${sw.y}px`,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#1f293d]">
                <div className="flex items-center space-x-1.5">
                  {isRoot ? (
                    <span title="ROOT BRIDGE"><Crown className="w-4 h-4 text-amber-400 fill-amber-400/20" /></span>
                  ) : (
                    <Network className="w-4 h-4 text-cyan-400" />
                  )}
                  <span className="font-mono text-xs font-bold text-slate-100">{sw.name}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditSwitch(sw);
                    }}
                    className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded"
                    title={t.editSwitch}
                  >
                    <Sliders className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSwitch(sw.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded transition-colors"
                    title={t.deleteSwitch}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Protocol Badge & Metadata */}
              <div className="space-y-0.5 font-mono text-[10px] text-slate-400">
                <div className="flex justify-between items-center bg-[#0b0f19] px-1 py-0.5 rounded border border-[#1f293d] mb-1">
                  <span className="text-[9px] text-slate-400">MODE:</span>
                  <span className="text-[9px] font-bold text-cyan-400">{protocolBadgeText}</span>
                </div>
                <div className="flex justify-between">
                  <span>PRI:</span>
                  <span className="text-amber-400 font-bold">{sw.priority}</span>
                </div>
                <div className="flex justify-between truncate">
                  <span>MAC:</span>
                  <span className="text-slate-300 truncate">{sw.mac}</span>
                </div>
                <div className="flex justify-between border-t border-[#1f293d]/60 pt-0.5 mt-0.5">
                  <span>COST:</span>
                  <span className={isRoot ? 'text-amber-400 font-bold' : 'text-cyan-400 font-bold'}>
                    {isRoot ? '0 (ROOT)' : sw.rootPathCost === Infinity ? 'INF' : sw.rootPathCost}
                  </span>
                </div>
              </div>

              {/* Spacious 2-Column Port Grid Layout with Protocol-Specific Badges */}
              <div className="grid grid-cols-2 gap-1.5 mt-2 pt-1 border-t border-[#1f293d]">
                {swPorts.map((p) => {
                  let badgeBg = 'bg-slate-800 text-slate-300 border-slate-700';
                  let badgeText = p.role;

                  if (p.role === 'ROOT') {
                    badgeBg = 'bg-emerald-950 text-emerald-300 border-emerald-600 font-bold';
                    badgeText = stpVersion === '802.1s' ? 'RP-M0' : 'RP';
                  } else if (p.role === 'DESIGNATED') {
                    badgeBg = 'bg-cyan-950 text-cyan-300 border-cyan-600 font-bold';
                    badgeText = stpVersion === '802.1s' ? 'DP-M0' : 'DP';
                  } else if (p.role === 'ALTERNATE') {
                    badgeBg = 'bg-amber-950 text-amber-300 border-amber-600 font-bold';
                    badgeText =
                      stpVersion === '802.1D'
                        ? 'BLK'
                        : stpVersion === '802.1s'
                        ? 'AP-M0'
                        : 'DISC';
                  }

                  const isOccupied = Boolean(p.connectedLinkId);
                  const isWiringSelected = wiringSourcePortId === p.id;
                  const targetInfo = getConnectedTargetInfo(p);

                  return (
                    <div
                      key={p.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPortInModal(p.id);
                      }}
                      className={`flex items-center justify-between px-1.5 py-1 rounded border cursor-pointer transition-all relative ${badgeBg} ${
                        isWiringSelected ? 'ring-2 ring-amber-400 scale-105' : 'hover:scale-105'
                      }`}
                      title={`${p.name} | ${isOccupied ? `KABLO BAĞLI (➡️ ${targetInfo})` : t.portAvailable} | Mode: ${stpVersion} | Role: ${p.role}`}
                    >
                      <div className="flex items-center space-x-1 min-w-0 shrink-0">
                        <span
                          className={`w-2 h-2 rounded-full border border-[#0b0f19] shrink-0 ${
                            isOccupied ? 'bg-purple-500' : 'bg-sky-400 animate-pulse'
                          }`}
                        />
                        <span className="text-[9px] font-mono font-bold leading-none">{p.name}</span>
                      </div>
                      <span className="text-[8px] font-mono leading-none px-1 py-0.5 rounded bg-black/40 ml-1 shrink-0">
                        [{badgeText}]
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* High-Level Floating Cable Port Badges Overlay (z-20) - overflow: visible */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20" style={{ overflow: 'visible' }}>
          {Array.from(links.values()).map((link) => {
            const portA = ports.get(link.portAId);
            const portB = ports.get(link.portBId);
            if (!portA || !portB) return null;

            const coordA = getPortCoordinates(portA);
            const coordB = getPortCoordinates(portB);

            const dx = coordB.x - coordA.x;
            const dy = coordB.y - coordA.y;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;

            const offsetDist = Math.max(52, Math.min(len * 0.28, len * 0.38));

            const portPosA = { x: coordA.x + ux * offsetDist, y: coordA.y + uy * offsetDist };
            const portPosB = { x: coordB.x - ux * offsetDist, y: coordB.y - uy * offsetDist };

            return (
              <g key={`floating-proportional-badges-${link.id}`} className="pointer-events-auto">
                <g
                  transform={`translate(${portPosA.x}, ${portPosA.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditLink(link);
                  }}
                >
                  <rect
                    x="-22"
                    y="-9"
                    width="44"
                    height="18"
                    rx="4"
                    fill="#0f172a"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    className="shadow-xl"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="9.5"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    {portA.name}
                  </text>
                </g>

                <g
                  transform={`translate(${portPosB.x}, ${portPosB.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditLink(link);
                  }}
                >
                  <rect
                    x="-22"
                    y="-9"
                    width="44"
                    height="18"
                    rx="4"
                    fill="#0f172a"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    className="shadow-xl"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="9.5"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    {portB.name}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Centered Port Selector Modal Overlay */}
      {portModalSwitchId && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-xs"
          onClick={() => setPortModalSwitchId(null)}
        >
          <div
            className="bg-[#111827] border-2 border-amber-400 shadow-2xl rounded-xl p-4 w-full max-w-md space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#1f293d]">
              <span className="font-bold text-amber-400 text-sm">{t.selectPortTitle}</span>
              <button
                onClick={() => setPortModalSwitchId(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Array.from(ports.values())
                .filter((p) => p.switchId === portModalSwitchId)
                .map((p) => {
                  const isOccupied = Boolean(p.connectedLinkId);
                  const targetInfo = getConnectedTargetInfo(p);

                  return (
                    <div
                      key={p.id}
                      className={`p-2 rounded flex justify-between items-center text-xs border transition-colors ${
                        isOccupied
                          ? 'bg-purple-950/50 border-purple-800 text-purple-200'
                          : 'bg-slate-900 border-slate-700 text-slate-200 font-bold'
                      }`}
                    >
                      <button
                        onClick={() => handleSelectPortInModal(p.id)}
                        className="flex items-center space-x-2 flex-1 text-left"
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isOccupied ? 'bg-purple-400' : 'bg-sky-400'
                          }`}
                        />
                        <span className="text-sm font-bold">{p.name}</span>
                        {isOccupied ? (
                          <span className="text-[10px] font-bold text-purple-300 bg-purple-900/60 px-1.5 py-0.5 rounded border border-purple-700">
                            ➡️ {targetInfo}
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-sky-400">
                            ({t.portAvailable})
                          </span>
                        )}
                      </button>

                      {isOccupied && (
                        <button
                          onClick={() => {
                            onDisconnectPort(p.id);
                          }}
                          className="flex items-center space-x-1 px-2 py-1 bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-700 rounded text-[10px] font-bold transition-colors ml-2 shrink-0"
                          title={t.disconnectPort}
                        >
                          <Scissors className="w-3 h-3" />
                          <span>{t.disconnectPort}</span>
                        </button>
                      )}
                    </div>
                  );
                })}

              <button
                onClick={() => {
                  const newPortId = onAddPortToSwitch(portModalSwitchId);
                  handleSelectPortInModal(newPortId);
                }}
                className="w-full text-center py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 rounded font-bold text-xs transition-colors mt-2"
              >
                {t.addNewPort}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
