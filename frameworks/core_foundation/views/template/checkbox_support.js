SC.CheckboxSupport = {
  didCreateLayer: function() {
    this.$('input').change(jQuery.proxy(function() {
      SC.RunLoop.begin();
      this.notifyPropertyChange('value');
      SC.RunLoop.end();
    }, this));
  },

  value: function() {
    return this.$('input').attr('checked');
  }.property()
};

