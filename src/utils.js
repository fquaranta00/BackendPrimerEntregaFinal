import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';

const getJSONFromFile = async (path) => {
    try {
        await fs.access(path);
    } catch (error) {
        console.error(`Error al acceder al archivo ${path}:`, error);
        return [];
    }
    const content = await fs.readFile(path, 'utf-8');
    try {
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error al parsear el contenido del archivo ${path}:`, error);
        throw new Error(`El archivo ${path} no tiene un formato JSON válido.`);
    }
}

const saveJSONToFile = async (path, data) => {
    const content = JSON.stringify(data, null, '\t');
    try {
        await fs.writeFile(path, content, 'utf-8');
    } catch (error) {
        throw new Error(`El archivo ${path} no pudo ser escrito.`);
    }
}

const getProductsById = async (productId, path) => {
    console.log(productId);
    console.log(path);
    const products = await getJSONFromFile(path);
    const product = products.find(obj => obj.id === parseInt(productId, 10));
    console.log("Mostrar productos: ", product);
    if (!product) {
        throw new Error('Producto no encontrado');
    }

    return product;
}


const updateProduct = async (productId, updatedFields, path) => {
    const products = await getJSONFromFile(path);

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

    await saveJSONToFile(path, updatedProducts);
    const updatedProductResult = updatedProducts.find(product => product.id === productId);

    if (!updatedProductResult) {
        return "Producto no encontrado";
    }

    return updatedProductResult;
}



const addProduct = async (product, path) => {
    const { title, description, price, thumbnail, code, stock, status, category } = product;

    if (!title || !description || !price || !thumbnail || !code || !stock || !status || !category) {
        throw new Error('Todos los campos son obligatorios.');
    }
    const products = await getJSONFromFile(path);

    const existingProduct = products.find(p => p.code === code);
    if (existingProduct) {
        throw new Error('El código del producto ya está en uso.');
    }

    const id = uuidv4(); // Generar un nuevo ID utilizando UUID
    const newProduct = { id, title, description, price, thumbnail, code, stock, status, category };
    products.push(newProduct);
    await saveJSONToFile(path, products);
}


const deleteProduct = async (productId, path) => {
    const products = await getJSONFromFile(path);
    const updatedProducts = products.filter(product => product.id !== productId);
    await saveJSONToFile(path, updatedProducts);
    if (products.length === updatedProducts.length) {
        return "Producto no encontrado";
    }
    return "Producto eliminado exitosamente";
}

const getNewId = () => uuidv4();

export {
    getJSONFromFile,
    saveJSONToFile,
    getProductsById,
    updateProduct,
    addProduct,
    deleteProduct,
    getNewId,
};
