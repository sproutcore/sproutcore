var tools = require('./tools');

exports.Proxy = SC.Object.extend({
  port: null,
  host: null,
  proxyPrefix: null,
  prefix: null,
  server: null,
  
  body: null,
  
  onData: function(chunk){
    if(this.body === null) this.body = '';
    this.body += chunk;
  },
  
  onEnd: function(request,response){
    var proxyClient, proxyRequest,
        me = this,
        body = this.get('body') || '', // if no data, body is empty
        bodyLength = body.length,
        url = request.url;
        
    var errcb = function(err){
      tools.util.puts('ERROR: "' + err.message + '" for proxy request on ' + this.host + ':' + this.port);
      response.writeHead(404);
      response.end();
      me.data = '';
    };

    if (this.proxyPrefix.length > 0 && url.indexOf(this.proxyPrefix) < 0) {
      url = this.proxyPrefix + url;
    }

    proxyClient = tools.http.createClient(this.port, this.host);

    proxyClient.addListener('error', errcb);

    request.headers.host = this.host;
    request.headers['content-length'] = bodyLength;
    request.headers['X-Forwarded-Host'] = request.headers.host + ':' + this.server.port;
    if (this.port != 80) request.headers.host += ':' + this.port;
    
    proxyRequest = proxyClient.request(request.method, url, request.headers);

    if (bodyLength > 0) {
      proxyRequest.write(body);
    }

    proxyRequest.addListener('response', function(proxyResponse) {
      response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
      proxyResponse.addListener('data', function(chunk) {
        response.write(chunk);
      });
      proxyResponse.addListener('end', function() {
        response.end();
      });
    });

    proxyRequest.end();    
  },
  
  process: function(request,response){
    var me = this;
    var prefix = this.prefix;
    var path = tools.url.parse(request.url).pathname;

    
    if(path.substr(0,prefix.length) === prefix){
      tools.util.puts('Proxying ' + request.url);
      request.addListener('data',function(chunk){
        me.onData.call(me,chunk);
      });

      request.addListener('end',function(){
        me.onEnd.call(me,request,response);
      });
      return true;
    }
    else return false;
  }
  
});
/*
var proxy = function(request, response) {
  var body = '';
  
  request.addListener('data', function(chunk) {
    body += chunk;
  });

  request.addListener('end', function() {
    var proxyClient, proxyRequest,
        url = request.url;

    if (that.proxyPrefix.length > 0 && url.indexOf(that.proxyPrefix) < 0) {
      url = that.proxyPrefix + url;
    }

    proxyClient = l.http.createClient(that.proxyPort, that.proxyHost);

    proxyClient.addListener('error', function(err) {
      util.puts('ERROR: "' + err.message + '" for proxy request on ' + that.proxyHost + ':' + that.proxyPort);
      response.writeHead(404);
      response.end();
    });

    request.headers.host = that.proxyHost;
    request.headers['content-length'] = body.length;
    request.headers['X-Forwarded-Host'] = request.headers.host + ':' + that.port;
    if (that.proxyPort != 80) request.headers.host += ':' + that.proxyPort;
    
    proxyRequest = proxyClient.request(request.method, url, request.headers);

    if (body.length > 0) {
      proxyRequest.write(body);
    }

    proxyRequest.addListener('response', function(proxyResponse) {
      response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
      proxyResponse.addListener('data', function(chunk) {
        response.write(chunk);
      });
      proxyResponse.addListener('end', function() {
        response.end();
      });
    });

    proxyRequest.end();
  });
}; */