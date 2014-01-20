define(['angular', 'Controllers/SickmapController', 'Directives/Sickmap'], function(angular){
    'use strict';
    return angular.module('sickMap', [
        'sickMap.controllers',
        'sickMap.directives'
    ]);
});
