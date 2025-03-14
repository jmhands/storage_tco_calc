import { lazy, Suspense } from 'react';
import { Card } from 'flowbite-react';
import { DriveConfig } from '../types/tco';

const ReactApexChart = lazy(() => import('react-apexcharts'));

interface PerformanceTabProps {
  selectedDrives: DriveConfig[];
  isDarkMode: boolean;
}

export function PerformanceTab({ selectedDrives, isDarkMode }: PerformanceTabProps) {
  const iopsChartOptions = {
    chart: {
      type: 'bar',
      height: 400,
      background: 'transparent',
      toolbar: { show: true }
    },
    theme: {
      mode: isDarkMode ? 'dark' : 'light',
      palette: 'palette1'
    },
    colors: ['#3F83F8', '#6875F5'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4
      }
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    grid: {
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      yaxis: { lines: { show: true } }
    },
    xaxis: {
      categories: ['QD1 IOPS', 'Max Random Read IOPS'],
      labels: {
        style: { colors: isDarkMode ? '#9ca3af' : '#6b7280' }
      }
    },
    yaxis: {
      title: {
        text: 'IOPS',
        style: { color: isDarkMode ? '#9ca3af' : '#6b7280' }
      },
      labels: {
        style: { colors: isDarkMode ? '#9ca3af' : '#6b7280' },
        formatter: function(val: number) {
          return val.toLocaleString();
        }
      }
    },
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
      y: {
        formatter: function(val: number) {
          return val.toLocaleString() + ' IOPS';
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      labels: { colors: isDarkMode ? '#9ca3af' : '#6b7280' }
    }
  };

  const bandwidthChartOptions = {
    ...iopsChartOptions,
    xaxis: {
      categories: ['Sequential Read', 'Sequential Write'],
      labels: {
        style: { colors: isDarkMode ? '#9ca3af' : '#6b7280' }
      }
    },
    yaxis: {
      title: {
        text: 'Bandwidth (MB/s)',
        style: { color: isDarkMode ? '#9ca3af' : '#6b7280' }
      },
      labels: {
        style: { colors: isDarkMode ? '#9ca3af' : '#6b7280' },
        formatter: function(val: number) {
          return val.toLocaleString();
        }
      }
    },
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
      y: {
        formatter: function(val: number) {
          return val.toLocaleString() + ' MB/s';
        }
      }
    }
  };

  const enduranceChartOptions = {
    ...iopsChartOptions,
    xaxis: {
      categories: ['Endurance (TBW)'],
      labels: {
        style: { colors: isDarkMode ? '#9ca3af' : '#6b7280' }
      }
    },
    yaxis: {
      title: {
        text: 'Terabytes Written',
        style: { color: isDarkMode ? '#9ca3af' : '#6b7280' }
      },
      labels: {
        style: { colors: isDarkMode ? '#9ca3af' : '#6b7280' },
        formatter: function(val: number) {
          return val.toLocaleString();
        }
      }
    },
    tooltip: {
      theme: isDarkMode ? 'dark' : 'light',
      y: {
        formatter: function(val: number) {
          return val.toLocaleString() + ' TBW';
        }
      }
    }
  };

  const iopsChartSeries = selectedDrives.map((config) => ({
    name: config.drive.model,
    data: [
      config.drive.iopsQD1 || 0,
      config.drive.iopsMaxRandomRead || 0
    ]
  }));

  const bandwidthChartSeries = selectedDrives.map((config) => ({
    name: config.drive.model,
    data: [
      config.drive.bandwidthSequentialRead || 0,
      config.drive.bandwidthSequentialWrite || 0
    ]
  }));

  const enduranceChartSeries = selectedDrives.map((config) => ({
    name: config.drive.model,
    data: [config.drive.enduranceTBW || 0]
  }));

  return (
    <div className="space-y-6">
      <Card className="dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">IOPS Performance</h2>
        <div className="h-[400px]">
          <Suspense fallback={<div className="dark:text-white">Loading chart...</div>}>
            <ReactApexChart
              type="bar"
              height={400}
              options={iopsChartOptions}
              series={iopsChartSeries}
            />
          </Suspense>
        </div>
      </Card>

      <Card className="dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Bandwidth Performance</h2>
        <div className="h-[400px]">
          <Suspense fallback={<div className="dark:text-white">Loading chart...</div>}>
            <ReactApexChart
              type="bar"
              height={400}
              options={bandwidthChartOptions}
              series={bandwidthChartSeries}
            />
          </Suspense>
        </div>
      </Card>

      <Card className="dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Drive Endurance</h2>
        <div className="h-[400px]">
          <Suspense fallback={<div className="dark:text-white">Loading chart...</div>}>
            <ReactApexChart
              type="bar"
              height={400}
              options={enduranceChartOptions}
              series={enduranceChartSeries}
            />
          </Suspense>
        </div>
      </Card>
    </div>
  );
}