// ========================================================================
// SC.normalizeURL Tests
// ========================================================================

var url,url1,url2;

module("SC.normalizeURL");

test("should normalize the url passed as the parameter",function(){
 url = '/desktop/mydocuments/music';
 equals(SC.normalizeURL(url), 'http://'+window.location.host+'/desktop/mydocuments/music','Path with slash');

 url1 = 'desktop/mydocuments/music';
 equals(SC.normalizeURL(url1), '%@/desktop/mydocuments/music'.fmt(window.location.href),'Path without slash');

 url2 = 'http:';
 equals(YES,SC.normalizeURL(url2) === url2,'Path with http:');
});
