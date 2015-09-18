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
    var MERGE = "MERGE ({varbinding}:{label} {{{key}: {doublequote}{value}{doublequote}}})",
        SET = "SET {varbinding}.{key} = {doublequote}{value}{doublequote}",
        SECONDSET = ", \n {varbinding}.{key} = {doublequote}{value}{doublequote}",
        FINALSET = ", \n {varbinding}.{key} = {doublequote}{value}{doublequote}",
        CREATEUNIQUERELATIONSHIP = "CREATE UNIQUE ({from})-[{varbinding}:{relname}]->({to})";


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

    /** Handle string format for SET statement
     *
     * @param params
     * @param datatype
     * @returns {*}
     */
    function buildSet(params, datatype) {

        if (datatype === 'string') {
            params['doublequote'] = '"';
        }

        return format(SET, params);
    }

    /** buildSetFromNode
     *
     * @param nodeConfig
     * @param nodeData
     * @param label
     * @returns {string}
     */
    function buildSetFromNode(nodeConfig, nodeData, label) { // FIXME: finalize signature, label?
        var params = {},
            datatype = "string";

        var setStatement = "",
            statement = "";

        var properties = _.filter(nodeConfig.properties, {"primaryKey": false});

        _.forEach(properties, function(prop, i){

            var params = {};
            params['key'] = prop.neoKey;
            params['value'] = nodeData[prop.headerKey];

            params['varbinding'] = _.first(nodeConfig.labels) + nodeData[_.first(_.pluck(_.filter(nodeConfig.properties, {'primaryKey': true}), 'headerKey'))];

            if (prop.dataType === 'string') {
                params['doublequote'] = '"';
            }

            if (i === 0) {
                statement = format(SET, params);
            } else if (i < properties.length -1 ) {
                statement = format(SECONDSET, params);
            } else {
                statement = format(FINALSET, params);
            }
            setStatement += statement;
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

        params['varbinding'] = params['label'] + params['value'];

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

        // MERGE
        statement += buildMergeFromNode(nodeConfig, nodeData);
        statement += "\n";

        // SET
        statement += buildSetFromNode(nodeConfig, nodeData);

        // CREATE indexes
        // TODO add create index queries here

        statement += '\n';
        return statement;
    }

    /** buildRelationship
     *
     * @param relConfig
     * @param relData
     * @returns {*}
     */
    function buildRelationship(relConfig, relData) {

        var params = {};
        var from = relConfig.from.label + relData[relConfig.from.filekey],
            to = relConfig.to.label + relData[relConfig.to.filekey];
        params['from'] = from;
        params['to'] = to;
        params['relname'] = relConfig.name;

        return format(CREATEUNIQUERELATIONSHIP, params);
    }


    /**
     * CypherBuilder constructor
     * @class CypherBuilder
     * @param {Object=} parsedFilesData
     * @param {Object=} configData
     * @module CypherBuilder
     * @constructor
     */
    function CypherBuilder(parsedFilesData, configData) {
        this._parsedFilesData = parsedFilesData;
        this._configData = configData;
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