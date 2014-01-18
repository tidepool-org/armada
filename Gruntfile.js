/*
 * Copyright (c) 2014, Tidepool Project
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this
 * list of conditions and the following disclaimer in the documentation and/or other
 * materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
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
            addlicense: {
            // this may not be the best way to do this dependency, but this isn't
            // a task we're going to run that often.
                command: 'python ../central/tools/addLicense.py "*/*.js"',
                options: {
                    async: false,
                    execOptions: {
                        cwd: './lib/'
                    }
                }
            },
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
                src: ['test/groups_api_tests.js']
            },
            integration: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/groups_api_integration_tests.js','test/mongoHandler_integration_tests.js']  
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
    grunt.registerTask('all-test', ['mochaTest:unit','mochaTest:integration']);
    grunt.registerTask('start-mongo', ['shell:startMongo']);
    grunt.registerTask('start-api', ['shell:startAPI']);

};
