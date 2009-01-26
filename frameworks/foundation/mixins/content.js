// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

/**
  @namespace

  The SC.Content mixin makes it easy to manage the displayDidChange
  status of a view. To use this mixin, include it in your view and
  add the properties of the content object you want to trigger a
  displayDidChange method on your view. Your updateDisplay() method
  will then be called at the end of the run loop.
  
  {{{
    YourCoreObject.YourViewClass = SC.View({ SC.Content,
      
      contentDisplayProperties: 'title isEnabled hasChildren'.w(),
      
      ..
      
    })
  }}}
  
*/
SC.Content = {
  
  concatenatedProperties: 'contentDisplayProperties',

  displayProperties: ['content'],
  contentDisplayProperties: [],
  
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
    if (key === '*') {
      this.displayDidChange() ;
    } else {
      // only update if a displayProperty actually changed...s
      var ary = this.get('contentDisplayProperties') ;
      for (var idx=0, len=ary.length; idx<len; idx++) {
        if (key === ary[idx]) this.displayDidChange() ;
      }
    }
  }
  
}