var functions = require('../../lib/functions.js');

module.exports = function(ds, req, res, next){
    if(req.method=='POST' || req.method=='PUT'){
        var groupId = false;
        var urlParts = req.pathname.split('/');
        
        if(urlParts.length==4 && urlParts[2]!=''){
            groupId = parseInt(urlParts[2]);
        }else{
            console.log('NO ID');
            console.log(urlParts.length);
            console.log(urlParts[2]);
        }

        var groupModel = ds.params.models.group;

        var groupRecord = groupModel.build({});
        groupRecord.set('deleted_at', null);
        
        for(var key in req.body){
            groupRecord.set(key, req.body[key]);
        }
        if(req.method=='PUT'){
            groupRecord.set('id', groupId);
            groupRecord.set('modified_by', req.user.id);
        }else{
            groupRecord.set('created_by', req.user?req.user.id:1);
        }

        groupRecord.save({
            success: function(result){
                res.statusCode=200;
                res.API_output = groupRecord.dataValues;
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