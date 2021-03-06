const fs = require('fs');
const stripBOM = require('strip-bom');
const Dictionary = require('./dictionary.js');
const dictionariesPath = require('path').dirname(__dirname) + '\\dict';

const DictionaryLoader = {
  /**
   * Create a dictionary from a file, which might be either a .dic or a .zip file.
   *
   * @param {String} fileName The name of the file from which read the word list.
   * @param {String} folderPath The path to the directory in which the file is located (optional).
   * @param {function} callback A function to invoke when either the dictionary was created or an error was found.
   */
  getDictionary: function (fileName, folderPath, callback) {
    try {
      // Initialize variables.
      const folder = (!folderPath || typeof folderPath != 'string') ? dictionariesPath : folderPath;
      const dictionaryPath = folder + '/' + fileName + '.dic';
      
      // Verify if the dictionary file exists.
      fs.exists(dictionaryPath, function (exists) {
        if (exists) {
          // The file exists, read it.
          DictionaryLoader._readFile(dictionaryPath, callback);
        } else {
          // The file do not exists, verify if the ZIP file exists.
          throw Error('No such dictionary');
        }
      });
    } catch (err) {
      // Return error.
      if (callback) callback('An unexpected error occurred: ' + err, null);
    }
  },
  
  /**
   * Create a dictionary from a .dic file.
   *
   * @param {String} file_path The path of the file.
   * @param {function} callback A function to invoke when either the dictionary was created or an error was found.
   */
  _readFile: function (file_path, callback) {
    fs.readFile(file_path, 'utf8', function (err, text) {
      // Check for errors.
      if (!err) {
        // Create dictionary and return it.
        callback(null, new Dictionary(text.split('\n')));
      } else {
        // Return an error.
        callback("The dictionary file could not be read: " + err, null);
      }
    });
  },
  
  /**
   * Create a dictionary from a .dic file .
   * Use CLI to normalize dict first. It preven using .replace '\r' in this method
   * node cli.js normalize "./dict/en.dic"
   *
   * @param {String} fileName The name of the file from which read the word list.
   * @param {String} folderPath The path to the directory in which the file is located (optional).
   * @return {Object} An instance of the Dictionary class.
   * @throws {Exception} If the dictionary's file can't be found or is invalid.
   */
  getDictionarySync: function (fileName, folderPath = undefined) {
    try {
      // Initialize variables.
      const folder = (!folderPath || typeof folderPath != 'string') ? dictionariesPath : folderPath;
      const dictionaryPath = folder + '/' + fileName + '.dic';
      
      // Verify if the dictionary file exists.
      if (fs.existsSync(dictionaryPath)) {
        // The file exists, read it.
        const fileContent = fs.readFileSync(dictionaryPath, 'utf8');
        const words = fileContent.split('\n').map(word => word.toLowerCase());
        return new Dictionary(fileName, words);
      } else {
        // The file do not exists, throw an error (only the asynchronous versions of this method unzip the compressed files).
        throw new Error('The dictionary could not be created, no file with the name "' + fileName + '" could be found');
      }
    } catch (err) {
      // Throw an error.
      throw new Error('An unexpected error ocurred: ' + err);
    }
  },
  
  /**
   * Reads a UTF8 dictionary file, removes the BOM and \r characters and sorts the list of words.
   *
   * @param {String} inputPath The path for the input file.
   * @param {String} outputPath The path to output (optional, by default is equals to the input file).
   * @param {function} callback A function to invoke after finishing.
   */
  normalizeDictionary: function (inputPath, outputPath, callback) {
    try {
      // Parses arguments
      if (!outputPath || typeof outputPath != 'string') outputPath = inputPath;
      
      // Verify if the dictionary file exists.
      fs.exists(inputPath, function (exists) {
        if (exists) {
          // The file exists, read it.
          fs.readFile(inputPath, 'utf8', function (err, content) {
            // Check for errors.
            if (!err) {
              // Remove BOM and \r characters.
              content = stripBOM(content);
              content = content.replace(/\r/g, '');
              
              // Sort words.
              var lines = content.split('\n');
              const collator = new Intl.Collator(); // Use this comparator for consider accents and special characters.
              lines = lines.sort(collator.compare);
              
              // Generate output content.
              var newContent = '';
              var first = true;
              for (var i = 0; i < lines.length; i++) {
                if (lines[i] !== '' && lines[i] !== '\n') {
                  if (!first) newContent += '\n';
                  newContent += lines[i];
                  first = false;
                }
              }
              
              // Write output file.
              fs.writeFile(outputPath, newContent, 'utf8', function (err) {
                // Return result.
                callback(err ? ("The output file could not be writted: " + err) : null, !err);
              });
            } else {
              // Return an error.
              callback("The input file could not be read: " + err, false);
            }
          });
        } else {
          // Return an error indicating that the file doens't exists.
          callback("The input file does not exists", false);
        }
      });
    } catch (err) {
      // Return an error.
      callback('An unexpected error occurred: ' + err, false);
    }
  }
};

module.exports = DictionaryLoader;
