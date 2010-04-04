// ==========================================================================
// Project:   Forms.FormRowView
// Copyright: ©2009 Alex Iskander and TPSi.
// ==========================================================================
/*globals Forms */

/** @class
	Represents a single row in a form. Rows have label (which may be hidden by being set to NO) and any
	number of fields.
	
	FormRowView extends FormView because it <em>is</em> a FormView. FormRowView manages a collection
	of fields and, instead of displaying them in rows like the standard FormView, flows them
	horizontally <em>and</em> vertically (with your choice of orientation: RIGHT_TO_LEFT or LEFT_TO_RIGHT).
	In addition, FormRowViews have a label that appear either on the left (LEFT_TO_RIGHT orientation) or
	on the right (RIGHT_TO_LEFT orientation).
	
	h2. Mixins
	You usually create rows by calling SC.FormView.row(rowSettings).  Unfortunately,
	this precludes mixing in mixins to the row. However, you can get around this by
	defining the row directly:
	{{{
		someRow: SC.FormRowView.design(MyMixin, { settings here... })
	}}}
	
	There is one problem with that, however: it disables the automatic mixins defined
	in rowMixins, formMixins, and fieldMixins (usually defined on a main form, but
	perfectly definable on a row-basis as well).
	
	The reason why this occurs is due to a safety measure in the auto-mixin mechanism:
	it will only mix in the mixins <em>if</em> the row, form, or field type has a 
	"mixinDesign" property. The reason for this is rather simple: the mixins should,
	in general, be mixed in <em>before</em> the design, not after.
	
	To get around this, you may supply a design argument directly, like so:
	{{{
		someRow: SC.FormView.design(MyMixin, // this is mixed in before other mixins
		{
			// settings to mix in _before_ mixins
			mixinDesign: { 
				// settings to mix in _after_ automatic mixins
			}
		})
	}}}
	
	Note that design may be an array as well, allowing mixins to be applied _after_
	row-mixins.
	
	h2. Todos
	- Make rowOrientation work with right-to-left views.
	- Add option for label to show _at least_ above field; possibly below as well.
	  How would this work? Would it be a row option? A form option? The problem with
	  the former is that the regularLabelWidth stuff wouldn't apply anymore. The
	  problem with the latter is that labels then wouldn't really concern the form
	  at all.
	
	- Split logic.
	
	@extends SC.FormView
	@author Alex Iskander
*/
Forms.FormRowView = Forms.FormView.extend(
/** @scope Forms.FormRowView.prototype */ {
	/*
		Note: all of the auto-hide goodies, etc., are available here.
	*/
	
	/**
	Defaults to NO for row because the Form will cascade, of course.
	*/
	editsByDefault: NO,
	
	/**
	The text the label can show—can be bound, naturally.
	*/
	fieldLabel: null,
	
	/**
		Some class names for the row.
	*/
	classNames: ["sc-form-row-view"],
	
	
	/**
		The regulated width of the label—regulation allows alignment: YAY!
	*/
	regularLabelWidth: 200,
	
	/**
		The space that should be added below each row.
		
		NO means no spacing; null means inherit from parent view. Space is only added
		if the row has any height. Otherwise, the row is assumed not to actually exist.
	*/
	rowSpacing: null,
	
	/**
		The vertical alignment for the label.
		
		Defaults to "smart-center", which will center the label if the
		row is less than twice the height of the label. Otherwise, it will
		top-align the label.
		
		Other possible values: "center", "top", "bottom", NO, or null
		NO passes it on to the label itself. null inherits from parent if possible.
		
		@default smart-center
	*/
	labelVerticalAlign: "smart-center",
	
	/**
		The vertical offset for the label.
		
		If the label is centered, for instance, centerY will equal this value;
		if the label is top-aligned, top will be set to this value.
		
		@note "smart-center" ignores this value for centering, but uses it for
		top align.
	*/
	labelVerticalOffset: 0,
	
	/**
		The horizontal alignment for the label.
		
		Can be "left" or "right".
		
		@default left-to-right, or eventually, something like SC.LEFT_TO_RIGHT
	*/
	rowOrientation: "left-to-right",
	
	/**
		The spacing between the label and the values in the row.
		@default 10.
	*/
	labelSpacing: 10,
	
	/**
		During design, the label view class to use, and during runtime, the label
		view object to use.
		
		If you want a custom label, just replace this. The labelView is actually positioned
		inside labelContainer. This allows proper alignment to take place.
		
		<strong>Note:</strong> The default label view inherits from FormLabelView, which knows how
		to automatically resize itself. You may want to use it.
	*/
	labelView: Forms.FormLabelView.design({
		layout: { right: 0, top: 0 }, // width and height are calculated automatically.
		classNames: ["form-row-label"],
		autoResize: YES
	}),
	
	/**
		The container for the label. 
		
		Unlike the label itself, which is told to autoResize to whatever it needs to be sized to,
		the label container is sized to whatever the largest of all the labels in the form is sized to.
	*/
	labelContainer: SC.View.design({
		layout: {left: 0, width: 150, height: 18, top: 0 } // all of this is recalculated, you know,
	}),
	
	/**
		
	*/
	layout: { left: 0, right: 0, height: 32 },
	
	// OBSERVERS
	/**
		@private
		A hacky way to let parent know the label width has changed. 
		
		Should really use delegates or something... Honestly. Because this is probably
		not stellar for performance (though not necessarily terrible).
	*/
	_labelLayoutDidChange: function()
	{
		this.layoutDidChange();
	}.observes("labelOrientation", "labelVerticalAlign", "labelVerticalOffset", "labelSpacing", "fieldLabel"),
	
	/**
		@private When the regulated width changes, we need to know.
	*/
	_regularLabelWidthDidChange: function()
	{
		this.relayoutFields();
	}.observes("regularLabelWidth"),
	
	// "MEMBER FUNCTIONS" as my former C++ instructor told me.
	/**
		A getter FUNCTION for the parent view to optionally call.
		
		Returns 0 if the label doesn't have a width available.
	*/
	getActualLabelWidth: function()
	{
		var lv = this.get("labelView");
		var w = lv.get("layout").width;
		
		if (!w) return 0;
			
		return w;
	},
	
	/**
		Creates the child views if necessary.
		
		In short: calls super; if needed, creates the label container and adds it
		to the view and creates the label and adds it to the label container.
		Also binds the label's value to our fieldLabel property so everyone can
		be happy.
	*/
	createChildViews: function()
	{
		sc_super();
		
		if (this.labelContainer.isClass)
		{
			this.labelContainer = this.createChildView(this.labelContainer);

			this.labelView = this.labelContainer.createChildView(this.labelView);
			this.labelView.bind("value", [this, "fieldLabel"]);
			this.labelContainer.appendChild(this.labelView);

			this.appendChild(this.labelContainer);
		}
		
		this._updateFields();
	},
	
	/**
		Alerts label layout update if needed so that we can tell parent view.
		
		While FormView usually does everything needed, we have some extras.
	*/
	layoutDidChangeFor: function(v)
	{
		sc_super();
		
		// manually call labelLayoutDidChange if needed
		if (v === this.labelView) this._labelLayoutDidChange();
	},
	
	/**
		We need to make sure the label recalculates, if we have become visible.
	*/
	didUpdateLayer: function()
	{
		sc_super();
		
		var lv = this.get("labelView");
		if (lv["measure"]) lv.measure();

		// that should trigger a layout if we need one.
	},
	
	/**
		Lays out fields horizontally and vertically, based on rowOrientation (eventually).
		Right now, just left to right. Not even any vertical.
	*/
	relayoutFields: function()
	{
		if (this.labelView.isClass)	return; // not ready
		if (this.get("isHidden")) return; // we aren't showing, so don't bother with layout.
		// it will lead to confusion.
		
		/* Get label size stuff */
		// get the label frame
		var label = this.get("labelContainer");
		
		var labelFrame = this.get("labelView").get("frame"),
			rowOrientation = this.get("rowOrientation"),
			labelV = this.get("labelVerticalAlign"),
			regularWidth = this.get("regularLabelWidth"),
			labelHeight = labelFrame.height,
			labelValue = this.get("fieldLabel");
		
		/* Prepare for stuff */
		// prepare positioning
		var currentX = 0, 
			currentY = 0, 
			availableWidth = this.get("frame").width,
			currentHeight = labelHeight,
			currentKeyView = null,
			firstKeyView = null;
		
		// if the label is left-aligned and we are SHOWING the label
		if (labelValue !== NO)
		{
			if (rowOrientation == "left-to-right")
			{
				// we need to offset by label width.
				currentX = regularWidth + this.get("labelSpacing");
			}
			
			// also, subtract label width
			availableWidth -= regularWidth;
		}
		else
		{
			label.set("isVisible", NO);
			labelHeight = 0;
		}
		
		/* Flow */
		// FOR NOW, only flowing horizontally.
		// should wrap around later, but that requires extra logic.
		var fields = this.get("_displayFields"), fl = fields.length;
		for (var i = 0; i < fl; i++)
		{
			var field = fields[i];
			
			// skip if hidden
			if (field.get("isHidden")) continue;
			
			// handle key
			if (field.firstKeyView)
			{
				if (currentKeyView) currentKeyView.nextValidKeyView = field.firstKeyView;
				field.firstKeyView.previousValidKeyView = currentKeyView;
				field.lastKeyView.nextValidKeyView = null;
				currentKeyView = field.lastKeyView;
				
				// propagate first
				if (!firstKeyView) firstKeyView = field.firstKeyView;
			}
			
			// get the current layout
			var fieldLayout = field.get("layout");
			
			var fieldFrame = field.computeFrameWithParentFrame(null);
			if (fieldFrame)
			{
				
				if (fieldFrame.x != currentX || fieldFrame.y != currentY)
				{
					field.adjust({
						left: currentX,
						top: currentY
					});
				}
				
				// if it still needs to be shown, do it...
				if (field.get("needsDisplay")) field.display();
				
				
				var fieldSpacing = field.get("fieldSpacing");
				if (SC.none(fieldSpacing)) fieldSpacing = 0;
				
				currentX += fieldFrame.width + fieldSpacing;
				currentHeight = Math.max(currentY + fieldFrame.height, currentHeight);
			}
		}
		
		/* Update Label Positioning */
		if (labelV == "smart-center")
		{
			// if height < x * label height...
			if (currentHeight < 2 * labelHeight)
			{
				// center (no top)
				label.adjust({ top: null, centerY: 0 });
			}
			else
			{
				label.adjust({ top: this.get("labelVerticalOffset"), centerY: null });
			}
		}
		else if (labelV == "center")
		{
			label.adjust({ top: null, centerY: this.get("labelVerticalOffset") });
		}
		else if (labelV == "top")
		{
			label.adjust({ top: this.get("labelVerticalOffset"), centerY: null });
		}
		
		// add last stuff (width/height)
		label.adjust({
			width: regularWidth,
			height: labelHeight
		});
		
		// set our own height
		this.adjust("height", currentHeight);
		this.set("firstKeyView", firstKeyView);
		this.set("lastKeyView", currentKeyView);
		this.layoutDidChange();
	}
});

Forms.FormRowView.mixin({
	row: function(optionalClass, settings)
	{
		// if settings are defined, optionalClass really is... optionalClass
		if (!settings)
		{
			settings = optionalClass;
			optionalClass = null;
		}
		
		// if there is a field class, we simply create a settings structure for that
		if (optionalClass)
		{
			var fieldSettings = settings;
			
			// rowLabel is for us...
			var rowLabel = fieldSettings["fieldLabel"];
			
			// as is autoHide
			var autoHide = NO;
			if (settings["autoHide"])
			{
				autoHide = settings["autoHide"];
				settings["autoHide"] = NO;
			}
			
			// now
			settings = {
				fields: ['autoField'],
				fieldLabel: rowLabel,
				autoField: Forms.FormView.field(optionalClass, fieldSettings),
				autoHide: autoHide
			};
		}
		
		// now, create like normal
		return Forms.FormRowView.design({ mixinDesign : settings });
	}
});
