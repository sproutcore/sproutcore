// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('views/view') ;

/** @class

  Used to display an iframe.
  
  
  @extends SC.View
  @since SproutCore 1.0
*/
SC.IFrameView = SC.View.extend({
  
  emptyElement: '<div><iframe style="position: absolute; width: 100%; height: 100%; border: 0px; margin: 0px; padding: 0p;"></iframe></div>',
  styleClass: 'sc-iframe-view',

  content: null,
  contentBindingDefault: SC.Binding.single().notEmpty(),
  
  contentUrlKey: null,
  contentUrlKeyBindingDefault: SC.Binding.single(),
  
  displayProperties: ['content'],
  
  $iframe: function() { return this.$('iframe') ; },
  
  delegate: null,
  
  iFrameViewWillLoadUrl: function(view, url) { return url; },
  iFrameViewDidLoadUrl: function(view, url) {},
  
  updateDisplay: function() {
    var content = this.get('content') ;
    var urlKey = this.get('contentUrlKey') ;
    var src = '';
    
    switch (content) {
      case SC.MULTIPLE_PLACEHOLDER:
      case SC.EMPTY_PLACEHOLDER:
      case SC.NULL_PLACEHOLDER:
        src = static_url('blank');
        break;
      default:
        src = (urlKey) ? content.get(urlKey) : content ;
        break;
    }
    
    src = this.invokeDelegateMethod(this.delegate, 'iFrameViewWillLoadUrl', this, src) || '' ;
    var iframe = this.$iframe() ;
    iframe.attr('src', 'javascript:;') ; // clear out the previous src, to force a reload
    iframe.attr('src', src) ;
    this.invokeDelegateMethod(this.delegate, 'iFrameViewDidLoadUrl', this, src) ;
  },

  /** @private */
  _contentDidChange: function(target,key,value,propertyRevision) {
    // handle changes to the content...
    if ((value = this.get('content')) != this._field_content) {

      // get the handler method
      var f = this._contentPropertyDidChange ;
      
      // stop listening to old content.
      if (this._field_content) {
        if (SC.isArray(this._field_content)) {
          this._field_content.invoke('removeObserver', '*', this, f) ;
        } else if (this._field_content.removeObserver) {
          this._field_content.removeObserver('*', this, f) ;
        }
      }
      
      // start listening for changes on the new content object.
      this._field_content = value ;
      if (value) {
        if (SC.isArray(value)) {
          value.invoke('addObserver', '*', this, f) ;
        } else if (value.addObserver) {
          value.addObserver('*', this, f) ;
        }
      }

      // notify everyone that everything is different now.
      this.allPropertiesDidChange() ;
      this.endPropertyChanges() ;
    }
  }.observes('content'),
  
  /** @private Invoked when properties on the content object change. */
  _contentPropertyDidChange: function(target,key,value, propertyRevision) {
    if (key === '*' || key === this.get('contentUrlKey')) {
      this.displayDidChange() ;
    }
  }
  
}) ;