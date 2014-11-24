var functions = require('../../lib/functions.js');

module.exports = function(ds, req, res, next){
    if(req.method=='POST' || req.method=='PUT'){
        var configSettingId = false;
        var urlParts = req.pathname.split('/');
        
        if(urlParts.length==4 && urlParts[2]!=''){
            configSettingId = parseInt(urlParts[2]);
        }else{
            console.log('NO ID');
            console.log(urlParts.length);
            console.log(urlParts[2]);
        }

        var configSettingModel = ds.params.models.config_setting;

        var configSettingRecord = configSettingModel.build({});
        configSettingRecord.set('deleted_at', null);
        
        for(var key in req.body){
            configSettingRecord.set(key, req.body[key]);
        }

        if(req.method=='PUT'){
            configSettingRecord.set('id', configSettingId);
            configSettingRecord.set('modified_by', req.user.id);
        }else{
            configSettingRecord.set('created_by', req.user?req.user.id:1);
        }

        configSettingRecord.save({
            success: function(result){
                res.statusCode=200;
                res.API_output = configSettingRecord.dataValues;
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