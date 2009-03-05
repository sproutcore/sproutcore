// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

module("SC.AlertPanel UI");

var pane ;

test("AlertPanel.show with icon, message, description and 3 buttons", function() {
  pane = SC.AlertPanel.show("AlertPanel.message", 'AlertPanel.description', "okButtonTitle", "cancelButtonTitle", 'extraButtonTitle', 'sc-icon-tools-24', this);      

	// wrapper
	ok(pane.get('isVisibleInWindow'), 'pane.isVisibleInWindow should be YES');
	ok(pane.$().hasClass('sc-alert-panel'), 'pane should have sc-alert-panel class');
	ok(pane.childViews[0].get('isVisibleInWindow'), 'pane.div.isVisibleInWindow should be YES');
	ok(pane.childViews[0].$().hasClass('sc-view'), 'pane.div should have sc-view class');
	ok(pane.childViews[0].childViews[0].get('isVisibleInWindow'), 'pane.div.info.isVisibleInWindow should be YES');
	ok(pane.childViews[0].childViews[0].$().hasClass('info'), 'pane.div.info should have info class');
	ok(pane.childViews[0].childViews[1].get('isVisibleInWindow'), 'pane.div.div.isVisibleInWindow should be YES');

	// content
	ok(pane.childViews[0].childViews[0].$('img'), 'pane.div.info.img existance should be YES');
	ok(pane.childViews[0].childViews[0].$('img').hasClass('icon'), 'pane.div.info.img should have icon class');
	ok(pane.childViews[0].childViews[0].$('img').hasClass('sc-icon-tools-24'), 'pane.div.info.img should have sc-icon-alert-48 class');
	ok(pane.childViews[0].childViews[0].$('h1'), 'pane.div.info.h1 existance should be YES');
	equals(pane.childViews[0].childViews[0].$('h1').text(), 'AlertPanel.message', 'pane.div.info.h1 should have title');
	ok(pane.childViews[0].childViews[0].$('p'), 'pane.div.info.p existance should be YES');
	equals(pane.childViews[0].childViews[0].$('p').text(), 'AlertPanel.description', 'pane.div.info.p should have description');

	// buttons
	ok(pane.childViews[0].childViews[1].$('a'), 'pane.div.div.a existance should be YES');
	equals(pane.childViews[0].childViews[1].$('a').length, 2, 'pane.div.div should have 2 Buttons');
	equals(pane.childViews[0].childViews[1].childViews[0].$('span').text(), 'cancelButtonTitle', 'pane.div.div 1st Button should have custom cancelButtonTitle');
	equals(pane.childViews[0].childViews[1].childViews[1].$('span').text(), 'okButtonTitle', 'pane.div.div 2nd Button should have custom okButtonTitle');

	ok(pane.childViews[0].$('a'), 'pane.div.a existance should be YES');
	equals(pane.childViews[0].childViews[2].$('span').text(), 'extraButtonTitle', 'pane.div extra Button should have custom extraButtonTitle');

  pane.dismiss();
});

test("AlertPanel.warn with icon, message, description and 3 buttons", function() {
  pane = SC.AlertPanel.warn("AlertPanel.message", 'AlertPanel.description', "okButtonTitle", "cancelButtonTitle", 'extraButtonTitle', this);      

	// wrapper
	ok(pane.get('isVisibleInWindow'), 'pane.isVisibleInWindow should be YES');
	ok(pane.$().hasClass('sc-alert-panel'), 'pane should have sc-alert-panel class');
	ok(pane.childViews[0].get('isVisibleInWindow'), 'pane.div.isVisibleInWindow should be YES');
	ok(pane.childViews[0].$().hasClass('sc-view'), 'pane.div should have sc-view class');
	ok(pane.childViews[0].childViews[0].get('isVisibleInWindow'), 'pane.div.info.isVisibleInWindow should be YES');
	ok(pane.childViews[0].childViews[0].$().hasClass('info'), 'pane.div.info should have info class');
	ok(pane.childViews[0].childViews[1].get('isVisibleInWindow'), 'pane.div.div.isVisibleInWindow should be YES');

	// content
	ok(pane.childViews[0].childViews[0].$('img'), 'pane.div.info.img existance should be YES');
	ok(pane.childViews[0].childViews[0].$('img').hasClass('icon'), 'pane.div.info.img should have icon class');
	ok(pane.childViews[0].childViews[0].$('img').hasClass('sc-icon-alert-48'), 'pane.div.info.img should have sc-icon-alert-48 class');
	ok(pane.childViews[0].childViews[0].$('h1'), 'pane.div.info.h1 existance should be YES');
	equals(pane.childViews[0].childViews[0].$('h1').text(), 'AlertPanel.message', 'pane.div.info.h1 should have title');
	ok(pane.childViews[0].childViews[0].$('p'), 'pane.div.info.p existance should be YES');
	equals(pane.childViews[0].childViews[0].$('p').text(), 'AlertPanel.description', 'pane.div.info.p should have description');

	// buttons
	ok(pane.childViews[0].childViews[1].$('a'), 'pane.div.div.a existance should be YES');
	equals(pane.childViews[0].childViews[1].$('a').length, 2, 'pane.div.div should have 2 Buttons');
	equals(pane.childViews[0].childViews[1].childViews[0].$('span').text(), 'cancelButtonTitle', 'pane.div.div 1st Button should have custom cancelButtonTitle');
	equals(pane.childViews[0].childViews[1].childViews[1].$('span').text(), 'okButtonTitle', 'pane.div.div 2nd Button should have custom okButtonTitle');

	ok(pane.childViews[0].$('a'), 'pane.div.a existance should be YES');
	equals(pane.childViews[0].childViews[2].$('span').text(), 'extraButtonTitle', 'pane.div extra Button should have custom extraButtonTitle');

  pane.dismiss();
});

test("AlertPanel.error with icon, message, description and 3 buttons", function() {
  pane = SC.AlertPanel.error("AlertPanel.message", 'AlertPanel.description', "okButtonTitle", "cancelButtonTitle", 'extraButtonTitle', this);      

	// wrapper
	ok(pane.get('isVisibleInWindow'), 'pane.isVisibleInWindow should be YES');
	ok(pane.$().hasClass('sc-alert-panel'), 'pane should have sc-alert-panel class');
	ok(pane.childViews[0].get('isVisibleInWindow'), 'pane.div.isVisibleInWindow should be YES');
	ok(pane.childViews[0].$().hasClass('sc-view'), 'pane.div should have sc-view class');
	ok(pane.childViews[0].childViews[0].get('isVisibleInWindow'), 'pane.div.info.isVisibleInWindow should be YES');
	ok(pane.childViews[0].childViews[0].$().hasClass('info'), 'pane.div.info should have info class');
	ok(pane.childViews[0].childViews[1].get('isVisibleInWindow'), 'pane.div.div.isVisibleInWindow should be YES');

	// content
	ok(pane.childViews[0].childViews[0].$('img'), 'pane.div.info.img existance should be YES');
	ok(pane.childViews[0].childViews[0].$('img').hasClass('icon'), 'pane.div.info.img should have icon class');
	ok(pane.childViews[0].childViews[0].$('img').hasClass('sc-icon-error-48'), 'pane.div.info.img should have sc-icon-alert-48 class');
	ok(pane.childViews[0].childViews[0].$('h1'), 'pane.div.info.h1 existance should be YES');
	equals(pane.childViews[0].childViews[0].$('h1').text(), 'AlertPanel.message', 'pane.div.info.h1 should have title');
	ok(pane.childViews[0].childViews[0].$('p'), 'pane.div.info.p existance should be YES');
	equals(pane.childViews[0].childViews[0].$('p').text(), 'AlertPanel.description', 'pane.div.info.p should have description');

	// buttons
	ok(pane.childViews[0].childViews[1].$('a'), 'pane.div.div.a existance should be YES');
	equals(pane.childViews[0].childViews[1].$('a').length, 2, 'pane.div.div should have 2 Buttons');
	equals(pane.childViews[0].childViews[1].childViews[0].$('span').text(), 'cancelButtonTitle', 'pane.div.div 1st Button should have custom cancelButtonTitle');
	equals(pane.childViews[0].childViews[1].childViews[1].$('span').text(), 'okButtonTitle', 'pane.div.div 2nd Button should have custom okButtonTitle');

	ok(pane.childViews[0].$('a'), 'pane.div.a existance should be YES');
	equals(pane.childViews[0].childViews[2].$('span').text(), 'extraButtonTitle', 'pane.div extra Button should have custom extraButtonTitle');

  pane.dismiss();
});

test("AlertPanel.info with icon, message, description and 3 buttons", function() {
  pane = SC.AlertPanel.info("AlertPanel.message", 'AlertPanel.description', "okButtonTitle", "cancelButtonTitle", 'extraButtonTitle', this);      

	// wrapper
	ok(pane.get('isVisibleInWindow'), 'pane.isVisibleInWindow should be YES');
	ok(pane.$().hasClass('sc-alert-panel'), 'pane should have sc-alert-panel class');
	ok(pane.childViews[0].get('isVisibleInWindow'), 'pane.div.isVisibleInWindow should be YES');
	ok(pane.childViews[0].$().hasClass('sc-view'), 'pane.div should have sc-view class');
	ok(pane.childViews[0].childViews[0].get('isVisibleInWindow'), 'pane.div.info.isVisibleInWindow should be YES');
	ok(pane.childViews[0].childViews[0].$().hasClass('info'), 'pane.div.info should have info class');
	ok(pane.childViews[0].childViews[1].get('isVisibleInWindow'), 'pane.div.div.isVisibleInWindow should be YES');

	// content
	ok(pane.childViews[0].childViews[0].$('img'), 'pane.div.info.img existance should be YES');
	ok(pane.childViews[0].childViews[0].$('img').hasClass('icon'), 'pane.div.info.img should have icon class');
	ok(pane.childViews[0].childViews[0].$('img').hasClass('sc-icon-info-48'), 'pane.div.info.img should have sc-icon-alert-48 class');
	ok(pane.childViews[0].childViews[0].$('h1'), 'pane.div.info.h1 existance should be YES');
	equals(pane.childViews[0].childViews[0].$('h1').text(), 'AlertPanel.message', 'pane.div.info.h1 should have title');
	ok(pane.childViews[0].childViews[0].$('p'), 'pane.div.info.p existance should be YES');
	equals(pane.childViews[0].childViews[0].$('p').text(), 'AlertPanel.description', 'pane.div.info.p should have description');

	// buttons
	ok(pane.childViews[0].childViews[1].$('a'), 'pane.div.div.a existance should be YES');
	equals(pane.childViews[0].childViews[1].$('a').length, 2, 'pane.div.div should have 2 Buttons');
	equals(pane.childViews[0].childViews[1].childViews[0].$('span').text(), 'cancelButtonTitle', 'pane.div.div 1st Button should have custom cancelButtonTitle');
	equals(pane.childViews[0].childViews[1].childViews[1].$('span').text(), 'okButtonTitle', 'pane.div.div 2nd Button should have custom okButtonTitle');

	ok(pane.childViews[0].$('a'), 'pane.div.a existance should be YES');
	equals(pane.childViews[0].childViews[2].$('span').text(), 'extraButtonTitle', 'pane.div extra Button should have custom extraButtonTitle');

  pane.dismiss();
});

test("AlertPanel.info with icon, message and 1 default button (omit all optional parameters)", function() {
  pane = SC.AlertPanel.info("AlertPanel.message");      

	// wrapper
	ok(pane.get('isVisibleInWindow'), 'pane.isVisibleInWindow should be YES');
	ok(pane.$().hasClass('sc-alert-panel'), 'pane should have sc-alert-panel class');
	ok(pane.childViews[0].get('isVisibleInWindow'), 'pane.div.isVisibleInWindow should be YES');
	ok(pane.childViews[0].$().hasClass('sc-view'), 'pane.div should have sc-view class');
	ok(pane.childViews[0].childViews[0].get('isVisibleInWindow'), 'pane.div.info.isVisibleInWindow should be YES');
	ok(pane.childViews[0].childViews[0].$().hasClass('info'), 'pane.div.info should have info class');
	ok(pane.childViews[0].childViews[1].get('isVisibleInWindow'), 'pane.div.div.isVisibleInWindow should be YES');

	// content
	ok(pane.childViews[0].childViews[0].$('img'), 'pane.div.info.img existance should be YES');
	ok(pane.childViews[0].childViews[0].$('img').hasClass('icon'), 'pane.div.info.img should have icon class');
	ok(pane.childViews[0].childViews[0].$('img').hasClass('sc-icon-info-48'), 'pane.div.info.img should have sc-icon-alert-48 class');
	ok(pane.childViews[0].childViews[0].$('h1'), 'pane.div.info.h1 existance should be YES');
	equals(pane.childViews[0].childViews[0].$('h1').text(), 'AlertPanel.message', 'pane.div.info.h1 should have title');
	equals(pane.childViews[0].childViews[0].$('p').length, 0, 'pane.div.info should have 0 p');

	// buttons
	ok(pane.childViews[0].childViews[1].$('a'), 'pane.div.div.a existance should be YES');
	equals(pane.childViews[0].childViews[1].$('a').length, 2, 'pane.div.div should have 2 Buttons');
	ok(pane.childViews[0].childViews[1].childViews[0].$().hasClass('hidden'), 'pane.div.div 1st Button should should be hidden');
	equals(pane.childViews[0].childViews[1].childViews[1].$('span').text(), 'OK', 'pane.div.div 2nd Button should have default okButtonTitle');

	ok(pane.childViews[0].$('a'), 'pane.div.a existance should be YES');
	ok(pane.childViews[0].childViews[2].$().hasClass('hidden'), 'pane.div extra Button should should be hidden');

  pane.dismiss();
});

test("AlertPanel.info with icon, message and 3 buttons (passing null to optional description)", function() {
  pane = SC.AlertPanel.info("AlertPanel.message", null, "okButtonTitle", "cancelButtonTitle", 'extraButtonTitle', this);      

	// wrapper
	ok(pane.get('isVisibleInWindow'), 'pane.isVisibleInWindow should be YES');
	ok(pane.$().hasClass('sc-alert-panel'), 'pane should have sc-alert-panel class');
	ok(pane.childViews[0].get('isVisibleInWindow'), 'pane.div.isVisibleInWindow should be YES');
	ok(pane.childViews[0].$().hasClass('sc-view'), 'pane.div should have sc-view class');
	ok(pane.childViews[0].childViews[0].get('isVisibleInWindow'), 'pane.div.info.isVisibleInWindow should be YES');
	ok(pane.childViews[0].childViews[0].$().hasClass('info'), 'pane.div.info should have info class');
	ok(pane.childViews[0].childViews[1].get('isVisibleInWindow'), 'pane.div.div.isVisibleInWindow should be YES');

	// content
	ok(pane.childViews[0].childViews[0].$('img'), 'pane.div.info.img existance should be YES');
	ok(pane.childViews[0].childViews[0].$('img').hasClass('icon'), 'pane.div.info.img should have icon class');
	ok(pane.childViews[0].childViews[0].$('img').hasClass('sc-icon-info-48'), 'pane.div.info.img should have sc-icon-alert-48 class');
	ok(pane.childViews[0].childViews[0].$('h1'), 'pane.div.info.h1 existance should be YES');
	equals(pane.childViews[0].childViews[0].$('h1').text(), 'AlertPanel.message', 'pane.div.info.h1 should have title');
	equals(pane.childViews[0].childViews[0].$('p').length, 0, 'pane.div.info should have 0 p');

	// buttons
	ok(pane.childViews[0].childViews[1].$('a'), 'pane.div.div.a existance should be YES');
	equals(pane.childViews[0].childViews[1].$('a').length, 2, 'pane.div.div should have 2 Buttons');
	equals(pane.childViews[0].childViews[1].childViews[0].$('span').text(), 'cancelButtonTitle', 'pane.div.div 1st Button should have custom cancelButtonTitle');
	equals(pane.childViews[0].childViews[1].childViews[1].$('span').text(), 'okButtonTitle', 'pane.div.div 2nd Button should have custom okButtonTitle');

	ok(pane.childViews[0].$('a'), 'pane.div.a existance should be YES');
	equals(pane.childViews[0].childViews[2].$('span').text(), 'extraButtonTitle', 'pane.div extra Button should have custom extraButtonTitle');

  pane.dismiss();
});

test("AlertPanel.info with icon, message, description and 1 button (passing null to 3 buttons)", function() {
  pane = SC.AlertPanel.info("AlertPanel.message", 'AlertPanel.description', null, null, null, this);      

	// wrapper
	ok(pane.get('isVisibleInWindow'), 'pane.isVisibleInWindow should be YES');
	ok(pane.$().hasClass('sc-alert-panel'), 'pane should have sc-alert-panel class');
	ok(pane.childViews[0].get('isVisibleInWindow'), 'pane.div.isVisibleInWindow should be YES');
	ok(pane.childViews[0].$().hasClass('sc-view'), 'pane.div should have sc-view class');
	ok(pane.childViews[0].childViews[0].get('isVisibleInWindow'), 'pane.div.info.isVisibleInWindow should be YES');
	ok(pane.childViews[0].childViews[0].$().hasClass('info'), 'pane.div.info should have info class');
	ok(pane.childViews[0].childViews[1].get('isVisibleInWindow'), 'pane.div.div.isVisibleInWindow should be YES');

	// content
	ok(pane.childViews[0].childViews[0].$('img'), 'pane.div.info.img existance should be YES');
	ok(pane.childViews[0].childViews[0].$('img').hasClass('icon'), 'pane.div.info.img should have icon class');
	ok(pane.childViews[0].childViews[0].$('img').hasClass('sc-icon-info-48'), 'pane.div.info.img should have sc-icon-alert-48 class');
	ok(pane.childViews[0].childViews[0].$('h1'), 'pane.div.info.h1 existance should be YES');
	equals(pane.childViews[0].childViews[0].$('h1').text(), 'AlertPanel.message', 'pane.div.info.h1 should have title');
	ok(pane.childViews[0].childViews[0].$('p'), 'pane.div.info.p existance should be YES');
	equals(pane.childViews[0].childViews[0].$('p').text(), 'AlertPanel.description', 'pane.div.info.p should have description');

	// buttons
	ok(pane.childViews[0].childViews[1].$('a'), 'pane.div.div.a existance should be YES');
	equals(pane.childViews[0].childViews[1].$('a').length, 2, 'pane.div.div should have 2 Buttons');
	ok(pane.childViews[0].childViews[1].childViews[0].$().hasClass('hidden'), 'pane.div.div 1st Button should should be hidden');
	equals(pane.childViews[0].childViews[1].childViews[1].$('span').text(), 'OK', 'pane.div.div 2nd Button should have default okButtonTitle');

	ok(pane.childViews[0].$('a'), 'pane.div.a existance should be YES');
	ok(pane.childViews[0].childViews[2].$().hasClass('hidden'), 'pane.div extra Button should should be hidden');

  pane.dismiss();
});

test("users interaction with mutiple alert panels with 1-3 buttons", function() {
  
  var delegate = SC.Object.create({
    
    threeButtonAlertPanel: function() {
      pane = SC.AlertPanel.warn("AlertPanel.warn title", 'Click OK to see this alert panel again. Click Other... to see other alert panels.  \nClick cancel to dismiss.', "OK", "Cancel", 'Other...', this);      
    },

    twoButtonAlertPanel: function() {
      pane = SC.AlertPanel.error("AlertPanel.error title", 'Click OK to see one button alert panel.  \nClick cancel to dismiss.', "OK", "Cancel", delegate);      
    },

    oneButtonAlertPanel: function() {
      pane = SC.AlertPanel.info("AlertPanel.info title", 'Click OK to dismiss.', delegate);      
    },
   
    alertPanelDidDismiss: function(alert, status) {
      console.log("%@.alertDidDismiss - %@".fmt(alert, status));
      switch(status) {
        case SC.OK_STATUS:
          if(alert.icon && alert.icon.indexOf('alert')!=-1) this.invokeLater(this.threeButtonAlertPanel, 1000);
          if(alert.icon && alert.icon.indexOf('error')!=-1) this.oneButtonAlertPanel();
          break;
        case SC.EXTRA_STATUS:
          this.twoButtonAlertPanel();
          break;
      }
    }
  });

  SC.RunLoop.begin();
  delegate.threeButtonAlertPanel();
  SC.RunLoop.end();
}) ;
