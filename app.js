var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    hbs = require('hbs'),
    _ = require("lodash"),
    routes = require('./routes/index'),
    CypherBuilder = require('./lib/buildCypher'),
    expressValidator = require('express-validator'),
    RedisStore = require('connect-redis')(session),
    config = require('./lib/config'),
    guid = require('./lib/util').guid;

// FIXME: move hbs helpers to separate module
// Handlebars helpers

// strip
hbs.registerHelper("stripstr", function(str) {
  // FIXME: probably need a bit more logic here
  return str.split('.').join("");
});

hbs.registerHelper("stripfilename", function(str) {
    str = str.replace(/([^a-z0-9]+)/gi, "");
    return str.replace(/csv$/gi, "");
});

// build HTML for /preview/:filename
hbs.registerHelper("previewTable", function(fields, data) {
  var rows = "";

  // build header
  var row = "<tr>";
  _.forEach(fields, function(field) {
    row += "<th>" + field + "</th>";
  });
  row += "</tr>";
  rows += row;

  _.forEach(data, function(obj, i) {
      if (i >= 10) return false; // only show 10 rows in preview
    row = "<tr>";
    _.forEach(fields, function(field) {
      row += "<td>" + obj[field] + "</td>";
    });
    row += "</tr>";
    rows += row;
  });

  return new hbs.SafeString(rows);
  // append rows
});

hbs.registerHelper("datamodelTable", function(filename, fileData, configData) {

    var rows = "";


    _.forEach(fileData[filename]['meta']['fields'], function(field) {
        var row = '<tr>';
        row += '<td>' + field + '</td>'; // static
        row += '<td><label><input class="renameLabel" data-filename="' + filename + '" data-field="' + field + '" type="text" name="' + filename + '-' + field + '-rename"></label></td>'; // rename
        row += '<td><label><input class="skipCheckBox" data-filename="' + filename + '" data-field="' + field + '"type="checkbox" name="' + filename + '-' + field + '-skip"></label></td>'; // skip
        row += '<td><label><input type="checkbox" data-filename="' + filename + '" data-field="' + field + '" class="pkcheckbox" name="' + filename + '-' + field + '-pk"></label></td>'; // PK
        row += '<td><label><select><option value="---">---</option></select></label></td>'; // datatype
        row += '<td><label><input class="indexCheckbox" type="checkbox" data-filename="' + filename + '" data-field"' + field + '" name="' + filename + '-' + field + '-index"></label></td>'; // create index
        row += '<td><button type="button" class="btn btn-sm">---</button></td>';
        row += '</tr>';
        rows += row;
    });

    return new hbs.SafeString(rows);

});

hbs.registerHelper("stringify", function(json) {
    return JSON.stringify(json);
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// express-session


if (config.redis_url === '') {
    app.use(session({
        genid: guid,
        secret: config.session_secret,
        resave: false,
        saveUninitialized: true
    }));
    console.log("using in-memory session store");

} else {
    var store = new RedisStore({url: config.redis_url, ttl: config.redis_ttl});
    app.use(session({
        secret: config.session_secret,
        store: store,
        resave: true,
        saveUninitialized: true
    }));

    console.log("using Redis session store");
    //console.log(config.redis_url);
}

// Routes here
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;