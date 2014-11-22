var functions = require('../../lib/functions.js');

module.exports = function(ds, req, res, next){
    if(req.method=='DELETE'){
        var pathActionId = false;
        var urlParts = req.pathname.split('/');
        
        if(urlParts.length==4 && urlParts[2]!==''){
            pathActionId = parseInt(urlParts[2]);
            var pathActionModel = ds.params.models.path_action;

            var pathActionRecord = pathActionModel.build({
                id: pathActionId,
                deleted_at: new Date(),
                deleted_by: req.user.id,
            });
            
            pathActionRecord.destroy({
                success: function(result){
                    res.statusCode=200;
                    res.end(JSON.stringify(pathActionRecord.dataValues));
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