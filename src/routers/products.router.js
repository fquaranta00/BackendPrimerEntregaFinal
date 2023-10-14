import { Router } from "express";
import ProductManager from '../utils.js';
const productsRouter = Router();


// Endpoint para obtener productos
productsRouter.get('/products', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
        const products = await ProductManager.getJSONFromFile();

        if (limit !== null) {
            res.json(products.slice(0, limit));
        } else {
            res.json(products);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para obtener productos especificos
productsRouter.get('/products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await ProductManager.getProductsById(productId);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para agregar un producto
productsRouter.post('/products', async (req, res) => {
    try {
        const product = req.body;
        await ProductManager.addProduct(product);
        res.json({ message: 'Producto agregado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint para eliminar un producto
productsRouter.delete('/products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await ProductManager.deleteProduct(productId);
        res.json({ message: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default productsRouter;
