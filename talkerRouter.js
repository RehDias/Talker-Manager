const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const talkerPath = path.join(__dirname, 'talker.json');

const getTalker = async () => {
  const talker = await fs.readFile(talkerPath, 'utf8'); 
  return JSON.parse(talker);
};

const talkerRouter = express.Router();

talkerRouter.get('/', async (_req, res) => {
  const talker = await getTalker();
  if (talker === undefined) {
    res.status(200).send([]);
    return;
  }
  res.status(200).json(talker);
});

talkerRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const talker = await getTalker();
  const talkerId = talker.find((tal) => Number(tal.id) === Number(id));
  if (!talkerId) {
    res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  res.status(200).json(talkerId);
});

module.exports = talkerRouter;