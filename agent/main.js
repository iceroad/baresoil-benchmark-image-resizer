const _ = require('lodash'),
  crypto = require('crypto'),
  fs = require('fs'),
  json = JSON.stringify,
  path = require('path'),
  spawnSync = require('child_process').spawnSync
  ;

const ENDPOINT = 'https://img.soilz.net/__bs__/post';
const SAMPLE_IMAGES = fs.readdirSync('images');

function choice(inArr) {
  return inArr[Math.floor(Math.random() * inArr.length)];
}

function makeRequest() {
  const requestId = crypto.randomBytes(8).toString('hex');
  const imgFile = choice(SAMPLE_IMAGES);
  const imgFilePath = path.join('images', imgFile);
  const imgFileSize = fs.statSync(imgFilePath).size;
  console.log(json({
    event: 'start_request',
    requestId,
  }));

  const startTime = Date.now();
  const cmdLine = `curl -s -X POST -F "image=@${imgFilePath}" ${ENDPOINT}`;
  const rv = spawnSync(cmdLine, {
    shell: true,
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  if (rv.status) {
    console.log(json({
      event: 'request_fail',
      requestId,
    }));
  } else {
    try {
      const bodyStr = rv.stdout.toString('utf-8');
      const bodyRawSize = rv.stdout.length;
      const body = JSON.parse(bodyStr);
      if (!body.thumbnail || !body.small) {
        throw new Error(`Missing either thumbnail or small.`);
      }
      if (!body.thumbnail.dataUrl || !body.small.dataUrl) {
        throw new Error(`Missing either thumbnail or small data url.`);
      }

      const responseImageSize = _.sum(_.filter([
        body.thumbnail.fileSize,
        body.small.fileSize,
      ]));

      console.log(json({
        event: 'request_ok',
        requestId,
        data: {
          rttMs: Date.now() - startTime,
          imgBytesPosted: imgFileSize,
          imgBytesReceived: responseImageSize,
          walltimeMs: _.get(body, 'metadata.walltimeMs'),
          bodyRawSize,
        },
      }));

    } catch (e) {
      console.log(json({
        event: 'request_fail',
        requestId,
        data: {
          error: e.message,
        },
      }));
    }
  }

  setTimeout(makeRequest, Math.floor(Math.random() * 1000));
}

makeRequest();
