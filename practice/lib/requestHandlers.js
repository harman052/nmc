const fileOps = require('./fileOps')
const helpers = require('./helpers')
const config = require('./config')

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
 */
handlers._users.get = (data, callback) => {
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
    if(phone) {
        
        /** Get token from headers */
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if(tokenIsValid) {

                /** Looking up user */
                fileOps.read('users', phone, (err, data) => {
                    if(!err && data) {
                        callback(200, data);
                    } else {
                        callback(400, {"Error": "User does not exist."});
                    }
                });
            } else {
                callback(403, {"Error": "Missing required token in header, or token is invalid."});
            }
        });
    } else {
        callback(400, {"Error": "Invalid phone number"})
    }
}

/**
 * Required data: phone
 * Optional data: firstName, lastName, password (at least one must be specified)
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

            /** Get token from headers */
            const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
            handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                if(tokenIsValid) {
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
                    callback(403, {"Error": "Missing required token in header, or token is invalid."});
                }
            });
        } else {
            callback(400, {'Error': 'Missing field(s) to update.'})    
        }
    } else {
        callback(400, {'Error': ' Missing required field.'})
    }
}

/**
 * Required data: phone
 */
handlers._users.delete = (data, callback) => {
    
    /** Required field */
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
    if(phone) {

        /** Get token from headers */
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if(tokenIsValid) {
                fileOps.read('users', phone, (err, userData) => {
                    if(!err && userData) {
                        fileOps.delete('users', phone, (err) => {
                            if(err) {
                                callback(500, {"Error": "Could not delete the user."});
                            } else {
                                // Delete each of the checks associated with the user
                                const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : []
                                if(userChecks.length > 0) {
                                    const checksToDelete = userChecks.length;
                                    var deletionErrors = false;
                                    var checksDeleted = 0;
                                    userChecks.forEach(checkId => {
                                        fileOps.delete('checks', checkId, (err) => {
                                            if(err) {
                                                deletionErrors = true;
                                             }
                                            checksDeleted++;
                                        
                                            if(checksDeleted == checksToDelete){
                                                if(!deletionErrors) {
                                                    callback(200, {"Message": "User successfully deleted."});
                                                } else {
                                                    callback(500,{
                                                        'Error' : `Errors encountered while attempting to delete all of the user's checks. 
                                                                All checks may not have been deleted from the system successfully.`})
                                                }
                                            } 
                                        });
                                    });
                                } else {
                                    callback(200, {"Message": "User successfully deleted."});
                                }
                            }
                        });
                    } else {
                        callback(400, {"Error": "User does not exist."});
                    }
                });
            } else {
                callback(400, {"Error": "Missing required token in header, or token is invalid."});
            }
        });
    } else {
        callback(400, {"Error": "Invalid phone number"})
    }
}

/** Tokens */

/** Container for token methods */
handlers._tokens = {};

handlers._tokens.verifyToken = (id, phone, callback) => {
    fileOps.read('tokens', id, (err, tokenData) => {
        if(!err && tokenData) {
            if(tokenData.phone == phone && tokenData.expires > Date.now()){
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
}


handlers.tokens = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405, "Method not allowed.");
    }
}

/** 
 * Tokens - post
 * Required data: phone, password
 * Optional data: none 
 */
handlers._tokens.post = (data, callback) => {
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if(phone && password) {
        fileOps.read('users', phone, (err, userData) => {
            if(!err && userData) {
                const hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword) {
                    const id = helpers.createRandomString(20);
                    const expires = Date.now() + 1000 * 60 * 60;
                    const tokenObject = {
                        phone: phone,
                        id: id,
                        expires: expires 
                    }
                    fileOps.create('tokens', id, tokenObject, (err) => {
                        if(!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {'Error': 'Could not create new token.'})
                        }
                    });
                } else {
                    callback(400, {'Error': 'Password did not matched with the user\'s stored password'});
                }
            } else {
                callback(400, {'Error': 'User does not exist.'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required fields.'})
    }
}


/**
 * Tokens - get
 * Required data: id
 * Optional data: none
 */
handlers._tokens.get = (data, callback) => {
    const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
    if(id) {
        fileOps.read('tokens', id, (err, tokenData) => {
            if(!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404, {"Error": "Token does not exist."});
            }
        })
    } else {
        callback(400, {"Error": "Missing required field or field invalid."})
    }
}

/**
 * Tokens - put
 * Required data: id, extend
 * Optional data: none
 */
handlers._tokens.put = (data, callback) => {
    const id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;
    const extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

    if(id && extend) {
        fileOps.read('tokens', id, (err, tokenData) => {
            if(!err && tokenData) {
                if(tokenData.expires > Date.now()) {
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    fileOps.update('tokens', id, tokenData, (err) => {
                        if(!err) {
                            callback(200, {'Message': 'Expiration period extented.'});
                        } else {
                            callback(500, {'Error': 'Could not update the token expiration.'});
                        }
                    });
                } else {
                    callback(400, {'Error': 'Token already expired and cannot be extended.'});
                }
            } else {
                callback(404, {'Error': 'Specified token not found.'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required fields.'});
    }
}

/**
 * Tokens - delete
 * Required data: id
 * Optional data: none
 */
handlers._tokens.delete = (data, callback) => {
    const id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;
    if(id) {
        fileOps.read('tokens', id, (err, tokenData) => {
            if(!err && tokenData) {
                fileOps.delete('tokens', id, (err) => {
                    if(!err) {
                        callback(200, {'Message': 'Token successfully deleted.'});
                    } else {
                        callback(500, {'Error': 'Could not delete the token.'});                        
                    }
                    
                });
            } else {
                callback(400, {'Error': 'Token not found.'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field.'});
    }
}

/** Checks */

/** Container for check methods */
handlers._checks = {};


handlers.checks = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback);
    } else {
        callback(405, "Method not allowed.");
    }
}

/** 
 * Checks - post
 * Required data: protocol, url, method, successCodes, timeoutSeconds
 * Optional data: none
 */
handlers._checks.post = (data, callback) => {
    
    /** Validate required inputs */
    const protocol = typeof(data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    const method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    const successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array ? data.payload.successCodes : false;
    const timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if(protocol && url && method && successCodes && timeoutSeconds) {

        /** Get token from headers to verify whether the user is authenticated */
        const token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length > 0 ? data.headers.token.trim() : false;
        
        if(token) {

            /** Look up the user phone by reading the token */
            fileOps.read('tokens', token, (err, tokenData) => {
                if(!err && tokenData) {

                    fileOps.read('users', tokenData.phone, (err, userData) => {
                        if(!err && userData) {
                            const userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

                            if(userChecks.length < config.maxChecks) {

                                const checkId = helpers.createRandomString(20);

                                const checkObject = {
                                    id: checkId,
                                    userPhone: userData.phone,
                                    protocol: protocol,
                                    url: url,
                                    method: method,
                                    successCodes: successCodes,
                                    timeoutSeconds: timeoutSeconds
                                }

                                fileOps.create('checks', checkId, checkObject, (err) => {
                                    if(!err) {
                                        userData.checks = userChecks;
                                        userData.checks.push(checkId);
                                        fileOps.update('users', userData.phone, userData, (err) => {
                                            if(!err) {
                                                callback(200, {'Message': 'User updated with new check.'});
                                            } else {
                                                callback(500, {'Error': 'Could not update user with new check.'});
                                            }
                                        });
                                    } else {
                                        callback(500, {'Error': 'Could not create the new check.'});
                                    }
                                });

                            } else {
                                callback(400, {'Error': `The user already has the maximum number of checks (${config.maxChecks}).`});
                            }
                        } else {
                            callback(400, {'Error': 'User associated with received token was not found.'});                            
                        }
                    });
                } else {
                    callback(400, {'Error': 'Token provided in the header not found on the disk.'});                    
                }
            });
        } else {
            callback(400, {'Error': 'Invalid token.'});
        }
    } else {
        callback(400, {'Error': 'Missing required fields, or inputs are invalid.'})
    }
}


/** 
 * Checks - get
 * Required data: id
 * Optional data: none
 */
handlers._checks.get = (data, callback) => {
    const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
    if(id) {
        const token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length === 20 ? data.headers.token.trim() : false;
        fileOps.read('tokens', token, (err, tokenData) => {
            if(!err && data) {
                handlers._tokens.verifyToken(token, tokenData.phone, (tokenIsValid) => {
                    if(tokenIsValid) {
                        fileOps.read('checks', id, (err, checkData) => {
                            if(!err && checkData) {
                                callback(200, checkData);
                            } else {
                                callback(404, {"Error": "Check does not exist."});
                            }
                        });
                } else {
                    callback(400, {'Error': 'Token provided in the header is invalid.'});
                }
            });
            } else {
                callback(400, {'Error': 'Token provided in the header was not found on the disk.'});
            }
        });
    } else {
        callback(400, {"Error": "Missing required field or field invalid."})
    }
}


/** 
 * Checks - put
 * Required data: id
 * Optional data: protocol, url, method, successCodes, timeoutSeconds (one must be sent)
 */
handlers._checks.put = (data, callback) => {
    
    /** Required input */
    const id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

    /** Optional inputs */
    const protocol = typeof(data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    const method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    const successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array ? data.payload.successCodes : false;
    const timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if(id) {
        const token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length === 20 ? data.headers.token.trim() : false;
        fileOps.read('tokens', token, (err, tokenData) => {
            if(!err && data) {
                handlers._tokens.verifyToken(token, tokenData.phone, (tokenIsValid) => {
                    if(tokenIsValid) {
                        fileOps.read('checks', id, (err, checkData) => {
                            if(!err && checkData) {
                                if(protocol) {
                                    checkData.protocol = protocol;
                                }
                                if(url) {
                                    checkData.url = url;
                                }
                                if(method) {
                                    checkData.method = method;
                                }
                                if(successCodes) {
                                    checkData.successCodes = successCodes;
                                }
                                if(timeoutSeconds) {
                                    checkData.timeoutSeconds = timeoutSeconds;
                                }
                                fileOps.update('checks', id, checkData, (err) => {
                                    if(!err) {
                                        callback(200, {"Message": "Check updated successfully."});
                                    } else {
                                        callback(500, {"Error": "Error updating the check."});
                                    }
                                });
                            } else {
                                callback(404, {"Error": "Check does not exist."});
                            }
                        });
                } else {
                    callback(400, {'Error': 'Token provided in the header is invalid.'});
                }
            });
            } else {
                callback(400, {'Error': 'Token provided in the header was not found on the disk.'});
            }
        });
    } else {
        callback(400, {"Error": "Missing required field or field invalid."})
    }
}


/** 
 * Checks - delete
 * Required data: id
 * Optional data: none
 */
handlers._checks.delete = (data, callback) => {
    const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(id) {
        const token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length === 20 ? data.headers.token.trim() : false;
        fileOps.read('tokens', token, (err, tokenData) => {
            if(!err && data) {
                handlers._tokens.verifyToken(token, tokenData.phone, (tokenIsValid) => {
                    if(tokenIsValid) {
                        fileOps.delete('checks', id, (err) => {
                            if(!err) {
                                fileOps.read('users', tokenData.phone, (err, userData) => {
                                    if(!err && userData) {
                                        const checkPosition = userData.checks.indexOf(id);
                                        if(checkPosition > -1) {
                                            userData.checks.splice(checkPosition, 1);
                                            fileOps.update('users', userData.phone, userData, (err) => {
                                                if (!err) {
                                                    callback(200, {'Message': 'Check deleted and user is updated.'})
                                                } else {
                                                    callback(500,{"Error" : "Could not update user."});
                                                }
                                            });
                                        } else {
                                            callback(500,{"Error" : "Could not find the check on the user's object, so could not remove it."});
                                        }

                                    } 
                                });
                            } else {
                                callback(500, {'Error': 'Unable to delete check from disk.'});            
                            }
                        });
                } else {
                    callback(400, {'Error': 'Token provided in the header is invalid.'});
                }
            });
            } else {
                callback(400, {'Error': 'Token provided in the header was not found on the disk.'});
            }
        });
    } else {
        callback(400, {"Error": "Missing required field or field invalid."})
    }
}


module.exports = handlers;