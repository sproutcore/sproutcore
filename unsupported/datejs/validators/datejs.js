// SC.Validator = SC.Object.extend(
//   fieldValueForObject: function(object, form, view) { return object; },
//   
//   objectForFieldValue: function(value, form, view) { return value; },
//   
//   validate: function(form, field) { return true; },
// 
//   validateError: function(form, field) { 
//     return SC.$error(
//       "Invalid.General(%@)".loc(field.get('fieldValue')),
//       field.get('fieldKey')) ; 
//   },
// 
//   validateChange: function(form, field, oldValue) { 
//     return this.validate(form,field) ? SC.VALIDATE_OK : this.validateError(form, field);
//   },
// 
//   validateSubmit: function(form, field) { 
//     return this.validate(form,field) ? SC.VALIDATE_OK : this.validateError(form, field);
//   },
// 
//   validatePartial: function(form, field) { 
//     if (!field.get('isValid')) {
//       return this.validate(form,field) ? SC.VALIDATE_OK : this.validateError(form, field);
//     } else return SC.VALIDATE_NO_CHANGE ;
//   },
//   
//   validateKeyDown: function(form, field,charStr) { return true; },
// 
//   attachTo: function(form,field) { },
// 
//   detachFrom: function(form, field) {}
// 
// }) ;