import Papa from 'papaparse';
import { DriveData } from '../types/tco';

export const parseCSV = async (file: File): Promise<DriveData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        resolve(results.data as DriveData[]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export function parseDriveData(csvData: string): DriveData[] {
  try {
    const lines = csvData.split('\n');
    if (lines.length < 2) {
      console.error('CSV data has insufficient lines:', lines);
      return [];
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    console.log('CSV Headers:', headers);

    const drives = lines.slice(1)
      .filter(line => line.trim())
      .map((line, index) => {
        try {
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          console.log(`Row ${index + 1} values:`, values);
          
          const row = Object.fromEntries(headers.map((h, i) => [h, values[i]]));
          console.log(`Row ${index + 1} parsed:`, row);
          
          if (!row['Vendor'] || !row['Model Name'] || !row['Capacity (TB)'] || !row['Price ($/TB)'] || !row['Power Active (W)']) {
            console.error(`Missing required fields in row ${index + 1}:`, row);
            return null;
          }

          const drive = {
            model: `${row['Vendor']} ${row['Model Name']}`.trim(),
            capacityTB: parseFloat(row['Capacity (TB)']),
            price: parseFloat(row['Price ($/TB)']) * parseFloat(row['Capacity (TB)']),
            powerActiveW: parseFloat(row['Power Active (W)']),
            powerIdleW: parseFloat(row['Power Idle (W)']),
            interface: row['Interface'],
            afr: parseFloat(row['AFR (%)']),
            iopsQD1: row['IOPS QD1'] === 'N/A' ? null : parseFloat(row['IOPS QD1']),
            iopsMaxRandomRead: row['IOPS Max Random Read'] === 'N/A' ? null : parseFloat(row['IOPS Max Random Read']),
            bandwidthSequentialRead: row['Bandwidth Sequential Read (MB/s)'] === 'N/A' ? null : parseFloat(row['Bandwidth Sequential Read (MB/s)']),
            bandwidthSequentialWrite: row['Bandwidth Sequential Write (MB/s)'] === 'N/A' ? null : parseFloat(row['Bandwidth Sequential Write (MB/s)']),
            enduranceTBW: row['Endurance (TBW)'] === 'N/A' ? null : parseFloat(row['Endurance (TBW)'])
          };

          if (isNaN(drive.capacityTB) || isNaN(drive.price) || isNaN(drive.powerActiveW) || isNaN(drive.powerIdleW)) {
            console.error(`Invalid numeric values in row ${index + 1}:`, drive);
            return null;
          }

          console.log(`Row ${index + 1} final drive:`, drive);
          return drive;
        } catch (err) {
          console.error(`Error parsing row ${index + 1}:`, err);
          return null;
        }
      })
      .filter((drive): drive is DriveData => drive !== null);

    if (drives.length === 0) {
      console.error('No valid drives parsed from CSV');
    } else {
      console.log(`Successfully parsed ${drives.length} drives`);
    }

    return drives;
  } catch (err) {
    console.error('Error parsing CSV data:', err);
    return [];
  }
} 