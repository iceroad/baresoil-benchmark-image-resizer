// This modules stores values of external variables. It is loaded on
// new experiment runs, and its computed, exported value is copied to the
// run_data folder's external-variables.json.
const os = require('os');

module.exports = {
  hostname: os.hostname(),
  runStartTime: new Date().toString(),

  server: {
    region: 'us-east-2',
    instances: {
      count: 5,
      type: 'c4.8xlarge',
      costPerHour: {
        retail: 1.591,
        reserved: 1.008,
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
    region: 'us-east-2',
    instances: {
      count: 10,
      type: 't2.xlarge',
    },
  },
};
