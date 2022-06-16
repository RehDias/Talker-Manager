const express = require('express');
const fs = require('fs');
const path = require('path');

const talkerPath = path.join(__dirname, 'talker.json');

const getTalker = () => JSON.parse(fs.readFileSync(talkerPath, 'utf8'));

const talkerRouter = express.Router();

talkerRouter.get('/', (_req, res) => {
  if (getTalker() === undefined) {
    res.status(200).send([]);
    return;
  }
  res.status(200).json(getTalker());
});

module.exports = talkerRouter;