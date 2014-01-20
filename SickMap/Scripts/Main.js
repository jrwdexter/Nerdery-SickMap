require.config({
    baseUrl: '/Scripts',
    enforceDefine: true,

    paths: {
        jquery: 'lib/jquery-2.0.3.min',
        heatmap: 'lib/heatmap',
        base: 'lib/Base',
        angular: 'lib/angular.min'
    },

    shim: {
        jquery: { exports: '$' },
        angular: { exports: 'angular', deps: ['jquery'] },
        base: { exports: 'Base' },
        heatmap: { exports: 'h337' }
    }
});

define(
    [
        'App',
        'angular',
        'jquery'
    ],
    function(app, angular, $) {
        'use strict';

        var $html = angular.element(document.getElementsByTagName('html')[0]);
        angular.element().ready(function(){
            $html.addClass('ng-app').attr('id', 'ng-app');
            angular.bootstrap($html, [app.name]);
        });
    }
);