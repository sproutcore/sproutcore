SC.Formattable = {
    // Subclass of SC.Formatter
    formatter: null,
    // the key-path from the current object to the model that should be formatted
    formatterModelPath: '',
    // the key-path to the property that gets displayed in the view
    formatterViewValuePath: 'value',
    // the key-path tot he property that lets the formatter determine if the user is still editing
    formatterIsEditingPath: 'isEditing',
    
    // private methods --------------
    
    initMixin: function() {
        // TODO: add checks for valid values
        
        this._kvo_addLocalOrAbsoluteObserver(this.get('formatterViewValuePath'), this._vs_viewValueDidChange);
        this._kvo_addLocalOrAbsoluteObserver(this.get('formatterModelPath'), this._vs_modelValueDidChange);
        this._kvo_addLocalOrAbsoluteObserver(this.get('formatterIsEditingPath'), this._vs_didFinishEditing);
        
        this._vs_modelValueDidChange();
    },
    
    _vs_didFinishEditing: function() {
        if ( ! this.getPath(this.get('formatterIsEditingPath')))
            this._vs_modelValueDidChange();
    },
    
    _vs_getLocalOrAbsolutePath: function(localOrAbsolutePath) {
        // HACK: if first letter of the path is uppercase we assume it's an absolute path reference
        var firstChar = localOrAbsolutePath.charAt(0);
        if (firstChar === firstChar.toUpperCase()) {
            var tuple = SC.tupleForPropertyPath(localOrAbsolutePath, window);
            if ( ! tuple[0] || ! tuple[1])
                return null;
            return tuple[0].get(tuple[1]);
        }
        else
            return this.getPath(localOrAbsolutePath);
    },
    
    _vs_setLocalOrAbsolutePathIfChanged: function(localOrAbsolutePath, value) {
        // HACK: if first letter of the path is uppercase we assume it's an absolute path reference
        var firstChar = localOrAbsolutePath.charAt(0);
        if (firstChar === firstChar.toUpperCase()) {
            var tuple = SC.tupleForPropertyPath(localOrAbsolutePath, window);
            if ( ! tuple[0] || ! tuple[1])
                return null;
            return tuple[0].setIfChanged(tuple[1], value);
        }
        else
            return this.setPathIfChanged(localOrAbsolutePath, value);
    },
    
    _vs_modelValueDidChange: function() {
        if (this.getPath(this.get('formatterIsEditingPath')))
            return;
        
        var value = this._vs_getLocalOrAbsolutePath(this.get('formatterModelPath'));
        var serialized = this.get('formatter').stringFromNumber(value);
        this.setPathIfChanged(this.get('formatterViewValuePath'), serialized);
    },
    
    _vs_viewValueDidChange: function() {
        var serialized = this.getPath(this.get('formatterViewValuePath'));
        var value = this.get('formatter').numberFromString(serialized);
        this._vs_setLocalOrAbsolutePathIfChanged(this.get('formatterModelPath'), value);
    }
};