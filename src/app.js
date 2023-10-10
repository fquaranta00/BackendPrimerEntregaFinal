import express from "express";
import productsRouter from "../src/routers/products.router.js";
import cartsRouter from "../src/routers/carts.router.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', productsRouter, cartsRouter);

app.listen(8080, () => {
    console.log("🚀 Server running on http://localhost:8080")
});
