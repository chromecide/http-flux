var record = require(__dirname+'/record.js');

var model = function(cfg, callbacks){
    this.config = cfg;

    return this;
};

    /*
        Build a record based on this model
     */
    model.prototype.build = function(obj, callback){
        var newRecord = new record(this);

        for(var key in obj){
            newRecord.set(key, obj[key]);
        }

        return newRecord;
    };

    model.prototype.save = function(recordData, cbs){
        this.store.save([recordData], cbs);
    };

    model.prototype.destroy = function(recordData, cbs){
        this.store.destroy([recordData], cbs);
    };

    model.prototype.find = function(queryData, cbs){
        this.store.read(this, queryData, cbs);
    };

module.exports = model;