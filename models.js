var fs = require('fs');
var model = require(__dirname+'/lib/data/model.js');

var modelFiles = fs.readdirSync(__dirname+'/models');

var loadedConfigs = {};

var loadedModels = {};

for(var i=0;i<modelFiles.length;i++){
    var modelPath = __dirname+'/models/'+modelFiles[i];

    var modelCFG = require(modelPath);

    loadedModels[modelCFG.name] = new model(modelCFG);
}

module.exports = loadedModels;