// ==========================================================================
// Project:   Forms.FormCheckboxField
// Copyright: ©2009 Alex Iskander and TPSi.
// ==========================================================================
/*globals Forms */

/** @class
	A FormFieldView specialization for CheckboxViews.
	@extends SC.FormFieldView
*/
require("views/form_field");
Forms.FormCheckboxView = Forms.FormFieldView.extend(
/** @scope Forms.FormCheckboxFieldView.prototype */ {
	layout: { height: 16, width: 120 },
	setupLabelView: function()
	{
		// our label is just our checkbox view, but disabled. So, this does nothing,
		// but its sister function does.
	},
	
	setupFieldView: function()
	{
		sc_super();
		
		// label view is field view
		this.labelView = this.field;
	},
	
	updateEditingState: function()
	{
		if (this.get("isEditing"))
		{
			this.field.set("isEnabled", YES);
		}
		else
		{
			this.field.set("isEnabled", NO);
		}
	}
});

Forms.FormFieldView.registerSpecialization(SC.CheckboxView, Forms.FormCheckboxView);