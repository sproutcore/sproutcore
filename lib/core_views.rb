############################################################
# CORE VIEW HELPERS
# These view helpers create simple views based on the options
# you pass in.  More complex components can be found in the 
# view_kit.

# Render an SC.View.  This is also the base for all other view helpers.
#
# :tag      the wrapper tag. default: 'div'
# :class    css class names. maybe a string or array.
# :panel    if true, view will display as a panel. default: false
# :visible  (bindable) if false, view will be hidden on page load. 
#           default: true
#
view_helper :view do
  var :inner_html
  var :tag, 'div'
  var :panel, false
  var :animate
  
  # passing in :field is like passing in :outlet but it also adds a 
  # property called fieldType
  var :field
  if @field
    @outlet = "#{@field.to_s}_field"
    property :field_key, @field.to_s.camelize(:lower), :constant => true
  end
  
  attribute :title

  # there are some standard JS properties
  bind :enabled, :key => 'isEnabled'
  bind :visible, :key => 'isVisible'

  property :enabled, :key => 'isEnabled'
  property :modal,   :key => 'isModal'
  property :custom_panel, :key => 'hasCustomPanelWrapper'
  property :localize 
  property :validator    
  property :field_label 
  property :accepts_first_responder
  property :content
  property :value
  property :content_value_key
  
  # For SC.SplitView support
  property :max_thickness
  property :min_thickness
  property :collapse_at_thickness
  property :can_collapse
  property :collapsed, :key => 'isCollapsed'
  
  # General delegate support
  property(:delegate) { |x| x }
  property :drop_target, :key => 'isDropTarget'

  # set panel type
  var :panel
  var :dialog
  var :picker
  pane_def = (@panel) ? 'panel' : (@dialog ? 'dialog' : (@picker ? 'picker' : nil))
  if pane_def.nil?
    property :pane, :key => 'paneType'
  else
    property :pane, pane_def, :key => 'paneType'
  end

  # pass in a hash of properties and they will be added to the JS:
  # :properties => { :prop_a => '1', :prop_b => '2' }
  var :properties
  if @properties
    @properties.each { | k, v | property(k,v) { |b| b } }
  end
  
  if @animate
    property :visible_animation, '', :constant => true do
      key_map = { 'complete' => 'onComplete' }
      animation_values = @animate.map do | k,v |
        normalized_key = k.to_s.downcase
        unless ['complete'].include?(normalized_key)
          v = prepare_for_javascript(v)
        end
        k = key_map[normalized_key] || k
        "#{k}: #{v}"
      end 
      %({ #{ animation_values * ',' } })
    end
  end
        
  view('SC.View') { properties }

  # deal with css classnames and styles.
  # Note that you can append either arrays or single strings or symbols 
  # here.  When the class names and styles are combined the ary will be
  # flattened
  var :class, :key => :class_names
  css_class_names << @class_names if @class_names
  
  var :enabled, true
  css_class_names << 'disabled' if @enabled == false
  
  var :style
  css_styles << @style unless @style.nil?
  
  # Standard CSS attributes you can pass as attributes to standard view helpers.
  common_css_keys = [:width, :height, :min_height, :max_height, :min_width, :max_width]
  
  common_css_keys.each do | key |
    value = var key
    if value
      value = "#{value.to_i}px" if value.kind_of?(Numeric)
      key = key.to_s.gsub('_','-')
      css_styles << "#{key}: #{value};"
    end
  end

  # render the basic content
  content { (@tag == 'img') ? %(<#{@tag} #{attributes} />) : %(#{ot}#{@inner_html}#{ct}) }
  
end

# Render an SC.LabelView.  Inherits from SC.View
#
# :formatter    Name of a formatter.
# :localize     (bindable) localize string
# :escape_html  (bindable) escapeHTML property
view_helper :label_view do
  property(:formatter) { |v| v }
  property :localize,   false
  property :editable, :key => 'isEditable'
  property :escape_html, true, :key => 'escapeHTML'
  property :value
  
  var      :label, nil
  var      :value, nil
  var      :tag, 'span'
  view     'SC.LabelView'
  
  css_class_names << 'sc-label-view'
  @inner_html = @label unless @label.nil?
  @inner_html = @value unless @value.nil?
end

# Render an SC.SpinnerView. Inherits from SC.View. You should bind 
# :visible usually.
#
# :src        Set the src of the spinner img. Defaults to 
#             "/images/spinner.gif"
view_helper :spinner_view do
  var :form, false
  var :src, '/images/spinner.gif'

  view 'SC.SpinnerView'
  if @form
    bind(:visible, ".owner.isCommitting", :key => 'isVisible') 
    self.outlet = 'commitSpinner'
  end
  
  unless @inner_html
    @inner_html = %(<img src="#{@src}" />)
  end
  attribute :class, 'spinner'
  
end

# Renders an SC.ProgressView.  Includes the default HTML structure.
#
# :enabled        (bindable) isEnabled property
# :indeterminate  (bindable) isIndeterminate property
# :value          (bindable) default value - float
# :maximum        (bindable) maximum value - float
# :minimum        (bindable) minimum value - float
view_helper :progress_view do
  property :enabled, :key => 'isEnabled'
  property :indeterminate, :key => 'isIndeterminate'
  property :value
  property :maximum
  property :minimum
  view 'SC.ProgressView'
  
  attribute :class, 'progress outer'
  unless @inner_html
    @inner_html = <<EOF
<div class="outer-head"></div>
<div class="inner">
<div class="inner-head"></div>
<div class="inner-tail"></div>
</div>
<div class="outer-tail"></div>
EOF
  end
end
  
view_helper :image_view do
  view 'SC.ImageView'
  property :content
  property :value
  
  attribute :src, static_url('blank')
  attribute :alt, ''
  var :tag, 'img'
  css_class_names << 'sc-image-view'
end

view_helper :container_view do
  view 'SC.ContainerView'
  property :content
end

view_helper :scroll_view do
  view 'SC.ScrollView'
  css_class_names << 'sc-scroll-view'
end

view_helper :segmented_view do
  property :value
  property :selection, :key => 'value'
  property :enabled, :key => 'isEnabled'
  property :allows_empty_selection

  # :segments should contains an array of symbols or a hash of
  # key => name pairs to be used to render the segment. Or you can
  # just create your own button views.
  var :segments
  var :theme, 'regular'
  if @segments
    @segments = [@segments].flatten unless @segments.instance_of?(Array)
    result = []
    first = true
    while seg = @segments.shift
      class_names = [@theme,'segment']
      class_names << ((first) ? 'segment-left' : ((@segments.size == 0) ? 'segment-right' : 'segment-inner'))
      first = false

      seg = [seg].flatten
      key = seg.first || ''
      label = seg.size > 1 ? seg.last : key.to_s.humanize.split.map { |x| x.capitalize }.join(' ')
      
      result << render_source.button_view(:outlet => "#{key}_button", :label => label, :tag => 'a', :class => class_names )
    end
    @inner_html = result * ''
  end
  
  view 'SC.SegmentedView'
  css_class_names << 'segments'
  
end

# Renders an SC.TabView.  Name outlets you want flipped *_tab
# If you want, you can also pass a set of segments to be displayed
# above the tab view 
view_helper :tab_view do
  var :segments
  
  property :now_showing
  property :lazy_tabs
  
  view 'SC.TabView'
  css_class_names << "tab"
  
  if @segments
    # if this tab view has segments automatically  attached, add class
    # name.
    css_class_names << 'segmented' 
    result = []
    result << render_source.segmented_view(:outlet => :segmented_view, :segments => @segments, :bind => { :value => '*owner.nowShowing' })
    result << render_source.view({:outlet => :root_view, :class => 'root'})
    @inner_html = [(result * ""), %(<div style="display:none;">), (@inner_html || ''), %(</div>)] * ""
  end
    
end

view_helper :scroll_view do
  view 'SC.ScrollView'
  css_class_names << 'sc-scroll-view'
end

view_helper :split_view do
  view 'SC.SplitView'
  property :direction, :key => 'layoutDirection'
  property :can_collapse_views
  
  var :direction, 'horizontal'
  css_class_names << 'sc-split-view'
  css_class_names << @direction
end

view_helper :split_divider_view do
  view 'SC.SplitDividerView'
  css_class_names << 'sc-split-divider-view'
end

