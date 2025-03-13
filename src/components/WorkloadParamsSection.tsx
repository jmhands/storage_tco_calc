import React, { useState } from 'react';
import { Card, Label, TextInput, Button, RangeSlider } from 'flowbite-react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { WorkloadParams } from '../types/tco';

interface WorkloadParamsSectionProps {
  workloadParams: WorkloadParams;
  onUpdate: (params: WorkloadParams) => void;
}

export function WorkloadParamsSection({ workloadParams, onUpdate }: WorkloadParamsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleUpdate = (updates: Partial<WorkloadParams>) => {
    onUpdate({ ...workloadParams, ...updates });
  };

  return (
    <Card className="dark:bg-gray-800">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-semibold dark:text-white">Workload Parameters</h2>
        <Button color="gray" size="sm">
          {isExpanded ? <HiChevronUp className="h-4 w-4" /> : <HiChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="error-encoding" className="flex justify-between">
              <span>Error Encoding / Replication</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">(e.g., 2 for mirroring, 3 for triple replication)</span>
            </Label>
            <TextInput
              id="error-encoding"
              type="number"
              step="0.1"
              value={workloadParams.replicationFactor}
              onChange={(e) => handleUpdate({ replicationFactor: Number(e.target.value) })}
            />
          </div>

          <div>
            <Label htmlFor="utilization-target" className="flex justify-between">
              <span>Capacity Utilization</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{(workloadParams.utilizationTarget * 100).toFixed(0)}%</span>
            </Label>
            <RangeSlider
              id="utilization-target"
              min={0}
              max={100}
              step={1}
              value={workloadParams.utilizationTarget * 100}
              onChange={(e) => handleUpdate({ utilizationTarget: Number(e.target.value) / 100 })}
            />
          </div>

          <div>
            <Label htmlFor="duty-cycle" className="flex justify-between">
              <span>Duty Cycle</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{(workloadParams.dutyActivePercent * 100).toFixed(0)}%</span>
            </Label>
            <RangeSlider
              id="duty-cycle"
              min={0}
              max={100}
              step={1}
              value={workloadParams.dutyActivePercent * 100}
              onChange={(e) => handleUpdate({ dutyActivePercent: Number(e.target.value) / 100 })}
            />
          </div>

          <div>
            <Label htmlFor="data-reduction" className="flex justify-between">
              <span>Data Reduction Ratio</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{workloadParams.dataReductionRatio.toFixed(1)}:1</span>
            </Label>
            <RangeSlider
              id="data-reduction"
              min={10}
              max={50}
              step={1}
              value={workloadParams.dataReductionRatio * 10}
              onChange={(e) => handleUpdate({ dataReductionRatio: Number(e.target.value) / 10 })}
            />
          </div>
        </div>
      )}
    </Card>
  );
} 