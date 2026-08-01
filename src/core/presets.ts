import { SwitchNode, Port, LinkConnection } from './types';

export interface TopologyPreset {
  id: string;
  nameEn: string;
  nameTr: string;
  descriptionEn: string;
  descriptionTr: string;
  switches: SwitchNode[];
  ports: Port[];
  links: LinkConnection[];
}

export const PRESET_TOPOLOGIES: TopologyPreset[] = [
  {
    id: 'p2p-2',
    nameEn: '2-Switch Direct Link (Point-to-Point)',
    nameTr: '2-Switch Direkt Bağlantı (Noktadan Noktaya)',
    descriptionEn: 'Basic 2-switch direct physical link without loops.',
    descriptionTr: 'Döngüsüz, temel 2 anahtarlı direkt fiziksel bağlantı.',
    switches: [
      { id: 'sw-1', name: 'SW-1', priority: 4096, mac: '00:11:22:00:00:01', vlan: 1, x: 260, y: 240, isRoot: false, rootPathCost: 0, rootPortId: null, designatedRootId: null },
      { id: 'sw-2', name: 'SW-2', priority: 32768, mac: '00:11:22:00:00:02', vlan: 1, x: 500, y: 240, isRoot: false, rootPathCost: 0, rootPortId: null, designatedRootId: null },
    ],
    ports: [
      { id: 'p2p-p1', name: 'Gi0/1', switchId: 'sw-1', priority: 128, portNumber: 1, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'p2p-link' },
      { id: 'p2p-p2', name: 'Gi0/1', switchId: 'sw-2', priority: 128, portNumber: 1, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'p2p-link' },
    ],
    links: [
      { id: 'p2p-link', switchAId: 'sw-1', portAId: 'p2p-p1', switchBId: 'sw-2', portBId: 'p2p-p2', speed: '1G', cost: 4, status: 'UP' },
    ],
  },
  {
    id: 'triangle',
    nameEn: '3-Switch Triangle (Classic Loop)',
    nameTr: '3-Switch Üçgen (Klasik Döngü)',
    descriptionEn: 'Standard 3-switch redundant loop topology. SW-1 priority 4096 acts as Root Bridge.',
    descriptionTr: 'Standart 3 anahtarlı yedekli döngü topolojisi. SW-1 önceliği 4096 olup Kök Köprü görevindedir.',
    switches: [
      { id: 'sw-1', name: 'SW-1', priority: 4096, mac: '00:11:22:00:00:01', vlan: 1, x: 380, y: 110, isRoot: false, rootPathCost: 0, rootPortId: null, designatedRootId: null },
      { id: 'sw-2', name: 'SW-2', priority: 32768, mac: '00:11:22:00:00:02', vlan: 1, x: 180, y: 380, isRoot: false, rootPathCost: 0, rootPortId: null, designatedRootId: null },
      { id: 'sw-3', name: 'SW-3', priority: 32768, mac: '00:11:22:00:00:03', vlan: 1, x: 580, y: 380, isRoot: false, rootPathCost: 0, rootPortId: null, designatedRootId: null },
    ],
    ports: [
      { id: 'sw1-p1', name: 'Gi0/1', switchId: 'sw-1', priority: 128, portNumber: 1, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'link-1-2' },
      { id: 'sw1-p2', name: 'Gi0/2', switchId: 'sw-1', priority: 128, portNumber: 2, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'link-1-3' },
      { id: 'sw2-p1', name: 'Gi0/1', switchId: 'sw-2', priority: 128, portNumber: 1, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'link-1-2' },
      { id: 'sw2-p2', name: 'Gi0/2', switchId: 'sw-2', priority: 128, portNumber: 2, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'link-2-3' },
      { id: 'sw3-p1', name: 'Gi0/1', switchId: 'sw-3', priority: 128, portNumber: 1, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'link-1-3' },
      { id: 'sw3-p2', name: 'Gi0/2', switchId: 'sw-3', priority: 128, portNumber: 2, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'link-2-3' },
    ],
    links: [
      { id: 'link-1-2', switchAId: 'sw-1', portAId: 'sw1-p1', switchBId: 'sw-2', portBId: 'sw2-p1', speed: '100M', cost: 19, status: 'UP' },
      { id: 'link-1-3', switchAId: 'sw-1', portAId: 'sw1-p2', switchBId: 'sw-3', portBId: 'sw3-p1', speed: '100M', cost: 19, status: 'UP' },
      { id: 'link-2-3', switchAId: 'sw-2', portAId: 'sw2-p2', switchBId: 'sw-3', portBId: 'sw3-p2', speed: '100M', cost: 19, status: 'UP' },
    ],
  },
  {
    id: 'ring-4',
    nameEn: '4-Switch Ring Topology',
    nameTr: '4-Switch Halka Topolojisi',
    descriptionEn: '4 switches connected in a closed ring loop.',
    descriptionTr: 'Kapalı halka şeklinde bağlı 4 anahtar topolojisi.',
    switches: [
      { id: 'sw-1', name: 'SW-CORE', priority: 4096, mac: '00:AA:BB:00:00:01', vlan: 1, x: 380, y: 90, isRoot: false, rootPathCost: 0, rootPortId: null, designatedRootId: null },
      { id: 'sw-2', name: 'SW-EAST', priority: 32768, mac: '00:AA:BB:00:00:02', vlan: 1, x: 580, y: 250, isRoot: false, rootPathCost: 0, rootPortId: null, designatedRootId: null },
      { id: 'sw-3', name: 'SW-SOUTH', priority: 32768, mac: '00:AA:BB:00:00:03', vlan: 1, x: 380, y: 410, isRoot: false, rootPathCost: 0, rootPortId: null, designatedRootId: null },
      { id: 'sw-4', name: 'SW-WEST', priority: 32768, mac: '00:AA:BB:00:00:04', vlan: 1, x: 180, y: 250, isRoot: false, rootPathCost: 0, rootPortId: null, designatedRootId: null },
    ],
    ports: [
      { id: 'r1-p1', name: 'Gi0/1', switchId: 'sw-1', priority: 128, portNumber: 1, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'r-l1' },
      { id: 'r1-p2', name: 'Gi0/2', switchId: 'sw-1', priority: 128, portNumber: 2, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'r-l4' },
      { id: 'r2-p1', name: 'Gi0/1', switchId: 'sw-2', priority: 128, portNumber: 1, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'r-l1' },
      { id: 'r2-p2', name: 'Gi0/2', switchId: 'sw-2', priority: 128, portNumber: 2, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'r-l2' },
      { id: 'r3-p1', name: 'Gi0/1', switchId: 'sw-3', priority: 128, portNumber: 1, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'r-l2' },
      { id: 'r3-p2', name: 'Gi0/2', switchId: 'sw-3', priority: 128, portNumber: 2, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'r-l3' },
      { id: 'r4-p1', name: 'Gi0/1', switchId: 'sw-4', priority: 128, portNumber: 1, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'r-l3' },
      { id: 'r4-p2', name: 'Gi0/2', switchId: 'sw-4', priority: 128, portNumber: 2, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'r-l4' },
    ],
    links: [
      { id: 'r-l1', switchAId: 'sw-1', portAId: 'r1-p1', switchBId: 'sw-2', portBId: 'r2-p1', speed: '1G', cost: 4, status: 'UP' },
      { id: 'r-l2', switchAId: 'sw-2', portAId: 'r2-p2', switchBId: 'sw-3', portBId: 'r3-p1', speed: '1G', cost: 4, status: 'UP' },
      { id: 'r-l3', switchAId: 'sw-3', portAId: 'r3-p2', switchBId: 'sw-4', portBId: 'r4-p1', speed: '1G', cost: 4, status: 'UP' },
      { id: 'r-l4', switchAId: 'sw-4', portAId: 'r4-p2', switchBId: 'sw-1', portBId: 'r1-p2', speed: '1G', cost: 4, status: 'UP' },
    ],
  },
  {
    id: 'mesh-5',
    nameEn: '5-Switch Enterprise Mesh (Dual Core)',
    nameTr: '5-Switch Kompleks Ağ (Dual Core Mesh)',
    descriptionEn: 'High availability 5-switch enterprise layout with redundant Core and Access layers.',
    descriptionTr: 'Core-1, Core-2 ve 3 Erişim anahtarından oluşan yüksek erişilebilir 5 anahtarlı ağ.',
    switches: [
      { id: 'c1', name: 'CORE-1', priority: 4096, mac: '00:CC:01:00:00:01', vlan: 1, x: 280, y: 100, isRoot: false, rootPathCost: 0, rootPortId: null, designatedRootId: null },
      { id: 'c2', name: 'CORE-2', priority: 8192, mac: '00:CC:02:00:00:02', vlan: 1, x: 500, y: 100, isRoot: false, rootPathCost: 0, rootPortId: null, designatedRootId: null },
      { id: 'a1', name: 'ACC-01', priority: 32768, mac: '00:CC:03:00:00:03', vlan: 1, x: 180, y: 380, isRoot: false, rootPathCost: 0, rootPortId: null, designatedRootId: null },
      { id: 'a2', name: 'ACC-02', priority: 32768, mac: '00:CC:04:00:00:04', vlan: 1, x: 380, y: 380, isRoot: false, rootPathCost: 0, rootPortId: null, designatedRootId: null },
      { id: 'a3', name: 'ACC-03', priority: 32768, mac: '00:CC:05:00:00:05', vlan: 1, x: 580, y: 380, isRoot: false, rootPathCost: 0, rootPortId: null, designatedRootId: null },
    ],
    ports: [
      { id: 'c1-p0', name: 'Te0/1', switchId: 'c1', priority: 128, portNumber: 1, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'l-c1c2' },
      { id: 'c2-p0', name: 'Te0/1', switchId: 'c2', priority: 128, portNumber: 1, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'l-c1c2' },
      { id: 'c1-pa1', name: 'Gi0/1', switchId: 'c1', priority: 128, portNumber: 2, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'l-c1a1' },
      { id: 'c1-pa2', name: 'Gi0/2', switchId: 'c1', priority: 128, portNumber: 3, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'l-c1a2' },
      { id: 'c1-pa3', name: 'Gi0/3', switchId: 'c1', priority: 128, portNumber: 4, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'l-c1a3' },
      { id: 'c2-pa1', name: 'Gi0/1', switchId: 'c2', priority: 128, portNumber: 2, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'l-c2a1' },
      { id: 'c2-pa2', name: 'Gi0/2', switchId: 'c2', priority: 128, portNumber: 3, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'l-c2a2' },
      { id: 'c2-pa3', name: 'Gi0/3', switchId: 'c2', priority: 128, portNumber: 4, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'l-c2a3' },
      { id: 'a1-pc1', name: 'Gi0/1', switchId: 'a1', priority: 128, portNumber: 1, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'l-c1a1' },
      { id: 'a1-pc2', name: 'Gi0/2', switchId: 'a1', priority: 128, portNumber: 2, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'l-c2a1' },
      { id: 'a2-pc1', name: 'Gi0/1', switchId: 'a2', priority: 128, portNumber: 1, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'l-c1a2' },
      { id: 'a2-pc2', name: 'Gi0/2', switchId: 'a2', priority: 128, portNumber: 2, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'l-c2a2' },
      { id: 'a3-pc1', name: 'Gi0/1', switchId: 'a3', priority: 128, portNumber: 1, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'l-c1a3' },
      { id: 'a3-pc2', name: 'Gi0/2', switchId: 'a3', priority: 128, portNumber: 2, role: 'DISABLED', state: 'DISABLED', connectedLinkId: 'l-c2a3' },
    ],
    links: [
      { id: 'l-c1c2', switchAId: 'c1', portAId: 'c1-p0', switchBId: 'c2', portBId: 'c2-p0', speed: '10G', cost: 2, status: 'UP' },
      { id: 'l-c1a1', switchAId: 'c1', portAId: 'c1-pa1', switchBId: 'a1', portBId: 'a1-pc1', speed: '1G', cost: 4, status: 'UP' },
      { id: 'l-c1a2', switchAId: 'c1', portAId: 'c1-pa2', switchBId: 'a2', portBId: 'a2-pc1', speed: '1G', cost: 4, status: 'UP' },
      { id: 'l-c1a3', switchAId: 'c1', portAId: 'c1-pa3', switchBId: 'a3', portBId: 'a3-pc1', speed: '1G', cost: 4, status: 'UP' },
      { id: 'l-c2a1', switchAId: 'c2', portAId: 'c2-pa1', switchBId: 'a1', portBId: 'a1-pc2', speed: '1G', cost: 4, status: 'UP' },
      { id: 'l-c2a2', switchAId: 'c2', portAId: 'c2-pa2', switchBId: 'a2', portBId: 'a2-pc2', speed: '1G', cost: 4, status: 'UP' },
      { id: 'l-c2a3', switchAId: 'c2', portAId: 'c2-pa3', switchBId: 'a3', portBId: 'a3-pc2', speed: '1G', cost: 4, status: 'UP' },
    ],
  },
];
