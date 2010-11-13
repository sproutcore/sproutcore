SC.BaseTheme.imageButtonRenderDelegate = SC.Object.create({
  render: function(dataSource, context) {
    var image = dataSource.get('image');

    context.addClass('no-min-width');
    if (image) {
      context.push("<div class='img "+image+"'></div>");
    }

    else {
      context.push("<div class='img'></div>");
    }
  },

  update: function(dataSource, $) {
    console.log('update!');
    if (dataSource.didChangeFor('imageButtonRenderDelegate', 'image')) {
      var image = dataSource.get('image');
      
      $.children()[0].className = 'img '+image;
    }
  }
});