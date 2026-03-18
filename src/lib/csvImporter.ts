import Papa from 'papaparse';
import { supabase } from './supabase';
import { CSV_COLUMN_MAPPING } from '../config/csvColumns';

export interface PropertyRow {
  [key: string]: string | number | null;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  importedRows: number;
  errors: ImportError[];
  duplicates: number;
}

export interface ImportError {
  row: number;
  address?: string;
  error: string;
}

export interface ImportProgress {
  current: number;
  total: number;
  percentage: number;
  currentRow?: PropertyRow;
}

type ProgressCallback = (progress: ImportProgress) => void;

const EMPTY_VALUES = ['0', '0.000000000', '', 'null', 'undefined', null, undefined];

export function cleanValue(value: unknown): string | number | null {
  if (value === null || value === undefined) return null;
  const strValue = String(value).trim();
  if (EMPTY_VALUES.includes(strValue)) return null;
  return strValue;
}

export function cleanNumericValue(value: unknown): number | null {
  const cleaned = cleanValue(value);
  if (cleaned === null) return null;
  const num = parseFloat(String(cleaned).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? null : num;
}

export function cleanDateValue(value: unknown): string | null {
  const cleaned = cleanValue(value);
  if (cleaned === null) return null;
  const date = new Date(String(cleaned));
  if (isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
}

export function mapCsvToDb(row: Record<string, unknown>): PropertyRow {
  const mapped: PropertyRow = {};
  
  for (const [csvColumn, dbColumn] of Object.entries(CSV_COLUMN_MAPPING)) {
    const rawValue = row[csvColumn] ?? row[csvColumn.toLowerCase()] ?? row[csvColumn.toUpperCase()];
    
    if (rawValue === undefined || rawValue === null) {
      mapped[dbColumn] = null;
      continue;
    }
    
    mapped[dbColumn] = cleanValue(rawValue);
  }
  
  return mapped;
}

export function validatePropertyRow(row: PropertyRow): string[] {
  const errors: string[] = [];
  
  if (!row.address || typeof row.address !== 'string' || row.address.trim().length === 0) {
    errors.push('Missing or invalid address');
  }
  
  if (!row.city || typeof row.city !== 'string' || row.city.trim().length === 0) {
    errors.push('Missing or invalid city');
  }
  
  return errors;
}

export async function checkExistingProperties(
  externalIds: string[]
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('properties')
    .select('external_id')
    .in('external_id', externalIds);
  
  if (error) {
    console.error('Error checking existing properties:', error);
    return new Set();
  }
  
  return new Set(data.map((p) => p.external_id));
}

export async function insertPropertiesBatch(
  rows: PropertyRow[],
  batchSize: number = 100
): Promise<{ success: boolean; error?: string }> {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from('properties').insert(batch);
    
    if (error) {
      return { success: false, error: `Batch ${Math.floor(i / batchSize) + 1}: ${error.message}` };
    }
  }
  
  return { success: true };
}

export async function importCsvFile(
  file: File,
  options: {
    skipDuplicates?: boolean;
    onProgress?: ProgressCallback;
    batchSize?: number;
  } = {}
): Promise<ImportResult> {
  const { skipDuplicates = true, onProgress, batchSize = 100 } = options;
  
  return new Promise((resolve) => {
    const result: ImportResult = {
      success: false,
      totalRows: 0,
      importedRows: 0,
      errors: [],
      duplicates: 0,
    };
    
    const mappedRows: PropertyRow[] = [];
    const externalIds: string[] = [];
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().replace(/^"|"$/g, ''),
      complete: async (parseResult) => {
        try {
          result.totalRows = parseResult.data.length;
          
          for (let i = 0; i < parseResult.data.length; i++) {
            const row = parseResult.data[i] as Record<string, unknown>;
            const mappedRow = mapCsvToDb(row);
            const address = mappedRow.address as string | undefined;
            
            if (onProgress) {
              onProgress({
                current: i + 1,
                total: result.totalRows,
                percentage: Math.round(((i + 1) / result.totalRows) * 100),
                currentRow: mappedRow,
              });
            }
            
            const validationErrors = validatePropertyRow(mappedRow);
            if (validationErrors.length > 0) {
              result.errors.push({
                row: i + 1,
                address,
                error: validationErrors.join('; '),
              });
              continue;
            }
            
            mappedRows.push(mappedRow);
            if (mappedRow.external_id) {
              externalIds.push(mappedRow.external_id as string);
            }
          }
          
          if (mappedRows.length === 0) {
            result.success = true;
            resolve(result);
            return;
          }
          
          const existingIds = skipDuplicates ? await checkExistingProperties(externalIds) : new Set<string>();
          
          const rowsToInsert = mappedRows.filter((row) => {
            if (!skipDuplicates) return true;
            const extId = row.external_id as string;
            return !extId || !existingIds.has(extId);
          });
          
          result.duplicates = mappedRows.length - rowsToInsert.length;
          
          if (rowsToInsert.length > 0) {
            const insertResult = await insertPropertiesBatch(rowsToInsert, batchSize);
            
            if (!insertResult.success) {
              result.errors.push({
                row: -1,
                error: insertResult.error,
              });
            } else {
              result.importedRows = rowsToInsert.length;
            }
          }
          
          result.success = result.errors.length === 0;
        } catch (error) {
          result.errors.push({
            row: -1,
            error: error instanceof Error ? error.message : 'Unknown error during import',
          });
        }
        
        resolve(result);
      },
      error: (error) => {
        result.errors.push({
          row: -1,
          error: `Parse error: ${error.message}`,
        });
        resolve(result);
      },
    });
  });
}

export function previewCsvFile(file: File): Promise<{
  headers: string[];
  sampleRows: Record<string, unknown>[];
  unmappedColumns: string[];
}> {
  return new Promise((resolve) => {
    const headers: string[] = [];
    const sampleRows: Record<string, unknown>[] = [];
    const csvToDbMap = Object.keys(CSV_COLUMN_MAPPING);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().replace(/^"|"$/g, ''),
      preview: 5,
      complete: (parseResult) => {
        if (parseResult.meta.fields) {
          headers.push(...parseResult.meta.fields);
        }
        
        for (const row of parseResult.data) {
          if (sampleRows.length < 5 && typeof row === 'object') {
            sampleRows.push(row as Record<string, unknown>);
          }
        }
        
        const unmappedColumns = headers.filter(
          (h) => !csvToDbMap.includes(h) && !csvToDbMap.includes(h.toLowerCase())
        );
        
        resolve({
          headers,
          sampleRows,
          unmappedColumns,
        });
      },
    });
  });
}
