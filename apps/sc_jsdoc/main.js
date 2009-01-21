// ==========================================================================
// JsDoc
// ==========================================================================

function main() {
  
  // SproutCore loads the files from a pre-generated location unlike when
  // this apps runs on your local box, hence this logic.
  if (window.location.hostname.toString().indexOf('sproutcore.com') >= 0) {
    var clientRoot = 'sproutcore/-docs' ;
    var clientName = 'sproutcore' ;   
    var canRebuild = NO ; 
  } else {
    var clientRoot = window.location.pathname.toString().replace(/-docs\/.*/,'-docs').substr(1,window.location.pathname.length);
    var clientName = clientRoot.match(/([^\/]+)\/-docs/)[1];
    var canRebuild = YES ; 
  }
  console.log('clientRoot: %@ clientName: %@ canRebuild: %@'.fmt(clientRoot, clientName, canRebuild));
  
  JsDoc.docsController.set('selection',[]) ;
  JsDoc.docsController.set('clientRoot', clientRoot) ;
  JsDoc.docsController.set('clientName', clientName) ;
  JsDoc.docsController.set('canRebuild', canRebuild) ;
  JsDoc.docsController.reloadJsDoc() ;
  
  JsDoc.getPath('bodyPage.mainPane').append() ;
};
