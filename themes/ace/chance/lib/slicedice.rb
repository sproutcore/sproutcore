# The Slicer object takes a set of images and slices them as needed, producing a set of images
# located in a hierarchy (for debugging purposes) in the output directory.
# The name will be: (output)/path/to/image.png_slice_rect_here.png
require 'rubygems'
require 'RMagick'
require 'FileUtils'
require 'pp'

class Slicer
  attr_accessor :images
  
  def initialize(config)
    @output_dir = config[:output]
    @optimization_limit = config[:optimization_limit]
  end
  
  # slice performs the slicing operations, putting the images in the output directory
  def slice
    image_set = []
    @images.each do |key, definition|
      path = definition[:path]
      
      x, y, width, height = 0, 0, 0, 0
      if definition[:rect].length > 0
        x, y, width, height = definition[:rect]
      end
      
      
      print "Processing " + path + "...\n"
      
      begin
        images = Magick::ImageList.new(path)
        if images.length < 1
          print "Could not open; length: ", images.length, "\n"
          next
        end
      rescue
        print "Could not open the file.\n"
        next
      end
      
      image = images[0]
      
      image_width, image_height = image.columns, image.rows
      if x < 0 then x = image_width + x end
      if y < 0 then y = image_height + y end
      if width == 0 then width = image_width - x end
      if height == 0 then height = image_height - y end
      
      # Crop image
      result = image.crop(x, y, width, height)
      
      # Write image: Skipped because we never read it back from disk
      # Besides, not good to put it in resources/, where it will get added to the build.
      # FileUtils.mkdir_p @output_dir + "slices/" + File.dirname(path)
      # slice_path = @output_dir + "slices/" + path + "_" + [x, y, width, height].join("_") + ".png"
      # result.write(slice_path)
      
      # update definition
      definition[:width] = width
      definition[:height] = height
      definition[:key] = key
      definition[:image] = result
      
      # add to new images collection
      image_set << definition
    end
    
    @image_list = image_set
  end
  
  # dice seems like it should continue that, but I just named it dice for fun. It really sprites things.
  def dice
    # For each target, for each try, plan out normal, x-repeat, and y-repeat.
    # Write out images for each target named target.png, target-x.png, and target-y.png.
    
    # Each "try" is a set of settings with which to attempt to generate a plan.
    # The wasted space that is returned with the plan is used to determine which try to use.
    # The spriter will usually try a x-repeat with the normal images first, then separate.
    # A certain amount of leeway should be given when X-repeat and normal are combined (an amount
    # of wasted space past which it would be impractical to keep them in the same file)
    #
    # Settings work as follows: an aim parameter specifies a multiple of a) the image width
    # b) the least common multiplier of all repeat pattern widths.
    tries = []
    10.times {|i| tries << {:aim=>i + 1} }
    
    images = @image_list
    
    sprites = images.select {|v| not v[:nosprite] }
    nonsprites = images.select {|v| v[:nosprite] }
    
    ximages = sprites.select {|v| v[:repeat] == "repeat-x" }
    yimages = sprites.select {|v| v[:repeat] == "repeat-y" }
    nimages = sprites.select {|v| v[:repeat] == "no-repeat" }
    
    plans = []
    tries.each {|try|
      # we will have either 2 or three images in any case. So,
      # we need to pick the best case: the smallest possible primary image.
      plans << [self.plan(ximages + nimages, try), self.yplan(yimages)]
      plans << [self.plan(nimages, try), self.plan(ximages, try), self.yplan(yimages)]
      
    }
    
    # sort by wasted space. The least wasted is the one we want.
    plans.sort! {|a, b|
      total_wasted_a = 0
      total_wasted_b = 0
      a.each {|e| total_wasted_a += e[:wasted] }
      b.each {|e| total_wasted_b += e[:wasted] }
      
      total_wasted_a -= @optimization_limit if a.length < 3
      total_wasted_b -= @optimization_limit if b.length < 3
      total_wasted_a <=> total_wasted_b
    }
    
    # Best plan is plan 0.
    planset = plans[0]
    new_image_hash = {}
    total_wasted = 0
    i = 0
    
    FileUtils.mkdir_p @output_dir + "images/"
    
    # Write static
    nonsprites.each {|nonsprite|
      i += 1
      filename = i.to_s + ".png"
      nonsprite[:sprite_path] = "images/" + filename
      new_image_hash[nonsprite[:key]] = nonsprite
      nonsprite[:image].write(@output_dir + "images/" + filename)
    }
    
    # Write plan
    planset.each {|plan|
      if not (plan and plan[:width] and plan[:width] > 0)
        next
      end
      target_image = Magick::Image.new(plan[:width], plan[:height]) {
        self.background_color = "transparent"
      }

      i += 1
      filename =  i.to_s + ".png"
      
      plan[:plan].each {|image|
        cols = image[:image].columns
        rows = image[:image].rows
        written_x = 0
        written_y = 0
        
        image[:sprite_path] = "images/" + filename
        image[:sprite_x] = image[:x] # just to be as specific as possible
        image[:sprite_y] = image[:y]
        new_image_hash[image[:key]] = image
        
        # loop through plan
        while written_y < image[:height] do
          while written_x < image[:width] do
            target_image.composite!(image[:image], image[:x] + written_x, image[:y] + written_y, Magick::CopyCompositeOp)
            written_x += [cols, image[:width]].min
          end
          written_y += [rows, image[:height]].min
        end
      }
      
      target_image.write(@output_dir + "images/" + filename)
      total_wasted += plan[:wasted]
    }
    
    print "Wasted pixels: ", total_wasted, "\n"
    @images = new_image_hash
  end
  
  # Plan the y-repeat images
  def yplan(images)
    # we go in direction: settings[:direction]. We sort the images first, biggest to smallest
    # based on their directional size (i.e. width for horizontal).
    # the first image in the sorted set is used to figure out the width or height of the image
    # (also using the config's units prop)
    wasted_pixels = 0
    plan = [] # images
    
    # Handle no images
    if images.length < 1
      return {:wasted=>0, :plan=>plan}
    end
    
    # sort images
    images = images.sort {|a, b|
      b[:width] <=> a[:width]
    }
    
    lcm = 1
    images.each {|image|
      lcm = lcm.lcm image[:height]
    }
    
    
    x = 0
    total_height = lcm
    
    # loop through images
    images.each {|image|
      width = image[:width]
      height = image[:height]
            
      img = image.dup
      
      # Set position
      img[:x] = x
      img[:y] = 0
      
      # handle repeated images
      img[:height] = total_height
      wasted_pixels += (total_height - height) * width
      
      # width!
      img[:width] = width
      
      # add to plan
      plan << img
      
      
      x += img[:width]
    }

    return {:plan=>plan, :width => x, :height => total_height, :wasted=>wasted_pixels}
  end
  
  # Settings={:direction=>}
  # Returns: {:wasted=>percent, :plan=>collection of clones of image hashes w/plan setings }
  # Wasted is the amount of a) empty space and b) extra space used by repeating patterns.
  # The width of the image is either a) the width of the 
  def plan(images, settings)
    # the first image in the sorted set is used to figure out the width or height of the image
    wasted_pixels = 0
    plan = [] # images
    
    # Handle no images
    if images.length < 1
      return {:wasted=>0, :plan=>plan}
    end
    
    # sort images
    images = images.sort {|a, b|
      res = b[:repeat] <=> a[:repeat] # keep non-repeats together (at begin).
      if res == 0
        res = b[:width] <=> a[:width]
        if res == 0
          res = b[:height] <=> a[:height] # sort these to get like ones together
        end
      end
      res
    }
    
    # Select images
    normal_images = images.select {|i|
      i[:anchor] == :none
    }
    anchor_left_images = images.select {|i|
      i[:anchor] == :left
    }
    anchor_right_images = images.select {|i|
      i[:anchor] == :right #or i[:clear] this was causing duplication if a left anchored image was also cleared :)
    }
    
    max = 0
    lcm = 1
    images.each {|image|
      max = [max, image[:width]].max
      if image[:repeat] == "repeat-x"
        lcm = lcm.lcm image[:width]
      end
    }
    
    # get unit (row/col) size
    unit_size = max
    unit_size = unit_size.lcm lcm
    
    total_width = unit_size * settings[:aim] # 1 is probably best... but we try many :)
    x = 0
    y = 0 # the current total secondary
    
    # loop through images. Each iteration represents a single row.
    while normal_images.length > 0 or anchor_left_images.length > 0 or anchor_right_images.length > 0
      x = 0
      row_height = 0
      row_space = total_width
      
      # Very first thing: handle repeat-x
      if normal_images.length > 0 and normal_images[0][:repeat] == "repeat-x"
        img = normal_images.shift.dup
        normal_width = img[:width]
        img[:width] = total_width
        img[:x] = 0
        img[:y] = y
        plan << img
        
        wasted_pixels += (total_width - normal_width) * (img[:height])
        row_space = 0
        row_height = img[:height]
      end

      # fit in anchor left first, if any
      left = anchor_left_images[0]
      if left and left[:width] <= row_space
        left = anchor_left_images.shift
        left = left.dup
        left[:x] = 0
        left[:y] = y
        plan << left
        
        x += left[:width]        
        row_height = [row_height, left[:height]].max
        row_space -= left[:width]
        
        row_space = 0 if left[:clear]
      end
      
      # now anchor right
      right = anchor_right_images[0]
      if right and right[:width] <= row_space
        right = anchor_right_images.shift
        right = right.dup
        right[:x] = total_width - right[:width]
        right[:y] = y
        plan << right
        
        row_height = [row_height, right[:height]].max
        row_space -= right[:width]
        row_space = 0 if right[:clear]
      end
      
      # Find first (largest) image that will fit
      put_any = false
      processed = []
      normal_images.each {|e|
        # skip those that can't fit
        if e[:repeat] == "repeat-x" or e[:width] > row_space
          next
        end
        
        # Get image
        processed.push(e)
        img = e.dup
      
        # Set position
        img[:x] = x
        img[:y] = y
      
        # add to plan
        plan << img
        
        x += img[:width]
        row_space -= img[:width]
        row_space = 0 if img[:clear]
        row_height = [row_height, img[:height]].max
        
        # If there isn't ANY space, just stop.
        break if row_space == 0
      }
      processed.each {|e| normal_images.delete(e) }
      
      while normal_images.length > 0 and normal_images[0][:repeat] != "repeat-x" and normal_images[0][:width] <= row_space
        img = normal_images.shift.dup
      
        # Set position
        img[:x] = x
        img[:y] = y
      
        # add to plan
        plan << img
        
        x += img[:width]
        row_space -= img[:width]
        row_space = 0 if img[:clear]
        row_height = [row_height, img[:height]].max
      end
      
      wasted_pixels += row_height * row_space  # empty space: free in PNG? Well, not for now, it isn't.
      y += row_height
    end
    
    return {:plan=>plan, :width => total_width, :height => y, :wasted=>wasted_pixels}
  end
end
