// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

require('views/panel');

/** 
  button1 : 1st button from the right. default:OK
  button2 : 2nd button from the right. Optional. Could be Cancel or 2nd action.
  button3 : 1st button from the left. Optional. Could be Cancel or alternative option.
*/

/** 
  Passed to delegate when alert panel is dismissed by pressing button 1
*/
SC.BUTTON1_STATUS = 'button1';

/** 
  Passed to delegate when alert panel is dismissed by pressing button 2
*/
SC.BUTTON2_STATUS = 'button2';

/** 
  Passed to delegate when alert panel is dismissed by pressing button 3
*/
SC.BUTTON3_STATUS = 'button3';


/**
  Displays a preformatted modal alert panel.
  
  Alert panels are a simple way to provide modal messaging that otherwise 
  blocks the user's interaction with your application.  Alert panels are 
  useful for showing important error messages and confirmation dialogs.  They
  provide a better user experience than using the OS-level alert dialogs.
  
  h1. Displaying an Alert Panel
  
  The easiest way to display an alert panel is to use one of the various 
  class methods defined on SC.AlertPanel, passing the message and an optional
  detailed description.  
  
  There are four variations of this method can you can invoke:  
  
  - *warn()* - displays an alert panel with a warning icon to the left.
  - *error()* - displays an alert with an error icon to the left
  - *info()* - displays an alert with an info icon to the left
  - *show()* - displays an alert with a customizable icon to the left
  
  In addition to passing a message and description, you can also customize
  the title of the button 1 (OK) and add an optional button 2 and 3 (Cancel or Extra).  Just
  pass these titles of these buttons to enable them or null to disable then.
  
  Additionally, you can pass a delegate object as the last parameter.  This
  delegate's 'alertPanelDidDismiss()' method will be called when the panel
  is dismissed, passing the panel instance and a key indicating which 
  button was pressed.
  
  h1. Examples
  
  Show a simple AlertPanel with an OK button:
  
  {{{
    SC.AlertPanel.warn("Could not load calendar", "Your internet connection may be unavailable or our servers may be down.  Try again in a few minutes.");
  }}}
  
  Show an AlertPanel with a customized OK title (title will be 'Try Again'):
  
  {{{
    SC.AlertPanel.warn("Could not load calendar", "Your internet connection may be unavailable or our servers may be down.  Try again in a few minutes.", "Try Again");
  }}}
  
  Show an AlertPanel with a custom OK, a Cancel button and an Extra button, 
  each with custom titles.  Also, pass a delegate that will be invoked when
  the user's dismisses the dialog.
  
  {{{

    MyApp.calendarController = SC.Object.create({
      alertPanelDidDismiss: function(panel, status) {
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
    
    SC.AlertPanel.warn("Could not load calendar", "Your internet connection may be unavailable or our servers may be down.  Try again in a few minutes.", "Try Again", "Cancel", "More Info...", MyApp.calendarController);
  }}}
  
  @extends SC.Panel
  @since SproutCore 1.0
*/
SC.AlertPanel = SC.Panel.extend({
  
  classNames: 'sc-alert-panel',
  
  /**
    The delegate to notify when the pane is dismissed.  If you set a 
    delegate, it should respond to the method:
    
    {{{
      alertPanelDidDismiss: function(panel, status)
    }}}
    
    The status will be on of SC.BUTTON1_STATUS, SC.BUTTON2_STATUS or SC.BUTTON3_STATUS
    depending on which button was clicked.
    
    @property {Object}
  */
  delegate: null,

  /**
    The icon URL or class name.  If you do not set this, an alert icon will
    be shown instead.
    
    @property {String}
  */
  icon: 'sc-icon-alert-48',

  /**
    The primary message to display.  This message will appear in large bold
    type at the top of the alert.
    
    @property {String}
  */
  message: "",

  /**
    An optional detailed decription.  Use this string to provide further 
    explanation of the condition and, optionally, ways the user can resolve
    the problem.
    
    @property {String}
  */
  description: "",
  
  displayDescription: function() {
    var desc = this.get('description');
    if (!desc || desc.length === 0) return desc ;
    
    desc = SC.RenderContext.escapeHTML(desc); // remove HTML
    return '<p>' + desc.split('\n').join('</p><p>') + '</p>';
  }.property('description').cacheable(),
  
  /**
    The button view for the button 1 (OK).
    
    @property {SC.ButtonView}
  */
  buttonOne: SC.outlet('contentView.childViews.1.childViews.1'),

  /**
    The button view for the button 2 (Cancel).
    
    @property {SC.ButtonView}
  */
  buttonTwo: SC.outlet('contentView.childViews.1.childViews.0'),

  /**
    The button view for the button 3 (Extra).
    
    @property {SC.ButtonView}
  */
  buttonThree: SC.outlet('contentView.childViews.2'),
  
  /** @private - internal view that is actually displayed */
  contentView: SC.View.extend({
    layout: { centerX: 0, width: 460, top: 100, height: 'auto' },
    
    childViews: [
      SC.View.extend(SC.StaticLayout, {
        classNames: ['info'],

        render: function(context, firstTime) {
          var pane = this.get('pane');
          var blank = sc_static('blank') ;
          context.push('<img src="%@" class="icon %@" />'.fmt(blank, pane.get('icon')));
          context.begin('h1').text(pane.get('message') || '').end();
          context.push(pane.get('displayDescription' || ''));
        }
      }),

      SC.View.extend({
        layout: { bottom: 14, height: 23, right: 14, width: 'auto' },
        childViews: [
          SC.ButtonView.extend({
            useStaticLayout: YES,
            actionKey: SC.BUTTON2_STATUS,
            localize: YES,
            titleMinWidth: 80,
            layout: { right: 0, height: 21, width: 'auto', bottom: 0 },
            title: "Cancel", 
            action: "dismiss",
            isVisible: NO
          }),

          SC.ButtonView.extend({
            useStaticLayout: YES,
            actionKey: SC.BUTTON1_STATUS,
            localize: YES,
            titleMinWidth: 80,
            layout: { right: 0, height: 21, width: 'auto', bottom: 0 },
            title: "OK", 
            action: "dismiss"
          })]
      }),
      
      SC.ButtonView.extend({
        actionKey: SC.BUTTON3_STATUS,
        localize: YES,
        titleMinWidth: 80,
        layout: { bottom: 14, height: 21, left: 16, width: 'auto' },
        title: "Extra", 
        action: "dismiss",
        isVisible: NO
      })]
  }),

  /**
    Action triggered whenever any button is pressed.  Notifies any delegate
    and then hides the alert panel.
  */
  dismiss: function(sender) {
    var del = this.delegate;
    if (del && del.alertPanelDidDismiss) {
      del.alertPanelDidDismiss(this, sender.get('actionKey'));
    }
    this.remove(); // hide alert
  },
  
  /** @private 
    Executes whenever one of the icon, message or description is changed.
    This simply causes the UI to refresh.
  */
  alertInfoDidChange: function() {
    var v = this.getPath('contentView.childViews.0');
    if (v) v.displayDidChange(); // re-render message
  }.observes('icon', 'message', 'displayDescription')
});

/** @private
  internal method normalizes arguments for processing by helper methods.
*/
SC.AlertPanel._normalizeArguments = function(args) {
  args = SC.A(args); // convert to real array
  var len = args.length, delegate = args[len-1];
  if (SC.typeOf(delegate) !== SC.T_STRING) {
    args[len-1] = null;
  } else delegate = null ;
  args[6] = delegate ;
  return args ;
};

/**
  Displays a new alert panel according to the passed parameters.  Every 
  parameter except for the message is optional.  You can always pass the 
  delegate as the last parameter and it will be used, even if you omit items
  in between.
  
  If you need to pass other parameters but you want to omit some others 
  in between, pass null and the related UI item will be hidden
  
  Note that if you pass an icon, it should be 48 x 48 in size.
  
  @param {String} message the primary message
  @param {String} description an optional detailed description
  @param {String} button1Title optional unlocalized title for button 1 (OK)
  @param {String} button2Title optional unlocalized title for button 2 (Cancel)
  @param {String} button3Title optional unlocalized title for button 3 (extra)
  @param {String} iconUrl optional URL or class name for icon.
  @param {Object} delegate optional delegate to notify when panel is dismissed
  @returns {SC.AlertPanel} new alert panel
*/
SC.AlertPanel.show = function(message, description, button1Title, button2Title, button3Title, iconUrl, delegate) {
  
  // get the delegate and normalize the rest of the params
  var args = this._normalizeArguments(arguments);
  console.log('SC.AlertPanel.show(%@)'.fmt(args.join(',')));
  
  // create basic AlertPanel
  var ret = this.create({
    message: args[0] || '',
    description: args[1] || null,
    icon: args[5] || 'sc-icon-alert-48',
    delegate: args[6]
  });
  
  // customize buttons as needed
  var buttonKeys = 'buttonOne buttonTwo buttonThree'.w(), button, title;
  for(var idx=0;idx<3;idx++) {
    button = ret.get(buttonKeys[idx]);
    title = args[idx + 2];
    if (title) button.set('title', title).set('isVisible', YES);
  }
  
  return ret.append(); // make visible.
};

/**
  Displays a warning alert panel.  See SC.AlertPanel.show() for complete details. 
  
  @returns {SC.AlertPanel} the panel
*/
SC.AlertPanel.warn = function(message, description, button1Title, button2Title, button3Title, delegate) {
  var args = this._normalizeArguments(arguments);
  args[5] = 'sc-icon-alert-48';
  return this.show.apply(this, args);
};


/**
  Displays a info alert panel.  See SC.AlertPanel.show() for complete details. 
  
  @returns {SC.AlertPanel} the panel
*/
SC.AlertPanel.info = function(message, description, button1Title, button2Title, button3Title, delegate) {
  var args = this._normalizeArguments(arguments);
  args[5] = 'sc-icon-info-48';
  return this.show.apply(this, args);
};

/**
  Displays a warning error panel.  See SC.AlertPanel.show() for complete details. 
  
  @returns {SC.AlertPanel} the panel
*/
SC.AlertPanel.error = function(message, description, button1Title, button2Title, button3Title, delegate) {
  var args = this._normalizeArguments(arguments);
  args[5] = 'sc-icon-error-48';
  return this.show.apply(this, args);
};
