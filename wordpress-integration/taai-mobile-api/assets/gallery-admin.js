(function ($) {
  function setPhotos(attachments) {
    var ids = [];
    var preview = $('#taai-gallery-preview').empty();
    attachments.forEach(function (attachment) {
      ids.push(attachment.id);
      var sizes = attachment.sizes || {};
      var url = (sizes.thumbnail && sizes.thumbnail.url) || attachment.url;
      preview.append(
        $('<div>').attr('data-id', attachment.id).append(
          $('<img>').attr({ src: url, width: 100, height: 100 }).css({
            objectFit: 'cover',
            borderRadius: '6px',
          }),
        ),
      );
    });
    $('#taai-gallery-image-ids').val(ids.join(','));
  }

  $(document).on('click', '#taai-gallery-select', function (event) {
    event.preventDefault();
    var frame = wp.media({
      title: 'Select photos for this event album',
      button: { text: 'Use these photos' },
      library: { type: 'image' },
      multiple: true,
    });
    frame.on('select', function () {
      setPhotos(frame.state().get('selection').toJSON());
    });
    frame.open();
  });

  $(document).on('click', '#taai-gallery-clear', function (event) {
    event.preventDefault();
    $('#taai-gallery-image-ids').val('');
    $('#taai-gallery-preview').empty();
  });
})(jQuery);
