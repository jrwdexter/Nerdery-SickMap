/* global module:true */
module.exports = function(grunt) {
    'use strict';
    grunt.initConfig({
        // Paths
        config: {
            prod: {
                options: {
                    variables: {
                        'CONFIG': 'config:prod',
                        'BASE_PATH': '../SickMap'
                    }
                }
            },
            dev: {
                options: {
                    variables: {
                        'CONFIG': 'config:dev',
                        'BASE_PATH': '../SickMap'
                    }
                }
            }
        },

        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            all: {
                src: [
                    '<%= grunt.config.get("BASE_PATH") %>/Scripts/**/*.js'
                ],
                options: {
                    globals: {
                        require: true,
                        define: true
                    },
                    bitwise: false,
                    browser: true,
                    camelcase: true, // doesn't allow for uppercase class names
                    curly: true,
                    devel: true,
                    eqeqeq: true,
                    forin: true,
                    immed: false,
                    indent: 4,
                    latedef: true,
                    newcap: true,
                    noarg: true,
                    noempty: true,
                    nonew: true,
                    plusplus: false,
                    quotmark: 'single',
                    undef: true,
                    unused: false, // check
                    strict: true,
                    trailing: true,
                    maxparams: 30, // lower when testing?
                    maxdepth: 4,
                    maxstatements: 50, // lower
                    maxlen: 120,
                    ignores: [
                        '<%= grunt.config.get("BASE_PATH") %>/Scripts/lib/**/*.js',
                        '<%= grunt.config.get("BASE_PATH") %>/Scripts/**/out/**/*.js',
                        '<%= grunt.config.get("BASE_PATH") %>/Scripts/_references.js',
                        '<%= grunt.config.get("BASE_PATH") %>/Scripts/build.js',
                        '<%= grunt.config.get("BASE_PATH") %>/Scripts/polyfills.js',
                        '<%= grunt.config.get("BASE_PATH") %>/Scripts/graphing/**/*.js',
                        '<%= grunt.config.get("BASE_PATH") %>/Scripts/main-min.js',
                        '<%= grunt.config.get("BASE_PATH") %>/Scripts/services/GoogleAnalyticsService.js'
                    ]
                }
            }
        },

        csslint: {
            all: {
                src: [
                    '<%= grunt.config.get("BASE_PATH") %>/Content/**/*.css'
                ],
                options: {
                    'box-model': false,
                    'box-sizing': false, // project doesn't support IE6 or 7
                    'compatible-vendor-prefixes': false,
                    'duplicate-background-images': false, // Should clean up later
                    'floats': false,
                    'font-sizes': false,
                    'gradients': false, // assumes old support
                    'important': false,
                    'known-properties': false, // errors for svg styling
                    'outline-none': false,
                    'star-property-hack': false,
                    'universal-selector': false,
                    'unqualified-attributes': false,
                    'zero-units': true
                }
            }
        },

        watch: {
            scripts: {
                files: [
                    '<%= grunt.config.get("BASE_PATH") %>/Scripts/**/*.js',
                ],
                tasks: ['<%= grunt.config.get("CONFIG") %>', 'newer:jshint:all'],
                options: {
                    livereload: true,
                    ignores: [
                        '<%= grunt.config.get("BASE_PATH") %>/Scripts/lib-thirdparty/**/*.js',
                    ]
                },
            },
            sass: {
                files: [
                    '<%= grunt.config.get("BASE_PATH") %>/Content/**/*.scss'
                ],
                tasks: ['<%= grunt.config.get("CONFIG") %>', 'compass'],
            },
            css: {
                files: [
                    '<%= grunt.config.get("BASE_PATH") %>/Content/**/*.css'
                ],
                options: {
                    livereload: true,
                }
            },
            html: {
                files: [
                    '<%= grunt.config.get("BASE_PATH") %>/Views/**/*.sshtml'
                ],
                options: {
                    livereload: true,
                }
            }
        },

        compass: {
            dist: {
                options: {
                    sassDir: '<%= grunt.config.get("BASE_PATH") %>/Content/Styles',
                    cssDir: '<%= grunt.config.get("BASE_PATH") %>/Content/Styles',
                }
            }
        },

        yuidoc: {
            compile: {
                options: {
                    paths: '<%= grunt.config.get("BASE_PATH") %>/Scripts',
                    outdir: '<%= grunt.config.get("BASE_PATH") %>/docs/yui/'
                }
            }
        },

        requirejs: {
            compile: {
                options: {
                    baseUrl: '<%= grunt.config.get("BASE_PATH") %>/Scripts',
                    paths: {
                        jquery: 'lib-thirdparty/jquery-1.8.2',
                        angular: 'lib-thirdparty/angular-1.0.8',
                        modernizr: 'lib-thirdparty/modernizr-2.6.2',
                        d3: 'lib-thirdparty/d3.v3',
                        select2: 'lib-thirdparty/select2',
                        Base: 'lib-thirdparty/Base',
                        graphing: 'graphing/',
                        requireLib: 'lib-thirdparty/require'
                    },
                    shim: {
                        jquery: { exports: '$' },
                        angular: { exports: 'angular', deps: ['jquery'] },
                        modernizr: { exports: 'Modernizr' },
                        d3: { exports: 'd3' },
                        select2: { deps: ['jquery'] },
                        Base : { exports: 'Base' }
                    },
                    name: 'main',
                    out: '<%= grunt.config.get("BASE_PATH") %>/Scripts/main-min.js',
                    include: 'requireLib'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-config');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-mincss');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');

    grunt.registerTask('prototype', ['config:prototype', 'watch']);
    grunt.registerTask('doc', ['config:prod', 'yuidoc']);
    grunt.registerTask('lint', ['config:dev', 'jshint', 'csslint']);
    grunt.registerTask('dev', ['config:dev', 'compass', 'jshint', 'watch']);
    grunt.registerTask('prod', ['config:prod', 'writeScripts', 'requirejs']);
    grunt.registerTask('default', ['dev']);
};
