import { Router } from "express";
import { v4 as uuidv4 } from 'uuid';
import { getJSONFromFile, saveJSONToFile } from '../utils.js';

const cartRouter = Router();
const cartPath = './carts.json'; // Asegúrate de que esta sea la ruta correcta

// Endpoint para obtener todos los carritos
cartRouter.get('/carts', async (req, res) => {
    try {
        const carts = await getJSONFromFile(cartPath);
        res.json(carts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para obtener un carrito por ID
cartRouter.get('/carts/:cartId', async (req, res) => {
    try {
        const { cartId } = req.params;
        const carts = await getJSONFromFile(cartPath);
        const cart = carts.find(cart => cart.id === cartId);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para crear un nuevo carrito
cartRouter.post('/carts', async (req, res) => {
    try {
        const newCart = {
            id: uuidv4(),
            products: []
        };
        // console.log("entrando a carts");
        const carts = await getJSONFromFile(cartPath);
        carts.push(newCart);
        await saveJSONToFile(cartPath, carts);
        res.json(newCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para agregar un producto a un carrito
cartRouter.post('/carts/:cartId/products', async (req, res) => {
    try {
        const { cartId } = req.params;
        const { productId, quantity } = req.body;

        if (!productId || !quantity || typeof quantity !== 'number' || quantity <= 0) {
            throw new Error('Formato de solicitud inválido. Asegúrate de incluir productId y una cantidad válida.');
        }

        const carts = await getJSONFromFile(cartPath);
        const cartIndex = carts.findIndex(cart => cart.id === cartId);

        if (cartIndex === -1) {
            throw new Error('Carrito no encontrado');
        }

        const cart = carts[cartIndex];
        const existingProductIndex = cart.products.findIndex(product => product.productId === productId);

        if (existingProductIndex !== -1) {
            // Si el producto ya existe en el carrito, incrementa la cantidad
            cart.products[existingProductIndex].quantity += quantity;
        } else {
            // Si el producto no existe en el carrito, agrégalo
            cart.products.push({ productId, quantity });
        }

        await saveJSONToFile(cartPath, carts);
        res.json({ message: 'Producto agregado al carrito correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint para eliminar un carrito por ID
cartRouter.delete('/carts/:cartId', async (req, res) => {
    try {
        const { cartId } = req.params;
        const carts = await getJSONFromFile(cartPath);
        const updatedCarts = carts.filter(cart => cart.id !== cartId);

        if (updatedCarts.length === carts.length) {
            throw new Error('Carrito no encontrado');
        }

        await saveJSONToFile(cartPath, updatedCarts);
        res.json({ message: 'Carrito eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default cartRouter;
