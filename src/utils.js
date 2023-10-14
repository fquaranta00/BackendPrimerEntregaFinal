import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ProductManager {
  constructor(productsPath) {
    this.productsPath = productsPath;
  }

  async getJSONFromFile() {
    try {
      await fs.access(this.productsPath);
    } catch (error) {
      console.error(`Error al acceder al archivo ${this.productsPath}:`, error);
      return [];
    }
    const content = await fs.readFile(this.productsPath, 'utf-8');
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error al parsear el contenido del archivo ${this.productsPath}:`, error);
      throw new Error(`El archivo ${this.productsPath} no tiene un formato JSON válido.`);
    }
  }

  async saveJSONToFile(data) {
    const content = JSON.stringify(data, null, '\t');
    try {
      await fs.writeFile(this.productsPath, content, 'utf-8');
    } catch (error) {
      throw new Error(`El archivo ${this.productsPath} no pudo ser escrito.`);
    }
  }
  
  async getProductsById(productId) {
    try {
      const products = await this.getJSONFromFile();
      const product = products.find(obj => obj.id === productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      return product;
    } catch (error) {
      console.error('Error al obtener producto por ID:', error);
      throw error; // Re-lanza el error para que pueda ser manejado más arriba
    }
  }
  

  async updateProduct(productId, updatedFields) {
    const products = await this.getJSONFromFile();
    let fieldFound = false;
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        for (const field in updatedFields) {
          if (field !== 'id') {
            if (field === 'code') {
              const isCodeUnique = !products.some(p => p.code === updatedFields[field]);
              if (!isCodeUnique) {
                throw new Error(`El código '${updatedFields[field]}' ya está en uso.`);
              }
            }
            if (!product.hasOwnProperty(field)) {
              throw new Error(`El campo '${field}' no existe en los productos.`);
            }
            fieldFound = true;
            product[field] = updatedFields[field];
          }
        }
      }
      return product;
    });

    if (!fieldFound) {
      throw new Error(`El producto con ID '${productId}' no fue encontrado.`);
    }

    await this.saveJSONToFile(updatedProducts);
    const updatedProductResult = updatedProducts.find(product => product.id === productId);

    if (!updatedProductResult) {
      return "Producto no encontrado";
    }

    return updatedProductResult;
  }

  async addProduct(product) {
    const { title, description, code, price, stock, category, thumbnail } = product;

    if (!title || !description || !price || !code || !stock || !category) {
      throw new Error('Todos los campos son obligatorios.');
    }
    const products = await this.getJSONFromFile();

    const existingProduct = products.find(p => p.code === code);
    if (existingProduct) {
      throw new Error('El código del producto ya está en uso.');
    }

    const id = uuidv4(); // Generar un nuevo ID utilizando UUID
    const status = true;
    const newProduct = { id, title, description, code, price, status, stock, category, thumbnail };
    products.push(newProduct);
    await this.saveJSONToFile(products);
  }

  async deleteProduct(productId) {
    const products = await this.getJSONFromFile();
    const updatedProducts = products.filter(product => product.id !== productId);
    await this.saveJSONToFile(updatedProducts);
    if (products.length === updatedProducts.length) {
      return "Producto no encontrado";
    }
    return "Producto eliminado exitosamente";
  }

  getNewId() {
    return uuidv4();
  }
}

class CartManager {
    constructor(cartsPath) {
      this.cartsPath = cartsPath;
    }
  
    async getJSONFromFile() {
      try {
        await fs.access(this.cartsPath);
      } catch (error) {
        console.error(`Error al acceder al archivo ${this.cartsPath}:`, error);
        return [];
      }
      const content = await fs.readFile(this.cartsPath, 'utf-8');
      try {
        return JSON.parse(content);
      } catch (error) {
        console.error(`Error al parsear el contenido del archivo ${this.cartsPath}:`, error);
        throw new Error(`El archivo ${this.cartsPath} no tiene un formato JSON válido.`);
      }
    }
  
    async saveJSONToFile(data) {
      const content = JSON.stringify(data, null, '\t');
      try {
        await fs.writeFile(this.cartsPath, content, 'utf-8');
      } catch (error) {
        throw new Error(`El archivo ${this.cartsPath} no pudo ser escrito.`);
      }
    }

    getNewId() {
      return uuidv4();
    }

}  

const productsPath = path.join(__dirname, './products.json');
const cartsPath = path.join(__dirname, './carts.json');

export default new ProductManager(productsPath);

export const cartManager = new CartManager(cartsPath);
