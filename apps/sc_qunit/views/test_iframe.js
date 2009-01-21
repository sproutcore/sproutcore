// ==========================================================================
// QUnit.TestIFrameView
// ==========================================================================

QUnit.TEST_NONE    = 'none' ;
QUnit.TEST_LOADING = 'loading' ;
QUnit.TEST_RUNNING = 'running' ;
QUnit.TEST_PASSED  = 'passed'  ;
QUnit.TEST_FAILED  = 'failed'  ;

QUnit.TestIFrameView = SC.IFrameView.extend({
  
  // This will automatically change to reflect the current load state.
  state: QUnit.TEST_NONE,
  
  // delegate method
  iFrameViewDidLoadUrl: function(view, url) {
    console.log('iFrameViewDidLoadUrl called on %@'.fmt(this));
    this.set('state', url ? QUnit.TEST_LOADING : QUnit.TEST_NONE) ;
    // this.checkState() ; // FIXME: does not work with qUnit
  },
  
  // this can be called periodically to update the current test state,
  // possibly rescheduling itself.
  checkState: function() {
    var iFrame = this.$iframe() ;
    var doc = iFrame.attr('contentDocument') ;
    
    var queuedTests = (doc) ? doc.queuedTests : null ;
    var testStatus = (doc) ? doc.testStatus : null ;
    var status = QUnit.TEST_NONE ;
    var reschedule = true ;
    
    if (!doc || (queuedTests === null) || doc.testExpired) {
      status = (iFrame.attr('src')) ? QUnit.TEST_LOADING : QUnit.TEST_NONE;
      
    // tests have finished running.
    } else if (queuedTests === 0) {
      status = (testStatus != 'SUCCESS') ? QUnit.TEST_FAILED : QUnit.TEST_PASSED ;
      reschedule = false ;
      
    // test still need to run?
    } else {
      status = ((testStatus != 'FAILED') && (testStatus != 'ERROR')) ? QUnit.TEST_RUNNING : QUnit.TEST_FAILED ;
      if (status == QUnit.TEST_FAILED) reschedule = false ;
    }
    
    if (this.get('state') != status) this.set('state', status) ;
    if (reschedule) this.invokeLater(this.checkState,100) ;
  }
  
});
