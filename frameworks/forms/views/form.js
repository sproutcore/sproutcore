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
Forms.FormView = SC.View.extend(SC.Editable, /** @scope Forms.FormView.prototype */ {

  concatenatedProperties: ["fields", "rowMixin", "fieldMixin", "formMixin"],

  /**
  The list of fields, in order, to show.
  Most of the time, you'll leave this list static; it is not often necessary
  to reorder fields. Nor is it often necessary to remove or add them by removing
  or adding them from this list. Instead, you would keep all fields in this list,
  and let the fields know when to show and hide themselves (for instance, many
  of the fields have a autoHide and emptyValue option).
  */
  fields: [],

  /**
  The spacing below each row (can be overriden per-row)
  */
  rowSpacing: 10,

  /**
  The regulated label width for the children (calculated).
  */
  regularLabelWidth: 200,

  /**
  Called when the fields list has changed, so that recalculation of them can be performed.
  */
  fieldsDidChange: function()
  {
    // we don't know what changed, so redo them ALL!!!
    this._updateFields();
  }.observes("fields"),


  /**
  Automatically hides the form (or row) when there are no fields visible (aside from the label).

  If you want a label only row, you'll need to change this—though, if you want a label-only
  row, we should probably write a FormRowView subclass just for that, that would incorporate
  other things, such as classNames, as well.
  */
  autoHide: NO,

  /**
  Whether to automatically start editing.
  */
  editsByDefault: YES,

  /**
  YES if the form/row is empty, as calculated by relayoutFields.
  */
  isEmpty: NO,

  /**
  YES if the form/row is hidden.

  If YES, parent views will skip over this for layout purposes.
  */
  isHidden: NO,

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
  YES if the form/row needs to be shown.

  This, in effect, allows a delayed call of show(), so that it is only called
  <em>after</em> the layout occurs—useful for animation purposes,
  so that layout animation can be disabled if it is fading in.

  To use, from show, don't update any visibility settings; instead, just set
  needsDisplay to YES; then implement the display method.
  */
  needsDisplay: NO,

  /**
  The content to bind the form to.
  */
  //	content: null,

  /**
  @private
  An array of actual SproutCore views.

  Unlike fields, which can include strings or actual views, this
  only contains views.
  */
  _displayFields: [],

  /**
  @private
  Makes fields relayout when the display fields change.
  */
  _displayFieldsDidChange: function()
  {
    // just a relayout, thank you. No field updates needed.
    this.relayoutFields();
  }.observes("_displayFields"),

  /**
  @private
  A set of (current) field y-positions.
  */
  _fieldPositions: [],

  /**
  @private
  Fields to invalidate next run-through
  */
  _invalidateFrom: null,

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
    sc_super();
    this._updateFields();
  },

  /**
  @private
  Creates a single child field given a key and a specified design.

  Sets up default binding if necessary, sets the fieldLabel and handles fieldKey.
  */
  _createChildField: function(key, value)
  {
    // mixin things...
    value = this.applyMixins(value);

    // create
    var view = this.createChildView(value);

    // now do binding stuff
    var fieldKey;

    // key is used for two things: a) to set a humanized field label, b) to set
    // a default binding.
    if (key) fieldKey = key;

    // if view has a fieldKey, use that
    if (!SC.none(view.get("fieldKey"))) fieldKey = view.fieldKey;

    // this works out conveniently: controls use value, so we set controlValueKey
    // subforms use content, which if not set we set to our own content.

    // now, bind
    view.set("contentValueKey", fieldKey);

    // and, if no content...
    if (SC.none(view.contentBinding)) view.bind("content", [this, 'content']);

    // put inheritable stuff
    view.bind("regularLabelWidth", [this, "regularLabelWidth"]);

    // and just smartstuff
    if (SC.none(view.get("fieldLabel"))) {
      view.set("fieldLabel", key.humanize().capitalize());
    }

    // and boom, we're done.
    return view;
  },

  /**
  Applies any and all appropriate mixins to a child view type.

  This only occurs if the type has a "design"; otherwise, it is assumed
  that the type meant to override all mixins. The design is applied <em>after</em>
  the mixins.
  */
  applyMixins: function(child)
  {
    // no mixins
    if (SC.none(child.prototype.mixinDesign)) return child;

    /* Apply mixins as needed */
    var mixin = null;
    if (child.kindOf(Forms.FormRowView))
    {
      mixin = this.rowMixin;
    }
    else if (child.kindOf(Forms.FormFieldView))
    {
      mixin = this.fieldMixin;
    }
    else if (child.kindOf(Forms.FormView))
    {
      mixin = this.formMixin;
    }
    mixin = SC.A(mixin);

    // push onto the top our own set of mixins
    mixin.unshift({
      fieldMixin: this.fieldMixin,
      rowMixin: this.rowMixin,
      formMixin: this.formMixin
    });

    /* Add design */
    // note that child.design could be NO...
    if (child.prototype.mixinDesign) mixin = mixin.concat(SC.A(child.prototype.mixinDesign));

    /* Extend */
    return child.extend.apply(child, mixin);
  },

  /**
  Begins editing. Does NOT become first responder or anything; just changes editing state.

  Someone tell me if I'm misunderstanding how responders should be used. Thanks.
  */
  beginEditing: function()
  {
    if (this.get("isEditing")) return YES;

    // relay to all fields...
    var fields = this.get("_displayFields"),
    fl = fields.length;

    for (var i = 0; i < fl; i++)
    {
      var field = fields[i];
      field.beginEditing();
    }

    this.set("isEditing", YES);
    return YES;
  },

  commitEditing: function()
  {
    if (!this.get("isEditing")) return YES;

    // relay to all fields...
    var fields = this.get("_displayFields"),
    fl = fields.length;

    for (var i = 0; i < fl; i++)
    {
      var field = fields[i];
      field.commitEditing();
    }

    this.set("isEditing", NO);
    return YES;
  },

  /**
  @private
  Loads any fields—but, currently, does not unload them, which is probably
  a thing.

  A proper way to handle it would, perhaps, be to keep a dictionary (set)
  of current views, transfer them to the new set of views, and remove any that are
  left in the original field set.
  */
  _updateFields: function()
  {
    var fields = this.get("fields");
    var result = [];

    this.beginPropertyChanges();

    var view, key, rl = fields.length;
    for (var i = 0; i < rl; i++)
    {
      key = view = fields[i];
      if (!key) continue;

      if (typeof key === SC.T_STRING)
      {
        view = this[key];
      }

      if (!view)
      {
        console.error("No view found for " + key);
        continue;	
      }

      if (view.isClass)
      {
        view = this._createChildField(key, view);
        this.appendChild(view);
        this[key] = view;
      }

      result.push(view);

      // populate editing
      if (this.get("isEditing")) view.beginEditing();
    }

    this.set("_displayFields", result);
    this.endPropertyChanges();
  },

  /**
  Called by fields when their emptiness changes.

  Always triggers (at end of run loop) a relayout of fields.
  */
  emptinessDidChangeFor: function(child)
  {
    this._calculateEmptiness();
  },

  /**
  Reevaluates emptiness
  */
  _calculateEmptiness: function()
  {
    var df = this.get("_displayFields"),
    len = df.length;
    var empty = YES;
    for (var i = 0; i < len; i++)
    {
      var field = df[i];
      if (!field.get("isEmpty") && !field.get("isHidden"))
      {
        empty = NO;
        break;
      }
    }

    this.setIfChanged("isEmpty", empty);
  }.observes("_displayFields"),

  emptinessDidChange: function()
  {
    var parentView = this.get("parentView");
    if (parentView && parentView.emptinessDidChangeFor) parentView.emptinessDidChangeFor(this);
  }.observes("isEmpty"),
  
  didUpdateLayer: function() {
    sc_super();
    this.relayoutFields();
  },

  layoutChildViews: function()
  {
    // update layout, but before you do, please relayout the fields
    // from invalidate start point.
    this.relayoutFields();

    sc_super();
  },


  /**
  Called when emptiness changes, to recalculate hiddenness.
  */
  hiddenCouldChange: function()
  {
    var hide = NO;
    if (this.get("autoHide") && this.get("isEmpty")) hide = YES;

    if (hide !== this.get("isHidden"))
    {
      if (hide) this.hide();
      else this.show();

      // we've been stalling this, so go ahead and do it now.
      // optimal thing would be to keep a running boolean of if a relayout is needed.
      this.relayoutFields();
    }
  }.observes("autoHide", "isEmpty"),

  /**
  Hides the form (sets isVisible to NO and isHidden to YES).

  Naturally, triggers layout update.
  */
  hide: function()
  {
    this.set("isVisible", NO);
    this.set("isHidden", YES);
    this.layoutDidChange();
  },

  /**
  Shows the form.
  */
  show: function()
  {
    this.set("isHidden", NO);
    this.set("isVisible", YES);
    this.layoutDidChange();
  },

  /**
  Re-lays-out the fields that this form view manages. 

  FormView Just stacks them, but the way it does so is acceptable to animation.


  @param {Number} startPoint
  If the startPoint is a number greater than 0, relayout will only relayout starting at
  that field, and only if that field necessitates relayout of the view.
  */
  relayoutFields: function()
  {
    var start = 0,
    currentY = 0,
    displayFields = this.get("_displayFields"),
    len = displayFields.length,
    fieldPositions = this._fieldPositions,
    currentKeyView = null; // parent views will correct

    // no matter what, check each row for label width—if it has that capability.
    var regulatedWidth = this.get("regularLabelWidth");
    var newRegulatedWidth = 0;
    for (var fieldIndex = 0; fieldIndex < len; fieldIndex++)
    {
      var field = displayFields[fieldIndex];
      if (field.get("isHidden")) continue;

      if (field["getActualLabelWidth"]) 
      {
        newRegulatedWidth = Math.max(newRegulatedWidth, field["getActualLabelWidth"]());
      }
    }

    this.setIfChanged("regularLabelWidth", newRegulatedWidth);

    for (var i = 0; i < len; i++)
    {
      // get height
      var item = displayFields[i];

      // if it is hidden, skip
      if (item.get("isHidden")) continue;

      // handle key
      if (item.firstKeyView)
      {
        if (currentKeyView) currentKeyView.nextValidKeyView = item.firstKetView;
        item.firstKeyView.previousValidKeyView = currentKeyView;
        item.lastKeyView.nextValidKeyView = null;
        currentKeyView = item.lastKeyView;
      }

      // update layout
      item.adjust("top", currentY);

      // if it still needs to be shown, do it...
      if (item.get("needsDisplay")) item.display();

      // update our thingies
      fieldPositions[i] = currentY;

      var height = item.get("layout").height || 0;
      currentY += height;

      // handle row spacing
      var rowSpacing = item.get("rowSpacing");

      // if it got it, use it; otherwise if we got it, use it.
      if (SC.none(rowSpacing)) rowSpacing = this.get("rowSpacing");
      if (rowSpacing && height > 0) currentY += rowSpacing;
    }

    this.set("lastKeyView", currentKeyView);
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
    return Forms.FormRowView.row(optionalClass, properties);
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