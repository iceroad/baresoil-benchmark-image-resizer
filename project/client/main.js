$(document).ready(function main() {
  $('#file-upload-form').submit(function(evt) {
    // Retrieve DOM file element from selector.
    const form = $(this);
    const file = $('#file-input')[0].files[0];
    if (!file) {
      $('#error-message').text('Please select a file.');
      return evt.preventDefault();
    }
    $('#error-message').text('');

    // Create HTML FormData structure.
    const formData = new FormData(form);
    const fileTag = 'file-0';
    formData.append(fileTag, file);;

    // Disable input form while request is in flight.
    form.find('input').prop('disabled', true);

    // Submit image to backend.
    $.ajax({
      url: '/__bs__/post',
      type: 'POST',
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      success: function(data, textStatus, jqXHR) {
        data = data || {};
        console.log('Received server response:', data);

        if (data.thumbnail) {
          $('#thumbnail-image-size').text(Number(data.thumbnail.fileSize).toLocaleString());
          $('#thumbnail-image-preview').attr('src', data.thumbnail.dataUrl);
          $('#preview-thumbnail').show();
        } else {
          $('#preview-thumbnail').hide();
        }

        if (data.small) {
          $('#small-image-size').text(Number(data.small.fileSize).toLocaleString());
          $('#small-image-preview').attr('src', data.small.dataUrl);
          $('#preview-small').show();
        } else {
          $('#preview-small').hide();
        }

        if (data.metadata) {
          const exif = data.metadata || {};
          $('#exif-json').text(JSON.stringify(exif, null, 2));
          $('#preview-metadata').show();
        } else {
          $('#preview-metadata').hide();
        }

        // Re-enable input form.
        form.find('input').prop('disabled', false);
      },
    });

    evt.preventDefault();
  });
});
