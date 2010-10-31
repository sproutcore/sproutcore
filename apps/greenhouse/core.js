// ==========================================================================
// Project:   Greenhouse
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

//better default state name...
SC.DEFAULT_TREE = 'main';

/** @namespace

  My cool new app.  Describe your application.
  
  @extends SC.Object
*/
Greenhouse = SC.Object.create( SC.StatechartManager,
  /** @scope Greenhouse.prototype */ {

  NAMESPACE: 'Greenhouse',
  VERSION: '0.1.0',
  
  /*
    types fom json
  */
  FILE: 'file',
  DIR: 'dir',
  
  store: SC.Store.create().from('Greenhouse.DataSource'),
  
  //statechart options
  log: YES,
  
  startOnInit: NO,
    
  loadIframeWithPage: function(firstTime){
    var c = Greenhouse.fileController.get('content'), iframe = Greenhouse.get('iframe'), namespace, page;
    var r = c.get('pageRegex'), mainPane;
    namespace = r[1];
    page = r[2];
    
  
    if(namespace && page && iframe){
      if(iframe[namespace] && !iframe[namespace][page]) iframe.eval(c.get('body'));
      
      //just change main view for now...
      namespace = iframe[namespace];
      //setup the designer container
      if(firstTime){
        mainPane = iframe.SC.designPage.get('designMainPane');
        mainPane.append();
      }

      //get the designs...
      namespace[page].set('needsDesigner', YES);
      this.pageController.set('content', namespace[page]);
      
      
      iframe.SC.RunLoop.begin();
      if(!firstTime) iframe.SC.designController.set('content', null);
      iframe.SC.designsController.setDesigns(namespace[page],iframe);
      iframe.SC.designPage.designMainPane.viewList.contentView.set('content', Greenhouse.iframe.SC.designsController.get('content'));
      iframe.SC.RunLoop.end();
    }
  }
});
