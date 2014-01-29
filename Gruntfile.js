/*
== BSD2 LICENSE ==
Copyright (c) 2014, Tidepool Project

This program is free software; you can redistribute it and/or modify it under
the terms of the associated License, which is identical to the BSD 2-Clause
License as published by the Open Source Initiative at opensource.org.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the License for more details.

You should have received a copy of the License along with this program; if
not, you can obtain one from Tidepool Project at tidepool.org.
== BSD2 LICENSE ==
 */

module.exports = function(grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: ['lib/**/*.js', 'test/**/*.js']
        },
        docco: {
            docs: {
                src: ['lib/**/*.js', './*.md'],
                dest: ['docs'],
                options: {
                    layout: 'linear',
                    output: 'docs'
                }
            }
        },
        shell: {
            startMongo: {
                command: [
                    'mongod',
                    'mongo'
                ].join('&&'),
                options: {
                    async: false,
                    failOnError: false
                }
            },
            startAPI: {
                // load config and start app at same time
                command: [
                    'source config/env.sh',
                    'node lib/index.js'
                ].join('&&'),
                options: {
                    async: false
                }
            }
        },
        mochaTest: {
            unit: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/unit/*.js']
            },
            integration: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/integration/*.js']
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-docco2');
    grunt.loadNpmTasks('grunt-shell-spawn');
    grunt.loadNpmTasks('grunt-mocha-test');

    // Default task(s).
    grunt.registerTask('default', ['mochaTest']);
    // Standard tasks
    grunt.registerTask('unit-test', ['mochaTest:unit']);
    grunt.registerTask('integration-test', ['mochaTest:integration']);
    grunt.registerTask('test', ['mochaTest:unit','mochaTest:integration']);
    grunt.registerTask('start-mongo', ['shell:startMongo']);
    grunt.registerTask('start-api', ['shell:startAPI']);

};
