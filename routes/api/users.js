const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const auth = require('../../middleware/auth');

const users = JSON.parse(fs.readFileSync('./data/users.json'));
const keys = JSON.parse(fs.readFileSync('./config/keys.json'));

// @route   POST usuarios/login
// @desc    Autenticar usuario y generar token
// @access  Public
router.post('/login', (req, res) => {
    const {username, password} = req.body;

    try {
        // Checar usuario y contraseña
        if (!users.find(user => {
            return user.password === password && user.username === username
        })) {
            return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]});
        }

        // Se agrega payload
        const payload = {
        };

        // Expira en 5 minutos
        jwt.sign(
            payload,
            keys.jwtSecret,
            {expiresIn: 300},
            (err, token) => {
                if (err) throw err;
                res.json({token});
            });

    } catch (e) {
        console.error(e.message);
        res.status(500).send('Server error');
    }
});

// @route   POST usuarios/logout
// @desc    Modifica el jwtSecret
// @access  Private
router.post('/logout', auth, (req, res) => {
    const newToken = {
        "jwtSecret": makeid(50)
    };
    fs.writeFileSync('./config/keys.json', JSON.stringify(newToken));
    res.status(200).send('User logged out');
});

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


module.exports = router;
