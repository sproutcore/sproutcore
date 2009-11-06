// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

sc_require('views/text_field') ;

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
  
  @extends SC.TextFieldView
  @extends SC.DelegateSupport
  @since SproutCore 1.0
*/
SC.InlineTextFieldView = SC.TextFieldView.extend(SC.DelegateSupport,
/** @scope SC.InlineTextFieldView.prototype */ {

  /**
    Over-write magic number from SC.TextFieldView
  */
  _topOffsetForFirefoxCursorFix: 0,

  /**
    Invoked by the class method to begin editing on an inline editor.
    
    You generally should call the class method beginEditing() instead of
    this one since it will make sure to create and use the shared editor
    instance.

    @params options {Hash} hash of options for editing
    @returns {Boolean} YES if editor began editing, NO if it failed.
  */
  beginEditing: function(options) {
    if (!options) return;
    
    var layout={}, pane, delLayout, paneElem;
    
    // end existing editing if necessary
    this.beginPropertyChanges();
    if (this.get('isEditing') && !this.blurEditor()) {
      this.endPropertyChanges();  return NO ;
    }

    this._optframe = options.frame ;
    this._optIsCollection = options.isCollection;
    this._exampleElement = options.exampleElement ;
    this._delegate = options.delegate ;

    if (!this._optframe || !this._delegate) {
      throw "At least frame and delegate options are required for inline editor";
    }
    
    this._originalValue = options.value || '' ;
    this._multiline = (options.multiline !== undefined) ? options.multiline : NO ;
    if(this._multiline){
      this.set('isTextArea', YES);
    }else{
    this.set('isTextArea', NO);
    }
    this._commitOnBlur =  (options.commitOnBlur !== undefined) ? options.commitOnBlur : YES ;

    // set field values
    this.set('validator', options.validator) ;
    this.set('value', this._originalValue) ;
    //this.set('selectedRange', options.selectedRange || { start: this._originalValue.length, length: 0 }) ;

    this.set('isEditing', YES) ;
    
    // add to window.
    
    pane = this._delegate.pane();

    layout.height = this._optframe.height;
    layout.width=this._optframe.width;
    delLayout = this._delegate.get('layout');
    paneElem = pane.$()[0];
    if(this._optIsCollection && delLayout.left){
      layout.left=this._optframe.x-delLayout.left-paneElem.offsetLeft-1;
      if(SC.browser.msie==7) layout.left--;
    }else{
      layout.left=this._optframe.x-paneElem.offsetLeft-1;
      if(SC.browser.msie==7) layout.left--;
    }
    if(this._optIsCollection && delLayout.top){
      layout.top=this._optframe.y-delLayout.top-paneElem.offsetTop;
      if(SC.browser.msie==7) layout.top=layout.top-2;
    }else{
      layout.top=this._optframe.y-paneElem.offsetTop;
      if(SC.browser.msie==7) layout.top=layout.top-2;  
    }

    this.set('layout', layout);
  
    this.set('parentNode', pane);
    // get style for view.
   
    pane.appendChild(this);
    
    SC.RunLoop.begin().end();
    
    var del = this._delegate ;

    this._className = this.getDelegateProperty(del,"inlineEditorClassName");
    if(this._className && !this.hasClassName(this._className)) {
        this.setClassName(this._className,true);
      }
    
    this.invokeDelegateMethod(del, 'inlineEditorWillBeginEditing', this) ;
    // this.resizeToFit(this.getFieldValue()) ;

    // allow notifications to go
    
    
    // and become first responder
    this._previousFirstResponder = pane ? pane.get('firstResponder') : null;
   
    this.endPropertyChanges() ;

    this.invokeDelegateMethod(del, 'inlineEditorDidBeginEditing', this) ;
    //if(SC.browser.mozilla)this.invokeOnce(this.becomeFirstResponder) ;
    this.invokeLast(this.becomeFirstResponder) ;

  },
  
  
  /**
    Tries to commit the current value of the field and end editing.  
    
    Do not use this method, use the class method instead.
    
    @returns {Boolean}
  */
  commitEditing: function() {
    // try to validate field.  If it fails, return false.  
    if (!SC.$ok(this.validateSubmit())) return NO ;
    return this._endEditing(this.get('value')) ;
  },
  
  /**
    Tries to discard the current value of the field and end editing.
    
    Do not use this method, use the class method instead.

    @returns {Boolean}
  */
  discardEditing: function() {
    return this._endEditing(this._originalValue) ;
  },
  
  /**
    Invoked whenever the editor loses (or should lose) first responder 
    status to commit or discard editing.
    
    @returns {Boolean}
  */
  blurEditor: function() {
    if (!this.get('isEditing')) return YES ;
    return this._commitOnBlur ? this.commitEditing() : this.discardEditing();  
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
    if (this.get('isFirstResponder')) {
      var pane = this.get('pane');
      if (pane && this._previousFirstResponder) {
        pane.makeFirstResponder(this._previousFirstResponder);
      } else this.resignFirstResponder();
    }
    this._previousFirstResponder = null ; // clearout no matter what
    
    if (this.get('parentNode')) this.removeFromParent() ;  
    
    return YES ;
  },
  
  /**
    YES if the editor is currently visible and editing.
  
    @property {Boolean}
  */
  isEditing: NO,
  
  // TODO: make this function work for 1.0
  // /**
  //   Resizes the visible textarea to fix the actual text in the text area.
  //   
  //   This method works by keeping a div positioned immediately beneath the 
  //   text area with an opacity of 0 that contains the same text as the 
  //   input text field itself.  This is then used to calculate the required 
  //   size for the text area.
  // */
  // resizeToFit: function(newValue)
  // {
  //   
  // 
  // 
  // var sizer  = this.outlet('sizer');
  //     var field  = this.outlet('field');
  //     
  //     // XSS attack waiting to happen... escape the form input;
  //     var text = (newValue || '').escapeHTML();
  // 
  //     // convert the textarea's newlines into something comparable for the sizer 
  //     // div appending a space to give a line with no text a visible height.
  //     text = text.replace((/ {2}/g), "&nbsp; ").replace(/\n/g, "<br />&nbsp;");
  //     
  //     // get the text size
  //     sizer.set('innerHTML', text || "&nbsp;");
  //     sizer.recacheFrames() ;
  //     var h = sizer.get('frame').height;
  //     this.set('frame', { height: h }) ;
  // },
  
  /** @private */
  mouseDown: function(e) {
    arguments.callee.base.call(this, e) ;
    return this.get('isEditing');
  },
  
  /** @private */
  keyDown: function(evt) {
    var ret = this.interpretKeyEvents(evt) ;
    this.fieldValueDidChange(true);
    return !ret ? NO : ret ;
  },
  
  /** @private */
  insertText: null,
  
  //keyUp: function() { return true; },

  // [Safari] if you don't take key focus away from an element before you 
  // remove it from the DOM key events are no longer sent to the browser.
  /** @private */
  willRemoveFromParent: function() {
    this.$input()[0].blur();
  },
  
  // ask owner to end editing.
  /** @private */
  willLoseFirstResponder: function(responder) {
    if (responder !== this) return;

    // if we're about to lose first responder for any reason other than
    // ending editing, make sure we clear the previous first responder so 
    // isn't cached
    this._previousFirstResponder = null;
    
    // should have been covered by willRemoveFromParent, but this was needed 
    // too.
    this.$input()[0].blur();
    return this.blurEditor() ;
  },

  /**
    invoked when the user presses escape.  Returns true to ignore keystroke
    
    @returns {Boolean}
  */
  cancel: function() { 
    this.discardEditing(); 
    return YES;
  },
  
  // do it here instead of waiting on the binding to make sure the UI
  // updates immediately.
  /** @private */
  fieldValueDidChange: function(partialChange) {
    arguments.callee.base.call(this, partialChange) ;
    //this.resizeToFit(this.getFieldValue()) ;
  },
  
  // invoked when the user presses return.  If this is a multi-line field,
  // then allow the newine to proceed.  Otherwise, try to commit the 
  // edit.
  /** @private */
  insertNewline: function(evt) { 
    if (this._multiline) {
      evt.allowDefault();
      return arguments.callee.base.call(this, evt) ;
    } else {
      // TODO : this is a work around. There is a bug where the 
      // last character would get dropped 
      // if the editing was completed by pressing return
      // needs to be fixed
      if (this.get('value') != this.$input().val()) {
        this.set('value', this.$input().val());
      }
      
      
      this.commitEditing() ;
      return YES ;
    }
  },
  
  // Tries to find the next key view when tabbing.  If the next view is 
  // editable, begins editing.
  /** @private */
  insertTab: function(evt) {
    this.resignFirstResponder();
    this.commitEditing() ;
    var next = this._delegate.nextValidKeyView();
    if(next) next.beginEditing();
    return YES ;
  },

  /** @private */
  insertBacktab: function(evt) {
    var prev = this._delegate.previousValidKeyView();
    this.commitEditing() ;
    if(prev) prev.beginEditing();
    return YES ;
  },
  
  /** @private */
  deleteForward: function(evt) {
    evt.allowDefault();
    return YES;
  },
  
  /** @private */
  deleteBackward: function(evt) {
    evt.allowDefault();
    return YES ;
  }
  
});


SC.InlineTextFieldView.mixin(
/** @scope SC.InlineTextFieldView */ {
  
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
    this._exampleElement = options.exampleElement ;
    
    // If exampleInlineTextFieldView is set, load this class otherwise use
    // the default, this.
    var klass = options.exampleInlineTextFieldView 
              ? options.exampleInlineTextFieldView : this;
    
    var layout = options.delegate.get('layout');
    var s = this.updateViewStyle();
    var p = this.updateViewPaddingStyle();
    
    var str= ".inline-editor input{"+s+"} ";
    str= str+".inline-editor textarea{"+s+"} .inline-editor .padding{"+p+"}";
    var pa= document.getElementsByTagName('head')[0] ;
    var el= document.createElement('style');
    el.type= 'text/css';
    el.media= 'screen';
    if(el.styleSheet) el.styleSheet.cssText= str;// IE method
    else el.appendChild(document.createTextNode(str));// others
    pa.appendChild(el);
    
    this.editor = klass.create({ classNames: 'inline-editor', layout: layout}) ;
    return this.editor.beginEditing(options) ;
    
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
    return this.editor ? this.editor.commitEditing() : YES ;
  },

  /** Discard the current value of the inline editor and exit edit mode.
  
    If the inline editor is in use, this method will try to end the editing,
    restoring the original value of the target view.  If the inline editor
    could not end for some reason (for example if the delegate did not 
    allow editing to end) then this method will return NO.
    
    @returns {Boolean} YES if the inline editor ended or no edit was in progress.
  */
  discardEditing: function() {
    return this.editor ? this.editor.discardEditing() : YES ;  
  },
  
  /** @private */
  updateViewStyle: function() {
    var el = this._exampleElement[0] ;   
    var styles = '';
    var s=SC.getStyle(el,'font-size');
    if(s && s.length>0) styles = styles + "font-size: "+ s + " !important; ";
    s=SC.getStyle(el,'font-family');
    if(s && s.length>0) styles = styles + "font-family: " + s + " !important; ";
    s=SC.getStyle(el,'font-weight');
    if(s && s.length>0) styles = styles + "font-weight: " + s + " !important; ";
    s=SC.getStyle(el,'z-index');
    if(s && s.length>0) styles = styles + "z-index: " + s + " !important; ";
    s=SC.getStyle(el,'line-height');
    if(s && s.length>0) styles = styles + "line-height: " + s + " !important; ";
    s=SC.getStyle(el,'text-align');
    if(s && s.length>0) styles = styles + "text-align: " + s + " !important; ";
    s=SC.getStyle(el,'top-margin');
    if(s && s.length>0) styles = styles + "top-margin: " + s + " !important; ";
    s=SC.getStyle(el,'bottom-margin');
    if(s && s.length>0) styles = styles + "bottom-margin: " + s + " !important; ";
    s=SC.getStyle(el,'left-margin');
    if(s && s.length>0) styles = styles + "left-margin: " + s + " !important; ";
    s=SC.getStyle(el,'right-margin');
    if(s && s.length>0) styles = styles + "right-margin: " + s + " !important; ";
    
    return styles;
  },

  /** @private */
  updateViewPaddingStyle: function() {
    var el = this._exampleElement[0] ;   
    var styles = '';
    var s=SC.getStyle(el,'padding-top');
    if(s && s.length>0) styles = styles + "top: "+ s + " !important; ";
    s=SC.getStyle(el,'padding-bottom');
    if(s && s.length>0) styles = styles + "bottom: " + s + " !important; ";
    s=SC.getStyle(el,'padding-left');
    if(s && s.length>0) styles = styles + "left: " + s + " !important; ";
    s=SC.getStyle(el,'padding-right');
    if(s && s.length>0) styles = styles + "right: " + s + " !important; ";
    
    return styles;
  },

  
  /**
    The current shared inline editor.  This property will often remain NULL
    until you actually begin editing for the first time.
    
    @property {SC.InlineTextFieldView}
  */
  editor: null
  
}) ;