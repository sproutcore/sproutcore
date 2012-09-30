CHANGE LOG
==========

1.9.0
----------

### CHANGES & FEATURES


* Improves and adds much documentation.
* Adds the Showcase app used on http://showcase.sproutcore.com.  This app contains
  an up-to-date implementation of all of SproutCore's Views and Controls,
  including code snippets for the many options of each.  The app also links into
  the SproutCore demos, which are being recovered and re-implemented.
* Introduces SC.Color:
  - feature detection for rgba
  - parser from rgb(a), hsl(a), hex, and argb values to a normalized rgb space
  - converter from the normalized rgb space to rgb(a), hsl(a), hex, and argb notations
  - hsl mutators to rotate the hue, saturate, or lighten a color
* Fixes and enhances the media framework:
  - enables live scrubbing
  - decouples MediaSlider and Audio/Video view
  - fixes layout rendering by creating a render delegate
  - adds SC.mediaCapabilities for media capability detection
  - updates styling to use Chance
* Adds window.requestAnimationFrame() polyfill.  This allows you to use
  requestAnimationFrame on any browser, which will use the browser's version or
  fallback to a basic timer version instead.  This does not use the run loop,
  because this is for non-event driven animations.
* Adds indeterminate SC.ProgressView support.
  - updated to match new SproutCore theme
  - uses CSS animation if possible or else falls back to highly optimized 
  JavaScript animation.
* Adds `useUnixTime` attribute to SC.DateTime record attribute handlers.
* Adds XHR2 event notification support.

  Here are some example uses:

  - req.notify('progress', this, this.reqDidProgress); // Handle 'progress' events
  - req.notify('abort', this, this.reqDidAbort); // Handle 'abort' events
  - req.notify('upload.progress', this, this.reqUploadDidProgress); // Handle 'progress' events on the XMLHttpRequestUpload
* Adds ability for SC.Query to compare through association (i.e. 
  query.orderBy = 'address.street' now works).
* Adds several more unit tests and fixes outdated unit tests.
* Moves base CSS for SC.ButtonView, SC.CheckboxView and SC.RadioView out of the
  foundation framework and into the desktop framework where these views are 
  defined.
* Prevents exception when setting SC.SelectView items to null.
* Prevents exception when clicking on a content-less SC.CollectionView.
* Improves SC.SelectView handling of separator items.
  - Previously, if a separator item didn't include a title, it would throw an 
  exception in String loc().
  - Added a small improvement to the SelectView performance since separator 
  items can't be selected so we don't need to check them.
  - Added unit test showing that the first selectable item becomes the default 
  value when no value is set. This prevents disabled items or separators from 
  being default.
* Adds binding between a tree controller and it's tree item observer to keep 
  the selection options between the two in sync ('allowsSelection', 
  'allowsMultipleSelection', 'allowsEmptySelection').
* Adds 'interpretKeyEvents' support to SC.TextFieldView allowing you to implement
  special handling of many common keys.  For example, it is now easy to submit
  the value of a field or fields when the 'Return' key is pressed by adding
  an insertNewline() method to the text field view.  Other interpreted keys are:
  escape, delete, backspace, tab, left arrow, right arrow, up arrow, down arrow,
  home, end, page up and page down.
* Moves key_bindings to core_foundation so it can be with views/view/keyboard 
  (the only file that uses it).
* Refactors createNestedRecord for child records without primary keys:
  - The previous version had some broken code, such as checking for the 
  existence of id, although it is not set anywhere previously or passed to the 
  function and creating an existingId variable for no purpose. It also wrapped 
  most of the function in a run loop, but this is not necessary.
  - The previous version would create a new record even if the child record has 
  no primary key, which would auto-generate a new primary key and thus a new 
  store key each time that same child record needed to be re-accessed. It also 
  did extra work fixing up the store by having to manipulate the id after creation.
  - This version generates a re-usable id upfront for child records that don't 
  have a primary key value. This means that the id is unique to that child 
  record and if the child record is unloaded and reloaded, even though it 
  doesn't have a primary key, it will still get the same generated id and thus, 
  get the same store key in the store, preventing the store from creating new 
  objects and leaking the caches on the old child record.
* Changes SC.ArrayController orderBy syntax to 'key ASC' or 'key DESC', not 
  'ASC key' or 'DESC key'.
  - SC.Query's and MySQL's ordering syntax are both 'key DIR' and so 
  SC.ArrayController's syntax should be the same.
* Adds functionality to SC.routes to pull the parameters out of the location
  when it is URL encoded.  For example, 'videos/5?format=h264&size=small&url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DG0k3kHtyoqc%26feature%3Dg-logo%26context%3DG21d2678FOAAAAAAABAA' now properly has url: 'http://www.youtube.com/watch?v=G0k3kHtyoqc&feature=g-logo&context=G21d2678FOAAAAAAABAA'
  in the params object.
* Adds observer support of firstObject and lastObject on Enumerables.
  Note: Any Object that mixes in SC.Enumerable must pass the start and length 
  arguments to enumerableContentDidChange() for firstObject and lastObject to 
  be independently observable.
* Fixes SC.ArrayController so that when orderBy changes, the firstObject and 
  lastObject properties are invalidated and thus recomputed if needed.
* Refactors SC.GridView so that the adjustment of item views only updates when 
  the frame changes.  It is also has much better performance by only changing on 
  a width change, since items are positioned left to right and only changing
  the items currently visible.
  - This also makes SC.GridView work with sparse data, where it would previously
  have requested the entire array of data each time the clipping frame changed (happens on scroll in SC.ScrollView).
  - This fixes a problem rotating grid views on an iPad.
* Improves SC.DROP_ON support for SC.ListView and SC.GridView. These views now 
  update the target item's isDropTarget property to reflect that it is the 
  target of a drag and drop operation, which allows us to style the drop target 
  item appropriately.
  - Previously the support was commented out in SC.GridView and was incorrectly 
  implemented in SC.ListView (it wiped out the isSelected value on the target items).
* Prevents exception on SC.CollectionFastPath when calling itemViewForContentIndex()
  before the view was visible.
* Enhances SC.SegmentedView to support vertical layout and adds a vertical layout theme.
* Makes SC.DisclosureView default CSS more directly targeted to that type of
  button only.
* Removes internal _observers, _bindings and _properties arrays from SC.Object 
  classes after they are created.  This was a waste of memory.
* Reduces the default touchBoundary on touch controls from 50px outside, which 
  is really big, to 25px outside.
* Makes iframes scrollable in iOS by default.
* Fixes the default value of SC.MenuPane's itemSeparatorKey to be 'isSeparator' 
  as indicated in the documentation.
* SC.LabelView with a value of null or undefined will render an empty string "",
  not "null" or "undefined".
* Adds a warning in debug mode when duplicate bindings for the same key are 
  detected. This warning detects when a binding is being created more than once 
  for the same property.
  - For example, if you define 'smallBinding' inside 'MyApp.ParentClass = SC.View.extend({ smallBinding: … ' and then extend MyApp.ParentClass further like so 'childView1: MyApp.ParentClass.extend({ smallBinding: … ', then childView1 would have the same binding to small appearing twice in its bindings Array. This can lead to strange behavior when you try connect and disconnect the bindings on the fly.
* Adds support to SC.MenuPane for pgUp/pgDown/home/end to navigate the menu.
* Improves SC.ModalPane's automatic disabling of covered SC.TextFieldViews.  
  SC.ModalPane will disable tabbing into any fields not in the current pane, so 
  that tabbing won't jump "behind" the modal pane.  However, if the text field
  had isBrowserFocusable set to NO, SC.ModalPane would unintentionally set it to
  YES when it was done.  This is no longer the case and SC.ModalPane will respect
  the previous value of isBrowserFocusable on each text field.
* SC.View:animate() no longer fires multiple callbacks when animating more than
  one property at the same time.
* Adds support for SC.Object:invokeOnceLater() so that additional arguments that 
  are given are passed to the target method.

### DEPRECATIONS & REMOVALS

* The default value of SC.Menu:itemSeparatorKey has been changed from 'separator' 
  to 'isSeparator' to match the documentation.  If a property 'separator' is found
  on the menu item, it will still be used and a developer warning will appear in 
  debug mode.
* SC.ArrayController's orderBy direction syntax has been changed to match that 
  of SC.Query and MySQL.  Using the previous syntax will result in a developer
  warning in debug mode.
* Removes the TestControls app from SproutCore.  This app was not well-maintained
  and has been replaced by the Showcase app used on http://showcase.sproutcore.com.

### BUG FIXES

* Fixes touchIsInBoundary function of SC.View to account for the fact that the 
  screen coordinates of the view can change without its frame or parentView changing.
* Fixes critical bug in SC.View:animate() where animating a layout property and then 
  later animating a different layout property on the same view would throw an 
  exception.
* Fixes edge cases of SC.View:animate() so that callbacks are still fired if
  animating to the current value or animating with a duration of zero.
* Fixes missing computed properties, bindings and observers when reopening a 
  class.  When re-opening a class we have to also re-configure all current 
  subclasses of that class. If we don't, then any computed properties, bindings 
  or observers added in the reopen() won't be registered in instances of the 
  subclass.
  - Makes the call to reopen() recurse through all the current class's subclasses 
  in order to re-extend them. If the hash given to reopen() contains computed 
  properties, bindings or observers, these will be registered for the subclass.
  - Takes care not to override properties that the subclass may have defined 
  prior to the reopen().
* Fixes SC.Object.prototype.mixin so that the mixed in objects' observables are initialized.
* Prevents multiple change notifications firing with changes to SC.Array and SC.SparseArray.
* Fixes SC.ArrayController's orderBy to work with more than a single Array item. 
  Ex.  testController.set('orderBy', ['lastName', 'firstName']) would not have ordered by firstName second.
* Fixes SC.UserDefaults readDefault for Firefox 13 to return a default value.
* Fixes memory leak in the store when removing or replacing child records.
  - The first time that you access a child record, the store updates four caches: 
    parentRecords (parentStoreKeys => [childStoreKeys]), childRecords (childStoreKeys => parentStoreKeys), records (SC.Record instances), dataHashes (SC.record backing attributes).
  - Previously, if you set the child record to null or unloaded and reloaded the 
  parent record or set the child record to a new child record and the child 
  record doesn't have a primary key, the store would create duplicates on all 
  these hashes, resulting in a memory leak.
  - Now each time that you set the value of the child record on the parent, it 
  clears the old child record caches in the store.
  - See previous tests to prove the memory leak, by modifying the child record 
  and checking the number of properties in the store's caches.
* Removes SC.SegmentedView's observers from items when they are removed from 
  the view.  This prevents a case where a removed item calls itemContentDidChange 
  and puts itself back in a segment.
* Fixes customized classNameBindings. (ex. classNameBindings: ['isWorking:wkg'])
* Fixes memory leak with SC.TextFieldView accessory views and with typing large
  amounts of text.
* Fixes addition of has-icon class to list items that don't actually have an 
  icon defined.
  - There are situations where a ListItem will have `hasContentIcon` set to true, 
  but will not have an icon defined. It's more proper to not add the has-icon 
  class, which makes space for an icon, if there is no icon.
* Fixes gray background appearing on first and last segments and white background
  appearing on first and last disabled segmentes of SC.SegmentedView.
* Fixes mouse move, enter, exiting on SC.SegmentedView when a segment is disabled.
  - previously, the disabled segment still received the active class when the 
  mouse moved into it or over it
  - added unit tests to show that the active class is properly applied
* Fixes the application of defaultValues to the data hash in createRecord and 
  also allows the provided hash to use the attribute name OR the attribute key 
  when there is a key.
  - The previous implementation would assign 'null' data hash properties for 
    every property in the record, now the data hash only includes attributes.
  - The default value would be applied to the attribute name in the data hash, 
    which didn't work if the attribute used a key.
  - Previously, if a record attribute had a key, then accidentally passing the 
    attribute name instead of the attribute key would fail to work correctly. 
    Now it will accept the name and/or the key and only store the key in the 
    data hash.
* Fixes the default styling for SC.TextFielView on IE, Opera and Mobile Safari.
* Fixes the styling for icons on SC.LabelView.
  - the previous style caused the entire label to be position relative with 
  middle vertical-align when an icon was included. Those styles should only 
  apply to the img.
* Fixes theming of SC.SegmentedView.
  - fixed the disabled style wasn't being applied to the view or its segments
  - changed font size of regular size view from 11px to 12px which matches the 
    font size of regular size button
  - fixed the img positioning to be properly centred for the different size controls
* Fixes Jumbo control size style on SC.ButtonView to allow for 24px high icons.
* Fixes setting content of SC.StaticContentView to null, so that it removes
  the previous content.
* Fixes default CSS on SC.ListItemView img.right-icon
* Fixes default vertical icon position for SC.SMALL_CONTROL_SIZE checkbox.
* Converts background-position CSS which is not yet supported by FireFox to CSS 
  which is currently supported by FireFox.
* Fixes regression with SC.offset and Mobile Safari targeted code.


1.8.2 - BUG FIX RELEASE
----------

* Thinned picker pane border divs so that they don't overlap the content view. 
  [0b06db2]
* Prevents target property conflict when configuring button targets with 
  SC.AlertPane. [0364b5c]
* Changed the aria-orientation of horizontal SC.ScrollView to 'horizontal' from 
  'vertical'. [c3ee69b]
* Allows SC.CollectionFastPath to work with sparse content by always returning 
  an item view even when content isn't yet available. [020653b]
* Prevents SC.GridView from iterating over its content array in order to work 
  with sparse content. [020653b]
* The 'mobile-safari' body class name is no longer being added in all browsers. 
  [b491224]
* Enables pasting in SC.TextFieldView to notify that the value changed. 
  [a51318b]
* Prevents default touch behavior being intercepted on <textarea> and <select> 
  elements in mobile Safari. [8093963]

1.8.1 - BUG FIX RELEASE
----------

* Documentation fixes.
* Fixes the timeout proxy settings: :inactivity_timeout & :connect_timeout.
  Setting them in a proxy config allows the developer to extend the timeout for
  the connection to be setup and for activity to occur.
* Adds missing CSS for SC.PickerPane left and right pointer.
* Tidies up index.rhtml template:
  - removes self-closing HTML
  - renames app.manifest to manifest.appcache
* Fixes the styling of ModalPane backdrop for SC.PanelPane. [b1d386a]
* Fixes regression with Firefox specific SC.TextFieldView CSS. [0bc44f1]
* Improves use and compatibility of SC.TextFieldView:
  - applies 'autocapitalize' and 'autocorrect' attributes to all browsers
  - automatically centers hint text
  - fixes problem centering input elements in IE8
  - fixes problem positioning hint in textareas
  - improves readability of hints by making them antialiased in Webkit
* Fixes issue when subsequent attempts to load a failed/aborted image
  will result in queue processing being stalled. [62ad31f]
* Fixes nesting SC.ScrollViews not passing mousewheel events from child to
  parent scroll view when child can no longer scroll. [341e88d]
* Fixes styling problem with SC.ListItemView right-icon. [6de3c55]
* Fixes SC.StaticContentView not removing previous content when setting content
  to null. [81307a8]
* Fixes Safari focus ring artifacts in panes and Chrome bug with non-HW
  accelerated animations in render layers, by removing the default .sc-pane
  --webkit-transform: translate3d(0,0,0) CSS. This also makes it possible
  to accurately manage which parts of the page should become layers, because
  making everything a layer is not optimal. [f9d56f3]

1.8.0
----------

### CHANGES & FEATURES

* Added --statechart switch to sc-gen app to get a base statechart setup.
* Addition of `invokeNext` to SC.RunLoop (easily accessed from SC.Object).
  This function invokes the passed target/method pair once at the beginning of
  the next runloop, before any other methods (including events) are processed.
  Use this to defer painting to make views more responsive.

  If you call this with the same target/method pair multiple times it will
  only invoke the pair only once at the beginning of the next runloop.
* Addition of `invokeOnceLater` to SC.Object.  A convenience method which makes
  it easy to coalesce invocations to ensure that the method is only called
  once. This is useful if you need to schedule a call but only want it to
  trigger once after some defined interval has passed.
* Desktop framework thoroughly updated to include WAI-ARIA attributes for
  improved compatibility with assistive technologies.
* Addition of routing integration with SC.Statechart. States can be made to
  represent a route (by default SC.routes routes) and if assigned then the
  state will be notified to handle the route when triggered any time the app's
  location changes to match the state's assigned route.
* Added `mult` extension to String that multiplies a string a given number of
  times. [5a2aee1]
* Addition of SC.StatechartDelegate mixin. Apply this to objects that are to
  represent a delegate for a SC.Statechart object.  When assigned to a
  statechart, the statechart and its associated states will use the delegate
  in order to make various decisions.
* TextFieldView has a new property'hintOnFocus' which uses a div to act in place
  of the regular 'placeholder' so that it remains visible when the text field
  has focus.
* SC.TextFieldView long placeholders will show ellipsis if too long. [ab66960]
* Rewrite of SC.browser.  Matches more browsers correctly and replaces the
  potpourri of various properties with seven standard properties: device, name,
  version, os, osVersion, engine and engineVersion with matching constants:
  SC.BROWSER, SC.DEVICE, SC.OS, SC.ENGINE.
* Added a function SC.RunLoop.wrapFunction, which, when called on a function,
  returns a version wrapped in code that ensures a run loop. [de83d88]
* Created a new object SC.bodyOverflowArbitrator, which, given requests for
  body overflow:hidden; or overflow:visible; will decide which overflow to
  assign. Objects issue, then change or withdraw their requests. Previously,
  views may have set the body overflow directly, which would lead to
  unpredictable behavior when more than one object had an interest in the
  setting at one time. [c55e32b]
* APP_IMAGE_ASSETS is a new global array that contains the list of all sprited
  images, this is ideal to preload images at different points. Even before the
  app or SC finishes loading. [31c2239]
* Added support for text selection in SC.TextFieldSupport. [1dcc289]
* Don't throw an exception if there are SC.Record.EMPTY records in the store and
  calling commitRecords on the store.
* Changed getDelegateProperty of SC.DelegateSupport to not accept null as a
  valid value.
* Updated Handlebars to version 1.0.0.beta.4. [e80d40d]
* Added helper method `patchUrl` to SC.Request. [5e955ce]
* Throw an error in development mode when passing an incorrect parameter to
  SC.IndexSet.create.
* Added default itemTagNames for 'dl' and 'select' collection tagNames in
  TemplateCollectionView. [73c3f84]
* Don't allow disabled radio buttons to be checked in SC.RadioView. [99e47b1]
* Moved all TemplateView code into its own framework.  It is still included by
  default when requiring :sproutcore in your Buildfile, but can easily be
  excluded by requiring specific frameworks instead.
* Speed improvement in IE by avoiding excessive focusin/focusout events.
  [1c817a9]
* Speed improvements in renderContext, switching from joining arrays of strings
  to simple string concatenation.
* SC.TabView places tabs first in the view hierarchy for accessibility.
  [9e1b4e4]
* In SC.SelectView, if value object and list objects are both records, compare
  the store keys to see if they are really the same thing.
* Added @lang support for multi-lingual text-to-speech voices. [4f9ec80]
* Faster code escaping using regular expressions instead of DOM.
* New flag to stop picker repositioning when the window is resized.
* SegmentedView update to enable/disable overflow.
* Small performance improvement for splitView.
* New string measurement functions to optimize for string wrapping.
* Added support for autoCorrect and autoCapitalize in TextFields.
* Added back object types previously removed by the refactored SC.Object
* Refactored observer paths code for a more robust handling.
* Rewrite SC.LOG_RUNLOOP_INVOCATIONS — now renamed to SC.LOG_DEFERRED_CALLS — to work with the new runloop implementation.
* Added this SC.RunLoop.kill to terminate cleanly a run loop in case of an error.
* Added the ability to dynamically add substates to a statechart via a state's addSubstate method.
* Updated the statechart tracing logic.
* Updated SC.State. getSubstate now accepts a callback; added getState method; gotoState and gotoHistoryState now use getState
* Updated state's gotoState and gotoHistoryState to allow for a more expressive state arg that now allows for the use of 'parentState'
* Updated SC.State's getSubstate method to allow for path expressions. Also refacted the findFirstRelativeCurrentState method.
* New SC globals to provide information like build mode, build number and locale.

### DEPRECATIONS & REMOVALS

* SC.Animatable has been deprecated.  Please use the animate method in SC.View.
* SC.TableView has been deprecated.  Please use one of the alternative community versions.
* Several properties of SC.browser have been deprecated.  Please use the standardized properties and matching constants.
* Removed `minWidth` property in SC.ButtonView. [9ae0a43]
* Removed unused frameworks: mini and documentation.
* Removed unnecessary Internet Explorer legacy code.
* Removed unnecessary font-weight SC.LabelView CSS attribute.
* Removed zIndex inside SC.TextFieldViews.
* Removed preload images task for “Chance” slicing system.
* Removed unnecesary strong reset in YUI reset.
* Removed unnecessary line-heights for SC.LabelView that caused problems with
  theme stylings and the global 1.2em line-height.
* Removed acceleration layer on sliders as it was creating GPU glitches on
  views appended after the slider.
* Removed legacy handler of buttons to improve speed.
* Removed deltaAdjust in scrollView and left only the calculations done in
  SC.Event.
* Removed the --template switch from sc-init, because it didn't create a project
  structure that was compatible with SC 1.8+.

### BUG FIXES

* Fixed an issue causing ScrollerView to not render correctly on first time.
  [2e26048]
* Fixed an issue with SC.RecordArray's made up of new records without guids,
  where the order of the array would change in Chrome. [3937a54]
* Fixed SC.SplitView is not properly resetting the cursor after a drag. [5db962d]
* SC.CollectionView's height updates when its length changes. [cb03ec4]
* Fixed the --dry-run switch for sc-init.
* Several new unit tests, fixes for failing unit tests and clean up of outdated
  tests.
* The documentation was extensively searched for typographical and
  grammatical errors and was fixed.
* Several fixes to Ace styles and images to remove inconsistencies.
* If the defaultValue of a child attribute returned an array of childRecords,
  the resulting constructed instance would be an Array, not a ChildArray.
* Fixed the determination of `hasAcceleratedLayer` for accelerated Views.
* Fix 'x' & 'y' values returned by SC.pointInElement.  Note: This method is the
  most correct way to test the inclusion of a point within a DOM element.
* Fix `rangeStartForIndex` in SC.IndexSet when encountering holes where hints
  should have pointed. [506752b]
* Fix in Handlebars template integration, so that the triple-stash {{{ doesn't
  escape values and only {{ does. [7d3703d]
* Fixed adding `.sc-complete` class to SC.ProgressView when the maximum is
  reached. [98b4ce5]
* Fixed inline text field view attempting to be blurred after it is destroyed.
  [fe18943]
* ListItemViews edited inline can work with a validator.
* Fixed bug in TemplateCollectionView where specifying a tagName in the
  itemView or itemViewOptions wouldn't properly override default itemTagNames.
  [73c3f84]
* Fixes to improve scrolling acceleration and speed in different browsers,
  including OS X Lion.
* Fixed the ENDS_WITH conditional in SC.query to return correct results.
  [63e5492]
* Fixes to SC.FlowedLayout: remove name collision with maxSpacerLength, removed
  extra adjust calls, and fixed to work better with border properties in
  layouts. [15472f8]
* Fix in SC.RootResponder for double keydown event with wrong charcode when
  modifier key is held down. [eb7b59e]
* Fixed case where Views with useStaticLayout == true would return improper
  measurements for `frame`. [91eca04]
* If you clicked on a checkbox but let go of the mouse when not over it, it
  behaved like you clicked it. [a4ebdcc]
* Fixed some datastore issues when using key values that were different than
  the association property names. [80efcdb]
* Fixed the body overflow decision in SC.Panes by using > and < instead of >=
  and <=. This keeps overflow properly hidden when size equals min size.
  [7dfe46d]
* Fixed the positioning/initial selection of the popup menus in SC.SelectView,
  which was about 1px off. [51f31ff]
* Fixed crash in InlineEditor mixin when beginEditing and commitEditing were
  called in the same runloop. [3c124cc]
* TextFieldView now correctly hides the text when the field type is password.
  [7df3c4b]
* Fixed tooltip for image buttons. [dcbf4ec]
* Tabbing was not respecting modal panes. Fixed so that textfields get a
  tabindex=-1 when they are not in the modal pane. [4313d5f]
* When apps didn't have a first responder at loading time the app would throw
  an error.
* Passing the native event when a focus or blur event is called. This makes it
  consistent with all the other event handlers.
* Workarounds for mobileSafari touch handling in textfields and links.
* IE was getting two blur/focus events.
* Small bug fix for timers when there is no currentRunLoop.
* Reverted change to receive focus if it the view becomes key responder.
* Disabling layout style calculations for opacity in IE, as this will always break transparent pngs.
* Changed code to get a reliable anchor for pickers and menus.
* Reposition pickers based on the size of the app and not the window viewport.
* Added tooltips back to button.
* Fix for popup_buttons as they were not rendering as expected.
* Bug fix to update list scrollers when adding new items to the list.
* Changed timeout value for a faster experience in menu scrolling.
* Updated values in select button to fix rendering regressions.
* Refactored childViews creation in formView.
* Updated new selectView to correctly support width resizing.
* Better string measurements for autoResize mixin. Also included the support to
  auto fit text (reduce font size if necessary).
* FlowedLayout fixes when the view changes visibility and code clean up.
* Added back hints to labels.
* Several modular loading bug fixes, including support for css.
* Bug fix for string measurement. It was double escaping.
* Observers failing in IE as strings don't work as arrays.
* Don't schedule multiple run loops when we only need one in SC.Binding.
* Add in support for specifying an optional prefix that will be applied to all messages.
* Updated SC.State's getSubstate method to allow for path expressions.
* Updated css to match Abbot css fixes for $skip parameter in chance.
* Added css style namespace to sc-focus, this was generating problems when focusing the elements the first time in the app.

1.6.0
-----
* Minor bug fix for SC.Checkbox with no title
* Fixed test typo
* Make sure YUI reset styles are in the yuireset framework
* Add displayTitle for SC.Checkbox which allows the title to be localized.
* Fix datetime values being null when localization is being used. Causes problems when you try to format dates at execution time
*  I'm not sure the intention of having the right padding gone for text-areas, but this override of the default looks really bad in Safari & Chrome & Firefox.
* 'i' before 'e' except after 'c', plus Sublime Text 2 automatically removes extra whitespace, so lots of whitespace cleanups
* Fixes failing Text Field unit tests in IE. Listens for focusin/focusout instead of focus/blur.
* Clearer test message
* Test for clippingFrame fixes
* clippingFrame should always return a frame relative to the view itself, not its parent
* Remove unused init override from SC.Request
* Controller update to help clean up old record arrays and objects.
* Added sc_require for sizing render delegate
* Replaced a failing test with a pending one until fixed
* Fixed SC.DateFieldView tests
* Fixed tab responder tests
* Test fixes for childView insertion
* Testing CSS fixes
* Revert "Remove namescape definition from SC.browser"
* Added documentation for tagName in SC.TemplateCollectionView
* Added missing semicolon
* Fix CollectionView touchStart function not properly setting touchSelectedView
* Statechart documentation improvements
* Polymorphism requires datastore and added myself as Contributor
* If a superclass was used to load a record first (ex.  toOne: {MyApp.Person}), then if a subclass later appeared with the same ID (ex. store.find(MyApp.Male, id), it would error out because the subclass would generate a new store key and as it passed the storeKey up to its superclass, the superclass would already have a different storeKey and throw an exception.  Plus store.recordTypesByStoreKey would forever be stuck on the superclass Record Type.
* Added a DataSource reset function for fixtures - Fixes #408
* Minor docs fix
* Fix tests on nested records
* Throw arror on attribute types that can't be resolved into an object
* Fixed typo in docs (thx iammerrick)
* Fixed didAppendToLayer callbacks from appendChild - Fixes #168
* More rigorous test on didAppendToDocument
* Make sure to awake SC.TemplatePane - Fixes #387
* Deprecated SC.SelectButtonView - Fixes #393
* Better target/action handling for AlertPanes - Fixes #394
* Throw error when dataSource object can't be found in data store.
* Minor documentation improvement
* SC.RangeObserver method handles string (thx kswenson) - Fixes #482
* Fix SC.TextField to only update DOM if actually changed - Fixes #436
* Always re-render SelectField when firstTime is true - Fixes #448
* refactored record relationship support into it's own mixin, SC.RelationshipSupport
* modified relationships API to use enhance
* added the ability for 'createIfEmpty' to follow a relationship chain. objects related via 'isMaster' RecordAttribute relationships will be lazily created with pushRetrieve
* Added tests for pushDestroy not destroying a destroyed record & beginning of authoritative server push.
* Cleaned up code, added comments, minimized common code across pushRetrieve and pushDestroy.
* added support for propagating SingleAttribute and ManyAttribute relationships between store records on asynchronous updates
* Fixed SC.Record JSON encoding - Closes #473
* Fix parse error in SC.Math
* Doc improvements
* Improved docs on SC.DragDataSource
* Correct SC.DropTarget documentation
* Switch @mixin to @namespace for JSDoc to recognize
* Added support for 'readOnly' attributes in the input and textarea fields. As discussed in issue 453, if isEnabled is set to YES and isEditable is set to NO a 'readOnly' attribute will be added to the input and textarea fields. This allows input fields to remain uneditable, but allows the user to select the text.
* Documentation Improvements
* Fix a bug in string measurement.js where the measurement width would be capped to the body width even without a max-width set
* Remove namescape definition from SC.browser
* fix TABBING_ONLY_INSIDE_DOCUMENT to work when tabbing backwards
* fix for nextValidKeyView unit test failing with wrong return value when TABBING_ONLY_INSIDE_DOCUMENT is disabled
* Form render delegate should use 'className' instead of 'name'
* Fix formatting of warning for renderdelegate name property.
* rename renderDelegate's 'name' property to 'className' to be more clear about what it does.
* Separate logic for menuItemViews property so it can be overriden.
* Make destroying panel panes destroy their modal pane as well, and test this.
* Fix for focus issues with textfield and the app in general
* Removing css rule to 3d accelerate panes, this rule is to aggresive and might be consuming too much memory
* Allow exception handler to handle it so it is not thrown again
* Adding isResponse flag to SC.Response
* fixed isEnabled for new select and popup view
* prevented invalid value from being changed to null by selectedItemDidChange
* removed duplicate code and fixed prepare/teardown in situations where no elements could be measured
* U-UA header needs to be on top before any other headers to actually be respected
* Fix bug where null button would break pane
* don't set border-right on collection
* fixed docs for split_child.js
* Forgot to revert part of the action button regression
* Additional FormRowView tests.
* Do not implicitly set contentValueKey from FormView.
* Clean up FormRow, and start testing it.
* Clean up FormView some more, and test it.
* Fix FormView createChildViews logic.
* Fix FormRowView whitespace.
* Clean up forms a bit more. Styles should be in Ace.
* Clean up and fix typo in FormRowView.
* Clean up and test SC.CalculatesEmptiness.
* Add tests for FormsEditMode.
* Clean up FormsEditMode a little.
* Checking for hasContentValueSupport in conditions
* Make FlowedLayout handle empty defaultFlowSpacing gracefully (and test this)
* Clean up FormView/FormRowView a little.
* Remove the empty test files for views that are no longer used.
* Get rid of View#getThemedProperty
* Remove unused "renderer" code from SC.Theme.
* Deprecate SelectFieldView.
* Buttons removed support for legacy handlers (method-based actions and null targets), so, fixing test.
* Fix CheckboxView
* Test isSpacer in FlowedLayout.
* For testing, we need to observe everything. If this causes performance issues we should investigate other solutions.
* Add some tests for flowedLayout.
* Add unit test for view.reopen bug.
* Make SplitView 'guess' autoResizeStyle automatically based on the supplied 'size'.
* Add 'extends' to list of reserved words (Safari reserves it, apparently)
* Putting back legacy button support, we have to look into how to make action strings work faster, this seems to be way slower for mobile
* Adding a check to focus event when the mainPane is still not initialized
* fix alternating colors
* updated some styling in runtime
* Clean up SelectView handling to handle other types of items more easily.
* Try to make the popup button auto-closing of the menu less tolerant.
* Get rid of unnecessary sc_requires.
* Test SelectView more thoroughly in Test Controls.
* Adding reset styles back as it's affecting basic styling for template views
* Add string-loaded CSS.
* Fixed SC.typeOf to work correctly. Was giving incorrect results when determining if an object was an error object.
* Set identifying headers in send() not init, get rid of attachHeaders parameter from class methods. Call set() attachIdentifyingHeaders to NO either in the hash or later.
* updated statechart's gotoState method. Now provides a warning if an explicit fromCurrentState value was not supplied.
* minor fix for Array.prototype.copy. Was missing a semicolon that JSLint was complaining about.
* Updated SC.Copyable's copy method. Now provides a more informative error if copy has not been overriden.
* Updated SC.State.plugin to perform addition checks on given value. If invalid then an error is reported
* Make first responder in view hierarchy when gaining back focus only if not tabbing only inside the document
* Update SC .ico file
* Added code to imitate browser tabbing
* Disabling default focus ring
* Removing orphan code in render context update function
* Adding z-index to segmented view since we need to change the order of tab view rendering for ARIA purposes
* Change order tabs views are created, to fix accesibility tabindex order bug
* Fix for radio button keyboard support
* Always focus when it becomes key responder
* removing debugger statement
* Removing legacy action handler and improving keyboard handling for buttons
* Keyboard support for radio views
* Small code tweak
* Stop bringing always SC app into focus by default
* Call focus whenever a view gets responder that way ARIA does the right thing, and it also solves some issues with tabbing focus
* Removing unneccesary keyresponder code from slider and field views
* Added keyboard support to checkbox
* Fixed regression to be able to tab between address bar and views, also added tabindex to view that is firstResponder, this will enable ARIA to handle focus
* Fix a bug where setting the same value of the iframe would blow it away and cleaning it up a bit
* Apply nested stores patch by Brian Moore.
* Reset invalid widths and heights for views inside a FlowedLayout.
* The previous method of calculating minWidth/Height was correct when canWrap was NO, but incorrect when canWrap was YES.
* Fix docs for SelectView/PopupButtonView/etc.
* Fix some broken styles.
* Add tests for selectview's menu width.
* Improve docs and get rid of useless minimumMenuWidthDidChange (it was not even observing anything)
* Bind menu's minimumMenuWidth to the selectview.
* Add defaults and observe the minimumMenuWidth.
* Test aspects related to the selected item.
* Fix bug and make it observe the selected item so it can change value and title appropriately.
* Update some documentation.
* Add PopupButtonView tests.
* Lazy menu instantiation...
* Add tests for the mixins and extensions for SC.MenuPane/SC.MenuItemView.
* Fix menu item checkmark styling.
* Fix list item styling...
* Setting currentMenuItem doesn't work. This feature, while we should have it, wasn't in the old one, so skipping for now.
* Update for new AutoResize API.
* Add menuWidthPadding property for render delegate.
* Test long menu items.
* Update menu item for the new AutoResize API.
* Enhance the createMenuItemViews method instead of menuItemViews, which is not enhanceable.
* Separate logic for menuItemViews property so it can be overriden.
* Improve key handling so that up/down goes relative to current selected item.
* Make menu's minimum width themeable.
* Make button handle the allowDefault.
* Keyboard mostly working...
* For mouse events, SelectView is now fully operational. Keyboard... not so much.
* Make MenuItem a little more flexible.
* Make Test Controls use experimental SelectView
* Clean up select page
* Add unfinished new SelectView/PopupButton.
* Add in new support for specifying and accessing localized metrics in the same manner as you can currently specify and access localized strings.  For strings, you do:
* 1. Introduces changes to maintain a separate hash of layout values, for the current locale 2. Added a separate method to do localization of layout hash

1.6.0.rc.2
----------
* Fixed SC.PickerPane#modalPaneDidClick return values - Fixes #339
* Fixed SC.Enumerable fallback for SC.RecordArray#find - Fixes #363
* Added SC.requiredObjectForPropertyPath that throws an error when object can't be found
* Make it possible for the handlebars helpers to generate tags other than <span>
* Improved Observer Tests with better location (thx martoche)
* Fixed disclosure positioning in Ace, fixes #457
* Added backslash to prevent SASS comment interpolation warning
* Allow for passing relative paths to #collection helper.
* Further cleanup to TextField template multiline
* Added isMultiline property to SC.TextField.
* jQuery is now smart enough to take booleans for certain attributes
* Stop using jQuery expando
* Added unit tests for SC.ContainerView to verify it cleans up views that it instantiates.
* SC.ContainerView will instantiate it's contentView if nowShowing is set with a string or class, however it was not cleaning up views when it was finished. Now it keeps track and cleans up when necessary.
* Unit test for previous commit checking that the themeName got passed through to the buttons.
* Allow you to set themeName on the AlertPane to also set the themeName on the buttons (which were previously stuck as 'capsule')
* Unit test for previous commit adding controlSize to TabView + removed useless TabView methods test and left a warning unit test instead.
* Whitespace + allow setting of controlSize
* Comment typo forEachIndex is not a function in IndexSet
* fix jQuery/SC conflict for events handeling add tryToPerform on SC.TextField
* use prop instead of attr in SC.Checkbox replace SC.data with jQuery.data
* remove more code : passing unit tests but fail in real app
* upgrade to jquery 1.6 use jQuery.sub()
* Minor adjustments for docs
* fixed so that replace on ChildArray only notifies the part of the array that has actually changed
* remove more code : passing unit tests but fail in real app
* upgrade to jquery 1.6 use jQuery.sub()
* Hacky solution to the issue where template collection views render their item views multiple times when they are nested inside another template collection view.
* Adds support for specifying an inverse template name to template collection view.
* Adds unit tests for using an inverse template in template collection views.
* Fixes issue with nested template collection views causing childViews array to get messed up.
* Adds failing unit test for childView structure of nested collection views.
* Adds unit tests for checking the number of items rendered in nested collection views with default content.

1.6.0.rc.1
----------
* Added 'Show Progress' checkbox to Test Runner
* fixed the double call issue and changed the tests to reflect what really should go on.
* Adds failing unit test that demonstrates child arrays not playing nicely with array observers.
* TemplateCollectionView should not try to use a content object if it is not defined yet. Also pulls in Sven's fix to ensure that collections with custom tag names get the proper child tags.
* Invoke Handlebars observers at the end of the run loop. This ensures that DOM updates happen as close together as possible.
* Have Handlebars set up one-way bindings. This avoid potential cyclic bindings and is faster.
* Fix for when a TemplateCollectionView's content changes multiple times before its layer is created.
* Move around the stylesheets into its own framework.
* Move resets to their own framework.
* Adding in new CSS resets.
* Use new spy framework in button test
* Add ability to stub a method
* add spies to test framework
* On touch platforms, 'mousedown' & 'mouseup' were allowing default, but not tracking it for the later click event.  This resulted in 'click' calling preventDefault & stopPropagation
* Attach prefix for core_tools' urls to allow to run apps on path other than /
* Move sc-hidden class to be outside of sc-view.
* Update deprecated SC.Button mixin to throw an error and changed the message.
* Fixed SC.Button template view class / mixin conflict.
* Don't call arrayContentDidChange() if storeKeys already exist; this will be handled by the next call to flush().
* SC.ArrayController should setup and teardown property chains when its underlying content object changes.
* Property chains should use objectAt in case they are used with array-likes instead of native arrays. Includes unit test of @each with SC.SparseArray.
* Clarify error thrown when editing a record array without an underlying store keys array.
* Remove sc-docs app and code as its been moved to the sproutcore/sc-docs repo
* Fixes #400. SC.CheckboxView now triggers an action on mouseUp/touchEnd + unit tests updates
* Fixed bug with ImageView.  Fixes SC #380.
* Fixes #410. Scrolling in Opera is fixed.
* Fixes #414. Allows SC.routes to handle passing only a function.
* datastore/record_attribute: added tests for SC.DateTime to transform
* datastore/record_attribute: added Date as a possible transform type for SC.DateTime
* Fixes #434. Update checkbox & menu item PSDs to remove reduced saturation.
* Moved touch event handling into the returned pane
* Clean up some DataSource code and fix a failing test
* datastore/data_source: fixed SC.DataSource returning incorrect values on commitRecords
* Added MIXED_STATE to datastore
* datastore/data_source: added more tests; fixed additional bug with return status of commitRecords
* datastore/data_source: added tests for SC.DataSource
* replace() and isEditable computed property had different behavior for editing when a RecordArray was not backed by an SC.Query. This commit updates isEditable to reflect the behavior of replace().
* Have SC.RecordArray use the isEditable computed property instead of checking the query manually. This allows subclassers to implement consistent isEditable logic.
* Improve documentation for SC.RecordArray#replace
* Adds documentation for _scra_records property in record array.
* Remove trailing spaces from record array.
* Setting simulateTouchEvents before currentWindowSize has been set, will fail because simulateTouchEvents attempts to determine orientation using currentWindowSize.
* Potential update to button view
* SC.metricsForString() now also uses the 'letterSpacing' css property when calculating the size of a string
* remove weird encoding test which breaks abbot
* Small tweak
* improve markdown parsing and @link tags in the docs
* Updated documentation for sc-docs command
* Updated documentation for sc-docs command
* Add dependencies
* updated statechart docs
* fixed docs for render_delegate.js
* fixed handling of mouseDown and mouseUp when isSelectable is NO
* fixed autoResize to copy classNames properly to the metrics element
* fix RenderContext.element() to use SC.$ instead of a custom factory
* Add flag to know when unit tests have finished running.
* fixed measureString and metricsForString to actually respect when ignoreEscape is YES
* fixed container to create child using createChildView
* Removing strings.js file. No loc files should be in the framework unless is a very special case
* Rename all english.lproj directories inside sproutcore to resources
* SC.Logger.stringifyRecordedMessages broken
* Made the list view styling use chance
* Make sure not to call notifiers twice if the server's response status was 0
* Fixed all unit tests that were failing in IE. All the failing tests had to do with exiting and entering concurrent states. Issue was addressed using the updated SC.StatechartSequenceMatcher
* Refactored and updated SC.StatechartSequenceMatcher's functionality. It's now more flexible in how you construct sequences and how those sequences are matched
* Refactored some logic in the SC.StatechartMonitor class
* Refactored statechart code so that classes and class extensions are placed into their own respective files
* Updated SproutCore's Buildfile so that the statechart framework is part of the sproutcore wrapper framework
* Segment view changes for handling layerId
* Refactoring code in layerid code for menu
* support for layerId in Menu pane and Segment view.
* Added the sc-docs directory to the apps folder which includes the sc-docs command, the jsdoc-toolkit, and the new doc viewer app
* expanded view-related documentaiton
* Fixed view-related documentation
* Fix for loc(). Adding back to String.prototype, Talk to me if you have any problems with this commit
* Update for incorrect label view documentation
* fixed a bug with the SC.State.plugin logic. Now checks the klass variable if null
* updated SC.StatechartManager's tracing output
* removed code from statechart framework. Code was acting as a temporary stop-gap that is no longer needed. Was also causing unit tests to fail.
* Respect the new touch_enabled flag (defaults to true)
* fix to measure views when the become visible
* fixed bug which caused all non-webkit browsers to be treated like old safari versions
* fixed rows not having a default height - this fixes the test controls infinite loop
* Calculate minWidth/Height correctly.
* Perf tweaks for unit tests runner
* Make the unit test run faster by dumping results only until the end
* Temporary fix to select button
* Fixing the broken loc() function.
* Refactoring css core code. This change packs all .sc-view css rules into one. Also sets the default font on the body of the page instead of reapplying the rule in every view, this change might break some styling for some apps. Contact me if you have any doubts
* Disabling image preloading by default
* Fix the html examples of the routes file
* Fix documentation for SC.routes
* Refactor base css styles to use SCSS
* Update to trimming functions
* Minor unit test bug fixes for IE
* Fixing SC.offset support for IE
* Adding trim functions only for IE
* Fixing trailing commas, and minor bugs related to IE. Also moved trim functions for strings back into core_foundation as IE doesn't support them, finally changes the icons library to use chance for slicing
* Fix up SC.PopupButtonView a bit
* Revert "Revert "fixed gotoState to pick a better default fromCurrentState when a statechart has concurrent states""
* fixed to respect escapeHTML property
* Move BindableSpan to core_foundation/views as system shouldn't depend on TemplateView
* Clean up global leaks
* improved documentation for previousValidKeyView and nextValidKeyView
* added tests for previousValidKeyView
* added test for parentView.lastKeyView priority over nextKeyView
* fixed next and previous to respect last and first, cleaned up while loops end condition
* Made changes to _supportsPlaceHolder function to make it work with Firefox4
* changed conditions for newRowPending code to handle the first child having startsNewRow correctly
* fixed bug in dealing with batchResizeId changing and stopped views that aren't visible from being measured
* fixed event passing for blur event
* fixed window leak
* removed debug code
* added tab functionality for selectButton since it has acceptsFirstResponder: YES
* fixed previousValidKeyView and cleaned up nextValidKeyView
* added some more warnings about correct usage to docs
* added tests for nextValidKeyView
* made pane.makeFirstResponder actually call responderContext.makeFirstResponder; this fixes hasFirstResponder not being set properly
* added more doc
* fixed bug in lastKeyView calculation, renamed private methods, and added documentation
* fixed default tab behavior in certain corner cases and added optional properties to make tab order easier for views that tab in a different order from their childViews order
* fixed firstResponder being set to null when a view resigns first responder
* Added support for attachIdentifyingHeaders to SC.Request so we can opt out of having custom headers set on each SC.Request
* updated styling for list views
* Get rid of 'uninitialized property' warning since it didn't really make
* If no listener handled a response, don't try twice if the base status is the same as the status.
* Fixed a bug with the support for notifying multiple listeners on a single status.
* Added unit test for multiple notifiers on a single status support in SC.Request
* Added support in SC.Request and SC.Response for multiple listeners per status


1.6.0.beta.3
------------
* Removed stray debugger statement that broke sc-build


1.6.0.beta.2
------------
* Allow native touch scrolling inside an SC.TemplatePane.
* Add SC.Button template control.
* Created SC.TextField and SC.Checkbox views to eventually replace the *Support mixins.


1.6.0.beta.1
------------
* Bugfixes to synchronization between SproutCore RecordArray/ManyArray/ChildArray and TemplateCollectionView
* Moved forms to experimental framework
* Moved routing into its own framework
* Improved ability to use table elements in Handlebars templates
* CSS and cross-browser fixes for built-in controls
* Significantly cleaned up in-line documentation


CHANGE LOG FOR 1.5
==================

Upcoming
-----

* Added ability to opt out of custom headers when making AJAX requests
* Allow multiple listeners per single response status
* Fixes for making panes properly handle first responder
* General CSS Cleanup throughout
* Add support for trim and loc back to string.js
* Bug fixes for IE7/8/9 support
* Fixed unit tests for IE
* Added unit tests for keyboard focus functionality
* Fix keyboard focus issues in the view layer
* Updated the styling of list views
* Fixed bugs with flowed_layout and auto_resize
* Small documentation fixes throughout
* Bug fixes for statecharts for IE support
* Improving the performance of the unit test runner
* Updated index.html for the latest versions of IE


1.5.0
-----

* Fix problem in SC.TextFieldSupport where binding to its value when its layer hasn't been created could potentially start an infinite loop
* Fix range observer support in SC.TreeItemObserver.
* Fixed issue with isVisibleInWindow not getting passed to childViews
* Fix problem with SC.TextFieldView not properly setting input type to password when SC.platform.input.placeholder is true.
* Change SC.View default border color to transparent
* SC.Event.KEY_ENTER updated to SC.Event.KEY_RETURN.  SC.Event.KEY_ENTER is no longer defined.
* Fix bug in SC.ContainerView where it was checking for SC.View instead of SC.CoreView, and add unit test for using SC.TemplateView in SC.ContainerView
* Move some necessary updateLayerLocation code from SC.View to SC.CoreView
* Fix SC.Event mouse handling for Safari 5.0.5, and trust that Apple will continue using extremely huge mouse wheel values
* Fix problem with localizing strings via SC.String.loc, and add unit tests for localizing with multiple parameters.
* Change Foundation String mixin to work standalone with SC.String and mix in mapping to String.prototype. Framework code updated to use SC.String instead of relying on prototype.
* Fixed issue in SC.FormRowView that could cause an infinite loop
* Fixes a bug where bindings would not work when specified in a class definition as an SC.Binding object (as opposed to a property path).
* Fix SC.SAFARI_FOCUS_BEHAVIOR check.
* Don't show experimental apps in welcome list
* Removed mobile references from Buildfile
* Moved Greenhouse and Designer Framework to Experimental
* Remove Docs app since it is worthless
* Remove time.js, update Date validator and tests so that it works with SC.DateTime, and provide warning for backwards compatibility.
* Updates template collection unit test to fail when we were removing child views twice. Also fixes a bug where SC.TemplateCollectionView would not add array observers if the content property was present at initialization time.
* fix firefox 4 transitionEnd case - should be transitionend
* Added back commented out LabelView CSS tests so we know to make them work later
* Remove unused SC.StaticQueue
* Remove CSS tests for LabelView while I figure out how to get document.defaultView.getComputedStyle to return the correct results for framework-level tests.
* Make sure content is defined before trying to access its layer in SC.ScrollView
* Use local image for testing the image view scaling to avoid epic fails
* No longer need to teardown child views when content changes on an SC.TemplateCollectionView.
* Preserve options hash passed to {{#collection}} helper.
* In SC.ScrollView, apply 3D translations even if view does not implement _viewFrameDidChange.
* Split up SC.String and extending String.prototype, change more framework code over to using SC.String.
* Use SC.supplement when mixing into Array.prototype. Create SC.CoreArray which doesn't have SC.Enumerable mixing in to avoid hackiness of old Array handling.
* Added tests for querying nested records by property path
* Added support for quering within SC.Objects or hashes. E.g. "foo.baz = 'bar'". Inspired by an old mailing list post by Thomas Lang.
* Experimental polymorphism: Add ability to pass isPolymorphic in SC.Record.extend hash instead of needing it set it afterwards, with unit test.
* move SC.Request/Response to new framework
* Improved isFixedLayout property plus unit tests.
* jslint cleanup, plus original computeFrameWithParentFrame doesn't use pdim, so don't pass it.
* Fix for potential bug determining frame for non-fixed layout view within static layout parent View.
* Add failing test to illustrate potential bug if a non-fixed layout view is embedded within a static layout view.  Found the bug by accident, but the fix is straightforward so added it (in next commit)
* Require Function.prototype extension in runtime files
* Use Array.isArray in SC.isArray if its available. This is 50% faster when checking arrays and 10% slower when checking objects that aren't arrays, but we're checking arrays 10 times more often than non arrays in SC.isArray, so this is a net win. Unit tests for SC.isArray added.
* Unit test handling of hints on password fields when placeholder is not supported
* Fix hint handling for SC.TextFieldView when isPassword is true
* Fix check for continuouslyUpdatesValue
* Use feature detection instead of browser detection when handling SC.TextFiledView#maxLength
* Deprecate SC.TextFieldView#continuouslyUpdatesValue as its completely broken, use applyImmediately instead.
* Remove SC.TextFieldView#_supportsPlaceHolder and use SC.platform.input.placeholder
* Move SC string localization support to Core Foundation (where it belongs) and small code shuffle in CF
* Reorganize String, Function and Date enhancements in Runtime framework
* Make our String extension handling more sane. SC.CoreString is now SC.String, and Core Foundation additions are now mixed into SC.String. Handlebars loc helper now uses SC.String.loc.
* Add empty SC.ChildRecord object with warning of deprecated to improve 1.4.x backwards compatibility
* Initial work at making framework code prototype-safe. We shouldn't be using helpers attached to native object prototypes in framework code as they can fail on some platforms
* Change instance so "".dasherize to SC.String.dasherize to safeguard against platforms that mix dasherize into String.prototype (I'm looking at you, WebOS)
* Change SC.String functions so they can run standalone as well as when mixed into String.prototype
* More work on documenting Foundation framework
* Add unit tests for Store.loadRecords.
* Ensure that SelectView works with custom views.
* SC.SAFARI_FOCUS_BEHAVIOR is deprecated in favour of SC.FOCUS_ALL_CONTROLS, update docs and unit tests.
* SC.RootResponder now properly checks that responder is defined in makeTouchResponder by accessing properties.
* ContainerView now properly replaces its children. Still need to write a unit test.
* CollectionView should enable or disable the ability to select when isEnabled is true or false.
* Fixed SC.Menu icons in Ace
* Update ImageView so that CSS classes for values are rendered and updated correctly. Unit tests provided.
* CollectionView now calls actions when useToggleSelection and actOnSelect are true
* CollectionView was wiping selections when it was touched but an item wasn't being selected. Behaviour now same as mouse.
* Added toolTip support for imageButtonRenderDelegate
* SC.TabView with tabLocation bottom is positioned correctly.
* Re-render child views if the layer is destroyed then re-created.
* Fix global variable leakage in SC.View layout style code
* Fix problem in CollectionView where using a ListItemView on touch would cause epic fails in the touchEnd event.
* Some styling fixes for Checkbox and Radio icons
* Fixed SC.Query to handle negative numbers
* Now that {{#each}} uses bindings, we have to invoke a run loop in the unit test for it to pass.
* Don't automatically render child views if the view's render method renders them explicitly.
* Added icon examples to TestControls
* Proper location for form render_delegates


1.5.0.rc.2
----------

* Clone itemOptions so that we don't nuke classBindings after the first round trip
* Update SC.ChildArray to use array observers.
* Remove unnecessary invalidation when storeKeys changes in SC.ManyArray.
* When a property observed by a binding is changed outside a run loop, schedule a run loop automatically.
* Remove trailing white space in child array.
* Fixes bug where property chains were being activated even when the associated property had not changed.
* Add support for setting itemViewTemplateName in SC.TemplateCollectionView, plus documentation.
* {{#each}} helper should bind relative to the current context.
* Fix array arithmetic used by SC.TemplateCollectionView when calculating changes.
* Update SC.ManyArray and SC.RecordArray to use array observers.
* Make the test for a simple implementation of SC.Array reflect the API changes.
* Revert changes to SC.Enumerable, move new functionality into SC.Array. Update to use array observer API.
* Update SC.TemplateCollectionView to use new array observer functionality.
* Make sparse arrays support the new Array observer API
* Remove enumerable observers
* Update array controller unit test to use public API when resetting an array.
* Update SC.ArrayController to use array observers.
* Implement array observers. Remove enumerable observers.
* Make our mouse wheel delta detection intelligent about when it sucks. If our browser detection fails and the delta exceeds a specified limit, we readjust so future scrolls aren't Crazy Fast™.
* Initial work on fixing documentation in Foundation framework
* Document SC.browser
* Docs: Markdown-ified Datetime docs
* Docs: Markdown-ified Datastore docs
* Docs: Markdown-ified CoreFoundation docs
* Docs: Markdown-ified Animation docs
* Support the class attribute in {{bindAttr}}.
* SC.TextFieldSupport should notify value change when its loses first responder to support autofill
* Move SproutCore's Handlebars extensions into core_foundation,
* Update testing framework to use new version of qunit, change testing framework to depend on jQuery instead of having its own version
* Remove warning for when a binding connects to an undefined property. This bug has been fixed.
* Ensure that TemplateViews created with an ID by the Handlebars view helper are added to view cache, unit test included
* Add 'datetime/localized' to the Buildfile configs so it doesn't bust for Some Folks. Apologies to Some Folks.
* bindAttr should look up properties relative to its current context, not the view.
* Completed initial audit of Desktop framework documentation
* First stab at fixing the inline documentation in the Desktop framework.
* Separate core DateTime code from localization-specific code as core DateTime code depends only on Runtime
* Unit test and fixes for chained property observers that would cause them to fail if all objects in the chain did not exist at the time the property chain is setup.
* Use touch events for TextField. Required for certain Android platforms
* Fix more unit tests in core_foundation that were trying to delete window properties.
* Internet Explorer does not support deleting properties from the window object.
* Remove trailing commas for IE7 compatibility


1.5.0.rc.1
-----------
* Removed #bindCollection helper. Instead, use {{#collection
  PathTo.Collection contentBinding="MyApp.controller.content"}}
* {{view}} helper looks up views relative to the view, and then the
  global scope
* Built-in helpers and mustaches now automatically update. It is no
  longer necessary to use {{bind}} or {{boundIf}}
* Adds enumerable observers, which allow you to subscribe to mutations
  of an enumerable
* Fixed error reporting when a Handlebars template is unable to find a
  property
* Dependent keys that contain paths now invalidate immediately instead
  of at the end of the run loop, which significantly improves
  performances, especially when combined with @each
* SC.offset offers more reliability than the deprecated SC.viewOffset
* Added SC.getPath(), which is like SC.get() but takes a path instead of
  just a property
* Improved compatibility of using SC.CoreViews (such as SC.TemplateView)
  inside standard SC.Views
* Tear down SC.TemplateCollectionView child views when no longer needed,
  which fixes a memory leak issue
* Integrated new functionality from the Ki framework into the SC.StateChart framework so that they now have feature-parity
* The SC.PickerPane was updated to add removeTarget and removeTarget properties
* Fixed documentation in datastore and view layer
* Refactored and fixed bugs in the way SproutCore handles AutoResizing.
* Updated the test_controls application to reflect AutoResize changes
* Fixed bugs with the selection behavior in lists
* Fixed bugs with the logic that determines when sproutcore applications are ready to begin execution
* Improved performance of layout updates
* Fixed bugs in keyboard behavior of menus
* Made more views utilize render delegates
* Updated unit tests for menus to reflect new keyboard behavior
* Add proper autoresize behavior to buttons
* Fixed frame calculation bugs in lists
* Removed redundant bounds checking in scroll
* Fixed bugs with the localization of titles in segmented views
* Fixes for formView
* Added ability to scale apps so that we can visualize them on the iPhone
* If using StaticLayout in the image, don't use Canvas
* Fixed firstResponder support in text_field
* Fixed responder behavior in editable
* Refactoring for flowed_layout
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

DISCLAIMER: This is a very rough and not comprehensive overview of the 1000+
commits that formed SproutCore 1.4.

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

