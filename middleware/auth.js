const jwt = require('jsonwebtoken');
const fs = require('fs');

const users = JSON.parse(fs.readFileSync('./data/users.json'));
const keys = JSON.parse(fs.readFileSync('./config/keys.json'));


module.exports = (req, res, next) => {
    // Obtener tokens del header
    const token = req.header('x-auth');
    const xuser = req.header('x-user');

    // Verificar usuario
    if (!users.find(user => user.username === xuser)){
        res.status(406).json({msg: 'El usuario no existe'});
        return;
    }

    // Si no existe un token se rechaza la solicitud
    if (!token) {
        return res.status(401).json({msg: 'No token, authorization denied'});
    }

    // Verificar token
    try {
        if(jwt.verify(token, keys.jwtSecret)){
            next();
        }
    } catch (e) {
        res.status(401).json({msg: 'Token is not valid'});
    }
};
