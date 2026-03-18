import { useState, useCallback } from 'react';
import {
  importCsvFile,
  previewCsvFile,
  type PropertyRow,
  type ImportResult,
  type ImportProgress,
} from '../lib/csvImporter';

interface UseCsvImporterReturn {
  importFile: (
    file: File,
    options?: {
      skipDuplicates?: boolean;
      batchSize?: number;
    }
  ) => Promise<ImportResult>;
  previewFile: (file: File) => Promise<{
    headers: string[];
    sampleRows: Record<string, unknown>[];
    unmappedColumns: string[];
  }>;
  progress: ImportProgress | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useCsvImporter(): UseCsvImporterReturn {
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const importFile = useCallback(
    async (
      file: File,
      options?: {
        skipDuplicates?: boolean;
        batchSize?: number;
      }
    ): Promise<ImportResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await importCsvFile(file, {
          ...options,
          onProgress: (prog) => setProgress(prog),
        });
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return {
          success: false,
          totalRows: 0,
          importedRows: 0,
          errors: [{ row: -1, error: errorMessage }],
          duplicates: 0,
        };
      } finally {
        setIsLoading(false);
        setProgress(null);
      }
    },
    []
  );

  const previewFile = useCallback(
    async (file: File): Promise<{
      headers: string[];
      sampleRows: Record<string, unknown>[];
      unmappedColumns: string[];
    }> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await previewCsvFile(file);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setProgress(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    importFile,
    previewFile,
    progress,
    isLoading,
    error,
    reset,
  };
}

export type { PropertyRow, ImportResult, ImportProgress };
