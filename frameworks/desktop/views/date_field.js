// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals Shared */

/** @class

  A Date field add behaviour to the Text Field to support date management, 
  for example, disabling deletion, and special behaviour to tabs commands.
  
  This field view is tighly inregrated with SC.DateTime
  
  By default the Date Field View show Date only, but if you need to show the Time do:
  
  {{{
    dateAndTime: Shared.DateFieldView.design({
      showTime: YES,
      valueBinding: '...'
    }),
  }}}
  
  and if you only need to show time: 
  
  {{{
    timeOnly: Shared.DateFieldView.design({
      showTime: YES,
      showDate: NO,
      valueBinding: '...'
    })
  }}}
  
  The default format are:
  - formatTime: '%I:%M %p',
  - formatDate: '%d/%m/%Y',
  - formatDateTime: '%d/%m/%Y %I:%M %p',
  
  Example usage with special format:

  specialDate: Shared.DateFieldView.design({
    formatDate: '%d %b of %Y',
    valueBinding: '...'
  }),
  
  You can override these format as you like, but has some limitations,
  actually only support these KEY from SC.DateTime:
  
  %a %b %d %H %I %j %m %M %p %S %U %W %y %Y
  
  These are keys that has FIXED length, so we can control the selection and tabing.
  
  @extends SC.TextFieldView
  @since SproutCore 1.0
  @author Juan Pablo Goldfinger
*/
SC.DateFieldView = SC.TextFieldView.extend(
/** @scope SC.DateFieldView.prototype */
{

  value: null,
  
  // Default Behaviour
  showDate: YES,
  showTime: NO,
  
  // Default formats to choose depending of the behaviour.
  formatTime: '%I:%M %p',
  formatDate: '%d/%m/%Y',
  formatDateTime: '%d/%m/%Y %I:%M %p',
  
  // DateTime constants (with fixed width, like numbers or abbs with fixed length)
  // original: '%a %A %b %B %c %d %h %H %i %I %j %m %M %p %S %U %W %x %X %y %Y %Z %%'.w(),
  // NOTE: I think that %a and %b areb't useful because is more adecuato to represente day
  // with 1..31 without zeros at start, but causes the lenght not to be fixed)
  _dtConstants: '%a %b %d %H %I %j %m %M %p %S %U %W %y %Y'.w(),
  // Width constants for each representation %@.
  _wtConstants: [3,3,2,2,2,3,2,2,2,2,2,2,2,4],
  
  // PRIVATE ATTRIBUTES
  activeSelection: 0,

  /*
  FUTURE: DatePickerSupport.
  createChildViews: function() {
    sc_super();
    if (SC.browser.webkit) {
      // ON MOZILLA DON'T WORK
      var view = Shared.DatePickerView.extend({
        layout: { right: 0, centerY: 0, width: 18, height: 15 }
      });
      view.bind('value', [this, 'value']);
      view.bind('isVisible', [this, 'isEnabled']);
      this.set('rightAccessoryView', view);
    }
  },
  */
  
  /**
    The current format to apply for Validator and to show.
    
    @property
    @type {String}
  */
  format: function() {
    var st = this.get('showTime');
    var sd = this.get('showDate');
    if (st === YES && sd === YES) return this.get('formatDateTime');
    if (st === YES) return this.get('formatTime');
    return this.get('formatDate');
  }.property('showTime', 'showDate').cacheable(),
  
  /**
    The current validator to format the Date to the input field and viceversa.
    
    @property
    @type {SC.Validator.DateTime}
  */
  validator: function() {
    return SC.Validator.DateTime.extend({ format: this.get('format') });
  }.property('format').cacheable(),
  
  /**
    Array of Key/TextSelection found for the current format.
    
    @property
    @type {SC.Array}
  */  
  tabsSelections: function() {
    var arr = [];
    var ft = this.get('format');
    var _dt = this.get('_dtConstants');
    var _wt = this.get('_wtConstants');
    
    // Parse the string format to retrieve and build 
    // a TextSelection array ordered to support tabs behaviour
    if (SC.empty(ft)) {
      throw 'The format string is empty, and must be a valid string.';
    }
    
    var pPos, key, keyPos, startAt = 0, nPos = 0, oPos = 0;
    while(startAt < ft.length && ft.indexOf('%', startAt) !== -1) {
      pPos = ft.indexOf('%', startAt);
      key = ft.substring(pPos, pPos + 2);
      startAt = pPos + 2;
      
      keyPos = _dt.indexOf(key);
      if (keyPos === -1) {
        throw "SC.DateFieldView: The format's key '%@' is not supported.".fmt(key); 
      }
      nPos = nPos + pPos - oPos;
      arr.push(SC.Object.create({
        key: key,
        textSelection: SC.TextSelection.create({ start: nPos, end: nPos + _wt[keyPos] })
      }));
      nPos = nPos + _wt[keyPos];
      oPos = startAt;   
    }
    pPos = key = keyPos = null;
    
    return arr;
  }.property('format').cacheable(),
  
  /** @private
    If the activeSelection changes or the value changes, update the "TextSelection" to show accordingly.
   
  */
  updateTextSelecitonObserver: function() {
    var as = this.get('activeSelection');
    var ts = this.get('tabsSelections');
    if (this.get('isEditing')) {
      this.selection(null, ts[as].get('textSelection'));
    }
  }.observes('activeSelection', 'value'),
  
  /** @private
    Updates the value according the key.
   
  */
  updateValue: function(key, upOrDown) {
    // 0 is DOWN - 1 is UP
    var newValue = (upOrDown === 0) ? -1 : 1;
    var value = this.get('value'), hour;
    switch(key) {
      case '%a': case '%d': case '%j': this.set('value', value.advance({ day: newValue })); break;
      case '%b': case '%m': this.set('value', value.advance({ month: newValue })); break;
      case '%H': case '%I': this.set('value', value.advance({ hour: newValue })); break;
      case '%M': this.set('value', value.advance({ minute: newValue })); break;
      case '%p': {
        hour = value.get('hour') >= 12 ? -12 : 12;
        this.set('value', value.advance({ hour: hour }));
        break;
      }
      case '%S': this.set('value', value.advance({ second: newValue })); break;
      case '%U': this.set('value', value.advance({ week1: newValue })); break;
      case '%W': this.set('value', value.advance({ week0: newValue })); break;
      case '%y': case '%Y': this.set('value', value.advance({ year: newValue })); break;
    } 
  },
  
  _selectRootElement: function() {
    // TODO: This is a solution while I don't found how we 
    // receive the last key from the last input.
    // (to see if is entering with Tab or backTab)
    /*if (this.get('activeSelection') === -1) {
    }*/
  },

  /*_textField_fieldDidFocus: function(evt) {
    SC.RunLoop.begin();
    //console.log(evt);
    //console.log(event);
    //console.log(evt.originalEvent);
    this.fieldDidFocus();
    SC.RunLoop.end();
  },*/
  
  /////////////////////////
  // KEY EVENTS SUPPORTS
  /////////////////////////
  
  keyDown: function(evt) {
    if (this.interpretKeyEvents(evt)) {
      evt.stop();
      return YES;
    }
    return sc_super();
  },
  
  ctrl_a: function() {
    return YES;
  },

  moveUp: function(evt) {
    var as = this.get('activeSelection');
    var ts = this.get('tabsSelections');
    this.updateValue(ts[as].get('key'), 1);
    return YES;
  },

  moveDown: function(evt) {
    var as = this.get('activeSelection');
    var ts = this.get('tabsSelections');
    this.updateValue(ts[as].get('key'), 0);
    return YES;
  },

  insertText: function(evt) {
    return YES;
  },

  moveRight: function(evt) {
    var ts = this.get('tabsSelections');
    var ns = this.get('activeSelection') + 1;
    if (ns === ts.length) {
      ns = 0;
    }
    this.set('activeSelection', ns);
    return YES;
  },
    
  moveLeft: function(evt) {
    var ts = this.get('tabsSelections');
    var ns = this.get('activeSelection') - 1;
    if (ns === -1) {
      ns = ts.length - 1;
    }
    this.set('activeSelection', ns);
    return YES;
  },

  insertTab: function(evt) {
    var ts = this.get('tabsSelections');
    var ns = this.get('activeSelection') + 1;
    if (ns < ts.length) { 
      this.set('activeSelection', ns);
      return YES;   
    }
    return NO;
  },

  insertBacktab: function(evt) {
    var ns = this.get('activeSelection') - 1;
    if (ns !== -1) { 
      this.set('activeSelection', ns);
      return YES;   
    }
    return NO;
  },

  mouseUp: function(evt) {
    var ret = sc_super();
    var cs = this.get('selection');
    if (SC.none(cs)) {
      this.set('activeSelection', 0);
    } else {
      var caret = cs.get('start');
      var ts = this.get('tabsSelections');
      var _tsLen = ts.length, cts;
      for(var i=0; i<_tsLen; i++) {
        cts = ts[i].get('textSelection');
        if (caret >= cts.get('start') && caret <= cts.get('end')) {
          this.set('activeSelection', i);
        }
      }
    }
    return ret;
  },

  deleteBackward: function(evt) {
    return YES;
  },

  deleteForward: function(evt) {
    return YES;
  }

});
