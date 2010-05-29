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
require 'pp'
require 'FileUtils'

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
  opts.on('-o', '--output [directory]', 'Set output path (default: resources/)') {|out|
    out += "." if out.length == 0
    out += "/" if out[out.length - 1] != '/'
    config[:output] = out
  }
  
  config[:url_template] = "static_url(\"%s\")"
  opts.on('-u', '--url [PATTERN]', 'The URL template (default: static_url(\"%s\") )') {|template|
    config[:url_template] = template
  }
  
  config[:extension] = "css"
  opts.on('-e', '--extension [ext]', "The extension for CSS files.") {|ext|
    config[:extension] = ext
  }
  
  config[:less] = false
  opts.on('--less', "Postprocess using LESS.") {
    config[:less] = true
  }
  
  config[:include_sc_theme] = true
  opts.on('--no-sc-theme', "Exclude 'sc-theme' prefix (newer themes with SC 1.1 can do this).") {
    config[:include_sc_theme] = false
  }
  
  config[:use_data_url] = false
  opts.on('--data-url', "Use data urls embedded in the CSS.") {
    config[:use_data_url] = true
  }
  
  config[:hue] = 1.0
  config[:saturation] = 1.0
  config[:brightness] = 1.0
  
  opts.on('--hue [def]', Float, 'Adjust hue (default 1.0)') {|v|
    config[:hue] = v
  }
  
  opts.on('--saturation [def]', Float, 'Adjust hue (saturation 1.0)') {|v|
    config[:saturation] = v
  }
  
  opts.on('--brightness [def]', Float, 'Adjust brightness (default 1.0)') {|v|
    config[:brightness] = v
  }
}

argparser.parse!
if ARGV.length > 0
  config[:theme_name] = ARGV[0]
end

require 'find'
images = {}
static_images = {}
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
    static_images.merge! parser.static_images
  end
end

#---------------------------------------------------------------------------
# TODO: ?
#   I should probably make this a boolean option and wrap this in an if
#   statement based on that option.
#---------------------------------------------------------------------------
# Copy all non-sprited images to respective dirs.
if static_images.length > 0
  static_images.values.each do |hsh|
    src_path = hsh[:path]
    match = /((\/images\/.*)(\/.*(\.png|\.jpg|\.gif)))/.match(src_path)
    if match
      location = match[2]
      new_loc = "#{config[:output].sub(/\/$/,'')}#{location}"
      FileUtils.mkdir_p(new_loc) if !File.exist?(new_loc)
      FileUtils.cp("#{src_path}", new_loc) if File.exist?(src_path)
    end
  end
end
# END Non-sprited image copy 


slicer = Slicer.new(config)
slicer.images = images
slicer.slice
slicer.dice

# Add all the code together
css_code = ""
parsers.each {|parser|
  parser.images = slicer.images
  css_code += parser.generate + "\n"
}

# Do some cleanup of whitespace
cleaned = ""
css_code.each_line {|line|
  cleaned += line.strip + "\n"
}

final = cleaned

if config[:less]
  begin
    require 'less'
  rescue
    raise "Lest less doth be installed, less shall remain unusable. Sad."
  end
  
  keyframes = {}
  
  # this is dirty; I took a shower after writing this
  # first group gets the animation name, the second captures the % keyframes
  webkitkeyframes_rule = /@\-webkit\-keyframes\s*([\w-]*)\s*{((\s*[\d]*%\s*{[^}]*})*)\s*}/
  cleaned.gsub!(webkitkeyframes_rule) do |match|
    keyframes[$1] = $2
    ".less-sucks-" + $1 + " { less: " + $1 + "; }"
  end
  
  lessed = Less.parse cleaned
  final = ""
  
  rev_webkitkeyframes_rule = /.less\-sucks\-\s*([^\s]*) { less: \1; }/
  lessed.gsub!(rev_webkitkeyframes_rule) do |match|
    "@-webkit-keyframes " + $1 + "{ " + keyframes[$1] + "}"
  end
  
  # LESS messes things up
  lessed.each_line {|line|
    final += line.gsub(/url\('data:image\/(gif|png);base64,(.*?)'\)/) do |match|
      "url('data:image/" + $1 + ";base64," + $2.gsub(" ", "+") + "')"
    end
  }
end


File.open(config[:output] + "theme." + config[:extension], File::WRONLY|File::TRUNC|File::CREAT) {|f| f.write(final) }