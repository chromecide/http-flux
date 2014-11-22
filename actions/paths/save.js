var functions = require('../../lib/functions.js');

module.exports = function(ds, req, res, next){
    if(req.method=='POST' || req.method=='PUT'){
        var pathId = false;
        var urlParts = req.pathname.split('/');
        
        if(urlParts.length==4 && urlParts[2]!=''){
            pathId = parseInt(urlParts[2]);
        }else{
            console.log('NO ID');
            console.log(urlParts.length);
            console.log(urlParts[2]);
        }

        var pathModel = ds.params.models.path;

        var pathRecord = pathModel.build({});
        pathRecord.set('deleted_at', null);
        
        for(var key in req.body){
            pathRecord.set(key, req.body[key]);
        }
        if(req.method=='PUT'){
            pathRecord.set('id', pathId);
            pathRecord.set('modified_by', req.user.id);
        }else{
            pathRecord.set('created_by', req.user?req.user.id:1);
        }
        console.log(req.body);
        console.log('-=-=-=-');
        pathRecord.save({
            success: function(result){
                res.statusCode=200;
                res.API_output = pathRecord.dataValues;
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