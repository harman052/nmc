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

const writeToFile = (fileDescriptor, data, callback) => {

    // Convert data to string.
    const stringData = JSON.stringify(data);
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
}

/**
 * Writing data to a file.
 */
 lib.create = (dir, file, data, callback) => {

    /**
     * Open the file for writing, create one if it does not exist.
     * filedescriptor is an integer, used to reference an opened file.
     */
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
        if(!err && fileDescriptor) {
            
            // Write to file and close it.
            writeToFile(fileDescriptor, data, callback);
        } else {
            callback(err, {"Error": "Error creating the file, may be file already exits!"});
        }
    });
 };

 lib.read = (dir, file, callback) => {
     
     /**
      * Can specify encoding and mode in which 
      * file should open (read, write etc.)
      * 
      * If options object is passed as a string, it specifies 
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

 /**
  * Update data.
  */
 lib.update = (dir, file, data, callback) => {

    /**
     * Same as create method, only difference is, in update, 
     * file is being truncated first before storing data.
     * 
     * Using flag 'r+' to open file in read and write mode.  
     */
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {
        if(!err && fileDescriptor) {

            fs.truncate(fileDescriptor, (err) => {
                if(!err) {
                    // Write to file and close it.
                    writeToFile(fileDescriptor, data, callback);
                } else {
                    callback('Error truncatng file.');
                }
            })
        } else {
            callback("Could not open file for updating, it may not exist yet.");
        }
    });
 };

 /**
  * 
  * @param {string} dir directory name
  * @param {string} file file name
  * @param {string} callback callback to display error on console
  */
 lib.delete = (dir, file, callback) => {
     fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err) => {
         if(!err) {
             callback(false);
         } else {
             callback('Error deleteting the file.');
         }
     })
 }


module.exports = lib;