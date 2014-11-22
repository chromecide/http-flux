var IDataStore = require(__dirname+'/../interfaces/IDataStore.js');
var mysql = require('mysql');

var MySQLStore = function(params, callbacks){
    var self = this;
    this.params = params;

    if(this.params.models){
        for(var key in this.params.models){
            this.params.models[key].store = this;
        }
    }

    this.connect = function(params, cbs){
        if(!this.connection){
            this.connection = mysql.createConnection(this.params);
        }

        this.connection.connect(function(err) {
            if (err) {
                if(cbs.error){
                    cbs.error(err.stack, self);
                }
                return;
            }else{
                if(cbs.success){
                    cbs.success(self);
                }
            }
        });
    };

    this.disconnect = function(cbs){
        this.connection.end();
        if(cbs.success){
            cbs.success();
        }
    };

    this.save = function(records, cbs){
        //load any records that already exist
        saveRecords(this, records, [], cbs);
    };

    this.read = function(model, params, cbs){
        console.log(params);
        var query = objectToQuery(this, model, params);
        console.log(query);
        this.connection.query(query.sql, query.values, function(err, res){
            if(err){
                console.log(err);
                if(cbs.error){
                    cbs.error(err, res);
                }
            }else{
                if(cbs.success){
                    cbs.success(res);
                }
            }
        });
    };

    this.destroy = function(records, cbs){
        removeRecords(this, records, [], cbs);
    };

    if(this.params.autoconnect){
        this.connect(this.params, {
            success: function(){
                if(callbacks.success){
                    callbacks.success(self);
                }
            },
            error: function(e){
                if(callbacks.error){
                    callbacks.error(e, self);
                }
            }
        });
    }else{
        if(callbacks.success){
            callbacks.success(this);
        }
    }
};
    function padLeft(str, cha, len){
        str = str.toString();
        for(var i=0; i<len-str.length;i++){
            str = cha+str;
        }

        return str;
    }
    function escapeValue(field, value){
        var returnValue = '';

        switch(field.type){
            case 'TIMESTAMP':
                returnValue = '"'+value.getUTCFullYear()+'-'+padLeft(value.getUTCMonth(), '0', 2)+'-'+padLeft(value.getUTCDate(), '0', 2)+' '+padLeft(value.getUTCHours(),'0',2)+':'+padLeft(value.getUTCMinutes(), '0', 2)+':'+value.getUTCSeconds()+'"';
                break;
            case 'NUMBER':
                returnValue = value;
                break;
            case 'STRING':
                returnValue = '"'+value+'"';
                break;
            case 'BOOLEAN':
                returnValue = value?1:0;
                break;
        }

        return returnValue;
    }

    function saveRecords(self, records, processedRecords, cbs){
        var errors = [];
        if(records.length===processedRecords.length){
            if(errors.length>0){
                if(cbs.error){
                    cbs.error(errors, records, processedRecords);
                }
            }else{
                if(cbs.success){
                    cbs.success(records);
                }
            }

            return;
        }

        var recordItem = records[processedRecords.length];
        
        saveRecord(self, recordItem, {
            success: function(ri){
                processedRecords.push(ri);
                saveRecords(self, records, processedRecords, cbs);
            },
            error: function(err, ri){
                errors.push(err);
                ri.lastError = err;
                processedRecords.push(ri);
                saveRecords(self, records, processedRecords, cbs);
            }
        });
    }

    function saveRecord(self, recordItem, cbs){
        var saveSQL = '';

        var dataValues = recordItem.dataValues;
        var model = recordItem.model;
        var fields = model.config.fields;

        var setFields = [];
        var pkField = model.config.pk_field||'id';

        if(dataValues.id){ //update
            saveSQL = 'UPDATE '+model.config.collection+' SET ';
            for(var key in fields){
                if(key!=pkField){
                    if(recordItem.get(key)){
                        console.log(key);
                        console.log(recordItem.get(key));
                        saveSQL += key+'=?,';
                        setFields.push(recordItem.get(key));
                    }
                }
            }
            saveSQL=saveSQL.substr(0, saveSQL.length-1);//remove the last comma
            saveSQL+=' WHERE '+pkField+'=?;';
            setFields.push(recordItem.get(pkField));

        }else{ //insert
            recordItem.set('created_at', new Date());
            recordItem.set('modified_at', new Date());

            saveSQL = 'INSERT INTO '+model.config.collection+' (';
            valueSQL = '';
            for(var key in fields){
                console.log(recordItem.get(key));
                if(recordItem.get(key)){
                    saveSQL += key+',';
                    setFields.push(recordItem.get(key));
                    valueSQL+= '?,';
                }
            }

            saveSQL = saveSQL.substr(0, saveSQL.length-1)+') VALUES ('+valueSQL.substr(0, valueSQL.length-1)+')';
        }
        
        self.connection.query(saveSQL, setFields, function(err, res){
            if(err){
                console.log(err);
                if(cbs.error){
                    cbs.error(err, recordItem);
                }
            }else{
                recordItem.set(pkField, recordItem.get(pkField) || res.insertId);
                if(cbs.success){
                    cbs.success(recordItem);
                }
            }
        });
    }

    function removeRecords(self, records, processedRecords, cbs){
        console.log('REMOVING');
        console.log(records);
        var errors = [];
        if(records.length===processedRecords.length){
            if(errors.length>0){
                if(cbs.error){
                    cbs.error(errors, records, processedRecords);
                }
            }else{
                if(cbs.success){
                    cbs.success(records);
                }
            }

            return;
        }

        var recordItem = records[processedRecords.length];
        
        removeRecord(self, recordItem, {
            success: function(ri){
                processedRecords.push(ri);
                removeRecords(self, records, processedRecords, cbs);
            },
            error: function(err, ri){
                errors.push(err);
                ri.lastError = err;
                processedRecords.push(ri);
                removeRecords(self, records, processedRecords, cbs);
            }
        });
    }

    function removeRecord(self, recordItem, cbs){
        var model = recordItem.model;
        var fields = model.config.fields;

        var pkField = model.config.pk_field||'id';
        var removeSQL = 'UPDATE '+model.config.collection+' SET deleted_at=?, deleted_by=? WHERE '+pkField+' = ?;';

        var setFields = [new Date(), recordItem.get('deleted_by'), recordItem.get(pkField)];

        self.connection.query(removeSQL, setFields, function(err, res){
            if(err){
                if(cbs.error){
                    cbs.error(err, recordItem);
                }
            }else{
                //recordItem.set('id', res.insertId);
                if(cbs.success){
                    cbs.success(recordItem);
                }
            }
        });
    }

    function objectToQuery(self, model, queryData, cbs){
        var querySQL = 'SELECT ';
        var valueArray = [];
        if(queryData.fields){
            for(var i=0;i<queryData.fields.length;i++){
                querySQL+='`'+queryData.fields[i]+'`,';
            }
            querySQL=querySQL.substr(0, querySQL.length-1);
        }else{
            querySQL+='* ';
        }

        querySQL+=' FROM '+model.config.collection;
        console.log(queryData);
        if(queryData.where){
            querySQL+=' WHERE ';

            for(var fieldName in queryData.where){
                var fieldCrit = queryData.where[fieldName];
                
                if(fieldCrit && (typeof fieldCrit)=='object'){
                    for(var fieldOp in fieldCrit){
                        switch(fieldOp){
                            case 'eq':
                                if(fieldCrit[fieldOp].length>1){
                                    querySQL+=fieldName+' IN (?) AND ';
                                }else{
                                    querySQL+=fieldName+'=? AND';
                                    valueArray.push(fieldCrit[fieldOp][0]);
                                }
                                
                                break;
                            case 'gt':
                                if(fieldCrit[fieldOp].length>1){
                                    querySQL+=fieldName+' IN (?) AND ';
                                }else{
                                    querySQL+=fieldName+'>? AND ';
                                    valueArray.push(fieldCrit[fieldOp][0]);
                                }
                                break;
                            case 'lt':
                                if(fieldCrit[fieldOp].length>1){
                                    querySQL+=fieldName+' IN (?) AND ';
                                }else{
                                    querySQL+=fieldName+'<? AND ';
                                    valueArray.push(fieldCrit[fieldOp][0]);
                                }
                                break;
                        }
                    }
                }else{
                    if(fieldCrit===null){
                        querySQL+=fieldName+' IS ? AND ';
                    }else{
                        querySQL+=fieldName+'=? AND ';
                    }
                    
                    valueArray.push(fieldCrit);
                }
            }

            if(querySQL.substr(querySQL.length-5, 5)==' AND '){
                querySQL = querySQL.substr(0, querySQL.length-5);
            }
        }

        return {sql: querySQL, values: valueArray};
    }

module.exports = MySQLStore;