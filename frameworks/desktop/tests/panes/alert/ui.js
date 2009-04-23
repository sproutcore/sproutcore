// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

module("SC.AlertPane UI");

var pane ;

function evaluatePane(pane, message, description, caption, button1Title, button2Title, button3Title, iconClass) {
  // wrapper
  ok(pane.get('isVisibleInWindow'), 'pane.isVisibleInWindow should be YES');
  ok(pane.$().hasClass('sc-alert'), 'pane should have sc-alert class');
  ok(pane.childViews[0].get('isVisibleInWindow'), 'pane.div.isVisibleInWindow should be YES');
  ok(pane.childViews[0].$().hasClass('sc-view'), 'pane.div should have sc-view class');
  ok(pane.childViews[0].childViews[0].get('isVisibleInWindow'), 'pane.div.info.isVisibleInWindow should be YES');
  ok(pane.childViews[0].childViews[0].$().hasClass('info'), 'pane.div.info should have info class');
  ok(pane.childViews[0].childViews[1].get('isVisibleInWindow'), 'pane.div.div.isVisibleInWindow should be YES');

  // content
  ok(pane.childViews[0].childViews[0].$('img'), 'pane.div.info.img existance should be YES');
  ok(pane.childViews[0].childViews[0].$('img').hasClass('icon'), 'pane.div.info.img should have icon class');
  ok(pane.childViews[0].childViews[0].$('img').hasClass(iconClass), 'pane.div.info.img should have %@ class'.fmt(iconClass));
  ok(pane.childViews[0].childViews[0].$('h1'), 'pane.div.info.h1 existance should be YES');
  equals(pane.childViews[0].childViews[0].$('h1').text(), 'AlertPane.message', 'pane.div.info.h1 should have title');

  if (description) {
    ok(pane.childViews[0].childViews[0].$('p.description'), 'pane.div.info.description existance should be YES');
    equals(pane.childViews[0].childViews[0].$('p.description').text(), 'AlertPane.description', 'pane.div.info.description should have description');
  } else {
    equals(pane.childViews[0].childViews[0].$('p.description').length, 0, 'pane.div.info should have 0 description');
  }

  if (caption) {
    ok(pane.childViews[0].childViews[0].$('p.caption'), 'pane.div.info.caption existance should be YES');
    equals(pane.childViews[0].childViews[0].$('p.caption').text(), 'AlertPane.caption', 'pane.div.info.caption should have caption');
  } else {
    equals(pane.childViews[0].childViews[0].$('p.caption').length, 0, 'pane.div.info should have 0 caption');
  }
  
  // buttons
  ok(pane.childViews[0].childViews[1].$('a'), 'pane.div.div.a existance should be YES');
  equals(pane.childViews[0].childViews[1].$('a').length, 2, 'pane.div.div should have 2 Buttons');
  ok(pane.childViews[0].$('a'), 'pane.div.a existance should be YES');
  
  var button1 = pane.childViews[0].childViews[1].childViews[1];
  var button2 = pane.childViews[0].childViews[1].childViews[0];
  var button3 = pane.childViews[0].childViews[2].childViews[0];
  
  if (button1Title) {
    equals(button1.$('span').text(), button1Title, 'pane.div.div button1 should have custom title %@'.fmt(button1Title));
  } else {
    equals(button1.$('span').text(), 'OK', 'pane.div.div button1 should have default title OK');
  }
  if (button2Title) {
    equals(button2.$('span').text(), button2Title, 'pane.div.div button2 should have custom title %@'.fmt(button2Title));
  } else {
    ok(button2.$().hasClass('hidden'), 'pane.div.div button2 should be hidden');
  }
  if (button3Title) {
    equals(button3.$('span').text(), button3Title, 'pane.div button3 should have custom title %@'.fmt(button3Title));
  } else {
    ok(button3.$().hasClass('hidden'), 'pane.div button3 should be hidden');
  }
}

test("AlertPane.show with icon, message, description, caption and 3 buttons", function() {
  pane = SC.AlertPane.show("AlertPane.message", 'AlertPane.description', 'AlertPane.caption', "okButtonTitle", "cancelButtonTitle", 'extraButtonTitle', 'sc-icon-tools-24', this);      
  evaluatePane(pane, "AlertPane.message", 'AlertPane.description', 'AlertPane.caption', "okButtonTitle", "cancelButtonTitle", 'extraButtonTitle', 'sc-icon-tools-24');
  pane.dismiss();
});

test("AlertPane.warn with icon, message, description, caption and 3 buttons", function() {
  pane = SC.AlertPane.warn("AlertPane.message", 'AlertPane.description', 'AlertPane.caption', "okButtonTitle", "cancelButtonTitle", 'extraButtonTitle', this);      
  evaluatePane(pane, "AlertPane.message", 'AlertPane.description', 'AlertPane.caption', "okButtonTitle", "cancelButtonTitle", 'extraButtonTitle', 'sc-icon-alert-48');
  pane.dismiss();
});

test("AlertPane.error with icon, message, description, caption and 3 buttons", function() {
  pane = SC.AlertPane.error("AlertPane.message", 'AlertPane.description', 'AlertPane.caption', "okButtonTitle", "cancelButtonTitle", 'extraButtonTitle', this);      
  evaluatePane(pane, "AlertPane.message", 'AlertPane.description', 'AlertPane.caption', "okButtonTitle", "cancelButtonTitle", 'extraButtonTitle', 'sc-icon-error-48');
  pane.dismiss();
});

test("AlertPane.plain with message, description, caption and 3 buttons", function() {
  pane = SC.AlertPane.plain("AlertPane.message", 'AlertPane.description', 'AlertPane.caption', "okButtonTitle", "cancelButtonTitle", 'extraButtonTitle', this);      
  evaluatePane(pane, "AlertPane.message", 'AlertPane.description', 'AlertPane.caption', "okButtonTitle", "cancelButtonTitle", 'extraButtonTitle', 'blank');
  pane.dismiss();
});

test("AlertPane.info with icon, message, description, caption and 3 buttons", function() {
  pane = SC.AlertPane.info("AlertPane.message", 'AlertPane.description', 'AlertPane.caption', "okButtonTitle", "cancelButtonTitle", 'extraButtonTitle', this);      
  evaluatePane(pane, "AlertPane.message", 'AlertPane.description', 'AlertPane.caption', "okButtonTitle", "cancelButtonTitle", 'extraButtonTitle', 'sc-icon-info-48');
  pane.dismiss();
});

test("AlertPane.info with icon, message and 1 default button (omit all optional parameters)", function() {
  pane = SC.AlertPane.info("AlertPane.message");      
  evaluatePane(pane, "AlertPane.message", null, null, null, null, null, 'sc-icon-info-48');
  pane.dismiss();
});

test("AlertPane.info with icon, message and 3 buttons (passing null to optional description and caption)", function() {
  pane = SC.AlertPane.info("AlertPane.message", null, null, "okButtonTitle", "cancelButtonTitle", 'extraButtonTitle', this);      
  evaluatePane(pane, "AlertPane.message", null, null, "okButtonTitle", "cancelButtonTitle", 'extraButtonTitle', 'sc-icon-info-48');
  pane.dismiss();
});

test("AlertPane.info with icon, message, description, caption and 1 button (passing null to 3 buttons)", function() {
  pane = SC.AlertPane.info("AlertPane.message", 'AlertPane.description', 'AlertPane.caption', null, null, null, this);      
  evaluatePane(pane, "AlertPane.message", 'AlertPane.description', 'AlertPane.caption', null, null, null, 'sc-icon-info-48');
  pane.dismiss();
});

test("users interaction with mutiple alert panes with 1-3 buttons", function() {
  
  var delegate = SC.Object.create({
    
    threeButtonAlertPane: function() {
      pane = SC.AlertPane.warn("AlertPane.warn title", 'Click OK to see this alert pane again.  \nClick Other... to see other alert panes.', 'Click cancel to dismiss.', "OK", "Cancel", 'Other...', this);      
    },

    twoButtonAlertPane: function() {
      pane = SC.AlertPane.error("AlertPane.error title", 'Click OK to see one button alert pane.', 'Click cancel to dismiss.', "OK", "Cancel", delegate);      
    },

    oneButtonAlertPane: function() {
      pane = SC.AlertPane.info("AlertPane.info title", 'Click OK to dismiss.', delegate);      
    },
   
    alertPaneDidDismiss: function(alert, status) {
      console.log("%@.alertDidDismiss - %@".fmt(alert, status));
      switch(status) {
        case SC.BUTTON1_STATUS:
          if(alert.icon && alert.icon.indexOf('alert')!=-1) this.invokeLater(this.threeButtonAlertPane, 1000);
          if(alert.icon && alert.icon.indexOf('error')!=-1) this.oneButtonAlertPane();
          break;
        case SC.BUTTON3_STATUS:
          this.twoButtonAlertPane();
          break;
      }
    }
  });

  SC.RunLoop.begin();
  delegate.threeButtonAlertPane();
  SC.RunLoop.end();
}) ;
