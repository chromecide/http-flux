var functions = require('../../lib/functions.js');

module.exports = function(ds, req, res, next){
    if(req.method=='DELETE'){
        var pathId = false;
        var urlParts = req.pathname.split('/');
        
        if(urlParts.length==4 && urlParts[2]!==''){
            pathId = parseInt(urlParts[2]);
            var pathModel = ds.params.models.path;

            var pathRecord = pathModel.build({
                id: pathId,
                deleted_at: new Date(),
                deleted_by: req.user.id,
            });
            
            pathRecord.destroy({
                success: function(result){
                    res.statusCode=200;
                    res.end(JSON.stringify(pathRecord.dataValues));
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