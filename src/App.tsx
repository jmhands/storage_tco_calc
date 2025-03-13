import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Card, Button, DarkThemeToggle, Flowbite, Tabs, Select } from 'flowbite-react';
import { HiServer, HiTrash, HiPlus } from 'react-icons/hi';
import { DriveData, DriveConfig, RackAttributes, FixedCosts, WorkloadParams } from './types/tco';
import { calculateTCO } from './utils/tcoCalculator';
import { parseDriveData } from './utils/csvParser';
import { PerformanceTab } from './components/PerformanceTab';
import { DriveDetails } from './components/DriveDetails';
import { RackConfigurationsTab } from './components/RackConfigurationsTab';
import { WorkloadParamsSection } from './components/WorkloadParamsSection';
import { DataCenterCostsSection } from './components/DataCenterCostsSection';

// Lazy load ApexCharts
const ReactApexChart = lazy(() => import('react-apexcharts'));

export default function App() {
  const [drives, setDrives] = useState<DriveData[]>([]);
  const [selectedDrives, setSelectedDrives] = useState<DriveConfig[]>([]);
  const [rackAttributes, setRackAttributes] = useState<RackAttributes>({
    dataCenterCostPerRack: 10000,
    rackCost: 2000,
    serverCost: 15000,
    jbodCost: 5000,
    switchCost: 3000,
    serverPower: 800,
    jbodPower: 200,
    switchPower: 100,
    serverRU: 2,
    jbodRU: 4,
    switchRU: 1,
    drivesPerServer: 24,
    drivesPerJBOD: 60,
    jbodsPerRack: 8,
    serversPerRack: 4,
    utilityServerPerRack: 2,
    rackUnits: 42,
    serverRackUnits: 2
  });
  const [fixedCosts, setFixedCosts] = useState<FixedCosts>({
    powerCostPerKWh: 0.12,
    pue: 1.0,
    maintenancePercentage: 0.1,
    personnelPerRack: 0.1,
    personnelSalary: 100000,
    depreciationYears: 5,
    networkCostPerMonth: 0,
    softwareLicenseCostPerMonth: 0,
    rackspaceAndCoolingPerMonth: 0
  });
  const [workloadParams, setWorkloadParams] = useState<WorkloadParams>({
    replicationFactor: 3,
    erasureCodingOverhead: 1.4,
    utilizationTarget: 0.75,
    dutyActivePercent: 0.5,
    dataReductionRatio: 1.0
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
      document.documentElement.classList.toggle('dark', e.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleChange);
    document.documentElement.classList.toggle('dark', darkModeMediaQuery.matches);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    fetch('/drives.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(data => {
        if (!data || data.trim() === '') {
          throw new Error('CSV file is empty');
        }
        console.log('Raw CSV data:', data.substring(0, 200) + '...'); // Log first 200 chars
        const parsedDrives = parseDriveData(data);
        if (!parsedDrives || parsedDrives.length === 0) {
          throw new Error('No drives parsed from CSV');
        }
        console.log(`Successfully parsed ${parsedDrives.length} drives:`, parsedDrives);
        setDrives(parsedDrives);
      })
      .catch(error => {
        console.error('Error loading drives:', error);
        // You might want to show this error to the user
        setDrives([]); // Set empty array to show no drives available
      });
  }, []);

  useEffect(() => {
    // Recalculate TCO whenever any parameter changes
    const updatedDrives = selectedDrives.map(config => ({
      drive: config.drive,
      results: calculateTCO(config.drive, rackAttributes, fixedCosts, workloadParams)
    }));
    setSelectedDrives(updatedDrives);
  }, [rackAttributes, fixedCosts, workloadParams]);

  const handleDriveSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    console.log('Selected value:', selectedValue);
    console.log('Available drives:', drives);
    
    if (!selectedValue) {
      console.log('No drive selected');
      return;
    }

    const selectedDrive = drives.find(d => d && d.model === selectedValue);
    console.log('Found drive:', selectedDrive);

    if (selectedDrive) {
      const results = calculateTCO(selectedDrive, rackAttributes, fixedCosts, workloadParams);
      console.log('Calculated results:', results);
      
      const newConfig: DriveConfig = { drive: selectedDrive, results };
      setSelectedDrives(prev => [...prev, newConfig]);
    } else {
      console.error('Could not find drive with model:', selectedValue);
    }
  };

  const handleRemoveDrive = (index: number) => {
    setSelectedDrives(prev => prev.filter((_, i) => i !== index));
  };

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 400,
      background: 'transparent',
      toolbar: {
        show: true
      }
    },
    theme: {
      mode: isDarkMode ? 'dark' : 'light',
      palette: 'palette1'
    },
    colors: ['#1A56DB', '#7E3AF2', '#4F46E5'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    grid: {
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    xaxis: {
      categories: ['TCO$/TBe/Month', 'TCO$/TBe/Year', 'TCO$/TBe Total'],
      labels: {
        style: {
          colors: isDarkMode ? '#9ca3af' : '#6b7280'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Cost per Effective TB ($)',
        style: {
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        }
      },
      labels: {
        style: {
          colors: isDarkMode ? '#9ca3af' : '#6b7280'
        },
        formatter: function(val: number) {
          return '$' + val.toFixed(2);
        }
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
      y: {
        formatter: function (val: number) {
          return '$ ' + val.toFixed(2) + '/TBe';
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      labels: {
        colors: isDarkMode ? '#9ca3af' : '#6b7280'
      }
    }
  };

  return (
    <Flowbite>
      <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen" data-mode={isDarkMode ? 'dark' : 'light'}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold dark:text-white">Storage TCO Calculator</h1>
          <DarkThemeToggle onClick={handleDarkModeToggle} />
        </div>
        
        <div className="grid grid-cols-1 gap-4 mb-6">
          {selectedDrives.map((config, index) => (
            <Card key={index} className="dark:bg-gray-800">
              <div className="flex justify-between items-center mb-4">
                <div className="relative group">
                  <div className="flex items-center cursor-help">
                    <HiServer className="w-6 h-6 mr-2 dark:text-gray-400" />
                    <h2 className="text-xl font-semibold dark:text-white">{config.drive.model}</h2>
                  </div>
                  <div className="absolute left-full ml-2 w-[32rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                    <DriveDetails config={config} />
                  </div>
                </div>
                <Button color="gray" size="sm" onClick={() => handleRemoveDrive(index)}>
                  <HiTrash className="w-4 h-4" />
                </Button>
              </div>
              {config.results && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium dark:text-gray-400">Capacity per Rack</p>
                    <p className="text-lg dark:text-white">{config.results.capexResults.capacityPerRack.toFixed(2)} TB</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-gray-400">Effective Capacity</p>
                    <p className="text-lg dark:text-white">{config.results.totalResults.effectiveCapacityPerRackPB.toFixed(2)} PB</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-gray-400">Total Power</p>
                    <p className="text-lg dark:text-white">{config.results.opexResults.powerMaxWatts.toFixed(2)} W</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-gray-400">TCO per TB/Month</p>
                    <p className="text-lg dark:text-white">${config.results.totalResults.tcoPerTBEffectivePerMonth.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </Card>
          ))}

          {selectedDrives.length < 3 && (
            <Card className="dark:bg-gray-800">
              <div className="flex items-center mb-4">
                <HiPlus className="w-6 h-6 mr-2 dark:text-gray-400" />
                <h2 className="text-xl font-semibold dark:text-white">Add Drive</h2>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Select 
                    onChange={handleDriveSelect} 
                    value=""
                    id="drive-select"
                  >
                    <option value="">Select a drive...</option>
                    {drives && drives.length > 0 ? (
                      drives
                        .filter(drive => 
                          drive && 
                          drive.model && 
                          !selectedDrives.some(selected => selected.drive.model === drive.model)
                        )
                        .map((drive) => (
                          <option 
                            key={drive.model} 
                            value={drive.model}
                            data-capacity={drive.capacityTB}
                          >
                            {drive.model} ({drive.capacityTB}TB)
                          </option>
                        ))
                    ) : (
                      <option value="" disabled>Loading drives...</option>
                    )}
                  </Select>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DataCenterCostsSection
            fixedCosts={fixedCosts}
            setFixedCosts={setFixedCosts}
          />
          <WorkloadParamsSection
            workloadParams={workloadParams}
            setWorkloadParams={setWorkloadParams}
          />
        </div>

        <Tabs>
          <Tabs.Item active title="TCO Analysis">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="dark:bg-gray-800">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Monthly Cost per TB</h2>
                <div className="h-[400px]">
                  <Suspense fallback={<div className="dark:text-white">Loading chart...</div>}>
                    <ReactApexChart
                      type="bar"
                      height={400}
                      options={{
                        ...chartOptions,
                        chart: {
                          ...chartOptions.chart,
                          stacked: true
                        },
                        xaxis: {
                          ...chartOptions.xaxis,
                          categories: selectedDrives.map(config => config.drive.model)
                        }
                      }}
                      series={[
                        {
                          name: 'Monthly CapEx/TBe',
                          data: selectedDrives.map(config => 
                            config.results ? config.results.capexResults.capexPerMonth / (config.results.totalResults.effectiveCapacityPerRackPB * 1024) : 0
                          )
                        },
                        {
                          name: 'Monthly OpEx/TBe',
                          data: selectedDrives.map(config => 
                            config.results ? config.results.opexResults.totalOpex / (config.results.totalResults.effectiveCapacityPerRackPB * 1024) : 0
                          )
                        }
                      ]}
                    />
                  </Suspense>
                </div>
              </Card>

              <Card className="dark:bg-gray-800">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Yearly Cost per TB</h2>
                <div className="h-[400px]">
                  <Suspense fallback={<div className="dark:text-white">Loading chart...</div>}>
                    <ReactApexChart
                      type="bar"
                      height={400}
                      options={{
                        ...chartOptions,
                        chart: {
                          ...chartOptions.chart,
                          stacked: true
                        },
                        xaxis: {
                          ...chartOptions.xaxis,
                          categories: selectedDrives.map(config => config.drive.model)
                        }
                      }}
                      series={[
                        {
                          name: 'Yearly CapEx/TBe',
                          data: selectedDrives.map(config => 
                            config.results ? (config.results.capexResults.capexPerMonth * 12) / (config.results.totalResults.effectiveCapacityPerRackPB * 1024) : 0
                          )
                        },
                        {
                          name: 'Yearly OpEx/TBe',
                          data: selectedDrives.map(config => 
                            config.results ? (config.results.opexResults.totalOpex * 12) / (config.results.totalResults.effectiveCapacityPerRackPB * 1024) : 0
                          )
                        }
                      ]}
                    />
                  </Suspense>
                </div>
              </Card>

              <Card className="dark:bg-gray-800">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Total Cost per TB</h2>
                <div className="h-[400px]">
                  <Suspense fallback={<div className="dark:text-white">Loading chart...</div>}>
                    <ReactApexChart
                      type="bar"
                      height={400}
                      options={{
                        ...chartOptions,
                        chart: {
                          ...chartOptions.chart,
                          stacked: true
                        },
                        xaxis: {
                          ...chartOptions.xaxis,
                          categories: selectedDrives.map(config => config.drive.model)
                        }
                      }}
                      series={[
                        {
                          name: 'Total CapEx/TBe',
                          data: selectedDrives.map(config => 
                            config.results ? (config.results.capexResults.capexPerMonth * 12 * fixedCosts.depreciationYears) / (config.results.totalResults.effectiveCapacityPerRackPB * 1024) : 0
                          )
                        },
                        {
                          name: 'Total OpEx/TBe',
                          data: selectedDrives.map(config => 
                            config.results ? (config.results.opexResults.totalOpex * 12 * fixedCosts.depreciationYears) / (config.results.totalResults.effectiveCapacityPerRackPB * 1024) : 0
                          )
                        }
                      ]}
                    />
                  </Suspense>
                </div>
              </Card>
            </div>
          </Tabs.Item>
          
          <Tabs.Item title="Performance & Endurance">
            <PerformanceTab 
              selectedDrives={selectedDrives}
              isDarkMode={isDarkMode}
            />
          </Tabs.Item>

          <Tabs.Item title="Rack Configurations" icon={HiServer}>
            <RackConfigurationsTab
              rackAttributes={rackAttributes}
              setRackAttributes={setRackAttributes}
            />
          </Tabs.Item>
        </Tabs>
      </div>
    </Flowbite>
  );
} 