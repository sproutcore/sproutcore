// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  A simple object representing the selection inside a text field.  Each
  object is frozen and contains exactly three properties:
  
    *  start
    *  end
    *  length
  
  Important note:  In Internet Explorer, newlines in textarea elements are
  considered two characters.  SproutCore does not currently try to hide this from you.
  
  @extends SC.Object
  @extends SC.Copyable
  @extends SC.Freezable
  @since SproutCore 1.0
*/

SC.TextSelection = SC.Object.extend(SC.Copyable, SC.Freezable,
/** @scope SC.TextSelection.prototype */ {  

  /**
    The number of characters appearing to the left of the beginning of the
    selection, starting at 0.
    
    @type {Number}
  */
  start: -1,
  
  
  /**
    The number of characters appearing to the left of the end of the
    selection.

    This will have the same value as 'start' if there is no selection and
    instead there is only a caret.
    
    @type {Number}
  */
  end: -1,
 
   
  /**
    The length of the selection.  This is equivalent to (end - start) and
    exists mainly as a convenience.
    
    @property {Number}
  */
  length: function() {
    var start = this.get('start') ;
    var end   = this.get('end') ;
    if ((start) === -1  ||  (end === -1)) {
      return -1 ;
    }
    else {
      return end - start ;
    }
  }.property('start', 'end').cacheable(),
  
  
  
  // ..........................................................
  // INTERNAL SUPPORT
  //
  
  init: function() {
    sc_super();
    this.freeze();
  },
  
  
  copy: function() {
    return SC.TextSelection.create({
      start: this.get('start'),
      end:   this.get('end')
    });
  },
  
  
  toString: function() {
    var length = this.get('length');
    if (length  &&  length > 0) {
      if (length === 1) {
        return "[%@ character selected: {%@, %@}]".fmt(length, this.get('start'), this.get('end'));
      }
      else {
        return "[%@ characters selected: {%@, %@}]".fmt(length, this.get('start'), this.get('end'));
      }
    }
    else {
      return "[no text selected; caret at %@]".fmt(this.get('start'));
    }
  }

}) ;
