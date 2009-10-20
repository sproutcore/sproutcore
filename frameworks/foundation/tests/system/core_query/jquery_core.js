// ========================================================================
// CoreQuery Tests
// ========================================================================

/*
  This test file incorporates most of the changes that come bundled with the
  jQuery-core suite of tests, modified to fit CoreQuery's reduced API.
  
  You should be able to update most of these tests with updated versons of the
  same tests in jQuery.
*/

htmlbody('<!-- Test Styles -->\
<style>\
body, div, h1 { font-family: "trebuchet ms", verdana, arial; margin: 0; padding: 0 }\
body {font-size: 10pt; }\
h1 { padding: 15px; font-size: large; background-color: #06b; color: white; }\
h1 a { color: white; }\
h2 { padding: 10px; background-color: #eee; color: black; margin: 0; font-size: small; font-weight: normal }\
\
.pass { color: green; } \
.fail { color: red; } \
p.result { margin-left: 1em; }\
\
#banner { height: 2em; border-bottom: 1px solid white; }\
h2.pass { background-color: green; }\
h2.fail { background-color: red; }\
\
div.testrunner-toolbar { background: #eee; border-top: 1px solid black; padding: 10px; }\
\
ol#tests > li > strong { cursor:pointer; }\
\
div#fx-tests h4 {\
	background: red;\
}\
\
div#fx-tests h4.pass {\
	background: green;\
}\
\
div#fx-tests div.box {\
	background: red url(data/cow.jpg) no-repeat;\
	overflow: hidden;\
	border: 2px solid #000;\
}\
\
div#fx-tests div.overflow {\
	overflow: visible;\
}\
\
div.inline {\
	display: inline;\
}\
\
div.autoheight {\
	height: auto;\
}\
\
div.autowidth {\
	width: auto;\
}\
\
div.autoopacity {\
	opacity: auto;\
}\
\
div.largewidth {\
	width: 100px;\
}\
\
div.largeheight {\
	height: 100px;\
}\
\
div.largeopacity {\
	filter: progid:DXImageTransform.Microsoft.Alpha(opacity=100);\
}\
\
div.medwidth {\
	width: 50px;\
}\
\
div.medheight {\
	height: 50px;\
}\
\
div.medopacity {\
	opacity: 0.5;\
	filter: progid:DXImageTransform.Microsoft.Alpha(opacity=50);\
}\
\
div.nowidth {\
	width: 0px;\
}\
\
div.noheight {\
	height: 0px;\
}\
\
div.noopacity {\
	opacity: 0;\
	filter: progid:DXImageTransform.Microsoft.Alpha(opacity=0);\
}\
\
div.hidden {\
	display: none;\
}\
\
div#fx-tests div.widewidth {\
	background-repeat: repeat-x;\
}\
\
div#fx-tests div.wideheight {\
	background-repeat: repeat-y;\
}\
\
div#fx-tests div.widewidth.wideheight {\
	background-repeat: repeat;\
}\
\
div#fx-tests div.noback {\
	background-image: none;\
}\
\
div.chain, div.chain div { width: 100px; height: 20px; position: relative; float: left; }\
div.chain div { position: absolute; top: 0px; left: 0px; }\
\
div.chain.test { background: red; }\
div.chain.test div { background: green; }\
\
div.chain.out { background: green; }\
div.chain.out div { background: red; display: none; }\
\
div#show-tests * { display: none; }\
</style>\
<!-- Test HTML -->\
<div id="nothiddendiv" style="height:1px;background:white;">\
	<div id="nothiddendivchild"></div>\
</div>\
<!-- this iframe is outside the #main so it won\'t reload constantly wasting time, but it means the tests must be "safe" and clean up after themselves -->\
<iframe id="loadediframe" name="loadediframe" style="display:none;" src="data/iframe.html"></iframe>\
<dl id="dl" style="display:none;">\
<div id="main" style="display: none;">\
	<p id="firstp">See <a id="simon1" href="http://simon.incutio.com/archive/2003/03/25/#getElementsBySelector" rel="bookmark">this blog entry</a> for more information.</p>\
	<p id="ap">\
		Here are some links in a normal paragraph: <a id="google" href="http://www.google.com/" title="Google!">Google</a>, \
		<a id="groups" href="http://groups.google.com/">Google Groups</a>. \
		This link has <code><a href="http://smin" id="anchor1">class="blog"</a></code>: \
		<a href="http://diveintomark.org/" class="blog" hreflang="en" id="mark">diveintomark</a>\
\
	</p>\
	<div id="foo">\
		<p id="sndp">Everything inside the red border is inside a div with <code>id="foo"</code>.</p>\
		<p lang="en" id="en">This is a normal link: <a id="yahoo" href="http://www.yahoo.com/" class="blogTest">Yahoo</a></p>\
		<p id="sap">This link has <code><a href="#2" id="anchor2">class="blog"</a></code>: <a href="http://simon.incutio.com/" class="blog link" id="simon">Simon Willison\'s Weblog</a></p>\
\
	</div>\
	<p id="first">Try them out:</p>\
	<ul id="firstUL"></ul>\
	<ol id="empty"></ol>\
	<form id="form" action="formaction">\
		<input type="text" name="action" value="Test" id="text1" maxlength="30"/>\
		<input type="text" name="text2" value="Test" id="text2" disabled="disabled"/>\
		<input type="radio" name="radio1" id="radio1" value="on"/>\
\
		<input type="radio" name="radio2" id="radio2" checked="checked"/>\
		<input type="checkbox" name="check" id="check1" checked="checked"/>\
		<input type="checkbox" id="check2" value="on"/>\
\
		<input type="hidden" name="hidden" id="hidden1"/>\
		<input type="text" style="display:none;" name="foo[bar]" id="hidden2"/>\
		\
		<input type="text" id="name" name="name" value="name" />\
		\
		<button id="button" name="button">Button</button>\
		\
		<textarea id="area1" maxlength="30">foobar</textarea>\
		\
		<select name="select1" id="select1">\
			<option id="option1a" class="emptyopt" value="">Nothing</option>\
			<option id="option1b" value="1">1</option>\
			<option id="option1c" value="2">2</option>\
			<option id="option1d" value="3">3</option>\
		</select>\
		<select name="select2" id="select2">\
			<option id="option2a" class="emptyopt" value="">Nothing</option>\
			<option id="option2b" value="1">1</option>\
			<option id="option2c" value="2">2</option>\
			<option id="option2d" selected="selected" value="3">3</option>\
		</select>\
		<select name="select3" id="select3" multiple="multiple">\
			<option id="option3a" class="emptyopt" value="">Nothing</option>\
			<option id="option3b" selected="selected" value="1">1</option>\
			<option id="option3c" selected="selected" value="2">2</option>\
			<option id="option3d" value="3">3</option>\
			<option id="option3e">no value</option>\
		</select>\
		\
		<object id="object1" codebase="stupid">\
			<param name="p1" value="x1" />\
			<param name="p2" value="x2" />\
		</object>\
		\
		<span id="台北Táiběi"></span>\
		<span id="台北" lang="中文"></span>\
		<span id="utf8class1" class="台北Táiběi 台北"></span>\
		<span id="utf8class2" class="台北"></span>\
		<span id="foo:bar" class="foo:bar"></span>\
		<span id="test.foo[5]bar" class="test.foo[5]bar"></span>\
		\
		<foo_bar id="foobar">test element</foo_bar>\
	</form>\
	<b id="floatTest">Float test.</b>\
	<iframe id="iframe" name="iframe"></iframe>\
	<form id="lengthtest">\
		<input type="text" id="length" name="test"/>\
		<input type="text" id="idTest" name="id"/>\
	</form>\
	<table id="table"></table>\
	\
	<div id="fx-queue">\
		<div id="fadein" class="chain test">fadeIn<div>fadeIn</div></div>\
		<div id="fadeout" class="chain test out">fadeOut<div>fadeOut</div></div>\
		\
		<div id="show" class="chain test">show<div>show</div></div>\
		<div id="hide" class="chain test out">hide<div>hide</div></div>\
		\
		<div id="togglein" class="chain test">togglein<div>togglein</div></div>\
		<div id="toggleout" class="chain test out">toggleout<div>toggleout</div> </div>\
	\
		\
		<div id="slideup" class="chain test">slideUp<div>slideUp</div></div>\
		<div id="slidedown" class="chain test out">slideDown<div>slideDown</div></div>\
		\
		<div id="slidetogglein" class="chain test">slideToggleIn<div>slideToggleIn</div></div>\
		<div id="slidetoggleout" class="chain test out">slideToggleOut<div>slideToggleOut</div></div>\
	</div>\
	\
	<div id="fx-tests"></div>\
\
	<form id="testForm" action="#" method="get">\
		<textarea name="T3" rows="2" cols="15">?\
Z</textarea>\
		<input type="hidden" name="H1" value="x" />\
		<input type="hidden" name="H2" />\
		<input name="PWD" type="password" value="" />\
		<input name="T1" type="text" />\
		<input name="T2" type="text" value="YES" readonly="readonly" />\
		<input type="checkbox" name="C1" value="1" />\
		<input type="checkbox" name="C2" />\
		<input type="radio" name="R1" value="1" />\
		<input type="radio" name="R1" value="2" />\
		<input type="text" name="My Name" value="me" />\
		<input type="reset" name="reset" value="NO" />\
		<select name="S1">\
			<option value="abc">ABC</option>\
			<option value="abc">ABC</option>\
			<option value="abc">ABC</option>\
		</select>\
		<select name="S2" multiple="multiple" size="3">\
			<option value="abc">ABC</option>\
			<option value="abc">ABC</option>\
			<option value="abc">ABC</option>\
		</select>\
		<select name="S3">\
			<option selected="selected">YES</option>\
		</select>\
		<select name="S4">\
			<option value="" selected="selected">NO</option>\
		</select>\
		<input type="submit" name="sub1" value="NO" />\
		<input type="submit" name="sub2" value="NO" />\
		<input type="image" name="sub3" value="NO" />\
		<button name="sub4" type="submit" value="NO">NO</button>\
		<input name="D1" type="text" value="NO" disabled="disabled" />\
		<input type="checkbox" checked="checked" disabled="disabled" name="D2" value="NO" />\
		<input type="radio" name="D3" value="NO" checked="checked" disabled="disabled" />\
		<select name="D4" disabled="disabled">\
			<option selected="selected" value="NO">NO</option>\
		</select>\
	</form>\
	<div id="moretests">\
		<form>\
			<div id="checkedtest" style="display:none;">\
				<input type="radio" class="radio" name="checkedtestradios" checked="checked"/>\
				<input type="radio" class="radio" name="checkedtestradios" value="on"/>\
				<input type="checkbox" class="checkbox" name="checkedtestcheckboxes" checked="checked"/>\
				<input type="checkbox" class="checkbox" name="checkedtestcheckboxes" />\
			</div>\
		</form>\
		<div id="nonnodes"><span>hi</span> there <!-- mon ami --></div>\
		<div id="t2037">\
			<div><div class="hidden">hidden</div></div>\
		</div>\
	</div>\
</div>\
</dl>') ;

module("CQ core");

test("Basic requirements", function() {
 expect(7);
 ok( Array.prototype.push, "Array.push()" );
 ok( Function.prototype.apply, "Function.apply()" );
 ok( document.getElementById, "getElementById" );
 ok( document.getElementsByTagName, "getElementsByTagName" );
 ok( RegExp, "RegExp" );
 ok( SC.CoreQuery, "SC.CoreQuery" );
 ok( SC.$, "SC.$" );
});

test("SC.CoreQuery()", function() {
 expect(8);

 var main = SC.$("#main");
 same( SC.$("div p", main).get(), q("sndp", "en", "sap"), "Basic selector with SC.$ object as context" );

 var code = SC.$("<code/>");
 equals( code.length, 1, "Correct number of elements generated for code" );
 var img = SC.$("<img/>");
 equals( img.length, 1, "Correct number of elements generated for img" );
 var div = SC.$("<div/><hr/><code/><b/>");
 equals( div.length, 4, "Correct number of elements generated for div hr code b" );

 // can actually yield more than one, when iframes are included, the window is an array as well
 equals( SC.$(window).length, 1, "Correct number of elements generated for window" );

 equals( SC.$(document).length, 1, "Correct number of elements generated for document" );

 equals( SC.$([1,2,3]).get(1), 2, "Test passing an array to the factory" );

 equals( SC.$(document.body).get(0), SC.$('body').get(0), "Test passing an html node to the factory" );
});

test("SC.$('html')", function() {
  expect(3);

  reset();
  ok( SC.$("<link rel='stylesheet'/>")[0], "Creating a link" );
  
  reset();
  
  var j = SC.$("<span>hi</span> there <!-- mon ami -->");
  ok( j.length >= 2, "Check node,textnode,comment creation (some browsers delete comments)" );
  
  ok( !SC.$("<option>test</option>")[0].selected, "Make sure that options are auto-selected #2050" );
});

test("SC.$('html', context)", function() {
 expect(1);

 var $div = SC.$("<div/>");
 var $span = SC.$("<span/>", $div);
 equals($span.length, 1, "Verify a span created with a div context works, #1763");
});

test("length", function() {
 expect(1);
 equals( SC.$("p").length, 6, "Get Number of Elements Found" );
});

test("size()", function() {
 expect(1);
 equals( SC.$("p").size(), 6, "Get Number of Elements Found" );
});

test("get()", function() {
 expect(1);
 same( SC.$("p").get(), q("firstp","ap","sndp","en","sap","first"), "Get All Elements" );
});

test("get(Number)", function() {
 expect(1);
 equals( SC.$("p").get(0), document.getElementById("firstp"), "Get A Single Element" );
});

test("add(String|Element|Array|undefined)", function() {
 expect(12);
 same( SC.$("#sndp").add("#en").add("#sap").get(), q("sndp", "en", "sap"), "Check elements from document" );
 same( SC.$("#sndp").add( SC.$("#en")[0] ).add( SC.$("#sap") ).get(), q("sndp", "en", "sap"), "Check elements from document" );
 ok( SC.$([]).add(SC.$("#form")[0].elements).length >= 13, "Check elements from array" );

 var x = SC.$([]).add(SC.$("<p id='x1'>xxx</p>")).add(SC.$("<p id='x2'>xxx</p>"));
 equals( x[0].id, "x1", "Check on-the-fly element1" );
 equals( x[1].id, "x2", "Check on-the-fly element2" );

 var x = SC.$([]).add("<p id='x1'>xxx</p>").add("<p id='x2'>xxx</p>");
 equals( x[0].id, "x1", "Check on-the-fly element1" );
 equals( x[1].id, "x2", "Check on-the-fly element2" );

 var notDefined;
 equals( SC.$([]).add(notDefined).length, 0, "Check that undefined adds nothing" );

 // Added after #2811
 equals( SC.$([]).add([window,document,document.body,document]).length, 3, "Pass an array" );
 equals( SC.$(document).add(document).length, 1, "Check duplicated elements" );
 equals( SC.$(window).add(window).length, 1, "Check duplicated elements using the window" );
 ok( SC.$([]).add( document.getElementById('form') ).length >= 13, "Add a form (adds the elements)" );
});

test("each(Function)", function() {
 expect(1);
 var div = SC.$("div");
 div.each(function(){this.foo = 'zoo';});
 var pass = true;
 for ( var i = 0; i < div.size(); i++ ) {
   if ( div.get(i).foo != "zoo" ) pass = false;
 }
 ok( pass, "Execute a function, Relative" );
});

test("index(Object)", function() {
 expect(10);

 var elements = SC.$([window, document]),
   inputElements = SC.$('#radio1,#radio2,#check1,#check2');

 equals( elements.index(window), 0, "Check for index of elements" );
 equals( elements.index(document), 1, "Check for index of elements" );
 equals( inputElements.index(document.getElementById('radio1')), 0, "Check for index of elements" );
 equals( inputElements.index(document.getElementById('radio2')), 1, "Check for index of elements" );
 equals( inputElements.index(document.getElementById('check1')), 2, "Check for index of elements" );
 equals( inputElements.index(document.getElementById('check2')), 3, "Check for index of elements" );
 equals( inputElements.index(window), -1, "Check for not found index" );
 equals( inputElements.index(document), -1, "Check for not found index" );

 // enabled since [5500]
 equals( elements.index( elements ), 0, "Pass in a SC.$ object" );
 equals( elements.index( elements.eq(1) ), 1, "Pass in a SC.$ object" );
});

test("attr(String)", function() {
 expect(26);
 equals( SC.$('#text1').attr('value'), "Test", 'Check for value attribute' );
 equals( SC.$('#text1').attr('value', "Test2").attr('defaultValue'), "Test", 'Check for defaultValue attribute' );
 equals( SC.$('#text1').attr('type'), "text", 'Check for type attribute' );
 equals( SC.$('#radio1').attr('type'), "radio", 'Check for type attribute' );
 equals( SC.$('#check1').attr('type'), "checkbox", 'Check for type attribute' );
 equals( SC.$('#simon1').attr('rel'), "bookmark", 'Check for rel attribute' );
 equals( SC.$('#google').attr('title'), "Google!", 'Check for title attribute' );
 equals( SC.$('#mark').attr('hreflang'), "en", 'Check for hreflang attribute' );
 equals( SC.$('#en').attr('lang'), "en", 'Check for lang attribute' );
 equals( SC.$('#simon').attr('class'), "blog link", 'Check for class attribute' );
 equals( SC.$('#name').attr('name'), "name", 'Check for name attribute' );
 equals( SC.$('#text1').attr('name'), "action", 'Check for name attribute' );
 ok( SC.$('#form').attr('action').indexOf("formaction") >= 0, 'Check for action attribute' );
 equals( SC.$('#text1').attr('maxlength'), '30', 'Check for maxlength attribute' );
 equals( SC.$('#text1').attr('maxLength'), '30', 'Check for maxLength attribute' );
 equals( SC.$('#area1').attr('maxLength'), '30', 'Check for maxLength attribute' );
 equals( SC.$('#select2').attr('selectedIndex'), 3, 'Check for selectedIndex attribute' );
 equals( SC.$('#foo').attr('nodeName'), 'DIV', 'Check for nodeName attribute' );
 equals( SC.$('#foo').attr('tagName'), 'DIV', 'Check for tagName attribute' );

 SC.$('#main').append(SC.$('<a id="tAnchor5"></a>').attr('href', '#5')); // using innerHTML in IE causes href attribute to be serialized to the full path
 equals( SC.$('#tAnchor5').attr('href'), "#5", 'Check for non-absolute href (an anchor)' );


 // Related to [5574] and [5683]
 var body = document.body, $body = SC.$(body);

 ok( $body.attr('foo') === undefined, 'Make sure that a non existent attribute returns undefined' );
 
 // ignore the Firebug console if present...
 var nextSibling = $body.attr('nextSibling') ;
 ok( (($body.attr('nextSibling') === null) || (nextSibling.id == '_firebugConsole')), 'Make sure a null expando returns null' );
 
 $body.attr('foo', 'baz');
 equals( $body.attr('foo'), 'baz', 'Make sure the dom attribute is retrieved when no expando is found' );
 
 body.foo = 'bar';
 equals( $body.attr('foo'), 'bar', 'Make sure the expando is preferred over the dom attribute' );
 
 $body.attr('foo','cool');
 equals( $body.attr('foo'), 'cool', 'Make sure that setting works well when both expando and dom attribute are available' );
 
 body.foo = undefined;
 ok( $body.attr('foo') === undefined, 'Make sure the expando is preferred over the dom attribute, even if undefined' );
 
 body.removeAttribute('foo'); // Cleanup
});

test("attr(String, Function)", function() {
 expect(2);
 equals( SC.$('#text1').attr('value', function() { return this.id; })[0].value, "text1", "Set value from id" );
 equals( SC.$('#text1').attr('title', function(i) { return i; }).attr('title'), "0", "Set value with an index");
});

test("attr(Hash)", function() {
 expect(1);
 var pass = true;
 SC.$("div").attr({foo: 'baz', zoo: 'ping'}).each(function(){
   if ( this.getAttribute('foo') != "baz" && this.getAttribute('zoo') != "ping" ) pass = false;
 });
 ok( pass, "Set Multiple Attributes" );
});

test("attr(String, Object)", function() {
 expect(17);
 var div = SC.$("div").attr("foo", "bar");
   fail = false;
 for ( var i = 0; i < div.size(); i++ ) {
   if ( div.get(i).getAttribute('foo') != "bar" ){
     fail = i;
     break;
   }
 }
 equals( fail, false, "Set Attribute, the #"+fail+" element didn't get the attribute 'foo'" );

 ok( SC.$("#foo").attr({"width": null}), "Try to set an attribute to nothing" );

 SC.$("#name").attr('name', 'something');
 equals( SC.$("#name").attr('name'), 'something', 'Set name attribute' );
 SC.$("#check2").attr('checked', true);
 equals( document.getElementById('check2').checked, true, 'Set checked attribute' );
 SC.$("#check2").attr('checked', false);
 equals( document.getElementById('check2').checked, false, 'Set checked attribute' );
 SC.$("#text1").attr('readonly', true);
 equals( document.getElementById('text1').readOnly, true, 'Set readonly attribute' );
 SC.$("#text1").attr('readonly', false);
 equals( document.getElementById('text1').readOnly, false, 'Set readonly attribute' );
 SC.$("#name").attr('maxlength', '5');
 equals( document.getElementById('name').maxLength, '5', 'Set maxlength attribute' );
 SC.$("#name").attr('maxLength', '10');
 equals( document.getElementById('name').maxLength, '10', 'Set maxlength attribute' );

 // for #1070
 SC.$("#name").attr('someAttr', '0');
 equals( SC.$("#name").attr('someAttr'), '0', 'Set attribute to a string of "0"' );
 SC.$("#name").attr('someAttr', 0);
 equals( SC.$("#name").attr('someAttr'), 0, 'Set attribute to the number 0' );
 SC.$("#name").attr('someAttr', 1);
 equals( SC.$("#name").attr('someAttr'), 1, 'Set attribute to the number 1' );

 // using contents will get comments regular, text, and comment nodes
 var j = SC.$("#nonnodes").contents();

 j.attr("name", "attrvalue");
 equals( j.attr("name"), "attrvalue", "Check node,textnode,comment for attr" );
 j.removeAttr("name");

 reset();

 var type = SC.$("#check2").attr('type');
 var thrown = false;
 try {
   SC.$("#check2").attr('type','hidden');
 } catch(e) {
   thrown = true;
 }
 ok( thrown, "Exception thrown when trying to change type property" );
 equals( type, SC.$("#check2").attr('type'), "Verify that you can't change the type of an input element" );

 var check = document.createElement("input");
 var thrown = true;
 try {
   SC.$(check).attr('type','checkbox');
 } catch(e) {
   thrown = false;
 }
 ok( thrown, "Exception thrown when trying to change type property" );
 equals( "checkbox", SC.$(check).attr('type'), "Verify that you can change the type of an input element that isn't in the DOM" );
});

test("css(String|Hash)", function() {
 expect(19);

 equals( SC.$('#main').css("display"), 'none', 'Check for css property "display"');

 ok( SC.$('#foo').isVisible(), 'Modifying CSS display: Assert element is visible');
 SC.$('#foo').css({display: 'none'});
 ok( !SC.$('#foo').isVisible(), 'Modified CSS display: Assert element is hidden');
 SC.$('#foo').css({display: 'block'});
 ok( SC.$('#foo').isVisible(), 'Modified CSS display: Assert element is visible');

 SC.$('#floatTest').css({styleFloat: 'right'});
 equals( SC.$('#floatTest').css('styleFloat'), 'right', 'Modified CSS float using "styleFloat": Assert float is right');
 SC.$('#floatTest').css({cssFloat: 'left'});
 equals( SC.$('#floatTest').css('cssFloat'), 'left', 'Modified CSS float using "cssFloat": Assert float is left');
 SC.$('#floatTest').css({'float': 'right'});
 equals( SC.$('#floatTest').css('float'), 'right', 'Modified CSS float using "float": Assert float is right');
 SC.$('#floatTest').css({'font-size': '30px'});
 equals( SC.$('#floatTest').css('font-size'), '30px', 'Modified CSS font-size: Assert font-size is 30px');

 SC.$.each("0,0.25,0.5,0.75,1".split(','), function(i, n) {
   SC.$('#foo').css({opacity: n});
   equals( SC.$('#foo').css('opacity'), parseFloat(n), "Assert opacity is " + parseFloat(n) + " as a String" );
   SC.$('#foo').css({opacity: parseFloat(n)});
   equals( SC.$('#foo').css('opacity'), parseFloat(n), "Assert opacity is " + parseFloat(n) + " as a Number" );
 });
 SC.$('#foo').css({opacity: ''});
 equals( SC.$('#foo').css('opacity'), '1', "Assert opacity is 1 when set to an empty String" );
});

test("css(String, Object)", function() {
 expect(21);
 ok( SC.$('#foo').isVisible(), 'Modifying CSS display: Assert element is visible');
 SC.$('#foo').css('display', 'none');
 ok( !SC.$('#foo').isVisible(), 'Modified CSS display: Assert element is hidden');
 SC.$('#foo').css('display', 'block');
 ok( SC.$('#foo').isVisible(), 'Modified CSS display: Assert element is visible');

 SC.$('#floatTest').css('styleFloat', 'left');
 equals( SC.$('#floatTest').css('styleFloat'), 'left', 'Modified CSS float using "styleFloat": Assert float is left');
 SC.$('#floatTest').css('cssFloat', 'right');
 equals( SC.$('#floatTest').css('cssFloat'), 'right', 'Modified CSS float using "cssFloat": Assert float is right');
 SC.$('#floatTest').css('float', 'left');
 equals( SC.$('#floatTest').css('float'), 'left', 'Modified CSS float using "float": Assert float is left');
 SC.$('#floatTest').css('font-size', '20px');
 equals( SC.$('#floatTest').css('font-size'), '20px', 'Modified CSS font-size: Assert font-size is 20px');

 SC.$.each("0,0.25,0.5,0.75,1".split(','), function(i, n) {
   SC.$('#foo').css('opacity', n);
   equals( SC.$('#foo').css('opacity'), parseFloat(n), "Assert opacity is " + parseFloat(n) + " as a String" );
   SC.$('#foo').css('opacity', parseFloat(n));
   equals( SC.$('#foo').css('opacity'), parseFloat(n), "Assert opacity is " + parseFloat(n) + " as a Number" );
 });
 SC.$('#foo').css('opacity', '');
 equals( SC.$('#foo').css('opacity'), '1', "Assert opacity is 1 when set to an empty String" );
 // for #1438, IE throws JS error when filter exists but doesn't have opacity in it
 if (SC.browser.msie) {
   SC.$('#foo').css("filter", "progid:DXImageTransform.Microsoft.Chroma(color='red');");
 }
 equals( SC.$('#foo').css('opacity'), '1', "Assert opacity is 1 when a different filter is set in IE, #1438" );

 // using contents will get comments regular, text, and comment nodes
 var j = SC.$("#nonnodes").contents();
 j.css("padding-left", "1px");
 equals( j.css("padding-left"), "1px", "Check node,textnode,comment css works" );

 // opera sometimes doesn't update 'display' correctly, see #2037
 SC.$("#t2037")[0].innerHTML = SC.$("#t2037")[0].innerHTML ;
 equals( SC.$("#t2037 .hidden").css("display"), "none", "Make sure browser thinks it is hidden" );
});

test("SC.$.css(elem, 'height') doesn't clear radio buttons (bug #1095)", function () {
 expect(4);

 var $checkedtest = SC.$("#checkedtest");
 // IE6 was clearing "checked" in SC.$.css(elem, "height");
 SC.$.css($checkedtest[0], "height");
 var input = SC.$("input.radio", $checkedtest);
 ok( !! SC.$(input[0]).attr("checked"), "Check first radio still checked." );
 ok( ! SC.$(input[input.length]).attr("checked"), "Check last radio still NOT checked." );
 
 var input = SC.$("input.checkbox", $checkedtest);
 ok( !! SC.$(input[0]).attr("checked"), "Check first checkbox still checked." );
 ok( ! SC.$(input[input.length]).attr("checked"), "Check last checkbox still NOT checked." );
});

test("width()", function() {
 expect(9);

 var $div = SC.$("#nothiddendiv");
 $div.width(30);
 equals($div.width(), 30, "Test set to 30 correctly");
 $div.width(-1); // handle negative numbers by ignoring #1599
 equals($div.width(), 30, "Test negative width ignored");
 $div.css("padding", "20px");
 equals($div.width(), 30, "Test padding specified with pixels");
 $div.css("border", "2px solid #fff");
 equals($div.width(), 30, "Test border specified with pixels");

 // IE is off by one on this.  We don't really care at this point since ems 
 // is not really central to most SC apps.
 $div.css("padding", "2em");
 var e = SC.browser.msie ? 29 : 30; 
 equals($div.width(), e, "Test padding specified with ems");

 $div.css("border", "1em solid #fff");
 equals($div.width(), 30, "Test border specified with ems");

 $div.css("padding", "2%");
 equals($div.width(), 30, "Test padding specified with percent");
 $div.hide();
 equals($div.width(), 30, "Test hidden div");

 $div.css({ display: "", border: "", padding: "" });

 SC.$("#nothiddendivchild").css({ padding: "3px", border: "2px solid #fff" });
 equals(SC.$("#nothiddendivchild").width(), 20, "Test child width with border and padding");
 SC.$("#nothiddendiv, #nothiddendivchild").css({ border: "", padding: "", width: "" });
});

test("height()", function() {
 expect(8);

 var $div = SC.$("#nothiddendiv");
 $div.height(30);
 equals($div.height(), 30, "Test set to 30 correctly");
 $div.height(-1); // handle negative numbers by ignoring #1599
 equals($div.height(), 30, "Test negative height ignored");
 $div.css("padding", "20px");
 equals($div.height(), 30, "Test padding specified with pixels");
 $div.css("border", "2px solid #fff");
 equals($div.height(), 30, "Test border specified with pixels");

 // IE is off by one on this.  We don't really care at this point since ems 
 // is not really central to most SC apps.
 $div.css("padding", "2em");
 var e = SC.browser.msie ? 29 : 30; 
 equals($div.height(), e, "Test padding specified with ems");

 $div.css("border", "1em solid #fff");
 equals($div.height(), 30, "Test border specified with ems");
 $div.css("padding", "2%");
 equals($div.height(), 30, "Test padding specified with percent");
 $div.hide();
 equals($div.height(), 30, "Test hidden div");

 $div.css({ display: "", border: "", padding: "", height: "1px" });
});

test("text()", function() {
 expect(1);
 var expected = "This link has class=\"blog\": Simon Willison's Weblog";
 equals( SC.$('#sap').text(), expected, 'Check for merged text of more then one element.' );
});

test("append(String|Element|Array&lt;Element&gt;|SC.$)", function() {
  expect(21);
  var defaultText = 'Try them out:' ;
  var result = SC.$('#first').append('<b>buga</b>');
  equals( result.text(), defaultText + 'buga', 'Check if text appending works' );

  var cq = SC.$('#select3').append('<option value="appendTest">Append Test</option>').find('option');
  equals(SC.$(cq[cq.length-1]).attr('value'), 'appendTest', 'Appending html options to select element');

  reset();
  var expected = "This link has class=\"blog\": Simon Willison's WeblogTry them out:";
  SC.$('#sap').append(document.getElementById('first'));
  equals(SC.$('#sap').text(), expected, "Check for appending of element" );

  reset();
  expected = "This link has class=\"blog\": Simon Willison's WeblogTry them out:Yahoo";
  SC.$('#sap').append([document.getElementById('first'), document.getElementById('yahoo')]);
  equals(SC.$('#sap').text(), expected, "Check for appending of array of elements" );

  reset();
  expected = "This link has class=\"blog\": Simon Willison's WeblogTry them out:Yahoo";
  SC.$('#sap').append(SC.$("#first, #yahoo"));
  equals( expected, SC.$('#sap').text(), "Check for appending of SC.$ object" );

  reset();
  SC.$("#sap").append( 5 );
  ok( SC.$("#sap")[0].innerHTML.match( /5$/ ), "Check for appending a number" );

  reset();
  SC.$("#sap").append( " text with spaces " );
  ok( SC.$("#sap")[0].innerHTML.match(/ text with spaces $/), "Check for appending text with spaces" );

  reset();
  ok( SC.$("#sap").append([]), "Check for appending an empty array." );
  ok( SC.$("#sap").append(""), "Check for appending an empty string." );
  ok( SC.$("#sap").append(document.getElementsByTagName("foo")), "Check for appending an empty nodelist." );

  reset();
  SC.$("#sap").append(document.getElementById('form'));
  equals( SC.$("#sap>form").size(), 1, "Check for appending a form" ); // Bug #910

  reset();
  var pass = true;
  try {
    SC.$( SC.$("#iframe")[0].contentWindow.document.body ).append("<div>test</div>");
  } catch(e) {
    pass = false;
  }

  ok( pass, "Test for appending a DOM node to the contents of an IFrame" );

  reset();
  SC.$('<fieldset/>').appendTo('#form').append('<legend id="legend">test</legend>');
  t( 'Append legend', '#legend', ['legend'] );

  reset();
  SC.$('#select1').append('<OPTION>Test</OPTION>');
  equals( SC.$('#select1 option').last().text(), "Test", "Appending <OPTION>; (all caps)" );

  SC.$('#table').append('<colgroup></colgroup>');
  ok( SC.$('#table colgroup').length, "Append colgroup" );

  SC.$('#table colgroup').append('<col/>');
  ok( SC.$('#table colgroup col').length, "Append col" );

  reset();
  SC.$('#table').append('<caption></caption>');
  ok( SC.$('#table caption').length, "Append caption" );

  reset();
  SC.$('form').last()
  .append('<select id="appendSelect1"></select>')
  .append('<select id="appendSelect2"><option>Test</option></select>');

  t( "Append Select", "#appendSelect1, #appendSelect2", ["appendSelect1", "appendSelect2"] );

  // using contents will get comments regular, text, and comment nodes
  var j = SC.$("#nonnodes").contents();
  var d = SC.$("<div/>").appendTo("#nonnodes").append(j);
  equals( SC.$("#nonnodes").length, 1, "Check node,textnode,comment append moved leaving just the div" );
  ok( d.contents().length >= 2, "Check node,textnode,comment append works" );
  d.contents().appendTo("#nonnodes");
  d.remove();
  ok( SC.$("#nonnodes").contents().length >= 2, "Check node,textnode,comment append cleanup worked" );
});

test("prepend(String|Element|Array&lt;Element&gt;|SC.$)", function() {
 expect(5);
 var defaultText = 'Try them out:' ;
 var result = SC.$('#first').prepend('<b>buga</b>');
 equals( result.text(), 'buga' + defaultText, 'Check if text prepending works' );
 equals( SC.$('#select3').prepend('<option value="prependTest">Prepend Test</option>').find('option').first().attr('value'), 'prependTest', 'Prepending html options to select element');

 reset();
 var expected = "Try them out:This link has class=\"blog\": Simon Willison's Weblog";
 SC.$('#sap').prepend(document.getElementById('first'));
 equals( expected, SC.$('#sap').text(), "Check for prepending of element" );

 reset();
 expected = "Try them out:YahooThis link has class=\"blog\": Simon Willison's Weblog";
 SC.$('#sap').prepend([document.getElementById('first'), document.getElementById('yahoo')]);
 equals( expected, SC.$('#sap').text(), "Check for prepending of array of elements" );

 reset();
 expected = "Try them out:YahooThis link has class=\"blog\": Simon Willison's Weblog";
 SC.$('#sap').prepend(SC.$("#first, #yahoo"));
 equals( expected, SC.$('#sap').text(), "Check for prepending of SC.$ object" );
});

test("before(String|Element|Array&lt;Element&gt;|SC.$)", function() {
 expect(4);
 var expected = 'This is a normal link: bugaYahoo';
 SC.$('#yahoo').before('<b>buga</b>');
 equals( expected, SC.$('#en').text(), 'Insert String before' );

 reset();
 expected = "This is a normal link: Try them out:Yahoo";
 SC.$('#yahoo').before(document.getElementById('first'));
 equals( expected, SC.$('#en').text(), "Insert element before" );

 reset();
 expected = "This is a normal link: Try them out:diveintomarkYahoo";
 SC.$('#yahoo').before([document.getElementById('first'), document.getElementById('mark')]);
 equals( expected, SC.$('#en').text(), "Insert array of elements before" );

 reset();
 expected = "This is a normal link: Try them out:diveintomarkYahoo";
 SC.$('#yahoo').before(SC.$("#first, #mark"));
 equals( expected, SC.$('#en').text(), "Insert SC.$ before" );
});

test("after(String|Element|Array&lt;Element&gt;|SC.$)", function() {
 expect(4);
 var expected = 'This is a normal link: Yahoobuga';
 SC.$('#yahoo').after('<b>buga</b>');
 equals( expected, SC.$('#en').text(), 'Insert String after' );

 reset();
 expected = "This is a normal link: YahooTry them out:";
 SC.$('#yahoo').after(document.getElementById('first'));
 equals( expected, SC.$('#en').text(), "Insert element after" );

 reset();
 expected = "This is a normal link: YahooTry them out:diveintomark";
 SC.$('#yahoo').after([document.getElementById('first'), document.getElementById('mark')]);
 equals( expected, SC.$('#en').text(), "Insert array of elements after" );

 reset();
 expected = "This is a normal link: YahooTry them out:diveintomark";
 SC.$('#yahoo').after(SC.$("#first, #mark"));
 equals( expected, SC.$('#en').text(), "Insert SC.$ after" );
});

test("replaceWith(String|Element|Array&lt;Element&gt;|SC.$)", function() {
 expect(10);
 SC.$('#yahoo').replaceWith('<b id="replace">buga</b>');
 ok( SC.$("#replace")[0], 'Replace element with string' );
 ok( !SC.$("#yahoo")[0], 'Verify that original element is gone, after string' );

 reset();
 SC.$('#yahoo').replaceWith(document.getElementById('first'));
 ok( SC.$("#first")[0], 'Replace element with element' );
 ok( !SC.$("#yahoo")[0], 'Verify that original element is gone, after element' );

 reset();
 SC.$('#yahoo').replaceWith([document.getElementById('first'), document.getElementById('mark')]);
 ok( SC.$("#first")[0], 'Replace element with array of elements' );
 ok( SC.$("#mark")[0], 'Replace element with array of elements' );
 ok( !SC.$("#yahoo")[0], 'Verify that original element is gone, after array of elements' );

 reset();
 SC.$('#yahoo').replaceWith(SC.$("#first, #mark"));
 ok( SC.$("#first")[0], 'Replace element with set of elements' );
 ok( SC.$("#mark")[0], 'Replace element with set of elements' );
 ok( !SC.$("#yahoo")[0], 'Verify that original element is gone, after set of elements' );
});

test("end()", function() {
 expect(3);
 equals( 'Yahoo', SC.$('#yahoo').parent().end().text(), 'Check for end' );
 ok( SC.$('#yahoo').end(), 'Check for end with nothing to end' );

 var x = SC.$('#yahoo');
 x.parent();
 equals( 'Yahoo', SC.$('#yahoo').text(), 'Check for non-destructive behaviour' );
});

test("find(String)", function() {
 expect(2);
 equals( 'Yahoo', SC.$('#foo').find('.blogTest').text(), 'Check for find' );

 // using contents will get comments regular, text, and comment nodes
 var j = SC.$("#nonnodes").contents();
 equals( j.find("div").length, 0, "Check node,textnode,comment to find zero divs" );
});

test("clone()", function() {
 expect(20);
 equals( 'This is a normal link: Yahoo', SC.$('#en').text(), 'Assert text for #en' );
 var clone = SC.$('#yahoo').clone();
 equals( 'Try them out:Yahoo', SC.$('#first').append(clone).text(), 'Check for clone' );
 equals( 'This is a normal link: Yahoo', SC.$('#en').text(), 'Reassert text for #en' );

 var cloneTags = [
   "<table/>", "<tr/>", "<td/>", "<div/>",
   "<button/>", "<ul/>", "<ol/>", "<li/>",
   "<input type='checkbox' />", "<select/>", "<option/>", "<textarea/>",
   "<tbody/>", "<thead/>", "<tfoot/>", "<iframe/>"
 ];
 for (var i = 0; i < cloneTags.length; i++) {
   var j = SC.$(cloneTags[i]);
   equals( j[0].tagName, j.clone()[0].tagName, 'Clone a &lt;' + cloneTags[i].substring(1));
 }

 // using contents will get comments regular, text, and comment nodes
 var cl = SC.$("#nonnodes").contents().clone();
 ok( cl.length >= 2, "Check node,textnode,comment clone works (some browsers delete comments on clone)" );
});

test("is(String)", function() {
 expect(10);
 ok( SC.$('#form').is('form'), 'Check for element: A form must be a form' );
 ok( !SC.$('#form').is('div'), 'Check for element: A form is not a div' );
 ok( SC.$('#mark').is('.blog'), 'Check for class: Expected class "blog"' );
 ok( !SC.$('#mark').is('.link'), 'Check for class: Did not expect class "link"' );
 ok( SC.$('#simon').is('.blog.link'), 'Check for multiple classes: Expected classes "blog" and "link"' );
 ok( !SC.$('#simon').is('.blogTest'), 'Check for multiple classes: Expected classes "blog" and "link", but not "blogTest"' );

 // not supported in CoreQuery
 //ok( SC.$('#en').is('[lang="en"]'), 'Check for attribute: Expected attribute lang to be "en"' );
 //ok( !SC.$('#en').is('[lang="de"]'), 'Check for attribute: Expected attribute lang to be "en", not "de"' );
 //ok( SC.$('#text1').is('[type="text"]'), 'Check for attribute: Expected attribute type to be "text"' );
 //ok( !SC.$('#text1').is('[type="radio"]'), 'Check for attribute: Expected attribute type to be "text", not "radio"' );
 
 //ok( SC.$('#text2').is(':disabled'), 'Check for pseudoclass: Expected to be disabled' );
 //ok( !SC.$('#text1').is(':disabled'), 'Check for pseudoclass: Expected not disabled' );
 //ok( SC.$('#radio2').is(':checked'), 'Check for pseudoclass: Expected to be checked' );
 //ok( !SC.$('#radio1').is(':checked'), 'Check for pseudoclass: Expected not checked' );
 //ok( SC.$('#foo').is(':has(p)'), 'Check for child: Expected a child "p" element' );
 //ok( !SC.$('#foo').is(':has(ul)'), 'Check for child: Did not expect "ul" element' );
 //ok( SC.$('#foo').is(':has(p):has(a):has(code)'), 'Check for childs: Expected "p", "a" and "code" child elements' );
 //ok( !SC.$('#foo').is(':has(p):has(a):has(code):has(ol)'), 'Check for childs: Expected "p", "a" and "code" child elements, but no "ol"' );
 ok( !SC.$('#foo').is(0), 'Expected false for an invalid expression - 0' );
 ok( !SC.$('#foo').is(null), 'Expected false for an invalid expression - null' );
 ok( !SC.$('#foo').is(''), 'Expected false for an invalid expression - ""' );
 ok( !SC.$('#foo').is(undefined), 'Expected false for an invalid expression - undefined' );

 // test is() with comma-seperated expressions
 //ok( SC.$('#en').is('[lang="en"],[lang="de"]'), 'Comma-seperated; Check for lang attribute: Expect en or de' );
 //ok( SC.$('#en').is('[lang="de"],[lang="en"]'), 'Comma-seperated; Check for lang attribute: Expect en or de' );
 //ok( SC.$('#en').is('[lang="en"] , [lang="de"]'), 'Comma-seperated; Check for lang attribute: Expect en or de' );
 //ok( SC.$('#en').is('[lang="de"] , [lang="en"]'), 'Comma-seperated; Check for lang attribute: Expect en or de' );
});

test("val()", function() {
 expect(8);

 equals( SC.$("#text1").val(), "Test", "Check for value of input element" );
 // ticket #1714 this caused a JS error in IE
 equals( SC.$("#first").val(), "", "Check a paragraph element to see if it has a value" );
 ok( SC.$([]).val() === undefined, "Check an empty SC.$ object will return undefined from val" );
 
 equals( SC.$('#select2').val(), '3', 'Call val() on a single="single" select' );

 same( SC.$('#select3').val(), ['1', '2'], 'Call val() on a multiple="multiple" select' );

 equals( SC.$('#option3c').val(), '2', 'Call val() on a option element with value' );
 
 equals( SC.$('#option3a').val(), '', 'Call val() on a option element with empty value' );
 
 equals( SC.$('#option3e').val(), 'no value', 'Call val() on a option element with no value attribute' );
 
});

test("val(String/Number)", function() {
 expect(6);
 document.getElementById('text1').value = "bla";
 equals( SC.$("#text1").val(), "bla", "Check for modified value of input element" );
 
 SC.$("#text1").val('test');
 equals( document.getElementById('text1').value, "test", "Check for modified (via val(String)) value of input element" );
 
 SC.$("#text1").val(67);
 equals( document.getElementById('text1').value, "67", "Check for modified (via val(Number)) value of input element" );

 SC.$("#select1").val("3");
 equals( SC.$("#select1").val(), "3", "Check for modified (via val(String)) value of select element" );

 SC.$("#select1").val(2);
 equals( SC.$("#select1").val(), "2", "Check for modified (via val(Number)) value of select element" );

 // using contents will get comments regular, text, and comment nodes
 var j = SC.$("#nonnodes").contents();
 j.val("asdf");
 equals( j.val(), "asdf", "Check node,textnode,comment with val()" );
 j.removeAttr("value");
});

var scriptorder = 0;

test("html(String)", function() {
  
 expect(5);
 var div = SC.$("#main > div");
 div.html("<b>test</b>");
 var pass = true;
 for ( var i = 0; i < div.size(); i++ ) {
   if ( div.get(i).childNodes.length != 1 ) pass = false;
 }
 ok( pass, "Set HTML" );

 reset();
 // using contents will get comments regular, text, and comment nodes 
 var j = SC.$("#nonnodes").contents();
 
 j.html("<b>bold</b>");

 // this is needed, or the expando added by SC.$ unique will yield a different html
 j.find('b').removeData();
 ok( (j.html().toLowerCase().match(/<b(\w*|\s*\=*|\"*)*>bold<\/b>/).length>0),  "Check node,textnode,comment with html()" );

 SC.$("#main").html("<select/>");
 SC.$("#main select").html("<option>O1</option><option selected='selected'>O2</option><option>O3</option>");
 equals( SC.$("#main select").val(), "O2", "Selected option correct" );

 var $div = SC.$('<div />');
 equals( $div.html( 5 ).html(), '5', 'Setting a number as html' );
 equals( $div.html( 0 ).html(), '0', 'Setting a zero as html' );

 // Disabled because CoreQuery does not support evaluating script tags
 // stop();
 // 
 // SC.$("#main").html('<script type="text/javascript">ok( true, "SC.$().html().evalScripts() Evals Scripts Twice in Firefox, see #975" );<'+'/script>');
 // 
 // SC.$("#main").html('foo <form><script type="text/javascript">ok( true, "SC.$().html().evalScripts() Evals Scripts Twice in Firefox, see #975" );<'+'/script></form>');
 // 
 // // it was decided that waiting to execute ALL scripts makes sense since nested ones have to wait anyway so this test case is changed, see #1959
 // SC.$("#main").html("<script>equals(scriptorder++, 0, 'Script is executed in order');equals(SC.$('#scriptorder').length, 1,'Execute after html (even though appears before)')<\/script><span id='scriptorder'><script>equals(scriptorder++, 1, 'Script (nested) is executed in order');equals(SC.$('#scriptorder').length, 1,'Execute after html')<\/script></span><script>equals(scriptorder++, 2, 'Script (unnested) is executed in order');equals(SC.$('#scriptorder').length, 1,'Execute after html')<\/script>");
 // 
 // setTimeout( start, 100 );
});

test("filter()", function() {
 expect(5);
 
 // psuedo-selectors are not supported
 //same( SC.$("#form input").filter(":checked").get(), q("radio2", "check1"), "filter(String)" );

 same( SC.$("p").filter("#ap, #sndp").get(), q("ap", "sndp"), "filter('String, String')" );
 same( SC.$("p").filter("#ap,#sndp").get(), q("ap", "sndp"), "filter('String,String')" );
 same( SC.$("p").filter(function() { return !SC.$("a", this).length; }).get(), q("sndp", "first"), "filter(Function)" );

 // using contents will get comments regular, text, and comment nodes
 var j = SC.$("#nonnodes").contents();
 equals( j.filter("span").length, 1, "Check node,textnode,comment to filter the one span" );
 equals( j.filter("[name]").length, 0, "Check node,textnode,comment to filter the one span" );
});

test("not()", function() {
 expect(8);
 
 // NOTE: These two tests were altered to use simpler selectors.
 equals( SC.$("#main p#ap a").length, 4, 'base before not should return A');
 equals( SC.$("#main p#ap a").not("#google").length, 3, "not('selector')" );
 equals( SC.$("#main p#ap a").not(document.getElementById("google")).length, 3, "not(DOMElement)" );

 same( SC.$("p").not(".result").get(), q("firstp", "ap", "sndp", "en", "sap", "first"), "not('.class')" );

 same( SC.$("p").not("#ap, #sndp, .result").get(), q("firstp", "en", "sap", "first"), "not('selector, selector')" );

 same( SC.$("p").not(SC.$("#ap, #sndp, .result")).get(), q("firstp", "en", "sap", "first"), "not(SC.$)" );

 equals( SC.$("p").not(document.getElementsByTagName("p")).length, 0, "not(Array-like DOM collection)" );

 // not supported selectors
 //same( SC.$("#form option").not("option.emptyopt:contains('Nothing'),[selected],[value='1']").get(), q("option1c", "option1d", "option2c", "option3d", "option3e" ), "not('complex selector')");

 var selects = SC.$("#form select");
 isSet( selects.not( selects[1] ), q("select1", "select3"), "filter out DOM element");
});

test("andSelf()", function() {
 expect(4);
 same( SC.$("#en").siblings().andSelf().get(), q("sndp", "sap","en"), "Check for siblings and self" );
 same( SC.$("#foo").children().andSelf().get(), q("sndp", "en", "sap", "foo"), "Check for children and self" );
 same( SC.$("#en, #sndp").parent().andSelf().get(), q("foo","en","sndp"), "Check for parent and self" );
 same( SC.$("#groups").parents("p, div").andSelf().get(), q("ap", "main", "groups"), "Check for parents and self" );
});

test("siblings([String])", function() {
 expect(3);
 same( SC.$("#en").siblings().get(), q("sndp", "sap"), "Check for siblings" );
 // no psuedo-selectors
 //same( SC.$("#sndp").siblings(":has(code)").get(), q("sap"), "Check for filtered siblings (has code child element)" );
 //same( SC.$("#sndp").siblings(":has(a)").get(), q("en", "sap"), "Check for filtered siblings (has anchor child element)" );
 same( SC.$("#foo").siblings("form, b").get(), q("form", "lengthtest", "testForm", "floatTest"), "Check for multiple filters" );
 same( SC.$("#en, #sndp").siblings().get(), q("sndp", "sap", "en"), "Check for unique results from siblings" );
});

test("children([String])", function() {
 expect(2);
 same( SC.$("#foo").children().get(), q("sndp", "en", "sap"), "Check for children" );
 
 // no pseudo-selectors
 //same( SC.$("#foo").children(":has(code)").get(), q("sndp", "sap"), "Check for filtered children" );
 same( SC.$("#foo").children("#en, #sap").get(), q("en", "sap"), "Check for multiple filters" );
});

test("parent([String])", function() {
 expect(5);
 equals( SC.$("#groups").parent()[0].id, "ap", "Simple parent check" );
 equals( SC.$("#groups").parent("p")[0].id, "ap", "Filtered parent check" );
 equals( SC.$("#groups").parent("div").length, 0, "Filtered parent check, no match" );
 equals( SC.$("#groups").parent("div, p")[0].id, "ap", "Check for multiple filters" );
 same( SC.$("#en, #sndp").parent().get(), q("foo"), "Check for unique results from parent" );
});

test("parents([String])", function() {
 expect(4);
 equals( SC.$("#groups").parents()[0].id, "ap", "Simple parents check" );
 equals( SC.$("#groups").parents("p")[0].id, "ap", "Filtered parents check" );
 equals( SC.$("#groups").parents("div")[0].id, "main", "Filtered parents check2" );
 same( SC.$("#groups").parents("p, div").get(), q("ap", "main"), "Check for multiple filters" );
 //same( SC.$("#en, #sndp").parents().get(), q("foo", "main", "dl", "body", "html"), "Check for unique results from parents" );
});

test("next([String])", function() {
 expect(4);
 equals( SC.$("#ap").next()[0].id, "foo", "Simple next check" );
 equals( SC.$("#ap").next("div")[0].id, "foo", "Filtered next check" );
 equals( SC.$("#ap").next("p").length, 0, "Filtered next check, no match" );
 equals( SC.$("#ap").next("div, p")[0].id, "foo", "Multiple filters" );
});

test("prev([String])", function() {
 expect(4);
 equals( SC.$("#foo").prev()[0].id, "ap", "Simple prev check" );
 equals( SC.$("#foo").prev("p")[0].id, "ap", "Filtered prev check" );
 equals( SC.$("#foo").prev("div").length, 0, "Filtered prev check, no match" );
 equals( SC.$("#foo").prev("p, div")[0].id, "ap", "Multiple filters" );
});


test("addClass(String)", function() {
 expect(2);
 var div = SC.$("div");
 div.addClass("test");
 var pass = true;
 for ( var i = 0; i < div.size(); i++ ) {
  if ( div.get(i).className.indexOf("test") == -1 ) pass = false;
 }
 ok( pass, "Add Class" );

 // using contents will get regular, text, and comment nodes
 var j = SC.$("#nonnodes").contents();
 j.addClass("asdf");
 ok( j.hasClass("asdf"), "Check node,textnode,comment for addClass" );
});

test("removeClass(String) - simple", function() {
 expect(4);
 var div = SC.$("div", SC.$('#main')).addClass("test").removeClass("test"),
   pass = true;
 for ( var i = 0; i < div.size(); i++ ) {
   if ( div.get(i).className.indexOf("test") != -1 ) pass = false;
 }
 ok( pass, "Remove Class" );

 reset();
 var div = SC.$("div", SC.$('#main')).addClass("test").addClass("foo").addClass("bar");
 div.removeClass("test").removeClass("bar").removeClass("foo");
 var pass = true;
 for ( var i = 0; i < div.size(); i++ ) {
  if ( div.get(i).className.match(/test|bar|foo/) ) pass = false;
 }
 ok( pass, "Remove multiple classes" );

 reset();
 var div = SC.$("div").first().addClass("test").removeClass("");
 ok( div.is('.test'), "Empty string passed to removeClass" );

 // using contents will get regular, text, and comment nodes
 var j = SC.$("#nonnodes").contents();
 j.removeClass("asdf");
 ok( !j.hasClass("asdf"), "Check node,textnode,comment for removeClass" );
});

test("toggleClass(String)", function() {
 expect(3);
 var e = SC.$("#firstp");
 ok( !e.is(".test"), "Assert class not present" );
 e.toggleClass("test");
 ok( e.is(".test"), "Assert class present" );
 e.toggleClass("test");
 ok( !e.is(".test"), "Assert class not present" );
});

test("removeAttr(String", function() {
 expect(1);
 equals( SC.$('#mark').removeAttr("class")[0].className, "", "remove class" );
});

test("text(String)", function() {
 expect(4);
 equals( SC.$("#foo").text("<div><b>Hello</b> cruel world!</div>")[0].innerHTML, "&lt;div&gt;&lt;b&gt;Hello&lt;/b&gt; cruel world!&lt;/div&gt;", "Check escaped text" );

 // using contents will get comments regular, text, and comment nodes
 var j = SC.$("#nonnodes").contents();
 j.text("hi!");
 equals( SC.$(j[0]).text(), "hi!", "Check node,textnode,comment with text()" );
 equals( j[1].nodeValue, " there ", "Check node,textnode,comment with text()" );
 equals( j[2].nodeType, 8, "Check node,textnode,comment with text()" );
});

test("remove()", function() {
 expect(6);
 SC.$("#ap").children().remove();
 ok( SC.$("#ap").text().length > 10, "Check text is not removed" );
 equals( SC.$("#ap").children().length, 0, "Check remove" );

 reset();
 SC.$("#ap").children().remove("a");
 ok( SC.$("#ap").text().length > 10, "Check text is not removed" );
 equals( SC.$("#ap").children().length, 1, "Check filtered remove" );

 // using contents will get comments regular, text, and comment nodes
 equals( SC.$("#nonnodes").contents().length, 3, "Check node,textnode,comment remove works" );
 SC.$("#nonnodes").contents().remove();
 equals( SC.$("#nonnodes").contents().length, 0, "Check node,textnode,comment remove works" );
});

test("empty()", function() {
 expect(3);
 equals( SC.$("#ap").children().empty().text().length, 0, "Check text is removed" );
 equals( SC.$("#ap").children().length, 4, "Check elements are not removed" );

 // using contents will get comments regular, text, and comment nodes
 var j = SC.$("#nonnodes").contents();
 j.empty();
 equals( j.html(), "", "Check node,textnode,comment empty works" );
});

test("slice()", function() {
 expect(6);
 
 var $links = SC.$("#ap a");
 
 isSet( $links.slice(1,2), q("groups"), "slice(1,2)" );
 isSet( $links.slice(1), q("groups", "anchor1", "mark"), "slice(1)" );
 isSet( $links.slice(0,3), q("google", "groups", "anchor1"), "slice(0,3)" );
 isSet( $links.slice(-1), q("mark"), "slice(-1)" );

 isSet( $links.eq(1), q("groups"), "eq(1)" );
 
 isSet( $links.eq('2'), q("anchor1"), "eq('2')" );
});

test("SC.$.makeArray", function(){
 expect(14);

 equals( SC.$.makeArray(SC.$('html>*'))[0].nodeName, "HEAD", "Pass makeArray a SC.$ object" );

 equals( SC.$.makeArray(document.getElementsByName("PWD")).slice(0,1)[0].name, "PWD", "Pass makeArray a nodelist" );

 equals( (function(){ return SC.$.makeArray(arguments); })(1,2).join(""), "12", "Pass makeArray an arguments array" );

 equals( SC.$.makeArray([1,2,3]).join(""), "123", "Pass makeArray a real array" );

 equals( SC.$.makeArray().length, 0, "Pass nothing to makeArray and expect an empty array" );

 equals( SC.$.makeArray( 0 )[0], 0 , "Pass makeArray a number" );

 equals( SC.$.makeArray( "foo" )[0], "foo", "Pass makeArray a string" );

 equals( SC.$.makeArray( true )[0].constructor, Boolean, "Pass makeArray a boolean" );

 equals( SC.$.makeArray( document.createElement("div") )[0].nodeName, "DIV", "Pass makeArray a single node" );

 equals( SC.$.makeArray( {length:2, 0:"a", 1:"b"} ).join(""), "ab", "Pass makeArray an array like map (with length)" );

 ok( !!SC.$.makeArray( document.documentElement.childNodes ).slice(0,1)[0].nodeName, "Pass makeArray a childNodes array" );

 // function, is tricky as it has length
 // NOTE: Due to the conflict with Scriptaculous (http://dev.SC.$.com/ticket/3248)
 // We remove support for functions since SC.$ 1.3
 //equals( SC.$.makeArray( function(){ return 1;} )[0](), 1, "Pass makeArray a function" );
 
 //window, also has length
 equals( SC.$.makeArray(window)[0], window, "Pass makeArray the window" );

 equals( SC.$.makeArray(/a/)[0].constructor, RegExp, "Pass makeArray a regex" );

 ok( SC.$.makeArray(document.getElementById('form')).length >= 13, "Pass makeArray a form (treat as elements)" );
});

module("CoreQuery.map()");

test("should return value of function", function() {
  // create an array of object to test.
  var values = [1,2,3,4]; 
  var objects = values.map(function(x) { return { value: x }; }) ;
  
  // Now do CoreQuery-style map
  var result = SC.CoreQuery.map(objects, function(x) { return x.value; });
  same(result, values, "return values of result") ;
});

test("should exclude null values", function() {
  // create an array of object to test.
  var values = [1,null,3,null]; 
  var objects = values.map(function(x) { return { value: x }; }) ;
  
  // Now do CoreQuery-style map
  var result = SC.CoreQuery.map(objects, function(x) { return x.value; });
  same(result.length, 2, "number of results") ;
  same(result, [1,3], "return values of result") ;
});
