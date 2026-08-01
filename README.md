# STP Simulator - Kurumsal Ağ STP Yapılandırma, Görselleştirme ve Simülasyon Konsolu

> **Ağ Mühendisleri, Siber Güvenlik Uzmanları ve Ağ Öğrencileri İçin Gelişmiş Spanning Tree Protocol (STP/RSTP/MSTP) Görselleştirme, BPDU Analiz ve Failover Simülasyon Konsolu**

<img width="1916" height="927" alt="image" src="https://github.com/user-attachments/assets/a9a689d0-f71e-4d1c-871f-a46d7305187d" />


---

## Ne İşe Yarar ve Hangi Sorunları Çözer?

Spanning Tree Protokolü'nü (STP/RSTP/MSTP) yapılandırmak, kök köprü (Root Bridge) seçimlerini takip etmek ve tıkanan (blocked) portları manuel hesaplamak zaman alıcı, karmaşık ve hataya açıktır. 

`STP Simulator`, ağ mühendislerinin, güvenlik uzmanlarının ve öğrencilerin günlük işlerinde ve eğitimlerinde karşılaştığı şu temel sorunları çözer:

1. **Döngü (Loop) Riske Karşı Kök Köprü Hesaplamalarını Otomatikleştirir:**  
   Alt katman ağ anahtarlarında (Switch) oluşabilecek broadcast fırtınalarını ve döngüleri engellemek için en düşük Bridge ID (`Öncelik + MAC`) mantığıyla Kök Köprü (`Root Bridge 👑`) seçimini anında bit düzeyinde doğru hesaplar.
2. **Port Rollerini ve Durumlarını Görselleştirir:**  
   Kök Port (`RP`), Atanmış Port (`DP`), Alternatif Port (`AP`) ve Yedek Port (`BP`) atamalarını renk kodlu ve canlı durumlarla (`FORWARDING`, `BLOCKING`, `DISCARDING`) tuval üzerinde gösterir.
3. **Canlı Trafik Kesintisi ve Rota Değişimi (Failover) Simülasyonu Sağlar:**  
   Fiziksel kablo kopmasını simüle etmek için herhangi bir kabloya çift tıklayıp `HAT KESİK (Shutdown / DOWN)` yapabilir; engellenmiş Alternatif Portların (`AP`) anında trafiği devralışını izleyebilirsiniz.
4. **BPDU Paket Çerçeve İncelemesi (BPDU Frame Inspector):**  
   Hatlar üzerinden geçen simüle edilmiş IEEE 802.1D Configuration BPDU paket detaylarını (`Root Bridge ID`, `Root Path Cost`, `Sender Bridge ID`, `Sender Port Priority`, `Max Age`, `Hello Time`, `Forward Delay`) canlı incelemenizi sağlar.
5. **Çoklu Protokol Desteği (STP / RSTP / MSTP):**  
   IEEE 802.1D (STP Klasik ~30-50sn yakınsama), IEEE 802.1w (RSTP Hızlı ~2sn Proposal/Agreement el sıkışması) ve IEEE 802.1s (MSTP/CIST Çoklu VLAN) standartları arasında tek tıkla geçiş olanağı sunar.
6. **Dinamik Yol Maliyeti (Path Cost) ve STP Zamanlayıcı Kontrolleri:**  
   IEEE Short 16-bit ve Long 32-bit maliyet standartlarını (`10M` - `100G`) destekler. Zamanlayıcıları (`Max Age 6-40s`, `Hello 1-10s`, `Forward Delay 4-30s`) IEEE 802.1D kısıtlaması olan `2 × (Forward Delay - 1) ≥ Max Age` kuralına göre dinamik doğrular.

---

## Öne Çıkan Özellikler

- **🌐 802.1D / 802.1w / 802.1s Protokol Seçimi:** Klasik STP (30sn), RSTP (2sn P/A el sıkışması) ve MSTP (CIST/MST0) standartları arasında tek tıkla geçiş.
- **👑 Canlı Kök Köprü (Root Bridge) Seçim Motoru:** Bridge ID (Priority + MAC) ve Bellman-Ford en kısa yol hesaplaması.
- **🔥 Fiziksel Kablo Kesintisi & Failover:** Kablo kopmasında Alternatif Portların (AP) anında Kök/Designated porta dönüşerek trafiği devralması.
- **📊 BPDU Çerçeve Görüntüleyici:** Hat üzerindeki aktif BPDU paket başlıklarını (Root ID, Cost, Sender ID, Timers) canlı inceleme.
- **⏱️ STP Zamanlayıcı Kontrolü:** Max Age, Hello Time ve Forward Delay zamanlayıcılarını IEEE 802.1D kurallarına uygun dinamik doğrulama.
- **📋 Hazır Topolojiler & Tuval Kontrolü:** 2'li Direkt, 3'lü Üçgen, 4'lü Halka ve 5'li Şirket Mesh ağları; zoom & pan tuval araçları.
- **🗂️ Kategori Filtreli Syslog İzi:** ENGINE, ROOT, COST, ROLE, LOOP, BLOCK, FAILOVER, BPDU, TIMER kategorilerine göre anlık log akışı ve arama.
- **🌍 Türkçe / İngilizce Dil Desteği:** Arayüzün ve logların tek tıkla çift dilli kullanımı.

---

## İnternet Üzerinden Doğrudan Kullanım (GitHub Pages)

Uygulamayı bilgisayarınıza indirmeden, doğrudan internet tarayıcınızda kullanmak için canlı adrese tıklayabilirsiniz:

👉 **[https://furrkanyasar.github.io/stp-simulator/](https://furrkanyasar.github.io/stp-simulator/)**

---

## Bilgisayarınızda Nasıl Çalıştırırsınız?

Uygulamayı kendi bilgisayarınızda yerel olarak çalıştırmak isterseniz:

### Gerekli Gereksinimler
- Herhangi bir modern internet tarayıcısı (Google Chrome, Microsoft Edge, Mozilla Firefox vb.).
- Node.js (Yerel sunucu çalıştırmak için).

### Adım Adım Kurulum ve Çalıştırma

1. **Projeyi İndirin veya Klonlayın:**
   ```bash
   git clone https://github.com/furrkanyasar/stp-simulator.git
   cd stp-simulator
   ```

2. **Yerel Sunucuyu Başlatın:**
   ```bash
   node server.js
   ```

3. **Tarayıcıda Açın:**
   İnternet tarayıcınızda şu adrese gidin:
   ```text
   http://localhost:3000
   ```

---

## 🕹️ Uygulama Kontrolleri ve Buton Rehberi

Arayüzdeki temel kontrol araçları ve işlevleri:

- **🔌 Kablo Tak / Sök (Wiring Mode):** Bağlantı modunu açar. Önce kaynak porta, ardından hedef porta tıklayarak fiziksel kablo çekmenizi sağlar.
- **Sürüm (802.1D / 802.1w / 802.1s):** Aktif STP protokol standardını değiştirir. Yakınsama sürelerini ve port durumlarını anında günceller.
- **Maliyet Modeli (Short / Long):** IEEE 16-bit Short (100M=19, 1G=4) veya 32-bit Long (100M=200K, 1G=20K) yol maliyeti standartlarını belirler.
- **📋 Hazır Topolojiler:** 2-Switch Direkt, 3-Switch Üçgen, 4-Switch Halka ve 5-Switch Mesh ağ yapılarını tek tıkla tuvala yükler.
- **➕ Switch Ekle / 🗑️ Tümünü Temizle:** Tuvale varsayılan ayarlarda yeni bir anahtar ekler veya tüm topolojiyi sıfırlar.
- **Yardım & Tur:** Uygulamanın tüm özelliklerini adım adım anlatan 8 adımlı etkileşimli kullanım rehberini açar.
- **⏱️ Zamanlayıcılar (Timers):** Max Age (6-40s), Hello (1-10s) ve Forward Delay (4-30s) parametrelerini değiştirebileceğiniz kontrol penceresini açar.
- **TR / EN:** Uygulama arayüz dilini ve syslog mesajlarını anında Türkçe veya İngilizceye çevirir.
- **Kabloya Çift Tıklama:** Hat Düzenleyiciyi açar. Kablo hızını (100G, 40G, 10G, 1G, 100M, 10M) değiştirebilir, özel maliyet (Cost Override) girebilir, hat kopması (LINK DOWN) simüle edebilir veya yeşil **BPDU** butonuna basarak paket içeriğini görüntüleyebilirsiniz.
- **Switch'e Çift Tıklama:** Switch Düzenleyiciyi açar. Bridge Priority (0-61440, 4096 katları), MAC adresi ve anahtar adını değiştirmenize olanak tanır.

---

## Proje Dosya Yapısı

```text
stp-simulator/
├── index.html              # Ana HTML giriş ve bağımsız demo dosyası
├── app.html                # Bağımsız tarayıcı çalıştırıcısı
├── server.js               # Yerel HTTP sunucusu (Port 3000)
├── tsconfig.json           # TypeScript derleme ayarları
├── vite.config.ts          # Vite geliştirme ve derleme ayarları
├── package.json            # Proje bağımlılıkları ve scriptleri
├── README.md               # Proje dokümantasyonu
├── LICENSE                 # MIT Açık Kaynak Lisansı
├── preview.png             # Uygulama önizleme görseli
└── src/
    ├── App.tsx             # Ana uygulama durum yöneticisi ve yakınsama bağlayıcısı
    ├── main.tsx            # React uygulama giriş noktası
    ├── index.css           # Global CSS stilleri
    ├── components/
    │   ├── Header.tsx               # 44px navigasyon çubuğu, protokol ve zamanlayıcı butonları
    │   ├── TopologyCanvas.tsx       # Etkileşimli SVG topoloji tuvali (sürükle-bırak, zoom/pan)
    │   ├── SyslogPanel.tsx          # Kategori filtreli, aramalı anlık syslog konsolu
    │   ├── LinkInspectorModal.tsx   # Hat düzenleyici (hız, maliyet, durum, BPDU tetikleyici)
    │   ├── SwitchInspectorModal.tsx # Switch düzenleyici (öncelik, MAC adresi, ad)
    │   ├── BPDUViewerModal.tsx      # BPDU paket çerçeve inceleme penceresi
    │   ├── STPTimersModal.tsx       # STP Zamanlayıcı (Max Age, Hello, Fwd Delay) penceresi
    │   └── GuidedTourModal.tsx      # Etkileşimli 8 adımlı tur penceresi
    └── core/
        ├── types.ts                 # Temel TypeScript arayüzleri ve sabitler
        ├── costTable.ts             # IEEE Short 16-bit ve Long 32-bit maliyet tabloları
        ├── stpEngine.ts             # Bellman-Ford tabanlı STP yakınsama ve hesaplama motoru
        ├── presets.ts               # Hazır topoloji şablonları (2, 3, 4, 5 Switch)
        └── i18n.ts                  # Çoklu dil (TR/EN) sözlüğü
```

---

## Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır. Eğitim ve kurumsal ağ mühendisliği kullanımı için tamamen açık kaynaklıdır.

---

<details>
<summary><b>English Documentation (Click to expand)</b></summary>

<br>

# STP Simulator - Enterprise Network STP Configuration, Visualization & Simulation Console

> **Advanced Spanning Tree Protocol (STP/RSTP/MSTP) Visualization, Analysis, and Failover Simulation Console for Network Engineers, Cybersecurity Specialists, and Network Students**

<img width="1916" height="927" alt="image" src="https://github.com/user-attachments/assets/7b9f7e89-649a-4539-a0fe-48bd1cfc88ca" />

---

### What Does It Do and What Problems Does It Solve?

Configuring Spanning Tree Protocol (STP/RSTP/MSTP), tracking Root Bridge elections, and manually calculating blocked ports is time-consuming, complex, and error-prone.

`STP Simulator` solves the following core problems faced daily by network engineers, security specialists, and students:

1. **Automates Root Bridge Calculations and Eliminates Loops:**  
   Accurately calculates which switch will become the Root Bridge 👑 based on the lowest Bridge ID (`Priority + MAC`) to prevent Layer 2 switching loops and broadcast storms.
2. **Visualizes Port Roles and Operational States:**  
   Displays Root Port (`RP`), Designated Port (`DP`), Alternate Port (`AP`), and Backup Port (`BP`) assignments on an interactive SVG canvas with color-coded states (`FORWARDING`, `BLOCKING`, `DISCARDING`).
3. **Provides Live Link Failover Simulation:**  
   Double-click any cable to set `LINK DOWN (Shutdown)` to simulate physical cable cuts and observe Alternate Ports (`AP`) instantly unblock to maintain network flow.
4. **BPDU Frame Inspector:**  
   Allows live inspection of simulated IEEE 802.1D Configuration BPDU frames (`Root Bridge ID`, `Root Path Cost`, `Sender Bridge ID`, `Sender Port Priority`, `Max Age`, `Hello Time`, `Forward Delay`) passing across links.
5. **Multi-Protocol Support (STP / RSTP / MSTP):**  
   Provides seamless one-click toggling between IEEE 802.1D (Classic STP 30s convergence), IEEE 802.1w (RSTP 2s P/A handshake), and IEEE 802.1s (MSTP/CIST Multi-Instance).
6. **Dynamic Path Cost and STP Timers:**  
   Supports IEEE Short 16-bit and Long 32-bit cost standards across speeds from 10M to 100G. Enforces IEEE 802.1D timer bounds (`Max Age`, `Hello`, `Forward Delay`) with `2 × (Forward Delay - 1) ≥ Max Age` validation.

---

### Key Features

- **🌐 802.1D / 802.1w / 802.1s Selection:** Seamless toggle between Classic STP (30s), RSTP (2s P/A handshake), and MSTP (CIST/MST0).
- **👑 Live Root Bridge Election Engine:** Lowest Bridge ID (Priority + MAC) and Bellman-Ford shortest path computation.
- **🔥 Physical Cable Failure & Failover:** Instant unblocking of Alternate Ports (AP) into Root/Designated ports upon link shutdown.
- **📊 BPDU Frame Inspector:** Inspect simulated BPDU frame headers (Root ID, Cost, Sender ID, Timers) live with one click.
- **⏱️ STP Timers Control:** Dynamic validation of Max Age, Hello Time, and Forward Delay compliant with IEEE 802.1D rules.
- **📋 Preset Topologies & Canvas Controls:** 2-Switch Direct, 3-Switch Triangle, 4-Switch Ring, and 5-Switch Mesh topologies; zoom & pan canvas controls.
- **🗂️ Category-Filtered Syslog Trace:** Real-time logging searchable and filterable by ENGINE, ROOT, COST, ROLE, LOOP, BLOCK, FAILOVER, BPDU, and TIMER categories.
- **🌍 Bilingual Support:** Full interface and log translation in Turkish and English.

---

### Online Instant Usage (GitHub Pages)

Click below to use the application directly in your browser:

👉 **[https://furrkanyasar.github.io/stp-simulator/](https://furrkanyasar.github.io/stp-simulator/)**

---

### How to Run Locally on Your Computer

#### Prerequisites
- Any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, etc.).
- Node.js (to run local dev server).

#### Step-by-Step Installation and Usage

1. **Clone or Download Project:**
   ```bash
   git clone https://github.com/furrkanyasar/stp-simulator.git
   cd stp-simulator
   ```

2. **Start Local Server:**
   ```bash
   node server.js
   ```

3. **Open in Browser:**
   Navigate to the following address in your browser:
   ```text
   http://localhost:3000
   ```

---

### 🕹️ Application Controls & Toolbar Guide

- **🔌 Connect / Disconnect Cable (Wiring Mode):** Activates port-to-port wiring. Click source port, then click target port to draw a cable.
- **Version (802.1D / 802.1w / 802.1s):** Switches the active STP protocol standard and updates convergence timers immediately.
- **Cost Model (Short / Long):** Selects IEEE 16-bit Short (100M=19, 1G=4) or 32-bit Long (100M=200K, 1G=20K) path cost computation.
- **📋 Presets:** Loads 2-Switch Direct, 3-Switch Triangle, 4-Switch Ring, or 5-Switch Mesh topologies.
- **➕ Add Switch / 🗑️ Clear All:** Adds a new switch to the canvas or resets the entire topology.
- **Help & Tour:** Launches the 8-step interactive guided tutorial explaining every feature.
- **⏱️ Timers:** Opens the STP timer configuration modal (Max Age, Hello, Forward Delay).
- **TR / EN:** Instantly switches the interface and log output between Turkish and English.
- **Double-Click Cable:** Opens Link Inspector to edit speed (100G to 10M), set custom cost overrides, simulate LINK DOWN, or view simulated BPDU frames via the green BPDU button.
- **Double-Click Switch:** Opens Switch Inspector to edit Bridge Priority (multiples of 4096), MAC address, and switch name.

---

### License

Distributed under the **MIT License**. Open-source for educational and professional network engineering use.

</details>
