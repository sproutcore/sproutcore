// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test Sample */
var page, page2, testView, design;


module('SC.DesignCoder', {
  setup: function () {
    page = SC.Page.design({});
    testView = SC.View.extend({});
    testView.Designer = SC.ViewDesigner.extend({
      designProperties: 's n b a h'.w()
    });
    
    
    page2 = SC.Page.create({
      needsDesigner: true,
      mainView: testView.design({s:'string',n:12,b:false,a:[1, 2, 3],h:{a:'b',c:'d'}})
    });
    
  },

  teardown: function () {
  }
});

test('Verify basic page file encoding', function () {
  design = SC.DesignCoder.encode(page);
  equals(design.trim(), 'SC.Page.design({})', 'basic page encoded');
});

test('Verify view in page encoding', function () {
  page2.awake();
  design = SC.DesignCoder.encode(page2);
  equals(design.trim(),'SC.Page.design({mainView: SC.View.design({s: "string",n: 12,b: false,a: [1,2,3],h: {"a": "b","c": "d"}})})', 'basic types encoded');  
});
