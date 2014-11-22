var functions = require('../../lib/functions.js');

module.exports = function(ds, req, res, next){
    if(req.method=='POST' || req.method=='PUT'){
        var actionId = false;
        var urlParts = req.pathname.split('/');
        
        if(urlParts.length==4 && urlParts[2]!=''){
            actionId = parseInt(urlParts[2]);
        }else{
            console.log('NO ID');
            console.log(urlParts.length);
            console.log(urlParts[2]);
        }

        var actionModel = ds.params.models.action;

        var actionRecord = actionModel.build({});
        actionRecord.set('deleted_at', null);
        
        for(var key in req.body){
            actionRecord.set(key, req.body[key]);
        }
        if(req.method=='PUT'){
            actionRecord.set('id', actionId);
            actionRecord.set('modified_by', req.user.id);
        }else{
            actionRecord.set('created_by', req.user?req.user.id:1);
        }

        actionRecord.save({
            success: function(result){
                res.statusCode=200;
                res.API_output = actionRecord.dataValues;
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