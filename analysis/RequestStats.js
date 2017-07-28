const _ = require('lodash'),
  assert = require('assert'),
  chartutil = require('./chartutil'),
  json = JSON.stringify,
  quantize = require('./quantize')
  ;

function RequestStats(rows) {
  const startTime = rows[0].time;
  const timestamps = _.keys(_.keyBy(rows, row => quantize(row.time, startTime)));

  // Store outputs for this analysis.
  const outputs = {
    requestsMadeStats: {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [{
          label: 'New requests made to server',
          data: [],
        }],
      },
      options: chartutil.CreateTimeSeries('Time window (seconds)', 'New requests made to server'),
    },
    requestRttStats: {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [
          {
            label: 'Median request round-trip time',
            data: [],
          },
          {
            label: '95th percentile request round-trip time',
            data: [],
          },
          {
            label: '98th percentile request round-trip time',
            data: [],
          },
        ],
      },
      options: chartutil.CreateTimeSeries('Time window (seconds)', 'Request round-trip time (seconds)'),
    },
    imgBytes: {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [
          {
            label: 'Total image data processed by the cluster (Gigabytes)',
            data: [],
          },
        ],
      },
      options: chartutil.CreateTimeSeries(
        'Time since start of experiment (seconds)',
        'Image data processed (Gigabytes)'),
    },
    serverWalltimePerImage: {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: [
          {
            label: 'Median server walltime per image (milliseconds)',
            data: [],
          },
          {
            label: '95th percentile server walltime per image (milliseconds)',
            data: [],
          },
          {
            label: '98th percentile server walltime per image (milliseconds)',
            data: [],
          },

        ],
      },
      options: chartutil.CreateTimeSeries(
        'Time since start of experiment (seconds)',
        'Server time per image (milliseconds)'),
    },
  };

  // Filter out request-specific rows.
  const reqRows = _.filter(rows, (row) => {
    return row.event === 'start_request' || row.event === 'request_ok';
  });
  const startReqRows = _.filter(reqRows, row => row.event === 'start_request');
  const reqOkRows = _.filter(reqRows, row => row.event === 'request_ok');

  // Index request_ok by requestId.
  const responsesById = _.keyBy(reqOkRows, 'requestId');

  // Correlate requests and responses.
  const allRequests = _.map(startReqRows, (reqStart) => {
    const response = responsesById[reqStart.requestId];
    return _.merge({
      time: reqStart.time,
      ts: quantize(reqStart.time, startTime),
    }, _.get(response, 'data'));
  });

  // Group correlated requests by request start time.
  const quantizedRows = _.groupBy(allRequests, 'ts');
  _.forEach(timestamps, (ts) => {
    const windowRows = quantizedRows[ts] || [];

    // Compute number of new requests made in current quantized time window.
    const requestsMadeInWindow = windowRows.length;
    outputs.requestsMadeStats.data.datasets[0].data.push(requestsMadeInWindow);

    // Compute roundtrip latency quantiles.
    const rttLatencies = _.sortBy(_.filter(_.map(windowRows, 'rttMs')));
    const rttMedian = rttLatencies[Math.floor(rttLatencies.length * 0.5)];
    const rttPc95 = rttLatencies[Math.floor(rttLatencies.length * 0.95)];
    const rttPc98 = rttLatencies[Math.floor(rttLatencies.length * 0.98)];
    outputs.requestRttStats.data.datasets[0].data.push(rttMedian / 1000);
    outputs.requestRttStats.data.datasets[1].data.push(rttPc95 / 1000);
    outputs.requestRttStats.data.datasets[2].data.push(rttPc98 / 1000);

    // Compute server walltime quantiles.
    const walltimes = _.sortBy(_.filter(_.map(windowRows, 'walltimeMs')));
    const walltimeMedian = walltimes[Math.floor(walltimes.length * 0.5)];
    const walltimePc95 = walltimes[Math.floor(walltimes.length * 0.95)];
    const walltimePc98 = walltimes[Math.floor(walltimes.length * 0.98)];
    outputs.serverWalltimePerImage.data.datasets[0].data.push(walltimeMedian);
    outputs.serverWalltimePerImage.data.datasets[1].data.push(walltimePc95);
    outputs.serverWalltimePerImage.data.datasets[2].data.push(walltimePc98);
  });

  // Group and aggregate over "request_ok" only by the request end time.
  const agg = {
    imgBytesSent: 0,
    imgBytesRecv: 0,
    imgDone: 0,
    cpuSeconds: 0,
    netOutBytes: 0,
  };
  const requestOkByTime = _.groupBy(reqOkRows, row => quantize(row.time, startTime));
  _.forEach(timestamps, (ts) => {
    const windowRows = requestOkByTime[ts] || [];
    agg.imgBytesSent += _.sum(_.map(windowRows, row => row.data.imgBytesPosted));
    agg.imgBytesRecv += _.sum(_.map(windowRows, row => row.data.imgBytesReceived));
    agg.cpuSeconds += _.sum(_.map(windowRows, row => row.data.wallTimeMs));
    agg.netOutBytes += _.sum(_.map(windowRows, row => row.data.bodyRawSize));
    outputs.imgBytes.data.datasets[0].data.push(agg.imgBytesSent / (1024 * 1024 * 1024));
  });

  return outputs;
}

module.exports = RequestStats;
