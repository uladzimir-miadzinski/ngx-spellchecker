const express = require('express');
const app = express();
const spellchecker = require('./spellchecker');
const bodyParser = require('body-parser');

const dictionariesToBeLoaded = [
  'en',
  'en_MED'
];
const dictionaries = dictionariesToBeLoaded.map(dictionaryName => spellchecker.DictionaryLoader.getDictionarySync(dictionaryName));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send(spellchecker.CheckEngine.textCheckAndSuggest(req.body.text, dictionaries));
});

app.listen(2999, function () {
  console.log('Example app listening on port 2999!');
});
