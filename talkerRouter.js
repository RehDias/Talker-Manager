const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const talkerRouter = express.Router();

const talkerPath = path.join(__dirname, 'talker.json');

const getTalker = async () => {
  const talker = await fs.readFile(talkerPath, 'utf8'); 
  return JSON.parse(talker);
};

const updateTalker = (newTalker) => fs.writeFile(talkerPath, JSON.stringify(newTalker));

const validateName = (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ message: 'O campo "name" é obrigatório' });
    return;
  }
  if (name.length < 3) {
    res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
    return;
  }

  next();
};

const validateAge = (req, res, next) => {
  const { age } = req.body;
  if (Number.isNaN(age) || !age) {
    res.status(400).json({ message: 'O campo "age" é obrigatório' });
    return;
  }
  if (age < 18) {
    res.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' });
    return;
  }

  next();
};

const validateTalkAndWatchedAt = (req, res, next) => {
  const { talk } = req.body;
  
  if (!talk || talk === undefined) {
    res.status(400).json({ message: 'O campo "talk" é obrigatório' });
    return;
  }
  if (!talk.watchedAt) {
    res.status(400).json({ message: 'O campo "watchedAt" é obrigatório' });
    return;
  }
  if (!/^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i.test(talk.watchedAt)) {
    res.status(400).json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
    return;
  } // regex simples data: https://www.regextester.com/99555;

  next();
};

const validateRate = (req, res, next) => {
  const { talk } = req.body;

  if (talk.rate === '' || talk.rate === undefined) {
    res.status(400).json({ message: 'O campo "rate" é obrigatório' });
    return;
  }
  if (Number(talk.rate) < 1 || Number(talk.rate) > 5) {
    res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
    return;
  }
  next();
};

const authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401).json({ message: 'Token não encontrado' });
    return;
  }
  if (authorization.length !== 16) {
    res.status(401).json({ message: 'Token inválido' });
    return;
  }

  next();
};

talkerRouter.get('/search', authMiddleware, async (req, res) => {
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

talkerRouter.put('/:id', authMiddleware,
  validateName,
  validateAge,
  validateTalkAndWatchedAt,
  validateRate,
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

talkerRouter.delete('/:id', authMiddleware, async (req, res) => {
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

talkerRouter.post('/', authMiddleware,
  validateName,
  validateAge,
  validateTalkAndWatchedAt,
  validateRate,
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