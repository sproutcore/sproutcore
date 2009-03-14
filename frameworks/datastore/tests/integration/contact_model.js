// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module test ok equals same AB */

var AB;
module("Sample Model from an address book app", { 
  setup: function() {
    AB = SC.Object.create({
      store: SC.Store.create()
    });
    
    AB.ContactGroup = SC.Record.extend({
      groupNameType: String,
      
      // fetch all the contacts on demand.  Since this is a fetched property,
      // it is read only.  Edit the groups array to do more.
      contacts: function() {
        return this.get('store').fetch('contacts', { 
          group: this.get('guid') 
        });
      }.property().cacheable(),
      
      addContact: function(contact) {
        var groups = contact.get('groups');
        if (groups.indexOf(this) < 0) {
          groups = groups.slice();
          groups.push(this);
          contact.set('groups', groups);
        }
        return this ;
      },

      removeContact: function(contact) {
        var groups = contact.get('groups');
        if (groups.indexOf(this) >= 0) {
          groups = groups.without(this);
          contact.set('groups', groups);
          this.notifyPropertyChange('contacts');
        }
        return this ;
      }
      
    });
    
    // a contact can belong to a group.  it can also have one or more 
    // ContactDetails which are things like phones, emails, addresses, etc.
    AB.Contact = SC.Record.extend({
      
      firstNameType: String,
      lastNameType:  String,
      emailType:     String,
      
      // a contact belongs to one or more groups stored as an array on 
      // the contact.  You can change the groups array by replacing the 
      // array.
      groups: function(key, groups) {

        // if groups is replaced, write back guids
        // also, each group record should have it's contacts invalidated.
        if (groups !== undefined) {
          this.writeAttribute('groups', groups.getEach('guid')) ;
          groups.invoke('notifyPropertyChange', 'contacts');
        }
        return this.get('store').records(this.readAttribute('groups'));
      }.property().cacheable()
      
    });
    
    AB.ContactAddress = SC.Record.extend({
      
      descriptionType: String,
      street1: String,
      street2: String,
      city: String,
      state: String,
      country: String
      
      // the contact the address belongs to.
      contact: function() {
        this.get('store').record(this.readAttribute('contact'));
      }
    });
    
  }
});