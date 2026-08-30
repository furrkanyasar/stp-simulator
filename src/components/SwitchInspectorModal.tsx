import React, { useState, useEffect } from 'react';
import { SwitchNode, Language } from '../core/types';
import { getTranslation } from '../core/i18n';
import { Settings, Trash2, X } from 'lucide-react';

interface SwitchInspectorModalProps {
  sw: SwitchNode | null;
  lang: Language;
  onClose: () => void;
  onSave: (updated: SwitchNode) => void;
  onDeleteSwitch: (switchId: string) => void;
}

const MAC_REGEX = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;

export const SwitchInspectorModal: React.FC<SwitchInspectorModalProps> = ({
  sw,
  lang,
  onClose,
  onSave,
  onDeleteSwitch,
}) => {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState(32768);
  const [mac, setMac] = useState('');
  const [macError, setMacError] = useState(false);

  useEffect(() => {
    if (sw) {
      setName(sw.name);
      setPriority(sw.priority);
      setMac(sw.mac);
      setMacError(false);
    }
  }, [sw]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (sw) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [sw, onClose]);

  if (!sw) return null;
  const t = getTranslation(lang);

  const priorityOptions = Array.from({ length: 16 }, (_, i) => i * 4096);

  const handleSave = () => {
    const sanitizedName = (name.trim() || sw.name).replace(/[<>&"']/g, '');
    const sanitizedMac = mac.trim() || sw.mac;
    // Validate MAC format (security + network correctness)
    if (!MAC_REGEX.test(sanitizedMac)) {
      setMacError(true);
      return;
    }
    setMacError(false);
    onSave({
      ...sw,
      name: sanitizedName,
      priority: Number(priority),
      mac: sanitizedMac,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-xs select-none"
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
            <span>{t.editSwitch}: {sw.name}</span>
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
              maxLength={32}
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

          {/* MAC Address with validation */}
          <div>
            <label className="block text-slate-400 mb-1">{t.macAddress}:</label>
            <input
              type="text"
              value={mac}
              onChange={(e) => { setMac(e.target.value); setMacError(false); }}
              placeholder="00:11:22:33:44:55"
              className={`w-full bg-[#0b0f19] border rounded px-3 py-1.5 text-slate-100 focus:outline-none font-mono ${
                macError ? 'border-rose-500 focus:border-rose-400' : 'border-[#1f293d] focus:border-cyan-500'
              }`}
            />
            {macError && (
              <p className="text-rose-400 text-[10px] mt-1 font-bold">
                ⚠️ {lang === 'tr' ? 'Geçersiz MAC formatı. XX:XX:XX:XX:XX:XX kullanın.' : 'Invalid MAC format. Use XX:XX:XX:XX:XX:XX.'}
              </p>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1f293d]">
          <button
            onClick={() => {
              onDeleteSwitch(sw.id);
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
