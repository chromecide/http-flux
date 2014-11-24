var functions = require('../../lib/functions.js');
var fs = require('fs');
var serveStatic = require('serve-static');

var serve;

module.exports = function(ds, req, res, next){
    if(req.method=='GET'){
        functions.getSettings(ds, [], {
            success: function(cfg){
                var basePath = __dirname+'/../../'+(cfg['Static:BasePath']||'static');
                
                if(!serve){
                    serve = serveStatic(basePath, {index:'index.html'});
                }

                serve(req, res, function(){
                    console.log(arguments);
                    next();
                });
            },
            error: function(err){
                console.log(err);
                next();
            }
        });
    }else{
        next();
    }
};
