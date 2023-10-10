import { Router } from "express";
import { getJSONFromFile, saveJSONToFile, getProductsById, updateProduct, addProduct, deleteProduct, getNewId } from '../utils.js';

const router = Router();
const path = './products.json'; // Asegúrate de que esta sea la ruta correcta

// Endpoint para obtener productos
router.get('/products', async (req, res) => {
	try {
		const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
		const products = await getJSONFromFile(path);

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
router.get('/products/:productId', async (req, res) => {
	try {
		const { productId } = req.params;
		const product = await getProductsById(productId, path);
		res.json(product);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Endpoint para agregar un producto
router.post('/products', async (req, res) => {
	try {
		const product = req.body;
		await addProduct(product, path);
		res.json({ message: 'Producto agregado correctamente' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Endpoint para actualizar un producto
router.put('/products/:productId', async (req, res) => {
	try {
		const { productId } = req.params;
		const updateFields = req.body;

		// Verificar que el ID no esté incluido en los campos a actualizar
		if ('id' in updateFields) {
			throw new Error('No puedes actualizar el campo "id".');
		}

		if (Object.keys(updateFields).length === 0) {
			throw new Error('Debes proporcionar al menos un campo para actualizar.');
		}

		// Realizar la actualización del producto
		const updatedProduct = await updateProduct(productId, updateFields, path);
		res.json(updatedProduct);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});


// Endpoint para eliminar un producto
router.delete('/products/:productId', async (req, res) => {
	try {
		const { productId } = req.params;
		const result = await deleteProduct(productId, path);
		res.json({ message: result });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});


export default router;
