const express = require('express');
const router = express.Router();
const fs = require('fs');
const auth = require('../../middleware/auth');

const products = JSON.parse(fs.readFileSync('./data/products.json'));

// @route   GET producto/
// @desc    Obtener todos los productos
// @access  Public
router.get('/', (req, res) => {
    const {marca} = req.body;

    if (marca) {
        const filteredProducts = products.filter(pr => pr.marca === marca);
        res.json(filteredProducts);
    } else {
        res.json(products);
    }
});

// @route   POST producto/
// @desc    Agregar producto
// @access  Private
router.post('/', auth, (req, res) => {
    const {
        nombre,
        marca,
        precio,
        descripcion,
        existencia
    } = req.body;

    req.body.id = products.length;

    if (nombre && marca && precio && descripcion && existencia > 0) {
        products.push(req.body);
        fs.writeFileSync('./data/products.json', JSON.stringify(products));
        res.status(201).send(req.body);
        return;
    }

    res.status(400).send({error: "Faltan atributos"});

});

// @route   GET producto/:id
// @desc    Obtener producto
// @access  Public
router.get('/:id', (req, res) => {
    const {id} = req.params;

    const product = products.find(pr => pr.id == id);

    if (product) {
        res.json(product);
        return;
    }

    res.json({error: "no existe"});
});

// @route   PATCH producto/:id
// @desc    Actualizar producto mediante ID
// @access  Private
router.patch('/:id', auth, (req, res) => {
    const {id} = req.params;

    const product = req.body;

    if (updateProduct(id, product)) {
        res.json(product);
    } else {
        res.status(400).send({ error: "Invalid ID" })
    }
});

// Actualizar producto
const updateProduct = (id, producto) => {
    let pos = products.findIndex(pr => pr.id == id);

    if (pos >= 0) {
        products[pos].nombre = (producto.nombre) ? producto.nombre : products[pos].nombre;
        products[pos].marca = (producto.marca) ? producto.marca : products[pos].marca;
        products[pos].descripcion = (producto.descripcion) ? producto.descripcion: products[pos].descripcion;
        products[pos].precio = (producto.precio) ? (producto.precio >= 0 ? producto.precio : products[pos].precio) : products[pos].precio;
        products[pos].existencia = (producto.existencia) ? (producto.existencia >= 0 ? producto.existencia : products[pos].existencia) : productos[pos].existencia;

        fs.writeFileSync('./data/products.json', JSON.stringify(products));
        return true;
    } else{
        return false;
    }
};

module.exports = router;
