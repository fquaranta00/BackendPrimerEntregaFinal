import { Router } from "express";
import ProductManager from '../productManager.js';
const productsRouter = Router();


// Endpoint para obtener productos
productsRouter.get('/products', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
        const products = await ProductManager.getJSONFromFile();

        if (limit !== null) {
            res.status(200).json(products.slice(0, limit));
        } else {
            res.status(200).json(products);
        }
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Endpoint para obtener productos especificos
productsRouter.get('/products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await ProductManager.getProductsById(productId);
        res.status(200).json(product);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Endpoint para agregar un producto
productsRouter.post('/products', async (req, res) => {
    try {
        const product = req.body;
        const addedProduct = await ProductManager.addProduct(product); // Obtener el producto completo
        const { id } = addedProduct; // Obtener el ID del producto
        res.status(200).json({ message: `Producto ID: ${id}, agregado correctamente.` });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Endpoint para actualizar un producto
productsRouter.put('/products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const updateFields = req.body;

        if ('id' in updateFields) {
            throw new Error('No puedes actualizar el campo "id".');
        }

        if (Object.keys(updateFields).length === 0) {
            throw new Error('Debes proporcionar al menos un campo para actualizar.');
        }

        const updatedProduct = await ProductManager.updateProduct(productId, updateFields);
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Endpoint para eliminar un producto
productsRouter.delete('/products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await ProductManager.deleteProduct(productId);
        res.status(200).json({ message: result });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export default productsRouter;
