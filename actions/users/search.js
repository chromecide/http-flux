var functions = require(__dirname+'/../../lib/functions.js');

module.exports = function(ds, req, res, next){
    var userId = false;
    var urlParts = req.pathname.split('/');

    if(urlParts.length==4 && urlParts[2]!==''){
        userId = parseInt(urlParts[2], 10);
    }

    var userSQL;
    if(req.method=='GET'){
        if(functions.userInGroup(functions.ADMIN_GROUP, req.user.groups) || (req.user.id===userId)){
            if(userId && userId>0){
                var returnValues;
                userSQL = 'SELECT * FROM users WHERE id=?;';

                ds.connection.query(userSQL, [userId], function(err, records){
                    if(!err){
                        if(records.length===1){
                            returnValues = records[0];
                        }else{
                            returnValues = records;
                        }

                        if(req.query.include && userId){
                            ds.connection.query({sql: 'SELECT groups.* FROM groups INNER JOIN group_users ON groups.id = group_users.group_id WHERE group_users.deleted_at IS NULL AND group_users.user_id=?;'}, [userId], function(err, recs){
                                returnValues.groups = recs;
                                res.statusCode=200;
                                res.API_output = returnValues;
                                
                                next();
                            });
                        }else{
                            res.statusCode=200;
                            res.API_output = returnValues;

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
                    var userModel = ds.params.models.user;
                    
                    var query = functions.requestToQueryObject(userModel, req);
                    
                    userModel.find(query, {
                        success: function(records){
                            res.statusCode = 200;
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