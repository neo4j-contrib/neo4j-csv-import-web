var express = require('express'),
    router = express.Router(),
    _ = require('lodash');

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

router.get('/import', function(req, res, next) {
  res.render('import', {title: 'Import'});
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
