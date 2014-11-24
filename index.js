var connect = require('connect');
var http = require('http');
var compression = require('compression');
var formidable = require('formidable');
var QS = require('qs');
var cors = require('cors');

var data = require(__dirname+'/lib/data.js');

var models = require(__dirname+'/models.js');
var functions = require(__dirname+'/lib/functions.js');

var dataStore;

data.store('MySQLStore', {
    host     : 'localhost',
    user     : 'httpflux',
    password : 'httpflux',
    database : 'TokenAPI',
    autoconnect: true,
    models: models
},
{
    success: function(ds){
        dataStore = ds;
        HTTPFlux();
    },
    error: function(){
        console.log('ERROR CONNECTING TO MYSQL STORE');
    }
});

function HTTPFlux(){

    // var userModel = models.user;
    
    // userModel.find({
    //     fields: ['username'],
    //     where:{
    //         username: 'justin'
    //     }
    // }, {
    //     success: function(records){
    //         console.log('FOUND '+records.length+' RECORDS');
    //     },
    //     error: function(err, records){
    //         console.log(arguments);
    //     }
    // });

    // var newUser = userModel.build({
    //     username: 'sue',
    //     pass_phrase:'tester'
    // });

    // newUser.save({
    //     success: function(){
    //         console.log(arguments);
    //     },
    //     error: function(){
    //         console.log(arguments);
    //     }
    // });

    setTimeout(function(){
        dataStore.disconnect({
            success: function(){
                console.log('disconnected');
                process.exit();
            }
        });
    }, 60000);
}

var app = connect();

    // gzip/deflate outgoing responses
    app.use(compression());

    // Cross Origin Requests
    app.use(cors());

    // parse request bodies into req.body
    app.use(function(req, res, next){
        var form = new formidable.IncomingForm();

        form.parse(req, function(err, fields, files) {
            req.body = fields;
            req.files = files;
            next();
        });
    });

    // parse the query string and path
    app.use(function(req, res, next){
        var urlParts = req.url.split('?');
        
        req.pathname = req._parsedUrl.pathname;
        // add a trailing slash so the path finder is more accurate
        if(req.pathname.substr(req.pathname.length-1,1)!='/'){
            req.pathname+='/';
        }

        if(urlParts[1]){
            req.query = QS.parse(urlParts[1]);
        }

        // custom querystring parsing for get methods to allow better searching of api data
        if(req.method=='GET'){
            var newQSObj = {};

            var operatorReg = new RegExp('[<>!]', 'gi');

            for(var key in req.query){
                if(key.indexOf('[]')>-1){
                    var newKeyName = key.replace('[]');
                    req.query[newKeyName] = req.query[key];
                    delete req.query[key];
                    key = newKeyName;
                }
                if(operatorReg.test(key)){
                    
                    var operator = key.match(operatorReg);
                    if(operator.length===1){
                        operator = operator[0];
                        var valueParts = key.split(operator);
                        var itemKey = valueParts[0];
                        var itemValue = valueParts[1];

                        switch(operator){
                            case '>':
                                if(!newQSObj[itemKey]){
                                    newQSObj[itemKey] = {};
                                }else{
                                    if((typeof newQSObj[itemKey]!='object')){
                                        newQSObj[itemKey] = {
                                            eq: [newQSObj[itemKey]]
                                        };
                                    }
                                }

                                if(!newQSObj[itemKey].gt){
                                    newQSObj[itemKey].gt = [];
                                }

                                newQSObj[itemKey].gt.push(itemValue);
                                break;
                            case '<':
                                if(!newQSObj[itemKey]){
                                    newQSObj[itemKey] = {};
                                }else{
                                    if((typeof newQSObj[itemKey]!='object')){
                                        newQSObj[itemKey] = {
                                            eq: [newQSObj[itemKey]]
                                        };
                                    }
                                }

                                if(!newQSObj[itemKey].lt){
                                    newQSObj[itemKey].lt = [];
                                }

                                newQSObj[itemKey].lt.push(itemValue);
                                break;
                        }
                    }
                }else{
                    newQSObj[key] = req.query[key];
                }
            }
            req.query = newQSObj;
        }else{
            console.log('PREPROCESSING BODY');
            var arrayReg = /\[[0-9]\]/;
            for(var key in req.body){
                if(arrayReg.test(key)){
                    var unparsedData = req.body[key];
                    var newKeyName = key.replace(/\[[0-9]\]/,'').replace('[]','');
                    var idx = key.match(arrayReg);
                    console.log(newKeyName);
                    if(!req.body[newKeyName]){
                        req.body[newKeyName] = [];//req.body[key];
                    }

                    req.body[newKeyName].push(unparsedData);

                    delete req.body[key];
                    key = newKeyName;
                }
            }
        }
        next();
    });

    // validate the token
    app.use(function(req, res, next){
        if(!req.query){
            req.query = {};
        }

        if(!req.query.token){
            req.query.token = 'public';
        }

        if(req.query && req.query.token){
            var tokenSQL = 'SELECT * FROM tokens token INNER JOIN users user ON token.user_id=user.id WHERE user.enabled=1 AND token.token=?;';
            
            dataStore.connection.query({sql: tokenSQL, nestTables: true}, [req.query.token], function(err, records){
                if(err){
                    next();
                }else{
                    if(records.length===1){
                        req.user = records[0].user;
                        req.token = records[0].token;
                    }else{
                        var tokenSQL = 'SELECT * FROM tokens token INNER JOIN users user ON token.user_id=user.id WHERE user.enabled=1 AND token.token=?;';
                        
                        dataStore.connection.query({sql: tokenSQL, nestTables: true}, [req.query.token], function(err, records){
                            if(err){
                                next();
                            }else{
                                if(records.length===1){
                                    req.user = records[0].user;
                                    req.token = records[0].token;
                                }
                                next();
                            }
                        });
                    }
                    next();
                }
            });
        }else{
            next();
        }
    });

    //load the groups for the user, if applicable, as well as the groups for the "EVERYONE" user
    app.use(function(req, res, next){
        
        if(req.user){
            var groupSQL = 'SELECT groups.* FROM groups INNER JOIN group_users ON groups.id=group_users.group_id WHERE groups.deleted_at IS NULL AND group_users.deleted_at IS NULL AND group_users.user_id IN (?)';
            
            var userIds = [req.user.id];
            
            if(functions.PUBLIC_USER!=req.user.id){
                userIds.push(functions.PUBLIC_USER);
            }
            
            dataStore.connection.query(groupSQL, [userIds], function(err, records){
                if(err){
                    next();
                }else{
                    req.user.groups = records;
                    
                    next();
                }
            });
        }else{
            next();
        }
    });

    // load the groups that are allowed access to the requested path
    app.use(function(req, res, next){
        var pathSQL = 'SELECT g.*, p.* FROM groups g INNER JOIN group_paths gp ON g.id = gp.group_id INNER JOIN paths p ON gp.path_id = p.id WHERE path IN (?)';
        var pathArray = [];
        var pathParts = req.pathname.split('/');
        var joinedPath = '';

        for(var i=0;i<pathParts.length-1;i++){
            joinedPath+=pathParts[i];
            if(joinedPath===''){
                joinedPath='/';
            }else{
                if(joinedPath.substr(joinedPath.length-1,1)!='/'){
                  joinedPath+='/';
                }
            }
            pathArray.push(joinedPath+'*');
        }

        pathArray.push(req.pathname);

        dataStore.connection.query({sql: pathSQL, nestTables:true}, [pathArray], function(err, records){
            if(err){
                console.log(err);
                next();
            }else{
                if(records.length>0){
                    req.dataPath = records[0].p;
                    req.pathGroups = [];
                    for(var i=0;i<records.length;i++){
                        req.pathGroups.push(records[i].g);
                    }
                }
                next();
            }
        });
    });

    // validate the request
    app.use(function(req, res, next){
        if(req.user.groups.length>0){
            var allowed = false;
            
            for(var userGroup in req.user.groups){
                for(var pathGroup in req.pathGroups){
                    if(req.user.groups[userGroup].id==req.pathGroups[pathGroup].id){
                        allowed = true;
                    }
                }
            }

            if(allowed){
                next();
            }else{
                res.statusCode = 401;
                res.end('{"error":"Unauthorised 1"}');
            }
        }else{
            res.statusCode = 401;
            res.end('{"error":"Unauthorised 2"}');
        }
    });

    // process the configured actions
    app.use(function(req, res){
        var actionSQL = 'SELECT a.* FROM actions a INNER JOIN path_actions pa ON a.id = pa.action_id WHERE pa.path_id=?;';
        dataStore.connection.query(actionSQL, [req.dataPath.id], function(err, records){
            if(err){
                res.statusCode = 500;
                res.end(JSON.stringify({
                    error: err
                }));
            }else{
                if(records.length>0){
                    processActions(req, res, records);
                }else{
                    //if the response has not already been ended
                    if(res.API_output){
                        res.statusCode = 200;
                        res.end(API_output);
                    }else{
                        res.statusCode = 404;
                        res.end('{"error":"Path not Found"}');
                    }
                }
            }
        });
    });

    function processActions(req, res, actions){
        if(actions.length===0){
            if(res.API_output){
                res.statusCode = 200;
                res.end(JSON.stringify(res.API_output));
            }else{
                console.log(res);
                res.statusCode = 404;
                res.end('{"error":"Path not Found"}');
            }
            return;
        }

        var nextActionCfg = actions.shift();

        var nextAction = require(__dirname+nextActionCfg.path);

        nextAction(dataStore, req, res, function(){
            processActions(req, res, actions);
        });
    }

    //create node.js http server and listen on port
    http.createServer(app).listen(3000);