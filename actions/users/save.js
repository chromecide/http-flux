var functions = require('../../lib/functions.js');

module.exports = function(ds, req, res, next){
    if(req.method=='POST' || req.method=='PUT'){
        var userId = false;
        var urlParts = req.pathname.split('/');
        
        if(urlParts.length==4 && urlParts[2]!=''){
            userId = parseInt(urlParts[2]);
        }else{
            console.log('NO ID');
            console.log(urlParts.length);
            console.log(urlParts[2]);
        }

        var userModel = ds.params.models.user;

        var userRecord = userModel.build({});
        userRecord.set('deleted_at', null);
        
        for(var key in req.body){
            userRecord.set(key, req.body[key]);
        }

        if(req.method=='PUT'){
            userRecord.set('id', userId);
            userRecord.set('modified_by', req.user.id);
        }else{
            userRecord.set('created_by', req.user?req.user.id:1);
        }

        userRecord.save({
            success: function(result){
                res.statusCode=200;
                res.API_output = userRecord.dataValues;
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