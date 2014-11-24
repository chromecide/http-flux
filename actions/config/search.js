var functions = require(__dirname+'/../../lib/functions.js');

module.exports = function(ds, req, res, next){
    var configSettingId = false;
    var urlParts = req.pathname.split('/');

    if(urlParts.length==4 && urlParts[2]!==''){
        configSettingId = parseInt(urlParts[2], 10);
    }

    var pathSQL;
    if(req.method=='GET'){
        //admins only
        if(functions.userInGroup(functions.ADMIN_GROUP, req.user.groups)){
            if(configSettingId && configSettingId>0){
                var returnValues;
                pathSQL = 'SELECT * FROM config WHERE id=?;';

                ds.connection.query(pathSQL, [configSettingId], function(err, records){
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
                //search terms are possibly supplied
                var configSettingModel = ds.params.models.config_setting;
                
                var query = functions.requestToQueryObject(configSettingModel, req);
                if(!query.where){
                    query.where = {deleted_at: null};
                }

                configSettingModel.find(query, {
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