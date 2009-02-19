# ==========================================================================
# SproutCore JavaScript Framework - Buildfile
# copyright (c) 2009 - Apple, Inc, Sprout Systems, Inc, and contributors
# ==========================================================================

# This buildfile defines the configurations needed to link together the 
# various frameworks that make up SproutCore.  If you want to override some
# of these settings, you should make changes to your project Buildfile 
# instead.

config :all, 
  :layout         => 'sproutcore:lib/index.rhtml',
  :test_layout    => 'sproutcore:lib/index.rhtml',
  :test_required  => ['sproutcore/testing', 'sproutcore/empty_theme'],
  :debug_required => ['sproutcore/debug']
  
config :runtime,   :required => []
config :foundation, :required => [:runtime]
config :datastore,  :required => [:foundation, :runtime]

config :desktop,    
  :required => [:runtime, :datastore, :foundation]

config :mobile,    
  :required => [:runtime, :datastore, :foundation]

config :deprecated, :required => :desktop
config :sproutcore, :required => :desktop

# Setup special frameworks and themese that do not need to include std
# dependencies
%w(testing debug standard_theme empty_theme).each do |target_name|
  config target_name,
    :required => [], :test_required => [], :debug_required => []
end

# setup theme name
config :empty_theme, :theme_name => 'empty-theme'

# Exception: standard_theme is based on the empty_theme
config :standard_theme, 
  :required => :empty_theme, :theme_name => 'sc-theme'
