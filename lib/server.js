require('env2')('.env'); // Called Once. https://github.com/dwyl/env2
var Hapi   = require('hapi');    // https://github.com/nelsonic/learn-hapi
var Joi    = require('joi');
var Vision = require('vision');
var server = new Hapi.Server() //{ debug: {"request": ["error", "uncaught"]} })
var assert = require('assert');

var custom_fields  = require('./model');   // fields required to register/login

var register_handler = require('./handlers/register_handler');
var register_opts = {
  fields: custom_fields,
  handler: register_handler,
  fail_action_handler: register_handler
};  // set options when registering the plugin

var login_handler = require('./handlers/login_handler'); // handler for login
var login_opts = {
  fields: custom_fields,
  handler: login_handler,
  fail_action_handler: login_handler
};

server.connection({ port: process.env.PORT });
server.register([Vision,
  { register: require('hapi-postgres-connection') }, // no options required
  { register: require('hapi-auth-jwt2') },           // http://git.io/vT5dZ
  { register: require('hapi-register'), options:register_opts },
  { register: require('hapi-login'), options:login_opts }], function (err) {

  assert(!err, 'Failed to load plugin: ', err); // FAILED to load plugins, die!

  server.auth.strategy('jwt', 'jwt', true,
  { key: process.env.JWT_SECRET,  validateFunc: require('./jwt2_validate_func'),
    verifyOptions: { ignoreExpiration: true }
  });

  server.views({
      engines: { html: require('handlebars') },
      path: __dirname +'/views/'
  });
  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply('hello world!');
   }
  });

  server.route({
    method: 'GET',
    path: '/login',              // other routes are added by the plugins
    handler: login_handler,  // display login/registration form/page
    config: { auth: false }
  });

  server.route({
    method: 'GET',
    path: '/admin',
    handler: function(req, reply) {
      reply('admin');
    }
  });
server.route({
    method: 'GET',
    path: '/user',
    handler: function(req, reply) {
      reply('user');
    }
  });
});
server.route({
   method: 'GET',
   path: '/api/rockets',
   handler: function(req, reply) {
      process.exit(1);
   }
});
server.route({
   method: 'GET',
   path: '/api/pipes',
   handler: function(req, reply) {
      mem.push(new Uint8Array(50000));
      reply.json({hello: "World"})
   }
});
server.route({
    method: 'GET',
    path: '/hello/{user?}',
    handler: function (request, reply) {
        const user = request.params.user ? encodeURIComponent(request.params.user) : 'stranger';
        reply('Hello ' + user + '!');
    }
});
server.start(function() {
  console.log('Visit: http://127.0.0.1:'+server.info.port);
});

module.exports = server;
