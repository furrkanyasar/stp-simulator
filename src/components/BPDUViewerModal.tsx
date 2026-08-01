import React from 'react';
import { BPDUFrame, Language, LinkConnection, SwitchNode, Port } from '../core/types';
import { getTranslation } from '../core/i18n';
import { FileText, X } from 'lucide-react';

interface BPDUViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: LinkConnection | null;
  bpdu: BPDUFrame | null;
  switches: Map<string, SwitchNode>;
  ports: Map<string, Port>;
  lang: Language;
}

export const BPDUViewerModal: React.FC<BPDUViewerModalProps> = ({
  isOpen,
  onClose,
  link,
  bpdu,
  switches,
  ports,
  lang,
}) => {
  if (!isOpen || !link || !bpdu) return null;

  const t = getTranslation(lang);
  const pA = ports.get(link.portAId);
  const pB = ports.get(link.portBId);
  const swA = pA ? switches.get(pA.switchId) : null;
  const swB = pB ? switches.get(pB.switchId) : null;

  const linkLabel = `${swA?.name || '?'}:${pA?.name || '?'} ↔ ${swB?.name || '?'}:${pB?.name || '?'}`;

  const rows: [string, string, string][] = [
    ['Root Bridge ID', 'Kök Köprü ID', bpdu.rootBridgeId],
    ['Root Path Cost', 'Kök Yol Maliyeti', String(bpdu.rootPathCost)],
    ['Sender Bridge ID', 'Gönderici Köprü ID', bpdu.senderBridgeId],
    ['Sender Port ID', 'Gönderici Port ID', `${bpdu.senderPortPriority}.${bpdu.senderPortId}`],
    ['Message Age', 'Mesaj Yaşı', `${bpdu.messageAge}s`],
    ['Max Age', 'Maksimum Yaş', `${bpdu.maxAge}s`],
    ['Hello Time', 'Merhaba Süresi', `${bpdu.helloTime}s`],
    ['Forward Delay', 'İletim Gecikmesi', `${bpdu.forwardDelay}s`],
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 font-mono text-xs select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#111827] border-2 border-emerald-500 shadow-2xl rounded-xl p-4 w-full max-w-md space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-[#1f293d]">
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-emerald-950 border border-emerald-700 rounded text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-bold text-emerald-400 text-sm">BPDU Frame Viewer</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Link Label */}
        <div className="bg-[#0b0f19] px-2.5 py-1.5 rounded border border-[#1f293d] text-[10px] text-slate-400">
          <span className="text-emerald-400 font-bold">{lang === 'tr' ? 'Hat' : 'Link'}:</span>{' '}
          <span className="text-slate-200">{linkLabel}</span>
        </div>

        {/* BPDU Content Table */}
        <div className="bg-[#0b0f19] rounded border border-[#1f293d] overflow-hidden">
          <div className="bg-emerald-950/60 px-2.5 py-1 text-emerald-300 text-[10px] font-bold border-b border-[#1f293d]">
            IEEE 802.1D BPDU — Configuration BPDU (Type 0x00)
          </div>
          <table className="w-full text-[11px]">
            <tbody>
              {rows.map(([enLabel, trLabel, value], idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-[#0b0f19]' : 'bg-[#111827]'}>
                  <td className="px-2.5 py-1.5 text-slate-400 font-medium w-[45%]">
                    {lang === 'tr' ? trLabel : enLabel}
                  </td>
                  <td className="px-2.5 py-1.5 text-amber-300 font-bold font-mono">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#1f293d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-slate-300 rounded font-bold text-xs"
          >
            {lang === 'tr' ? 'Kapat' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
