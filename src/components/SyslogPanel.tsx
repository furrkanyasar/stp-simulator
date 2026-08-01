import React, { useRef, useEffect, useState } from 'react';
import { SyslogEntry, Language } from '../core/types';
import { getTranslation } from '../core/i18n';
import { Terminal, Filter, Search, ChevronDown } from 'lucide-react';

interface SyslogPanelProps {
  logs: SyslogEntry[];
  lang: Language;
}

const CATEGORY_COLORS: Record<string, string> = {
  ENGINE: 'text-cyan-400 bg-cyan-950/60 border-cyan-800',
  ROOT: 'text-amber-400 bg-amber-950/60 border-amber-800',
  COST: 'text-indigo-400 bg-indigo-950/60 border-indigo-800',
  ROLE: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
  LOOP: 'text-rose-400 bg-rose-950/60 border-rose-800',
  BLOCK: 'text-orange-400 bg-orange-950/60 border-orange-800',
  FAILOVER: 'text-red-400 bg-red-950/60 border-red-800',
  ACTION: 'text-sky-400 bg-sky-950/60 border-sky-800',
  BPDU: 'text-teal-400 bg-teal-950/60 border-teal-800',
  TIMER: 'text-violet-400 bg-violet-950/60 border-violet-800',
};

const ALL_CATEGORIES = ['ALL', 'ENGINE', 'ROOT', 'COST', 'ROLE', 'LOOP', 'BLOCK', 'FAILOVER', 'ACTION', 'BPDU', 'TIMER'];

export const SyslogPanel: React.FC<SyslogPanelProps> = ({ logs, lang }) => {
  const t = getTranslation(lang);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  const filteredLogs = logs.filter((log) => {
    if (filter !== 'ALL' && log.category !== filter) return false;
    if (searchTerm.trim()) {
      const msg = lang === 'tr' ? log.messageTr : log.messageEn;
      if (!msg?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs.length, autoScroll]);

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] border-l border-[#1f293d] select-none font-mono text-[11px]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0d1322] border-b border-[#1f293d] shrink-0">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">
            {lang === 'tr' ? 'Syslog İzi' : 'Syslog Trace'}
          </span>
          <span className="text-slate-500 text-[10px]">({filteredLogs.length}/{logs.length})</span>
        </div>
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`text-[10px] px-1.5 py-0.5 rounded border ${
            autoScroll
              ? 'text-emerald-400 border-emerald-700 bg-emerald-950/40'
              : 'text-slate-500 border-[#1f293d]'
          }`}
        >
          <ChevronDown className="w-3 h-3 inline" /> {autoScroll ? 'AUTO' : 'MANUAL'}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-1.5 px-2 py-1.5 bg-[#0d1322] border-b border-[#1f293d] shrink-0">
        <Filter className="w-3 h-3 text-slate-500 shrink-0" />
        <div className="flex flex-wrap gap-1">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                filter === cat
                  ? 'bg-cyan-600 text-white border-cyan-500'
                  : 'text-slate-500 border-[#1f293d] hover:text-slate-300 hover:border-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center px-2 py-1 bg-[#0b0f19] border-b border-[#1f293d] shrink-0">
        <Search className="w-3 h-3 text-slate-500 mr-1.5 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={lang === 'tr' ? 'Log ara...' : 'Search logs...'}
          className="w-full bg-transparent text-slate-200 text-[10px] focus:outline-none placeholder-slate-600"
        />
      </div>

      {/* Log Entries */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-slate-600 py-8 text-[10px]">
            {lang === 'tr' ? 'Henüz log yok...' : 'No logs yet...'}
          </div>
        ) : (
          filteredLogs.map((log, idx) => {
            const colors = CATEGORY_COLORS[log.category] || 'text-slate-400 bg-slate-900 border-slate-700';
            const msg = lang === 'tr' ? (log.messageTr || log.messageEn) : log.messageEn;
            return (
              <div
                key={log.id || idx}
                className="flex items-start space-x-1.5 p-1.5 rounded bg-[#111827]/50 hover:bg-[#111827] transition-colors"
              >
                {/* Step Badge */}
                {log.stepNumber !== undefined && (
                  <span className="text-[9px] text-slate-600 font-mono w-4 text-right shrink-0 pt-0.5">
                    {log.stepNumber}
                  </span>
                )}

                {/* Category Tag */}
                <span
                  className={`text-[8px] font-bold px-1 py-0.5 rounded border shrink-0 ${colors}`}
                >
                  {log.category}
                </span>

                {/* Timestamp */}
                <span className="text-[9px] text-slate-600 shrink-0 pt-0.5">
                  {log.timestamp}
                </span>

                {/* Message */}
                <span className="text-[10px] text-slate-300 leading-relaxed">
                  {msg}
                </span>
              </div>
            );
          })
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};
