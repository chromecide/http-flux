var functions = require('../../lib/functions.js');


//assumes the request has already passed through the "/actions/users/saveUser.js" or comptaible action
//and that the res.API_output is already set to the user object
module.exports = function(ds, req, res, next){
    if(req.method=='POST' || req.method=='PUT'){
        
        ds.connection.query('SELECT * FROM group_users WHERE user_id=? AND deleted_at IS NULL;', [res.API_output.id], function(err, results){
            var addedGroups = [];
            var removedGroups = [];
            for(var i=0;i<results.length;i++){
                var bExists = false;

                for(var l=0;l<res.API_output.groups.length;l++){
                    var requestItem = res.API_output.groups[l];
                    var storedItem =  results[i];

                    if(requestItem==storedItem.group_id){
                        bExists = true;
                    }
                }

                if(!bExists){
                    removedGroups.push(results[i].group_id);
                }
            }

            for(var l=0;l<res.API_output.groups.length;l++){
                var bExists = false;

                for(var i=0;i<results.length;i++){
                    var storedItem =  results[i];

                    if(requestItem==storedItem.group_id){
                        bExists = true;
                    }
                }

                if(!bExists){
                    addedGroups.push(res.API_output.groups[l]);
                }
            }

            console.log(addedGroups);
            console.log(removedGroups);
            
            addUserToGroups(ds, res.API_output.id, addedGroups, {
                success: function(){
                    removeUserFromGroups(ds, res.API_output.id, removedGroups, {
                        success: function(){
                            res.statusCode=200;
                            next();
                        },
                        error: function(){
                            //TODO: add to output error collection after updating the format
                        }
                    });
                },
                error: function(){
                    //TODO: add to output error collection after updating the format
                }
            });


            
        });
    }else{
        next();
    }
};

function addUserToGroups(ds, userId, groupIds, cbs){
    var errors = [];
    var records = [];
    if(groupIds.length===0){
        if(errors.length>0){
            if(cbs.error){
                cbs.error(errors);
            }
        }else{
            if(cbs.success){
                cbs.success(records);
            }
        }
        return;
    }

    var groupId = groupIds.shift();

    addUserToGroup(ds, userId, groupId, {
        success: function(record){
            records.push(record);
            addUserToGroups(ds, userId, groupIds, cbs);
        },
        error: function(err){
            errors.push(err);
            addUserToGroups(ds, userId, groupIds, cbs);
        }
    });
}

function addUserToGroup(ds, userId, groupId, cbs){
    var groupUserModel = ds.params.models.group_user;
    var record = groupUserModel.build({
        group_id: groupId,
        user_id: userId
    });
    console.log(record);
    record.save(cbs);
}

function removeUserFromGroups(ds, userId, groupIds, cbs){
    var errors = [];
    var records = [];
    if(groupIds.length===0){
        if(errors.length>0){
            if(cbs.error){
                cbs.error(errors);
            }
        }else{
            if(cbs.success){
                cbs.success(records);
            }
        }
        return;
    }

    var groupId = groupIds.shift();

    removeUserFromGroup(ds, userId, groupId, {
        success: function(record){
            records.push(record);
            removeUserFromGroups(ds, userId, groupIds, cbs);
        },
        error: function(err){
            errors.push(err);
            removeUserFromGroups(ds, userId, groupIds, cbs);
        }
    });
}

function removeUserFromGroup(ds, userId, groupId, cbs){
    var groupUserModel = ds.params.models.group_user;
    groupUserModel.find({
        where: {
            user_id: userId,
            group_id: groupId,
            deleted_at: null
        }
    },
    {
        success: function(records){
            if(records.length===1){
                var record = groupUserModel.build(records[0]);
                record.destroy(cbs);
            }
        },
        error: function(){

        }
    });
}