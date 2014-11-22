var functions = require('../../lib/functions.js');


//assumes the request has already passed through the "/actions/paths/savePath.js" or comptaible action
//and that the res.API_output is already set to the path object
//also assumed is that all actions posted exist and are in the format of [action_id, order]
module.exports = function(ds, req, res, next){
    if(req.method=='POST' || req.method=='PUT'){
        if(res.API_output.actions){
            updatePathActions(ds, res.API_output.id, res.API_output.actions, {
                success: function(){
                    res.statusCode=200;
                    next();
                },
                error: function(){
                    //TODO: add to output error collection after updating the format
                }
            });
        }else{
            next();
        }
    }else{
        next();
    }
};

function updatePathActions(ds, pathId, actions, cbs){
    var errors = [];
    var records = [];
    if(actions.length===0){
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

    var action = actions.shift();
    var actionId = action[0];
    var order = action[1];

    updatePathAction(ds, actionId, pathId, order, {
        success: function(record){
            records.push(record);
            updatePathActions(ds, pathId, actions, cbs);
        },
        error: function(err){
            errors.push(err);
            console.log(err);
            addUsersToGroup(ds, pathId, actions, cbs);
        }
    });
}

function updatePathAction(ds, actionId, pathId, order, cbs){
    var pathActionModel = ds.params.models.path_action;

    pathActionModel.find({
        where:{
            path_id: pathId,
            action_id: actionId,
            deleted_at: null
        }
    }, {
        success: function(records){
            if(records[0]){
                records[0].action_order = order;
                var record = pathActionModel.build(records[0]);
                record.save(cbs);
            }else{
                if(cbs.error){
                    cbs.error("Path Action not Found");
                }
            }
        },
        error: function(err){
            if(cbs.error){
                cbs.error(err, action);
            }
        }
    });
}