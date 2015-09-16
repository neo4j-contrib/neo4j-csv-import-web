var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/datamodel', function(req, res, next) {
  var fileData = req.session.fileData;
  var context = {};
  context['files'] = fileData.files;
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
  console.log(req.session.fileData);

});

router.get('/load2', function(req, res, next) {
  var fileData = req.session.fileData;
  var context = {};
  context['files'] = fileData.files;
  res.render('load2', context);

});

router.post('/load2', function(req, res, next) {
  var formData = req.body;
  req.session.loadData = formData;
  req.session.save();
  console.dir(formData);
  res.redirect('/datamodel');

});

router.get('/preview/:filename', function(req, res, next) {
  var filename = req.params.filename;
  console.log(req.session);
  // TODO: process form data into something easier to work with
  var previewData = req.session.fileData[filename];
  previewData['filename'] = filename;
  res.render('preview', previewData)
});



module.exports = router;
