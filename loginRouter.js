const express = require('express');
const crypto = require('crypto');

const loginRouter = express.Router();

const emailValidation = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: 'O campo "email" é obrigatório' });
    return;
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
    return;
  }

  next();
};

const passwordValidation = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ message: 'O campo "password" é obrigatório' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
    return;
  }

  next();
};

loginRouter.post('/', emailValidation, passwordValidation, (_req, res) => {
  try {
    const token = crypto.randomBytes(8).toString('hex');
    res.status(200).json({ token });  
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = loginRouter;