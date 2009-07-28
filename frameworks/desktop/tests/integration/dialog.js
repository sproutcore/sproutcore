// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same htmlbody */

module("A dialog with some basic controls and buttons");

var pane ;
test("adding dialog to screen", function() {

  
  var delegate = SC.Object.create({
    
    couldNotSend: function() {
      pane = SC.AlertPane.warn("Email could not be sent", 'There might be a problem with the server or with your internet connection.  Try again in a few minutes.', "Try Again", "Cancel", 'Report Problem...', this);      
    },
    
    showMoreInfo: function() {
      pane = SC.AlertPane.info("Sending Email", "Sometimes email doesn't make it.  It's a fact of life.  We all love email, but hey that's how it goes.  \nAnyway, the nice thing is that we can provide this helpful dialog message, with multiple paragraphs and everything because of SproutCore.\nEmail is OK, AlertPanes are great. So just deal m'kay?  Bye bye.", delegate);
    },
    
    alertPaneDidDismiss: function(alert, status) {
      //console.log("%@.alertDidDismiss - %@".fmt(alert, status));
      switch(status) {
        case SC.OK_STATUS:
          this.invokeLater(this.couldNotSend, 1000);
          break;
        case SC.EXTRA_STATUS:
          this.showMoreInfo();
          break;
      }
    }
  });

  SC.RunLoop.begin();
  delegate.couldNotSend();
  SC.RunLoop.end();
}) ;

