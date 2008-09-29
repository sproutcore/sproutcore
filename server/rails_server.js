// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('server/rest_server') ;

/**
  @class

  This server extends SC.RestServer and leverages Rails feature to protect
  your controller actions from CSRF attacks by using the authenticity token
  from rails in requests from SproutCore. For more information about this
  feature from Rails see the documentation in rails for module
  ActionController::RequestForgeryProtection.

  To use this server create it like for example:

  {{{
    Contacts = SC.Object.create({
      server: SC.RailsServer.create({ prefix: ['Contacts'] })
    }) ;
  }}}

  In order for SproutCore to send the authenticity token in the body of 
  requests there is one prerequisite: you must initialize the SproutCore app 
  by setting the following two variables:

  | SC.RAILS_AUTH_TOKEN_NAME  | Should be set to the name of the authenticity token |
  | SC.AUTH_TOKEN | Should be set to the value of the authenticity token |

  Following is a description of how this can be achieved. Stick the following 
  code in one of your controllers:

  {{{
    # Passes the authenticity token for use in javascript
    def auth_token
      respond_to do |wants|
        wants.js do
          if protect_against_forgery?
            render :text => "var SC = SC || {};  
              SC.RAILS_AUTH_TOKEN_NAME = '#{request_forgery_protection_token}';
              SC.RAILS_AUTH_TOKEN = '#{form_authenticity_token}';"
          end
        end
      end
    end
  }}}

  And make it accessible via your rails routes.rb file, for example:

  {{{
    map.connect 'auth-token.js', :controller => 'application', :action => 'auth_token'
  }}}

  Copy-and-paste the default index template of SproutCore into your own
  client app. Refer to your new default index template by modifying the
  :layout option in your sc-config file. Lastly, within this default
  index template add a line to call auth-token.js on your rails server.
  For example:

  {{{
    <script src="/sc/auth-token.js" type="text/javascript"></script>
  }}}


  @extends SC.RestServer
  @author Lawrence Pit
  @copyright 2006-2008, Sprout Systems, Inc. and contributors.
  @since SproutCore 1.0
*/
SC.RailsServer = SC.RestServer.extend({

  urlFor: function(resource, action, ids, params, method) {
    if (method != 'get' && SC.RAILS_AUTH_TOKEN_NAME) {
      params[SC.RAILS_AUTH_TOKEN_NAME] = SC.RAILS_AUTH_TOKEN;
    }

    return sc_super();
  }

}) ;
