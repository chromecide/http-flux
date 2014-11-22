var functions = require(__dirname+'/../../lib/functions.js');

module.exports = function(ds, req, res, next){
    console.log('IN Group LOADER');
    var pathId = false;
    var urlParts = req.pathname.split('/');

    if(urlParts.length==4 && urlParts[2]!==''){
        pathId = parseInt(urlParts[2], 10);
    }

    if(!pathId && typeof(res.API_output)=='object'){
        pathId = res.API_output.id;
    }

    console.log('][][][][][][][][][');
    console.log(pathId);
    if(req.method=='GET'){
        if(pathId && pathId>0){
            //load path groups
            if(req.query.include && pathId){
                var includeGroups = false;

                for(var i=0;i<req.query.include.length;i++){
                    if(req.query.include[i]=='groups'){
                        includeGroups = true;
                    }
                }

                if(includeGroups){
                    console.log('LOADING Groups');
                    ds.connection.query({sql: 'SELECT groups.*, group_paths.id as path_group_id FROM groups INNER JOIN group_paths ON groups.id = group_paths.group_id WHERE group_paths.deleted_at IS NULL and groups.deleted_at IS NULL AND group_paths.path_id=? ORDER BY groups.name;'}, [pathId], function(err, recs){

                        if(typeof(res.API_output)=='object'){
                            console.log('SETTING GROUPS');
                            res.API_output.groups=recs;
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