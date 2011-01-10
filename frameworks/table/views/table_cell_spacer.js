SC.TableCellSpacerView = SC.View.extend(SC.Control, {
	useFactory: YES,
  classNames: ['sc-table-cell', 'sc-table-cell-spacer'],

  render: function(context, firstTime) {
		var classArray = [];
    // add alternating row classes
    classArray.push((this.get('contentIndex')%2 === 0) ? 'even' : 'odd');
    context.setClass('disabled', !this.get('isEnabled'));
    context.addClass(classArray);
  }
});
