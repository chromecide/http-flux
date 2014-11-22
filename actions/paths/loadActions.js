var functions = require(__dirname+'/../../lib/functions.js');

module.exports = function(ds, req, res, next){
    console.log('IN ACTION LOADER');
    var pathId = false;
    var urlParts = req.pathname.split('/');

    if(urlParts.length==4 && urlParts[2]!==''){
        pathId = parseInt(urlParts[2], 10);
    }

    if(!pathId && typeof(res.API_output)=='object'){
        pathId = res.API_output.id;
    }

    if(req.method=='GET'){
        if(pathId && pathId>0){
            //load path actions
            if(req.query.include && pathId){
                var includeActions = false;

                for(var i=0;i<req.query.include.length;i++){
                    if(req.query.include[i]=='actions'){
                        includeActions = true;
                    }
                }

                if(includeActions){
                    console.log('LOADING ACTIONS');
                    ds.connection.query({sql: 'SELECT actions.*, path_actions.id as path_action_id, path_actions.action_order FROM actions INNER JOIN path_actions ON actions.id = path_actions.action_id WHERE path_actions.deleted_at IS NULL and actions.deleted_at IS NULL AND path_actions.path_id=? ORDER BY path_actions.action_order;'}, [pathId], function(err, recs){

                        if(typeof(res.API_output)=='object'){
                            console.log('SETTING ACTIONS');

                            res.API_output.actions=recs;
                        }else{
                            res.API_output = recs;
                        }
                        next();
                        //res.statusCode=200;
                        //res.end(JSON.stringify(returnValues));
                        next();
                    });
                }else{
                    console.log('next 1');
                    next();
                }
            }else{
                console.log('next 2');
                // res.end(JSON.stringify(returnValues));
                next();
            }
        }else{
            console.log('next 3');
            next();
        }
    } else {
        console.log('next 4');
        next();
    }
};