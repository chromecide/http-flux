var functions = require(__dirname+'/../../lib/functions.js');

module.exports = function(ds, req, res, next){
    var groupId = false;
    var urlParts = req.pathname.split('/');

    if(urlParts.length==4 && urlParts[2]!==''){
        groupId = parseInt(urlParts[2], 10);
    }

    var userSQL;
    if(req.method=='GET'){
        if(functions.userInGroup(functions.ADMIN_GROUP, req.user.groups)){
            if(groupId && groupId>0){
                var returnValues;
                userSQL = 'SELECT * FROM groups WHERE id=?;';

                ds.connection.query(userSQL, [groupId], function(err, records){
                    if(!err){
                        if(records.length===1){
                            returnValues = records[0];
                        }else{
                            returnValues = records;
                        }

                        //admins only
                        if(req.query.include && groupId){
                            ds.connection.query({sql: 'SELECT users.id, users.username FROM users INNER JOIN group_users ON users.id = group_users.user_id WHERE group_users.group_id=? AND group_users.deleted_at IS NULL AND users.deleted_at IS NULL AND users.enabled=1;'}, [groupId], function(err, recs){
                                returnValues.users = recs;
                                console.log(recs);
                                res.API_output = returnValues;
                                //res.statusCode=200;
                                //res.end(JSON.stringify(returnValues));
                                next();
                            });
                        }else{
                            res.statusCode=200;
                            res.end(JSON.stringify(returnValues));
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
                    var groupModel = ds.params.models.group;
                    
                    var query = functions.requestToQueryObject(groupModel, req);
                    if(!query.where){
                        query.where = {deleted_at: null, enabled: 1};
                    }

                    groupModel.find(query, {
                        success: function(records){
                            res.statusCode = 200;
                            res.end(JSON.stringify(records));
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