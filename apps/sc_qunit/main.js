// ==========================================================================
// QUnit
// ==========================================================================

function main() {
  var indexRoot = window.location.pathname.toString().replace(/-tests\/.*/,'-tests').substr(1,window.location.pathname.length) ;
  var clientName = indexRoot.match(/([^\/]+)\/-tests/)[1] ;
  var urlRoot = 'static/%@'.fmt(indexRoot) ;
  // console.log('indexRoot: %@ clientName: %@ urlRoot: %@'.fmt( indexRoot, clientName, urlRoot));
  
  QUnit.runnerController.set('selection',[]) ;
  QUnit.runnerController.set('urlRoot', urlRoot) ;
  QUnit.runnerController.set('indexRoot', indexRoot) ;
  QUnit.runnerController.set('clientName', clientName) ;
  QUnit.runnerController.reloadTests() ;
  
  QUnit.getPath('bodyPage.mainPane').append() ;
};
