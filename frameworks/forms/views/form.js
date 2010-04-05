// ==========================================================================
// Project:   Forms.FormView
// Copyright: ©2009 Alex Iskander and TPSi
// ==========================================================================
/*globals Forms */

/** @class
FormView
FormView is a lot like a normal view. However, in addition to the childViews
collection, it has a fields collection. The items referenced here are NOT
just children; they are explicity stated in the array fields, which works
just like childViews, but marks fields to be laid out automatically.

Usually, you will place rows into the FormView:
{{{
fields: "name gender".w(),
name: SC.FormView.row(SC.TextFieldView, {
fieldKey: "fullName",
fieldLabel: "Name:"
}),
gender: SC.FormView.row(SC.RadioView, {
items: "male female".w(),
fieldKey: "contactGender",
fieldLabel: "Gender: "
})
}}}


One important thing about the field collection: It can contain any type of
view, including other FormViews or subclasses of FormView.

This is important, because this is how you make nice rows that have a
label and a field: these rows are actually subclasses of FormView itself.

h2. Editing
The form does not allow editing by default; editing must be started by calling
beginEditing.


@extends SC.View
@implements SC.Editable
*/
require("mixins/auto_hide");
require("mixins/edit_mode");
Forms.FormView = SC.View.extend(SC.FlowedLayout, SC.FormsAutoHide, SC.FormsEditMode, /** @scope Forms.FormView.prototype */ {
  layoutDirection: SC.LAYOUT_VERTICAL,
  
  classNames: ["sc-form-view"],

  /**
  Whether to automatically start editing.
  */
  editsByDefault: YES,

  /**
  The input key view (to set previousKeyView for the first row, field, or sub-form).

  For fields, this will likely be the field itself.
  */
  firstKeyView: null,

  /**
  The output key view.
  */
  lastKeyView: null,

  /**
  The content to bind the form to. This content object is passed to all children.
  
  All child views, if added at design time via string-based childViews array, will get their
  contentValueKey set to their string. Note that SC.RowView passes on its contentValueKey to its
  child field if it doesn't have its own, and if its isNested property is YES, uses it to find its
  own content object.
  */
  content: null,


  /**
  Init function.
  */
  init: function()
  {
    if (this.get("editsByDefault")) this.set("isEditing", YES);
    sc_super();
  },

  /**
  Calls _updateFields to load the fields.
  */
  createChildViews: function()
  {
    // keep array of keys so we can pass on key to child.
    var cv = SC.clone(this.get("childViews"));
    var content = this.get("content");
    sc_super();
    
    // now, do the actual passing it
    var idx, len = cv.length, key, v;
    for (idx = 0; idx < len; idx++) {
      key = cv[idx];
      
      // if the view was originally declared as a string, then we have something to give it
      if (SC.typeOf(key) === SC.T_STRING) {
        // try to get the actual view
        v = this.get(key);
        
        // see if it does indeed exist, and if it doesn't have a value already
        if (v && !v.isClass) {
          // set value key
          if (!v.get("contentValueKey")) {
            v.set("contentValueKey", key);
          }
          // set content
          if (!v.get("content")) {
            v.set("content", content);
          }
          // set label (if possible)
          if (v.get("isFormRow") && v.get("label") === "") {
            v.set("label", key.humanize().titleize());
          }
        }
      }
    }
    
  },

  
  /**
    Allows rows to use this to track label width.
  */
  isRowDelegate: YES,
  
  /**
    The current row label width.
  */
  recalculateLabelWidth: function() {
    if (!this._hasCreatedRows) return;
    
    var ret = 0;
    
    // calculate by looping through child views and getting size (if possible)
    var children = this.get("childViews"), idx, len = children.length, child;
    for (idx = 0; idx < len; idx++) {
      child = children[idx];
      
      // if it has a measurable row label
      if (child.get("rowLabelMeasuredSize")) {
        ret = Math.max(child.get("rowLabelMeasuredSize"), ret);
      }
    }
    
    // now set for all children
    if (this._rowLabelSize !== ret) {
      this._rowLabelSize = ret;
      
      // set by looping throuhg child views
      for (idx = 0; idx < len; idx++) {
        child = children[idx];

        // if it has a measurable row label
        if (child.get("hasRowLabel")) {
          child.set("rowLabelSize", ret);
        }
      }
      
    }
  },
  
  /**
    Rows call this when their label width changes.
  */
  rowLabelMeasuredSizeDidChange: function(row, labelSize) {
    this.invokeOnce("recalculateLabelWidth");
  }
});

SC.mixin(Forms.FormView, {
  /**
  Creates a form row.

  Can be called in two ways: row(optionalClass, properties), which creates
  a field with the properties, and puts it in a new row;
  and row(properties), which creates a new row—and it is up to you to add
  any fields you want in the row.
  */
  row: function(optionalClass, properties)
  {
    return SC.FormRowView.row(optionalClass, properties);
  },

  /**
  Creates a field.

  Behind the scenes, this wraps the fieldClass in a FormFieldView—usually a
  specialized variant of FormFieldView meant specifically to wrap that class.

  You can add your own special variants of FormFieldView if you want to expose
  special features of your own view by calling FormFieldView.registerWrapper.
  */
  field: function(fieldClass, properties)
  {
    return Forms.FormFieldView.field(fieldClass, properties);
  }
});