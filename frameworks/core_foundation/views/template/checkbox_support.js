SC.CheckboxSupport = {
  didCreateLayer: function() {
    this.$('input').change(jQuery.proxy(function() {
      SC.RunLoop.begin();
      this.notifyPropertyChange('value');
      SC.RunLoop.end();
    }, this));
  },

  value: function(key, value) {
    if (value !== undefined) {
      this.$('input').attr('checked', value);
    } else {
      value = this.$('input').attr('checked');
    }

    return value;
  }.property().idempotent()
};

