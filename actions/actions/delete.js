var functions = require('../../lib/functions.js');

module.exports = function(ds, req, res, next){
    if(req.method=='DELETE'){
        var actionId = false;
        var urlParts = req.pathname.split('/');
        
        if(urlParts.length==4 && urlParts[2]!==''){
            actionId = parseInt(urlParts[2]);
            var actionModel = ds.params.models.action;

            var actionRecord = actionModel.build({
                id: actionId,
                deleted_at: new Date(),
                deleted_by: req.user.id,
            });
            
            actionRecord.destroy({
                success: function(result){
                    res.statusCode=200;
                    res.end(JSON.stringify(actionRecord.dataValues));
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