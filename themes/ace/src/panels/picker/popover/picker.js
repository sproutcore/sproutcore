require("src/panels/picker/popover/popover");

SC.AceTheme.Popover.Picker = SC.BaseTheme.Picker.extend({
  name: 'picker',
  render: function(context) {
    if (this.contentProvider) this.contentProvider.renderContent(context);
    context.addClass(this.pointerPos);
  },
  
  update: function(cq) {
    cq.addClass(this.pointerPos);
  }
});

SC.AceTheme.Popover.addRenderer(SC.AceTheme.Popover.Picker);
