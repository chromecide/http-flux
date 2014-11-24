var functions = require('../../lib/functions.js');

module.exports = function(ds, req, res, next){
    if(req.method=='DELETE'){
        var configSettingId = false;
        var urlParts = req.pathname.split('/');
        
        if(urlParts.length==4 && urlParts[2]!==''){
            configSettingId = parseInt(urlParts[2]);
            var configSettingModel = ds.params.models.config_setting;

            var configSettingRecord = configSettingModel.build({
                id: configSettingId,
                deleted_at: new Date(),
                deleted_by: req.user.id,
            });
            
            configSettingRecord.destroy({
                success: function(result){
                    res.statusCode=200;
                    res.end(JSON.stringify(configSettingRecord.dataValues));
                },
                error: function(e){
                    functions.error500(e, res);
                    next();
                }
            });
        }else{
            console.log('NO RECORD TO DELETE');
            next();
            return;
        }
    }else{
        next();
    }
};