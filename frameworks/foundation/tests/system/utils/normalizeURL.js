// ========================================================================
// SC.normalizeURL Tests
// ========================================================================

var url,url1,url2;

module("SC.normalizeURL");

test("should normalize the url passed as the parameter",function(){
 url = '/desktop/mydocuments/music';
 equals(YES,SC.normalizeURL(url) === 'http://localhost:4020/desktop/mydocuments/music','Path with slash');
 
 url1 = 'desktop/mydocuments/music';
 equals(YES,SC.normalizeURL(url1) === 'http://localhost:4020/sproutcore/foundation/en/tests.html/desktop/mydocuments/music','Path without slash');  

 url2 = 'http:';
 equals(YES,SC.normalizeURL(url2) === url2,'Path with http:');	
});