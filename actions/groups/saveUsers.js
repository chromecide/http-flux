var functions = require('../../lib/functions.js');


//assumes the request has already passed through the "/actions/users/saveUser.js" or comptaible action
//and that the res.API_output is already set to the user object
module.exports = function(ds, req, res, next){
    if(req.method=='POST' || req.method=='PUT'){
        
        ds.connection.query('SELECT * FROM group_users WHERE group_id=? AND deleted_at IS NULL;', [res.API_output.id], function(err, results){
            var addedUsers = [];
            var removedUsers = [];

            for(var i=0;i<results.length;i++){
                var bExists = false;

                for(var l=0;l<res.API_output.users.length;l++){
                    var requestItem = res.API_output.users[l];
                    var storedItem =  results[i];

                    if(requestItem==storedItem.user_id){
                        bExists = true;
                    }
                }

                if(!bExists){
                    removedUsers.push(results[i].user_id);
                }
            }

            for(var l=0;l<res.API_output.users.length;l++){
                var bExists = false;

                for(var i=0;i<results.length;i++){
                    var storedItem =  results[i];

                    if(requestItem==storedItem.user_id){
                        bExists = true;
                    }
                }

                if(!bExists){
                    addedUsers.push(res.API_output.users[l]);
                }
            }
            console.log('-=-=-=-=-');
            console.log(addedUsers);
            console.log(removedUsers);
            
            addUsersToGroup(ds, res.API_output.id, addedUsers, {
                success: function(){
                    removeUsersFromGroup(ds, res.API_output.id, removedUsers, {
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

function addUsersToGroup(ds, groupId, userIds, cbs){
    var errors = [];
    var records = [];
    if(userIds.length===0){
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

    var userId = userIds.shift();

    addUserToGroup(ds, userId, groupId, {
        success: function(record){
            records.push(record);
            addUsersToGroup(ds, groupId, userIds, cbs);
        },
        error: function(err){
            errors.push(err);
            addUsersToGroup(ds, groupId, userIds, cbs);
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

function removeUsersFromGroup(ds, groupId, userIds, cbs){
    var errors = [];
    var records = [];

    if(userIds.length===0){
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

    var userId = userIds.shift();

    removeUserFromGroup(ds, userId, groupId, {
        success: function(record){
            records.push(record);
            removeUsersFromGroup(ds, groupId, userIds, cbs);
        },
        error: function(err){
            errors.push(err);
            removeUsersFromGroup(ds, groupId, userIds, cbs);
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