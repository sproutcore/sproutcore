############################################################
# FORM VIEW HELPERS
#
# These view helpers make it easy to create input forms.  You should wrap
# your form in the form_view tag and include your fields inside.
#

require_helpers 'core_views'

# Defines a form view.  Note that you can make this form into a panel
# by passing :panel => true
view_helper :form_view do

  property :content
  property :enabled, :key => 'isEnabled'
  property :valid, :key => 'isValid'
  property :commiting, :key => 'isCommitting'
  property :dirty, :key => 'isDirty'
  property :errors
  property :error_count, :key => 'errorCount'
  property :autocommit
  property :prompt, :key => 'commitPrompt'
  view 'SC.FormView'
  
  attribute :action, ''
  attribute :method, 'post'
  var :tag, 'form'
end

view_helper :error_explanation_view do
  
  # JavaScript
  view 'SC.ErrorExplanationView'
  
  # HTML
  var :tag,  'ul'
  css_class_names << 'errors'
end

view_helper :checkbox_field_view do

  # JavaScript
  property :value
  property :enabled, :key => 'isEnabled'
  view 'SC.CheckboxFieldView'

  # HTML
  var :tag, 'input'
  var :label

  attribute :type, 'checkbox'
  attribute :name, @item_id
  
  # if a label is passed, then wrap the checkbox in a label tag and 
  # place the label text next to it.
  if @label
    content { %(<label><#{@tag} #{attributes} /> <span class="label">#{@label}</span></label>) }
  else
    content { "<#{@tag} #{attributes} />" }
  end
end 

# This renders a list of radio buttons.
#
# :values => [REQ]
#   Set this to the values you want displayed in the radio buttons. You
#   can pass an array here of strings or symbols, in which case these will
#   be used as the values for the buttons and the names will be created
#   from them.  Or you can pass an array of arrays.  The first items is
#   the key value, the second item is the human readable value.
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
# :objects =>
#   This can point to a hash of objects which will be used to convert the
#   key values you set into JS objects.
# 
# :value =>
#   The current value of the radio buttons.
#
view_helper :radio_field_view do
  
  #JavaScript
  bind :objects
  property :value
  view 'SC.RadioFieldView'
  
  # HTML

  # Get the width styles out of the main style to put into the individual
  # radio items.
  css_styles.flatten!
  @label_styles = css_styles.reject { |p| !(p =~ /width:/) }
  css_styles.reject! { |p| @label_styles.include?(p) }
  
  if @label_styles.size > 0
    @label_styles = %( style="#{@label_styles * ' '}" )
  else
    @label_styles = ''
  end
  
  # get the layout mode.
  var :layout, :vertical
  css_class_names << 'radio' # default class
  css_class_names << @layout if @layout
  
  var :tag, 'div'
  
  # generate the inner-html
  var :values
  html = @values.map do | v |
    v = [v].flatten
    key = v.first
    label = (v.size > 1) ? v[1] : key.to_s.humanize
    %(<label><input type="radio" name="#{item_id}" value="#{key}" #{@label_styles} /><span class="label">#{label}</span></label>)
  end
  @inner_html = html * "\n"
   
end


  
view_helper :text_field_view do
  var :tag, 'input'

  view 'SC.TextFieldView'
  property :field_value
  property :value, :key => :field_value
  property :hint
  property :validate, :key => :validator
  property :label, :key => 'fieldLabel'
  
  attribute :size
  attribute :type, 'text'
  attribute :label
  attribute :name
  content { "<#{@tag} #{attributes} />" }
end

view_helper :password_field_view, :extends => :text_field_view do
  attribute :type, 'password'
end

view_helper :text_area_view do
  var :form, false
  var :tag, 'textarea'
  var :value, @inner_html
  
  if @form
    view nil
  else
    view 'SC.TextareaFieldView'
    property :hint
    property :field_value
    property :value
  end
  
  attribute :cols, 72
  attribute :rows, 10
  attribute :validate
  attribute :label
  attribute :name
  attribute :form, :key => :name
  content { "#{ot}#{@value}#{ct}" }
end

# This view renders a browser-native popup menu.
#
# :field =>
#   pass a name to make this part of the enclosing form.
#
# :options => 
#   This will statically generate the HTML for the options menu.  The 
#   value of this property should be an array of items containing strings
#   or symbols, which will form both the item names and values or you can 
#   pass an array of arrays.  The first item should be the value of the 
#   object, then second item should be the name of the menu.
# 
#   Note that if you bind to the :objects property, then that binding 
#   will override this code.      
#
# :name_key =>
#   Specifies the key to use to get the name of a menu item from the 
#   array of objects.  This is only used if the menu items are generated
#   dynamically.
#
# :sort_key =>
#   Optional sort key to use to order the menu.  If the sort key is not
#   passed, the name of the menu items will be used.  This is only used
#   if the menu items are generated dynamically.
#
# :value_key =>
#   Optional key used to get the value for each menu item from the
#   array of objects.  Only used if the menu items are generated 
#   dynamically.
#
# :empty =>
#   Optional.  Pass the string name of the "Empty" menu item.  This item
#   will appear at the top of the menu and its value will be a null
#   object.  The value you pass here will be localized by default.  Only
#   used if the menu items are generated dynamically.
#
# :localize =>
#   Optional.  If true, the names of the menu items and the empty menu
#   item will be passed through the localization system.  Defaults to 
#   false.
#
# :validator =>
#   Optional. Pass the name of a validator and it will be used for this
#   control.
#
# BINDABLE PROPERTIES
#
# :objects =>
#   bind to an array of objects used to generate the menu item.  This will
#   override any hard-coded options you pass through the :options param.
#
# :value =>
#   bind to the current value to show in the pop-up menu.  
#
# :enabled =>
#   bind or pass to set the control to enabled or disabled.
# 
view_helper :select_field_view do
  # JavaScript
  property :name_key
  property :sort_key
  property :value_key
  property :empty, :key => 'emptyName'
  property :enabled, :key => 'isEnabled'
  bind     :objects
  view     'SC.SelectFieldView'
  
  # HTML
  var :tag, 'select'
  var :options
  if @options
    html = @options.map do |opt|
      opt = [opt].flatten
      key = opt.first
      name = (opt.size > 1) ? opt[1] : key.to_s.titleize
      %(<option value="#{key}">#{name}</option>)
    end
    @inner_html = html * "\n"
  end
end
