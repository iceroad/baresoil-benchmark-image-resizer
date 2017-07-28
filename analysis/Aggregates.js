const _ = require('lodash'),
  json = JSON.stringify
;

function Aggregates(rows, extVar, expConfig) {
  const totalTimeSec = Math.floor((_.last(rows).time - _.first(rows).time) / 1000);

  const agg = {
    numRequestsMade: _.filter(rows, row => row.event === 'start_request').length,
    numRequestsOk:  _.filter(rows, row => row.event === 'request_ok').length,
    numRequestsFail:  _.filter(rows, row => row.event === 'request_fail').length,
    rawBytesRecv: _.sum(_.map(rows, row => row.event === 'request_ok' ? row.data.bodyRawSize : 0)),
    imgBytesRecv: _.sum(_.map(rows, row => row.event === 'request_ok' ? row.data.imgBytesReceived : 0)),
    imgBytesSent: _.sum(_.map(rows, row => row.event === 'request_ok' ? row.data.imgBytesPosted : 0)),
    totalTimeSec,
    totalCpuSeconds: _.sum(_.map(rows, row => row.event === 'request_ok' ? row.data.walltimeMs : 0)),
  };

  const imagesPerHour = Math.floor((agg.numRequestsOk / totalTimeSec) * 3600);
  const imgBytesPerHour = Math.floor((agg.imgBytesSent / totalTimeSec) * 3600);
  const imageDataPerHourGB = Math.floor(imgBytesPerHour / (1024 * 1024 * 1024));

  const clusterSize = extVar.server.instances.count;
  let costPerHourRetail = extVar.server.instances.costPerHour.retail * clusterSize;
  let costPerHourReserved = extVar.server.instances.costPerHour.reserved * clusterSize;
  let costPerHourSpot = extVar.server.instances.costPerHour.spot * clusterSize;

  // Add Postgres RDS costs.
  const rdsPerHour = extVar.server.rds.costPerHour;
  costPerHourRetail += rdsPerHour;
  costPerHourReserved += rdsPerHour;
  costPerHourSpot += rdsPerHour;

  // Add ELB costs.
  const elbPerHour = extVar.server.elb.costPerHour;
  const elbDataTransfer = (
    extVar.server.elb.costPerGB *
    ((agg.rawBytesRecv + agg.imgBytesSent) / (1024 * 1024 * 1024)));
  costPerHourRetail += elbPerHour + elbDataTransfer;
  costPerHourReserved += elbPerHour + elbDataTransfer;
  costPerHourSpot += elbPerHour + elbDataTransfer;

  function toUsd(n) {
    const cents = _.padStart(_.toString(Math.floor(n * 100) % 100), 2, '0');
    const dollars = Math.floor(n);
    return `${dollars}.${cents}`;
  }

  agg.bottomLine = {
    costPerHourRetail: toUsd(costPerHourRetail),
    costPerHourReserved: toUsd(costPerHourReserved),
    costPerHourSpot: toUsd(costPerHourSpot),
    imageDataPerHourGB,
    imagesPerHour,
  };

  return agg;
}

module.exports = Aggregates;
