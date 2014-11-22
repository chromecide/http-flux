var functions = require('../../lib/functions.js');

module.exports = function(ds, req, res, next){
    if(req.method=='DELETE'){
        var groupId = false;
        var urlParts = req.pathname.split('/');
        
        if(urlParts.length==4 && urlParts[2]!==''){
            groupId = parseInt(urlParts[2]);
            var groupModel = ds.params.models.group;

            var groupRecord = groupModel.build({
                id: groupId,
                deleted_at: new Date(),
                deleted_by: req.user.id,
            });
            
            groupRecord.destroy({
                success: function(result){
                    res.statusCode=200;
                    res.end(JSON.stringify(groupRecord.dataValues));
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