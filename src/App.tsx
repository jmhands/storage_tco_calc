import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Card, DarkThemeToggle, Flowbite, Tabs } from 'flowbite-react';
import { DriveData, DriveConfig, RackAttributes, FixedCosts, WorkloadParams } from './types/tco';
import { calculateTCO } from './utils/tcoCalculator';
import { parseDriveData } from './utils/csvParser';
import { PerformanceTab } from './components/PerformanceTab';
import { RackConfigurationsTab } from './components/RackConfigurationsTab';
import { WorkloadParamsSection } from './components/WorkloadParamsSection';
import { DataCenterCostsSection } from './components/DataCenterCostsSection';
import { DriveSelector } from './components/DriveSelector';

// Lazy load ApexCharts
const ReactApexChart = lazy(() => import('react-apexcharts'));

const chartOptions = {
  chart: {
    type: 'bar',
    height: 400,
    background: 'transparent',
    toolbar: {
      show: true
    }
  },
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
  xaxis: {
    labels: {
      style: {
        colors: []
      }
    }
  },
  yaxis: {
    title: {
      text: 'Cost per Effective TB ($)'
    },
    labels: {
      formatter: function(val: number) {
        return '$' + val.toFixed(2);
      }
    }
  },
  tooltip: {
    y: {
      formatter: function(val: number) {
        return '$ ' + val.toFixed(2) + '/TBe';
      }
    }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left'
  }
};

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

  const handleDriveSelect = (drive: DriveData) => {
    const results = calculateTCO(drive, rackAttributes, fixedCosts, workloadParams);
    const newConfig: DriveConfig = { drive, results };
    setSelectedDrives(prev => [...prev, newConfig]);
  };

  const handleDriveDeselect = (drive: DriveData) => {
    setSelectedDrives(prev => prev.filter(config => config.drive.model !== drive.model));
  };

  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <Flowbite>
      <div className="container mx-auto p-4 dark:bg-gray-900 min-h-screen" data-mode={isDarkMode ? 'dark' : 'light'}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold dark:text-white">Storage TCO Calculator</h1>
          <DarkThemeToggle onClick={handleDarkModeToggle} />
        </div>

        <DriveSelector
          drives={drives}
          selectedDrives={selectedDrives.map(config => config.drive)}
          onDriveSelect={handleDriveSelect}
          onDriveDeselect={handleDriveDeselect}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <DataCenterCostsSection
            fixedCosts={fixedCosts}
            setFixedCosts={setFixedCosts}
          />
          <WorkloadParamsSection
            workloadParams={workloadParams}
            setWorkloadParams={setWorkloadParams}
          />
        </div>

        <Tabs className="mt-6">
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
                        theme: {
                          mode: isDarkMode ? 'dark' : 'light',
                          palette: 'palette1'
                        },
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
                        theme: {
                          mode: isDarkMode ? 'dark' : 'light',
                          palette: 'palette1'
                        },
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
                        theme: {
                          mode: isDarkMode ? 'dark' : 'light',
                          palette: 'palette1'
                        },
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

          <Tabs.Item title="Rack Configuration">
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