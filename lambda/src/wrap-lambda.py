#!/usr/bin/env python
from handler import img_process
import json
import sys
import base64

event = {
    'file_upload': base64.b64encode(open(sys.argv[1], 'rb').read())
}
print json.dumps(img_process(event, None))
