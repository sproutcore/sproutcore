// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start Q$ */


var pane, view;

module("SC.View#didAppendToDocument");

test("Check that didAppendToDocument gets called at the right moment", function() {
   var counter=0;
   pane = SC.MainPane.create({
     childViews: [
       SC.View.extend({
         render: function (context, firstTime) {
           context.push('new string');
         },
         didAppendToDocument: function(){
           counter++;
         }
       })
     ]
   });
   equals(counter, 0, "");
   pane.append(); // make sure there is a layer...
   equals(counter, 1, "");
   view  = pane.childViews[0];
   view.displayDidChange();
   SC.RunLoop.begin().end();
   equals(counter, 2, "");  
 
   var additionalView = SC.View.extend({
     didAppendToDocument: function(){
       counter++;
     }
   });
   additionalView = additionalView.create();
   pane.appendChild(additionalView);
 
   SC.RunLoop.begin().end();
   equals(counter, 3, "");  
   pane.remove();
});
