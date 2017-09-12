const crypto = require('crypto'),
  fs = require('fs'),
  imageMagick = require('./imageMagick'),
  path = require('path'),
  spawnSync = require('child_process').spawnSync
  ;

const MEGABYTES = 1024 * 1024;
const MAX_UPLOAD_SIZE_MB = 25;

module.exports = {
  $websocket(sessionRequest, cb) {
    const remoteAddress = this.getRemoteAddress();
    return cb(null, {
      remoteAddress,
    });
  },

  $http(httpRequest, cb) {
    const requestStartTime = Date.now();
    const files = httpRequest.files;
    if (!files || !files.length) {
      return cb(null, {
        statusCode: 400, // Bad request
        body: Buffer.from('Please attach a file.', 'utf-8'),
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // Process the first uploaded file.
    const file = files[0];
    let rejectReason;
    if (file.mimeType !== 'image/jpeg') {
      rejectReason = 'Only JPEG files are supported.';
    } else {
      if (file.size > MAX_UPLOAD_SIZE_MB * MEGABYTES) {
        rejectReason = `File too large.`;
      }
    }
    if (rejectReason) {
      return cb(null, {
        statusCode: 400, // Bad request
        body: Buffer.from(rejectReason, 'utf-8'),
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // Decode and write binary file data to disk.
    const id = crypto.randomBytes(8).toString('hex');
    const filename = `in-${Date.now()}-${id}.jpg`;
    let outBuffer = Buffer.from(file.data, 'base64');
    const inputSize = outBuffer.length;
    delete file.data;
    fs.writeFileSync(filename, outBuffer);
    outBuffer = null;

    // Spawn the Python module to resize the image.
    const rv = spawnSync('/usr/bin/python', ['wrap-lambda.py', path.resolve(filename)], {
      cwd: path.resolve(__dirname, 'lambdasrc'),
      shell: false,
      stdio: 'pipe',
    });
    const outputJson = JSON.parse(rv.stdout.toString('utf-8'));

    // Construct response.
    const response = {
      metadata: {
        exif: outputJson.exif,
        inputSize,
        walltimeMs: Date.now() - requestStartTime,
      },
      thumbnail: {
        dataUrl: `data:image/jpeg;base64,${outputJson.thumb_640}`,
        fileSize: outputJson.thumb_640.length,
      },
      small: {
        dataUrl: `data:image/jpeg;base64,${outputJson.thumb_128}`,
        fileSize: outputJson.thumb_128.length,
      },
    };

    return cb(null, {
      statusCode: 200,
      body: Buffer.from(JSON.stringify(response), 'utf-8'),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};
