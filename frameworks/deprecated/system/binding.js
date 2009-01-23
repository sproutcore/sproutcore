// ......................................
// DEPRECATED
//
// The transforms below are deprecated but still available for backwards 
// compatibility.  Instead of using these methods, however, you should use
// the helpers.  For example, where before you would have done:
//
//  contentBinding: SC.Binding.Single('MyApp.myController.count') ;
//
// you should do:
//
//  contentBinding. SC.Binding.from('MyApp.myController.count').single();
//
// and for defaults:
//
//  contentBindingDefault: SC.Binding.single()
//
SC.Binding.From = SC.Binding.NoChange = SC.Binding.builder();

SC.Binding.Single = SC.Binding.single().builder() ;
SC.Binding.SingleNull = SC.Binding.single(null).builder() ;
SC.Binding.SingleNoError = SC.Binding.Single.beget().noError().builder() ;
SC.Binding.SingleNullNoError = SC.Binding.SingleNull.beget().noError().builder() ;
SC.Binding.Multiple = SC.Binding.multiple().builder() ;
SC.Binding.MultipleNoError = SC.Binding.multiple().noError().builder() ;

SC.Binding.Bool = SC.Binding.bool().builder() ;
SC.Binding.Not = SC.Binding.bool().not().builder() ;
SC.Binding.NotNull = SC.Binding.isNull().not().builder() ;
SC.Binding.IsNull = SC.Binding.isNull().builder() ;

// No Error versions.
SC.Binding.BoolNoError = SC.Binding.Bool.beget().noError().builder();
SC.Binding.NotNullNoError = SC.Binding.NotNull.beget().noError().builder();
SC.Binding.NotNoError = SC.Binding.Not.beget().noError().builder();
SC.Binding.IsNullNoError = SC.Binding.IsNull.beget().noError().builder() ;
