# neo4j-csv-import-web


A web tool to make importing csv files into Neo4j super easy.

**NOTE: This is a prototype version meant to provide a basic level of functionality useful for gathering initial feedback.**

## Dependencies

`neo4j-csv-import-web` is a node.js web application, therefore node.js (and npm, the node package manager which is bundled with node) is required. Installation instructions are available [here](http://nodejs.org)

## Installation

1. `git clone git@github.com:neo-technology/neo4j-csv-import-web.git`
1. `cd neo4j-csv-import-web`
1. `npm install`
1. `npm start`
1. Open web browser at url `http://localhost:3000`

## Test

Unit tests are written using mocha.js and can be run with `npm test`.

## Overview

### Using the web based tool

## Development Overview

There are essentially two components to this project: a web application that provides a UI to allow the user select files for import and configure the data model and a small Javascript library that holds the logic for building Cypher import queries from the configuration object defined in the web application.
 
###Web application overview
 
 The main goal of the web application is to allow the user to select csv files for import, handle parsing of the csv files (this is currently done using the [PapaParse library](https://github.com/mholt/PapaParse), and guide the user through configuring the data model. The product of this process is two JavaScript objects: one of the content of the parsed files and one that defines the configured data model (how the parsed csv files are mapped to nodes and relationships). These two objects are passed to `CypherBuilder`, a small JavaScript library to create Cypher import scripts.
 
 Additionally, the web application includes functionality to connect to an existing Neo4j instance to execute the import queries or simply display the generated Cypher queries for the user.
 
###CypherBuilder.js
 
 This library provides a class `CypherBuilder` whose constructor takes two objects: `parsedFilesData` and `configData`. The library is designed such that it can be run in a node.js environment or in the client for an alternative architecture.
 
#### `parsedFilesData`
 
 This object contains data from the parsed csv files for import in the format returned by Papaparse. 
 
 * TODO: format / example from test
 
g#### `configData`
 
 This object contains the user-defined configuration / mappings for data import.
  
* TODO: format / example from test

## TODO

- [ ] basic web UI
- [ ] handle CSV parsing
- [ ] define data model config mappings
- [ ] create data model config from user guided web UI 
- [ ] functionality to validate data model config
- [ ] generate Cypher CREATE statements
- [ ] generate Cypher LOAD CSV statements
- [ ] connect to existing Neo4j instance