var functions = require(__dirname+'/../../lib/functions.js');

module.exports = function(ds, req, res, next){
    var pathId = false;
    var urlParts = req.pathname.split('/');

    if(urlParts.length==4 && urlParts[2]!==''){
        pathId = parseInt(urlParts[2], 10);
    }

    var pathSQL;
    if(req.method=='GET'){
        //admins only
        if(functions.userInGroup(functions.ADMIN_GROUP, req.user.groups)){
            if(pathId && pathId>0){
                var returnValues;
                pathSQL = 'SELECT * FROM paths WHERE id=?;';

                ds.connection.query(pathSQL, [pathId], function(err, records){
                    if(!err){
                        if(records.length===1){
                            returnValues = records[0];
                        }else{
                            returnValues = records;
                        }

                        res.API_output = returnValues;
                        res.statusCode=200;
                        // res.end(JSON.stringify(returnValues));
                        next();
                        
                    }else{
                        functions.error500(err, res);
                        next();
                    }
                });
            }else{
                if(functions.userInGroup(functions.ADMIN_GROUP, req.user.groups)){
                    //search terms are possibly supplied
                    var pathModel = ds.params.models.path;
                    
                    var query = functions.requestToQueryObject(pathModel, req);
                    if(!query.where){
                        query.where = {deleted_at: null, enabled: 1};
                    }
                    if(!query.orderby){
                        query.orderby = 'path ASC';
                    }

                    pathModel.find(query, {
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