
/*
It turns out not to be possible to use the BT approach as the current theme is not known.
The only thing we _can_ do, is do a replacement technique.

the idea of @theme(name) was to have $theme.tmpname
So, what we do instead is to set $tmpname, find all $theme or #{$theme} and
write it to #{$theme}.#{$tmpname}

*/

module.exports = function (css) {

  var atTheme = /@theme\([\s\S]+?\)/;
  var dollarTheme = /\$theme\./;
  var lines, ret = [], theme, theme_layer, layer, insideComment;

  var atThemeFound = css.search(atTheme) >= 0;
  var dollarThemeFound = css.search(dollarTheme) >= 0;

  if (!atThemeFound && !dollarThemeFound) return css; // don't parse

  lines = css.split("\n");
  ret = [];
  theme_layer = [];
  layer = 0;
  var tmptheme;

  lines.forEach(function (line, linenumber) {
    var  at_theme, param;
    var open_comment_pos = line.indexOf("/*");
    var close_comment_pos = line.indexOf("*/");
    var open_comment = open_comment_pos >= 0;
    var close_comment = close_comment_pos >= 0;
    if (open_comment && !close_comment) insideComment = true;
    if (close_comment && !open_comment) insideComment = false;
    if (insideComment) { // only pass over if inside comment
      ret.push(line);
      return;
    }
    if (atThemeFound) { // only run when there is an atTheme found in the file
      at_theme = line.search(atTheme);
      if (at_theme >= 0 && (at_theme < open_comment_pos || at_theme > close_comment_pos)) { // don't parse inside comments
        param = line.match(/\([\s\S]+?\)/);
        if (!param) {
          line += "/* you need to add a parameter when using @theme */";
          ret.push(line);
          console.log('@theme found without a parameter in file: ' + this.file.get('path') + " at line: " + linenumber);
          return;
        }
        else param = param[0].substr(1, param[0].length - 2);
        theme_layer.push(param);
        tmptheme = theme_layer.join(".");
        tmptheme = tmptheme[0] === "." ? tmptheme : "." + tmptheme;
        line = "$tmptheme: \"" + tmptheme + "\";";
        layer += 1;
      }
      // unreplace #{$theme} with $theme to not trip in the layer problem
      line = line.replace(/#\{\$theme\}/g, "$theme");
      if (line.indexOf("{") >= 0) layer += 1;
      if (line.indexOf("}") >= 0) {
        layer -= 1;
        if (theme_layer[layer]) {
          theme_layer.pop();
          tmptheme = theme_layer.join(".");
          tmptheme = tmptheme[0] === "." ? tmptheme: "." + tmptheme;
          tmptheme = tmptheme === "." ? "" : tmptheme; // make empty if only one period
          line = line.replace("}", "$tmptheme: \"" + tmptheme + "\";");
        }
      }
    }
    if (tmptheme && tmptheme.length) {
      line = line.replace(/\$theme([\.\[#\s])/g, "#{$theme}#{$tmptheme}$1");
    }
    else {
      // replace $theme by #{$theme} if it is followed by ".", "[" or "#"
      line = line.replace(/\$theme([\.\[#\s])/g, "#{$theme}$1");
    }
    ret.push(line);
  }, this);
  return ret.join("\n");




}

