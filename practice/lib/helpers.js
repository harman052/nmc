const crypto = require('crypto')
const config = require('./config')
const https = require('https')
const querystring = require('querystring')

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

/** Send an SMS via Twilio */
helpers.sendTwilioSMS = (phone, msg, callback) => {
  phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
  msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

  if(phone && msg) {

    /** Configure the request payload */
    const payload = {
      'from': config.twilio.fromPhone,
      'to': phone,
      'body': msg
    } 

    /**
     * Stringify payoad object using querystring module.
     * querystring is used because the request is being sent
     * as a form submission.
     */
    const stringPayload = querystring.stringify(payload);

    /** Configure the request details */
    const requestDetails = {
      'protocol': 'https:',
      'hostname': 'api.twilio.com',
      'method': 'POST',
      'path': '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
      'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }   
    }

    /** Instantiate the request object */
    const req = https.request(requestDetails, (res) => {
      const status = res.statusCode;
      if(status == 200 || status == 201) {
        callback(false);
      } else {
        callback(`Status code returned was ${status}`);
      }
    });

    /** Bind the the error event */
    req.on('error', (e) => {
      callback(e);
    })

    /** Add payload to the request */
    req.write(stringPayload);

    /** Send the request */
    req.end();

  } else {
    callback('Given parameters were missing or invalid');
  }
}

module.exports = helpers