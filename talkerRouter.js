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

talkerRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  const talkerId = getTalker().find((tal) => Number(tal.id) === Number(id));
  if (!talkerId) {
    res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  res.status(200).json(talkerId);
});

module.exports = talkerRouter;