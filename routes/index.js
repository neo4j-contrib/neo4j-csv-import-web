var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    neo4j = require('neo4j'),
    CypherBuilder = require('../lib/buildCypher');

// TODO: move route logic out into individual modules
// TODO: rename routes to something more meaningful

/** parseLoadData
 *
 * Parse load form data into datamodel mapping format
 *
 * @param formData
 * @returns {*}
 */
function parseLoadData(formData) {
  var datamodelConfig = {};


  var filenames = [];
  // get all filenames
  _.forEach(formData, function(v, k) {
    if (_.startsWith(k, 'file')) {
      filenames.push(v);
    }
  });

  var filesToImport = [];
  // filter for files selected to be imported
  _.forEach(filenames, function(file) {
    if (formData[file+'importCheck'] === 'on') {
      filesToImport.push(file);
    }
  });

  // find all nodes and relationships
  var nodes = [],
      rels = [];

  _.forEach(filesToImport, function(file) {
    if (formData[file+'typeRadios'] === 'node') {
      var node = {};
      node['filename'] = file;
      nodes.push(node);
    } else if (formData[file+'typeRadios'] === 'relationship') {
      var rel = {};
      rel['filename'] = file;
      rels.push(rel);
    }
  });

  datamodelConfig['nodes'] = nodes;
  datamodelConfig['relationships'] = rels;


  return datamodelConfig;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/datamodel', function(req, res, next) {
  var fileData = req.session.fileData,
      configData = req.session.configData;

  var context = {};
  context = fileData; // array of file names
  context['config'] = configData;
  console.dir(context);
  res.render('datamodel', context);
});

router.post('/datamodel', function(req, res, next) {
  var formData = req.body,
      configData = req.session.configData,
      fileData = req.session.fileData,
      nodesConfig = [];


  console.dir(formData);
  console.dir(configData);
  console.dir(fileData);

  var labelsArray = ["Node"]; // FIXME: temporary placeholder for labels

  _.forEach(fileData.files, function(filename) {
    var nodeConfig = _.filter(configData.nodes, {'filename': filename})[0];
    console.dir(nodeConfig);
    // create labels array, add labels: ["NODE"]
    // get all fields for this filename
    // for each field
    // if field is included
    // create obj
    // headerKey, neoKey, dataType, index, primaryKey, foreignKey
    // append to properties array
    // properties: [{headerKey, neoKey, dataType, index, primaryKey, foreignKey}]

    var fields = fileData[filename]['meta']['fields'],
        properties = [];


    _.forEach(fields, function(field, i) {
      if (formData[filename+'-'+field+'-include'] === 'on') {
        var propertyObj = {};
        propertyObj['headerKey'] = field;
        propertyObj['neoKey'] = formData[filename + '-' + field + '-rename'] || field;

        propertyObj['dataType'] = 'string'; // FIXME: get data type
        if (formData[filename + '-' + field + '-index'] === 'on') {
          propertyObj['index'] = true;
        } else {
          propertyObj['index'] = false;
        }

        if (formData[filename + '-' + field + '-pk'] === "on") {
          propertyObj['primaryKey'] = true;
        } else {
          propertyObj['primaryKey'] = false;
        }

        propertyObj['foreignKey'] = false; // FIXME: not implemented

        properties.push(propertyObj);
      }

    });

    var strippedFilename = filename.split('.').join(""); // FIXME: better consistency with naming here
    nodeConfig['labels'] = [formData[strippedFilename+'LabelInput']];
    nodeConfig['properties'] = properties;
    nodesConfig.push(nodeConfig);


  });
  configData.nodes = nodesConfig;
  req.session.configData = configData;
  req.session.save();
  console.dir(configData);

  res.redirect('/import');

});

router.get('/import', function(req, res, next) {
  var cypherBuilder = new CypherBuilder(req.session.fileData, req.session.configData);
  var cypher = cypherBuilder.buildCypher();
  //var cypher = cypherBuilder.getTestCypher();

  // get filedata and config data from session
  // instantiate CypherBuilder instance and generate cypher
  // pass cypher in the context object
  // populate textarea with cypher in template
  // add js event handler to call ajax method to connect / run against Neo4j instance
  res.render('import', {cypher: cypher});
});

router.post('/importNeo4jInstance', function(req, res, next) {
  // get connection vars from req.body
  // connect to Neo4j instance
  // get filedata and config data from session
  // instaantiate cypherBuilder instance and generate cypher
  // execute query against neo4j
  // return results
  var username = req.body.neo4jUser,
      password = req.body.neo4jPassword,
      neo4jURL = req.body.neo4jURL;

  var db = new neo4j.GraphDatabase({
    "url": neo4jURL,
    "auth": {
      "username": username,
      "password": password
    }
  });

  var cypherBuilder = new CypherBuilder(req.session.fileData, req.session.configData);

  var cypher = cypherBuilder.buildCypher();
  //var cypher = cypherBuilder.getTestCypher(); // FIXME: don't use test cypher
  console.log(cypher);
  db.cypher({query: cypher}, function(err, results) {
    console.log(results);
    if (err) {
      throw err;
    }
    console.log(results);

  });
});


router.get('/load', function(req, res, next) {
  res.render('load', {title: 'Load'});
});

router.post('/load', function(req, res, next) {
  req.session.fileData = req.body;
  req.session.save();
  //console.log(req.session.fileData);

});

router.get('/load2', function(req, res, next) {
  var fileData = req.session.fileData;
  var context = {};
  context['files'] = fileData.files;
  res.render('load2', context);

});

router.post('/load2', function(req, res, next) {
  var formData = req.body;
  console.dir(formData);

  req.session.configData = parseLoadData(formData);
  req.session.save();

  res.redirect('/datamodel');

});

router.get('/preview/:filename', function(req, res, next) {
  var filename = req.params.filename;
  //console.log(req.session);
  // TODO: process form data into something easier to work with
  var previewData = req.session.fileData[filename];
  previewData['filename'] = filename;
  res.render('preview', previewData)
});

module.exports = router;
