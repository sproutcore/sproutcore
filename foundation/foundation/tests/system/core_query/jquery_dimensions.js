// ========================================================================
// CoreQuery Tests
// ========================================================================

/*
  This test file incorporates most of the changes that come bundled with the
  SC.$-dimensions suite of tests, modified to fit CoreQuery's reduced API.
  
  You should be able to update most of these tests with updated versons of the
  same tests in SC.$.
  
  Be sure to replace all occurrences of SC.$ with SC.$.
  
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

module("dimensions");

test("innerWidth()", function() {
	expect(3);

	var $div = SC.$("#nothiddendiv");
	// set styles
	$div.css({
		margin: 10,
		border: "2px solid #fff",
		width: 30
	});
	
	equals($div.innerWidth(), 30, "Test with margin and border");
	$div.css("padding", "20px");
	equals($div.innerWidth(), 70, "Test with margin, border and padding");
	$div.hide();
	equals($div.innerWidth(), 70, "Test hidden div");
	
	// reset styles
	$div.css({ display: "", border: "", padding: "", width: "", height: "" });
});

test("innerHeight()", function() {
	expect(3);
	
	var $div = SC.$("#nothiddendiv");
	// set styles
	$div.css({
		margin: 10,
		border: "2px solid #fff",
		height: 30
	});
	
	equals($div.innerHeight(), 30, "Test with margin and border");
	$div.css("padding", "20px");
	equals($div.innerHeight(), 70, "Test with margin, border and padding");
	$div.hide();
	equals($div.innerHeight(), 70, "Test hidden div");
	
	// reset styles
	$div.css({ display: "", border: "", padding: "", width: "", height: "" });
});

test("outerWidth()", function() {
	expect(6);
	
	var $div = SC.$("#nothiddendiv");
	$div.css("width", 30);
	
	equals($div.outerWidth(), 30, "Test with only width set");
	$div.css("padding", "20px");
	equals($div.outerWidth(), 70, "Test with padding");
	$div.css("border", "2px solid #fff");
	equals($div.outerWidth(), 74, "Test with padding and border");
	$div.css("margin", "10px");
	equals($div.outerWidth(), 74, "Test with padding, border and margin without margin option");
	$div.css("position", "absolute");
	equals($div.outerWidth(true), 94, "Test with padding, border and margin with margin option");
	$div.hide();
	equals($div.outerWidth(true), 94, "Test hidden div with padding, border and margin with margin option");
	
	// reset styles
	$div.css({ position: "", display: "", border: "", padding: "", width: "", height: "" });
});

test("outerHeight()", function() {
	expect(6);
	
	var $div = SC.$("#nothiddendiv");
	$div.css("height", 30);
	
	equals($div.outerHeight(), 30, "Test with only width set");
	$div.css("padding", "20px");
	equals($div.outerHeight(), 70, "Test with padding");
	$div.css("border", "2px solid #fff");
	equals($div.outerHeight(), 74, "Test with padding and border");
	$div.css("margin", "10px");
	equals($div.outerHeight(), 74, "Test with padding, border and margin without margin option");
	equals($div.outerHeight(true), 94, "Test with padding, border and margin with margin option");
	$div.hide();
	equals($div.outerHeight(true), 94, "Test hidden div with padding, border and margin with margin option");
	
	// reset styles
	$div.css({ display: "", border: "", padding: "", width: "", height: "" });
});
