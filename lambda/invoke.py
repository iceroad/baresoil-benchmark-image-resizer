#!/usr/bin/env python
import base64
import json
import re
import sys
import tempfile

from os import path
from subprocess import check_output


def main(argv):
    if len(argv) < 2:
        print 'Usage: invoke <path to JPEG file>'
        sys.exit(-1)

    payload = open(argv[1], 'rb').read()
    payload_b64 = base64.b64encode(payload)
    request = {
        'file_upload': payload_b64,
    }
    req_file, req_filename = tempfile.mkstemp(prefix='lambda-upload-')
    open(req_filename, 'wb').write(json.dumps(request))
    res_file, res_filename = tempfile.mkstemp(prefix='lambda-output-')

    lambda_invoke_args = [
            'aws',
            'lambda',
            'invoke',
            '--invocation-type', 'RequestResponse',
            '--function-name', 'img_resizer',
            '--region', 'us-east-1',
            '--log-type', 'Tail',
            '--payload', 'file://%s' % req_filename,
            res_filename
        ]
    lambda_invoke_output = json.loads(
            check_output(' '.join(lambda_invoke_args), shell=True))

    log_result = base64.b64decode(lambda_invoke_output['LogResult'])
    billed_duration = int(re.match(
            r'^.*Billed Duration: (\d+) ms', log_result,
            flags=re.I | re.M | re.S).groups(1)[0])
    memory_size = int(re.match(
            r'^.*Memory Size: (\d+) MB', log_result,
            flags=re.I | re.M | re.S).groups(1)[0])
    max_memory_used = int(re.match(
            r'^.*Max Memory Used: (\d+) MB', log_result,
            flags=re.I | re.M | re.S).groups(1)[0])
    input_basename = path.basename(argv[1])

    print input_basename, memory_size, max_memory_used, billed_duration


if __name__ == '__main__':
    main(sys.argv)
