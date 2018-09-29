/**
 *  Library for storing and editing data.
 */

 /**
  * Dependencies
  */
const fs = require('fs')
const path = require('path')
const helpers = require('./helpers')

/**
 * Container
 */
const lib = {};

/**
 * Base directory of the data folder.
 */
lib.baseDir = path.join(__dirname, '/../.data/')

/**
 * Writing data to a file.
 */
 lib.create = (dir, file, data, callback) => {

    // Open the file for writing, create one if it does not exist.
    /**
     * filedescriptor is an integer, used to reference an opened file.
     */
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
        if(!err && fileDescriptor) {
            // Convert data to string.
            const stringData = JSON.stringify(data);

            // Write to file and close it.
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if(!err) {
                    fs.close(fileDescriptor, (err) => {
                        if(!err) {
                            callback(false);
                        } else {
                            callback("Error closing the file.")
                        }
                    })
                } else {
                    callback("Error writing the file.")
                }
            });
        } else {
            callback("Error creating the file, may be file already exits!");
        }
    });
 };

 lib.read = (dir, file, callback) => {
     
     /**
      * Can specify encoding and mode in which 
      * file should open (read, write etc.)
      * 
      * If options is passed as a string, it specifies 
      * an encoding.
      */
     const options = {
        encoding: 'utf8', 
        flag: 'r'
     }
     fs.readFile(lib.baseDir + dir + '/' + file + '.json', options, (err, data) => {
        if(!err && data) {
            const parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        } else {
            callback(err, data);
        }
     });
 }


module.exports = lib;