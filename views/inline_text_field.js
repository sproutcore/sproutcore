// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('mixins/delegate_support') ;
require('views/field/text_field') ;
require('views/field/textarea_field') ;
require('mixins/inline_editor_delegate');

/**
  @class
  
  The inline text editor is used to display an editable area for controls 
  that are not always editable such as label views and source list views.
  
  You generally will not use the inline editor directly but instead will
  invoke beginEditing() and endEditing() on the views yous are 
  editing. If you would like to use the inline editor for your own views, 
  you can do that also by using the editing API described here.
  
  h2. Using the Inline Editor in Your Own Views

  If you need to use the inline editor with custom views you have written,
  you will need to work with the class methods to begin, commit, and discard
  editing changes.
  
  h3. Starting the Editor
  
  The inline editor works by positioning itself over the top of your view 
  with the same offset, width, and font information.  As the user types, the
  field will automatically resize vertically to make room for the user's text.
  
  To activate the inline editor you must call beginEdition() with at least 
  the target view you want the editor to position itself on top of:
  
  {{{
    SC.InlineTextFieldView.beginEditing({
      target: view, validator: validator
    }) ;
  }}}

  You can pass a variety of options to this method to configure the inline
  editor behavior, including:

  - *frame* The editors initial frame in viewport coordinates (REQ)
  - *exampleElement* A DOM element to use when copying styles.
  - *delegate* Optional delegate to receive update notices.  If not passed, the target view will be treated as the delegate. (REQ)
  - *value* The initial value of the edit field.  If not passed, the value property of the target view will be used instead.
  - *multiline* If YES then the hitting return will add to the value instead of exiting the inline editor.
  - *selectedRange* The range of text that should be selected.  If omitted, then the insertion point will be placed at the end of the value.
  - *commitOnBlur* If YES then bluring will commit the value, otherwise it will discard the current value.  Defaults to YES.
  - *validator* Optional validator will be attached to the field.
  
  If the inline editor is currently in use elsewhere, it will automatically
  close itself over there and begin editing for your view instead.  The 
  editor expects your source view to implement the InlineTextFieldViewDelegate
  protocol.

  h2. Commiting or Discarding Changes
  
  Normally the editor will automatically commit or discard its changes 
  whenever the user exits the edit mode.  If you need to force the editor to
  end editing, you can do so by calling commitEditing() or discardEditing():
  
  {{{
    SC.InlineTextFieldView.commitEditing();
    SC.InlineTextFieldView.discardEditing();
  }}}
  
  Both methods will try to end the editing context and will call the 
  relevent delegate methods on the delegate you passed to beginEditing().
  
  Note that it is possible an editor may not be able to commit editing 
  changes because either the delegate disallowed it or because its validator
  failed.  In this case commitEditing() will return NO.  If you want to
  end editing anyway, you can discard the editing changes instead by calling
  discardEditing().  This method will generally suceed unless your delegate
  refuses it as well.
  
  @extends SC.View
  @extends SC.DelegateSupport
  @extends SC.InlineEditorDelegate
  @since SproutCore 1.0
*/
SC.InlineTextFieldView = SC.View.extend(SC.DelegateSupport, SC.InlineEditorDelegate,
/** @scope SC.InlineTextFieldView.prototype */ {

  /**
    Invoked by the class method to begin editing on an inline editor.
    
    You generally should call the class method beginEditing() instead of
    this one since it will make sure to create and use the shared editor
    instance.

    @params options {Hash} hash of options for editing
    @returns {Boolean} YES if editor began editing, NO if it failed.
  */
  beginEditing: function(options) {
    
    // end existing editing if necessary
    this.beginPropertyChanges();
    if (this.get('isEditing') && !this.blurEditor()) {
      this.endPropertyChanges();  return NO ;
    }

    this._optframe = options.frame ;
    this._exampleElement = options.exampleElement ;
    this._delegate = options.delegate ;

    if (!this._optframe || !this._delegate) {
      throw "At least frame and delegate options are required for inline editor";
    }
    
    this._originalValue = options.value || '' ;
    this._multiline = (options.multiline !== undefined) ? options.multiline : NO ;
    this._commitOnBlur =  (options.commitOnBlur !== undefined) ? options.commitOnBlur : YES ;

    // set field values
    var field = this.outlet('field') ;
    field.set('validator', options.validator) ;
    field.set('value', this._originalValue) ;
    field.set('selectedRange', options.selectedRange || { start: this._originalValue.length, length: 0 }) ;

    this.set('isEditing', YES) ;
    
    // add to window.
    SC.app.get("keyPane").appendChild(this) ;
    
    // get style for view.
    this.updateViewStyle() ;

    var del = this._delegate ;

    this._className = this.getDelegateProperty(del,"inlineEditorClassName");
    if(this._className && !this.hasClassName(this._className)) {
        this.setClassName(this._className,true);
      }
    
    this.invokeDelegateMethod(del, 'inlineEditorWillBeginEditing', this) ;
    this.resizeToFit(field.getFieldValue()) ;

    // allow notifications to go
    this.endPropertyChanges() ;
    
    // and become first responder
    this.field.becomeFirstResponder() ;

    this.invokeDelegateMethod(del, 'inlineEditorDidBeginEditing', this) ;
  },
  
  
  /**
    Tries to commit the current value of the field and end editing.  
    
    Do not use this method, use the class method instead.
  */
  commitEditing: function() {
    // try to validate field.  If it fails, return false.  
    var field = this.outlet('field') ;
    if (!$ok(field.validateSubmit())) return NO ;
    return this._endEditing(field.get('value')) ;
  },
  
  /**
    Tries to discard the current value of the field and end editing.
    
    Do not use this method, use the class method instead.
  */
  discardEditing: function() {
    return this._endEditing(this._originalValue) ;
  },
  
  /**
    Invoked whenever the editor loses (or should lose) first responder 
    status to commit or discard editing.
  */
  blurEditor: function() {
    if (!this.get('isEditing')) return YES ;
    return (this._commitOnBlur) ? this.commitEditing() : this.discardEditing();  
  },
  
  /** @private
    Called by commitEditing and discardEditing to actually end editing.

    @returns {Boolean} NO if editing did not exit
  */
  _endEditing: function(finalValue) {
    if (!this.get('isEditing')) return YES ;
    
    // get permission from the delegate.
    var del = this._delegate ;
    if (!this.invokeDelegateMethod(del, 'inlineEditorShouldEndEditing', this, finalValue)) return NO ; 

    // OK, we are allowed to end editing.  Notify delegate of final value
    // and clean up.
    this.invokeDelegateMethod(del, 'inlineEditorDidEndEditing', this, finalValue) ;

    // If the delegate set a class name, let's clean it up:
    if(this._className) this.setClassName(this._className, false);
    
    // cleanup cached values
    this._originalValue = this._delegate = this._exampleElement =  this._optframe = this._className = null ;
    this.set('isEditing', NO) ;

    // resign first responder if not done already.  This may call us in a 
    // loop but since isEditing is already NO, nothing will happen.
    if (this.field.get('isFirstResponder')) this.field.resignFirstResponder();
    if (this.get('parentNode')) this.removeFromParent() ;
    
    return YES ;
  },
  
  /**
    YES if the editor is currently visible and editing.
  
    @type {Boolean}
  */
  isEditing: NO,
  
  /** @private */
  emptyElement: [
    '<div class="sc-inline-text-field-view">',
      '<div class="sizer"></div>',
      '<textarea class="inner-field" wrap="virtual"></textarea>',
    '</div>'
  ].join(''),

  /**
    Collects the appropriate style information from the targetView to 
    make the inline editor appear similar.
  */
  updateViewStyle: function() {
    // collect font and frame from target.
    var f= this._optframe ;
    var el = this._exampleElement ;
    
    var styles = {
      fontSize:       Element.getStyle(el,'font-size'),
      fontFamily:     Element.getStyle(el,'font-family'),
      fontWeight:     Element.getStyle(el,'font-weight'),
      paddingLeft:    Element.getStyle(el,'padding-left'),
      paddingRight:   Element.getStyle(el,'padding-right'),
      paddingTop:     Element.getStyle(el,'padding-top'),
      paddingBottom:  Element.getStyle(el,'padding-bottom'),
      lineHeight:     Element.getStyle(el,'line-height'),
      textAlign:      Element.getStyle(el,'text-align')
    } ;
      
    var field = this.outlet('field') ;
    var sizer = this.outlet('sizer') ;
    
    field.setStyle(styles) ;
    
    styles.opacity = 0 ;
    sizer.setStyle(styles) ;
    sizer.recacheFrames() ;
    
    this.set('frame', f) ;
  },
  
  /**
    Resizes the visible textarea to fix the actual text in the text area.
    
    This method works by keeping a div positioned immediately beneath the 
    text area with an opacity of 0 that contains the same text as the 
    input text field itself.  This is then used to calculate the required 
    size for the text area.
  */
  resizeToFit: function(newValue)
  {
    var sizer  = this.outlet('sizer');
    var field  = this.outlet('field');
    
    // XSS attack waiting to happen... escape the form input;
    var text = (newValue || '').escapeHTML();

    // convert the textarea's newlines into something comparable for the sizer 
    // div appending a space to give a line with no text a visible height.
    text = text.replace(/  /g, "&nbsp; ").replace(/\n/g, "<br />&nbsp;");
    
    // get the text size
    sizer.set('innerHTML', text || "&nbsp;");
    sizer.recacheFrames() ;
    var h = sizer.get('frame').height;
    this.set('frame', { height: h }) ;
  },

  /** 
    The actual text field view used for editing.
  */
  field: SC.TextareaFieldView.extend({

    // handle mouseDown event if we are currently editing so that events
    // don't go any further?
    mouseDown: function(e) {
      arguments.callee.base.call(this, e) ;
      return this.owner.get('isEditing');
    },

    // [Safari] if you don't take key focus away from an element before you 
    // remove it from the DOM key events are no longer sent to the browser.
    willRemoveFromParent: function() {
      this.get('rootElement').blur();
    },
    
    // ask owner to end editing.
    willLoseFirstResponder: function()
    {
      // should have been covered by willRemoveFromParent, but this was needed 
      // too.
      this.get('rootElement').blur();
      return this.owner.blurEditor() ;
    },

    // invoked when the user presses escape.  Returns true to ignore
    // keystroke
    cancel: function() { 
      this.owner.discardEditing(); 
      return YES;
    },
    
    // do it here instead of waiting on the binding to make sure the UI
    // updates immediately.
    fieldValueDidChange: function(partialChange) {
      arguments.callee.base.call(this, partialChange) ;
      this.owner.resizeToFit(this.getFieldValue()) ;
    },
    
    // invoked when the user presses return.  If this is a multi-line field,
    // then allow the newine to proceed.  Otherwise, try to commit the 
    // edit.
    insertNewline: function(evt) { 
      if (this.owner._multiline) {
        return arguments.callee.base.call(this, evt) ;
      } else {
        this.owner.commitEditing() ;
        return YES ;
      }
    },
    
    // Tries to find the next key view when tabbing.  If the next view is 
    // editable, begins editing.
    
    insertTab: function(evt)
    {
      var next = this.get("owner")._delegate.nextValidKeyView();
      this.owner.commitEditing() ;
      if(next) next.beginEditing();
      return YES ;
    },

    insertBacktab: function(evt)
    {
      var prev = this.get("owner")._delegate.previousValidKeyView();
      this.owner.commitEditing() ;
      if(prev) prev.beginEditing();
      return YES ;
    }

  }).outletFor('.inner-field?'),
  
  sizer: SC.View.outletFor('.sizer?')

});


SC.InlineTextFieldView.mixin(
/** @static SC.InlineTextFieldView */ {
  /** Call this method to make the inline editor begin editing for your view.
      
      If the inline editor is already being used for another value it will
      try to dismiss itself from the other editor and attach itself to the
      new view instead.  If this process fails for some reason (for example
      if the other view did not allow the view to end editing) then this
      method will return false.

      You should pass a set of options that at least includes the target
      view.  See class definition for options.
      
      @params options {Hash} hash of options for editing
      @returns {Boolean} YES if editor began editing, NO if it failed.
  */
  beginEditing: function(options) {
    if (!this.sharedEditor) this.sharedEditor = this.create() ;
    return this.sharedEditor.beginEditing(options) ;
  },
  
  /** Save the current value of the inline editor and exit edit mode.
  
    If the inline editor is being used it will try to end the editing and
    close.  If the inline editor could not end for some reason (for example
    if the delegate did not allow the editing to end) then this method will
    return NO.
    
    @returns {Boolean} YES if the inline editor ended or no edit was in 
      progress.
  */
  commitEditing: function() {
    return (this.sharedEditor) ? this.sharedEditor.commitEditing() : YES ;
  },

  /** Discard the current value of the inline editor and exit edit mode.
  
    If the inline editor is in use, this method will try to end the editing,
    restoring the original value of the target view.  If the inline editor
    could not end for some reason (for example if the delegate did not 
    allow editing to end) then this method will return NO.
    
    @returns {Boolean} YES if the inline editor ended or no edit was in progress.
  */
  discardEditing: function() {
    return (this.sharedEditor) ? this.sharedEditor.discardEditing() : YES ;  
  },
  

  
  /**
    The current shared inline editor.  This property will often remain NULL
    until you actually begin editing for the first time.
    
    @type {SC.InlineTextFieldView}
  */
  sharedEditor: null
  
}) ;