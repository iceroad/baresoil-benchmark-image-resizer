// This modules stores values of external variables. It is loaded on
// new experiment runs, and its computed, exported value is copied to the
// run_data folder's external-variables.json.
const os = require('os');

module.exports = {
  hostname: os.hostname(),
  runStartTime: new Date().toString(),

  server: {
    region: 'us-west-2',
    instances: {
      count: 3,
      type: 'm4.16xlarge',
      costPerHour: {
        retail: 3.2,
        reserved: 1.850,
      },
    },
    rds: {
      costPerHour: 0.018,
    },
    elb: {
      costPerHour: 0.025,
      costPerGB: 0.008,
    },
  },

  client: {
    region: 'us-west-2',
    instances: {
      count: 4,
      type: 'r4.xlarge',
    },
  },
};
