// ========================================================================
// SC.routes Base Tests
// ========================================================================
/*globals module test ok isObj equals expects */

var imgUrl,obj;
module("SC.routes", {
  
  setup: function() {
    
	url = sc_static("file_exists.json"); 
    request = SC.Request.getUrl(url) ;
		
	obj = SC.Object.create({			
		name:'Test SproutCore',
		imageDidLoad:function(){
		 this.name = 'SproutCore';
		}
	});
  },
  
  teardown: function() {

  }
  
});

// test("adding routes ", function() {
//  SC.routes.add(':', obj, 'imageDidLoad');
//  request.send() ;
// });


