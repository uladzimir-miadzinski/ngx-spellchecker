import {Response, Request} from 'express';

const express = require('express');
const app = express();
const spellchecker = require('./../spellchecker');
const bodyParser = require('body-parser');
const cors = require('cors');

const dictionariesToBeLoaded = [
  'en',
  'en_MED',
  'special-chars'
];
const dictionaries = dictionariesToBeLoaded.map(dictionaryName => spellchecker.DictionaryLoader.getDictionarySync(dictionaryName));

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post('/', (req: Request, res: Response) => {
  res.send(spellchecker.CheckEngine.textCheckAndSuggest(req.body.text, dictionaries));
});

app.listen(2999, () => {
  console.log('Example app listening on port 2999!');
});
