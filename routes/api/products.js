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

// @route   POST producto/:id
// @desc    Modificar producto
// @access  Private
router.patch('/:id', auth, (req, res) => {
    const {id} = req.params;

    if (updateProduct(id, req.body)) {
        res.json(product);
    } else {
        res.status(400).send({ error: "Invalid ID" })
    }
});


const updateProduct = (id, producto) => {
    let pos = products.findIndex(pr => pr.id == id);

    if (pos) {
        products[pos].nombre = (producto.nombre) ? producto.nombre : products[pos].nombre;
        products[pos].marca = (producto.marca) ? producto.marca : products[pos].marca;

        Object.assign(products[pos], producto);
        fs.writeFileSync('./data/products.json', JSON.stringify(products));
        return true;
    } else{
        return false;
    }
};

//
// app.route('/producto')
//     .post(auth, (req, res) => {
//         let body = req.body;
//         body.id = productos.length + 1;
//
//         if (body.nombre && body.marca && body.precio > 0 && body.descripcion && body.existencia > 0) {
//             productos.push(body);
//             fs.writeFileSync('productos.json', JSON.stringify(productos));
//             res.status(201).send(body);
//             return;
//         }
//
//         res.status(400).send({
//             error: "Faltan atributos en el body"
//         })
//     });

module.exports = router;
