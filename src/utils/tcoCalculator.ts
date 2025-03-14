import { DriveData, RackAttributes, FixedCosts, WorkloadParams, TCOResults, RackType } from '../types/tco';

export function calculateTCO(
  drive: DriveData,
  rackAttributes: RackAttributes,
  fixedCosts: FixedCosts,
  workloadParams: WorkloadParams
): TCOResults {
  // Calculate raw capacity per drive in TB
  const rawCapacityPerDrive = drive.capacityTB;

  // Calculate number of drives per rack based on rack type
  const drivesPerRack = rackAttributes.rackType === RackType.HDD
    ? (rackAttributes.drivesPerServer * rackAttributes.serversPerRack) +
      (rackAttributes.drivesPerJBOD * rackAttributes.jbodsPerRack)
    : (rackAttributes.drivesPerServer * rackAttributes.serversPerRack) +
      (rackAttributes.drivesPerJBOF * rackAttributes.jbofsPerRack);

  // Calculate raw capacity per rack in PB
  const rawCapacityPerRackPB = (drivesPerRack * rawCapacityPerDrive) / 1024;

  // Calculate effective capacity per rack in PB
  const effectiveCapacityPerRackPB = rawCapacityPerRackPB *
    workloadParams.utilizationTarget /
    workloadParams.replicationFactor /
    workloadParams.erasureCodingOverhead *
    workloadParams.dataReductionRatio;

  // Calculate infrastructure costs
  const infrastructureCost = rackAttributes.rackType === RackType.HDD
    ? rackAttributes.rackCost +
      (rackAttributes.serverCost * rackAttributes.serversPerRack) +
      (rackAttributes.jbodCost * rackAttributes.jbodsPerRack) +
      (rackAttributes.switchCost * rackAttributes.utilityServerPerRack)
    : rackAttributes.rackCost +
      (rackAttributes.serverCost * rackAttributes.serversPerRack) +
      (rackAttributes.jbofCost * rackAttributes.jbofsPerRack) +
      (rackAttributes.switchCost * rackAttributes.utilityServerPerRack);

  // Calculate total drive cost
  const drivesCost = drive.price * drivesPerRack;

  // Calculate total CapEx
  const totalCapex = infrastructureCost + drivesCost;
  const capexPerMonth = totalCapex / (fixedCosts.depreciationYears * 12);

  // Calculate power consumption based on rack type
  const totalPowerWatts = rackAttributes.rackType === RackType.HDD
    ? (rackAttributes.serverPower * rackAttributes.serversPerRack) +
      (rackAttributes.jbodPower * rackAttributes.jbodsPerRack) +
      (rackAttributes.switchPower * rackAttributes.utilityServerPerRack) +
      (drive.powerActiveW * drivesPerRack * workloadParams.dutyActivePercent) +
      (drive.powerIdleW * drivesPerRack * (1 - workloadParams.dutyActivePercent))
    : (rackAttributes.serverPower * rackAttributes.serversPerRack) +
      (rackAttributes.jbofPower * rackAttributes.jbofsPerRack) +
      (rackAttributes.switchPower * rackAttributes.utilityServerPerRack) +
      (drive.powerActiveW * drivesPerRack * workloadParams.dutyActivePercent) +
      (drive.powerIdleW * drivesPerRack * (1 - workloadParams.dutyActivePercent));

  // Calculate power cost per month
  const powerCostPerMonth = totalPowerWatts * 24 * 30 * fixedCosts.powerCostPerKWh * fixedCosts.pue / 1000;

  // Calculate drive replacement cost based on AFR
  const failedDrivesPerYear = drivesPerRack * (drive.afr / 100);
  const replacementCostPerMonth = (failedDrivesPerYear * 100) / 12; // $100 per drive replacement

  // Calculate data center costs per month
  const dataCenterCosts = fixedCosts.networkCostPerMonth +
    fixedCosts.softwareLicenseCostPerMonth +
    fixedCosts.rackspaceAndCoolingPerMonth;

  // Calculate total OpEx per month
  const totalOpex = powerCostPerMonth + replacementCostPerMonth + dataCenterCosts;

  // Calculate TCO per TB per month
  const tcoPerTBRawPerMonth = (capexPerMonth + totalOpex) / (rawCapacityPerRackPB * 1024);
  const tcoPerTBEffectivePerMonth = (capexPerMonth + totalOpex) / (effectiveCapacityPerRackPB * 1024);

  return {
    capexResults: {
      drivesCost,
      serversCost: rackAttributes.serverCost * rackAttributes.serversPerRack,
      jbodsCost: rackAttributes.rackType === RackType.HDD ? rackAttributes.jbodCost * rackAttributes.jbodsPerRack : rackAttributes.jbofCost * rackAttributes.jbofsPerRack,
      infrastructureCost,
      totalCapex,
      capexPerMonth,
      capacityPerRack: drivesPerRack * rawCapacityPerDrive,
      rawCapacityPerRackPB
    },
    opexResults: {
      powerMaxWatts: totalPowerWatts,
      powerCost: powerCostPerMonth,
      replacementCostPerMonth,
      dataCenterCosts,
      totalOpex
    },
    totalResults: {
      effectiveCapacityPerRackPB,
      tcoPerTBRawPerMonth,
      tcoPerTBEffectivePerMonth
    }
  };
}