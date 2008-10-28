############################################################
# COLLECTION VIEW HELPERS
#
# Collection views render groups of views such as lists, tables, source lists,
# grids and so on.  The view helpers here will make that easy.
#
#

require_helpers 'core_views'

# Base Helper for a collection view.  Many times you will need 
# your collection view to actually appear inside of a scroll_view.  If
# this is the case, just pass :use_scroll_view => true.
#
# Note that many of the default views will set this to true by default.
#
view_helper :collection_view do
  property :content
  property :selection
  property :toggle, :key => 'useToggleSelection'
  property :selectable, :key => 'isSelectable'
  property :enabled, :key => 'isEnabled'
  property :act_on_select
  property(:example_view) { |v| v }
  property(:example_group_view) { |v| v }
  property :content_value_key
  property :group_visible_key
  property :group_title_key
  property :content_value_editable, :key => 'contentValueIsEditable'
  property :accepts_first_responder, true
  property :can_reorder_content
  property :can_delete_content
  
  property :content_icon_key
  property :content_checkbox_key
  
  # Unless the developer passes something specific, automatically enable
  # has_content_icon if either icon property is specified.
  var :content_icon_key
  property :has_content_icon, !!@content_icon_key
  
  # Unless the developer passes something specific, automatically enable
  # content branc if content_is_branch_property is defined.
  var :content_is_branch_key
  property :content_is_branch_key
  property :has_content_branch, !!@content_is_branch_key
  
  property :content_unread_count_key
  property :content_action_key
  
  property(:group, :key => 'groupBy') do |v|
    "['#{Array(v) * "','" }']"
  end
  
  property(:action) { |v| "function(ev) { return #{v}(this, ev); }" }
  view 'SC.CollectionView'
  
  css_class_names << 'sc-collection-view'
end

view_helper :list_view, :extends => :collection_view do 
  property :row_height
  view 'SC.ListView'
  css_class_names << 'sc-list-view'
end

view_helper :grid_view, :extends => :collection_view do
  property :row_height
  property :column_width
  view 'SC.GridView'
  css_class_names << 'sc-grid-view'
end

view_helper :source_list_view, :extends => :collection_view do
  view 'SC.SourceListView'
  css_class_names << 'sc-source-list-view'
end

view_helper :table_view, :extends => :collection_view do
  view 'SC.TableView'
  css_class_names << 'sc-table-view'
end

