const crypto = require('crypto')
const config = require('./config')

/**
 * Container for all the helpers
 */
const helpers = {}

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch(e) {
    return {};
  }
};

helpers.hash = (str) => {
    if(typeof(str) == 'string' && str.length > 0) {
        const hashPassword = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hashPassword;
    } else {
        return false;
    }
}

helpers.createRandomString = (strLength) => {
  strLength = typeof(strLength) == 'string' && str.length > 0 ? strLength : 20;
  if(strLength) {
    
    let str = '';

    /** Define all possible characters */
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for(let i = 0; i < strLength; i++) {
      let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      str += randomCharacter;
    }
    return str;
  } else {
    return false;
  }
}

module.exports = helpers