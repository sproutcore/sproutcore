
var pane = SC.ControlTestPane.design({height:24})
  .add("iconchange", SC.ImageButtonView, {
    layout: { left: 0, top: 2, right: 0, bottom: 2 },
    image: 'start'
  });

pane.show();

module('SC.ImageButtonView ui');

test("Check if icon class is set properly on ImageButton",function(){
  var viewElem=pane.view('iconchange').$('div');
  console.error(viewElem[0]);
  ok(viewElem.hasClass('start'), 'Icon class set initially to "start"');
});

test("Check if icon class is set properly on ImageButton if changed", function(){
  SC.RunLoop.begin();
  var viewElem = pane.view('iconchange');
  viewElem.set('image','stop');
  SC.RunLoop.end(); // force redraw...
  var newViewElem = pane.view('iconchange').$('div');
  ok(newViewElem.hasClass('stop'), 'Icon class has correctly changed to "stop"');
});
