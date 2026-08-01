import React, { useState } from 'react';
import { SwitchNode, Language } from '../core/types';
import { getTranslation } from '../core/i18n';
import { Settings, Trash2, X } from 'lucide-react';

interface SwitchModalProps {
  switchNode: SwitchNode | null;
  lang: Language;
  onClose: () => void;
  onSave: (updated: SwitchNode) => void;
  onDelete: (switchId: string) => void;
}

export const SwitchModal: React.FC<SwitchModalProps> = ({
  switchNode,
  lang,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!switchNode) return null;
  const t = getTranslation(lang);

  const [name, setName] = useState(switchNode.name);
  const [priority, setPriority] = useState(switchNode.priority);
  const [mac, setMac] = useState(switchNode.mac);

  const MAC_REGEX = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
  const priorityOptions = Array.from({ length: 16 }, (_, i) => i * 4096);

  const handleSave = () => {
    const sanitizedName = (name.trim() || switchNode.name).replace(/[<>&"']/g, '');
    const sanitizedMac = mac.trim() || switchNode.mac;
    // Validate MAC format
    if (!MAC_REGEX.test(sanitizedMac)) {
      alert('Invalid MAC address format. Use: XX:XX:XX:XX:XX:XX');
      return;
    }
    onSave({
      ...switchNode,
      name: sanitizedName,
      priority: Number(priority),
      mac: sanitizedMac,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 font-mono text-xs select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#111827] border border-[#1f293d] shadow-2xl rounded-xl w-full max-w-md p-4 space-y-4 text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#1f293d]">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
            <Settings className="w-4 h-4" />
            <span>{t.editSwitch}: {switchNode.name}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inputs Form */}
        <div className="space-y-3">
          {/* Switch Name */}
          <div>
            <label className="block text-slate-400 mb-1">{t.switchName}:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0b0f19] border border-[#1f293d] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* STP Priority Dropdown (Step 4096) */}
          <div>
            <label className="block text-slate-400 mb-1">
              {t.priority} (Increment of 4096):
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-[#1f293d] rounded px-3 py-1.5 text-amber-400 font-bold focus:outline-none focus:border-cyan-500 font-mono"
            >
              {priorityOptions.map((pri) => (
                <option key={pri} value={pri} className="bg-[#111827] text-slate-100">
                  {pri} {pri === 4096 ? '(Common Primary Root)' : pri === 32768 ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* MAC Address */}
          <div>
            <label className="block text-slate-400 mb-1">{t.macAddress}:</label>
            <input
              type="text"
              value={mac}
              onChange={(e) => setMac(e.target.value)}
              placeholder="00:11:22:33:44:55"
              className="w-full bg-[#0b0f19] border border-[#1f293d] rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1f293d]">
          <button
            onClick={() => {
              onDelete(switchNode.id);
              onClose();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.deleteSwitch}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-slate-300 rounded font-medium"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold transition-colors"
            >
              {t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
