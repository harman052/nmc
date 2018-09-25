/**
 *  Library for storing and editing data.
 */

 /**
  * Dependencies
  */
const fs = require('fs');
const path = require('path');

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


module.exports = lib;