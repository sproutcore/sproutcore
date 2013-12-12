// ========================================================================
// SC.DatePickerView Tests
// ========================================================================


/* Test SC.DatePicker */

var pane = SC.ControlTestPane.design()
  .add("basic,default", SC.DatePickerView, {
    layout: {width: 305, height: 298},
  })
  .add("basic", SC.DatePickerView, {
    layout: {width: 305, height: 298},
    value: SC.DateTime.create(),
    displayFromDate: SC.DateTime.create()
  });

var now = SC.DateTime.create();
  
pane.show(); // add a test to show the test pane
window.pane = pane ;

// ..........................................................
// BASIC TESTS
// 
module("Basic init", pane.standardSetup());

test("Proper default start-on date", function() {
  var view = pane.view('basic,default');
  equals(view.getPath('displayFromDate.day'), 1, 'basic,default start on date is the 1st');
});

test("Changing value", function() {
  var view = pane.view('basic');
  ok(view.get('value'), 'basic calendar has a value');
  equals(view.getPath('value.day'), now.get('day'), 'basic,default begins with correct date');
  SC.run(function() {
    view.set('value', SC.DateTime.create({ day: now.get('day') + 2 }));
    equals(view.getPath('value.day'), (now.get('day') + 2) % view.getPath('value.daysInMonth'), 'Verify that value has changed');
    view.selectToday();
    equals(view.getPath('value.day'), now.get('day'), 'Calling selectToday method causes today to be selected');
  });
});

test("Changing view date", function() {
  var view = pane.view('basic');
  equals(view.getPath('value.day'), now.get('day'), 'basic,default begins with correct date');
  SC.run(function() {
    view.set('displayFromDate', SC.DateTime.create({ month: now.get('month') + 1 }));
    equals(view.getPath('displayFromDate.month'), (now.get('month') + 1) % 12, 'Verify that visible month has changed');
    view.showSelectedDate();
    equals(view.getPath('displayFromDate.month'), now.get('month'), 'Calling showSelectedDate method returns view to current month');
  });
});
