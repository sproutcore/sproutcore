// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same htmlbody */

module("A dialog with some basic controls and buttons");

var AlertPane = SC.DialogPane.extend({
  
  classNames: 'alert-pane',
  
  delegate: null,
  
  alertType: 'alert',
  
  icon: function() {
    return 'sc-icon-%@-48'.fmt(this.get('alertType'));
  }.property('alertType').cacheable(),
  
  message: "Primary Message",
  
  description: "description",
  
  okButton: SC.outlet('contentView.childViews.1'),
  cancelButton: SC.outlet('contentView.childViews.2'),
  extraButton: SC.outlet('contentView.childViews.3'),
  
  contentView: SC.View.extend({
    layout: { centerX: 0, width: 420, top: 60, height: 'auto' },
    
    childViews: [
      SC.View.extend(SC.StaticLayout, {
        classNames: ['info'],

        render: function(context, firstTime) {
          var pane = this.get('pane');
          var blank = sc_static('blank') ;
          context.push('<img src="%@" class="icon %@" />'.fmt(blank, pane.get('icon')));
          context.begin('h1').push(pane.get('message') || '').end();
          context.begin('p').push(pane.get('description' || '')).end();
        }
      }),

      SC.ButtonView.extend({
        actionKey: "ok",
        layout: { bottom: 16, height: 21, right: 20, width: 100 },
        title: "OK", 
        action: "dismiss"
      }),
      
      SC.ButtonView.extend({
        actionKey: "cancel",
        layout: { bottom: 16, height: 21, right: 130, width: 100 },
        title: "Cancel", 
        action: "dismiss",
        isVisible: NO
      }),
      
      SC.ButtonView.extend({
        actionKey: "extra",
        layout: { bottom: 16, height: 21, left: 20, width: 100 },
        title: "Extra", 
        action: "dismiss",
        isVisible: NO
      })]
  }),

  dismiss: function(sender) {
    var del = this.delegate;
    if (del && del.alertDidDismiss) {
      del.alertDidDismiss(this, sender.get('actionKey'));
    }
    this.remove(); // hide alert
  },
  
  /** 
    Executes whenever one of the icon, message or description is changed.
    This simply causes the UI to refresh.
  */
  alertInfoDidChange: function() {
    var v = this.getPath('contentView.childViews.0');
    if (v) v.displayDidChange(); // re-render message
  }.observes('icon', 'message', 'description')
});

AlertPane.warn = function(message, description, okButtonTitle,  cancelButtonTitle, extraButtonTitle, delegate) {
  
  // get delegate -- last param passed unless string
  var len = arguments.length;
  if (len>2 && SC.typeOf(arguments[len-1]) !== SC.T_STRING) {
    delegate = arguments[len-1];
    len--;
  }
  
  var ret = this.create({
    message: message,
    description: description, 
    delegate: delegate
  });  

  if (len>2 && okButtonTitle) {
    ret.get('okButton').set('title', okButtonTitle).set('isVisible', YES);
  }

  if (len>3 && cancelButtonTitle) {
    ret.get('cancelButton').set('title', cancelButtonTitle).set('isVisible', YES);
  }

  if (len>4 && extraButtonTitle) {
    ret.get('extraButton').set('title', extraButtonTitle).set('isVisible', YES);
  }
  
  return ret.append();
};

var pane ;

test("adding dialog to screen", function() {

  
  pane = AlertPane.create() ;

  var delegate = SC.Object.create({
    alertDidDismiss: function(alert, status) {
      console.log("%@.alertDidDismiss - %@".fmt(alert, status));
    }
  });
  
  SC.RunLoop.begin();
  pane = AlertPane.warn("Email could not be sent", "There might be a problem with the server or with your internet connection.  Try again in a few minutes.", "Try Again", "Cancel", delegate);
  //pane.append();
  SC.RunLoop.end();  
}) ;

