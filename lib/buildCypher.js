var _ = require('lodash'),
    format = require('string-format'),
    fs = require('fs');

'use strict';



/*
 * cypherBuilder
 *
 * Build Cypher import statements for initial data import given
 *   1) data input
 *   2) import config
 * Return Cypher statements to import data as configured
 *
 * Data input object (PapaParse format)
 * TODO: file object data - include at root of data object?
 *   { lastModified: 1441321996000, lastModifiedDate: dateObj, name: "legis.csv", size: 87237, type: "text/csv", webkitRelativePath: "" }
 * ------------------------------------
 * {
 *   data: [
 *     {
 *       key: value,
 *       ...
 *     },...
 *   ],
 *   errors: [
 *     {
 *       code: "TooFewFields",
 *       message: "Too few fields: expected 24 fields but parsed 1",
 *       row: 540,
 *       type: "FieldMismatch"
 *     },...
 *   ],
 * }
 *
 * Import config - as specified by user
 * TODO: define import config schema
 *  - Nodes:
 *    - fields to be included -> mapping to property name in Neo4j
 *    - primary key field
 *  - Relationships:
 *    - name
 *    - from label
 *    - from foreign key
 *    - to label
 *    - to foreign key
 * ------------------------------------
 * {
 *   nodes: [
 *     {
 *       "filename": "legislators.csv",
 *       "labels": ["Legislator"],
 *       "properties": [
 *          {
 *
 *          }
 *       ]
 *       "
  *    },...
 *   ],
 *   rels: [
 *     {
 *       from: {
 *         "filename": "legislators.csv",
 *         "labels": ...
 *         ???
 *       },
 *       to: {
 *
 *       },
 *       name: "VOTED_ON"
 *
 *     }
 *   ]
 * }
 *
 *
 * v0.1 limitations / assumptions
 * ------------------------------
 *   - no relationship properties
 *   -
 */


var CypherBuilder = (function () {

    // constants and helper funcs

    // CYPHER format string snippets
    var MERGE = "MERGE ({varbinding}:{label} {{`{key}`: {doublequote}{value}{doublequote}}})",
        SET = "ON CREATE SET {varbinding}.`{key}` = {doublequote}{castFunction}{value}{castClose}{doublequote}",
        SECONDSET = ", \n {varbinding}.`{key}` = {doublequote}{castFunction}{value}{castClose}{doublequote}",
        FINALSET = ", \n {varbinding}.`{key}` = {doublequote}{castFunction}{value}{castClose}{doublequote}",
        CREATEUNIQUERELATIONSHIP = "CREATE UNIQUE ({from})-[{varbinding}:{relname}]->({to})",
        CREATEPRIMARYKEY = "CREATE CONSTRAINT ON ({varbinding}:{label}) ASSERT {varbinding}.{key} IS UNIQUE",
        CREATEINDEX = "CREATE INDEX ON :{label}({key})";

    // LOAD CSV CYPHER format string snippets
    var LOADCSV = 'LOAD CSV {headers} FROM "{fileurl}" AS row',
        MATCH = 'MATCH ({varbinding}:{label} {{`{key}`: {value}}})',
        MERGEREL = 'MERGE ({from})-[{varbinding}:{relname}]->({to})';


    // Build single Cypher lines

    /** Handle string format for MERGE statement
     *
     * @param params
     * @param datatype
     * @returns string
     */
    function buildMerge(params, datatype) {

        if (datatype === 'string') {
            params['doublequote'] = '"';
        }

        return format(MERGE, params);
    }

    /** buildSetFromNode
     *
     * @param nodeConfig
     * @param nodeData
     * @param label
     * @returns {string}
     */
    function buildSetFromNode(nodeConfig, nodeData, label) { // FIXME: finalize signature, label?

        var setStatement = "",
            statement = "";

        var properties = _.filter(nodeConfig.properties, {"primaryKey": false, "skip": false});
        properties = _.filter(properties, function(n){return n.headerKey.length > 1;});

        _.forEach(properties, function(prop, i){

            var params = {};
            params['key'] = prop.neoKey;
            params['value'] = JSON.stringify(nodeData[prop.headerKey]);

            params['varbinding'] = '`' + _.first(nodeConfig.labels) + nodeData[_.first(_.pluck(_.filter(nodeConfig.properties, {'primaryKey': true}), 'headerKey'))] + '`';
            if (prop.dataType === 'string') {
                //params['doublequote'] = '"';
            } else if (prop.dataType === 'integer') {
                params['castFunction'] = 'toInt(';
                params['castClose'] = ')';
            } else if (prop.dataType === 'float') {
                params['castFunction'] = 'toFloat(';
                params['castClose'] = ')';
            }

            if (i === 0) {
                statement = format(SET, params);
            } else if (i < properties.length -1 ) {
                statement = format(SECONDSET, params);
            } else {
                statement = format(FINALSET, params);
            }

            // Only add statement if value is not null
            // FIXME: possible misplaced comma / ON CREATE SET statement?
            if (params['value']) {
                setStatement += statement;
            }

        });

        return setStatement;

    }

    /** Build MERGE statement from node
     *
     * @param nodeConfig
     * @param nodeData
     * @returns {string}
     */
    function buildMergeFromNode(nodeConfig, nodeData) {
        var params = {},
            datatype = 'string';

        params['label'] = _.first(nodeConfig.labels);
        params['key'] = _.first(_.pluck(_.filter(nodeConfig.properties, {'primaryKey': true}), 'headerKey'));
        datatype = _.first(_.pluck(_.filter(nodeConfig.properties, {'primaryKey': true}), 'dataType')); // FIXME: cache array filter
        params['value'] = nodeData[params['key']];

        params['varbinding'] = '`' + params['label'] + params['value'] + '`';

        return buildMerge(params, datatype);
    }

    /** buildNode
     *
     * @param nodeConfig
     * @param nodeData
     * @returns {string}
     */
    function buildNode(nodeConfig, nodeData) {
        var statement = "";

        // CREATE indexes
        // TODO add create index queries here

        // MERGE
        statement += buildMergeFromNode(nodeConfig, nodeData);
        statement += "\n";

        // SET
        statement += buildSetFromNode(nodeConfig, nodeData);

        statement += '\n';
        return statement;
    }

    function buildCSVRelationship(relConfig, csvHost, csvPathParam) {
        var statement = "// CREATE " + relConfig.name + " relationships \n",
            params = {};

        params['headers'] = "WITH HEADERS"; // FIXME: relax header constraint
        params['fileurl'] = encodeURI(csvHost + "/files/" + csvPathParam + "/" + relConfig.filename);

        // LOAD CSV

        statement += format(LOADCSV, params);
        statement += "\n";

        // MATCH FROM

        var fromParams = {};
        fromParams['varbinding'] = 'from';
        fromParams['label'] = relConfig.from.label;
        fromParams['key'] = relConfig.from.neoKey;
        fromParams['value'] = 'row.`' + relConfig.from.fileKey + '`';

        statement += format(MATCH, fromParams);
        statement += "\n";

        // MATCH TO

        var toParams = {};
        toParams['varbinding'] = 'to';
        toParams['label'] = relConfig.to.label;
        toParams['key'] = relConfig.to.neoKey;
        toParams['value'] = 'row.`' + relConfig.to.fileKey + '`';

        statement += format(MATCH, toParams);
        statement += "\n";

        // MERGE RELATIONSHIP

        var mergeParams = {};
        mergeParams['from'] = 'from';
        mergeParams['to'] = 'to';
        mergeParams['relname'] = relConfig.name;
        mergeParams['varbinding'] = relConfig.guid;

        statement += format(MERGEREL, mergeParams);

        // SET relationship properties


        var properties = _.filter(relConfig.properties, {skip: false});
        properties = _.filter(properties, function(n){return n.headerKey.length > 1;})
        if (properties.length > 0) {
            statement += '\n';
        }
        // SET
        _.forEach(properties, function(prop, i) {
            var propParams = {};
            propParams['key'] = prop.neoKey;
            propParams['varbinding'] = relConfig.guid;
            propParams['value'] = 'row.`' + prop.headerKey + '`';

            if (prop.dataType === 'string') {
                // default
            } else if (prop.dataType === 'integer') {
                propParams['castFunction'] = 'toInt(';
                propParams['castClose'] = ')';
            } else if (prop.dataType === 'float') {
                propParams['castFunction'] = 'toFloat(';
                propParams['castClose'] = ')';
            }

            if (i === 0) {
                statement += format(SET, propParams);
            } else if (i < properties.length -1 ) {
                statement += format(SECONDSET, propParams);
            } else {
                statement += format(FINALSET, propParams);
            }
            //statement += statement;
        });

        statement += ";";
        statement += "\n\n";
        return statement;
    }

    /** buildCSVNode
     *
     *  Build LOAD CSV statements to create node for a given nodeConfig object
     *
     * @param nodeConfig
     * @returns {string}
     */
    function buildCSVNode(nodeConfig, csvHost, csvPathParam) {
        var statement = "// Create " + _.first(nodeConfig.labels) + " nodes \n",
            params = {};

        params['headers'] = "WITH HEADERS"; // FIXME: relax header constraint at some point
        params['fileurl'] = encodeURI(csvHost + "/files/" + csvPathParam + "/" + nodeConfig.filename);
        params['label'] = _.first(nodeConfig.labels);
        params['key'] = _.first(_.pluck(_.filter(nodeConfig.properties, {'primaryKey': true}), 'neoKey'));
        params['value'] = 'row.`' + _.first(_.pluck(_.filter(nodeConfig.properties, {'primaryKey': true}), 'headerKey')) + '`';
        params['varbinding'] = params['label'].charAt(0);

        // LOAD CSV
        statement += format(LOADCSV, params);
        statement += "\n";

        // MERGE
        statement += format(MERGE, params);
        statement += "\n";

        var properties = _.filter(nodeConfig.properties, {primaryKey: false, skip: false});
        properties = _.filter(properties, function(n){return n.headerKey.length > 1;})
        // SET
        _.forEach(properties, function(prop, i) {
            var propParams = {};
            propParams['key'] = prop.neoKey;
            propParams['varbinding'] = params['varbinding'];
            propParams['value'] = 'row.`' + prop.headerKey + '`';

            if (prop.dataType === 'string') {
                // default
            } else if (prop.dataType === 'integer') {
                propParams['castFunction'] = 'toInt(';
                propParams['castClose'] = ')';
            } else if (prop.dataType === 'float') {
                propParams['castFunction'] = 'toFloat(';
                propParams['castClose'] = ')';
            }

            if (i === 0) {
                statement += format(SET, propParams);
            } else if (i < properties.length -1 ) {
                statement += format(SECONDSET, propParams);
            } else {
                statement += format(FINALSET, propParams);
            }
            //statement += statement;
        });

        statement += ";";
        statement += "\n\n";

        return statement;

    }

    /** buildRelationship
     *
     * @param relConfig
     * @param relData
     * @returns {*}
     */
    function buildRelationship(relConfig, relData) {

        // CREATE UNIQUE
        var params = {};
        var from = '`' + relConfig.from.label + relData[relConfig.from.fileKey] + '`',
            to = '`' + relConfig.to.label + relData[relConfig.to.fileKey] + '`';
        params['from'] = from;
        params['to'] = to;
        params['relname'] = relConfig.name;

        return format(CREATEUNIQUERELATIONSHIP, params);


    }

    /** buildConstraintsForNode
     *
     * Create constraints and indexes
     *
     * @param nodeConfig
     * @param multiStatement - if true, one Cyper statement will be created for each constraint (;)
     * @returns {*}
     */
    function buildConstraintsForNode(nodeConfig, multiStatement) {

        var statement = '';

        // CREATE PRIMARY KEY CONSTRAINTS

        // varbinding, label, key
        var pkParams = {};
        pkParams['label'] = _.first(nodeConfig.labels);
        pkParams['varbinding'] = pkParams['label'].charAt(0);
        pkParams['key'] = _.first(_.pluck(_.filter(nodeConfig.properties, {'primaryKey': true}), 'neoKey'));

        statement += format(CREATEPRIMARYKEY, pkParams);

        if (multiStatement) {
            statement += ";"
        }

        statement += "\n";

        // CREATE INDEXES

        _.forEach(_.filter(nodeConfig.properties, {'index': true}), function(prop) {
           if (prop.primaryKey === false) {
               var params = {};
               params['label'] = _.first(nodeConfig.labels);
               params['key'] = prop.neoKey;
               statement += format(CREATEINDEX, params);

               if (multiStatement) {
                   statement += ";"
               }
               statement += "\n";
           }
        });

        return statement;
    }


    /**
     * CypherBuilder constructor
     * @class CypherBuilder
     * @param {Object=} parsedFilesData
     * @param {Object=} configData
     * @module CypherBuilder
     * @constructor
     */
    function CypherBuilder(parsedFilesData, configData, csvHost, csvPathParam) {
        this._parsedFilesData = parsedFilesData;
        this._configData = configData;
        this._csvHost = csvHost;
        this._csvPathParam = csvPathParam;
    }


    // Public API


    /** Validate current datamodel configuration
     *
     * @returns {boolean}
     */
    CypherBuilder.prototype.validateConfig = function() {
        // TODO: define configuration rules
        // RULES:
        // - every node must have at least one primary key(?)
        // - every node must have a label(?)
        // -
        return false;
    };

    CypherBuilder.prototype.buildCSVCypher = function() {
        var statement = "";
        var parsedFilesData = this._parsedFilesData,
            configData = this._configData,
            csvHost = this._csvHost,
            csvPathParam = this._csvPathParam;

        // CREATE CONSTRAINTS
        //_.forEach(configData.nodes, function(nodeConfig) {
        //    statement += buildConstraintsForNode(nodeConfig, true);
        //});

        // NODES
        _.forEach(configData.nodes, function(nodeConfig) {
            var nodeData = parsedFilesData[nodeConfig.filename];
            statement += buildCSVNode(nodeConfig, csvHost, csvPathParam);

        });

        _.forEach(configData.relationships, function(relConfig) {
            statement += buildCSVRelationship(relConfig, csvHost, csvPathParam);
        });

        return statement;
    };

    CypherBuilder.prototype.cypherConstraints = function() {
        var statement = "",
            configData = this._configData;

        _.forEach(configData.nodes, function(nodeConfig) {
            statement += buildConstraintsForNode(nodeConfig, true);
        });

        return statement;

    };

    /** Get Cypher statements
     *
     * @returns {string}
     */
    CypherBuilder.prototype.buildCypher = function() {

        var statement = "";
        var parsedFilesData = this._parsedFilesData,
            configData = this._configData;

        // NODES
        _.forEach(configData.nodes, function(nodeConfig) {
            var nodeData = parsedFilesData[nodeConfig.filename];

            _.forEach(nodeData.data, function(node){
                statement += buildNode(nodeConfig, node);
            });


        });

        // RELATIONSHIPS
        _.forEach(configData.relationships, function(relConfig) {
            var relData = parsedFilesData[relConfig.filename];

            _.forEach(relData.data, function(rel) {
                statement += buildRelationship(relConfig, rel);
                statement += '\n';
            })
        });

        return statement;

    };

    // FOR TESTING ONLY
    // RETURN TEST CYPHER FIXME: rm this
    CypherBuilder.prototype.getTestCypher = function() {
        var loadLegislatorsCypher = fs.readFileSync('test/resources/loadLegislators.cql', 'utf8');
        return loadLegislatorsCypher;

    };

    // TODO: define build tool process to make these availabe only during test
    CypherBuilder.prototype.buildNode = buildNode;
    CypherBuilder.prototype.buildRelationship = buildRelationship;



    // configure exports based on environment (ie Node.js or browser)
    if (typeof exports === 'object') {
        module.exports = CypherBuilder;
    } else {
        define (function () {return CypherBuilder;})
    }

    return CypherBuilder;

}());