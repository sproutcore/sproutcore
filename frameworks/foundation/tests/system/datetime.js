// ==========================================================================
// Project:   DateTime Unit Test
// Copyright: ©2009 Martin Ottenwaelter
// ==========================================================================
/*globals module test ok equals same stop start */

module('Time');

var ms, options, dt;

module("SC.DateTime", {
  setup: function() {
    ms = 484354822925;
    options = {year: 1985, month: 5, day: 8, hour: 1, minute: 0, second: 22, millisecond: 925};
    dt = SC.DateTime.create(options);
  },
  teardown: function() {
    delete ms;
    delete options;
    delete dt;
  }
});

function timeShouldBeEqualToHash(t, h) {
  if (h === undefined) h = testHash;
  
  equals(t.get('year'), h.year);
  equals(t.get('month'), h.month);
  equals(t.get('day'), h.day);
  equals(t.get('hour'), h.hour);
  equals(t.get('minute'), h.minute);
  equals(t.get('second'), h.second);
  equals(t.get('millisecond'), h.millisecond);
}

test('create', function() {
  timeShouldBeEqualToHash(dt, options);
});

test('create', function() {
  var x = SC.DateTime.create(ms);
  timeShouldBeEqualToHash(x, options);
});

test('adjust', function() {
  timeShouldBeEqualToHash(dt.adjust({year: 2005}), {year: 2005, month: 5, day:  8, hour: 1, minute: 0, second: 22, millisecond: 925});
  timeShouldBeEqualToHash(dt.adjust({month:   9}), {year: 1985, month: 9, day:  8, hour: 1, minute: 0, second: 22, millisecond: 925});
  timeShouldBeEqualToHash(dt.adjust({day:    31}), {year: 1985, month: 5, day: 31, hour: 1, minute: 0, second: 22, millisecond: 925});
  timeShouldBeEqualToHash(dt.adjust({hour:    3}), {year: 1985, month: 5, day:  8, hour: 3, minute: 0, second:  0, millisecond:   0});
  timeShouldBeEqualToHash(dt.adjust({minute:  1}), {year: 1985, month: 5, day:  8, hour: 1, minute: 1, second:  0, millisecond:   0});
  timeShouldBeEqualToHash(dt.adjust({second: 30}), {year: 1985, month: 5, day:  8, hour: 1, minute: 0, second: 30, millisecond:   0});
});

test('advance', function() {
  var t = dt.advance({year: 1, month: 1, day: 1, hour: 1, minute: 1, second: 1, millisecond: 1});
  timeShouldBeEqualToHash(t, {year: 1986, month: 6, day: 9, hour: 2, minute: 1, second: 23, millisecond: 926});
});

test('compare', function() {  
  equals(SC.DateTime.compare(dt, dt), 0);
  equals(SC.DateTime.compare(dt, dt.advance({hour: 1})), -1);
  equals(SC.DateTime.compare(dt.advance({hour: 1}), dt), 1);
  equals(SC.DateTime.compareDate(dt, dt.advance({hour: 1})), 0);
  equals(SC.DateTime.compareDate(dt, dt.adjust({hour: 0}).advance({day: 1, second: -1})), 0);
  equals(SC.DateTime.compareDate(dt, dt.adjust({hour: 0}).advance({day: 1})), -1);
  equals(SC.DateTime.compareDate(dt, dt.advance({day: 1})), -1);
});

test('Format', function() {
  equals(
    dt.toFormattedString('%a %A %b %B %d %H %I %j %m %M %p %S %w %y %Y %%a'),
    'Wed Wednesday May May 08 01 01 128 05 00 AM 22 3 85 1985 %a');
});

test('fancy getters', function() {
  equals(dt.get('isLeapYear'), NO);
  equals(SC.DateTime.create({year: 1900}).get('isLeapYear'), NO);
  equals(SC.DateTime.create({year: 2000}).get('isLeapYear'), YES);
  equals(SC.DateTime.create({year: 2004}).get('isLeapYear'), YES);
  
  equals(dt.get('daysInMonth'), 31);
  equals(SC.DateTime.create({year: 2000, month: 2}).get('daysInMonth'), 29);
  equals(SC.DateTime.create({year: 2001, month: 2}).get('daysInMonth'), 28);
  
  equals(dt.get('dayOfYear'), 128);
  equals(SC.DateTime.create({year: 2000, month: 12, day: 31}).get('dayOfYear'), 366);
  equals(SC.DateTime.create({year: 2001, month: 12, day: 31}).get('dayOfYear'), 365);
  
  equals(dt.get('week'), 18);
  equals(SC.DateTime.create({year: 2006, month:  1, day:  1}).get('week0'),  1);
  equals(SC.DateTime.create({year: 2006, month:  1, day:  1}).get('week1'),  0);
  equals(SC.DateTime.create({year: 2006, month:  1, day:  8}).get('week0'),  2);
  equals(SC.DateTime.create({year: 2006, month:  1, day:  8}).get('week1'),  1);
  equals(SC.DateTime.create({year: 2006, month: 12, day: 31}).get('week0'), 53);
  equals(SC.DateTime.create({year: 2006, month: 12, day: 31}).get('week1'), 52);
  
  equals(dt.get('lastMonday'), dt.advance({day: -2}).adjust({hour: 0}));
  equals(dt.get('nextFriday'), dt.advance({day:  2}).adjust({hour: 0}));
  equals(dt.get('lastWednesday'), dt.advance({day: -7}).adjust({hour: 0}));
});

test('parse', function() {
  timeShouldBeEqualToHash(
    SC.DateTime.parse('08/05/1985 01:00:22 %a', '%d/%m/%Y %H:%M:%S %%a'),
    {year: 1985, month: 5, day: 8, hour: 1, minute: 0, second: 22, millisecond: 0});
  timeShouldBeEqualToHash(
    SC.DateTime.parse('08/05/1985 01:00:22 PM', '%d/%m/%Y %H:%M:%S %p'),
    {year: 1985, month: 5, day: 8, hour: 13, minute: 0, second: 22, millisecond: 0}); 
  timeShouldBeEqualToHash(
    SC.DateTime.parse('Wed 08 May 1985 01:00:22 AM', '%a %d %b %Y %H:%M:%S %p'),
    {year: 1985, month: 5, day: 8, hour: 1, minute: 0, second: 22, millisecond: 0});
  ok(
    SC.DateTime.parse('Tue 08 May 1985 01:00:22 AM', '%a %d %b %Y %H:%M:%S %p')
    === null, '1985-05-08 is not a tuesday');
  timeShouldBeEqualToHash(
    SC.DateTime.parse('70-01-01 00:00:00', '%y-%m-%d %H:%M:%S'),
    {year: 2070, month: 1, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0}); 
  timeShouldBeEqualToHash(
    SC.DateTime.parse('71-01-01 00:00:00', '%y-%m-%d %H:%M:%S'),
    {year: 1971, month: 1, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0});
});

test('binding', function() {
  var fromObject = SC.Object.create({value: dt});
  var toObject = SC.Object.create({value: ''});
  var binding = SC.Binding.dateTime('%Y-%m-%d %H:%M:%S').from('value', fromObject).to('value', toObject).connect();
  SC.Binding.flushPendingChanges();
  equals(toObject.get('value'), '1985-05-08 01:00:22');
});
