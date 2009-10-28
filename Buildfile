# ==========================================================================
# SproutCore JavaScript Framework - Buildfile
# copyright (c) 2009 - Apple Inc.
#           portions copyright Sprout Systems Inc. and contributors
# ==========================================================================

# This buildfile defines the configurations needed to link together the 
# various frameworks that make up SproutCore.  If you want to override some
# of these settings, you should make changes to your project Buildfile 
# instead.

config :all, 
  :layout         => 'sproutcore:lib/index.rhtml',
  :test_layout    => 'sproutcore:lib/index.rhtml',
  :test_required  => ['sproutcore/testing', 'sproutcore/empty_theme'],
  :debug_required => ['sproutcore/debug', 'sproutcore/testing']

# in debug mode, combine the JS for SC by default.  This will improve perf
# while working with apps.  If you are hacking SC itself, you can turn this
# off in your project buildfile by referencing sproutcore specifically
mode :debug do
  config :all, 
    :combine_javascript => true,
    :combine_stylesheet => true
end

# CORE FRAMEWORKS
config :bootstrap,  :required => [], :use_modules => false

config :runtime,    :required => []
config :foundation, :required => [:runtime]
config :datastore,  :required => [:runtime]

# APP-LEVEL FRAMEWORKS
%w(desktop mobile).each do |app_framework|
  config app_framework, :required => [:runtime, :datastore, :foundation]
end

config :mobile, 
  :layout         => 'sproutcore/mobile:lib/index.rhtml',
  :test_layout    => 'sproutcore/mobile:lib/index.rhtml'

# WRAPPER FRAMEWORKS
config :sproutcore, :required => :desktop
config :mini, :required => [:runtime, :datastore]

# SPECIAL FRAMEWORKS AND THEMES
# These do not require any of the built-in SproutCore frameworks
%w(testing debug standard_theme empty_theme).each do |target_name|
  config target_name, 
    :required => [], :test_required => [], :debug_required => []
end

# CONFIGURE THEMES
config :empty_theme, 
  :theme_name => 'empty-theme',
  :test_required  => ['sproutcore/testing'],
  :debug_required => ['sproutcore/debug']

config :iphone_theme, 
  :theme_name     => 'iphone-theme',
  :required       => [],
  :test_required  => ['sproutcore/testing'],
  :debug_required => ['sproutcore/debug']

config :standard_theme, 
  :required => :empty_theme, 
  :theme_name => 'sc-theme',
  :test_required  => ['sproutcore/testing'],
  :debug_required => ['sproutcore/debug']

# CONFIGURE APPS

config :core_tools, :required => [:desktop]

# mode :debug do
#   config :core_tools, :combine_javascript => false
# end

%w(tests docs welcome).each do |app_target|
  config app_target, 
    :required => [:desktop, :core_tools], 
    :theme => :standard_theme
    
  # mode :debug do
  #   config app_target, :combine_javascript => false
  # end
  
end
 