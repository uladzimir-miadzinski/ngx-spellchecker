const BinarySearch = require('binarysearch');
const DL = require('./damerau-levenshtein')();

// Use this object for consider accents and special characters when comparing UTF-8 strings.
const Collator = new Intl.Collator(undefined, {'sensitivity': 'accent'});

// The search for suggestions is going to be limited to words that are next to the position,
// in the word list, in which the word would be inserted.
const SuggestRadius = 1000;

/**
 * Creates an instance of Dictionary.
 *
 * @constructor
 * @this {Dictionary}
 * @param {string} name Name for a dictionary.
 * @param {string[]} wordlist A sorted array of strings.
 */
function Dictionary(name = '', wordlist) {
  this.name = `${name}_${(new Date()).getMilliseconds()}`;
  this.wordlist = [];
  this.setWordlist(wordlist);
  this.clearRegexps();
}

/**
 * Returns the number of words in the dictionary.
 *
 * @return {number} The number of words in the dictionary.
 */
Dictionary.prototype.getLength = function () {
  return this.wordlist ? this.wordlist.length : 0;
};

/**
 * Set the list of words of the dictionary. a new Circle from a diameter.
 *
 * @param {string[]} wordlist A sorted array of strings.
 */
Dictionary.prototype.setWordlist = function (wordlist) {
  if (wordlist && Array.isArray(wordlist)) this.wordlist = wordlist;
};

/**
 * Verify if a word is in the dictionary.
 *
 * @param {string} inputWord A string.
 * @return {boolean} 'true' if the word is in the dictionary, 'false' otherwise.
 */
Dictionary.prototype.spellCheck = function (inputWord) {
  const word = inputWord.toLowerCase();
  
  // Verify if the word satisfies one of the regular expressions.
  for (let i = 0; i < this.regexps.length; i++) {
    if (this.regexps[i].test(word)) return true;
  }
  
  return BinarySearch(
    this.wordlist, // Haystack
    word.toLowerCase(), // Needle
    Collator.compare // Comparison method
  ) >= 0;
};

/**
 * Verify if a word is misspelled.
 *
 * @param {string} word A string.
 * @return {boolean} 'true' if the word is misspelled, 'false' otherwise.
 */
Dictionary.prototype.isMisspelled = function (word) {
  return !this.spellCheck(word);
};

/**
 * Get a list of suggestions for a misspelled word.
 *
 * @param {string} word A string.
 * @param {number} limit An integer indicating the maximum number of suggestions (by default 5).
 * @param {number} maxDistance An integer indicating the maximum edit distance between the word and the suggestions (by default 3).
 * @return {string[]} An array of strings with the suggestions.
 */
Dictionary.prototype.getSuggestions = function (word, limit, maxDistance) {
  let suggestions = [];
  
  if (word && word.length > 0) {
    // Validate parameters.
    word = word.toLowerCase();
    if (limit == null || isNaN(limit) || limit <= 0) limit = 5;
    if (maxDistance == null || isNaN(maxDistance) || maxDistance <= 0) maxDistance = 2;
    if (maxDistance >= word.length) maxDistance = word.length - 1;
    
    // Search index of closest item.
    var closest = BinarySearch.closest(this.wordlist, word, Collator.compare);
    
    // Initialize variables for store results.
    var res = [];
    for (let i = 0; i <= maxDistance; i++) res.push([]);
    
    // Search suggestions around the position in which the word would be inserted.
    let k, dist;
    for (let i = 0; i < SuggestRadius; i++) {
      // The index 'k' is going to be 0, 1, -1, 2, -2...
      k = closest + (i % 2 !== 0 ? ((i + 1) / 2) : (-i / 2));
      if (k >= 0 && k < this.wordlist.length) {
        dist = DL(word, this.wordlist[k].toLowerCase());
        if (dist <= maxDistance) res[dist].push(this.wordlist[k]);
      }
    }
    
    // Prepare result.
    for (let d = 0; d <= maxDistance && suggestions.length < limit; d++) {
      const remaining = limit - suggestions.length;
      suggestions = suggestions.concat((res[d].length > remaining) ? res[d].slice(0, remaining) : res[d]);
    }
  }
  
  return suggestions;
};

/**
 * Verify if a word is misspelled and get a list of suggestions.
 *
 * @param {string} word A string.
 * @param {number} limit An integer indicating the maximum number of suggestions (by default 5).
 * @param {number} maxDistance An integer indicating the maximum edit distance between the word and the suggestions (by default 3).
 * @return {Object} An object with the properties 'misspelled' (a boolean) and 'suggestions' (an array of strings).
 */
Dictionary.prototype.checkAndSuggest = function (word, limit, maxDistance) {
  // Get suggestions.
  const suggestions = this.getSuggestions(word, limit + 1, maxDistance);
  
  // Prepare response.
  var res = {'misspelled': true, 'suggestions': []};
  res.misspelled = suggestions.length === 0 || suggestions[0].toLowerCase() !== word.toLowerCase();
  res.suggestions = suggestions;
  if (res.misspelled && (suggestions.length > limit)) res.suggestions = suggestions.slice(0, limit);
  if (!res.misspelled) res.suggestions = suggestions.slice(1, suggestions.length);
  
  // Verify if the word satifies one of the regular expressions.
  if (res.misspelled) {
    for (let i = 0; i < this.regexps.length; i++) {
      if (this.regexps[i].test(word)) res.misspelled = false;
    }
  }
  
  return res;
};

/**
 * Adds a regular expression that will be used to verify if a word is valid even though is not on the dictionary.
 * Useful indicate that numbers, URLs and emails should not be marked as misspelled words.
 *
 * @param {RegExp} regexp A regular expression.
 */
Dictionary.prototype.addRegex = function (regexp) {
  this.regexps.push(regexp);
};

/**
 * Clear the list of regultar expressions used to verify if a word is valid even though is not on the dictionary.
 */
Dictionary.prototype.clearRegexps = function () {
  this.regexps = [];
};

// Export class.
module.exports = Dictionary;
