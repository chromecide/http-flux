var functions = require(__dirname+'/../../lib/functions.js');

module.exports = function(ds, req, res, next){
    var actionId = false;
    var urlParts = req.pathname.split('/');

    if(urlParts.length==4 && urlParts[2]!==''){
        actionId = parseInt(urlParts[2], 10);
    }

    var actionSQL;
    if(req.method=='GET'){
        //admins only
        if(functions.userInGroup(functions.ADMIN_GROUP, req.user.groups)){
            if(actionId && actionId>0){
                var returnValues;
                actionSQL = 'SELECT * FROM actions WHERE id=?;';

                ds.connection.query(actionSQL, [actionId], function(err, records){
                    if(!err){
                        if(records.length===1){
                            returnValues = records[0];
                        }else{
                            returnValues = records;
                        }

                        //load action actions
                        if(req.query.include && actionId){
                            /*ds.connection.query({sql: 'SELECT users.id, users.username FROM users INNER JOIN group_users ON users.id = group_users.user_id WHERE group_users.group_id=? AND group_users.deleted_at IS NULL AND users.deleted_at IS NULL AND users.enabled=1;'}, [groupId], function(err, recs){
                                returnValues.users = recs;
                                
                                res.API_output = returnValues;
                                //res.statusCode=200;
                                //res.end(JSON.stringify(returnValues));
                                next();
                            });*/
                        }else{
                            res.API_output = returnValues;
                            res.statusCode=200;
                            // res.end(JSON.stringify(returnValues));
                            next();
                        }
                        
                    }else{
                        functions.error500(err, res);
                        next();
                    }
                });
            }else{
                if(functions.userInGroup(functions.ADMIN_GROUP, req.user.groups)){
                    //search terms are possibly supplied
                    var actionModel = ds.params.models.action;
                    
                    var query = functions.requestToQueryObject(actionModel, req);
                    if(!query.where){
                        query.where = {deleted_at: null, enabled: 1};
                    }

                    actionModel.find(query, {
                        success: function(records){
                            res.statusCode = 200;
                            //res.end(JSON.stringify(records));
                            res.API_output = records;
                            next();
                        },
                        error: function(e){
                            functions.error500(e, res);
                            next();
                        }
                    });
                }else{
                    functions.notAllowed(res);
                    next();
                }
            }

        }else{
            //not allowed
            functions.notAllowed(res);
            next();
        }
    } else {
        next();
    }
};