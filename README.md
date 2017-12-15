node-service-manager
====================
A node.js and express based modular RESTful service manager.  Its job is to provide common web server and authenication framework for an entire stack of services.  Services are built as seperate modules and deployed on the service manager.


Launching Service Manager
=========================
Service Manager can be run standalone

    Standalone: node bootstrap.js

By default service manager is configured to listen on port 3000 in dev and staging environments and port 80 in production environments (as indicated by the presense of a PRODUCTION environment variable, see config.coffee)


Sample Service
==============
The service manager respository contains a sample service in the root of the project in the sample-service folder.  To enable this service:

1. cd path_to_cloned_respository
2. mkdir services/sample
3. ln -s ../../sample-service/ services/sample/v1

Launch service manager from the console and you should see output like "Registering Service: sample with 1 versions"

Creating a Service Module
=========================
Service modules are simply node.js projects that conform to a certain file conventions.  Each service is responsible for its own configuration and resources(db connections, node modules, etc.).

#####service.js:
defines the endpoints in the service module by exporting an array of resouces.

#####*.js:
whatever coffee files are needed to support your endpionts and its dependancies

#####node_modules: 
local modules for the service


### Endpoint Exports

Endpoints must export functions that the service wishes to expose.  Leaving a function out will result in a 500 error being generated for the method.  So if you wish to create a service that only shows and index, you can export just the index function.

| method name | http method | url pattern |
| ----------- | ----------- | ----------- |
| create      | POST        | http://server name/service name/version/endpoint name |
| show        | GET         | http://server name/service name/version/endpoint name/:id |
| index       | GET         | http://server name/service name/version/endpoint name |
| destroy     | DELETE      | http://server name/service name/version/endpoint name/:id |
| update      | PUT         | http://server name/service name/version/endpoint name/:id |
| options     | OPTIONS     | http://server name/service name/version/endpoint name |
| head        | HEAD        | http://server name/service name/version/endpoint name |

