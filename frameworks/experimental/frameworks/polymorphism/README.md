Polymorphism Framework
======================
 
This framework adds polymorphism support to SC.Record relationships.
Right now, only one-to-one polymorphism is supported, but to-many
support is planned.


## Using the Framework

In order to use the polymorphic to-one relationship, include this
framework in your Buildfile. Inside your Records, you can define
a relationship like this:

    MyApp.Child = SC.Record.extend({
	    parent: SC.Record.toOneOf(['MyApp.Male', 'MyApp.Female'], {typeKey: 'parentType'}),
	    parentType: SC.Record.attr(String)
	});

You need to pass in a hash like the following when creating the record:

    {parent: 1, parentType: 'MyApp.Male'}


For other, more flexible, ways of using this polymorphic support,
see the unit tests or source code.

<!--
	TODO Write more examples
-->

## Contributors

- Colin Campbell (<colin@sproutcore.com>)