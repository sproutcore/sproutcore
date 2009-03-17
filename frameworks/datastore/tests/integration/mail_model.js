// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module test ok equals same */

var Mail;
module("Sample Model from a webmail app", { 
  setup: function() {

    // namespace
    Mail = SC.Object.create({
      store: SC.Store.create()
    });

    // Messages are stored in mailboxes.
    Mail.Mailbox = SC.Record.extend({

      name: SC.Record.attribute(String).required(),

      // here is the mailbox type.  must be one of INBOX, TRASH, OTHER
      mailbox: SC.Record.attribute(String)
        .required().only('INBOX TRASH OTHER'.w()),
      
      // this is the sortKey that should be used to order the mailbox.
      sortKey: SC.Record.attribute(String)
        .required().only('subject date attachment'.w()),
      
      // load the list of messages.  We use the mailbox guid to load the 
      // messages.  Messages use a foreign key to move the message around.
      // an edit should cause this fetched property to reload.
      //
      // when you get messages, it will fetch "mailboxMessages" from the 
      // owner store, passing the receiver as the param unless you implement
      // the mailboxMessageParams property.
      messages: SC.Collection.fetch('Mail.Message')
    });
    
    // A message has a subject, date, sender, mailboxes, and messageDetail
    // which is a to-one relationship.  mailboxes is kept as an array of 
    // guids.
    Mail.Message = SC.Record.extend({

      date:        SC.Record.attribute(Date),
      
      mailboxes:   SC.Collection.inline({
        recordType: 'Mail.Mailbox',
        inverse: 'messages',
        isMaster: YES,
        minimum: 1 // you cannot have less than one mailbox.
      }),
      
      // describe the message detail.
      messageDetail: SC.Record.attribute('Mail.MessageDetail', {
        inverse: "message", // MessageDetail.message should == this.primaryKey
        dependent: YES 
      }),

      // access the named property through another property.
      body:    SC.Record.through('messageDetail'),
      cc:      SC.Record.through('messageDetail'),
      bcc:     SC.Record.through('messageDetail'),
      subject: SC.Record.through('messageDetail')
    });
    
    Mail.Contact = SC.Record.extend({
      
      firstName: String.attribute(),
      lastName: String.attribute(),
      email: String.attribute()
    });
    
    // define server.  RestServer knows how to automatically save records to 
    // the server.  You need to define your fetch requests here though.
    Mail.server = SC.RestServer.create({
      
      // fetch request for mailboxes.
      fetchMailboxes: function(params) {
        return this.fetchRequest('/ma/mailboxes?alt=json') ;
      }
    });

  }
});

test("basic operation", function() {
  
  // automatically loads mailboxes from the server.
  var mailboxes = Mail.store.fetch('mailboxes');
  Mail.mailboxesController.set('content', mailboxes);
  
  
});

test("create a message", function() {

  Mail.store.createRecord(Mail.Message, {
    subject: "Foo bar"
  }) ;
  
});
