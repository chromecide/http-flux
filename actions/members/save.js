var functions = require('../../lib/functions.js');
//assumes the user object has already been saved

module.exports = function(ds, req, res, next){
    if(req.method=='POST' || req.method=='PUT'){
        var userId = false;
        var urlParts = req.pathname.split('/');
        
        if(urlParts.length==4 && urlParts[2]!=''){
            userId = parseInt(urlParts[2]);
        }

        if(!userId && typeof(res.API_output)=='object'){
            userId = res.API_output.id;
        }

        var memberModel = ds.params.models.member;

        memberModel.find({
            where: {
                user_id: userId
            }
        },
        {
            success: function(rec){

                var memberRecord = memberModel.build(rec.length===1?rec[0]:{
                    user_id: userId
                });

                memberRecord.set('deleted_at', null);
                
                for(var key in req.body){
                    memberRecord.set(key, req.body[key]);
                }

                if(req.method=='PUT'){
                    memberRecord.set('id', memberId);
                    memberRecord.set('modified_by', req.user.id);
                }else{
                    memberRecord.set('created_by', req.user?req.user.id:1);
                }

                memberRecord.save({
                    success: function(result){
                        res.statusCode=200;
                        res.API_output = memberRecord.dataValues;
                        //res.API_output.users = req.body.users;
                        next();
                    },
                    error: function(e){
                        console.log('error');
                        functions.error500(e, res);
                        next();
                    }
                });
            },
            error: function(){

            }
        });
        
    }else{
        next();
    }
};