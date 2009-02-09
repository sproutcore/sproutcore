module("object.propertyChanges()", {	
	setup: function() {
		ObjectA = SC.Object.create({
			normal: 'value',
			normal1: 'zeroValue',
						
			action: function() {
				this.normal1= 'newValue';
			}.observes('normal'),
			
			normal2: 'dependentValue',
			normal3: 'notifiedValue',
			
			notifyAction: function() {
				this.normal3= 'newDependentValue';
			}.observes('normal2'),
			
			notifyAllAction: function() {
				this.normal2= 'newZeroValue';
				alert('notifyall');
			}.observes('normal1')			
		});
   	}
});

test("should increment the indicator before begining the changes to the object", function() {
    equals(ObjectA.beginPropertyChanges()._kvo_changeLevel, 1) ;
});

test("should increment the indicator before begining the changes to the object", function() {
    equals(ObjectA.endPropertyChanges()._kvo_changeLevel, 0) ;
});

test("should indicate that the property of an object has just changed", function() {
	equals(ObjectA.propertyWillChange('normal'),ObjectA) ;
	ObjectA.normal = 'newValue';
	equals(ObjectA.propertyDidChange('normal', null),ObjectA) ;
	equals(ObjectA.normal1,'newValue') ;
});

test("should notify that the property of an object has changed", function() {
	ObjectA.notifyPropertyChange('normal2','value');
	equals(ObjectA.normal3,'newDependentValue') ;
});

test("should notify all observers that their property might have changed", function() {
	ObjectA.allPropertiesDidChange();
	equals(ObjectA.normal2,'newZeroValue') ;
});

module("object.registerDependentKeys()", {	
	setup: function() {
		ObjectB = SC.Object.create({
			normal: 'value',
			normal1: 'zeroValue',
			normal2: 'dependentValue',
			
			init: function() {
				sc_super();
				ArrayKeys = ['normal','normal2'];
				this.registerDependentKey(ArrayKeys);
				this.registerDependentKey('normal1');
			},

			action: function() {
				this.normal1= 'newValue';
			}.observes('normal'),
		
			computed: function() {
				this.normal2='newZeroValue';
				return this.normal2;
			}.property()
		});
   	}
});

test("should indicate the change if the dependent key value changes - When registered as array of keys", function() {
	ObjectB.set('normal','newValue');
	equals(ObjectB.normal2, 'newZeroValue');
});

test("should indicate the change if the dependent key value changes - When registered as a key string", function() {
	ObjectB.set('normal1','newValue');
	equals(ObjectB.normal2, 'newZeroValue');
});

