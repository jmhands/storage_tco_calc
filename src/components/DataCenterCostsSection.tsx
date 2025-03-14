import { useState } from 'react';
import { Card, Label, TextInput, Button, RangeSlider } from 'flowbite-react';
import {
  HiChevronDown,
  HiChevronUp,
  HiLightningBolt,
  HiChartBar,
  HiClock,
  HiGlobeAlt,
  HiCode,
  HiHome
} from 'react-icons/hi';
import { FixedCosts } from '../types/tco';

interface DataCenterCostsSectionProps {
  fixedCosts: FixedCosts;
  setFixedCosts: (costs: FixedCosts) => void;
}

export function DataCenterCostsSection({ fixedCosts, setFixedCosts }: DataCenterCostsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleUpdate = (updates: Partial<FixedCosts>) => {
    setFixedCosts({ ...fixedCosts, ...updates });
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
              <span className="flex items-center gap-2">
                <HiLightningBolt className="h-5 w-5 text-blue-400" />
                Power Cost
              </span>
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
              <span className="flex items-center gap-2">
                <HiChartBar className="h-5 w-5 text-blue-400" />
                PUE
              </span>
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
            <Label htmlFor="depreciation" className="flex justify-between">
              <span className="flex items-center gap-2">
                <HiClock className="h-5 w-5 text-indigo-500" />
                Depreciation Period
              </span>
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
              <span className="flex items-center gap-2">
                <HiGlobeAlt className="h-5 w-5 text-blue-400" />
                Network Cost
              </span>
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
              <span className="flex items-center gap-2">
                <HiCode className="h-5 w-5 text-indigo-500" />
                Software License
              </span>
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
              <span className="flex items-center gap-2">
                <HiHome className="h-5 w-5 text-indigo-500" />
                Rackspace & Cooling
              </span>
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