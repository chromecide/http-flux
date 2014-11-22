var functions = require(__dirname+'/../lib/functions.js');

module.exports = function(ds, req, res, next){
    switch(req.method){
        case 'POST':
            //console.log(req.body);
            ds.connection.query('SELECT * FROM users WHERE username=? AND pass_phrase=?;', [req.body.username, req.body.pass_phrase], function(err, records){
                if(records.length===1){
                    //load the token for the user
                    var tokenSQL = 'SELECT * FROM tokens WHERE user_id=?';
                    ds.connection.query(tokenSQL, [records[0].id], function(err, tokenRecords){
                        if(tokenRecords.length>0){
                            var returnObject = {
                                token: tokenRecords[0],
                                user: records[0]
                            };

                            res.statusCode = 200;
                            res.end(JSON.stringify(returnObject));
                        }else{
                            //create a new token
                            tokenSQL = 'INSERT INTO tokens(token, user_id, created_at, modified_at, deleted_at) VALUES(?,?,?,?,?);';
                            var nowString = functions.dateToUTC(new Date());
                            var values =[functions.uuid(), records[0].id, nowString, nowString, null];

                            ds.connection.query(tokenSQL, values, function(err, result){
                                if(err){
                                    console.log(err);
                                }else{
                                    var tokenSQL = 'SELECT * FROM tokens WHERE user_id=?';
                                    ds.connection.query(tokenSQL, [records[0].id], function(err, tokenRecords){
                                        if(tokenRecords.length>0){
                                            var returnObject = {
                                                token: tokenRecords[0],
                                                user: records[0]
                                            };

                                            res.statusCode = 200;
                                            res.end(JSON.stringify(returnObject));
                                        }
                                    });
                                }
                            });
                        }
                    });
                }else{
                    res.statusCode = 401;
                    res.end('{"error":"Invalid Login"}');
                }
            });
            break;
        case 'GET':
        case 'PUT':
        case 'DELETE':
            res.statusCode = 405;
            res.end('{"error":"Method not Allowed"}');
            break;
    }
};