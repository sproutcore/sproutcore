############################################################
# BUTTON VIEW HELPERS
#
# You can do a lot of different things with buttons: push buttons, switches,
# checkboxes, radio buttons and more.  This file contains the helpers you can
# use to help you build these.
#

require_helpers 'core_views'

# This is the core button_view helper.  Most other helpers in this file
# descend from this helper.  If a helper is not provided that already
# builds the button you want, you can probably use this helper to
# construct it yourself.
#
# :enabled (bindable) =>
#   If set to true, the button will be enabled.
#
# :selected (bindable) =>
#   Set to true, false or :mixed.  This will determine if the button
#   appears selected.  You can bind to this option but more often you will
#   want to bind to :value.
#
# :default (bindable) =>
#   Set to true to make this button the default button triggered when 
#   you press return while focused in a panel or form.
# 
# :cancel (bindable) =>
#   Set to true to make this button the one triggered when you press
#   return while focused on a panel or form.
# 
# :theme => :regular | :back | :checkbox | :radio | :square | 
#           (your own theme)
#   Use this to set the theme appearance of the button.  The SC theme
#   comes with built-in support for the ones listed above or you can
#   name your own.  a CSS class name will be assigned to the button with
#   this theme name.
#
# :behavior => :push, :toggle, :on, :off
#   Specify the behavior of the button when pressed.  The default is
#   :push.
#
# :tag =>
#   The tag name to use for the button.  Defaults to 'a'.  If the tag is
#   'a', an href="javascript:;" will be added automatically unless you
#   specify an alternate.
#
# :href =>
#   optional href to pass.  Generall you don't want to pass this.
# 
# :label => 
#   The value of the label placed inside the button.  You can alternately
#   specify inner_html which will be used a the label.  Note that the
#   button_view generator automatically wraps your inner_html with a
#   standard button structure unless you pass :label => false
#
# :image =>
#   Renders an image tag on the outside of the label span.  If this is
#   set, then the wrapping tag will also have 'image' css class applied.
# 
# :sprite => [resource_url, x-ofset, y-offset]
#   Render an image sprite!  The expected size of the sprite depends on
#   the class name of the view.   If the x-offset or y-offset are numbers
#   they will be converted to "px".  If this is set, then the wrapping
#   tag will also have 'sprite' css class applied.
#
#   Alternatively, name the CSS class you want assigned to the img for 
#  the sprite.
#
view_helper :button_view do
  # JavaScript
  property :enabled, :key => 'isEnabled'

  property :action
  property :target
  
  #property(:action) { |v| "function(ev) { return #{v}(this, ev); }" }
  property :default, :key => 'isDefault'
  property :cancel, :key => 'isCancel'
  property :value
  property :theme
  property :size
  property :behavior, :key => 'buttonBehavior'
  property :toggle_on_value
  property :toggle_off_value

  property :key_equivalent, :key => :keyEquivalent


  property(:selected, :key => 'isSelected') do |x|
    (x == :mixed) ? 'SC.MIXED_STATE' : x
  end

  view 'SC.ButtonView'

  # HTML
  var :title
  var :label, @title || @inner_html || 'Submit'
  var :tag, 'a'
  var :theme, :regular
  var :size, :normal

  attribute(:href) { |x| (x.nil? && (@tag.downcase.to_s == 'a')) ? 'javascript:;' : x } 

  # Add the theme to the CSS class.
  css_class_names << 'sc-button-view'
  css_class_names << 'button'
  css_class_names << @theme unless @theme.nil? || @theme == false
  css_class_names << @size unless @size.nil? || @size == false

  var :image
  var :sprite
  
  if @image
    @image = %(<img src="#{@image}" />)
    css_class_names << 'image'

  elsif @sprite
    img_url = self.blank_url
    
    if @sprite.instance_of?(Array)
      xoff = @sprite[1] 
      xoff = "#{xoff}px" if xoff.kind_of?(Numeric)

      yoff = @sprite[2]
      yoff = "#{yoff}px" if yoff.kind_of?(Numeric)
    
      # render image part
      @image = %(<img class="sprite" style="background: url(#{@sprite[0]}) no-repeat #{xoff} #{yoff};" src="#{img_url}" />)
    
    else
      @image = %(<img class="#{@sprite} sprite" src="#{img_url}" />)
    end
    
  end
  
  # Generate some standard HTML for unless :label => false.
  unless @label == false
    # Button Width properties must be set on the inner label.  To deal 
    # with this remove any width style properties from the parent element 
    # and append them to the inner label.
    @label_style = []
    css_styles.flatten!
    css_styles.reject! do | part |
      if part =~ /width:/
        @label_style << part
        true
      else
        false
      end
    end
    if @label_style.size > 0
      @label_style = %(style="#{@label_style * ' '}" )
    else
      @label_style = ''
    end

    # Avoid doing the normal thing for anchor tags.
    @inner_html = %(<span class="button-inner">#{@image}<span #{@label_style}class="label">#{@label}</span></span>)

  else
    @inner_html = [@image,@inner_html] * ''
  end
  
end



view_helper :popup_button_view, :wraps => :button_view do
  parent_helper
  property :menu, :key => :menuName
  view 'SC.PopupButtonView'
end


# Renders a disclosure triangle.
view_helper :disclosure_view, :wraps => :button_view do
  opts = { :theme => :disclosure }
  opts[:label] = false if options[:label].nil?
  parent_helper(opts)
  
  view 'SC.DisclosureView'
  @inner_html = [%(<img class="button" src="#{blank_url}" />)]
  @inner_html << %(<span #{@label_style}class="label">#{@label}</span>) if @label
  @inner_html = @inner_html.join('')

  css_class_names << 'sc-disclosure-view'
end

  
# Renders a checkbox.  If you pass a label this will render the label
# text next to the checkbox. Unlike button_view, passing no :label is
# the same as passing :label => false.
view_helper :checkbox_view, :wraps => :button_view do
  opts = { :theme => :checkbox }
  opts[:label] = false if options[:label].nil?
  parent_helper(opts)
  
  # provide some defaults to the JavaScript.
  view 'SC.CheckboxView'
  
  # render checkbox HTML.
  css_class_names << 'sc-checkbox-view'

  img_url = self.blank_url
  @inner_html = [%(<img class="button" src="#{img_url}" />)]
  @inner_html << %(<span #{@label_style}class="label">#{@label}</span>) if @label
  @inner_html = @inner_html.join ''
end

# Renders a radio buton.  If you pass a label this will render the label
# text next to the checkbox. Unlike button_view, passing no :label is
# the same as passing :label => false.
view_helper :radio_view, :wraps => :button_view do
  opts = { :theme => :radio }
  opts[:label] = false if options[:label].nil?
  parent_helper(opts)
  
  view 'SC.RadioView'
  
  css_class_names << 'sc-radio-button-view'
  
  # render checkbox HTML.
  img_url = self.blank_url
  @inner_html = [%(<img class="button" src="#{img_url}" />)]
  @inner_html << %(<span #{@label_style}class="label">#{@label}</span>) if @label
  @inner_html = @inner_html.join ''
end

# This renders a group of radio buttons.  The buttons are controlled by
# a RadioGroupView that will map the value to a set of selection states.
#
# :values => [REQ]
#   Set this to the values you want displayed in the radio buttons. You
#   can pass an array here of strings or symbols, in which case these will
#   be used as the values for the buttons and the names will be created
#   from them.  Or you can pass an array of arrays.  The first items is
#   the key value, the second item is the human readable value. 
#   Alternatively, you can set the inner_html of your view to include
#   radio buttons as outlets.  In this case, you must name the outlets
#   :key_button.
#
# :layout => :horizontal | :vertical 
#   This will write out horizontal or vertical to the CSS class names so
#   you can control the layout of your radio buttons.
#
# :width  =>
#   This will set the width of each item in the view.
#
# BINDABLE OPTIONS
#
# :value =>
#   The current value of the radio buttons.
#
view_helper :radio_group_view do
  
  #JavaScript
  property :value
  view 'SC.RadioGroupView'
  
  # HTML

  # get the layout mode.
  var :layout, :vertical
  css_class_names << 'sc-radio-group-view'
  css_class_names << 'radio'
  css_class_names << @layout if @layout
  
  var :tag, 'span'

  # If a set of values was passed, build the button views automatically.
  var :values
  if @values
    # Get the width styles out of the main style to put into the 
    # individual radio items.
    css_styles.flatten!
    @label_styles = css_styles.reject { |p| !(p =~ /width:/) }
    css_styles.reject! { |p| @label_styles.include?(p) }

    if @label_styles.size > 0
      @label_styles = %( style="#{@label_styles * ' '}" )
    else
      @label_styles = ''
    end
    
    # save off client_builder.  The context this is run in later will 
    # not retain the client_builder
    current_client_builder = self.client_builder
    html = @values.map do | v |
      v = [v].flatten
      key = v.first
      label = (v.size > 1) ? v[1] : key.to_s.humanize
      render_source.radio_view(:outlet => true, :label => label, :style => @label_styles, :toggle_on_value => key, :toggle_off_value => nil, :client => self.client_builder)
    end
    
    @inner_html = html * "\n"
  end
end

# Renders a slider view.
view_helper :slider_view do
  
  property :minimum
  property :maximum
  property :step
  view 'SC.SliderView'
  
  css_class_names << 'sc-slider-view'
  
  @label_style = []
  css_styles.flatten!
  css_styles.reject! do | part |
    if part =~ /width:/
      @label_style << part
      true
    else
      false
    end
  end
  if @label_style.size > 0
    # subtract the extra space required
    @label_style = @label_style.map { |x| x.gsub(/[0-9]+/,($1.to_i-48).to_s)}
    @label_style = %(style="#{@label_style * ' '}" )
  else
    @label_style = ''
  end
  
  @inner_html = %(<span class="outer"><span #{@label_style} class="inner"></span><img src="#{self.blank_url}" class="sc-handle" /></span>)
  
end
