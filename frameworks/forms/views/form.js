// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2009 Alex Iskander and TPSi
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
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
childViews: "fullName gender".w(),
contentBinding: 'MyApp.personController',

fullName: SC.FormView.row("Name:", SC.TextFieldView.extend({
  layout: {height: 20, width: 150}
})),

gender: SC.FormView.row("Gender:", SC.RadioView.design({
  layout: {width: 150, height: 40, centerY: 0},
  items: ["male", "female"]
}))
}}}

The name of the row (ie. 'fullName'), is passed down to the *FieldView, and used as the key
to bind the value property to the content. In this case it will bind content.fullName to the
value property of the textFieldView. Easy!

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

sc_require("mixins/emptiness");
sc_require("mixins/edit_mode");
sc_require("views/form_row");

SC.FormView = SC.View.extend(SC.FlowedLayout, SC.CalculatesEmptiness, SC.FormsEditMode, /** @scope SC.FormView.prototype */ {
  layoutDirection: SC.LAYOUT_VERTICAL,
  canWrap: NO,
  
  renderDelegateName: 'formRenderDelegate',
  
  formFlowSpacing: undefined,
  formFlowSpacingDefault: { left: 5, top: 5, bottom: 5, right: 5 },
  
  defaultFlowSpacing: function() {
    return this.getThemedProperty('formFlowSpacing', 'FORM_FLOW_SPACING');
  }.property('formFlowSpacing', 'theme'),
  
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
    Rows in the form do not have to be full objects at load time. They can also be simple hashes
    which are then passed to exampleRow.extend.
  */
  exampleRow: SC.FormRowView.extend({
    labelView: SC.FormRowView.LabelView.extend({ textAlign: SC.ALIGN_RIGHT })
  }),

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
    var idx, len = cv.length, key, v, exampleRow = this.get("exampleRow");
    
    // preprocess to handle templated rows (rows that use exampleRow to initialize)
    for (idx = 0; idx < len; idx++) {
      key = cv[idx];
      if (SC.typeOf(key) === SC.T_STRING) {
        v = this.get(key);
        if (v && !v.isClass && SC.typeOf(v) === SC.T_HASH) {
          this[key] = exampleRow.extend(v);
        }
      }
    }
    
    // We need to add in contentValueKey before we call sc_super
    for (idx = 0; idx < len; idx++) {
      key = cv[idx];
      if (SC.typeOf(key) === SC.T_STRING) {
        v = this.get(key);
        if (v.isClass && v.prototype.hasContentValueSupport && !v.prototype.contentValueKey && v.prototype.isFormRow) {
          v.prototype.contentValueKey = key ;
        } else {
          v.prototype.formKey = key;
        }
      }
    }
    
    // get content for further ops
    var content = this.get("content");
    sc_super();
    
    // now, do the actual passing it
    for (idx = 0; idx < len; idx++) {
      key = cv[idx];
      
      // if the view was originally declared as a string, then we have something to give it
      if (SC.typeOf(key) === SC.T_STRING) {
        // try to get the actual view
        v = this.get(key);
        
        // see if it does indeed exist, and if it doesn't have a value already
        if (v && !v.isClass && v.isFormRow) {
          // set content
          if (!v.get("content")) {
            
            // controls can calculate their own value based on the contentValueKey we set earlier
            if (v.get('hasContentValueSupport')) v.bind('content', '.owner.content');
            // if it isn't a control then we can't use contentValueKey, so bind the content manually
            else v.bind('content', '.owner.content.' + key);
          }
          
          // set the label size measuring stuff
          if (this.get('labelWidth') !== null) v.set("shouldMeasureLabel", NO);
          
          // set label (if possible)
          if (v.get("isFormRow") && SC.none(v.get("label"))) {
            v.set("label", key.humanize().titleize());
          }
        }
      }
    }
    
    // our internal bookeeping to prevent .
    this._hasCreatedRows = YES;
    this.recalculateLabelWidth();
  },

  
  /**
    Allows rows to use this to track label width.
  */
  isRowDelegate: YES,
  
  /**
    The manually specified label width (null to automatically calculate, which is the default).
  */
  labelWidth: null,
  
  labelWidthDidChange: function() {
    var childViews = this.get('childViews'), i, len = childViews.length,
    shouldMeasure = SC.none(this.get('labelWidth'));
    
    for(i = 0; i < len; i++) {
      childViews[i].set('shouldMeasureLabel', shouldMeasure);
    }
    
    this.recalculateLabelWidth();
  }.observes('labelWidth'),
  
  /**
    Calculates the current label width (if labelWidth is not null, it sets using the label width)
  */
  recalculateLabelWidth: function() {
    if (!this._hasCreatedRows) return;
    
    var ret = this.get("labelWidth"), children = this.get("childViews"), idx, len = children.length, child;
    
    // calculate by looping through child views and getting size (if possible)
    if (ret === null) {
      ret = 0;
      for (idx = 0; idx < len; idx++) {
        child = children[idx];
      
        // if it has a measurable row label
        if (child.get("rowLabelMeasuredSize")) {
          ret = Math.max(child.get("rowLabelMeasuredSize"), ret);
        }
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

SC.mixin(SC.FormView, {
  /**
  Creates a form row.

  Can be called in two ways: row(optionalClass, properties), which creates
  a field with the properties, and puts it in a new row;
  and row(properties), which creates a new row—and it is up to you to add
  any fields you want in the row.
  
  You can also supply some properties to extend the row itself with.
  */
  row: function(optionalClass, properties, rowExt)
  {
    return SC.FormRowView.row(optionalClass, properties, rowExt);
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
    return SC.FormFieldView.field(fieldClass, properties);
  }
});
