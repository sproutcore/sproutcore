htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');

(function() {
  var iconURL= "http://www.freeiconsweb.com/Icons/16x16_people_icons/People_046.gif";
  
  var pane = SC.ControlTestPane.design()
    
    .add("3 menu items ", SC.MenuView, { 
      items: [ 'File ', 'Edit ' , 'View '],
      layout: { height: 25 }
    });
  pane.show(); 
})();