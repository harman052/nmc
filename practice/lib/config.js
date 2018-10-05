/**
 * Configuration file
 */

 /** Container for environments */
 const environments = {}

/**
 * Staging environment
 */
 environments.staging = {
     envName: 'staging',
     httpPort: 3000,
     httpsPort: 3001,
     hashingSecret: 'thisIsASecret',
     maxChecks: 5,
     twilio : {
        'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
        'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
        'fromPhone' : '+15005550006'
      }
 }

/**
 * Production enironment
 */
 environments.production = {
    envName: 'production',
    httpPort: 5000,
    httpsPort: 5001,
    hashingSecret: 'thisIsAlsoASecret',
    maxChecks: 5,
    twilio : {
        'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
        'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
        'fromPhone' : '+15005550006'
      }
}

/**
 * Check the string passed to NODE_ENV on command line.
 */
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV : '';

/**
 * Select the environment if there is match, 
 * otherwise choose staging environment as default. 
 */
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;