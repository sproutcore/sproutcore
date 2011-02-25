sc_require('views/template');

SC.TemplateCollectionView = SC.TemplateView.extend({
  tagName: 'ul',
  content: null,
  template: SC.Handlebars.compile(''),
  emptyView: null,

  // In case a default content was set, trigger the child view creation
  // as soon as the empty layer was created
  didCreateLayer: function() {
    if(this.get('content')) {
      var indexSet = SC.IndexSet.create(0, this.getPath('content.length'));
      this.arrayContentDidChange(this.get('content'), null, '[]', indexSet);
    }
  },

  itemView: "SC.TemplateView",

  itemViewClass: function() {
    var itemView = this.get('itemView');
    // hash of properties to override in our
    // item view class
    var extensions = {};

    if(SC.typeOf(itemView) === SC.T_STRING) {
      itemView = SC.objectForPropertyPath(itemView);
    }

    if (this.get('itemViewTemplate')) {
      extensions.template = this.get('itemViewTemplate');
    }

    if (this.get('tagName') === 'ul') {
      extensions.tagname = 'li';
    }

    return itemView.extend(extensions);
  }.property('itemView').cacheable(),

  contentDidChange: function() {
    this.removeAllChildren();
    this.$().empty();
    this.didCreateLayer();

    this.get('content').addRangeObserver(null, this, this.arrayContentDidChange);
  }.observes('content').observes('content.[]'),

  arrayContentDidChange: function(array, objects, key, indexes) {
    var content = this.get('content'),
        itemViewClass = this.get('itemViewClass'),
        childViews = this.get('childViews'),
        toDestroy = [], toReuse = [],
        view, item, matchIndex, lastView, length, i;

    emptyView = this.get('emptyView');
    if(emptyView) { emptyView.$().remove(); emptyView.removeFromParent(); }

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

    childViews = [];

    if(array.get('length') === 0 && this.get('inverseTemplate')) {
      view = this.createChildView(SC.TemplateView.extend({
        template: this.get('inverseTemplate'),
        content: this
      }));
      this.set('emptyView', view);
      view.createLayer().$().appendTo(this.$());
    }

    // Add items, using previous if possible
    for (i=0, length=array.get('length'); i < length; i++) {
      item = array.objectAt(i);
      view = toReuse.find(function(v){ return v.get('content') === item; });
      if (!view) {
        view = this.createChildView(itemViewClass.extend({
          content: item,
          context: item,
          tagName: 'li'
        }));
        view.createLayer().$().appendTo(this.$());
      }
      childViews.push(view);
    }

    this.childViews = childViews;
  }
});

