SC.CheckboxSupport = {
  didCreateLayer: function() {
    this.$('input').change(jQuery.proxy(function() {
      this.notifyPropertyChange('value');
    }, this));
  },

  value: function() {
    return this.$('input').attr('checked');
  }.property()
};

