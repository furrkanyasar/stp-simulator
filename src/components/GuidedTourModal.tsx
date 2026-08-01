import React, { useState } from 'react';
import { Language } from '../core/types';
import { getTranslation } from '../core/i18n';
import { Rocket, BookOpen, ChevronRight, ChevronLeft, CheckCircle, HelpCircle, X, Sliders, ShieldCheck } from 'lucide-react';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({ isOpen, onClose, lang }) => {
  const t = getTranslation(lang);
  const [activeTab, setActiveTab] = useState<'tour' | 'manual'>('tour');
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const tourSteps = [
    { title: t.tourStep1Title, desc: t.tourStep1Desc, tag: 'ENGINE' },
    { title: t.tourStep2Title, desc: t.tourStep2Desc, tag: 'COST' },
    { title: t.tourStep3Title, desc: t.tourStep3Desc, tag: 'CANVAS' },
    { title: t.tourStep4Title, desc: t.tourStep4Desc, tag: 'WIRING' },
    { title: t.tourStep5Title, desc: t.tourStep5Desc, tag: 'ROOT & PRIORITY' },
    { title: t.tourStep6Title, desc: t.tourStep6Desc, tag: 'PATH COST & SPEED' },
    { title: t.tourStep7Title, desc: t.tourStep7Desc, tag: 'BPDU LOGS' },
    { title: t.tourStep8Title, desc: t.tourStep8Desc, tag: 'FAILOVER SIMULATION' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-mono text-xs select-none"
      onClick={onClose}
    >
      <div
        className="bg-[#111827] border-2 border-amber-400 shadow-2xl rounded-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal Bar */}
        <div className="bg-[#0d1322] border-b border-[#1f293d] p-3 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-amber-500/20 border border-amber-400/60 rounded text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-400 tracking-wide">{t.helpTitle}</h2>
              <p className="text-[10px] text-slate-400">IEEE 802.1D / 802.1w / 802.1s Network Operating Center</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#0b0f19] border-b border-[#1f293d] px-3 shrink-0">
          <button
            onClick={() => setActiveTab('tour')}
            className={`flex items-center space-x-2 px-4 py-2.5 font-bold border-b-2 transition-all ${
              activeTab === 'tour'
                ? 'border-amber-400 text-amber-400 bg-[#111827]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>{t.tourTabTitle}</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center space-x-2 px-4 py-2.5 font-bold border-b-2 transition-all ${
              activeTab === 'manual'
                ? 'border-amber-400 text-amber-400 bg-[#111827]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.manualTabTitle}</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'tour' ? (
            <div className="space-y-4">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between bg-[#0b0f19] p-2 rounded border border-[#1f293d]">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  [{tourSteps[currentStep].tag}] {tourSteps[currentStep].title}
                </span>
                <span className="text-[10px] text-slate-400 font-bold bg-[#1e293b] px-2 py-0.5 rounded">
                  {currentStep + 1} / {tourSteps.length}
                </span>
              </div>

              {/* Step Card Content */}
              <div className="bg-[#0b0f19] border border-cyan-800/60 p-4 rounded-lg text-slate-200 leading-relaxed text-xs space-y-2">
                <p>{tourSteps[currentStep].desc}</p>
              </div>

              {/* Step Dots Bar */}
              <div className="flex items-center justify-center space-x-1.5 pt-2">
                {tourSteps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentStep ? 'w-6 bg-amber-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>

              {/* Tour Controls */}
              <div className="flex justify-between items-center pt-3 border-t border-[#1f293d]">
                <button
                  onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] disabled:opacity-30 rounded font-bold text-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t.prevTourStep}</span>
                </button>

                {currentStep < tourSteps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep((prev) => Math.min(tourSteps.length - 1, prev + 1))}
                    className="flex items-center space-x-1 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold"
                  >
                    <span>{t.nextTourStep}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="flex items-center space-x-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{t.finishTour}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* STP Manual & Operations Checklist Tab */
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
              <div className="bg-[#0b0f19] p-3 rounded-lg border border-[#1f293d] space-y-2">
                <h3 className="font-mono text-sm font-bold text-amber-400 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>STP Kök Köprü & Yol Maliyeti (Path Cost) Nedir?</span>
                </h3>
                <p>
                  Spanning Tree Protocol (STP), katman 2 Ethernet ağlarında sonsuz veri döngülerini (Broadcast Storm) önlemek için çalışır.
                  Ağdaki en düşük <strong>Bridge ID (BID = Priority + MAC)</strong> değerine sahip cihaz <strong>Kök Köprü (Root Bridge 👑)</strong> seçilir.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="bg-[#0b0f19] p-3 rounded border border-emerald-800/60 space-y-1">
                  <span className="font-bold text-emerald-400 uppercase">👑 Root Bridge Seçimi</span>
                  <p className="text-slate-300 text-[10px] leading-tight">
                    En düşük Priority (Varsayılan 32768, 4096'nın katları) ve en küçük MAC adresi kazanan olur.
                  </p>
                </div>

                <div className="bg-[#0b0f19] p-3 rounded border border-cyan-800/60 space-y-1">
                  <span className="font-bold text-cyan-400 uppercase">⚡ Path Cost & Hızlar</span>
                  <p className="text-slate-300 text-[10px] leading-tight">
                    10G = 2 Cost, 1G = 4 Cost, 100M = 19 Cost, 10M = 100 Cost. Kablo üzerine çift tıklayarak özel maliyet (Custom Cost) verebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="bg-[#0b0f19] p-3 rounded-lg border border-[#1f293d] space-y-2">
                <h4 className="font-mono text-xs font-bold text-cyan-400 flex items-center space-x-1">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Operatör İşlemleri ve Özellikler Rehberi</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                  <li><strong>Kablo Bağlama:</strong> 🔌 Kablo Tak modunu açıp sırayla 2 switch portuna tıklayın.</li>
                  <li><strong>Kablo Sökme:</strong> Port seçme ekranında kırmızı ✂️ Bağlantıyı Kaldır butonuna basın.</li>
                  <li><strong>Switch Silme:</strong> Switch başlığındaki 🗑️ çöp kutusuna tıklayın.</li>
                  <li><strong>Hat Maliyeti Değiştirme:</strong> Kablo üzerindeki 1G/100M etiketine çift tıklayıp özel maliyet verin.</li>
                  <li><strong>Hat Kesme Simülasyonu:</strong> Kabloya çift tıklayıp durumunu HAT KESİK (Shutdown) yapın.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
