const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const validations = require('./middlewares/validations');

const talkerRouter = express.Router();

const talkerPath = path.join(__dirname, 'talker.json');

const getTalker = async () => {
  const talker = await fs.readFile(talkerPath, 'utf8'); 
  return JSON.parse(talker);
};

const updateTalker = (newTalker) => fs.writeFile(talkerPath, JSON.stringify(newTalker));

talkerRouter.delete('/:id', validations.authMiddleware, async (req, res) => {
  const { id } = req.params;
  const talker = await getTalker();
  const index = talker.findIndex((tal) => Number(tal.id) === Number(id));
  if (index === -1) {
    res.status(401).json({ message: 'palestrante não encontrado' });
    return;
  }
  talker.splice(index, 1);
  updateTalker(talker);
  res.sendStatus(204).end();
});

talkerRouter.get('/search', validations.authMiddleware, async (req, res) => {
  const { q } = req.query;
  const talker = await getTalker();
  const filtered = talker.filter((tal) => tal.name.includes(q));
  if (!q || q === '') {
    res.status(200).json(talker);
    return;
  }
  if (filtered === undefined) {
    res.status(200).send([]);
    return;
  }
  res.status(200).json(filtered);
});

talkerRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const talker = await getTalker();
  const talkerId = talker.find((tal) => Number(tal.id) === Number(id));
  if (!talkerId) {
    res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    return;
  }
  res.status(200).json(talkerId);
});

talkerRouter.get('/', async (_req, res) => {
  const talker = await getTalker();
  if (talker === undefined) {
    res.status(200).send([]);
    return;
  }
  res.status(200).json(talker);
});

talkerRouter.put('/:id', validations.authMiddleware,
  validations.validateName,
  validations.validateAge,
  validations.validateTalkAndWatchedAt,
  validations.validateRate,
  async (req, res) => {
    const { id } = req.params;
    try {
      const talker = await getTalker();
      const index = talker.findIndex((tal) => Number(tal.id) === Number(id));
      if (index === -1) {
        res.status(401).json({ message: 'palestrante não encontrado' });
        return;
      }
      talker[index] = { ...talker[index], ...req.body };
      updateTalker([...talker, talker[index]]);
      res.status(200).json(talker[index]);
    } catch (error) {
      res.status(500).json(error.message);
    }
});

talkerRouter.post('/', validations.authMiddleware,
  validations.validateName,
  validations.validateAge,
  validations.validateTalkAndWatchedAt,
  validations.validateRate,
  async (req, res) => {
    const { name, age, talk } = req.body;
    try {
      const talker = await getTalker();
      const newTalker = { id: talker.length + 1, name, age, talk };
      talker.push(newTalker);
      updateTalker(talker);
      res.status(201).json(newTalker);
    } catch (err) {
      res.status(500).json(err.message);
    }
});

module.exports = talkerRouter;