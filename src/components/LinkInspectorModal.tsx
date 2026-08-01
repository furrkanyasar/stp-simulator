import React, { useState, useEffect } from 'react';
import { LinkConnection, LinkSpeed, Language, STPVersion, CostStandard } from '../core/types';
import { getTranslation } from '../core/i18n';
import { Sliders, Activity, Power, Trash2, X, CheckCircle, Zap, Cpu, FileText } from 'lucide-react';

interface LinkInspectorModalProps {
  link: LinkConnection | null;
  onClose: () => void;
  onSave: (updatedLink: LinkConnection) => void;
  onDeleteLink: (linkId: string) => void;
  lang: Language;
  stpVersion?: STPVersion;
  costStandard?: CostStandard;
  onViewBPDU?: (linkId: string) => void;
}

export const LinkInspectorModal: React.FC<LinkInspectorModalProps> = ({
  link,
  onClose,
  onSave,
  onDeleteLink,
  lang,
  stpVersion = '802.1w',
  costStandard = 'short',
  onViewBPDU,
}) => {
  const t = getTranslation(lang);

  const [status, setStatus] = useState<'UP' | 'DOWN'>('UP');
  const [speed, setSpeed] = useState<LinkSpeed>('100M');
  const [customCostText, setCustomCostText] = useState<string>('');

  useEffect(() => {
    if (link) {
      setStatus(link.status || 'UP');
      setSpeed(link.speed || '100M');
      setCustomCostText(link.customCost !== undefined ? String(link.customCost) : '');
    }
  }, [link]);

  if (!link) return null;

  const handleSave = () => {
    const parsedCost = customCostText.trim() !== '' ? Number(customCostText) : undefined;
    // Security: validate isFinite to prevent Infinity/NaN injection
    const safeCost = parsedCost && isFinite(parsedCost) && parsedCost > 0 && parsedCost <= 200000000 ? Math.round(parsedCost) : undefined;
    onSave({
      ...link,
      status,
      speed,
      customCost: safeCost,
    });
    onClose();
  };

  const shortCosts: Record<LinkSpeed, number> = { '100G': 1, '40G': 1, '10G': 2, '1G': 4, '100M': 19, '10M': 100 };
  const longCosts: Record<LinkSpeed, number> = { '100G': 200, '40G': 500, '10G': 2000, '1G': 20000, '100M': 200000, '10M': 2000000 };

  const isLong = costStandard === 'long';
  const costsMap = isLong ? longCosts : shortCosts;

  const speedOptions: { value: LinkSpeed; label: string; cost: number }[] = [
    { value: '100G', label: '100 Gbps (IEEE 802.3ba)', cost: costsMap['100G'] },
    { value: '40G', label: '40 Gbps (IEEE 802.3ba)', cost: costsMap['40G'] },
    { value: '10G', label: '10 Gbps (10G Ultra Fiber)', cost: costsMap['10G'] },
    { value: '1G', label: '1 Gbps (Gigabit Ethernet)', cost: costsMap['1G'] },
    { value: '100M', label: '100 Mbps (Fast Ethernet)', cost: costsMap['100M'] },
    { value: '10M', label: '10 Mbps (Standard Ethernet)', cost: costsMap['10M'] },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 font-mono text-xs select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#111827] border-2 border-cyan-400 shadow-2xl rounded-xl p-4 w-full max-w-md space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-[#1f293d]">
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-cyan-950 border border-cyan-700 rounded text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <span className="font-bold text-cyan-400 text-sm">{t.inspectorTitleLink}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Protocol Banner Indicator */}
        <div className="flex items-center justify-between bg-[#0b0f19] px-2.5 py-1.5 rounded border border-[#1f293d]">
          <span className="text-[10px] text-slate-400 flex items-center space-x-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>Aktif Protokol Standardı:</span>
          </span>
          <span className="text-[10px] font-bold text-amber-400">
            {stpVersion} ({isLong ? 'Long 32-bit 802.1t' : 'Short 16-bit'})
          </span>
        </div>

        {/* Link Status Control (UP / DOWN) */}
        <div className="space-y-1.5">
          <label className="block text-slate-300 font-bold flex items-center space-x-1">
            <Power className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.linkStatus}:</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setStatus('UP')}
              className={`p-2 rounded border font-bold flex items-center justify-center space-x-1.5 transition-all ${
                status === 'UP'
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40'
                  : 'bg-[#0b0f19] border-[#1f293d] text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{t.linkUp}</span>
            </button>

            <button
              onClick={() => setStatus('DOWN')}
              className={`p-2 rounded border font-bold flex items-center justify-center space-x-1.5 transition-all ${
                status === 'DOWN'
                  ? 'bg-rose-950 border-rose-500 text-rose-300 ring-2 ring-rose-500/40 animate-pulse'
                  : 'bg-[#0b0f19] border-[#1f293d] text-slate-400 hover:text-slate-200'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{t.linkDown}</span>
            </button>
          </div>
        </div>

        {/* Bandwidth Speed Selector (Adapts to Active STP Protocol Standard) */}
        <div className="space-y-1.5">
          <label className="block text-slate-300 font-bold flex items-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.linkSpeed} ({stpVersion} Standardı):</span>
          </label>
          <select
            value={speed}
            onChange={(e) => setSpeed(e.target.value as LinkSpeed)}
            className="w-full bg-[#0b0f19] border border-[#1f293d] text-slate-100 font-bold p-2 rounded focus:outline-none focus:border-cyan-400"
          >
            {speedOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#111827] text-slate-200">
                {opt.label} ➡️ Path Cost: {opt.cost.toLocaleString('tr-TR')}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Path Cost Override */}
        <div className="space-y-1.5">
          <label className="block text-slate-300 font-bold flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t.customCost}:</span>
          </label>
          <input
            type="number"
            placeholder={`Örn: 50 (Varsayılan ${speed} maliyetini ezmek için)`}
            value={customCostText}
            onChange={(e) => setCustomCostText(e.target.value)}
            className="w-full bg-[#0b0f19] border border-[#1f293d] p-2 rounded text-amber-300 font-bold focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#1f293d] flex justify-between items-center">
          <button
            onClick={() => {
              onDeleteLink(link.id);
              onClose();
            }}
            className="flex items-center space-x-1 px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-700 rounded font-bold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.deleteLink}</span>
          </button>

          {onViewBPDU && link.status === 'UP' && (
            <button
              onClick={() => onViewBPDU(link.id)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-700 rounded font-bold transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>BPDU</span>
            </button>
          )}

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-slate-300 rounded font-bold"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
            >
              {t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
