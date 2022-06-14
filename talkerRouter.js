const express = require('express');

const talkerRouter = express.Router();

talkerRouter.get('/');

module.exports = talkerRouter;