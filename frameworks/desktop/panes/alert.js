// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('panes/panel');
sc_require('views/button');
/** 
  button1 : 1st button from the right. default:OK
  button2 : 2nd button from the right. Optional. Could be Cancel or 2nd action.
  button3 : 1st button from the left. Optional. Could be Cancel or alternative option.
*/
/** 
  Passed to delegate when alert pane is dismissed by pressing button 1
*/
SC.BUTTON1_STATUS = 'button1';

/** 
  Passed to delegate when alert pane is dismissed by pressing button 2
*/
SC.BUTTON2_STATUS = 'button2';

/** 
  Passed to delegate when alert pane is dismissed by pressing button 3
*/
SC.BUTTON3_STATUS = 'button3';

/** @class
  Displays a preformatted modal alert pane.
  
  Alert panes are a simple way to provide modal messaging that otherwise 
  blocks the user's interaction with your application.  Alert panes are 
  useful for showing important error messages and confirmation dialogs.  They
  provide a better user experience than using the OS-level alert dialogs.
  
  h1. Displaying an Alert Pane
  
  The easiest way to display an alert pane is to use one of the various 
  class methods defined on SC.AlertPane, passing the message and an optional
  detailed description and caption.  
  
  There are four variations of this method can you can invoke:  
  
  - *warn()* - displays an alert pane with a warning icon to the left.
  - *error()* - displays an alert with an error icon to the left
  - *info()* - displays an alert with an info icon to the left
  - *plain()* - displays an alert w/o any icon
  - *show()* - displays an alert with a customizable icon to the left
  
  In addition to passing a message, description and caption, you can also customize
  the title of the button 1 (OK) and add an optional button 2 and 3 (Cancel or Extra).  Just
  pass these titles of these buttons to enable them or null to disable then.
  
  Additionally, you can pass a delegate object as the last parameter.  This
  delegate's 'alertPaneDidDismiss()' method will be called when the pane
  is dismissed, passing the pane instance and a key indicating which 
  button was pressed.
  
  h1. Examples
  
  Show a simple AlertPane with an OK button:
  
  {{{
    SC.AlertPane.warn("Could not load calendar", "Your internet connection may be unavailable or our servers may be down.  Try again in a few minutes.");
  }}}
  
  Show an AlertPane with a customized OK title (title will be 'Try Again'):
  
  {{{
    SC.AlertPane.warn("Could not load calendar", "Your internet connection may be unavailable or our servers may be down.  Try again in a few minutes.", "Try Again");
  }}}
  
  Show an AlertPane with a custom OK, a Cancel button and an Extra button, 
  each with custom titles.  Also, pass a delegate that will be invoked when
  the user's dismisses the dialog.
  
  {{{

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
    
    SC.AlertPane.warn("Could not load calendar", "Your internet connection may be unavailable or our servers may be down.  Try again in a few minutes.", "Try Again", "Cancel", "More Info...", MyApp.calendarController);
  }}}
  
  @extends SC.PanelPane
  @since SproutCore 1.0
*/
SC.AlertPane = SC.PanelPane.extend({
  
  classNames: 'sc-alert',
  
  /**
    The delegate to notify when the pane is dismissed.  If you set a 
    delegate, it should respond to the method:
    
    {{{
      alertPaneDidDismiss: function(pane, status)
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
    return '<p class="description">' + desc.split('\n').join('</p><p class="description">') + '</p>';
  }.property('description').cacheable(),

  /**
    An optional detailed caption.  Use this string to provide further 
    fine print explanation of the condition and, optionally, ways the user can resolve
    the problem.
    
    @property {String}
  */
  caption: "",
  
  displayCaption: function() {
    var caption = this.get('caption');
    if (!caption || caption.length === 0) return caption ;
    
    caption = SC.RenderContext.escapeHTML(caption); // remove HTML
    return '<p class="caption">' + caption.split('\n').join('</p><p class="caption">') + '</p>';
  }.property('caption').cacheable(),
  
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
  buttonThree: SC.outlet('contentView.childViews.2.childViews.0'),

  /**
    The view for the button 3 (Extra) wrapper.
    
    @property {SC.View}
  */
  buttonThreeWrapper: SC.outlet('contentView.childViews.2'),
  
  layout: { centerX: 0, width: 500, top: 55 },

  /** @private - internal view that is actually displayed */
  contentView: SC.View.extend({
    
    useStaticLayout: YES,
    
    layout: { left: 0, right: 0, top: 0, height: "auto" },
		
    childViews: [
      SC.View.extend(SC.StaticLayout, {
        classNames: ['info'],

        render: function(context, firstTime) {
          var pane = this.get('pane');
          var blank = SC.BLANK_IMAGE_URL ;
          if(pane.get('icon') == 'blank') context.addClass('plain');
          context.push('<img src="%@" class="icon %@" />'.fmt(blank, pane.get('icon')));
          context.begin('h1').text(pane.get('message') || '').end();
          context.push(pane.get('displayDescription') || '');
          context.push(pane.get('displayCaption') || '');
          context.push('<div class="separator"></div>');
        }
      }),

      SC.View.extend({
        layout: { bottom: 13, height: 24, right: 18, width: 466 },
        childViews: ['cancelButton', 'okButton'],
        classNames: ['textAlignRight'],
        cancelButton : SC.ButtonView.extend({
            useStaticLayout: YES,
            actionKey: SC.BUTTON2_STATUS,
            localize: YES,
            titleMinWidth: 64,
            layout: { right: 5, height: 'auto', width: 'auto', bottom: 0 },
            theme: 'capsule',
            title: "Cancel", 
            action: "dismiss",
            isVisible: NO
          }),

        okButton : SC.ButtonView.extend({
            useStaticLayout: YES,
            actionKey: SC.BUTTON1_STATUS,
            localize: YES,
            titleMinWidth: 64,
            layout: { left: 0, height: 'auto', width: 'auto', bottom: 0 },
            theme: 'capsule',
            title: "OK", 
            isDefault: YES,
            action: "dismiss"
          })
      }),
      
      SC.View.extend({
        layout: { bottom: 13, height: 24, left: 18, width: 150 },
        isVisible: NO,
        childViews: [
          SC.ButtonView.extend({
            useStaticLayout: YES,
            actionKey: SC.BUTTON3_STATUS,
            localize: YES,
            titleMinWidth: 64,
            layout: { left: 0, height: 'auto', width: 'auto', bottom: 0 },
            theme: 'capsule',
            title: "Extra", 
            action: "dismiss",
            isVisible: NO
          })]
      })]
  }),

  /**
    Action triggered whenever any button is pressed.  Notifies any delegate
    and then hides the alert pane.
  */
  dismiss: function(sender) {
    var del = this.delegate;
    if (del && del.alertPaneDidDismiss) {
      del.alertPaneDidDismiss(this, sender.get('actionKey'));
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

/** @private
  internal method normalizes arguments for processing by helper methods.
*/
SC.AlertPane._normalizeArguments = function(args) {
  args = SC.A(args); // convert to real array
  var len = args.length, delegate = args[len-1];
  if (SC.typeOf(delegate) !== SC.T_STRING) {
    args[len-1] = null;
  } else delegate = null ;
  args[7] = delegate ;
  return args ;
};

/**
  Displays a new alert pane according to the passed parameters.  Every 
  parameter except for the message is optional.  You can always pass the 
  delegate as the last parameter and it will be used, even if you omit items
  in between.
  
  If you need to pass other parameters but you want to omit some others 
  in between, pass null and the related UI item will be hidden
  
  Note that if you pass an icon, it should be 48 x 48 in size.
  
  @param {String} message the primary message
  @param {String} description an optional detailed description
  @param {String} caption an optional detailed fine print caption
  @param {String} button1Title optional unlocalized title for button 1 (OK)
  @param {String} button2Title optional unlocalized title for button 2 (Cancel)
  @param {String} button3Title optional unlocalized title for button 3 (extra)
  @param {String} iconUrl optional URL or class name for icon.
  @param {Object} delegate optional delegate to notify when pane is dismissed
  @returns {SC.AlertPane} new alert pane
*/
SC.AlertPane.show = function(message, description, caption, button1Title, button2Title, button3Title, iconUrl, delegate) {
  
  // get the delegate and normalize the rest of the params
  var args = this._normalizeArguments(arguments);
  
  // create basic AlertPane
  var ret = this.create({
    message: args[0] || '',
    description: args[1] || null,
    caption: args[2] || null,
    icon: args[6] || 'sc-icon-alert-48',
    delegate: args[7]
  });
  
  // customize buttons as needed
  var buttonKeys = 'buttonOne buttonTwo buttonThree'.w(), button, title;
  for(var idx=0;idx<3;idx++) {
    button = ret.get(buttonKeys[idx]);
    title = args[idx + 3];
    if (title) {
      button.set('title', title).set('isVisible', YES);
      if (idx==2) {
        var button_wrapper = ret.get('buttonThreeWrapper');
        button_wrapper.set('isVisible', YES);
      }
    }
  }
  var show = ret.append() ; // make visible.
  ret.adjust('height', ret.childViews[0].$().height()) ;
  ret.updateLayout() ;
  return show ;
};

/**
  Displays a warning alert pane.  See SC.AlertPane.show() for complete details. 
  
  @returns {SC.AlertPane} the pane
*/
SC.AlertPane.warn = function(message, description, caption, button1Title, button2Title, button3Title, delegate) {
  var args = this._normalizeArguments(arguments);
  args[6] = 'sc-icon-alert-48';
  return this.show.apply(this, args);
};


/**
  Displays a info alert pane.  See SC.AlertPane.show() for complete details. 
  
  @returns {SC.AlertPane} the pane
*/
SC.AlertPane.info = function(message, description, caption, button1Title, button2Title, button3Title, delegate) {
  var args = this._normalizeArguments(arguments);
  args[6] = 'sc-icon-info-48';
  return this.show.apply(this, args);
};

/**
  Displays a error allert pane.  See SC.AlertPane.show() for complete details. 
  
  @returns {SC.AlertPane} the pane
*/
SC.AlertPane.error = function(message, description, caption, button1Title, button2Title, button3Title, delegate) {
  var args = this._normalizeArguments(arguments);
  args[6] = 'sc-icon-error-48';
  return this.show.apply(this, args);
};

/**
  Displays a plain all-text allert pane w/o icon.  See SC.AlertPane.show() for complete details. 
  
  @returns {SC.AlertPane} the pane
*/
SC.AlertPane.plain = function(message, description, caption, button1Title, button2Title, button3Title, delegate) {
  var args = this._normalizeArguments(arguments);
  args[6] = 'blank';
  return this.show.apply(this, args);
};
