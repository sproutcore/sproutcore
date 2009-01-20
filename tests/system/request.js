Test.context("requesttest", {
  
    "Test Asynchronous GET Request": function() {
        var url = static_url("file_exists.json");
        assertNotEqual("", url);    

        var request = SC.Request.getUrl(url);
        assertNotNull(request);
        
        var contents = null;
        request.addObserver("response", function(response){
            contents = request.get("response");
        });

        request.send();
        
        var self = this;
        this.wait(1000,
            function(){ with(self){
                assertNotNull(contents);
                assertEqual('{"message": "Yay!"}', contents);            
            } }
        );
    },

    "Test Synchronous GET Request": function() {
      var url = static_url("file_exists.json");
      assertNotEqual("", url);    

      var request = SC.Request.getUrl(url);
      assertNotNull(request);

      request.set("isAsynchronous", false);

      request.send();
      
      var contents = request.get("response");

      assertNotNull(contents);
      assertEqual('{"message": "Yay!"}', contents);
    },

    "Test Asynchronous GET Request, auto-deserializing JSON": function(){
        var url = static_url("file_exists.json");
        assertNotEqual("", url);    

        var request = SC.Request.getUrl(url);
        assertNotNull(request);
        
        request.set("isJSON", true);

        var contents = null;
        request.addObserver("response", function(response){
            contents = request.get("response");
        });

        request.send();
        
        var self = this;
        this.wait(1000,function(){with(self){
            assertNotNull(contents);
            if(contents != null){
                assertEqual("Yay!",contents["message"])
            }
        }});
    },
    "Test Synchronous GET Request, auto-deserializing JSON": function() {
      var url = static_url("file_exists.json");
      assertNotEqual("", url);    

      var request = SC.Request.getUrl(url);
      assertNotNull(request);

      request.set("isAsynchronous", false);
      request.set("isJSON", true);

      request.send();
      
      var contents = request.get("response");
      
      assertNotNull(contents);
      if(contents != null){
          assertEqual("Yay!",contents["message"])
      }
    }  
});
