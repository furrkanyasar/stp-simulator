import { Language } from './types';

export interface Translations {
  appTitle: string;
  version: string;
  stpClassic: string;
  stpRapid: string;
  stpMultiple: string;
  costModel: string;
  shortCost: string;
  longCost: string;
  presets: string;
  recalculate: string;
  addSwitch: string;
  clearAll: string;
  clearCanvas?: string;
  presetTopologies?: string;
  costStandard?: string;
  wiringOn: string;
  wiringOff: string;
  wiringModeOn?: string;
  wiringModeOff?: string;
  wiringStep1: string;
  wiringStep2: string;
  wiringBannerOff: string;
  trafficFlow: string;
  stepPlayback: string;
  tabSyslog: string;
  tabTable: string;
  tabFailover: string;
  allCategories: string;
  rootBridge: string;
  rootPathCost: string;
  switchName: string;
  macAddress: string;
  priority: string;
  portPriority?: string;
  portName?: string;
  vlan: string;
  editSwitch: string;
  deleteSwitch: string;
  editLink: string;
  deleteLink: string;
  linkSpeed: string;
  customCost: string;
  linkStatus: string;
  linkUp: string;
  linkDown: string;
  role: string;
  state: string;
  cancel: string;
  save: string;
  selectPortTitle: string;
  addNewPort: string;
  disconnectPort: string;
  portOccupied: string;
  portAvailable: string;
  zoomIn: string;
  zoomOut: string;
  zoomReset: string;
  inspectorTitleSwitch: string;
  inspectorTitleLink: string;
  helpButton: string;
  helpTitle: string;
  startTour: string;
  finishTour: string;
  nextTourStep: string;
  prevStep?: string;
  nextStep?: string;
  pausePlay?: string;
  autoPlay?: string;
  noLogsYet?: string;
  mstpTitle?: string;
  mstpInstance?: string;
  vlansMapped?: string;
  instanceRoot?: string;
  metricsTitle?: string;
  totalSwitches?: string;
  totalLinks?: string;
  activeLoopsBlocked?: string;
  rootSwitchId?: string;
  failoverTitle?: string;
  failoverDesc?: string;
  trafficSimulation?: string;
  prevTourStep: string;

  // 8-Step Tour Translations
  tourStep1Title: string;
  tourStep1Desc: string;
  tourStep2Title: string;
  tourStep2Desc: string;
  tourStep3Title: string;
  tourStep3Desc: string;
  tourStep4Title: string;
  tourStep4Desc: string;
  tourStep5Title: string;
  tourStep5Desc: string;
  tourStep6Title: string;
  tourStep6Desc: string;
  tourStep7Title: string;
  tourStep7Desc: string;
  tourStep8Title: string;
  tourStep8Desc: string;

  manualTabTitle: string;
  tourTabTitle: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'STP Simulator',
    version: 'Version',
    stpClassic: '802.1D (STP)',
    stpRapid: '802.1w (RSTP)',
    stpMultiple: '802.1s (MSTP)',
    costModel: 'Cost Model',
    shortCost: 'Short (16-bit)',
    longCost: 'Long (32-bit)',
    presets: 'Presets Topology',
    recalculate: 'Recalculate',
    addSwitch: '+ Add Switch',
    clearAll: 'Clear All',
    wiringOn: 'WIRING MODE ON',
    wiringOff: '🔌 Connect Cable',
    wiringStep1: 'STEP 1: Click source switch to pick exit port.',
    wiringStep2: 'STEP 2: Click destination switch to attach cable.',
    wiringBannerOff: 'Click switch to inspect. Drag switch to move. Drag empty canvas background to pan view.',
    trafficFlow: 'Traffic Flow',
    stepPlayback: 'Step Playback',
    tabSyslog: 'BPDU LOG & TRACE',
    tabTable: 'SWITCH & PORT TABLE',
    tabFailover: 'TRAFFIC & FAILOVER',
    allCategories: 'All Categories',
    rootBridge: 'Root Bridge',
    rootPathCost: 'Root Path Cost',
    switchName: 'Switch Name',
    macAddress: 'MAC Address',
    priority: 'Bridge Priority (BID)',
    vlan: 'VLAN (System Ext)',
    editSwitch: 'Inspect Switch',
    deleteSwitch: 'Delete Switch',
    editLink: 'Inspect Link',
    deleteLink: 'Delete Link',
    linkSpeed: 'Bandwidth Speed',
    customCost: 'Custom Path Cost Override',
    linkStatus: 'Link State',
    linkUp: 'LINK UP (Operational)',
    linkDown: 'LINK DOWN (Shutdown / Severed)',
    role: 'Role',
    state: 'State',
    cancel: 'Cancel',
    save: 'Save Changes',
    selectPortTitle: 'SELECT PORT FOR CABLE',
    addNewPort: '+ Add New Port',
    disconnectPort: 'Disconnect Cable',
    portOccupied: 'CONNECTED',
    portAvailable: 'FREE / OPEN',
    zoomIn: 'Zoom In (+)',
    zoomOut: 'Zoom Out (-)',
    zoomReset: 'Reset View',
    inspectorTitleSwitch: 'PACKET TRACER INSPECTOR',
    inspectorTitleLink: 'LINK & PATH COST INSPECTOR',
    helpButton: 'Help & Tour',
    helpTitle: 'STP NOC Simulator Guide & Interactive Tour',
    startTour: '🚀 Start Interactive Guided Tour',
    finishTour: 'Finish Tour',
    nextTourStep: 'Next Step →',
    prevTourStep: 'Previous',
    prevStep: 'Previous',
    nextStep: 'Next',
    pausePlay: 'Pause',
    autoPlay: 'Auto Play',
    noLogsYet: 'No logs yet...',
    mstpTitle: 'MSTP Instances',
    mstpInstance: 'Instance',
    vlansMapped: 'VLANs Mapped',
    instanceRoot: 'Instance Root',
    metricsTitle: 'Topology Metrics',
    totalSwitches: 'Total Switches',
    totalLinks: 'Total Links',
    activeLoopsBlocked: 'Active Loops Blocked',
    rootSwitchId: 'Root Switch ID',
    failoverTitle: 'Failover Simulation',
    failoverDesc: 'Double click link to simulate cut',
    trafficSimulation: 'Traffic Flow',

    // 8-Step Tour Texts
    tourStep1Title: '1. STP Protocol Selector (802.1D / 802.1w / 802.1s)',
    tourStep1Desc: 'Switch between 802.1D (STP - Classic 30s convergence), 802.1w (RSTP - Rapid 2s convergence), and 802.1s (MSTP - Multiple VLAN instances). Each protocol uses different port states and convergence timers.',
    tourStep2Title: '2. Path Cost Standards (Short 16-bit vs Long 32-bit)',
    tourStep2Desc: 'Toggle between IEEE 802.1D Short Cost (10M=100, 100M=19, 1G=4, 10G=2, 40G=1, 100G=1) and IEEE 802.1t Long Cost (10M=2M, 100M=200K, 1G=20K, 10G=2K, 40G=500, 100G=200). Path costs update across all links in real time.',
    tourStep3Title: '3. Presets & Canvas Repositioning (2, 3, 4, 5 Switches)',
    tourStep3Desc: 'Load built-in topologies from the "Presets" menu (2-Switch Direct, 3-Switch Triangle, 4-Switch Ring, or 5-Switch Mesh). Click and drag any switch node or empty canvas background freely.',
    tourStep4Title: '4. Cable Wiring Wizard (Port-to-Port Wiring)',
    tourStep4Desc: 'Click "🔌 Connect Cable". Step 1: Click source switch and select exit port. Step 2: Click target switch and port to complete link wiring. Click ✂️ Disconnect to pull cables.',
    tourStep5Title: '5. Root Bridge Priority Inspector (lowest BID wins 👑)',
    tourStep5Desc: 'Double-click any switch card or click gear ⚙️ to edit Bridge Priority (0 to 61440 in steps of 4096), MAC address, and switch name. The switch with the lowest Bridge ID (Priority + MAC) is crowned Root Bridge.',
    tourStep6Title: '6. Path Cost & Bandwidth Inspector + STP Timers',
    tourStep6Desc: 'Double-click any cable to open the Link Inspector. Set Custom Path Cost Override or change Link Speed (100G, 40G, 10G, 1G, 100M, 10M). Click the ⏱ Timer button in the toolbar to adjust STP Timers (Max Age, Hello Time, Forward Delay) with IEEE 802.1D validation.',
    tourStep7Title: '7. BPDU Frame Viewer & Syslog Trace',
    tourStep7Desc: 'In the Link Inspector, click the green BPDU button to view the simulated BPDU frame (Root Bridge ID, Path Cost, Sender Bridge ID, Timers). Watch real-time convergence logs in the right Syslog panel with category filtering.',
    tourStep8Title: '8. Link Failover & Redundancy Simulation',
    tourStep8Desc: 'Double-click any cable and set Link Status to LINK DOWN (Shutdown) to simulate a physical cable cut! Watch Alternate Ports (AP) instantly unblock into Root/Designated Ports to restore network flow.',

    manualTabTitle: '📘 STP Crash Course & Operations Manual',
    tourTabTitle: '🚀 Interactive 8-Step Tour',
  },
  tr: {
    appTitle: 'STP Simulator',
    version: 'Sürüm',
    stpClassic: '802.1D (STP)',
    stpRapid: '802.1w (RSTP)',
    stpMultiple: '802.1s (MSTP)',
    costModel: 'Maliyet Modeli',
    shortCost: 'Kısa (16-bit)',
    longCost: 'Uzun (32-bit)',
    presets: 'Hazır Topolojiler',
    recalculate: 'Yeniden Hesapla',
    addSwitch: '+ Switch Ekle',
    clearAll: 'Tümünü Temizle',
    wiringOn: 'KABLO ÇEKME MODU AÇIK',
    wiringOff: '🔌 Kablo Tak',
    wiringStep1: 'ADIM 1: Çıkış portunu seçmek için kaynak anahtara tıklayın.',
    wiringStep2: 'ADIM 2: Kabloyu bağlamak için hedef anahtara tıklayın.',
    wiringBannerOff: 'İncelemek için anahtara tıklayın. Taşımak için sürükleyin. Görünümü kaydırmak için boş tuval alanını sürükleyin.',
    trafficFlow: 'Trafik Akışı',
    stepPlayback: 'Adım Adım Oynat',
    tabSyslog: 'BPDU LOG & İZLEME',
    tabTable: 'ANAHTAR & PORT TABLOSU',
    tabFailover: 'TRAFİK & YEDEKLEME',
    allCategories: 'Tüm Kategoriler',
    rootBridge: 'Kök Köprü (Root Bridge)',
    rootPathCost: 'Kök Yol Maliyeti',
    switchName: 'Anahtar Adı',
    macAddress: 'MAC Adresi',
    priority: 'Köprü Önceliği (BID)',
    vlan: 'VLAN (Sistem Uzantısı)',
    editSwitch: 'Anahtarı İncele / Düzenle',
    deleteSwitch: 'Anahtarı Sil',
    editLink: 'Bağlantıyı İncele / Düzenle',
    deleteLink: 'Bağlantıyı Sil',
    linkSpeed: 'Bant Genişliği Hızı',
    customCost: 'Özel Yol Maliyeti (Cost Override)',
    linkStatus: 'Hat Durumu',
    linkUp: 'HAT AKTİF (UP)',
    linkDown: 'HAT KESİK (DOWN / Shutdown)',
    role: 'Rol',
    state: 'Durum',
    cancel: 'İptal',
    save: 'Kaydet',
    selectPortTitle: 'KABLO İÇİN PORT SEÇİN',
    addNewPort: '+ Yeni Port Ekle',
    disconnectPort: 'Bağlantıyı Kaldır',
    portOccupied: 'KABLO BAĞLI',
    portAvailable: 'BOŞ PORT',
    zoomIn: 'Yakınlaştır (+)',
    zoomOut: 'Uzaklaştır (-)',
    zoomReset: 'Görünümü Sıfırla',
    inspectorTitleSwitch: 'PACKET TRACER DÜZENLEYİCİ',
    inspectorTitleLink: 'HAT & MALIYET DÜZENLEYİCİ',
    helpButton: 'Yardım & Tur',
    helpTitle: 'STP Visualizer Kullanım Rehberi & Adım Adım Tur',
    startTour: '🚀 Etkileşimli Adım Adım Turu Başlat',
    finishTour: 'Turu Bitir',
    nextTourStep: 'Sonraki Adım →',
    prevTourStep: '← Önceki',

    // 8-Step Tour Texts
    tourStep1Title: '1. STP Protokol Sürüm Seçimi (802.1D / 802.1w / 802.1s)',
    tourStep1Desc: '802.1D (STP - Klasik 30sn yakınsama), 802.1w (RSTP - Hızlı 2sn yakınsama) ve 802.1s (MSTP - Çoklu VLAN yapısı) arasında geçiş yapın. Her protokol farklı port durumları ve yakınsama zamanlayıcıları kullanır.',
    tourStep2Title: '2. Yol Maliyet Standartları (Kısa 16-bit vs Uzun 32-bit)',
    tourStep2Desc: 'IEEE 802.1D Kısa Maliyet (10M=100, 100M=19, 1G=4, 10G=2, 40G=1, 100G=1) ve IEEE 802.1t Uzun Maliyet (10M=2M, 100M=200K, 1G=20K, 10G=2K, 40G=500, 100G=200) arasında geçiş yapın. Maliyetler anında güncellenir.',
    tourStep3Title: '3. Hazır Topolojiler & Tuval Taşıma (2, 3, 4, 5 Switch)',
    tourStep3Desc: '"Hazır Topolojiler" menüsünden 2\'li Direkt, 3\'lü Üçgen, 4\'lü Halka veya 5\'li Mesh yapılarını yükleyin. Anahtarları veya tuval arka planını fareyle tutup serbestçe kaydırın.',
    tourStep4Title: '4. Kablo Bağlama Sihirbazı (Port-to-Port Kablolama)',
    tourStep4Desc: '"🔌 Kablo Tak" butonuna basın. Adım 1: Kaynak anahtara ve portuna tıklayın. Adım 2: Hedef anahtara ve portuna tıklayarak kabloyu bağlayın. Kabloları sökmek için ✂️ butonunu kullanın.',
    tourStep5Title: '5. Kök Köprü Öncelik Düzenleyicisi (En Düşük BID 👑)',
    tourStep5Desc: 'Herhangi bir anahtara çift tıklayarak veya ⚙️ ikonuna basarak Köprü Önceliğini (0 - 61440, 4096 katları), MAC adresini ve anahtar adını değiştirin. En düşük Bridge ID\'ye sahip olan anahtar Kök Köprü tacını kazanır.',
    tourStep6Title: '6. Yol Maliyeti & Bant Genişliği Düzenleyicisi + STP Zamanlayıcılar',
    tourStep6Desc: 'Herhangi bir kabloya çift tıklayarak Hat Düzenleyiciyi açın. Özel Yol Maliyeti girin veya Hız (100G, 40G, 10G, 1G, 100M, 10M) değiştirin. Araç çubuğundaki ⏱ Zamanlayıcı butonuyla STP Zamanlayıcılarını (Max Age, Hello, Forward Delay) IEEE 802.1D uyumlu ayarlayın.',
    tourStep7Title: '7. BPDU Çerçeve Görüntüleyici & Syslog İzi',
    tourStep7Desc: 'Hat Düzenleyicisinde yeşil BPDU butonuna tıklayarak simüle edilmiş BPDU çerçevesini (Root Bridge ID, Path Cost, Gönderici, Zamanlayıcılar) görüntüleyin. Sağ paneldeki Syslog izini kategori filtreleriyle takip edin.',
    tourStep8Title: '8. Hat Kesintisi Simülasyonu & Alternatif Rota (Failover)',
    tourStep8Desc: 'Bir kabloya çift tıklayıp Durumunu "HAT KESİK (Shutdown / DOWN)" yaparak fiziksel bir kablo kopmasını simüle edin! Engellenmiş olan Alternatif Portların (AP) anında Kök/Designated Porta dönüşerek trafiği kesintisiz sürdürdüğünü izleyin.',

    manualTabTitle: '📘 STP Rehberi & Kullanım El Kitabı',
    tourTabTitle: '🚀 Etkileşimli 8 Adımlı Tur',
  },
};

export const getTranslation = (lang: Language): Translations => {
  return translations[lang] || translations.en;
};
