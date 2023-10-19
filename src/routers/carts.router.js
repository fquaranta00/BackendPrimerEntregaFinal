import { Router } from "express";
import CartManager from "../cartManager.js";
import ProductManager from "../productManager.js";
const cartsRouter = Router();


// Endpoint para obtener todos los carritos
cartsRouter.get('/carts', async (req, res) => {
    try {
        const carts = await CartManager.getJSONFromFile(); 
        res.status(200).json(carts);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Endpoint para obtener un carrito por ID
cartsRouter.get('/carts/:cartId', async (req, res) => {
    try {
        const { cartId } = req.params;
        const carts = await CartManager.getJSONFromFile();
        const cart = carts.find(cart => cart.id === cartId);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }
        res.status(200).json(cart);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Endpoint para crear un nuevo carrito
cartsRouter.post('/carts', async (req, res) => {
    try {
        const newCart = {
            id: CartManager.getNewId(),
            products: []
        };
        const carts = await CartManager.getJSONFromFile();
        carts.push(newCart);
        await CartManager.saveJSONToFile(carts);
        res.status(200).json(newCart);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Endpoint para agregar un producto a un carrito
cartsRouter.post('/carts/:cartId/products/:productId', async (req, res) => {
    try {
        const { cartId, productId } = req.params;
        const quantity = 1; // Siempre incrementamos la cantidad en 1

        if (!productId) {
            throw new Error('No se proporcionó productId.');
        }

        const carts = await CartManager.getJSONFromFile();
        const cartIndex = carts.findIndex(cart => cart.id === cartId);

        if (cartIndex === -1) {
            throw new Error('Carrito no encontrado');
        }

        const cart = carts[cartIndex];

        // validación del producto
        const product = await ProductManager.getProductsById(productId);
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        const existingProductIndex = cart.products.findIndex(product => product.productId === productId);

        if (existingProductIndex !== -1) {
            // Si el producto ya existe en el carrito, incrementa la cantidad
            cart.products[existingProductIndex].quantity += quantity;
        } else {
            // Si el producto no existe en el carrito, lo agrega
            const newProduct = { productId, quantity };
            cart.products.push(newProduct);
        }

        await CartManager.saveJSONToFile(carts);
        res.status(200).json({ message: 'Producto agregado al carrito correctamente' });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});


// Endpoint para eliminar un carrito por ID
cartsRouter.delete('/carts/:cartId', async (req, res) => {
    try {
        const { cartId } = req.params;
        const carts = await CartManager.getJSONFromFile();
        const updatedCarts = carts.filter(cart => cart.id !== cartId);

        if (updatedCarts.length === carts.length) {
            throw new Error('Carrito no encontrado');
        }

        await CartManager.saveJSONToFile(updatedCarts);
        res.status(200).json({ message: 'Carrito eliminado exitosamente' });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export default cartsRouter;
