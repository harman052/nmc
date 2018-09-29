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

module.exports = helpers