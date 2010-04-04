// ==========================================================================
// Project:   TestControls
// ==========================================================================
/*globals TestControls */

TestControls.main = function main() {
  TestControls.getPath('mainPage.mainPane').append() ;
  TestControls.categoriesController.set("content", TestControls.rootCategory);
} ;

function main() { TestControls.main(); }
