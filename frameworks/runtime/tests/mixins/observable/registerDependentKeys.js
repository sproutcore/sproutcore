	module("object.registerDependentKeys()", {	
		setup: function() {
			RegisterObject = SC.Object.create({

   				// normal properties
   				firstName:  'John',
   				lastName:   'Doe',
				observedValue: '',

   				// computed property
   				fullName: function() {
      				this.getEach('firstName','lastName').compact().join(' ');
   				}.property(),

   				// init to setup registerDependentKey...
   				init: function() {
     				sc_super();
     				this.registerDependentKey('fullName', 'firstName', 'lastName');
   				},

   				//observer that should fire whenever the 'fullName' property changes
   				fullNameDidChange:  function() {
     				this.set('observedValue', this.get('fullName')) ;
   				}.observes('fullName')
			});
		}
	});

	
	test("should indicate the registered property changes if the dependent key value changes", function() {
		// now, change the firstName...
		RegisterObject.set('firstName', 'Jane');

		// since fullName is 'dependent' on firstName, then the observer for  
		// 'fullName' should fire here because you changed a dependent key.
		equals(RegisterObject.get('observedValue'), 'Jane Doe');

		// now change the lastName
		RegisterObject.set('lastName', 'Johnson');

		// again, fullName is 'dependent' on lastName, so observer for  
		// fullName should fire.
		equals(RegisterObject.get('observedValue'), 'Jane Johnson');
	});
	
	
	test("should indicate the registered property changes if the dependent key value changes and change is within begin property loop ", function() {
		// Wrap the changes with begin property changes call
		RegisterObject.beginPropertyChanges();
		
		// now, change the firstName & lastname...
		RegisterObject.set('firstName', 'Jane');
		RegisterObject.set('lastName', 'Johnson');
		
		// The observer for fullName should not have fired yet at this  
		// point because we are inside a propertyChange loop.
		equals(RegisterObject.get('observedValue'), 'John Doe');
		
		//End the property changes loop.
		RegisterObject.endPropertyChanges();
		
		// now change the lastName
		RegisterObject.set('lastName', 'Johnson');

		// again, fullName is 'dependent' on lastName, so observer for  
		// fullName should fire.
		equals(RegisterObject.get('observedValue'), 'Jane Johnson');
	});
	