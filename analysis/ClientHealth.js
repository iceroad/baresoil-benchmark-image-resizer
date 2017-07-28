const _ = require('lodash'),
  chartutil = require('./chartutil'),
  json = JSON.stringify,
  quantize = require('./quantize')
  ;

function ClientHealth(rows) {
  const startTime = rows[0].time;
  const healthRows = _.filter(rows, row => row.event === 'health');

  // Store outputs for this analysis.
  const outputs = {
    cpuUsage: {
      type: 'line',
      data: {
        labels: null,
        datasets: [], // one per client host
      },
      options: chartutil.CreatePercentagePlot(
        'Time since experiment start (seconds)',
        'CPU Utilization (%)'),
    },
    memUsage: {
      type: 'line',
      data: {
        labels: null,
        datasets: [], // one per client host
      },
      options: chartutil.CreatePercentagePlot(
        'Time since experiment start (seconds)',
        'Memory Usage (%)'),
    },
    numAgents: {
      type: 'line',
      data: {
        labels: null,
        datasets: [], // single dataset: summation over hosts
      },
      options: chartutil.CreateCountPlot(
        'Time since experiment start (seconds)',
        'Total active client processes'),
    },
  };

  // Quantize health ping time to the lower edge of the bin.
  const quantizedRows = _.map(healthRows, row => {
    return {
      time: quantize(row.time, startTime),
      host: row.host,
      data: row.data,
    };
  });

  // Get a unique set of timestamps for all rows.
  const timestamps = _.uniq(_.map(quantizedRows, 'time'));
  outputs.cpuUsage.data.labels = timestamps;
  outputs.memUsage.data.labels = timestamps;
  outputs.numAgents.data.labels = timestamps;

  // Create individual time series for each client host.
  const groupedByHost = _.groupBy(quantizedRows, 'host');
  _.forEach(groupedByHost, (healthPings, host) => {
    const pingsByTimeIdx = _.keyBy(healthPings, 'time');
    const tsData = _.map(timestamps, ts => pingsByTimeIdx[ts] || null);
    outputs.cpuUsage.data.datasets.push({
      label: host,
      data: _.map(tsData, healthPing => _.get(healthPing, 'data.cpuUsage') * 100),
    });
    outputs.memUsage.data.datasets.push({
      label: host,
      data: _.map(tsData, healthPing => _.get(healthPing, 'data.memUsage') * 100),
    });
  });

  // Create summary metrics over all hosts.
  const groupedByTime = _.groupBy(quantizedRows, 'time');
  const summedByTime = _.mapValues(groupedByTime, (rows, tsQuant) => {
    // Key by hosts to eliminate duplicate health pings in the same time slice.
    const keyedByHost = _.keyBy(rows, 'host');
    return _.sum(
      _.map(keyedByHost, healthPing => _.get(healthPing, 'data.agents', 0)));
  });
  outputs.numAgents.data.datasets.push({
    label: 'Total active client agents',
    data: _.map(timestamps, ts => summedByTime[ts]),
  });

  return outputs;
}


module.exports = ClientHealth;
