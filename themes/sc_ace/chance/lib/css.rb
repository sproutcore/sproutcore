require 'set'

class CSSParser
  attr_accessor :images, :contents
  def initialize(directory, file, config)
    @directory = directory
    @file = file
    @theme = config[:theme_name]
    @config = config
    @images = {  }
  end
  
  def parse
    # first, read file
    file = File.new(@directory + "/" + @file)
    contents = ""
    file.each {|line| contents += line}
    @contents = contents
    
    self.parse_rules
    self.parse_sprites
  end
  
  def parse_rules
    # parses @theme "name"
    # and @view(viewname)
    contents = @contents
    
    view_rule = /@view\(\s*(["']{2}|["'].*?[^\\]"|[^\s]+)\s*\)/
    
    theme_name = @theme
    contents.gsub!(view_rule) do |match|
      #".sc-view." + $1 + "." + theme_name # If SproutCore changes some
      ".sc-theme .sc-view." + @theme + "." + $1
    end
    
    @contents = contents
  end
  
  def parse_sprites
    contents = @contents
    
    # A whole regexp would include: ([\s,]+(repeat-x|repeat-y))?([\s,]+\[(.*)\])?
    # but let's keep it simple:
    sprite_directive = /sprite\(\s*(["']{2}|["'].*?[^\\]['"]|[^\s]+)(.*?)\s*\)/
    contents = contents.gsub(sprite_directive) do | match |
      # prepare replacement string
      replace_with_prefix = "sprite_for("
      replace_with_suffix = ")"
      
      # get name and add to replacement
      image_name = $1
      args = $2
      image_name = $1.sub(/^["'](.*)["']$/, '\1')
      
      result_hash = { 
        :path => File.expand_path(@directory + "/" + image_name), :image => image_name,
        :repeat => "no-repeat", :rect => [], :target => "",
        :anchor => :none, :clear => false
      }
      
      # Replacement string is made to be replaced again in a second pass
      # first pass generates manifest, second pass actually puts sprite info in.
      
      # match: key words (Separated by whitespace) or rects.
      args.scan(/(\[.*?\]|[^\s]+)/) {|r|
        arg = $1.strip
        if arg.match(/^\[/)
          # A rectangle specifying a slice
          full_rect = []
          params = arg.gsub(/^\[|\]$/, "").split(/[,\s]+/)
          if params.length == 1
            full_rect = [params[0].to_i, 0, 0, 0]
          elsif params.length == 2
            full_rect = [params[0].to_i, 0, params[1].to_i, 0]
          elsif params.length == 4
            full_rect = params.map {|e| e.to_i}
          else
            
          end
          
          result_hash[:rect] = full_rect
        else
          # a normal keyword, probably.
          if arg == "repeat-x"
            result_hash[:repeat] = "repeat-x"
          elsif arg == "repeat-y"
            result_hash[:repeat] = "repeat-y"
          elsif arg == "anchor-right"
            result_hash[:anchor] = :right
          elsif arg == "anchor-left"
            result_hash[:anchor] = :left
          elsif arg == "clear"
            result_hash[:clear] = true
          end
        end
      }
      
      image_key = result_hash[:repeat] + ":" + result_hash[:rect].join(",") + ":" + result_hash[:path]
      replace_with = replace_with_prefix + image_key + replace_with_suffix
      @images[image_key] = result_hash
      
      replace_with
    end
    
    @contents = contents
  end
  
  def generate
    contents = @contents
    contents = contents.gsub(/sprite_for\(\s*(["']{2}|["'].*?[^\\]["']|.*?)\s*\)/) {|match|
      key = $1
      result = ""
      if @images.key? key
        image = @images[key]
        result = (@config[:url_template] % [image[:sprite_path]])
        
        if image[:anchor] == :none
          result += " -" + image[:sprite_x].to_s + "px"
        else
          result += (image[:anchor] == :right ? " right" : " left")
        end
        
        result += " -" + image[:sprite_y].to_s + "px"
        result += " " + image[:repeat]
      else
        puts "Did not find image with key: ", key
      end
      
      result
    }
    return contents
  end
end