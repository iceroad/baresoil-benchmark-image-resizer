function CreatePercentagePlot(xLabel, yLabel) {
  return {
    legend: {
      display: false,
    },
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: xLabel,
        },
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: yLabel,
        },
        ticks: {
          suggestedMin: 0,
          suggestedMax: 100,
        },
      }],
    },
  };
}

function CreateCountPlot(xLabel, yLabel) {
  return {
    legend: {
      display: false,
    },
    elements: {
      line: {
        stepped: true,
      },
    },
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: xLabel,
        },
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: yLabel,
        },
        ticks: {
          suggestedMin: 0,
        },
      }],
    },
  };
}


function CreateTimeSeries(xLabel, yLabel) {
  return {
    legend: {
      display: false,
    },
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: xLabel,
        },
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: yLabel,
        },
        ticks: {
          suggestedMin: 0,
        },
      }],
    },
  };
}


module.exports = {
  CreateCountPlot,
  CreatePercentagePlot,
  CreateTimeSeries,
};
