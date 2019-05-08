'use strict'
const express = require('express');
const fs = require('fs');
const chalk = require('chalk');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express()
const port = 3000

let productos = JSON.parse(fs.readFileSync('productos.json'));
let usuarios = JSON.parse(fs.readFileSync('usuarios.json'));
let tokens = [];
let jsonParser = bodyParser.json();

app.use(jsonParser);
app.use(cors());
app.use(logger)

app.route('/producto')
    .get((req, res) => {
        if (req.query.marca) {
            let productosFiltro = productos.filter(al => al.marca === req.query.marca)
            res.json(productosFiltro);
        } else {
            res.json(productos);
        }
    })
    .post(auth, (req, res) => {
        let body = req.body;
        body.id = productos.length + 1;

        if (body.nombre && body.marca && body.precio > 0 && body.descripcion && body.existencia > 0) {
            productos.push(body);
            fs.writeFileSync('productos.json', JSON.stringify(productos));
            res.status(201).send(body);
            return;
        }

        res.status(400).send({
            error: "Faltan atributos en el body"
        })
    })

app.route('/producto/:id')
    .get((req, res) => {
        let id = req.params.id;
        let producto = productos.find(prod => prod.id == id);

        if (producto) {
            res.json(producto);
            return;
        }

        res.json({
            error: "no existe"
        });
    })
    .patch(auth, (req, res) => {
        let id = req.params.id;
        let body = req.body;
        if (partialUpdateAlumno(id, body)) {
            res.send();
        } else {
            res.status(400).send({ error: "Faltan datos o id incorrecto" })
        }
    })

app.route('/usuario/login')
    .post((req, res) => {
        let body = req.body;

        if (body.usuario && body.password && body.password.length > 5) {
            let user = usuarios.find(user => user.usuario === body.usuario);
            if (user && user.password === body.password) {
                var d = new Date();
                d.setMinutes(5);
                tokens.push({token:"ajkndsadasdasdas", expiration:d})
                res.header("x-auth", "ajkndsadasdasdas")
                res.status(200).send({usuario:body.usuario});
                return; 
            }
            res.status(401).send({
                error: "Failed"
            })
            return;
        }

        res.status(400).send({
            error: "Faltan atributos en el body"
        })
    })



app.listen(port, () => console.log(`Example app listening on port http://127.0.0.1:${port}!`))

function updateAlumno(id, alumno) {
    let pos = alumnos.findIndex(al => al.id == id);

    if (alumno.id && alumno.nombre && alumno.edad && id == alumno.id) {
        Object.assign(alumnos[pos], alumno);
        fs.writeFileSync('alumnos.json', JSON.stringify(alumnos));
        return true;
    }
    return false;
}

function partialUpdateAlumno(id, alumno) {
    let pos = alumnos.findIndex(al => al.id == id);

    alumnos[pos].nombre = (alumno.nombre) ? alumno.nombre : alumnos[pos].nombre;
    alumnos[pos].edad = (alumno.edad) ? alumno.edad : alumnos[pos].edad;

    Object.assign(alumnos[pos], alumno);
    fs.writeFileSync('alumnos.json', JSON.stringify(alumnos));
    return true;

}

function auth(req, res, next) {
    let id = req.params.id;
    let pos = alumnos.findIndex(al => al.id == id);
    if (pos == -1) {
        res.status(404).send({ error: "Id no existe" });
        return;
    }
    next();
}

function logger(req, res, next) {
    console.log("method", req.method);
    console.log("url", req.originalUrl);
    console.log("date", new Date(Date.now()).toString());
    console.log("content-type", req.get('Content-Type'));
    console.log("x-auth", req.get('x-auth'));
    console.log("x-user", req.get('x-user'));
    next();
}