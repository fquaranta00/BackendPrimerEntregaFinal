import { Router } from "express";
import { cartManager } from '../utils.js';
const cartsRouter = Router();


// Endpoint para obtener todos los carritos
cartsRouter.get('/carts', async (req, res) => {
    try {
        const carts = await cartManager.getJSONFromFile(); 
        res.json(carts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para obtener un carrito por ID
cartsRouter.get('/carts/:cartId', async (req, res) => {
    try {
        const { cartId } = req.params;
        const carts = await cartManager.getJSONFromFile();
        console.log(carts);
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
cartsRouter.post('/carts', async (req, res) => {
    try {
        const newCart = {
            id: cartManager.getNewId(),
            products: []
        };
        const carts = await cartManager.getJSONFromFile();
        carts.push(newCart);
        await cartManager.saveJSONToFile(carts);
        res.json(newCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para agregar un producto a un carrito
cartsRouter.post('/carts/:cartId/products', async (req, res) => {
    try {
        const { cartId } = req.params;
        const { productId, quantity } = req.body;

        if (!productId || !quantity || typeof quantity !== 'number' || quantity <= 0) {
            throw new Error('Formato de solicitud inválido. Asegúrate de incluir productId y una cantidad válida.');
        }

        const carts = await cartManager.getJSONFromFile();
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
            // Si el producto no existe en el carrito, lo agrega
            cart.products.push({ productId, quantity });
        }

        await cartManager.saveJSONToFile(carts);
        res.json({ message: 'Producto agregado al carrito correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Endpoint para eliminar un carrito por ID
cartsRouter.delete('/carts/:cartId', async (req, res) => {
    try {
        const { cartId } = req.params;
        const carts = await cartManager.getJSONFromFile();
        const updatedCarts = carts.filter(cart => cart.id !== cartId);

        if (updatedCarts.length === carts.length) {
            throw new Error('Carrito no encontrado');
        }

        await cartManager.saveJSONToFile(updatedCarts);
        res.json({ message: 'Carrito eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default cartsRouter;
