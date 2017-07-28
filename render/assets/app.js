function configureCharts() {
  Chart.defaults.global.animation = false;
  Chart.defaults.global.legend.position = 'bottom';
  Chart.defaults.global.elements.line.tension = 0;
  Chart.defaults.global.elements.line.fill = false;
  Chart.defaults.global.defaultFontFamily = 'Open Sans';
}

function main() {
  configureCharts();
  new Chart('client_cpu_over_time', DATA.ClientHealth.cpuUsage);
  new Chart('client_memory_over_time', DATA.ClientHealth.memUsage);
  new Chart('num_agents_over_time', DATA.ClientHealth.numAgents);
  new Chart('rtt_latency_over_time', DATA.RequestStats.requestRttStats);
  new Chart('new_requests_over_time', DATA.RequestStats.requestsMadeStats);
  new Chart('image_bytes_over_time', DATA.RequestStats.imgBytes);
  new Chart('walltime_per_image_over_time', DATA.RequestStats.serverWalltimePerImage);


  $('.format-number').each(function() {
    var val = parseInt($(this).text(), 10);
    $(this).text(Number(val).toLocaleString());
  });
}

$(document).ready(main);
