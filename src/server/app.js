const express = require('express');
const app = express();
const spellChecker = require('./spellchecker');
const bodyParser = require('body-parser');

const dictionariesToBeLoaded = [
  'en',
  'en_MED'
];
const dictionaries = dictionariesToBeLoaded.map(dictionaryName => spellChecker.getDictionarySync(dictionaryName));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  const result = {
    isMisspelled: true,
    suggestions: []
  };
  const text = req.body.text;
  
  for (let i = 0; i < dictionaries.length; i++) {
    if (!dictionaries[i].isMisspelled(text)) {
      result.isMisspelled = false;
      break;
    }
  }
  
  if (result.isMisspelled) {
    for (let i = 0; i < dictionaries.length; i++) {
      const dictSuggestions = dictionaries[i].getSuggestions(text, 5, 5);
      result.suggestions.push(dictSuggestions);
    }
  }
  
  res.send(result);
});

app.listen(2999, function () {
  console.log('Example app listening on port 2999!');
});
