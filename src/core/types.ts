export type STPVersion = '802.1D' | '802.1w' | '802.1s';
export type CostStandard = 'short' | 'long';
export type LinkSpeed = '10M' | '100M' | '1G' | '10G' | '40G' | '100G';
export type Language = 'en' | 'tr';

export type PortRole = 'ROOT' | 'DESIGNATED' | 'ALTERNATE' | 'BACKUP' | 'DISABLED' | 'RP-M0' | 'DP-M0' | 'BLK' | 'AP-M0' | 'DISC';
export type PortState = 'FORWARDING' | 'LEARNING' | 'LISTENING' | 'BLOCKING' | 'DISCARDING' | 'DISABLED';

/** IEEE 802.1D STP Timer parameters (controlled by Root Bridge) */
export interface STPTimers {
  maxAge: number;       // 6–40 seconds, default 20
  helloTime: number;    // 1–10 seconds, default 2
  forwardDelay: number; // 4–30 seconds, default 15
}

export const DEFAULT_STP_TIMERS: STPTimers = {
  maxAge: 20,
  helloTime: 2,
  forwardDelay: 15,
};

export interface SwitchNode {
  id: string;
  name: string;
  priority: number; // Increment of 4096 (e.g. 32768, 4096, 0)
  mac: string; // e.g. "00:50:56:A1:B2:C1"
  vlan: number; // default 1
  x: number;
  y: number;
  isRoot: boolean;
  rootPathCost: number;
  rootPortId: string | null;
  designatedRootId: string | null;
}

export interface Port {
  id: string; // e.g., "SW1-Port1"
  name: string; // e.g., "Gi0/1"
  switchId: string;
  priority: number; // 0 to 240 in steps of 16 (default 128)
  portNumber: number; // 1, 2, 3...
  role: PortRole;
  state: PortState;
  connectedLinkId: string | null;
  customCost?: number; // Manual override cost
}

export interface LinkConnection {
  id: string;
  switchAId: string;
  portAId: string;
  switchBId: string;
  portBId: string;
  speed: LinkSpeed;
  cost: number;
  status: 'UP' | 'DOWN';
  customCost?: number;
}

/** IEEE 802.1D BPDU (Bridge Protocol Data Unit) Frame */
export interface BPDUFrame {
  rootBridgeId: string;
  rootPathCost: number;
  senderBridgeId: string;
  senderPortId: string;
  senderPortPriority: number;
  messageAge: number;
  maxAge: number;
  helloTime: number;
  forwardDelay: number;
}

export interface SyslogEntry {
  id: string;
  timestamp: string;
  stepNumber?: number;
  category: 'ENGINE' | 'ROOT' | 'COST' | 'ROLE' | 'LOOP' | 'BLOCK' | 'FAILOVER' | 'ACTION' | 'BPDU' | 'TIMER';
  messageEn: string;
  messageTr: string;
  highlightSwitchId?: string;
  highlightLinkId?: string;
}

export interface MSTPInstance {
  instanceId: number;
  name: string;
  vlans: string;
  rootSwitchId: string;
}

export interface ConvergenceResult {
  switches: Map<string, SwitchNode>;
  ports: Map<string, Port>;
  links: Map<string, LinkConnection>;
  rootSwitchId: string | null;
  logs: SyslogEntry[];
  stepByStepLogs: SyslogEntry[][];
  bpduFrames: Map<string, BPDUFrame>; // linkId -> simulated BPDU
}
