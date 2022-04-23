[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/sproutcore/sproutcore?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

SproutCore 2: For Native-Caliber Web Apps
=======

> **Sproutcore 2.0** replaces the NodeJS buildtools with webpack

SproutCore is a JS-MVC framework for building blazing-fast, native-caliber web
applications. SproutCore's full-stack approach to single-page application
development gives you the tools you need to build rich, powerful applications...
which happen to run in the browser.


## Install

For a global install, run

`npm install -g sproutcore`

If you do not want a global install, follow the steps under .

## Getting Started

When you have SproutCore globally installed, you can run the following to create a new project:

`sproutcore init`

To update an existing project Sproutcore 1.x project, or create a new project with SproutCore as 
local dependency, the following steps apply.

If your project does not already have a package.json file, create one by running 
`npm init` and enter the necessary details.

Next run `npm install --save-dev sproutcore`

When you are creating a new project, you can now create a project structure as you like. The only thing
necessary is to make sure that SproutCore is being loaded by your app.

When updating an existing project, the SproutCore package provides a few tools that help you make the
transition. 

- `npx sproutcore_init` will create a basic webpack configuration
- `npx sproutcore_index` will create an `index.js` file that can serve as the webpack entry for 
  your app or framework. It will parse your JS files, sort them based on the information provided through
  `sc_require` and write out this sort order in the index.js file. Any subsequent updates are better 
  performed manually in the index.js

The following steps you will need to do manually:
- for every app, you will need to replace `function main () { // content }` with `window.main = function main () { //content }`. Because of the way Webpack wraps the non-module SC code of your app, the main function will not be exported to the window object.

## Next Steps

Once you're through the Getting Started tutorial:

- Check out the [Showcase](http://showcase.sproutcore.com/) for demos of a number
  of views and concepts.
- Check out lead developer Tyler Keating's book,
  [SproutCore Web Application Development](http://blog.sproutcore.com/sproutcore-book-available/).
- Check out Juniper, the [web app](http://juniper.dcporter.net/) +
  [annotated source code](https://github.com/dcporter/juniper) combo, for a deep
  dive into SproutCore features and best practices in action.

## Support

Resources for SproutCore developers include [the docs](http://docs.sproutcore.com/)
for API documentation, and [the Guides](http://guides.sproutcore.com/) for a
series of topical walk-throughs.

For additional SproutCore user support, join the
[mailing list](https://groups.google.com/group/sproutcore), or stop by the #sproutcore
[IRC channel](http://sproutcore.com/community/#tab=irc). For those interested in
contributing to the framework itself, please join sproutcore-dev@googlegroups.com.

## Acknowledgements

SproutCore includes code from a number of different open source projects
including:

* [jQuery](http://www.jquery.com/)
* [Prototype](http://www.prototypejs.org/)
* [Datejs](http://www.datejs.com/)
* [JSON2](http://www.json.org/)

