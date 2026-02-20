import { UploadedFile, SchemaCompressed } from '../types';

export function compressSchema(files: UploadedFile[]): SchemaCompressed {
  const compressed: SchemaCompressed = {};

  for (const file of files) {
    const columns: Record<string, string> = {};

    for (const col of file.columns) {
      const sampleValues = file.data
        .map((row) => row[col])
        .filter((v) => v !== null && v !== undefined)
        .slice(0, 5);

      const types = new Set(
        sampleValues.map((v) => {
          if (typeof v === 'number') return 'number';
          if (typeof v === 'boolean') return 'boolean';
          if (v instanceof Date) return 'date';
          return 'string';
        })
      );

      const typeStr = Array.from(types).join('/');
      columns[col] = typeStr;
    }

    compressed[file.name] = {
      description: `Dataset with ${file.shape[0]} rows and ${file.shape[1]} columns`,
      rows: file.shape[0],
      columns,
    };
  }

  return compressed;
}

export function getSchemaContext(schema: SchemaCompressed): string {
  let context = 'DATA SCHEMA:\n\n';

  for (const [fileName, fileSchema] of Object.entries(schema)) {
    context += `File: ${fileName}\n`;
    context += `Description: ${fileSchema.description}\n`;
    context += `Columns: ${Object.keys(fileSchema.columns).join(', ')}\n`;
    context += `Column Types: ${JSON.stringify(fileSchema.columns, null, 2)}\n\n`;
  }

  return context;
}
