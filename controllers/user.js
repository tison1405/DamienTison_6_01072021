const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
var cryptoJs = require('crypto-js');

exports.signup = (req, res, next) => {
  var key = cryptoJs.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
  var iv = cryptoJs.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");
  const ciphertext = cryptoJs.AES.encrypt(JSON.stringify(req.body.email), key, {iv: iv}).toString();
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: ciphertext,
          password: hash
        });
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };

  exports.login = (req, res, next) => {
    var key = cryptoJs.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
    var iv = cryptoJs.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");
    const ciphertext = cryptoJs.AES.encrypt(JSON.stringify(req.body.email), key, {iv: iv}).toString();
    User.findOne({ email: ciphertext })
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
              return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
            res.status(200).json({
              userId: user._id,
              token: jwt.sign(
                { userId: user._id },
                'RANDOM_TOKEN_SECRET',
                { expiresIn: '24h' }
              )
            });
          })
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };