/**
 * Configuration file
 */

 /** Container for environments */
 const environments = {}

 environments.staging = {
     envName: 'staging',
     port: 3000
 }

 environments.production = {
    envName: 'production',
    port: 5000
}

const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV : '';
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;