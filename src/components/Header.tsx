import React from 'react';
import { STPVersion, CostStandard, Language } from '../core/types';
import { getTranslation } from '../core/i18n';
import { PRESET_TOPOLOGIES } from '../core/presets';
import { Activity, RefreshCw, PlusCircle, Trash2, Globe, Cpu, Layers, Plug, HelpCircle, Timer } from 'lucide-react';

interface HeaderProps {
  stpVersion: STPVersion;
  setStpVersion: (v: STPVersion) => void;
  costStandard: CostStandard;
  setCostStandard: (c: CostStandard) => void;
  lang: Language;
  setLang: (l: Language) => void;
  onSelectPreset: (presetId: string) => void;
  onRecalculate: () => void;
  onAddSwitch: () => void;
  onClearCanvas: () => void;
  onOpenHelp: () => void;
  onOpenTimers: () => void;
  wiringMode: boolean;
  setWiringMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  stpVersion,
  setStpVersion,
  costStandard,
  setCostStandard,
  lang,
  setLang,
  onSelectPreset,
  onRecalculate,
  onAddSwitch,
  onClearCanvas,
  onOpenHelp,
  onOpenTimers,
  wiringMode,
  setWiringMode,
}) => {
  const t = getTranslation(lang);

  const versionLabels: Record<STPVersion, string> = {
    '802.1D': t.stpClassic,
    '802.1w': t.stpRapid,
    '802.1s': t.stpMultiple,
  };

  return (
    <header className="h-[44px] bg-[#0d1322] border-b border-[#1f293d] flex items-center justify-between px-3 shrink-0 select-none text-xs text-slate-200">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-2 font-semibold tracking-wider text-cyan-400 shrink-0">
        <div className="p-1 bg-cyan-950/70 border border-cyan-800/80 rounded text-cyan-400">
          <Activity className="w-4 h-4" />
        </div>
        <span className="font-mono text-sm uppercase tracking-widest text-slate-100 font-bold">
          STP <span className="text-cyan-400 font-normal">Simulator</span>
        </span>
      </div>

      {/* Center Controls with Fixed Dimensions */}
      <div className="flex items-center space-x-3 shrink-0">
        {/* Wiring Mode Button */}
        <button
          onClick={() => setWiringMode(!wiringMode)}
          className={`flex items-center space-x-1.5 px-2.5 py-1 h-7 rounded font-mono text-[11px] border transition-all shrink-0 ${
            wiringMode
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 ring-2 ring-amber-400/50 animate-pulse'
              : 'bg-[#111827] text-slate-300 border-[#1f293d] hover:border-slate-500'
          }`}
        >
          <Plug className="w-3.5 h-3.5" />
          <span>{wiringMode ? t.wiringModeOn : t.wiringModeOff}</span>
        </button>

        {/* STP Version Selector with Explicit Protocol Names */}
        <div id="tour-step-version" className="flex items-center space-x-1 bg-[#111827] border border-[#1f293d] px-2 py-1 h-7 rounded shrink-0">
          <Cpu className="w-3.5 h-3.5 text-slate-400 mr-1" />
          <span className="text-[#94a3b8] font-mono mr-1 text-[11px]">{t.version}:</span>
          {(['802.1D', '802.1w', '802.1s'] as STPVersion[]).map((ver) => (
            <button
              key={ver}
              onClick={() => setStpVersion(ver)}
              className={`px-2 py-0.5 rounded font-mono text-[11px] h-5 flex items-center transition-colors shrink-0 ${
                stpVersion === ver
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
              }`}
            >
              {versionLabels[ver]}
            </button>
          ))}
        </div>

        {/* Cost Standard Toggle */}
        <div className="flex items-center space-x-1 bg-[#111827] border border-[#1f293d] px-2 py-1 h-7 rounded shrink-0">
          <span className="text-[#94a3b8] font-mono mr-1 text-[11px]">{t.costStandard}:</span>
          <button
            onClick={() => setCostStandard('short')}
            className={`px-2 py-0.5 rounded font-mono text-[11px] h-5 flex items-center transition-colors shrink-0 ${
              costStandard === 'short'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
            }`}
          >
            Short
          </button>
          <button
            onClick={() => setCostStandard('long')}
            className={`px-2 py-0.5 rounded font-mono text-[11px] h-5 flex items-center transition-colors shrink-0 ${
              costStandard === 'long'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
            }`}
          >
            Long
          </button>
        </div>

        {/* Presets Selector */}
        <div className="flex items-center space-x-1 bg-[#111827] border border-[#1f293d] px-2 py-1 h-7 rounded shrink-0">
          <Layers className="w-3.5 h-3.5 text-slate-400 mr-1" />
          <select
            onChange={(e) => {
              if (e.target.value) onSelectPreset(e.target.value);
            }}
            defaultValue=""
            className="bg-transparent text-slate-200 font-mono text-[11px] focus:outline-none cursor-pointer h-5"
          >
            <option value="" disabled>
              -- {t.presetTopologies} --
            </option>
            {PRESET_TOPOLOGIES.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#111827] text-slate-200">
                {lang === 'tr' ? p.nameTr : p.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2 shrink-0">
        <button
          id="tour-step-add-switch"
          onClick={onAddSwitch}
          className="flex items-center space-x-1 px-2.5 py-1 h-7 bg-emerald-600/80 hover:bg-emerald-600 text-emerald-50 rounded border border-emerald-500/50 font-medium transition-all text-[11px] shrink-0"
          title={t.addSwitch}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{t.addSwitch}</span>
        </button>

        <button
          onClick={onRecalculate}
          className="flex items-center space-x-1 px-2.5 py-1 h-7 bg-cyan-600 hover:bg-cyan-500 text-white rounded border border-cyan-400/50 font-medium transition-all text-[11px] shrink-0"
          title={t.recalculate}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t.recalculate}</span>
        </button>

        <button
          onClick={onClearCanvas}
          className="p-1 bg-[#1e293b] hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-[#334155] rounded transition-colors h-7 w-7 flex items-center justify-center shrink-0"
          title={t.clearCanvas}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Help & Interactive Tour Button */}
        <button
          onClick={onOpenHelp}
          className="flex items-center space-x-1 px-2.5 py-1 h-7 bg-amber-500/90 hover:bg-amber-500 text-slate-950 rounded border border-amber-400 font-bold transition-all text-[11px] shrink-0"
          title={t.helpButton}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{t.helpButton}</span>
        </button>

        <button
          onClick={onOpenTimers}
          className="flex items-center space-x-1 px-2 py-1 h-7 bg-violet-600/80 hover:bg-violet-600 text-violet-50 rounded border border-violet-500/50 font-medium transition-all text-[11px] shrink-0"
          title={lang === 'tr' ? 'STP Zamanlayıcıları' : 'STP Timers'}
        >
          <Timer className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center bg-[#111827] border border-[#1f293d] rounded p-0.5 h-7 shrink-0 ml-1">
          <Globe className="w-3 h-3 text-slate-400 ml-1 mr-1" />
          <button
            onClick={() => setLang('en')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono h-5 flex items-center ${
              lang === 'en' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('tr')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono h-5 flex items-center ${
              lang === 'tr' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TR
          </button>
        </div>
      </div>
    </header>
  );
};
