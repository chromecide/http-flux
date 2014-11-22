var functions = require('../../lib/functions.js');

module.exports = function(ds, req, res, next){
    if(req.method=='DELETE'){
        var groupPathId = false;
        var urlParts = req.pathname.split('/');
        
        if(urlParts.length==4 && urlParts[2]!==''){
            groupPathId = parseInt(urlParts[2]);
            var groupPathModel = ds.params.models.group_path;

            var groupPathRecord = groupPathModel.build({
                id: groupPathId,
                deleted_at: new Date(),
                deleted_by: req.user.id,
            });
            
            groupPathRecord.destroy({
                success: function(result){
                    res.statusCode=200;
                    res.end(JSON.stringify(groupPathRecord.dataValues));
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