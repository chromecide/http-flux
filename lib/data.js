var fs=require('fs');

var loadedStores = {};
module.exports = {
    store: function(type, params, cbs){
        if(loadedStores[type]){
            new loadedStores[type](params, cbs);
        }else{

            var storePath = __dirname+'/data/stores/'+type+'.js';
            if(fs.existsSync(storePath)){
                loadedStores[type] = require(storePath);
                new loadedStores[type](params, cbs);
            }else{
                if(cbs.error){
                    cbs.error("Store Type not Found: "+type);
                }
            }
        }
    }
};