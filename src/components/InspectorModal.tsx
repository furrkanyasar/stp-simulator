import React, { useState } from 'react';
import { SwitchNode, Port, LinkConnection, Language, LinkSpeed } from '../core/types';
import { getTranslation } from '../core/i18n';
import { Sliders, Trash2, X, Activity, Server } from 'lucide-react';

interface InspectorModalProps {
  targetSwitch: SwitchNode | null;
  targetLink: LinkConnection | null;
  ports: Port[];
  switches: Map<string, SwitchNode>;
  lang: Language;
  onClose: () => void;
  onSaveSwitch: (updatedSw: SwitchNode, updatedPorts: Port[]) => void;
  onDeleteSwitch: (switchId: string) => void;
  onSaveLink: (updatedLink: LinkConnection) => void;
  onDeleteLink: (linkId: string) => void;
}

export const InspectorModal: React.FC<InspectorModalProps> = ({
  targetSwitch,
  targetLink,
  ports,
  switches,
  lang,
  onClose,
  onSaveSwitch,
  onDeleteSwitch,
  onSaveLink,
  onDeleteLink,
}) => {
  if (!targetSwitch && !targetLink) return null;
  const t = getTranslation(lang);

  // Switch form states
  const [swName, setSwName] = useState(targetSwitch?.name || '');
  const [swPriority, setSwPriority] = useState(targetSwitch?.priority || 32768);
  const [swMac, setSwMac] = useState(targetSwitch?.mac || '');
  const [swVlan, setSwVlan] = useState(targetSwitch?.vlan || 1);

  // Ports editing state
  const swPorts = targetSwitch ? ports.filter((p) => p.switchId === targetSwitch.id) : [];
  const [portsState, setPortsState] = useState<Port[]>(swPorts);

  // Link form states
  const [linkSpeed, setLinkSpeed] = useState<LinkSpeed>(targetLink?.speed || '100M');
  const [linkCustomCost, setLinkCustomCost] = useState<string>(targetLink?.customCost?.toString() || '');
  const [linkStatus, setLinkStatus] = useState<'UP' | 'DOWN'>(targetLink?.status || 'UP');

  const priorityOptions = Array.from({ length: 16 }, (_, i) => i * 4096);
  const portPriorityOptions = Array.from({ length: 16 }, (_, i) => i * 16);

  const handleSaveSwitch = () => {
    if (!targetSwitch) return;
    onSaveSwitch(
      {
        ...targetSwitch,
        name: swName.trim() || targetSwitch.name,
        priority: Number(swPriority),
        mac: swMac.trim() || targetSwitch.mac,
        vlan: Number(swVlan) || 1,
      },
      portsState
    );
    onClose();
  };

  const handleSaveLink = () => {
    if (!targetLink) return;
    const parsedCost = linkCustomCost.trim() ? Number(linkCustomCost) : undefined;
    onSaveLink({
      ...targetLink,
      speed: linkSpeed,
      customCost: parsedCost,
      status: linkStatus,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 font-mono text-xs select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#111827] border border-[#1f293d] shadow-2xl rounded-xl w-full max-w-lg p-4 space-y-4 text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#1f293d]">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
            <Sliders className="w-4 h-4" />
            <span>
              {targetSwitch
                ? `${t.inspectorTitleSwitch}: ${targetSwitch.name}`
                : `${t.inspectorTitleLink}: ${targetLink?.id}`}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SWITCH INSPECTOR MODE */}
        {targetSwitch && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="bg-[#0b0f19] border border-[#1f293d] p-3 rounded space-y-3">
              <div className="text-cyan-400 font-bold text-xs uppercase flex items-center space-x-1">
                <Server className="w-3.5 h-3.5" />
                <span>Switch Bridge ID &amp; Priority Overrides</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">{t.switchName}:</label>
                  <input
                    type="text"
                    value={swName}
                    onChange={(e) => setSwName(e.target.value)}
                    className="w-full bg-[#111827] border border-[#1f293d] rounded px-2.5 py-1 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">{t.vlan}:</label>
                  <input
                    type="number"
                    value={swVlan}
                    onChange={(e) => setSwVlan(Number(e.target.value))}
                    className="w-full bg-[#111827] border border-[#1f293d] rounded px-2.5 py-1 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  {t.priority} (Step 4096):
                </label>
                <select
                  value={swPriority}
                  onChange={(e) => setSwPriority(Number(e.target.value))}
                  className="w-full bg-[#111827] border border-[#1f293d] rounded px-2.5 py-1 text-amber-400 font-bold font-mono"
                >
                  {priorityOptions.map((pri) => (
                    <option key={pri} value={pri} className="bg-[#111827] text-slate-100">
                      {pri} {pri === 4096 ? '(Primary Root Candidate)' : pri === 32768 ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{t.macAddress}:</label>
                <input
                  type="text"
                  value={swMac}
                  onChange={(e) => setSwMac(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1f293d] rounded px-2.5 py-1 text-slate-100 font-mono"
                />
              </div>
            </div>

            {/* Per-Port Priority Overrides Table */}
            <div className="bg-[#0b0f19] border border-[#1f293d] p-3 rounded space-y-2">
              <div className="text-cyan-400 font-bold text-xs uppercase flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5" />
                <span>Port Priority &amp; Path Cost Overrides</span>
              </div>

              <div className="space-y-2">
                {portsState.map((port, idx) => (
                  <div
                    key={port.id}
                    className="bg-[#111827] border border-[#1f293d] p-2 rounded grid grid-cols-3 gap-2 items-center text-[11px]"
                  >
                    <div>
                      <span className="font-bold text-slate-100">{port.name}</span>
                      <span className="block text-[9px] text-slate-400">
                        {port.role} | {port.state}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-400">{t.portPriority} (Step 16):</label>
                      <select
                        value={port.priority}
                        onChange={(e) => {
                          const newPri = Number(e.target.value);
                          setPortsState((prev) =>
                            prev.map((p, i) => (i === idx ? { ...p, priority: newPri } : p))
                          );
                        }}
                        className="w-full bg-[#0b0f19] border border-[#1f293d] rounded px-1 py-0.5 text-slate-200 text-[10px]"
                      >
                        {portPriorityOptions.map((pri) => (
                          <option key={pri} value={pri} className="bg-[#111827]">
                            {pri} {pri === 128 ? '(Def)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-400">{t.customCost}:</label>
                      <input
                        type="number"
                        placeholder="Auto"
                        value={port.customCost || ''}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : undefined;
                          setPortsState((prev) =>
                            prev.map((p, i) => (i === idx ? { ...p, customCost: val } : p))
                          );
                        }}
                        className="w-full bg-[#0b0f19] border border-[#1f293d] rounded px-1 py-0.5 text-slate-200 text-[10px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1f293d]">
              <button
                onClick={() => {
                  onDeleteSwitch(targetSwitch.id);
                  onClose();
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.deleteSwitch}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-slate-300 rounded"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSaveSwitch}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LINK INSPECTOR MODE */}
        {targetLink && (
          <div className="space-y-4">
            <div className="bg-[#0b0f19] border border-[#1f293d] p-3 rounded space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">{t.linkSpeed}:</label>
                <select
                  value={linkSpeed}
                  onChange={(e) => setLinkSpeed(e.target.value as LinkSpeed)}
                  className="w-full bg-[#111827] border border-[#1f293d] rounded px-2.5 py-1 text-slate-100 font-mono"
                >
                  <option value="10M">10 Mbps (Cost: 100 / 2,000,000)</option>
                  <option value="100M">100 Mbps (Cost: 19 / 200,000)</option>
                  <option value="1G">1 Gbps (Cost: 4 / 20,000)</option>
                  <option value="10G">10 Gbps (Cost: 2 / 2,000)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{t.customCost}:</label>
                <input
                  type="number"
                  placeholder="e.g. 50 (Overrides standard bandwidth speed)"
                  value={linkCustomCost}
                  onChange={(e) => setLinkCustomCost(e.target.value)}
                  className="w-full bg-[#111827] border border-[#1f293d] rounded px-2.5 py-1 text-amber-300 font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">{t.linkStatus}:</label>
                <button
                  onClick={() => setLinkStatus(linkStatus === 'UP' ? 'DOWN' : 'UP')}
                  className={`w-full py-1.5 rounded font-bold transition-all ${
                    linkStatus === 'UP'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-rose-950 text-rose-300 border border-rose-700'
                  }`}
                >
                  {linkStatus === 'UP' ? t.linkUp : t.linkDown}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1f293d]">
              <button
                onClick={() => {
                  onDeleteLink(targetLink.id);
                  onClose();
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.deleteLink}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-slate-300 rounded"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSaveLink}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
