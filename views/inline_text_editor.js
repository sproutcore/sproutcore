// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

SC.inlineTextEditor = SC.View.extend({

  multiline: true,

  emptyElement: [
    '<div class="inline_editor">',
      '<div class="inline_editor_sizer"></div>',
      '<textarea class="inline_editor_field" wrap="off"></textarea>',
      //'<input type="text" class="inline_editor_field" />',
    '</div>'
  ].join(''),

  /**
  * Set the size of the textarea to the width and height of the text value
  */
  render: function()
  {
    var editor = this.get('rootElement');
    var sizer  = editor.childNodes[0];
    var field  = editor.childNodes[1];

    // XSS attack waiting to happen... escape the form input;
    var text = (this.field.get('value') || '').escapeHTML();
    // we don't want the text to wrap inside of the sizer...
    text = text.replace(/ /g, "&nbsp;");
    // convert the textarea's newlines into something comparable for the sizer div
    // appending a space to give a line with no text a visible height.
    text = text.replace(/\n/g, "<br />&nbsp;");

    // get the text size
    sizer.innerHTML = text || "&nbsp;";
    var w = sizer.offsetWidth;
    var h = sizer.offsetHeight;

    // add it to the editor w/ some wiggle room to prevent 
    // the textarea's scrollbars from fickering
    field.style.width  = (w + 20) + "px";
    field.style.height = (h + 5) + "px";
  },
  
  
  outlets: ['field'],
  field: SC.TextFieldView.extend({
    
    mouseDown: function(e)
    {
      e._stopWhenHandled = false;
      return this.owner.get('parentNode').get('isEditing');
    },

    /**
    * resize the editor whenever the field value changes
    * @private
    * @observes value
    */
    valueObserver: function()
    {
      this.owner.render();
    }.observes('value'),

    willRemoveFromParent: function()
    {
      // [Safari] if you don't take key focus away from an element before you remove it from the DOM
      //  key events are no longer sent to the browser.
      this.get('rootElement').blur();
    },
    willLoseFirstResponder: function()
    {
      // should have been covered by willRemoveFromParent, but this was needed too.
      this.get('rootElement').blur();
      var parentNode = this.owner.get('parentNode');
      if ( parentNode )
      {
        if (parentNode.get('isEditing')) parentNode.endInlineEdit();
      }
    },

    cancel: function()
    {
      var parentNode = this.owner.get('parentNode');
      if (parentNode && parentNode.cancel) parentNode.cancel();
    },
    insertNewline: function()
    {
      var parentNode = this.owner.get('parentNode');
      if (parentNode && parentNode.insertNewline) parentNode.insertNewline();
    }

  }).outletFor('.inline_editor_field?')

}).viewFor(null);
