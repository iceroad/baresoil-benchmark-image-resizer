const WINDOW = 30 * 1000;

function quantize(time, offset) {
  offset = offset || 0;
  const binMs = Math.floor((time - offset) / WINDOW) * WINDOW;
  return Math.floor(binMs / 1000); // to seconds
}

module.exports = quantize;
