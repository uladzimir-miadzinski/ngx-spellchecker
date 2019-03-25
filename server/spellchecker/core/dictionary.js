const BinarySearch = require('binarysearch');
const DL = require('./../lib/damerau-levenshtein')();

class Dictionary {
  
  /**
   * @param dictName Name for a dictionary
   * @param wordList A sorted array of strings
   */
  constructor(dictName = '', wordList = []) {
    /**
     * The search for suggestions is going to be limited to words that are next to the position,
     * in the word list, in which the word would be inserted.
     */
    this.suggestRadius = 1000;
  
    /**
     * Use this object for consider accents and special characters when comparing UTF-8 strings.
     */
    this.collator = new Intl.Collator(undefined, {'sensitivity': 'accent'});
    
    this.name = `${dictName}_${(new Date()).getMilliseconds()}`;
    this.wordList = wordList;
    this.clearRegexps();
  }
  
  get length() {
    return this.wordList ? this.wordList.length : 0;
  };
  
  get wordList() {
    return this._wordlist;
  }
  
  set wordList(list) {
    if (list && Array.isArray(list)) {
      this._wordlist = list;
    }
  };
  
  /**
   * Verify if a word is in the dictionary
   * @param word
   * @returns {boolean} 'true' if the word is in the dictionary, 'false' otherwise.
   */
  wordSpellCheck(word) {
    const lcWord = word.toLowerCase();
    
    return this.isAllowedByRegexps(lcWord)
      ? true
      : BinarySearch(this.wordList, lcWord, this.collator.compare) >= 0;
  }
  
  /**
   * Verify if a word is misspelled
   * @param word
   * @returns {boolean} 'true' if the word is misspelled, 'false' otherwise.
   */
  wordIsMisspelled(word) {
    return !this.wordSpellCheck(word);
  }
  
  // Verify if the word satisfies one of the regular expressions.
  isAllowedByRegexps(word) {
    for (let i = 0; i < this.regexps.length; i++) {
      if (this.regexps[i].test(word)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Get a list of suggestions for a misspelled word.
   * @param word A string.
   * @param limit An integer indicating the maximum number of suggestions (by default 5).
   * @param maxDistance An integer indicating the maximum edit distance between the word and the suggestions (by default 3).
   * @returns {Array} An array of strings with the suggestions.
   */
  getSuggestions(word, limit, maxDistance) {
    let suggestions = [];
    
    if (word && word.length > 0) {
      // Validate parameters.
      word = word.toLowerCase();
      if (limit == null || isNaN(limit) || limit <= 0) limit = 5;
      if (maxDistance == null || isNaN(maxDistance) || maxDistance <= 0) maxDistance = 2;
      if (maxDistance >= word.length) maxDistance = word.length - 1;
      
      // Search index of closest item.
      const closest = BinarySearch.closest(this.wordList, word, this.collator.compare);
      
      // Initialize variables for store results.
      const res = [];
      for (let i = 0; i <= maxDistance; i++) res.push([]);
      
      // Search suggestions around the position in which the word would be inserted.
      let k, dist;
      for (let i = 0; i < this.suggestRadius; i++) {
        // The index 'k' is going to be 0, 1, -1, 2, -2...
        k = closest + (i % 2 !== 0 ? ((i + 1) / 2) : (-i / 2));
        if (k >= 0 && k < this.wordList.length) {
          dist = DL(word, this.wordList[k].toLowerCase());
          if (dist <= maxDistance) res[dist].push(this.wordList[k]);
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
   * @param word A string.
   * @param limit An integer indicating the maximum number of suggestions (by default 5).
   * @param maxDistance An integer indicating the maximum edit distance between the word and the suggestions (by default 3).
   * @returns {{suggestions: Array, misspelled: boolean}} An object with the properties 'misspelled' (a boolean) and 'suggestions' (an array of strings).
   */
  checkAndSuggest(word, limit, maxDistance) {
    // Get suggestions.
    const suggestions = this.getSuggestions(word, limit + 1, maxDistance);
    
    // Prepare response.
    const res = {
      misspelled: true,
      suggestions: []
    };
    res.misspelled = suggestions.length === 0 || suggestions[0].toLowerCase() !== word.toLowerCase();
    res.suggestions = suggestions;
    if (res.misspelled && (suggestions.length > limit)) res.suggestions = suggestions.slice(0, limit);
    if (!res.misspelled) res.suggestions = suggestions.slice(1, suggestions.length);
    
    // Verify if the word satisfies one of the regular expressions.
    if (res.misspelled) {
      res.misspelled = !this.isAllowedByRegexps(word);
    }
    
    return res;
  };
  
  /**
   * Adds a regular expression that will be used to verify if a word is valid even though is not on the dictionary.
   * Useful indicate that numbers, URLs and emails should not be marked as misspelled words.
   * @param regexp
   */
  addRegexp(regexp) {
    this.regexps.push(regexp);
  };
  
  /**
   * Clear the list of regultar expressions used to verify if a word is valid even though is not on the dictionary.
   */
  clearRegexps() {
    this.regexps = [];
  };
}

module.exports = Dictionary;
