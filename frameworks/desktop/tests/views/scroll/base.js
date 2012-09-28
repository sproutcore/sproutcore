module('SC.ScrollView base tests');

test('creating scroll view creates view properties.', function() {
  var sv = SC.ScrollView.create();
  ok(sv.get('containerView'), 'containerView exists.');
  ok(sv.get('horizontalScrollerView'), 'horizontalScrollerView exists.');
  ok(sv.get('verticalScrollerView'), 'verticalScrollerView exists.');
});

test('destroying scroll view clears view properties and foreign references.', function() {
  var sv = SC.ScrollView.create(),
      guid = SC.guidFor(sv);
  sv.destroy();
  ok(sv.get('isDestroyed'), 'destroying ScrollView destroys scroll view.');
  ok(!sv.get('containerView'), 'destroying ScrollView removes reference to containerView.');
  ok(!sv.get('horizontalScrollerView'), 'destroying ScrollView removes reference to horizontalScrollerView.');
  ok(!sv.get('verticalScrollerView'), 'destroying ScrollView removes reference to verticalScrollerView.');
  ok(!sv._scroll_contentView, 'destroying ScrollView removes internal reference to content view.');
  ok(!SC.Drag._scrollableViews[guid], 'destroying scroll view removes scrollable view reference from SC.Drag list.');
});
