// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/** @class

  Implements a customized file input by creating a standard file input in a
  transparent iframe over top of a SC.ButtonView.
  
  // TODO: revisit this to see if these classnames are usable
  SC.FieldView uses the SC.Control mixin which will apply CSS 
  classnames when the state of the file view changes:
    - active     when button is active
    - sel        when button is toggled to a selected state
  
  @extends SC.FieldView
  @since SproutCore 1.0 
  @author Tyler Keating
*/
SC.FileView = SC.FieldView.extend(
/** @scope SC.FileView.prototype */
{

  classNames: 'sc-file-view'.w(),

  autoSubmit: YES,

  /**
    The name of the action you want triggered when the button is pressed.  
    
    This property is used in conjunction with the target property to execute
    a method when a regular button is pressed.  These properties are not 
    relevant when the button is used in toggle mode.
    
    If you do not set a target, then pressing a button will cause the
    responder chain to search for a view that implements the action you name
    here.  If you set a target, then the button will try to call the method
    on the target itself.
    
    For legacy support, you can also set the action property to a function.  
    Doing so will cause the function itself to be called when the button is
    clicked.  It is generally better to use the target/action approach and 
    to implement your code in a controller of some type.
    
    @property {String}
  */
  action: 'uploadImage',
  
  /**
    The target object to invoke the action on when the button is pressed.
    
    If you set this target, the action will be called on the target object
    directly when the button is clicked.  If you leave this property set to
    null, then the button will search the responder chain for a view that 
    implements the action when the button is pressed instead.
    
    @property {Object}
  */
  target: null,
  
  childViews: 'button form'.w(),
  
  button: SC.ButtonView.design({
    title: 'Choose File',
    theme: 'capsule'
  }),

  form: SC.View.design({
    tagName: 'form',
    
    render: function(context, firstTime) {
      context.attr('method', 'post').attr('action', "javascript:;").attr('enctype', 'multipart/form-data');
      sc_super();
    },
    
    childViews: 'input'.w(),
    
    input: SC.View.design({
      tagName: 'input',

      render: function(context, firstTime) {
        context.attr('type', 'file').end();
        sc_super();
      }
    })
  }),
  
  /** SC.Button **/
  title: 'Choose File',
  
  /** SC.FieldView **/
  
  /**
    Since it is impossible to set the value of file inputs, don't attempt it.
    
  */
  setFieldValue: function(newValue) {
    SC.Logger.log("SC.FileView: setFieldValue: %@ does nothing".fmt(newValue));
    //if (newValue) throw SC.$error('SC.FileView can not set the value of the file field');
  },
  
  fieldValueDidChange: function(partialChange) {
    sc_super();
    if (this.get('autoSubmit')) {
      //this.form.submit();
      
      var resp = SC.Request.postUrl('/proxy/user/update_image').json().async(NO).send({picture: this.get('value')});
    }
  }
});
