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
   equals(counter, 0, "precond - has not been called yet");
   pane.append(); // make sure there is a layer...
   equals(counter, 1, "didAppendToDocument was called once");
   view  = pane.childViews[0];

   SC.run(function() {
     view.updateLayer();
   });

   equals(counter, 2, "didAppendToDocument is called every time a new DOM element is created");

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
