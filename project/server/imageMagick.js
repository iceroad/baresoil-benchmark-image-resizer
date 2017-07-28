const _ = require('lodash'),
  assert = require('assert'),
  crypto = require('crypto'),
  json = JSON.stringify,
  fs = require('fs'),
  spawnSync = require('child_process').spawnSync
  ;


function getExif(inputFile) {
  const cmdLine = `identify -format '%[EXIF:*]' ${json(inputFile)}`;
  console.error(`spawn: ${cmdLine}`);
  const rv = spawnSync(cmdLine, {
    shell: true,
    stdio: ['pipe', 'pipe', 'inherit'],
  });
  if (rv.status) {
    throw new Error(`Cannot extract image metadata.`);
  }
  const rawOut = rv.stdout.toString('utf-8');
  const rawLines = rawOut.split(/\n/);
  const result = {};
  _.forEach(rawLines, (line) => {
    const parts = line.match(/^(\S+?)=(.*)$/);
    if (parts && parts.length >= 3) {
      _.set(result, parts[1].replace(/:/g, '.'), parts[2]);
    }
  });
  _.set(result, 'exif.MakerNote', undefined);
  _.set(result, 'exif.UserComment', undefined);
  return result.exif;
}


function convert(inputFile, outFile, args) {
  if (typeof args !== 'string') {
    args = args.join(' ');
  }
  assert(inputFile !== outFile, 'input and output files are the same');
  try {
    fs.unlinkSync(outFile);
  } catch (e) { }

  const cmdLine = `convert ${json(inputFile)} ${args} ${json(outFile)}`;
  console.error(`spawn: ${cmdLine}`);

  const rv = spawnSync(cmdLine, {
    shell: true,
    stdio: 'pipe',
  });

  if (rv.status) {
    throw new Error(`Image operation failed. ${rv.status} ${rv.stderr}`);
  }

  let outputData;
  try {
    outputData = fs.readFileSync(outFile);
  } catch (e) {
    throw new Error(`Image operation produced no output.`);
  }

  return outputData;
}


module.exports = {
  convert,
  getExif,
};
