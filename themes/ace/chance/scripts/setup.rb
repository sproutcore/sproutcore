#!/usr/bin/env ruby -wKU
#----------------------------------------------------------------------------
# Setup Script for Chance theme generator
# Copyright: ©2009-2010 Joshua Holt.
# License:   Licensed under MIT license
#----------------------------------------------------------------------------

require 'optparse'
require 'ostruct'
require 'pp'

class Setup
  
  def initialize(bin_dir=nil, name_of_program=nil, over_write=false)
    @bin_dir = bin_dir ? File.expand_path(bin_dir) : File.expand_path('~/.bin')
    @lib_loc = File.dirname(File.expand_path(File.dirname(__FILE__)))
    @nop = name_of_program ? "#{@bin_dir}/#{name_of_program}" : "#{@bin_dir}/chance"
    @should_overwrite = over_write
    @on_path = false
  end
  
  def bin_on_path?(arg)
    @on_path = arg
  end
  
  def executableContents
    <<-SCRIPT
    #!/usr/bin/env bash
    
    if [[ $1 != 'update' ]]; then
      #{@lib_loc}/chance.rb -i $1 $2
    else
      cd #{@lib_loc} && git pull
    fi
    SCRIPT
  end
  
  def createUserBinIfNeeded
    if !File.exist?(@bin_dir)
      Dir.mkdir(@bin_dir)
    end
    if !File.exist?(File.expand_path('~/.profile'))
      File.open(File.expand_path('~/.profile'), 'w') {|f| f.write("export PATH=#{@bin_dir}:$PATH") }
      system('source ~/.profile')
    else
      File.open(File.expand_path('~/.profile')).each do |line|
        if line == "export PATH=#{@bin_dir}:$PATH"
          bin_on_path?(true)
        end
      end
      
      File.open(File.expand_path('~/.profile'), 'a') {|f| f.write("export PATH=#{@bin_dir}:$PATH") } if !@on_path
      system('source ~/.profile')
    end
    self.report 'bin_created'
  end
  
  def writeExecutableIfNeeded
    if !File.exist?(@nop) || (File.exist?(@nop) && @should_overwrite)
      File.open(@nop, 'w') {|f| f.puts(self.executableContents) }
      File.chmod(0755, @nop)
    end
    self.report 'exe_created'
  end
  
  def report(action)
    case action
      when /bin_created/
        puts "-"*80
        puts "\t Personal bin directory is located @ #{@bin_dir}"
        puts "-"*80
      when /exe_created/
        puts "-"*80
        puts "\t Executable Located @ #{@nop}"
        puts "\t You can now generate your theme by issuing the following:"
        puts "\t\t #{File.basename(@nop)} theme-dir <theme-name>"
        puts "\t *** NOTE ** <theme-name> is optional"
        puts "-"*80
    end
  end
  
  def run
    self.createUserBinIfNeeded
    self.writeExecutableIfNeeded
  end
  
end

options = OpenStruct.new
options.bin_loc = nil
options.nop = nil
options.overwrite = false

optparse = OptionParser.new do |opts|
  
  opts.banner = "Usage:  #{File.basename($PROGRAM_NAME)} [options]"
  opts.separator ""

  opts.on('-b', '--bin_directory [DIRECTORY]', "The location of your personal bin directory (optional)") do |bd| 
    puts bd
    options.bin_loc = bd 
  end

  opts.on('-n', '--name_of_program [NAME]', "The name of the generated executable") do |nop| 
    options.nop = nop
  end

  opts.on('-ow', '--overwrite', "Should setup overwrite the previously generated executable?") do 
    options.overwrite = true
  end

  opts.on_tail('-h', '--help', "Display this screen.") do 
    puts opts
    exit 
  end
  
end

begin
  optparse.parse!(ARGV)
  Setup.new(options.bin_loc, options.nop, options.overwrite).run
rescue OptionParser::ParseError => e
  puts opts
  puts e
  exit
end