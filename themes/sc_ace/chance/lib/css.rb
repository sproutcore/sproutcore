require 'set'

class CSSParser
  attr_accessor :images, :contents, :static_images
  def initialize(directory, file, config)
    @directory = directory
    @file = file
    @theme = ""
    if !config[:theme_name].nil?
      @theme = "." + config[:theme_name]
    end
    @config = config
    @images = {  }
    @static_images = { }
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
    
    view_rule = /(@view|@theme|@end)(\(\s*(["']{2}|["'].*?[^\\]"|[^\s]+)\s*\))?;?/
    
    theme_name = @theme
    theme_parts = [theme_name]
    contents.gsub!(view_rule) do |match|
      #".sc-view." + $1 + "." + theme_name # If SproutCore changes some
      if $1 == "@view"
        tn = ""
        if @config[:include_sc_theme]
          tn = ".sc-theme"
        end
        tn + ".sc-view" + theme_name + "." + $3
      elsif $1 == "@theme"
        theme_parts.push $3
        theme_name = theme_parts.join "."
        ""
      elsif $1 == "@end"
        theme_parts.pop
        theme_name = theme_parts.join "."
        ""
      end
    end
    
    boxshadow_rule = /\-sc\-box\-shadow:\s*([^;]*)/
    contents.gsub!(boxshadow_rule) do |match|
      "-moz-box-shadow: " + $1 + "; -webkit-box-shadow: " + $1 + "; box-shadow: " + $1
    end
    
    borderradius_rule = /\-sc\-border\-radius:\s*([^;]*)/
    contents.gsub!(borderradius_rule) do |match|
      "-moz-border-radius: " + $1 + "; -webkit-border-radius: " + $1 + "; border-radius: " + $1
    end
    
    borderradius_topleft_rule = /\-sc\-border\-top\-left\-radius:\s*([^;]*)/
    contents.gsub!(borderradius_topleft_rule) do |match|
      "-moz-border-radius-topleft: " + $1 + "; -webkit-border-top-left-radius: " + $1 + "; border-top-left-radius: " + $1
    end
    
    borderradius_topright_rule = /\-sc\-border\-top\-right\-radius:\s*([^;]*)/
    contents.gsub!(borderradius_topright_rule) do |match|
      "-moz-border-radius-topright: " + $1 + "; -webkit-border-top-right-radius: " + $1 + "; border-top-right-radius: " + $1
    end
    
    borderradius_bottomleft_rule = /\-sc\-border\-bottom\-left\-radius:\s*([^;]*)/
    contents.gsub!(borderradius_bottomleft_rule) do |match|
      "-moz-border-radius-bottomleft: " + $1 + "; -webkit-border-bottom-left-radius: " + $1 + "; border-bottom-left-radius: " + $1
    end
    
    borderradius_bottomright_rule = /\-sc\-border\-bottom\-right\-radius:\s*([^;]*)/
    contents.gsub!(borderradius_bottomright_rule) do |match|
      "-moz-border-radius-bottomright: " + $1 + "; -webkit-border-bottom-right-radius: " + $1 + "; border-bottom-right-radius: " + $1
    end
    
    @contents = contents
  end
  
  def parse_sprites
    contents = @contents
    
    # A whole regexp would include: ([\s,]+(repeat-x|repeat-y))?([\s,]+\[(.*)\])?
    # but let's keep it simple:
    sprite_directive = /(sprite|static_url)\(\s*(["']{2}|["'].*?[^\\]['"]|[^\s]+)(.*?)\s*\)/
    contents = contents.gsub(sprite_directive) do | match |
      # prepare replacement string
      replace_with_prefix = "sprite_for("
      replace_with_suffix = ")"
      
      # get name and add to replacement
      type = $1
      image_name = $2
      args = $3
      image_name = $2.sub(/^["'](.*)["']$/, '\1')
      
      result_hash = { 
        :path => File.expand_path(@directory + "/" + image_name), :image => image_name,
        :repeat => "no-repeat", :rect => [], :target => "",
        :anchor => :none, :clear => false, :nosprite => (type == "static_url")
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
        
        # Only put repeat data if not sprited
        if not image[:nosprite]
          result += " #{image[:repeat]}"
          if image[:anchor] == :none
            result += image[:sprite_x] == 0 ? " #{image[:sprite_x]}" : " -#{image[:sprite_x]}px"
          else
            result += (image[:anchor] == :right ? " right" : " left")
          end
          result += image[:sprite_y] == 0 ? " #{image[:sprite_y]}" : " -#{image[:sprite_y]}px"
        end
        
      else
        puts "Did not find image with key: ", key
      end
      
      result
    }
    return contents
  end
end