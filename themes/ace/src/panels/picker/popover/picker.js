require("src/panels/picker/popover/popover");

SC.AceTheme.Popover.renderers.Picker = SC.EmptyTheme.renderers.Picker.extend({
  render: function(context) {
    if (this.contentProvider) this.contentProvider.renderContent(context);
    context.addClass(this.pointerPos);
  },
  
  update: function() {
    this.$().addClass(this.pointerPos);
  }
});

SC.AceTheme.Popover.renderers.picker = SC.AceTheme.Popover.renderers.Picker.create();