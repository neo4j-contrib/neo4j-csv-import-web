var assert = require("assert"),
    CypherBuilder = require("../lib/buildCypher"),
    fs = require("fs");

// test data

var nodeData = {
    "bioguideID": "B0000944",
    "birthday": "1952-11-09",
    "cspanID": 5051,
    "fecIDs": "['H2OH13033', 'S6OH00163']",
    "firstName": "Sherrod",
    "gender": "M",
    "govtrackID": 400050,
    "icpsrID": 29389,
    "lastName": "Brown",
    "lisID": "S307",
    "opensecretsID": "N00003535",
    "party": "democrat",
    "religion": "Lutheran",
    "state": "OH",
    "thomasID": 136,
    "type": "Senate",
    "votesmartID": 27018,
    "washpostID": "gIQA3O2w9O",
    "wikipediaID": "Sherrod Brown"
};
var nodeConfig = {
    "filename": "legislators.csv",
    "labels": ["Legislator"],
    "guid": "a9ed5a7d23be56398490429a175017e2",
    "properties": [
        {
            "headerKey": "thomasID",
            "neoKey": "thomasID",
            "dataType": "int",
            "index": true,
            "primaryKey": true,
            "foreignKey": false,
            "skip": false
        },
        {
            "headerKey": "firstName",
            "neoKey": "firstName",
            "dataType": "string",
            "index": false,
            "primaryKey": false,
            "foreignKey": false,
            "skip": false
        },
        {
            "headerKey": "lastName",
            "neoKey": "lastName",
            "dataType": "string",
            "index": false,
            "primaryKey": false,
            "foreignKey": false,
            "skip": false
        },
        {
            "headerKey": "type",
            "neoKey": "body",
            "dataType": "string",
            "index": false,
            "primaryKey": false,
            "foreignKey": false,
            "skip": false
        },
        {
            "headerKey": "party",
            "neoKey": "party",
            "dataType": "string",
            "primaryKey": false,
            "foreignKey": false,
            "skip": false
        }
    ]
};
var legislatorCommitteesConfigData = {



    "nodes": [
        {
            "filename": "legislators.csv",
            "labels": ["Legislator"],
            "guid": "a9ed5a7d23be56398490429a175017f3",
            "properties": [
                {
                    "headerKey": "thomasID",
                    "neoKey": "thomasID",
                    "dataType": "int",          // ls datatypes
                    "index": true,
                    "primaryKey": true,
                    "foreignKey": false,
                    "skip": false
                },
                {
                    "headerKey": "firstName",
                    "neoKey": "firstName",
                    "dataType": "string",
                    "index": false,
                    "primaryKey": false,
                    "foreignKey": false,
                    "skip": false
                },
                {
                    "headerKey": "lastName",
                    "neoKey": "lastName",
                    "dataType": "string",
                    "index": false,
                    "primaryKey": false,
                    "foreignKey": false,
                    "skip": false
                },
                {
                    "headerKey": "type",
                    "neoKey": "body",
                    "dataType": "string",
                    "index": false,
                    "primaryKey": false,
                    "foreignKey": false,
                    "skip": false
                },
                {
                    "headerKey": "party",
                    "neoKey": "party",
                    "dataType": "string",
                    "primaryKey": false,
                    "foreignKey": false,
                    "skip": false
                }
            ]
        },
        {
            "filename": "committees.csv",
            "labels": ["Committee"],
            "guid": "a9ed5a7d23be56398490429a175017g4",
            "properties": [
                {
                    "headerKey": "thomasID",
                    "neoKey": "thomasID",
                    "dataType": "string",
                    "index": true,
                    "primaryKey": true,
                    "foreignKey": false,
                    "skip": false
                },
                {
                    "headerKey": "jurisdiction",
                    "neoKey": "jurisdiction",
                    "dataType": "string",
                    "index": false,
                    "primaryKey": false,
                    "foreignKey": false,
                    "skip": false
                },
                {
                    "headerKey": "name",
                    "neoKey": "name",
                    "dataType": "string",
                    "index": false,
                    "primaryKey": false,
                    "foreignKey": false,
                    "skip": false
                },
                {
                    "headerKey": "type",
                    "neoKey": "body",
                    "dataType": "string",
                    "index": false,
                    "primaryKey": false,
                    "foreignKey": false,
                    "skip": false
                },
                {
                    "headerKey": "url",
                    "neoKey": "url",
                    "dataType": "string",
                    "index": false,
                    "primaryKey": false,
                    "foreignKey": false,
                    "skip": false
                }
            ]
        }
    ],
    "relationships": [
        {
            "filename": "committee-members.csv",
            "guid": "a9ed5a7d23be56398490429a175017h5",
            "from": {
                "filename": "legislators.csv",
                "neoKey": "thomasID",
                "fileKey": "legislatorID",
                "label": "Legislator"
            },
            "to": {
                "filename": "committees.csv",
                "neoKey": "thomasID",
                "fileKey": "committeeID",
                "label": "Committee"
            },
            "name": "SERVES_ON",
            "properties": [
                {
                    "headerKey": "committeID",
                    "neoKey": "committeeID",
                    "dataType": "string",
                    "skip": true
                },
                {
                    "headerKey": "legislatorID",
                    "neoKey": "legislatorID",
                    "dataType": "string",
                    "skip": true
                },
                {
                    "headerKey": "rank",
                    "neoKey": "rank",
                    "dataType": "integer",
                    "skip": false
                }
            ]
        }
    ]

};

var legislatorCommitteesFilesData = {
    "legislators.csv": {
        "data": [
            {
                "bioguideID": "B0000944",
                "birthday": "1952-11-09",
                "cspanID": 5051,
                "fecIDs": "['H2OH13033', 'S6OH00163']",
                "firstName": "Sherrod",
                "gender": "M",
                "govtrackID": 400050,
                "icpsrID": 29389,
                "lastName": "Brown",
                "lisID": "S307",
                "opensecretsID": "N00003535",
                "party": "democrat",
                "religion": "Lutheran",
                "state": "OH",
                "thomasID": 136,
                "type": "Senate",
                "votesmartID": 27018,
                "washpostID": "gIQA3O2w9O",
                "wikipediaID": "Sherrod Brown"
            },
            {
                "bioguideID": "C000127",
                "birthday": "1958-10-13",
                "cspanID": 26137,
                "fecIDs": "['S8WA00194', 'H2WA01054']",
                "firstName": "Maria",
                "gender": "F",
                "govtrackID": 300018,
                "icpsrID": 39310,
                "lastName": "Cantwell",
                "lisID": "S275",
                "opensecretsID": "N00007836",
                "party": "democrat",
                "religion": "Roman Catholic",
                "state": "WA",
                "thomasID": 172,
                "type": "Senate",
                "votesmartID": 27122,
                "washpostID": "gIQAZxKkDP",
                "wikipediaID": "Maria Cantwell"
            },
            {
                "bioguideID": "C000141",
                "birthday": "1943-10-05",
                "cspanID": 4004,
                "fecIDs": "['H6MD03177', 'S6MD03177']",
                "firstName": "Benjamin",
                "gender": "M",
                "govtrackID": 400064,
                "icpsrID": 15408,
                "lastName": "Cardin",
                "lisID": "S308",
                "opensecretsID": "N00001955",
                "party": "democrat",
                "religion": "Jewish",
                "state": "MD",
                "thomasID": 174,
                "type": "Senate",
                "votesmartID": 26888,
                "washpostID": "gIQAGMu99O",
                "wikipediaID": "Ben Cardin"
            },
            {
                "bioguideID": "C000174",
                "birthday": "1947-01-23",
                "cspanID": 663,
                "fecIDs": "['S8DE00079']",
                "firstName": "Thomas",
                "gender": "M",
                "govtrackID": 300019,
                "icpsrID": 15015,
                "lastName": "Carper",
                "lisID": "S277",
                "opensecretsID": "N00012508",
                "party": "democrat",
                "religion": "Presbyterian",
                "state": "DE",
                "thomasID": 179,
                "type": "Senate",
                "votesmartID": 22421,
                "washpostID": "gIQA3bm69O",
                "wikipediaID": "Tom Carper"
            },
            {
                "bioguideID": "C001070",
                "birthday": "1960-04-13",
                "cspanID": 47036,
                "fecIDs": "['S6PA00217']",
                "firstName": "Robert",
                "gender": "M",
                "govtrackID": 412246,
                "icpsrID": 40703,
                "lastName": "Casey",
                "lisID": "S309",
                "opensecretsID": "N00027503",
                "party": "democrat",
                "religion": "",
                "state": "PA",
                "thomasID": 1828,
                "type": "Senate",
                "votesmartID": 2541,
                "washpostID": "gIQABeor9O",
                "wikipediaID": "Bob Casey, Jr."
            }

        ],
        "errors": [],
        "meta": {
            "aborted": false,
            "cursor": 1100,
            "delimiter": ",",
            "fields": [
                "bioguideID",
                "birthday",
                "cspanID",
                "fecIDs",
                "firstname",
                "gender",
                "govtrackID",
                "icpsrID",
                "lastName",
                "lisID",
                "opensecretsID",
                "party",
                "religion",
                "state",
                "thomasID",
                "type",
                "votesmartID",
                "washpostID",
                "wikipediaID"
            ],
            "linkbreak": "\n",
            "truncated": true
        }
    },
    "committees.csv": {
        "data": [
            {
                "jurisdiction": "The House Committee on Agriculture has jurisdiction over federal agriculture policy and oversight of some federal agencies, and it can recommend funding appropriations for various governmental agencies, programs, and activities, as defined by House rules.",
                "name": "House Committee on Agriculture",
                "thomasID": "HSAG",
                "type": "house",
                "url": "http://agriculture.house.gov/"
            },
            {
                "jurisdiction": "The House Committee on Appropriations is responsible for setting specific expenditures of money by the government of the United States. As such, it is one of the most powerful of the committees, and its members are seen as influential. The bills passed by the committee are called appropriations bills.",
                "name": "House Committee on Appropriations",
                "thomasID": "HSAP",
                "type": "house",
                "url": "http://appropriations.house.gov/"

            },
            {
                "jurisdiction": "The House Committee on Armed Services has jurisdiction over defense policy generally, ongoing military operations, the organization and reform of the Department of Defense and Department of Energy, counter-drug programs, acquisition and industrial base policy, technology transfer and export controls, joint interoperability, the Cooperative Threat Reduction program, Department of Energy nonproliferation programs, and detainee affairs and policy.",
                "name": "House Committee on Armed Services",
                "thomasID": "HSAS",
                "type": "house",
                "url": "http://armedservices.house.gov/"

            }
        ],
        "errors": [],
        "meta": {
            "aborted": false,
            "cursor": 1100,
            "delimiter": ",",
            "fields": [
                "type",
                "name",
                "url",
                "thomasID",
                "jurisdiction"
            ],
            "linkbreak": "\n",
            "truncated": true
        }
    },
    "committee-members.csv": {
        "data": [
            {
                "committeeID": "HSAG",
                "legislatorID": 136,
                "rank": 1
            },
            {
                "committeeID": "HSAG",
                "legislatorID": 172,
                "rank": 2
            },
            {
                "committeeID": "HSAP",
                "legislatorID": 172,
                "rank": 3
            },
            {
                "committeeID": "HSAP",
                "legislatorID": 179,
                "rank": 2
            },
            {
                "committeeID": "HSAS",
                "legislatorID": 179,
                "rank": 2
            },
            {
                "committeeID": "HSAS",
                "legislatorID": 1828,
                "rank": 1
            },
            {
                "committeeID": "HSAS",
                "legislatorID": 136,
                "rank": 2
            }
        ],
        "errors": [],
        "meta": {
            "aborted": false,
            "cursor": 1100,
            "delimiter": ",",
            "fields": [
                "committeeID",
                "legislatorID",
                "rank"
            ],
            "linkbreak": "\n",
            "truncated": true
        }
    }
};

var loadLegislatorsCypher = fs.readFileSync('test/resources/loadLegislators.cql', 'utf8');

describe('CypherBuilder', function() {


    describe('#ValidateConfig', function () {
        it('test data should pass configuration validation', function () {
            var legislatorBuilder = new CypherBuilder(legislatorCommitteesFilesData, legislatorCommitteesConfigData);
            assert(legislatorBuilder.validateConfig());
        });
    });

    describe('#BuildCypher', function () {
        it('Cypher statements should be valid', function () {
            var legislatorBuilder = new CypherBuilder(legislatorCommitteesFilesData, legislatorCommitteesConfigData);
            var cypher = legislatorBuilder.buildCypher();
           // console.log(cypher);
            // FIXME: assert based on what? length of string?
            assert.equal(cypher, loadLegislatorsCypher);
        });
    });
});

describe('buildNode', function() {
    describe('#buildNode', function () {
        it('build MERGE statement for a single node from config data', function () {

            // test internal node builder
            var b = new CypherBuilder({}, {});
            assert.equal(b.buildNode(nodeConfig, nodeData),"MERGE (x:Legislator {thomasID: 136})")
        })
    });

});


describe('buildCSV', function() {
    describe("#buildCSVCypher", function() {
        it('generate LOAD CSV statements', function() {
            var legislatorBuilder = new CypherBuilder(legislatorCommitteesFilesData, legislatorCommitteesConfigData);
            assert.equal(loadLegislatorsCypher, legislatorBuilder.buildCSVCypher());
        })
    })
})