import React from 'react';
import { Tooltip } from 'flowbite-react';
import { DriveConfig } from '../types/tco';

interface DriveDetailsProps {
  config: DriveConfig;
}

export function DriveDetails({ config }: DriveDetailsProps) {
  const { drive } = config;
  
  const formatValue = (value: number | null, unit: string = ''): string => {
    if (value === null) return 'N/A';
    return `${value.toLocaleString()}${unit}`;
  };

  const details = [
    { label: 'Interface', value: drive.interface },
    { label: 'Capacity', value: formatValue(drive.capacityTB, ' TB') },
    { label: 'Price', value: formatValue(drive.price, ' $') },
    { label: 'Power Active', value: formatValue(drive.powerActiveW, ' W') },
    { label: 'Power Idle', value: formatValue(drive.powerIdleW, ' W') },
    { label: 'Annual Failure Rate', value: formatValue(drive.afr, '%') },
    { label: 'QD1 IOPS', value: formatValue(drive.iopsQD1) },
    { label: 'Max Random Read IOPS', value: formatValue(drive.iopsMaxRandomRead) },
    { label: 'Sequential Read', value: formatValue(drive.bandwidthSequentialRead, ' MB/s') },
    { label: 'Sequential Write', value: formatValue(drive.bandwidthSequentialWrite, ' MB/s') },
    { label: 'Endurance', value: formatValue(drive.enduranceTBW, ' TBW') }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        {drive.model}
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {details.map(({ label, value }) => (
          <div key={label} className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            <span className="font-medium text-gray-900 dark:text-white">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 