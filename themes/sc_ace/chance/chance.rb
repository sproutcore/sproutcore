#!/usr/bin/env ruby

# A CSSParser object is created for every file processed. It opens the file,
# reads its contents, and can perform two actions on it: parsing and generating.
#
# The parsing step reads the file and finds references to images; this causes those
# images to be added to the object's usedImages, which is a set of images required (images
# here being hashes with arguments specified). Ruby's "Set" functionality seems
# to work here (I am not a ruby expert, hence 'seems')
# 
# Internally, it actually generates an in-memory CSS file in the parsing step,
# to be used in the generating step—but that's all transparent. The object is long-lived,
# staying around from initial parse step to generation.
#
# In my opinion, this script is not that great. This is due to two reasons: it is my very
# first script written in Ruby, and I was figuring out the requirements by writing it (something
# I often do, but I usually follow that with a rewrite).
# But still, it generally works, and works with acceptable speed.

$: << File.expand_path(File.dirname(__FILE__) + "/lib")

require 'css'
require 'slicedice'

require 'optparse'

config = {}
argparser = OptionParser.new {|opts|
  opts.banner = "Usage: ruby generate_theme.rb [options] theme.name"
  
  config[:optimization_limit] = 50000
  opts.on(
    '-l', 
    '--optimization-limit [limit]', Integer,
    "Optimization limit; if reducing latency by eliminating a file causes more " +
    "than [limit] wasted pixels, it won't be done."
  ) {|limit|
    config[:optimization_limit] = limit
  }
  
  opts.on('--prefer-fewer-files', "Prefer fewer files by setting the optimization limit to 2 million pixels.") {
    config[:optimization_limit] = 2000000
  }
  
  opts.on('--prefer-smaller-download', "Prefer smaller download by setting the optimization limit to 0 pixels.") {
    config[:optimization_limit] = 0
  }
  
  
  config[:input] = "./src/"
  opts.on('-i', '--input [directory]', "Input directory (default: ./)") {|input|
    config[:input] = input
  }
  
  config[:output] = "resources/"
  opts.on('-o', '--output', 'Set output path (default: resources/)') {|out|
    out += "." if out.length == 0
    out += "/" if out[out.length - 1] != '/'
    config[:output] = out
  }
  
  config[:url_template] = "static_url(\"%s\")"
  opts.on('-u', '--url [PATTERN]', 'The URL template (default: static_url(\"%s\") )') {|template|
    config[:url_template] = template
  }
}

argparser.parse!
if ARGV.length == 0
  puts "Error: No theme name specified. Example theme name: ace.light"
  exit
else
  config[:theme_name] = ARGV[0]
end


require 'find'
images = {}
parsers = []
Find.find(config[:input]) do |f|
  if f =~ /^\.\/(resources)|\/\./
    Find.prune
  end
  if f =~ /\.css$/
    parser = CSSParser.new(File.dirname(f), File.basename(f), config)
    parsers << parser
    parser.parse
    images.merge! parser.images
  end
end

slicer = Slicer.new(config)
slicer.images = images
slicer.slice
slicer.dice

css_code = ""
parsers.each {|parser|
  parser.images = slicer.images
  css_code += parser.generate
}

File.open(config[:output] + "theme.css", File::WRONLY|File::TRUNC|File::CREAT) {|f| f.write(css_code) }