
define([],
  function() {
    'use strict';
  
    return {
      template: require('./template.html'),
      initialProperties: {
        version: 1.0,
        support: {
          export: true,
          exportData: true,
          snapshot: true
        },
        qListObjectDef: {
            qShowAlternatives: true,
            qFrequencyMode: "V",
            qSortCriterias: {
                qSortByState: 1
            },
            qInitialDataFetch: [{
                qWidth: 1,
                qHeight: 10000
            }]
        }
      },
      definition: require('./definition').definition,
      support : {
        snapshot: true,
        export: true,
        exportData : true
      },
      paint: require('./paint').paint,
      controller: require('./controller').controller,
      mounted: require('./mounted').mounted,
    };
  
  })
/*
export {paint} from './paint';
export {mounted} from './mounted'
export {definition} from './definition'
export var template = require('./template.html')
export {controller} from './controller'


export const initialProperties = {
  version: 1.0,
  support: {
    export: true,
    exportData: true,
    snapshot: true
  },
  qListObjectDef: {
      qShowAlternatives: true,
      qFrequencyMode: "V",
      qSortCriterias: {
          qSortByState: 1
      },
      qInitialDataFetch: [{
          qWidth: 1,
          qHeight: 10000
      }]
  }
}

export const support = {
  export: true,
  exportData: true,
  snapshot: true
}


if (module.hot) {
  
  module.hot.accept('./paint.js', () => {
    console.log('paint hot update')
  })

  module.hot.accept('./definition.js', () => {
    var _definition = require('./definition').definition
    var element = require('./mounted').element
    if (element) {
      var _scope = element.scope()
      _scope.ext.mappedDefinition = _definition
      _scope.ext.definition = _definition
      _scope.object.reloadContent()
      _.set(window,'fs.scope',_scope)
    }
  });

  module.hot.accept('./template.html', () => {
    var _template = require('./template.html');
    _.set(window,'fs.template',_template)

    var element = require('./mounted').element
    if (element) {
      var _scope = element.scope()
      _scope.ext.template = _template
      _scope.object.reloadContent()
    }
  });
}
*/