var functions = require(__dirname+'/../lib/functions.js');


module.exports = function(ds, req, res, next){
    console.log('IN USER');
    if(!req.user){
        console.log('NO USER');
        //not allowed
        res.statusCode = 401;
        res.end('{"error":"Unauthorised"}');
    }else{
        var userId = false;
        var urlParts = req.pathname.split('/');

        if(urlParts.length==3 && urlParts[urlParts.length-1]!==''){
            userId = parseInt(urlParts[2], 10);
        }

        var userSQL;
        switch(req.method){
            case 'GET':
                if(functions.userInGroup(functions.ADMIN_GROUP, req.user.groups) || (req.user.id===userId)){
                    if(userId && userId>0){
                        var returnValues;
                        userSQL = 'SELECT * FROM users WHERE id=?;';

                        ds.connection.query(userSQL, [userId], function(err, records){
                            if(!err){
                                if(records.length===1){
                                    returnValues = records[0];
                                }else{
                                    returnValues = records;
                                }

                                res.statusCode=200;
                                res.end(JSON.stringify(returnValues));
                            }else{
                                functions.error500(err, res);
                            }
                        });
                    }else{
                        if(functions.userInGroup(functions.ADMIN_GROUP, req.user.groups)){
                            //search terms are possibly supplied
                            var userModel = ds.params.models.user;
                            var query = functions.requestToQueryObject(userModel, req);
                            
                            userModel.find(query, {
                                success: function(records){
                                    res.statusCode = 200;
                                    res.end(JSON.stringify(records));
                                },
                                error: function(e){
                                    functions.error500(e, res);
                                }
                            });
                        }else{
                            functions.notAllowed(res);
                        }
                    }

                }else{
                    console.log('NOT IN GROUP');
                    //not allowed
                    functions.notAllowed(res);
                }
                break;
            case 'POST':
                if(functions.userInGroup(functions.ADMIN_GROUP, req.user.groups)){

                }
                console.log('SAVING...');

                console.log(req.body);
                break;
            case 'PUT':

                break;
            case 'DELETE':

                break;
        }
    }
};