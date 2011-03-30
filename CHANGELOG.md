
CHANGE LOG FOR 1.5
==================

Upcoming
-----------
test
* Rewrote the existing inline editing code to make it more generic and integrated it with SC.LabelView, SC.InlineTextFieldView and SC.ListItemView
* Added a new SC.SplitView class to the experimental framework which is a re-write of the existing SC.SplitView class but with cleaner code and multi-pane support.
* Introduced a new AlertPane API and backwards compatibility for the existing API. The new API allows us to create an AlertPane by defining a hash of parameters instead of single methods which take 15+ parameters.
* Added the ability to programmatically trigger SC.Ready instead of automatically by jQuery which allows the app developer to decide when his app is ready to run
* Moved render delegates from Ace to base_theme, and render delegates from base to legacy_theme
* Renamed standard_theme to legacy_theme
* Cleaned up old, broken css code in desktop and foundation frameworks
* Updated ImageView documentation
* Small bug fixes throughout
* Added unit tests for new functionality
* Fix failing unit tests


1.5.0.pre.5
-----------
* Support for high resolution screens.
* Support for IE7 base64 images using MHTML
* Initial support for accessibility (WAI-ARIA)
* Improved SC.Logger, allows log recording and different reporting levels like log4j
* Modular loading and whitelisting. 
* Improvements and bug fixes in SC.TemplateView and Handlebars helpers
* Added {{bindAttr}}, {{boundIf}}, and {{collection}} helpers
* Fixes to Ace CSS
* IE7 compatibility fixes
* Numerous bug fixes and minor improvements


1.5.0.pre.4
-----------

* We are beginning to move API that we don't believe will be ready before 1.5
release into the `experimental` framework. If your apps rely on code that is
migrated to experimental, please make sure you include it as a dependency. For
more, please see frameworks/experimental/README.md.
* Support for extending classes after they've been created with the
reopen()/enhance() combo. For more, see: [this
discussion](http://groups.google.com/group/sproutcore-dev/browse_thread/thread/d65ad54d6fddef5d)
	- This change may break existing code if you call sc_super() in your mixins.
	If your app throws exceptions after updating, please see [this post](http://groups.google.com/group/sproutcore-dev/browse_thread/thread/cc6a97e6133cb8cc).
* Added SC.TemplateView and Handlebars. These allow you to specify the content
of your views using templates.
	- {{#view}} helper allows you to define child views
	- {{#bind}} helper allows you to render a property, and automatically update DOM if that
	property ever changes.
	- {{#collection}} helpers allows you to render a simple collection of items
	using templates
	- SC.TextFieldSupport and SC.CheckboxSupport mixins for SC.TemplateViews
	that wrap <input> elements.
* Split SC.View into units of functionality. SC.View remains functionally the
same, but you can now use SC.CoreView, a light-weight subset of SC.View.
* SC.ImageView will use a <canvas> tag on platforms that support it, which
improves performance significantly.
* SC.SegmentedView now creates an overflow menu if there are too many segments
to display.
	- Class names for SC.SegmentedView have been cleaned up. You may need to
	update your CSS if you were theming SC.SegmentedView.
* You can now observe the contents of enumerables using the special `@each`
key.
* Dependent keys can accept property paths. For example, you can say
.property('foo.bar'), and it will be invalidated if the `bar` property of
`foo` changes.
* Deprecated SC.viewportOffset(). Please use SC.offset() instead, which is
more explicit about what it returns.
* SC.browser now detects Android devices.
* SC.device.orientation now works reliably on desktop, iOS, and Android 2.1
and above.
* Experimental support for gyroscope information, if provided by the browser.
* Unit tests for runtime, desktop, foundation, core_foundation, and datastore
are all passing.


CHANGE LOG FOR 1.4
==================

DISCLAIMER: This is a very rough and not comprehensive overview of the 1000+ commits that formed SproutCore 1.4.

MAJOR
-----
* Touch Support Gen 1
* Bug Fixes and Stabilization
* Build tools performance improvements
* Greenhouse (experimental)
* SC.TableView (experimental)


NEW
---
* Implementation of SC.ErrorCatcher.
* Orientation change recognition
* Add all sorts of alt-key goodness to scrollers:
  * alt-click in track scrolls to click
  * alt-click on buttons scrolls by page
  * alt-drag scrolls 1/2 speed.
* CollectionView fast path (experimental)
* SC.Animatable
* Accelerated Layer
* Adding new SC.device object for states such as orientation, online and offline (and moving orientation out from root responder)
* Add application manifest check to html tag of default index.rhtml
* Media framework (experimental)
* Default iPhone loading screen for webapps
* Nested Records (experimental? or functional?)
* SC.DateTime
* SC.StaticContentView
* SC.Border
* Add a task queue to SproutCore, capable of running tasks in the "background"; that is, while idle. (experimental)


MISCELLANEOUS
-------------
* Better IME support
* MainPane now has a 200x200 min app size. This is where you should set the minimum size of your app.
* Move feature detection from SC.browser to SC.platform.
* Desktop framework no longer requires all other frameworks to load
* Improved context menu handling
* Add trigger() method to SC.routes to trigger the current route.
* Improvements to MenuViews
* Add the ability to observe changes on SC.Set at an add/remove level, allowing for efficient filtering, merging, etc.
* Allow configuration of the touch icons and status bar, as well as favicon via Buildfile.
* Add deprecation warning to SC.Scrollable
* Better mouseWheel support
* Added some ARIA tags for accessibility.
* SC.ScrollView / SC.ScrollerView improvements
* Experimental mousewheel momentum support.  Set SC.WHEEL_MOMENTUM to YES.
* Support descending sort in ArrayControllers.
* SC.StaticLayout functionality is now built into SC.View
* Allow panes the chance to handle user events.
* Fixes/improvements to PopupButton
* Make inline text editor inherit escapeHTML from the list item view
* Added domCSSPrefix to SC.platform
* Make views update their layer's layerId if their layerId changes.
* Adding maxlength property to textfield view
* Added inflector functions to SC.String: singularize() and pluralize()  
* Adding mousewheel support to textareas.
* Adding HTML5 spellCheck support for textfields. It works with the latest versions of Firefox, Sproutcore, Chrome
* Adding lastObject() method to SC.Enumerable
* Allow SC.outlet to specify a different root.
* Improvements to drag/drop
* Improvements to SC.UserDefaults
* Switch from XHTML -> HTML5.
* Update SelectButtonView to use target/action instead of deprecated function calls.
* Invoke button actions after a delay if triggered by keyboard shortcuts.
* Make PopupButtonView and SelectButtonView click and hold delay a constant. Also lowered default value.
* Use SC.Enumerable's sortProperty to sort objects so that this works on any SC.Enumerable not just native arrays.
* SC.Record: Add in a the new concept of 'readOnlyAttributes' to complement 'attributes'.
* New type of SC.PickerPane: PICKER_MENU_POINTER - It's a menu but position like picker pointer
* Add a willRemoveAllChildren to SC.CollectionView.
* Added max() and min() to SC.Array
* Added isDescendantOf method to SC.View
* Added acceptFirstResponder code to radio and checkbox button.
* Add a constant for the default separator height, too.
* use SC.WELL_CONTAINER_PADDING for well and change default value to 15
* Initial support for re-using views in collections
* Push an extra div into the scrollView so that it's possible to style the corner differently.
* Moved all of the standard theme scroller metrics into SproutCore as default values.
* Adding themes to segmented view
* Changing tabView so you can set the height of the tabs with a global variable
* Added provision for Enabling/Disabling menu items in SelectButtonView
* AlertPane: Esc triggers cancel button / enter triggers default button
* SC.Query: 'orderBy' can now optionally be a comparison function. In this case, the specified function will be passed the two records directly, rather than the typical method of operating on specific properties.  This can be useful for complicated comparisons that cannot be expressed by the simpler method.   
* Add option to only allow focus tabbing among webapp controls.(No jumping to address bar
* pushRetrieve, pushDestroy and pushError now return storeKey on success instead of YES
* If there is a list item being edited, commit the changes if the list is scrolled.
* New Validator for positive integers and also accepts a default value
* Make sure we always have a root responder.
* Taught toFormattedString to handle characters %h (unpadded 24-hour time, 1-24) and %i (unpadded 12-hour time, 1-12).
* FocusRings for SC.ButtonView
* Adding a handy escapeForRegExp method to String
* Alignment support for SC.SegmentedView
* allowing text fields to only apply changes on blur via applyImmediately: NO
* Added a property to enable/disable textfield tabbing.
* Removed mobile framework as it was unnecessary
* Update all encodings to be valid UTF-8
* We now force parentViewDidResize. It is no longer optional.
* Only add 'px' units to layout values that are numbers. Strings will be unchanged.
* 'layerLocationNeedsUpdate' is not set until updates are completed.
* If a pane receives a tab key press, try to find the next eligible view in the view hierarchy and assign it first responder.
* In collection view, check if the item is loaded or not before advancing to it.
* SelectButtonView should by default highlight whatever item is set to its value property.
* SC.Request: Added 'proper' async() function
* Changed disclosure from using a label tag to using span
* add debug() support to SC.Logger
* Added the shouldInheritCursor property & documentation to SC.View.  Defaults to YES.
* ResponderContext is now a mixin included by SC.Pane and SC.Application.
* TextFieldView: add support for escapeHTML
* Renamed isEnabledObserver to reduce the likelihood of naming collisions.
* Move Date.now() into runtime, and only implement if the browser does not.
* do not append font-weight style with px
* Disable other mouse events while dealing with inputs.



BUG FIXES
---------
* XSS security improvements
* Fixed a bug with listItem views not always being removed properly
* Miscellaneous code cleanup, optimizations and fixes
* Fix for memory leak in SC.Response
* Fixed issue with SC.ManyArray not notifying inverse attributes of correct records that got removed in SC.ManyArray#replace, with tests.
* TextField hint was not updating for browsers that support placeholder
* Fix SC.Object so it handles both local and non-local property paths at the same time.
* Fixed SC.Binding.disconnect()
* Initialize the value of the select field view to the value of the first element if there is no emptyName and the value hasn't been previously set.
* Fixed RenderContext to properly handle styles starting with a dash
* Change the value of the textfield on keyDown to reflect key repetitions.
* Ignore moveRight and moveLeft events if the user has a control or meta key held down. Otherwise, we may inadvertently block browser keyboard shortcuts.
* Destroy the layer before removing from parent , otherwise the view will leak
* Fixes to SC.SegmentedView.
* Fixed checkbox/righticon/disclosure states in SC.ListItemView
* RootResponder's performKeyEquivalent should check the menupane before the keypane.
* Fixed broken useToggleSelection property.
* Correctly trigger the document's 'ready' event
* SC.LabelView was lacking a default implementation of inlineEditorShouldBeginEditing(), so by default it would never switch to editable mode when 'isEditable' == true.
* Fix for bug in SC.Record.normalize().  It would try to normalize a null child record reference.
* SC.Event.special.mouseover didn't exist, changing it to mouseenter fixes the mouseenter event
* RecordAttribute: Allow null dates
* Checking / Unchecking checkboxes or clicking in empty space was not removing focus from in-focus form fields
* Fixing before ondeactivate in textfield as it is not letting textfields within iframes get focus
* Invalidate the verticalScrollOffset and horizontalScrollOffset with -1 instead of 0, because those are actually valid values.
* Reset the click count if clicks occur too far away from one another
* Make SC.RecordAttribute respect isEditable
* SC.SelectButton should accept first responder only if it is enabled.
* Prevent scrollbars from being shown when PickerPane is opened.




BROWSER
-------
* XHR requests now work with Opera
* IE7 fixes
* Fixed problem with poor security management in FF4
* Fix for window focus events on IE.
* Fixed issue with underscore characters not appearing in IE text fields.
* Adding extra validation to avoid incorrect appearance of hint when deleting all text while using firefox
* Fix the default # added in FF and IE when using routes
* SC.Pane should not call sendAction from its sendEvent implementation.
* Fixing IE8 selection woes and removing a lot of legacy cross-browser code
* Resolve a bug where other panes would disappear if a menu pane was opened (IE7 only).
* Fix for SC.button on IE7, now it calculates the label with once is appended to the document
* SC.TextFieldView: Default hint as empty string to avoid IE displaying null in the text fields

