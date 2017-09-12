// This modules stores values of external variables. It is loaded on
// new experiment runs, and its computed, exported value is copied to the
// run_data folder's external-variables.json.
const os = require('os');

module.exports = {
  hostname: os.hostname(),
  runStartTime: new Date().toString(),

  server: {
    region: 'us-east-1',
    instances: {
      count: 20,
      type: 'c4.2xlarge',
      costPerHour: {
        retail: 0.398,
        reserved: 0.252,
        spot: 0.0908,
        spotMin: 0.0659,
      },
    },
    rds: {
      costPerHour: 0.095,
    },
    elb: {
      costPerHour: 0.025,
      costPerGB: 0.008,
    },
  },

  client: {
    region: 'us-east-1',
    instances: {
      count: 10,
      type: 'c4.xlarge',
    },
  },
};
