var functions = require('../../lib/functions.js');

module.exports = function(ds, req, res, next){
    if(req.method=='POST' || req.method=='PUT'){
        var pathActionId = false;
        var urlParts = req.pathname.split('/');
        
        if(urlParts.length==4 && urlParts[2]!=''){
            pathActionId = parseInt(urlParts[2]);
        }else{
            console.log('NO ID');
            console.log(urlParts.length);
            console.log(urlParts[2]);
        }

        var pathActionModel = ds.params.models.path_action;

        var pathActionRecord = pathActionModel.build({});
        pathActionRecord.set('deleted_at', null);
        
        for(var key in req.body){
            pathActionRecord.set(key, req.body[key]);
        }
        if(req.method=='PUT'){
            pathActionRecord.set('id', pathActionId);
            pathActionRecord.set('modified_by', req.user.id);
        }else{
            pathActionRecord.set('created_by', req.user?req.user.id:1); 
        }

        pathActionRecord.save({
            success: function(result){
                res.statusCode=200;
                res.API_output = pathActionRecord.dataValues;
                //res.API_output.users = req.body.users;
                next();
            },
            error: function(e){
                console.log('error');
                functions.error500(e, res);
                next();
            }
        });
    }else{
        next();
    }
};