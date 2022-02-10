import qlik from 'qlik';
import _ from 'lodash';

export const app = qlik.currApp()

export const dimensionList = new Promise(function(resolve,reject){
    app.getList("DimensionList", function(reply){
        var list = reply.qDimensionList.qItems.map(function(e){
                  return {
                    label: e.qMeta.title,
                    value: e.qInfo.qId
                  }
              })
        resolve(_.orderBy(list,'label'))
  })
})

export const variableList = new Promise(function(resolve,reject){
    app.getList("VariableList", function(reply){
        var list = reply.qVariableList.qItems.map(function(e){
                  return {
                    label: e.qName,
                    value: e.qName
                  }
              })
        resolve(_.orderBy(list,'label'))
  })
})


export var qlikObject = null
export const setQlikObject = (objectId)=>{
    qlikObject = app.getObject(objectId)
}

export var backendApi = null

export const setBackendApi = (api)=>{
    backendApi = api
}
