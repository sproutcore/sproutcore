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
      this.arrayContentDidChange(this.get('content'), [], 0);
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

    var content = this._content;
    if (content) {
      content.removeEnumerableObserver(this, this.arrayContentDidChange);
    }

    content = this._content = this.get('content');
    content.addEnumerableObserver(this, this.arrayContentDidChange);
  }.observes('content'),

  /**
    Called when a mutation to the underlying content array occurs.

    This method will replay that mutation against the views that compose the
    SC.TemplateCollectionView, ensuring that the view reflects the model.

    This enumerable observer is added in contentDidChange.

    @param {Array} addedObjects the objects that were added to the content
    @param {Array} removedObjects the objects that were removed from the content
    @param {Number} changeIndex the index at which the changes occurred
  */
  arrayContentDidChange: function(addedObjects, removedObjects, changeIndex) {
    var content       = this.get('content'),
        itemViewClass = this.get('itemViewClass'),
        childViews    = this.get('childViews'),
        addedViews    = [],
        renderFunc, childView, itemOptions, elem, insertAtElement, item, itemElem, idx, len;

    emptyView = this.get('emptyView');
    if (emptyView) { emptyView.$().remove(); emptyView.removeFromParent(); }

    // For each object removed from the content, remove the corresponding
    // child view from DOM and the child views array.
    len = removedObjects.get('length');
    for (idx = changeIndex; idx < (changeIndex+len); idx++) {
      childView = childViews[idx];
      childView.$().remove();
      childView.removeFromParent();
    }

    // If we have content to display, create a view for
    // each item.
    itemOptions = this.get('itemViewOptions') || {};

    elem = this.$();
    insertAtElement = elem.find('li')[changeIndex-1] || null;
    len = addedObjects.get('length');

    renderFunc = function(context) {
      sc_super();
      SC.Handlebars.ViewHelper.applyAttributes(itemOptions, this, context);
    };

    for (idx = 0; idx < len; idx++) {
      item = addedObjects.objectAt(idx);
      view = this.createChildView(itemViewClass.extend({
        content: item,
        tagName: 'li',

        render: renderFunc
      }));


      itemElem = view.createLayer().$();
      if (!insertAtElement) {
        elem.append(itemElem);
      } else {
        itemElem.insertAfter(insertAtElement);
      }
      insertAtElement = itemElem;

      addedViews.push(view);
    }

    childViews.replace(changeIndex, 0, addedViews);

    var inverseTemplate = this.get('inverseTemplate');
    if (childViews.get('length') === 0 && inverseTemplate) {
      view = this.createChildView(SC.TemplateView.extend({
        template: inverseTemplate,
        content: this
      }));
      this.set('emptyView', view);
      view.createLayer().$().appendTo(elem);
      this.childViews = [emptyView];
    }
  }
});

