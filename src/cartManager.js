import { getJSONFromFile, saveJSONToFile, __dirname } from './utils.js';
import { v4 as uuidv4 } from 'uuid';
import path from "path";

class CartManager {
    constructor(cartsPath) {
      this.cartsPath = cartsPath;
    }
  
    async getJSONFromFile() {
      return await getJSONFromFile(this.cartsPath);
    }
  
    async saveJSONToFile(data) {
      return await saveJSONToFile(this.cartsPath, data);
    }

    getNewId() {
      return uuidv4();
    }

}

const cartsPath = path.join(__dirname, './carts.json');
export default new CartManager(cartsPath);
