"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var app = express();
var spellchecker = require('./../spellchecker');
var bodyParser = require('body-parser');
var cors = require('cors');
var dictionariesToBeLoaded = [
    'en',
    'en_MED',
    'special-chars'
];
var dictionaries = dictionariesToBeLoaded.map(function (dictionaryName) { return spellchecker.DictionaryLoader.getDictionarySync(dictionaryName); });
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.post('/', function (req, res) {
    res.send(spellchecker.CheckEngine.textCheckAndSuggest(req.body.text, dictionaries));
});
app.listen(2999, function () {
    console.log('Example app listening on port 2999!');
});
//# sourceMappingURL=app.js.map