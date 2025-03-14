import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Card, DarkThemeToggle, Flowbite, Tabs } from 'flowbite-react';
import { DriveData, DriveConfig, RackAttributes, FixedCosts, WorkloadParams, RackType } from './types/tco';
import { calculateTCO } from './utils/tcoCalculator';
import { parseDriveData } from './utils/csvParser';
import { PerformanceTab } from './components/PerformanceTab';
import { RackConfigurationsTab } from './components/RackConfigurationsTab';
import { WorkloadParamsSection } from './components/WorkloadParamsSection';
import { DataCenterCostsSection } from './components/DataCenterCostsSection';
import { DriveSelector } from './components/DriveSelector';
import { HiDatabase, HiCurrencyDollar, HiChartBar } from 'react-icons/hi';

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
  colors: ['#1A56DB', '#7E3AF2'], // blue-600, violet-500
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
    rackType: RackType.HDD,
    rackCost: 2000,
    serverCost: 5000,
    jbodCost: 5000,
    jbofCost: 8000,
    switchCost: 3000,
    serverPower: 800,
    jbodPower: 200,
    jbofPower: 300,
    switchPower: 100,
    serverRU: 2,
    jbodRU: 4,
    jbofRU: 2,
    switchRU: 1,
    drivesPerServer: 0,
    drivesPerJBOD: 60,
    drivesPerJBOF: 24,
    jbodsPerRack: 8,
    jbofsPerRack: 10,
    serversPerRack: 4,
    utilityServerPerRack: 2,
    rackUnits: 42,
    serverRackUnits: 2
  });
  const [fixedCosts, setFixedCosts] = useState<FixedCosts>({
    powerCostPerKWh: 0.12,
    pue: 1.0,
    maintenancePercentage: 0.1,
    depreciationYears: 5,
    networkCostPerMonth: 0,
    softwareLicenseCostPerMonth: 0,
    rackspaceAndCoolingPerMonth: 0
  });
  const [workloadParams, setWorkloadParams] = useState<WorkloadParams>({
    replicationFactor: 1,
    erasureCodingOverhead: 1,
    utilizationTarget: 1,
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
    // Switch rack type based on drive type
    const isSSDDrive = drive.interface.toLowerCase().includes('nvme') || drive.interface.toLowerCase().includes('ssd');
    const newRackType = isSSDDrive ? RackType.SSD : RackType.HDD;

    // Update rack type if different
    if (newRackType !== rackAttributes.rackType) {
      setRackAttributes({
        ...rackAttributes,
        rackType: newRackType,
        // Reset to appropriate defaults for the rack type
        drivesPerServer: newRackType === RackType.SSD ? 24 : 0,
        drivesPerJBOD: 60,
        drivesPerJBOF: 24,
        jbodsPerRack: 8,
        jbofsPerRack: 10,
        serverCost: newRackType === RackType.SSD ? 15000 : 5000
      });
    }

    const results = calculateTCO(drive, {
      ...rackAttributes,
      rackType: newRackType,
      drivesPerServer: newRackType === RackType.SSD ? 24 : 0,
      serverCost: newRackType === RackType.SSD ? 15000 : 5000
    }, fixedCosts, workloadParams);

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
          rackType={rackAttributes.rackType}
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
              <Card className="w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
                <div className="flex justify-between pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center me-3">
                      <HiCurrencyDollar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h5 className="leading-none text-2xl font-bold text-gray-900 dark:text-white pb-1">Monthly</h5>
                      <p className="text-sm font-normal text-gray-500 dark:text-gray-400">Cost per TB Effective</p>
                    </div>
                  </div>
                </div>
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

              <Card className="w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
                <div className="flex justify-between pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-violet-100 dark:bg-violet-900 flex items-center justify-center me-3">
                      <HiCurrencyDollar className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <h5 className="leading-none text-2xl font-bold text-gray-900 dark:text-white pb-1">Yearly</h5>
                      <p className="text-sm font-normal text-gray-500 dark:text-gray-400">Cost per TB Effective</p>
                    </div>
                  </div>
                </div>
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

              <Card className="w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
                <div className="flex justify-between pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center me-3">
                      <HiCurrencyDollar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h5 className="leading-none text-2xl font-bold text-gray-900 dark:text-white pb-1">Total</h5>
                      <p className="text-sm font-normal text-gray-500 dark:text-gray-400">Cost per TB Effective</p>
                    </div>
                  </div>
                </div>
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

            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="dark:bg-gray-800">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <HiDatabase className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Storage Capacity</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Raw / Effective</p>
                    {selectedDrives.map(config => (
                      <p key={config.drive.model} className="mt-1 text-gray-900 dark:text-white">
                        {config.results.capexResults.rawCapacityPerRackPB.toFixed(2)} PB / {config.results.totalResults.effectiveCapacityPerRackPB.toFixed(2)} PBe
                      </p>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="dark:bg-gray-800">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-violet-100 dark:bg-violet-900 rounded-lg">
                    <HiCurrencyDollar className="h-6 w-6 text-violet-600 dark:text-violet-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Cost per Rack</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">CapEx + OpEx over {fixedCosts.depreciationYears} years</p>
                    {selectedDrives.map(config => (
                      <p key={config.drive.model} className="mt-1 text-gray-900 dark:text-white">
                        ${((config.results.capexResults.totalCapex + config.results.opexResults.totalOpex * 12 * fixedCosts.depreciationYears) / 1000).toFixed(2)}k
                      </p>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="dark:bg-gray-800">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <HiChartBar className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">TCO per TBe</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Cost / Effective TB</p>
                    {selectedDrives.map(config => (
                      <p key={config.drive.model} className="mt-1 text-gray-900 dark:text-white">
                        ${config.results.totalResults.tcoPerTBEffectivePerMonth.toFixed(2)}/TBe/month
                      </p>
                    ))}
                  </div>
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