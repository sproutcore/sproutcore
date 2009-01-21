############################################################
# MENU VIEW HELPERS
#
# The view helpers defined in this file help you create popup menus.  You can
# define a menu in your RHTML helper to be used somewhere else with code like
# this:
#

# This is the quick way to define a menu item.  Use this approach if you just
# want to create a menu with item names and perform an action:
#
# <% menu_view :action_menu, :validate=>'My.controller.validate' do |m| %>
#   <%= m.item :item_1, 'Item 1', :action => 'doSomething' %>
#   <%= m.separator_item %>
#   <%= m.item :item_2, 'Item 2', :action => 'doAnother Thing' %>
# <% end %>
#
require_helpers 'core_views'
require_helpers 'button_views'

# This will create a popup menu.  You should define internal outlets 
# for the menu items.  More options to follow.
view_helper :popup_menu_view do
  var :tag, 'ul'
  view 'SC.PopupMenuView'
end

# Creates a menu item view.  Normally you don't want to create these 
# directly.  Instead use the menu_view helpers.
#
# OPTIONS:
# :action =>
#   The action to invoke when the menu item is selected.
#
# :label =>
#   The label for the menu item.
# 
# :icon =>
#   The icon for the menu item.  No icon will show if this is not set.
#   
# :shortcut =>
#   You must pass the actualy bit of HTML you want to display as a keyboard
#   shortcut
#
#   THE FOLLOWING PREVIOUS BEHAVIOR IS CURRENTLY DISABLED
#   The shortcut key for this menu item.  Shortcuts are only active when
#   the anchorview the popup menu is attached to is part of the in-focus
#   pane.  Shortcuts should be named in the standard input manager
#   syntax like this: alt_ctrl_shift_k (for Alt-Ctrl-Shift-K)
#
#   Note that on the web, Cmd (on the Mac) and Ctrl are equivalent. 
#   Always use ctrl when defining shortcuts.
# 
# :enabled (bindable) =>
#   Determines if the menu item will be enabled or not.  This is generally
#   handled by your validate method or through bindings.
# 
# :selected (bindable) =>
#   Determines if the menu item is selected or not.  May also be a mixed
#   state.  This is generally handled by your validate method or through
#   bindings.
# 
# :alt =>
#   name another item in this menu that is the alternate form of the 
#   receiver.  If the alt item is enabled, this one will be hidden and 
#   visa versa.
#
view_helper :menu_item_view, :extends => :button_view do

  # JavaScript
  view 'SC.MenuItemView'

  # HTML
  var :tag, 'li'
  var :shortcut
  # var(:shortcut) { |sc| sc.split('_').map { |x| x.capitalize } * '-' }
  css_class_names << 'menu-item'
  
  @my_href = @href || 'javascript:;'
  @href = nil
  @inner_html = [
    %(<a href="#{@my_href}">),
      '<span class="inner">',
        @image,
        %(<span class="label">#{@label}</span>),
      '</span>',
      '<span class="sel">&#x2713;</span>',
      '<span class="mixed">-</span>',
      %(<span class="shortcut">#{@shortcut}</span>),
    '</a>'
  ] * ''
  
end
