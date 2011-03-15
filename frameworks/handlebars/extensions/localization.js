sc_require('extensions');

Handlebars.registerHelper('loc', function(property) {
  return property.loc();
});
