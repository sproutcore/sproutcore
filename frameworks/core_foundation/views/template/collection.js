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
    var content = this.get('content'),
        exampleViewClass = this.get('exampleViewClass'),
        childViews = this.get('childViews'),
        toDestroy = [], toReuse = [],
        view, item, matchIndex, lastView, length, i;

    // Destroy unused views
    for (i=0, length=childViews.get('length'); i < length; i++) {
      view = childViews.objectAt(i);
      if (content.contains(view.get('content'))) {
        toReuse.push(view);
      } else {
        toDestroy.push(view);
      }
    }
    for (i=0, length=toDestroy.length; i < length; i++) { toDestroy[i].destroy(); }
    for (i=0, length=toReuse.length; i < length; i++) { toReuse[i].$().remove(); }

    childViews = [];

    // Add items, using previous if possible
    for (i=0, length=array.get('length'); i < length; i++) {
      item = array.objectAt(i);
      view = toReuse.find(function(v){ return v.get('content') === item; });
      if (!view) {
        view = this.createChildView(exampleViewClass.extend({
          content: item,
          context: item,
          tagName: 'li'
        }));
      }
      childViews.push(view);

      view.createLayer().$().appendTo(this.$());
    }

    this.childViews = childViews;
  }
});

