import React, { useState, useEffect } from 'react';
import { STPTimers, Language } from '../core/types';
import { getTranslation } from '../core/i18n';
import { Timer, X, Save } from 'lucide-react';

interface STPTimersModalProps {
  isOpen: boolean;
  onClose: () => void;
  timers: STPTimers;
  onSave: (timers: STPTimers) => void;
  lang: Language;
}

export const STPTimersModal: React.FC<STPTimersModalProps> = ({
  isOpen,
  onClose,
  timers,
  onSave,
  lang,
}) => {
  const [maxAge, setMaxAge] = useState(timers.maxAge);
  const [helloTime, setHelloTime] = useState(timers.helloTime);
  const [forwardDelay, setForwardDelay] = useState(timers.forwardDelay);

  useEffect(() => {
    if (isOpen) {
      setMaxAge(timers.maxAge);
      setHelloTime(timers.helloTime);
      setForwardDelay(timers.forwardDelay);
    }
  }, [isOpen, timers]);

  if (!isOpen) return null;

  const t = getTranslation(lang);

  // IEEE 802.1D constraint: 2 * (fwd_delay - 1) >= max_age
  const isValid =
    maxAge >= 6 && maxAge <= 40 &&
    helloTime >= 1 && helloTime <= 10 &&
    forwardDelay >= 4 && forwardDelay <= 30 &&
    2 * (forwardDelay - 1) >= maxAge;

  const handleSave = () => {
    if (!isValid) return;
    onSave({ maxAge, helloTime, forwardDelay });
    onClose();
  };

  const timerFields: {
    label: string;
    labelTr: string;
    value: number;
    setter: (v: number) => void;
    min: number;
    max: number;
    unit: string;
    desc: string;
    descTr: string;
  }[] = [
    {
      label: 'Max Age',
      labelTr: 'Maksimum Yaş',
      value: maxAge,
      setter: setMaxAge,
      min: 6,
      max: 40,
      unit: 's',
      desc: 'How long a BPDU is stored before discard',
      descTr: 'BPDU atılmadan önce saklanma süresi',
    },
    {
      label: 'Hello Time',
      labelTr: 'Merhaba Süresi',
      value: helloTime,
      setter: setHelloTime,
      min: 1,
      max: 10,
      unit: 's',
      desc: 'Interval between Root Bridge BPDUs',
      descTr: 'Kök Köprüden BPDU gönderme aralığı',
    },
    {
      label: 'Forward Delay',
      labelTr: 'İletim Gecikmesi',
      value: forwardDelay,
      setter: setForwardDelay,
      min: 4,
      max: 30,
      unit: 's',
      desc: 'Time in Listening & Learning states',
      descTr: 'Listening ve Learning durumlarındaki bekleme',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 font-mono text-xs select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#111827] border-2 border-violet-500 shadow-2xl rounded-xl p-4 w-full max-w-md space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-[#1f293d]">
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-violet-950 border border-violet-700 rounded text-violet-400">
              <Timer className="w-4 h-4" />
            </div>
            <span className="font-bold text-violet-400 text-sm">
              {lang === 'tr' ? 'STP Zamanlayıcıları' : 'STP Timers'}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* IEEE Note */}
        <div className="bg-violet-950/30 px-2.5 py-1.5 rounded border border-violet-800/50 text-[10px] text-violet-300">
          {lang === 'tr'
            ? 'IEEE 802.1D uyumlu: Bu zamanlayıcılar Kök Köprü tarafından belirlenir ve BPDU ile dağıtılır.'
            : 'IEEE 802.1D compliant: These timers are set by the Root Bridge and distributed via BPDUs.'}
        </div>

        {/* Timer Controls */}
        <div className="space-y-3">
          {timerFields.map((field) => (
            <div key={field.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-bold text-[11px]">
                  {lang === 'tr' ? field.labelTr : field.label}
                </label>
                <span className="text-amber-400 font-bold text-sm">{field.value}{field.unit}</span>
              </div>
              <input
                type="range"
                min={field.min}
                max={field.max}
                value={field.value}
                onChange={(e) => field.setter(Number(e.target.value))}
                className="w-full h-1.5 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>{field.min}{field.unit}</span>
                <span className="text-slate-400 italic">{lang === 'tr' ? field.descTr : field.desc}</span>
                <span>{field.max}{field.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Convergence Info */}
        <div className="bg-[#0b0f19] px-2.5 py-2 rounded border border-[#1f293d] text-[10px]">
          <div className="flex justify-between text-slate-400">
            <span>{lang === 'tr' ? 'Toplam Yakınsama (802.1D)' : 'Total Convergence (802.1D)'}:</span>
            <span className="text-amber-400 font-bold">{forwardDelay * 2}s</span>
          </div>
          {!isValid && (
            <div className="mt-1.5 text-rose-400 font-bold">
              ⚠️ {lang === 'tr'
                ? 'IEEE 802.1D kuralı: 2×(Fwd Delay - 1) ≥ Max Age olmalı'
                : 'IEEE 802.1D rule: 2×(Fwd Delay - 1) ≥ Max Age required'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#1f293d] flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-slate-300 rounded font-bold"
          >
            {lang === 'tr' ? 'İptal' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`flex items-center space-x-1 px-4 py-1.5 rounded font-bold transition-colors ${
              isValid
                ? 'bg-violet-600 hover:bg-violet-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{lang === 'tr' ? 'Uygula' : 'Apply'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
