import { DriveData, RackAttributes, FixedCosts, WorkloadParams, TCOResults } from '../types/tco';

export function calculateTCO(
  drive: DriveData,
  rackAttributes: RackAttributes,
  fixedCosts: FixedCosts,
  workloadParams: WorkloadParams
): TCOResults {
  // Calculate CAPEX
  const drivesPerRack = rackAttributes.drivesPerServer * rackAttributes.serversPerRack +
    rackAttributes.drivesPerJBOD * rackAttributes.jbodsPerRack;
  const drivesCost = drive.price * drivesPerRack;
  const serversCost = rackAttributes.serverCost * rackAttributes.serversPerRack;
  const jbodsCost = rackAttributes.jbodCost * rackAttributes.jbodsPerRack;
  const infrastructureCost = rackAttributes.dataCenterCostPerRack + rackAttributes.rackCost +
    rackAttributes.switchCost * rackAttributes.utilityServerPerRack;

  const totalCapex = drivesCost + serversCost + jbodsCost + infrastructureCost;
  const capexPerMonth = totalCapex / (fixedCosts.depreciationYears * 12);

  // Calculate OPEX
  const drivePowerWatts = (drive.powerActiveW * workloadParams.dutyActivePercent +
    drive.powerIdleW * (1 - workloadParams.dutyActivePercent)) * drivesPerRack;
  const totalPowerWatts = drivePowerWatts +
    (rackAttributes.serverPower * rackAttributes.serversPerRack) +
    (rackAttributes.jbodPower * rackAttributes.jbodsPerRack) +
    (rackAttributes.switchPower * rackAttributes.utilityServerPerRack);

  const powerKWh = totalPowerWatts * 24 * 30 / 1000; // Convert to kWh per month
  const powerCost = powerKWh * fixedCosts.powerCostPerKWh * fixedCosts.pue; // Use PUE instead of cooling multiplier

  // Calculate drive failures and replacement costs over the deployment term
  const drivesPerYear = drivesPerRack * (drive.afr / 100); // Convert AFR percentage to decimal
  const totalDrivesOverTerm = drivesPerYear * fixedCosts.depreciationYears;
  const replacementCostPerMonth = (totalDrivesOverTerm * 100) / (fixedCosts.depreciationYears * 12); // $100 per drive replacement

  // Add new data center costs
  const dataCenterCosts = fixedCosts.networkCostPerMonth +
    fixedCosts.softwareLicenseCostPerMonth +
    fixedCosts.rackspaceAndCoolingPerMonth;

  const totalOpex = powerCost + replacementCostPerMonth + dataCenterCosts;

  // Calculate capacity
  const rawCapacityPerDrive = drive.capacityTB;
  const capacityPerRack = rawCapacityPerDrive * drivesPerRack;
  const rawCapacityPerRackPB = capacityPerRack / 1024;
  const effectiveCapacityPerRack = (capacityPerRack * workloadParams.dataReductionRatio) / workloadParams.replicationFactor / workloadParams.erasureCodingOverhead;
  const usableCapacityPerRack = effectiveCapacityPerRack * workloadParams.utilizationTarget;
  const effectiveCapacityPerRackPB = usableCapacityPerRack / 1024;

  // Calculate TCO per TB per month
  const totalCostPerMonth = capexPerMonth + totalOpex;
  const tcoPerTBRawPerMonth = totalCostPerMonth / capacityPerRack;
  const tcoPerTBEffectivePerMonth = totalCostPerMonth / usableCapacityPerRack;

  return {
    capexResults: {
      drivesCost,
      serversCost,
      jbodsCost,
      infrastructureCost,
      totalCapex,
      capexPerMonth,
      capacityPerRack,
      rawCapacityPerRackPB
    },
    opexResults: {
      powerMaxWatts: totalPowerWatts,
      powerCost,
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