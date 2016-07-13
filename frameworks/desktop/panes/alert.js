// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('panes/panel');
sc_require('views/button');

/**
  Passed to delegate when alert pane is dismissed by pressing button 1

  @static
  @type String
  @default 'button1'
*/
SC.BUTTON1_STATUS = 'button1';

/**
  Passed to delegate when alert pane is dismissed by pressing button 2

  @static
  @type String
  @default 'button2'
*/
SC.BUTTON2_STATUS = 'button2';

/**
  Passed to delegate when alert pane is dismissed by pressing button 3

  @static
  @type String
  @default 'button3'
*/
SC.BUTTON3_STATUS = 'button3';

/** @class
  Displays a preformatted modal alert pane.

  Alert panes are a simple way to provide modal messaging that otherwise
  blocks the user's interaction with your application.  Alert panes are
  useful for showing important error messages and confirmation dialogs. They
  provide a substantially better user experience than using the OS-level alert
  dialogs.

  ## Displaying an Alert Pane

  The easiest way to display an alert pane is to use one of the various
  class methods defined on `SC.AlertPane`, passing the message and an optional
  detailed description and caption.

  There are four variations of this method can you can invoke:

   - `warn({})` -- displays an alert pane with a warning icon to the left.
   - `error()` -- displays an alert with an error icon.
   - `info()` -- displays an alert with an info icon.
   - `plain()` -- displays an alert with no icon.
   - `show()` -- displays an alert with the icon class you specify.

  Each method takes a single argument: a hash of options. These options include:

  - `message` -- The alert's title message.
  - `description` -- A longer description of the alert, displayed below the title
    in a smaller font.
  - `caption` -- A third layer of alert text, displayed below the description in
    an even-smaller font.
  - `icon` -- This is set for you automatically unless you call `show`. You may
    specify any icon class you wish. The icon is displayed at the alert pane's
    left.
  - `themeName` -- A button theme that is applied to each button. The default is
    `capsule`.
  - `delegate` -- A delegate to be notified when the user reacts to your pane. See
    "Responding to User Actions" below.
  - `buttons` -- An array of up to three hashes used to customize the alert's buttons.
    See "Customizing Buttons" below.

  ## Responding to User Actions

  Often, you may wish to be notified when the user has dismissed to your alert. You
  have two options: you may specify a delegate in the options hash, or you may
  customize each button with a target & action.

  If you specify a delegate, it must implement a method with the following signature:
  `alertPaneDidDismiss(pane, buttonKey)`. When the user dismisses your alert, this
  method will be called with the pane instance and a key indicating which button was
  pressed (one of either `SC.BUTTON1_STATUS`, `SC.BUTTON2_STATUS` or `SC.BUTTON3_STATUS`).

  If you specify a target/action for a button (see "Customizing Buttons" below) and the
  user dismisses the alert with that button, that action will be triggered. If you specify
  a delegate but no target, the delegate will be used as the target. The action will
  be called with the alert pane itself as the sender (first argument).

  ## Customizing Buttons

  SC.AlertPane allows you to specify up to three buttons, arranged from right to left (as
  on Mac OS X). You can customize them by passing an array of up to three options hashes
  on the `buttons` property. By default, the first, rightmost button is the default (i.e.
  it is triggered when the user hits the enter key), and the second button is the "cancel"
  button (triggered by the escape key).

  If you don't specify any buttons, a single default "OK" button will appear.

  You may customize the following button options:

  - `title` -- The button text. Highly recommended unless you like empty buttons.
  - `localize` -- Whether to localize the title.
  - `toolTip` -- An extra hint to show when the user hovers the mouse over the button.
    Make sure that the user can get along fine without this, as tooltips are hard to
    discover and unavailable on touch devices!
  - `isDefault` -- You may specify a different button than the first, rightmost button
    to be the default (triggered by the enter key, and visually distinct in the default
    Ace theme).
  - `isCancel` -- You may specify a different button than the second, middle button
    to be the cancel button (triggered by the escape key).
  - `target` & `action` -- Supports the target/action pattern (see "Responding to User
    Actions" above).

  (You may also specify a layerId for the button if needed. As always, using custom
  layerIds is dangerous and should be avoided unless you know what you're doing.)

  ## Examples

  Show a simple AlertPane with a warning (!) icon and an OK button:

      SC.AlertPane.warn({
        message: "Could not load calendar",
        description: "Your internet connection may be unavailable or our servers may be down.",
        caption: "Try again in a few minutes."
      });

  Show an AlertPane with a customized OK button title (title will be 'Try Again'):

      SC.AlertPane.warn({
        message: "Could not load calendar",
        description: "Your internet connection may be unavailable or our servers may be down.",
        caption: "Try again in a few minutes.",
        buttons: [
          { title: "Try Again" }
        ]
      });

  Show an AlertPane with fully customized buttons:

      SC.AlertPane.show({
        message: "Could not load calendar",
        description: "Your internet connection may be unavailable or our servers may be down.",
        caption: "Try again in a few minutes.",
        buttons: [
          { title: "Try Again", toolTip: "Retry the connection", isDefault: true },
          { title: "More Info...", toolTip: "Get more info" },
          { title: "Cancel", toolTip: "Cancel the action", isCancel: true }
        ]
      });

  Show an alert pane, using the delegate pattern to respond to how the user dismisses it.

      MyApp.calendarController = SC.Object.create({
        alertPaneDidDismiss: function(pane, status) {
          switch(status) {
            case SC.BUTTON1_STATUS:
              this.tryAgain();
              break;
            case SC.BUTTON2_STATUS:
              // do nothing
              break;
            case SC.BUTTON3_STATUS:
              this.showMoreInfo();
              break;
          }
        },
        ...
      });

      SC.AlertPane.warn({
        message: "Could not load calendar",
        description: "Your internet connection may be unavailable or our servers may be down.",
        caption: "Try again in a few minutes.",
        delegate: MyApp.calendarController,
        buttons: [
          { title: "Try Again" },
          { title: "Cancel" },
          { title: "More Info…" }
        ]
      });

  Show an alert pane using the target/action pattern on each button to respond to how the user
  dismisses it.

      SC.AlertPane.warn({
        message: "Could not load calendar",
        description: "Your internet connection may be unavailable or our servers may be down.",
        caption: "Try again in a few minutes.",
        buttons: [
          {
            title: "Try Again",
            action: "doTryAgain",
            target: MyApp.calendarController
          },
          {
            title: "Cancel",
            action: "doCancel",
            target: MyApp.calendarController
          },
          {
            title: "More Info…",
            action: "doGiveMoreInfo",
            target: MyApp.calendarController
          }
        ]
      });

  @extends SC.PanelPane
  @since SproutCore 1.0
*/
SC.AlertPane = SC.PanelPane.extend(
/** @scope SC.AlertPane.prototype */{

  /**
    @type Array
    @default ['sc-alert']
    @see SC.View#classNames
  */
  classNames: ['sc-alert'],

  /**
    The WAI-ARIA role for alert pane.

    @type String
    @default 'alertdialog'
    @constant
  */
  ariaRole: 'alertdialog',

  /**
    If defined, the delegate is notified when the pane is dismissed. If you have
    set specific button actions, they will be called on the delegate object

    The method to be called on your delegate will be:

        alertPaneDidDismiss: function(pane, status) {}

    The status will be one of `SC.BUTTON1_STATUS`, `SC.BUTTON2_STATUS` or `SC.BUTTON3_STATUS`
    depending on which button was clicked.

    @type Object
    @default null
  */
  delegate: null,

  /**
    The icon URL or class name. If you do not set this, an alert icon will
    be shown instead.

    @type String
    @default 'sc-icon-alert-48'
  */
  icon: 'sc-icon-alert-48',

  /**
    The primary message to display. This message will appear in large bold
    type at the top of the alert.

    @type String
    @default ""
  */
  message: "",

  /**
    The ARIA label for the alert is the message, by default.

    @field {String}
  */
  ariaLabel: function() {
    return this.get('message');
  }.property('message').cacheable(),

  /**
    An optional detailed description. Use this string to provide further
    explanation of the condition and, optionally, ways the user can resolve
    the problem.

    @type String
    @default ""
  */
  description: "",

  /**
    An escaped and formatted version of the description property.

    @field
    @type String
    @observes description
  */
  displayDescription: function() {
    var desc = this.get('description');
    if (!desc || desc.length === 0) return desc ;

    desc = SC.RenderContext.escapeHTML(desc); // remove HTML
    return '<p class="description">' + desc.split('\n').join('</p><p class="description">') + '</p>';
  }.property('description').cacheable(),

  /**
    An optional detailed caption. Use this string to provide further
    fine print explanation of the condition and, optionally, ways the user can resolve
    the problem.

    @type String
    @default ""
  */
  caption: "",

  /**
    An escaped and formatted version of the caption property.

    @field
    @type String
    @observes caption
  */
  displayCaption: function() {
    var caption = this.get('caption');
    if (!caption || caption.length === 0) return caption ;

    caption = SC.RenderContext.escapeHTML(caption); // remove HTML
    return '<p class="caption">' + caption.split('\n').join('</p><p class="caption">') + '</p>';
  }.property('caption').cacheable(),

  /**
    The button view for button 1 (OK).

    @type SC.ButtonView
  */
  button1: SC.outlet('contentView.childViews.1.childViews.1'),

  /**
    The button view for the button 2 (Cancel).

    @type SC.ButtonView
  */
  button2: SC.outlet('contentView.childViews.1.childViews.0'),

  /**
    The button view for the button 3 (Extra).

    @type SC.ButtonView
  */
  button3: SC.outlet('contentView.childViews.2.childViews.0'),

  /**
    The view for the button 3 (Extra) wrapper.

    @type SC.View
  */
  buttonThreeWrapper: SC.outlet('contentView.childViews.2'),

  /**
    @type Hash
    @default { top : 0.3, centerX: 0, width: 500 }
    @see SC.View#layout
  */
  layout: { top : 0.3, centerX: 0, width: 500 },

  /** @private - internal view that is actually displayed */
  contentView: SC.View.extend({

    useStaticLayout: YES,

    layout: { left: 0, right: 0, top: 0, height: "auto" },

    childViews: [
      SC.View.extend({
        classNames: ['info'],
        useStaticLayout: YES,

        /** @private */
        render: function(context, firstTime) {
          var pane = this.get('pane');
          if(pane.get('icon') == 'blank') context.addClass('plain');
          context.push('<img src="'+SC.BLANK_IMAGE_URL+'" class="icon '+pane.get('icon')+'" />');
          context.begin('h1').addClass('header').text(pane.get('message') || '').end();
          context.push(pane.get('displayDescription') || '');
          context.push(pane.get('displayCaption') || '');
          context.push('<div class="separator"></div>');

        }
      }),

      SC.View.extend({
        layout: { bottom: 13, height: 24, right: 18, width: 466 },
        childViews: ['cancelButton', 'okButton'],
        classNames: ['text-align-right'],

        cancelButton: SC.ButtonView.extend({
          useStaticLayout: YES,
          actionKey: SC.BUTTON2_STATUS,
          localize: YES,
          layout: { right: 5, height: 'auto', width: 'auto', bottom: 0 },
          isCancel: YES,
          action: "dismiss",
          isVisible: NO
        }),

        okButton: SC.ButtonView.extend({
          useStaticLayout: YES,
          actionKey: SC.BUTTON1_STATUS,
          localize: YES,
          layout: { left: 0, height: 'auto', width: 'auto', bottom: 0 },
          isDefault: YES,
          action: "dismiss",
          isVisible: NO
        })
      }),

      SC.View.extend({
        layout: { bottom: 13, height: 24, left: 18, width: 150 },
        childViews: [
          SC.ButtonView.extend({
            useStaticLayout: YES,
            actionKey: SC.BUTTON3_STATUS,
            localize: YES,
            layout: { left: 0, height: 'auto', width: 'auto', bottom: 0 },
            action: "dismiss",
            isVisible: NO
          })]
      })]
  }),

  /**
    Action triggered whenever any button is pressed. Also the hides the
    alertpane itself.

    This will trigger the following chain of events:

     1. If a delegate was given, and it has alertPaneDidDismiss it will be called
     2. Otherwise it will look for the action of the button and call:
      a) The action function reference if one was given
      b) The action method on the target if one was given
      c) If both a and b are missing, call the action on the rootResponder

    @param {SC.View} sender - the button view that was clicked
  */
  dismiss: function(sender) {
    var del = this.delegate,
        rootResponder, action, target;

    if (del && del.alertPaneDidDismiss) {
      del.alertPaneDidDismiss(this, sender.get('actionKey'));
    }

    if (action = (sender && sender.get('customAction'))) {
      if (SC.typeOf(action) === SC.T_FUNCTION) {
        action.call(action);
      } else {
        rootResponder = this.getPath('pane.rootResponder');
        if(rootResponder) {
          target = sender.get('customTarget');
          rootResponder.sendAction(action, target || del, this, this, null, this);
        }
      }
    }

    this.remove(); // hide alert
  },

  /** @private
    Executes whenever one of the icon, message, description or caption is changed.
    This simply causes the UI to refresh.
  */
  alertInfoDidChange: function() {
    var v = this.getPath('contentView.childViews.0');
    if (v) v.displayDidChange(); // re-render message
  }.observes('icon', 'message', 'displayDescription', 'displayCaption')

});

SC.AlertPane.mixin(
/** @scope SC.AlertPane */{

  /**
    Show a dialog with a given set of hash attributes:

        SC.AlertPane.show({
          message: "Could not load calendar",
          description: "Your internet connection may be unavailable or our servers may be down.",
          caption: "Try again in a few minutes.",
          delegate: MyApp.calendarController
        });

    See more examples for how to configure buttons and individual actions in the
    documentation for the `SC.AlertPane` class.

    @param {Hash} args
    @return {SC.AlertPane} the pane shown
  */
  show: function (args) {
    // normalize the arguments if this is a deprecated call
    args = SC.AlertPane._argumentsCall.apply(this, arguments);

    var pane = this.create(args),
        idx,
        buttons = args.buttons,
        button, buttonView, layerId, title, toolTip, action, target, themeName,
        isDefault, isCancel, hasDefault, hasCancel;

    if (buttons) {
      //@if(debug)
      // Provide some developer support for more than three button hashes.
      if (buttons.length > 3) {
        SC.warn("Tried to show SC.AlertPane with %@ buttons. SC.AlertPane only supports up to three buttons.".fmt(buttons.length));
      }
      //@endif

      // Determine if any button hash specifies isDefault/isCancel. If so, we need
      // to override the button views' default settings.
      hasDefault = !!buttons.findProperty('isDefault');
      hasCancel = !!buttons.findProperty('isCancel');

      for (idx = 0; idx < 3; idx++) {
        button = buttons[idx];
        if (!button) continue;

        buttonView = pane.get('button%@'.fmt(idx + 1));

        layerId = button.layerId;
        title = button.title;
        localize = button.localize;
        toolTip = button.toolTip;
        action = button.action;
        target = button.target;
        themeName = args.themeName || 'capsule';

        // If any button has the isDefault/isCancel flags set, we
        // explicitly cast the button's flag to bool, ensuring that this
        // overrides the default. Otherwise, we use undefined so we skip
        // setting the property, ensuring the default value is used.
        isDefault = hasDefault ? !!button.isDefault : undefined;
        isCancel = hasCancel ? !!button.isCancel : undefined;

        buttonView.set('title', title);
        if (localize === YES) buttonView.set('localize', YES);
        if (toolTip) buttonView.set('toolTip', toolTip);
        if (action) buttonView.set('customAction', action);
        if (target) buttonView.set('customTarget', target);
        if (layerId !== undefined) { buttonView.set('layerId', layerId); }
        if (isDefault !== undefined) { buttonView.set('isDefault', isDefault); }
        if (isCancel !== undefined) { buttonView.set('isCancel', isCancel); }
        buttonView.set('isVisible', !!title);
        buttonView.set('themeName', themeName);
      }
    } else {
      // if there are no buttons defined, just add the standard OK button
      buttonView = pane.get('button1');
      buttonView.set('title', "OK");
      buttonView.set('isVisible', YES);
    }

    var show = pane.append(); // make visible.
    pane.adjust('height', pane.childViews[0].$().height());
    pane.updateLayout();
    return show;
  },

  /**
    Same as `show()` just that it uses sc-icon-alert-48 CSS classname
    as the dialog icon

    @param {Hash} args
    @return {SC.AlertPane} the pane shown
  */
  warn: function(args) {
    // normalize the arguments if this is a deprecated call
    args = SC.AlertPane._argumentsCall.apply(this, arguments);

    args.icon = 'sc-icon-alert-48';
    return this.show(args);
  },

  /**
    Same as `show()` just that it uses sc-icon-info-48 CSS classname
    as the dialog icon

    @param {Hash} args
    @return {SC.AlertPane} the pane shown
  */
  info: function(args) {
    // normalize the arguments if this is a deprecated call
    args = SC.AlertPane._argumentsCall.apply(this, arguments);

    args.icon = 'sc-icon-info-48';
    return this.show(args);
  },

  /**
    Same as `show()` just that it uses sc-icon-error-48 CSS classname
    as the dialog icon

    @param {Hash} args
    @return {SC.AlertPane} the pane shown
  */
  error: function(args) {
    // normalize the arguments if this is a deprecated call
    args = SC.AlertPane._argumentsCall.apply(this, arguments);

    args.icon = 'sc-icon-error-48';
    return this.show(args);
  },

  /**
    Same as `show()` just that it uses blank CSS classname
    as the dialog icon

    @param {Hash} args
    @return {SC.AlertPane} the pane shown
  */
  plain: function(args) {
    // normalize the arguments if this is a deprecated call
    args = SC.AlertPane._argumentsCall.apply(this, arguments);

    args.icon = 'blank';
    return this.show(args);
  },

  /** @private
    Set properties to new structure for call that use the old arguments
    structure.

    Deprecated API but is preserved for now for backwards compatibility.

    @deprecated
  */
  _argumentsCall: function(args) {
    var ret = args;
    if(SC.typeOf(args)!==SC.T_HASH) {
      //@if(debug)
      SC.debug('SC.AlertPane has changed the signatures for show(), info(), warn(), error() and plain(). Please update accordingly.');
      //@endif
      var normalizedArgs = this._normalizeArguments(arguments);

      // now convert it to the new format for show()
      ret = {
        message: normalizedArgs[0],
        description: normalizedArgs[1],
        caption: normalizedArgs[2],
        delegate: normalizedArgs[7],
        icon: (normalizedArgs[6] || 'sc-icon-alert-48'),
        themeName: 'capsule'
      };

      // set buttons if there are any (and check if it's a string, since last
      // argument could be the delegate object)
      if(SC.typeOf(normalizedArgs[3])===SC.T_STRING || SC.typeOf(normalizedArgs[4])===SC.T_STRING || SC.typeOf(normalizedArgs[5])===SC.T_STRING) {
        ret.buttons = [
          { title: normalizedArgs[3] },
          { title: normalizedArgs[4] },
          { title: normalizedArgs[5] }
        ];
      }

    }
    return ret;
  },

  /** @private
    internal method normalizes arguments for processing by helper methods.
  */
  _normalizeArguments: function(args) {
    args = SC.A(args); // convert to real array
    var len = args.length, delegate = args[len-1];
    if (SC.typeOf(delegate) !== SC.T_STRING) {
      args[len-1] = null;
    } else delegate = null ;
    args[7] = delegate ;
    return args ;
  }

});
