sc_require('views/template');

SC.TemplateCollectionView = SC.TemplateView.extend({
  tagName: 'ul',
  content: null,
  template: SC.Handlebars.compile(''),

  // In case a default content was set, trigger the child view creation
  // as soon as the empty layer was created
  didCreateLayer: function() {
    if(this.get('content')) {
      var indexSet = SC.IndexSet.create(0, this.getPath('content.length'));
      this.arrayContentDidChange(this.get('content'), null, '[]', indexSet);
    }
  },

  exampleViewClass: function() {
    var exampleView = this.get('exampleView');
    if(SC.typeOf(exampleView) === SC.T_STRING) {
      return SC.objectForPropertyPath(exampleView);
    } else {
      return exampleView;
    }
  }.property('exampleView').cacheable(),

  contentDidChange: function() {
    var content = this.get('content');

    if (content !== this._content) {
      this.removeAllChildren();
      this.$().empty();
      this.didCreateLayer();
    }

    content.addRangeObserver(null, this, this.arrayContentDidChange);

    this._content = content;
  }.observes('content'),

  arrayContentDidChange: function(array, objects, key, indexes) {
    var exampleViewClass = this.get('exampleViewClass');
    var self = this;

    // the range observer system, while powerful, loses useful
    // information that is available to the raw enumerableDidChange
    // method. There should be a sanctioned way to observe that
    // information, rather than trying to reverse-engineer the
    // original change.
    indexes.forEachRange(function(start, length) {
      var isDeletion = (array.get('length') < (start+length)), object, i;

      if(isDeletion) {
        var childViews = self.get('childViews');

        childViews.objectAt(start).destroy();
      } else {
        for(i=0; i<length; i++) {
          object = array.objectAt(start + i);
          var itemView = self.createChildView(exampleViewClass.extend({
            content: object,
            context: object,
            tagName: 'li'
          }));
          self.get('childViews').pushObject(itemView);

          itemView.createLayer().$().appendTo(self.$());
        }
      }
    });
  }
});

