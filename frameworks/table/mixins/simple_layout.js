SC.SimpleLayout = {
	isLayout: YES,
	isDividedLayout: YES,

	layoutDirection: SC.LAYOUT_HORIZONTAL,

	thicknesses: null,
	thicknessesBindingDefault: SC.Binding.multiple(),

	totalThickness: 0,
	
	widthDelta: null,
	offsetDelta: null,
	
	thicknessPath: null,
	
	childViewsDidChange: function() {
		this._sl_layoutChildViews()
	}.observes('childViews'),
	
	_sl_layoutChildViews: function(indexes) {
		var childViews = this.get('childViews')
		this._offsetCache = null
		var last = null
		childViews.forEach(function(v, i) {
			if(!this.handleViewPosition || this.handleViewPosition(v))
				v.adjust(this.layoutForView(i, v))
			if(!v.spacer)
				last = i
		}, this)
		
		this.set('totalThickness', this.offsetForView(last + 1))
		this.adjust('minWidth', this.get('totalThickness'))
		this.set('calculatedWidth', this.get('totalThickness'))
	},

  layoutForView: function(idx, view) {
		var ret = {top: 0, left: 0, right: 0, bottom: 0}
		var direction = this.get('layoutDirection')
		if((direction == SC.LAYOUT_HORIZONTAL))
			delete ret['right']
		else
			delete ret['bottom']
		
		ret[(direction == SC.LAYOUT_HORIZONTAL) ? 'left' : 'top'] = this.offsetForView(idx, view)

		if(view.get('spacer'))
			ret[(direction == SC.LAYOUT_HORIZONTAL) ? 'right' : 'bottom'] = 0
		else
			ret[(direction == SC.LAYOUT_HORIZONTAL) ? 'width' : 'height'] = this.thicknessForView(idx, view)
			
		return ret
	},

	thicknessForView: function(idx, view) {
		if(!view)
			view = this.get('childViews').objectAt(idx)

		var path = this.get('thicknessPath')
		var ret = view.getPath(path)
		return ret + (this.widthDelta || 0)
	},

	offsetForView: function(idx, view) {
		var cache = this._offsetCache;
		if (!cache)
			cache = this._offsetCache = [];

		if(SC.none(this._offsetCache[idx])) {
			if(idx > 0)
				this._offsetCache[idx] = this.offsetForView(idx - 1) + this.thicknessForView(idx - 1)
			else
				this._offsetCache[idx] = this.startOffset || 0
				
			// this._offsetCache[idx] += (this.offsetDelta || 0)
		}
	
		return this._offsetCache[idx] + (this.offsetDelta || 0)
	},

	thicknessesDidChange: function() {
		var thicknesses = this.get('thicknesses')
		if (SC.none(thicknesses) || thicknesses === this._thicknesses) return this; // nothing to do
	
		var observer   = this._dv_thicknessesRangeObserver
		var func = this.thicknessesRangeDidChange;
	
	    // cleanup old content
		if(this._thicknesses)
			this._thicknesses.removeRangeObserver(observer)
	
		observer = thicknesses.addRangeObserver(null, this, func, null);      
		this._dv_thicknessesRangeObserver = observer ;
	
		this._thicknesses = thicknesses
		this.thicknessesRangeDidChange(null, null, '[]')
	}.observes('thicknesses'),
	
	thicknessesRangeDidChange: function(content, object, key, indexes) {
		this._sl_layoutChildViews(indexes);
	}

}