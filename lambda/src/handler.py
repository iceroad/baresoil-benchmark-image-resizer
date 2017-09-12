import base64
import exifread
import io
import json
import time
from PIL import Image


def img_process(event, context):
    st_time = time.time() * 1000
    in_file = base64.b64decode(event['file_upload'])
    bytes_io = io.BytesIO(in_file)
    im = Image.open(bytes_io)
    thumb_640 = im.copy()
    thumb_128 = im.copy()

    thumb_640.thumbnail((640, 640))
    thumb_128.thumbnail((128, 128))

    out_640 = io.BytesIO()
    thumb_640.save(out_640, 'jpeg', quality=70)
    out_128 = io.BytesIO()
    thumb_128.save(out_128, 'jpeg', quality=50)
    out_128.seek(0)
    out_640.seek(0)

    bytes_io.seek(0)
    exif = exifread.process_file(bytes_io)
    exif_out = {}
    for tag in exif.keys():
        if tag not in ('JPEGThumbnail', 'TIFFThumbnail', 'EXIF MakerNote'):
            exif_out[tag] = str(exif[tag])

    return {
      'process_time_ms': int((time.time() * 1000) - st_time),
      'file_size': len(in_file),
      'width': im.width,
      'height': im.height,
      'thumb_640': base64.b64encode(out_640.read()),
      'thumb_128': base64.b64encode(out_128.read()),
      'exif': exif_out
    }
