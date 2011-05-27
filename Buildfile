# ==========================================================================
# SproutCore JavaScript Framework - Buildfile
# copyright (c) 2009 - Apple Inc.
#           portions copyright Strobe Inc. and contributors
# ==========================================================================

# This buildfile defines the configurations needed to link together the 
# various frameworks that make up SproutCore.  If you want to override some
# of these settings, you should make changes to your project Buildfile 
# instead.

config :all, 
  :layout         => 'sproutcore:lib/index.rhtml',
  :test_layout    => 'sproutcore:lib/index.rhtml',
  :test_required  => ['sproutcore/testing'],
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

config :jquery,          :required => [], :test_required => [], :debug_required => []
config :yuireset,        :required => [], :test_required => [], :debug_required => []
config :handlebars,      :required => []
config :runtime,         :required => [:jquery]
config :'datetime/core', :required => [:runtime]
config :datetime,        :required => [:'datetime/core']
config :core_foundation, :required => [:runtime, :handlebars, :yuireset]
config :'datetime/localized', :required => [:core_foundation]
config :routing,         :required => [:core_foundation]
config :foundation,      :required => [:routing, :core_foundation, :datetime, :'datetime/localized', :ajax]
config :datastore,       :required => [:runtime, :datetime]
config :desktop,         :required => [:foundation]
config :media,           :required => [:desktop]
config :statechart,      :required => [:core_foundation], :test_required => [:core_foundation, :desktop]
config :ajax,            :required => [:runtime, :core_foundation]

# WRAPPER FRAMEWORKS
config :sproutcore, :required => [:desktop, :datastore, :statechart]
config :mini, :required => [:runtime, :datastore]
config :animation, :required => :foundation

config :qunit, :required => []
config :testing, :required => [:jquery], :test_required => [], :debug_required => []

# SPECIAL FRAMEWORKS AND THEMES
# These do not require any of the built-in SproutCore frameworks
%w(debug legacy_theme empty_theme).each do |target_name|
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

config :legacy_theme, 
  :required => :empty_theme, 
  :theme_name => 'sc-theme',
  :test_required  => ['sproutcore/testing'],
  :debug_required => ['sproutcore/debug']

config :ace, 
  :required => :empty_theme, 
  :theme_name => nil,
  :test_required  => ['sproutcore/testing'],
  :debug_required => ['sproutcore/debug'],
  :css_theme => 'ace'

# CONFIGURE APPS
config :core_tools, :required => [
  :desktop, :datastore, :animation, "sproutcore/experimental/forms",
  "sproutcore/ace", "sproutcore/experimental/split_view"
]

# mode :debug do
#   config :core_tools, :combine_javascript => false
# end

%w(tests test_controls welcome).each do |app_target|
  config app_target, 
    :required => [:desktop, :datastore, :core_tools],
    :theme => :ace

  # mode :debug do
  #   config app_target, :combine_javascript => false
  # end

end
