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

  itemView: 'SC.TemplateView',

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

    if (this.get('tagName') === 'ul' || this.get('tagName') === 'ol') {
      extensions.tagName = 'li';
    }

    return itemView.extend(extensions);
  }.property('itemView').cacheable(),

  /**
    @private

    When the content property of the collection changes, remove any existing
    child views and observers, then set up an observer on the new content, if
    needed.
  */
  _sctcv_contentDidChange: function() {
    this.removeAllChildren();
    this.$().empty();
    this.didCreateLayer();

    var content = this._content;
    if (content) {
      content.removeEnumerableObserver(this, this.arrayContentDidChange);
    }

    content = this._content = this.get('content');
    if (content) {
      content.addEnumerableObserver(this, this.arrayContentDidChange);
    }
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

    // If the contents were empty before and this template collection has an empty view
    // remove it now.
    emptyView = this.get('emptyView');
    if (emptyView) { emptyView.$().remove(); emptyView.removeFromParent(); }

    // For each object removed from the content, remove the corresponding
    // child view from DOM and the child views array.
    len = removedObjects.get('length');

    // Loop through child views that correspond with the removed items.
    // Note that we loop from the end of the array to the beginning because
    // we are mutating it as we go.
    for (idx = (changeIndex+len)-1; idx >= changeIndex; idx--) {
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
      this.childViews = [view];
    }

    // Because the layer has been modified, we need to invalidate the frame
    // property, if it exists, at the end of the run loop. This allows it to
    // be used inside of SC.ScrollView.
    this.invokeLast('invalidateFrame');
  },

  invalidateFrame: function() {
    this.notifyPropertyChange('frame');
  }
});

