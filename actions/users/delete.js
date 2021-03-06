var functions = require('../../lib/functions.js');

module.exports = function(ds, req, res, next){
    if(req.method=='DELETE'){
        var userId = false;
        var urlParts = req.pathname.split('/');
        
        if(urlParts.length==4 && urlParts[2]!==''){
            userId = parseInt(urlParts[2]);
            var userModel = ds.params.models.user;

            var userRecord = userModel.build({
                id: userId,
                deleted_at: new Date(),
                deleted_by: req.user.id,
            });
            
            userRecord.destroy({
                success: function(result){
                    res.statusCode=200;
                    res.end(JSON.stringify(userRecord.dataValues));
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