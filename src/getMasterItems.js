/**
 * Returns a Promise of an array of master objects within the app.
 */
// var Promise = qv.getService('$q');
import qlik from 'qlik';

var cachedMasterItems = null;
var app = qlik.currApp();

function _getMasterItems() {
    // app.getList('sheet')
    // .then(function (model) {
    //     app.destroySessionObject(model.layout.qInfo.qId);
    //     console.log(model.layout)
    // })

    return app.getList('masterobject')
        .then(function (model) {

            // Close the model to prevent any updates.
            app.destroySessionObject(model.layout.qInfo.qId);

            // This is a bit iffy, might be smarter to reject and handle empty lists on the props instead.
            if (!model.layout.qAppObjectList.qItems) return; //return resolve({value: '', label: 'No MasterObjects'});

            var masterItems = _.sortBy(model.layout.qAppObjectList.qItems, function (e) {
                return e.qMeta.title
            })
            cachedMasterItems = masterItems.map(function (item) {
                return {
                    value: `${item.qMeta.title}***${item.qInfo.qId}`,
                    label: `${item.qMeta.title} - ${item.qInfo.qId}`
                };
            })
            return cachedMasterItems
            // Resolve an array with master objects.
            // return resolve( masterItems.map(function(item) {
            //     return {
            //         value: item.qMeta.title + "|" + item.qInfo.qId,
            //         label: item.qMeta.title
            //     };
            // }) );

        });
}

export const getMasterItems = ()=> {
    return new Promise(function (resolve, reject) {

        if (cachedMasterItems) resolve(cachedMasterItems)
        else {
            return _getMasterItems()
                // .then(function (items) {
                //     return resolve(items)
                // })
                // .catch(function (err) {
                //     reject(err)
                // })
        }
        //     var app = qlik.currApp();

        //     app.getList('masterobject').then(function(model) {

        //         // Close the model to prevent any updates.
        //         app.destroySessionObject(model.layout.qInfo.qId);

        //         // This is a bit iffy, might be smarter to reject and handle empty lists on the props instead.
        //         if(!model.layout.qAppObjectList.qItems) return resolve({value: '', label: 'No MasterObjects'});
        //         var masterItems = _.sortBy(model.layout.qAppObjectList.qItems,function(e){ return e.qMeta.title })
        //         // Resolve an array with master objects.
        //         return resolve( masterItems.map(function(item) {
        //             return {
        //                 value: item.qMeta.title + "|" + item.qInfo.qId,
        //                 label: item.qMeta.title
        //             };
        //         }) );

        //     });
        // }
    });
};
