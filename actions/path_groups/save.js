var functions = require('../../lib/functions.js');

module.exports = function(ds, req, res, next){
    if(req.method=='POST' || req.method=='PUT'){
        var groupPathId = false;
        var urlParts = req.pathname.split('/');
        
        if(urlParts.length==4 && urlParts[2]!=''){
            groupPathId = parseInt(urlParts[2]);
        }else{
            console.log('NO ID');
            console.log(urlParts.length);
            console.log(urlParts[2]);
        }

        var groupPathModel = ds.params.models.group_path;

        var groupPathRecord = groupPathModel.build({});
        groupPathRecord.set('deleted_at', null);
        
        for(var key in req.body){
            groupPathRecord.set(key, req.body[key]);
        }
        if(req.method=='PUT'){
            groupPathRecord.set('id', groupPathId);
            groupPathRecord.set('modified_by', req.user.id);
        }else{
            groupPathRecord.set('created_by', req.user?req.user.id:1);
        }

        groupPathRecord.save({
            success: function(result){
                res.statusCode=200;
                res.API_output = groupPathRecord.dataValues;
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