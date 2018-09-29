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
        fileOps.read('users', phone, (err, data) => {
            if(err) {
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
                            callback(200, {"Message": "Used added successfully."});
                        } else {
                            console.log(err);
                            callback(500, {"Error": "Could not create new user."})
                        }
                    });
                } else {
                    callback(500, {"Error": "Error encrypting the password."})
                }
            } else {
                callback(500, {"Error": "User already exists."})
            }
        });
    } else {
        callback(400, {"Error": "Either missing required fields or data is invalid."})
    }
}

/**
 * 
 */
handlers._users.get = () => {

}

/**
 * 
 */
handlers._users.put = () => {

}

/**
 * 
 */
handlers._users.delete = () => {

}

module.exports = handlers;