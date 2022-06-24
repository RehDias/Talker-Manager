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

module.exports = {
  validateName,
  validateAge,
  validateTalkAndWatchedAt,
  validateRate,
  authMiddleware };