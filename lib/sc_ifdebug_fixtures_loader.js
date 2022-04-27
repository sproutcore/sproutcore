// remove @if(debug) and @if(build) blocks from the code in order to allow for production only and development only code blocks.


module.exports = function (src) {

  // we need to remove everything all the //@if(debug)
  // to //@endif
  let startregex;
  let filterFixtures = false;
  switch(this.mode) {
    case "development":
      startregex = /@if\s?\(build\)/;
    break;
    case "production":
      startregex = /@if\s?\(debug\)/;
      filterFixtures = true;
    break;
  }

  if (filterFixtures) {
    if (this.resourcePath.toLowerCase().includes("fixtures")) {
      // this file is in fixtures, warn that it should not have been included
      throw new Error("FIXTURES SHOULD HAVE BEEN EXCLUDED!!")
    }
  }

  const lines = src.split("\n"), ret = [];
  let insideIfDebug;
  lines.forEach(function (line) {
    let startIndex = line.search(startregex);
    if (startIndex > -1) {
      insideIfDebug = true;

      // It's possible that there is some code in this line BEFORE the start tag,
      // as sometimes webpack loaders may combine lines.
      // So, we need to keep the part of the line that's before the start tag
      if (startIndex > 0) {
        const subline = line.substr(0, startIndex);
        ret.push(subline);
      }

      // We identified that this line is the start tag.
      // So, no more processing needed for this line
      return;
    }
    if (!insideIfDebug) ret.push(line);
    if (insideIfDebug) {
      // catches both @end and @endif
      if (line.indexOf("@end") > -1) {
        // We found the end tag. We assume the rest of the line
        // is also commented out, so don't need to keep any part
        // of this line

        insideIfDebug = false;
      }
    }
  });
  return ret.join("\n");

}

