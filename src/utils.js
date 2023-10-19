import { promises as fs } from 'fs';
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export const getJSONFromFile = async (filePath) => {
  try {
    await fs.access(filePath);
  } catch (error) {
    console.error(`Error al acceder al archivo ${filePath}:`, error);
    return [];
  }
  const content = await fs.readFile(filePath, 'utf-8');
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error al parsear el contenido del archivo ${filePath}:`, error);
    throw new Error(`El archivo ${filePath} no tiene un formato JSON válido.`);
  }
}

export const saveJSONToFile = async (filePath, data) => {
  const content = JSON.stringify(data, null, '\t');
  try {
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`El archivo ${filePath} no pudo ser escrito.`);
  }
}
