import React from 'react';
import { STPVersion, CostStandard, Language } from '../core/types';
import { getTranslation } from '../core/i18n';
import { PRESET_TOPOLOGIES } from '../core/presets';
import { Activity, RefreshCw, PlusCircle, Trash2, Globe, Cpu, Layers, HelpCircle, Timer } from 'lucide-react';

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
}) => {
  const t = getTranslation(lang);

  return (
    <header className="h-[44px] bg-[#0d1322] border-b border-[#1f293d] flex items-center justify-between px-3 shrink-0 select-none text-xs text-slate-200 overflow-hidden">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-1.5 font-semibold tracking-wider text-cyan-400 shrink-0">
        <div className="p-1 bg-cyan-950/70 border border-cyan-800/80 rounded text-cyan-400">
          <Activity className="w-3.5 h-3.5" />
        </div>
        <span className="font-mono text-xs uppercase tracking-wider text-slate-100 font-bold">
          STP <span className="text-cyan-400 font-normal">Simulator</span>
        </span>
      </div>

      {/* Center Controls with Compact Spacing */}
      <div className="flex items-center space-x-1.5 shrink-0">
        {/* STP Version Selector */}
        <div id="tour-step-version" className="flex items-center space-x-1 bg-[#111827] border border-[#1f293d] px-1.5 py-0.5 h-7 rounded shrink-0">
          <Cpu className="w-3 h-3 text-slate-400 mr-0.5" />
          <span className="text-slate-400 font-mono text-[10px] mr-0.5">{t.version}:</span>
          {(
            [
              { ver: '802.1D', label: '802.1D', title: t.stpClassic },
              { ver: '802.1w', label: '802.1w (RSTP)', title: t.stpRapid },
              { ver: '802.1s', label: '802.1s (MSTP)', title: t.stpMultiple },
            ] as const
          ).map(({ ver, label, title }) => (
            <button
              key={ver}
              onClick={() => setStpVersion(ver)}
              title={title}
              className={`px-1.5 py-0.5 rounded font-mono text-[10px] h-5 flex items-center transition-colors shrink-0 ${
                stpVersion === ver
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Cost Standard Toggle */}
        <div className="flex items-center space-x-0.5 bg-[#111827] border border-[#1f293d] px-1.5 py-0.5 h-7 rounded shrink-0">
          <span className="text-slate-400 font-mono text-[10px] mr-1">{t.costStandard}:</span>
          <button
            onClick={() => setCostStandard('short')}
            className={`px-1.5 py-0.5 rounded font-mono text-[10px] h-5 flex items-center transition-colors shrink-0 ${
              costStandard === 'short'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
            }`}
          >
            Short
          </button>
          <button
            onClick={() => setCostStandard('long')}
            className={`px-1.5 py-0.5 rounded font-mono text-[10px] h-5 flex items-center transition-colors shrink-0 ${
              costStandard === 'long'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
            }`}
          >
            Long
          </button>
        </div>

        {/* Presets Selector */}
        <div className="flex items-center space-x-1 bg-[#111827] border border-[#1f293d] px-1.5 py-0.5 h-7 rounded shrink-0">
          <Layers className="w-3 h-3 text-slate-400" />
          <select
            onChange={(e) => {
              if (e.target.value) onSelectPreset(e.target.value);
            }}
            defaultValue=""
            className="bg-transparent text-slate-200 font-mono text-[10px] focus:outline-none cursor-pointer h-5 max-w-[130px]"
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
      <div className="flex items-center space-x-1.5 shrink-0">
        <button
          id="tour-step-add-switch"
          onClick={onAddSwitch}
          className="flex items-center space-x-1 px-2 py-0.5 h-7 bg-emerald-600/80 hover:bg-emerald-600 text-emerald-50 rounded border border-emerald-500/50 font-medium transition-all text-[11px] shrink-0"
          title={t.addSwitch}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{t.addSwitch}</span>
        </button>

        <button
          onClick={onRecalculate}
          className="flex items-center space-x-1 px-2 py-0.5 h-7 bg-cyan-600 hover:bg-cyan-500 text-white rounded border border-cyan-400/50 font-medium transition-all text-[11px] shrink-0"
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

        <button
          onClick={onOpenTimers}
          className="flex items-center space-x-1 px-2 py-0.5 h-7 bg-violet-600/80 hover:bg-violet-600 text-violet-50 rounded border border-violet-500/50 font-medium transition-all text-[11px] shrink-0"
          title={lang === 'tr' ? 'STP Zamanlayıcıları' : 'STP Timers'}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>{lang === 'tr' ? 'Zamanlayıcılar' : 'Timers'}</span>
        </button>

        {/* Help & Interactive Tour Button */}
        <button
          onClick={onOpenHelp}
          className="flex items-center space-x-1 px-2 py-0.5 h-7 bg-amber-500/90 hover:bg-amber-500 text-slate-950 rounded border border-amber-400 font-bold transition-all text-[11px] shrink-0"
          title={t.helpButton}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{t.helpButton}</span>
        </button>

        {/* Language Selector */}
        <div className="flex items-center bg-[#111827] border border-[#1f293d] rounded p-0.5 h-7 shrink-0">
          <Globe className="w-3 h-3 text-slate-400 ml-0.5 mr-0.5" />
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
