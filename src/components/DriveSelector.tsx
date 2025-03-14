import { useState, useMemo } from 'react';
import { Card, Badge, Select } from 'flowbite-react';
import { HiX } from 'react-icons/hi';
import { DriveData, RackType } from '../types/tco';

interface DriveSelectorProps {
  drives: DriveData[];
  selectedDrives: DriveData[];
  onDriveSelect: (drive: DriveData) => void;
  onDriveDeselect: (drive: DriveData) => void;
  rackType: RackType;
}

const MAX_COMPARE = 3;

const isSSD = (drive: DriveData) => drive.interface.toLowerCase().includes('nvme') || drive.interface.toLowerCase().includes('ssd');

export function DriveSelector({ drives, selectedDrives, onDriveSelect, onDriveDeselect, rackType }: DriveSelectorProps) {
  const [driveType, setDriveType] = useState<'all' | 'SSD' | 'HDD'>('all');

  // Group drives by type
  const drivesByType = useMemo(() => ({
    SSD: drives.filter(isSSD),
    HDD: drives.filter(d => !isSSD(d)),
    all: drives
  }), [drives]);

  // Filter out already selected drives
  const availableDrives = useMemo(() => {
    const drivesToShow = drivesByType[driveType];
    return drivesToShow.filter(drive =>
      !selectedDrives.some(selected => selected.model === drive.model)
    );
  }, [drivesByType, driveType, selectedDrives]);

  const handleDriveSelect = (model: string) => {
    const drive = drives.find(d => d.model === model);
    if (drive && selectedDrives.length < MAX_COMPARE) {
      onDriveSelect(drive);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Drives */}
      {selectedDrives.length > 0 && (
        <Card className="dark:bg-gray-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold dark:text-white">
              Selected Drives ({selectedDrives.length}/{MAX_COMPARE})
            </h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedDrives.map((drive) => (
              <Badge
                key={drive.model}
                color={isSSD(drive) ? 'purple' : 'green'}
                className="flex items-center gap-2 p-2"
              >
                <span>
                  {drive.model} ({drive.capacityTB}TB, ${drive.price.toFixed(2)}, {drive.powerActiveW}W)
                </span>
                <HiX
                  className="h-4 w-4 cursor-pointer hover:text-red-500"
                  onClick={() => onDriveDeselect(drive)}
                />
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Drive Selection */}
      <Card className="dark:bg-gray-800">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Drive Type Filter */}
            <div className="w-full sm:w-48">
              <Select
                value={driveType}
                onChange={(e) => setDriveType(e.target.value as 'all' | 'SSD' | 'HDD')}
              >
                <option value="all">All Drives ({drives.length})</option>
                <option value="SSD">SSDs ({drivesByType.SSD.length})</option>
                <option value="HDD">HDDs ({drivesByType.HDD.length})</option>
              </Select>
            </div>

            {/* Drive Selection Dropdown */}
            <div className="flex-1">
              <Select
                value=""
                onChange={(e) => handleDriveSelect(e.target.value)}
                disabled={selectedDrives.length >= MAX_COMPARE}
              >
                <option value="">
                  {selectedDrives.length >= MAX_COMPARE
                    ? `Maximum ${MAX_COMPARE} drives selected`
                    : 'Select a drive to compare...'}
                </option>
                {availableDrives.map(drive => (
                  <option key={drive.model} value={drive.model}>
                    {drive.model} ({drive.interface}) - {drive.capacityTB}TB, ${drive.price}, {drive.powerActiveW}W (${(drive.price / drive.capacityTB).toFixed(2)}/TB)
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}