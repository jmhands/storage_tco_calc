import React, { useState } from 'react';
import { Card, Label, TextInput, Button, RangeSlider } from 'flowbite-react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { FixedCosts } from '../types/tco';

interface DataCenterCostsSectionProps {
  fixedCosts: FixedCosts;
  onUpdate: (costs: FixedCosts) => void;
}

export function DataCenterCostsSection({ fixedCosts, onUpdate }: DataCenterCostsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleUpdate = (updates: Partial<FixedCosts>) => {
    onUpdate({ ...fixedCosts, ...updates });
  };

  return (
    <Card className="dark:bg-gray-800">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-semibold dark:text-white">Data Center Costs</h2>
        <Button color="gray" size="sm">
          {isExpanded ? <HiChevronUp className="h-4 w-4" /> : <HiChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="power-cost" className="flex justify-between">
              <span>Power Cost</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">${fixedCosts.powerCostPerKWh.toFixed(3)}/kWh</span>
            </Label>
            <TextInput
              id="power-cost"
              type="number"
              step="0.001"
              value={fixedCosts.powerCostPerKWh}
              onChange={(e) => handleUpdate({ powerCostPerKWh: Number(e.target.value) })}
            />
          </div>

          <div>
            <Label htmlFor="pue" className="flex justify-between">
              <span>PUE</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{fixedCosts.pue.toFixed(1)}</span>
            </Label>
            <RangeSlider
              id="pue"
              min={10}
              max={30}
              step={1}
              value={fixedCosts.pue * 10}
              onChange={(e) => handleUpdate({ pue: Number(e.target.value) / 10 })}
            />
          </div>

          <div>
            <Label htmlFor="maintenance" className="flex justify-between">
              <span>Maintenance</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{(fixedCosts.maintenancePercentage * 100).toFixed(0)}%</span>
            </Label>
            <RangeSlider
              id="maintenance"
              min={0}
              max={100}
              step={1}
              value={fixedCosts.maintenancePercentage * 100}
              onChange={(e) => handleUpdate({ maintenancePercentage: Number(e.target.value) / 100 })}
            />
          </div>

          <div>
            <Label htmlFor="personnel-per-rack" className="flex justify-between">
              <span>Personnel per Rack</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{(fixedCosts.personnelPerRack * 100).toFixed(0)}%</span>
            </Label>
            <RangeSlider
              id="personnel-per-rack"
              min={0}
              max={100}
              step={1}
              value={fixedCosts.personnelPerRack * 100}
              onChange={(e) => handleUpdate({ personnelPerRack: Number(e.target.value) / 100 })}
            />
          </div>

          <div>
            <Label htmlFor="personnel-salary" className="flex justify-between">
              <span>Personnel Salary</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">${fixedCosts.personnelSalary.toLocaleString()}/year</span>
            </Label>
            <TextInput
              id="personnel-salary"
              type="number"
              step="1000"
              value={fixedCosts.personnelSalary}
              onChange={(e) => handleUpdate({ personnelSalary: Number(e.target.value) })}
            />
          </div>

          <div>
            <Label htmlFor="depreciation" className="flex justify-between">
              <span>Depreciation Period</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{fixedCosts.depreciationYears} years</span>
            </Label>
            <TextInput
              id="depreciation"
              type="number"
              step="1"
              value={fixedCosts.depreciationYears}
              onChange={(e) => handleUpdate({ depreciationYears: Number(e.target.value) })}
            />
          </div>

          <div>
            <Label htmlFor="network-cost" className="flex justify-between">
              <span>Network Cost</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">${fixedCosts.networkCostPerMonth}/month</span>
            </Label>
            <TextInput
              id="network-cost"
              type="number"
              step="1"
              value={fixedCosts.networkCostPerMonth}
              onChange={(e) => handleUpdate({ networkCostPerMonth: Number(e.target.value) })}
            />
          </div>

          <div>
            <Label htmlFor="software-license" className="flex justify-between">
              <span>Software License</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">${fixedCosts.softwareLicenseCostPerMonth}/month</span>
            </Label>
            <TextInput
              id="software-license"
              type="number"
              step="1"
              value={fixedCosts.softwareLicenseCostPerMonth}
              onChange={(e) => handleUpdate({ softwareLicenseCostPerMonth: Number(e.target.value) })}
            />
          </div>

          <div>
            <Label htmlFor="rackspace-cooling" className="flex justify-between">
              <span>Rackspace & Cooling</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">${fixedCosts.rackspaceAndCoolingPerMonth}/month</span>
            </Label>
            <TextInput
              id="rackspace-cooling"
              type="number"
              step="1"
              value={fixedCosts.rackspaceAndCoolingPerMonth}
              onChange={(e) => handleUpdate({ rackspaceAndCoolingPerMonth: Number(e.target.value) })}
            />
          </div>
        </div>
      )}
    </Card>
  );
} 