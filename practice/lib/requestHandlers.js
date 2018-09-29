const fileOps = require('./fileOps')
const helpers = require('./helpers')

/**
 * Routes handlers
 */
let handlers = {};

/**
 * Container for users methods
 */
handlers._users = {};


/**
 * hello router handler
 */
handlers.hello = (data, callback) => {
    callback(200, {'Message':'Welcome to the NodeJS Master Class!'});
}

/**
 * Users
 */
handlers.users = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405, "Method not allowed.")
    }
}


/**
 * Use this handler in case of invalid route 
 */
handlers.notFound = (data, callback) => {
    callback(404, {'Message':'Invalid URL.'});
}


/** 
 * Required data: firstName, lastName, phone, password, tosAgreement 
 * Optional data: none
 */
handlers._users.post = (data, callback) => {
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if(firstName && lastName && phone && password && tosAgreement) {
        const hashedPassword = helpers.hash(password);
                if(hashedPassword) {
                    const userData = {
                        "firstName": firstName,
                        "lastName": lastName,
                        "phone": phone,
                        "hashedPassword": hashedPassword,
                        "tosAgreement": true
                    }

                    fileOps.create('users', phone, userData, (err) => {
                        if(!err) {
                            callback(200, {"Message": "User added successfully."});
                        } else {
                            callback(500, {"Error": "User already exists."})
                        }
                    });

                } else {
                    callback(500, {"Error": "Error encrypting the password."})
                }
        // fileOps.read('users', phone, (err, data) => {
        //     if(err) {
        //         const hashedPassword = helpers.hash(password);
        //         if(hashedPassword) {
        //             const userData = {
        //                 "firstName": firstName,
        //                 "lastName": lastName,
        //                 "phone": phone,
        //                 "hashedPassword": hashedPassword,
        //                 "tosAgreement": true
        //             }
        //             fileOps.create('users', phone, userData, (err) => {
        //                 if(!err) {
        //                     callback(200, {"Message": "Used added successfully."});
        //                 } else {
        //                     console.log(err);
        //                     callback(500, {"Error": "Could not create new user."})
        //                 }
        //             });
        //         } else {
        //             callback(500, {"Error": "Error encrypting the password."})
        //         }
        //     } else {
        //         callback(500, {"Error": "User already exists."})
        //     }
        // });
    } else {
        callback(400, {"Error": "Either missing required fields or data is invalid."})
    }
}

/**
 * Required data: phone
 * Optional data: none
 * @TODO Only let an authenticated user access their object. Dont let them access anyone elses.
 */
handlers._users.get = (data, callback) => {
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
    if(phone) {
        fileOps.read('users', phone, (err, data) => {
            if(!err && data) {
                callback(200, data);
            } else {
                callback(400, {"Error": "User does not exist."});
            }
        })
    } else {
        callback(400, {"Error": "Invalid phone number"})
    }
}

/**
 * Required data: phone
 * Optional data: firstName, lastName, password (at least one must be specified)
 * @TODO Only let an authenticated user up their object. Dont let them access update elses.
 */
handlers._users.put = (data, callback) => {
    /** Required field */
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;

    /** Optional fields */
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if(phone) {
        if(firstName || lastName || tosAgreement) {
            fileOps.read('users', phone, (err, data) => {
                if(!err && data) {
                    if(firstName) {
                        data.firstName = firstName;
                    }
                    if(lastName) {
                        data.lastName = lastName;
                    }
                    if(tosAgreement) {
                        data.tosAgreement = tosAgreement;
                    }
                    fileOps.update('users', phone, data, (err) => {
                        if(err) {
                            callback(500, {'Error': 'Update failed.'})
                        } else {
                            callback(200, {'Error': 'User data updated successfully.'})
                        }
                    })
                } else {
                    callback(400, {'Error': 'User does not exist.'})
                }
            })
        } else {
            callback(400, {'Error': 'Missing field(s) to update.'})    
        }

    } else {
        callback(400, {'Error': ' Missing required field.'})
    }
}

/**
 * Required data: phone
 * @TODO Only let an authenticated user delete their object. Dont let them delete update elses.
 * @TODO Cleanup (delete) any other data files associated with the user
 */
handlers._users.delete = (data, callback) => {
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
    if(phone) {
        fileOps.read('users', phone, (err, data) => {
            if(!err && data) {
                fileOps.delete('users', phone, (err) => {
                    if(err) {
                        callback(500, {"Error": "Could not delete the user."});
                    } else {
                        callback(200, {"Error": "User successfully deleted."});
                    }
                })
            } else {
                callback(400, {"Error": "User does not exist."});
            }
        })
    } else {
        callback(400, {"Error": "Invalid phone number"})
    }
}

module.exports = handlers;