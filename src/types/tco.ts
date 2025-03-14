export interface DriveConfig {
  drive: DriveData;
  results: TCOResults;
}

export interface DriveData {
  model: string;
  capacityTB: number;
  price: number;
  powerActiveW: number;
  powerIdleW: number;
  iopsQD1: number | null;
  iopsMaxRandomRead: number | null;
  bandwidthSequentialRead: number | null;
  bandwidthSequentialWrite: number | null;
  enduranceTBW: number | null;
  interface: string;
  afr: number;
}

export enum RackType {
  HDD = 'HDD',
  SSD = 'SSD'
}

export interface RackAttributes {
  rackType: RackType;
  rackCost: number;
  serverCost: number;
  jbodCost: number;
  jbofCost: number;
  switchCost: number;
  serverPower: number;
  jbodPower: number;
  jbofPower: number;
  switchPower: number;
  serverRU: number;
  jbodRU: number;
  jbofRU: number;
  switchRU: number;
  drivesPerServer: number;
  drivesPerJBOD: number;
  drivesPerJBOF: number;
  jbodsPerRack: number;
  jbofsPerRack: number;
  serversPerRack: number;
  utilityServerPerRack: number;
  rackUnits: number;
  serverRackUnits: number;
}

export interface FixedCosts {
  powerCostPerKWh: number;
  pue: number;
  maintenancePercentage: number;
  depreciationYears: number;
  networkCostPerMonth: number;
  softwareLicenseCostPerMonth: number;
  rackspaceAndCoolingPerMonth: number;
}

export interface WorkloadParams {
  /** Error encoding/replication factor (e.g., 2 for mirroring, 3 for triple replication) */
  replicationFactor: number;
  /** Overhead from RAID or erasure coding schemes */
  erasureCodingOverhead: number;
  /** Percentage of total storage device used out of total available capacity */
  utilizationTarget: number;
  /** Percentage of time the drive is active (affects power consumption) */
  dutyActivePercent: number;
  /** Data reduction ratio (e.g., 2.0 for 2:1 compression - increases effective capacity) */
  dataReductionRatio: number;
}

export interface TCOResults {
  capexResults: {
    drivesCost: number;
    serversCost: number;
    jbodsCost: number;
    infrastructureCost: number;
    totalCapex: number;
    capexPerMonth: number;
    capacityPerRack: number;
    rawCapacityPerRackPB: number;
  };
  opexResults: {
    powerMaxWatts: number;
    powerCost: number;
    replacementCostPerMonth: number;
    dataCenterCosts: number;
    totalOpex: number;
  };
  totalResults: {
    effectiveCapacityPerRackPB: number;
    tcoPerTBRawPerMonth: number;
    tcoPerTBEffectivePerMonth: number;
  };
}