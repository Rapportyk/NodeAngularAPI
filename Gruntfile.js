/*************************************************************************
 * 
 * COPYRIGHT NOTICE
 * __________________
 * 
 * NodeServiceManager - v0.1.0
 *
 * Copyright (C) 2015, Kennet Jacob
 * All Rights Reserved.
 * 
 * NOTICE:  All information contained herein is, and remains the property 
 * of Kennet Jacob. Unauthorised copying of this  file, via any medium is 
 * strictly prohibited. Redistribution and use in source and binary forms,
 * with or without modification, are not permitted.
 * Proprietary and confidential.
 *
 * Author:
 * Name: Kennet Jacob
 * Email: kennetjacob@gmail.com
 * Website: http://kennetjacob.com
 *
 *
 * FILE SUMMARY
 * __________________
 * 
 * Main Grunt File
 * 
 *************************************************************************/

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        apidoc: {
            mypp: {
                src: "services/",
                dest: "apidoc/",
                options: {
                    debug: false,
                    includeFilters: [ ".*\\.js$" ],
                    excludeFilters: [ "node_modules/" ]
                }
            }
        },
        usebanner: {
            taskName: {
                options: {
                    position: 'top',
                    banner: '/*************************************************************************\n' + ' * \n'+
                             ' * COPYRIGHT NOTICE\n'+
                             ' * __________________\n'+
                             ' * \n'+
                             ' * <%= pkg.name %> - v<%= pkg.version %>\n'+
                             ' *\n'+
                             ' * Copyright (C) <%= grunt.template.today("yyyy") %>, <%= pkg.author.name %>\n'+
                             ' * All Rights Reserved.\n'+
                             ' * \n'+
                             ' * NOTICE:  All information contained herein is, and remains the property \n'+
                             ' * of Kennet Jacob. Unauthorised copying of this  file, via any medium is \n'+
                             ' * strictly prohibited. Redistribution and use in source and binary forms,\n'+
                             ' * with or without modification, are not permitted.\n'+
                             ' * Proprietary and confidential.\n'+
                             ' *\n'+
                             ' * Author:\n'+
                             ' * Name: <%= pkg.author.name %>\n'+
                             ' * Email: <%= pkg.author.email %>\n'+
                             ' * Website: <%= pkg.author.url %>\n'+
                             ' *\n'+
                             ' *\n'+
                             ' * FILE SUMMARY\n'+
                             ' * __________________\n'+
                             ' * \n'+
                             ' * \n'+
                             ' * \n'+
                             ' *************************************************************************/\n',
                    linebreak: true
                },
                files: {
                    src: [ 'sms.js' ]
                }
            }
        }
    });

    // Load the plugin that provides the "apidoc" task.
    grunt.loadNpmTasks('grunt-apidoc');
    grunt.loadNpmTasks('grunt-banner');

    // Default task(s).
    grunt.registerTask('default', ['apidoc']);

};