function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
           .toString(16)
           .substring(1);
}

module.exports = {
    PUBLIC_USER: 1,
    PUBLIC_GROUP: 1,
    ADMIN_GROUP: 2,
    uuid: function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
               s4() + '-' + s4() + s4() + s4();
    },
    dateToUTC: function(dt){
        return dt.getUTCFullYear()+'-'+dt.getUTCMonth()+'-'+dt.getUTCDate()+' '+dt.getUTCHours()+':'+dt.getUTCMinutes()+':'+dt.getUTCSeconds();
    },
    notAllowed: function(res){
        res.statusCode = 401;
        res.end('{"error":"Unauthorised"}');
    },
    error500: function(err, res){
        res.statusCode = 500;
        res.end(JSON.stringify({error: err}));
    },
    userInGroup: function(groupId, userGroups){
        var inGroup = false;

        for(var i=0;i<userGroups.length;i++){
            if(userGroups[i].id==groupId){
                inGroup = true;
                continue;
            }
        }

        return inGroup;
    },
    requestToQueryObject: function(model, req){
        var query = {};
        var fields = [];
        var sort = '';
        var start = 1;
        var limit = 50;
        
        for(var key in req.query){

            switch(key){
                case 'token':
                    break;
                case 'fields':
                    query.fields = req.query.fields;
                    break;
                case 'orderby':
                    sort = req.query.orderby;
                    break;
                case 'deleted_at':
                    if(!query.where){
                        query.where = {};
                    }
                    if(req.query.deleted_at==-1){
                        query.where['deleted_at'] = null;
                    }else{
                        if(!query.where){
                            query.where = {};
                        }

                        query.where[key] = req.query[key];
                    }
                    break;
                default:
                    if(!query.where){
                        query.where = {};
                    }

                    query.where[key] = req.query[key];
                    break;
            }
        }

        return query;
    },
    getSettings: function(ds, keys, cbs){
        var sql = 'SELECT * FROM config';
        if(!keys || keys.length>0){
            sql +=' WHERE `key` IN (?)';
        }

        sql+=' ORDER BY `key`;';
        
        ds.connection.query(sql, [keys], function(err, recs){
            if(err){
                if(cbs.error){
                    cbs.error(err, keys);
                }
            }else{
                if(cbs.success){
                    var cfg = {};
                    for(var i=0;i<recs.length;i++){
                        cfg[recs[i].key]=cfg[recs[i].value];
                    }
                    cbs.success(cfg);
                }
            }
        });
    }
};