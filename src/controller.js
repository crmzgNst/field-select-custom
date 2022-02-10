// import { app } from './app'
import qlik from 'qlik'
export var _scope = null;
export var _element = null;

var scopePromise = jQuery.Deferred();
var elementPromise = jQuery.Deferred();

export var getScope = scopePromise.promise()
export var getElement = elementPromise.promise()

var leonardoui = require('leonardo-ui/dist/leonardo-ui')
window.leonardoui = leonardoui

function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

var app = qlik.currApp()

export const controller = ['$scope', '$element', '$timeout', '$http', ($scope, $element, $timeout, $http) => {
    _.set(window,'fs.scope',$scope)
    // console.log(app)
    // var object = app.getObject($scope.layout.qInfo.qId)
    var alwaysOneSelectedValue, fieldType;

    $scope.showSelectionMenu = false;

    $scope.$watchCollection('layout.properties',(properties)=>{
        alwaysOneSelectedValue = _.get(properties,'alwaysOneSelectedValue',false)
        fieldType = _.get(properties,'fieldType')
    })

    $scope.$timeout = $timeout
    _scope = $scope;
    _element = $element;
    scopePromise.resolve($scope)
    elementPromise.resolve($element)


}]

