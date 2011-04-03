sc_require('views/template');

SC.TemplateCollectionView = SC.TemplateView.extend({
  tagName: 'ul',
  content: null,
  template: SC.Handlebars.compile(''),
  emptyView: null,

  // Called when the view is first created and anytime the content object
  // changes.  Need to remove any existing observers on the old content and add
  // them to the new content.
  didCreateLayer: function() {
    var oldContent = this._content, newContent = this.get('content');

    if (oldContent) {
      oldContent.removeEnumerableObserver(this, this.arrayContentDidChange);
    }

    if (newContent) {
      newContent.addEnumerableObserver(this, this.arrayContentDidChange);
      this.arrayContentDidChange(newContent, [], 0);
    }

    this._content = newContent;
  },

  itemView: 'SC.TemplateView',

  itemContext: null,

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
    child views and then call didCreateLayer to setup observers and render
    the new content.
  */
  _sctcv_contentDidChange: function() {
    this.get('childViews').forEach(function() {
      this.removeChild(view);
      view.destroy();
    }, this);

    this.$().empty();
    this.didCreateLayer();
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
      childView.destroy();
    }

    // If we have content to display, create a view for
    // each item.
    itemOptions = this.get('itemViewOptions') || {};

    elem = this.$();
    insertAtElement = elem.find('li')[changeIndex-1] || null;
    len = addedObjects.get('length');

    // TODO: This logic is duplicated from the view helper. Refactor
    // it so we can share logic.
    var itemAttrs = {
      "id": itemOptions.id,
      "class": itemOptions['class'],
      "classBinding": itemOptions.classBinding
    };

    renderFunc = function(context) {
      sc_super();
      SC.Handlebars.ViewHelper.applyAttributes(itemAttrs, this, context);
    };

    delete itemOptions.id;
    delete itemOptions['class'];
    delete itemOptions.classBinding;

    for (idx = 0; idx < len; idx++) {
      item = addedObjects.objectAt(idx);
      view = this.createChildView(itemViewClass.extend(itemOptions, {
        content: item,
        render: renderFunc
      }));

      var contextProperty = view.get('contextProperty');
      if (contextProperty) {
        view.set('context', view.get(contextProperty));
      }

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

