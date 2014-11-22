var record = function(model){
    this.model = model;
    this.dataValues = {};
    this.changed = {};
    this.originalValues = {};

    return this;
};

    record.prototype.set = function(attribute, value){
        this.dataValues[attribute] = value;
        this.changed[attribute] = value;
    };

    record.prototype.get = function(attribute){
        return this.dataValues[attribute];
    };

    record.prototype.save = function(cbs){
        this.model.save(this, cbs);
    };

    record.prototype.destroy = function(cbs){
        this.model.destroy(this, cbs);
    };

module.exports = record;