// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @mixin

  This mixin allows a view to get its value from a content object based
  on the value of its contentValueKey.

      myView = SC.View.create({
        content: {prop: "abc123"},

        contentValueKey: 'prop'
      });

      // myView.get('value') will be "abc123"

  This is useful if you have a nested record structure and want to have
  it be reflected in a nested view structure. If your data structures
  only have primitive values, consider using SC.Control instead.
*/
SC.ContentValueSupport = {

  /**
    Walk like a duck.

    @type Boolean
    @default YES
  */
  hasContentValueSupport: YES,

  /** @private */
  initMixin: function() {
    this._control_contentDidChange() ; // setup content observing if needed.
  },
  
  /**
    The value represented by this control.
    
    Most controls represent a value of some type, such as a number, string
    or image URL.  This property should hold that value.  It is bindable
    and observable.  Changing this value will immediately change the
    appearance of the control.  Likewise, editing the control 
    will immediately change this value.
    
    If instead of setting a single value on a control, you would like to 
    set a content object and have the control display a single property
    of that control, then you should use the content property instead.

    @type Object
    @default null
  */
  value: null,
  
  /**
    The content object represented by this control.
    
    Often you need to use a control to display some single aspect of an 
    object, especially if you are using the control as an item view in a
    collection view.
    
    In those cases, you can set the content and contentValueKey for the
    control.  This will cause the control to observe the content object for
    changes to the value property and then set the value of that property 
    on the "value" property of this object.
    
    Note that unless you are using this control as part of a form or 
    collection view, then it would be better to instead bind the value of
    the control directly to a controller property.
    
    @type SC.Object
    @default null
  */
  content: null,
  
  /**
    The property on the content object that would want to represent the 
    value of this control.  This property should only be set before the
    content object is first set.  If you have a displayDelegate, then
    you can also use the contentValueKey of the displayDelegate.
    
    @type String
    @default null
  */
  contentValueKey: null,
  
  /**
    Invoked whenever any property on the content object changes.  
    
    The default implementation will update the value property of the view
    if the contentValueKey property has changed.  You can override this
    method to implement whatever additional changes you would like.
    
    The key will typically contain the name of the property that changed or 
    '*' if the content object itself has changed.  You should generally do
    a total reset if '*' is changed.
    
    @param {Object} target the content object
    @param {String} key the property that changes
    @returns {void}
    @test in content
  */
  contentPropertyDidChange: function(target, key) {
    return this.updatePropertyFromContent('value', key, 'contentValueKey', target);
  },
  
  /**
    Helper method you can use from your own implementation of 
    contentPropertyDidChange().  This method will look up the content key to
    extract a property and then update the property if needed.  If you do
    not pass the content key or the content object, they will be computed 
    for you.  It is more efficient, however, for you to compute these values
    yourself if you expect this method to be called frequently.
    
    @param {String} prop local property to update
    @param {String} key the contentproperty that changed
    @param {String} contentKey the local property that contains the key
    @param {Object} content
    @returns {SC.Control} receiver
  */
  updatePropertyFromContent: function(prop, key, contentKey, content) {
    var del, v;
    
    if (contentKey === undefined) contentKey = "content"+prop.capitalize()+"Key";
    
    // prefer our own definition of contentKey
    if(this[contentKey]) contentKey = this.get(contentKey);
    // if we don't have one defined check the delegate
    else if((del = this.displayDelegate) && (v = del[contentKey])) contentKey = del.get ? del.get(contentKey) : v;
    // if we have no key we can't do anything so just short circuit out
    else return this;
    
    // only bother setting value if the observer triggered for the correct key
    if (key === '*' || key === contentKey) {
      if (content === undefined) content = this.get('content');
      
      if(content) v = content.get ? content.get(contentKey) : content[contentKey];
      else v = null;
      
      this.set(prop, v) ;
    }
    
    return this ;
  },
  
  /**
    Relays changes to the value back to the content object if you are using
    a content object.
    
    This observer is triggered whenever the value changes.  It will only do
    something if it finds you are using the content property and
    contentValueKey and the new value does not match the old value of the
    content object.  
    
    If you are using contentValueKey in some other way than typically
    implemented by this mixin, then you may want to override this method as
    well.
    
    @returns {void}
  */
  updateContentWithValueObserver: function() {
    var key = this.contentValueKey ?
      this.get('contentValueKey') :
      this.getDelegateProperty('contentValueKey', this.displayDelegate),
      content = this.get('content');

    if (!key || !content) return ; // do nothing if disabled

    // get value -- set on content if changed
    var value = this.get('value');

    if (typeof content.setIfChanged === SC.T_FUNCTION) {
      content.setIfChanged(key, value);
    }

    // avoid re-writing inherited props
    else if (content[key] !== value) {
      content[key] = value ;
    }
  }.observes('value'),
  
  /** @private
    This should be null so that if content is also null, the
    _contentDidChange won't do anything on init.
  */
  _control_content: null,

  /** @private
    Observes when a content object has changed and handles notifying 
    changes to the value of the content object.
  */
  // TODO: observing * is unnecessary and inefficient, but a bunch of stuff in sproutcore depends on it (like button)
  _control_contentDidChange: function() {
    var content = this.get('content');
    
    if (this._control_content === content) return; // nothing changed
    
    var f = this.contentPropertyDidChange,
    // remove an observer from the old content if necessary
        old = this._control_content;

    if (old && old.removeObserver) old.removeObserver('*', this, f) ;
  
    // update previous values
    this._control_content = content ;
  
    // add observer to new content if necessary.
    if (content && content.addObserver) content.addObserver('*', this, f) ;

    // notify that value did change.
    this.contentPropertyDidChange(content, '*') ;
    
  }.observes('content'),
  
  /** @private
    Since we always observe *, just call the update function
  */
  _control_contentValueKeyDidChange: function() {
    // notify that value did change.
    this.contentPropertyDidChange(this.get('content'), '*') ;
  }.observes('contentValueKey')
};

