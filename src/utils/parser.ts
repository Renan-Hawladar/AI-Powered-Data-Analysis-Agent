import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { UploadedFile } from '../types';

export function parseCSV(file: File): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const data = results.data as Record<string, unknown>[];
        const cleanedData = data.filter(
          (row) => Object.values(row).some((v) => v !== null && v !== undefined && v !== '')
        );

        const columns = Object.keys(cleanedData[0] || {});

        resolve({
          name: file.name,
          data: cleanedData,
          columns,
          shape: [cleanedData.length, columns.length],
        });
      },
      error: (error) => {
        reject(new Error(`CSV parse error: ${error.message}`));
      },
    });
  });
}

export function parseXLSX(file: File): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
        const cleanedData = jsonData.filter(
          (row) => Object.values(row).some((v) => v !== null && v !== undefined && v !== '')
        );

        const columns = Object.keys(cleanedData[0] || {});

        resolve({
          name: file.name,
          data: cleanedData,
          columns,
          shape: [cleanedData.length, columns.length],
        });
      } catch (error) {
        reject(new Error(`XLSX parse error: ${error instanceof Error ? error.message : String(error)}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('File read error'));
    };

    reader.readAsArrayBuffer(file);
  });
}

export async function parseFile(file: File): Promise<UploadedFile> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.csv')) {
    return parseCSV(file);
  }

  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    return parseXLSX(file);
  }

  throw new Error(`Unsupported file type: ${file.type}`);
}
