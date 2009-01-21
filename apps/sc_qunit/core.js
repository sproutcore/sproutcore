// ==========================================================================
// QUnit
// ==========================================================================

QUnit = SC.Object.create({
  
  // This will create the server for your application.  Add any namespaces
  // your model objects are defined in to the prefix array.
  server: SC.Server.create({ prefix: ['QUnit'] }),
  
  // When you are in development mode, this array will be populated with 
  // any fixtures you create for testing and loaded automatically in your
  // main method.  When in production, this will be an empty array.
  FIXTURES: []
  
});
