MERGE (Legislator136:Legislator {thomasID: 136})
SET Legislator136.firstName = "Sherrod",
 Legislator136.lastName = "Brown",
 Legislator136.body = "Senate",
 Legislator136.party = "democrat"
MERGE (Legislator172:Legislator {thomasID: 172})
SET Legislator172.firstName = "Maria",
 Legislator172.lastName = "Cantwell",
 Legislator172.body = "Senate",
 Legislator172.party = "democrat"
MERGE (Legislator174:Legislator {thomasID: 174})
SET Legislator174.firstName = "Benjamin",
 Legislator174.lastName = "Cardin",
 Legislator174.body = "Senate",
 Legislator174.party = "democrat"
MERGE (Legislator179:Legislator {thomasID: 179})
SET Legislator179.firstName = "Thomas",
 Legislator179.lastName = "Carper",
 Legislator179.body = "Senate",
 Legislator179.party = "democrat"
MERGE (Legislator1828:Legislator {thomasID: 1828})
SET Legislator1828.firstName = "Robert",
 Legislator1828.lastName = "Casey",
 Legislator1828.body = "Senate",
 Legislator1828.party = "democrat"
MERGE (CommitteeHSAG:Committee {thomasID: "HSAG"})
SET CommitteeHSAG.jurisdiction = "The House Committee on Agriculture has jurisdiction over federal agriculture policy and oversight of some federal agencies, and it can recommend funding appropriations for various governmental agencies, programs, and activities, as defined by House rules.",
 CommitteeHSAG.name = "House Committee on Agriculture",
 CommitteeHSAG.body = "house",
 CommitteeHSAG.url = "http://agriculture.house.gov/"
MERGE (CommitteeHSAP:Committee {thomasID: "HSAP"})
SET CommitteeHSAP.jurisdiction = "The House Committee on Appropriations is responsible for setting specific expenditures of money by the government of the United States. As such, it is one of the most powerful of the committees, and its members are seen as influential. The bills passed by the committee are called appropriations bills.",
 CommitteeHSAP.name = "House Committee on Appropriations",
 CommitteeHSAP.body = "house",
 CommitteeHSAP.url = "http://appropriations.house.gov/"
MERGE (CommitteeHSAS:Committee {thomasID: "HSAS"})
SET CommitteeHSAS.jurisdiction = "The House Committee on Armed Services has jurisdiction over defense policy generally, ongoing military operations, the organization and reform of the Department of Defense and Department of Energy, counter-drug programs, acquisition and industrial base policy, technology transfer and export controls, joint interoperability, the Cooperative Threat Reduction program, Department of Energy nonproliferation programs, and detainee affairs and policy.",
 CommitteeHSAS.name = "House Committee on Armed Services",
 CommitteeHSAS.body = "house",
 CommitteeHSAS.url = "http://armedservices.house.gov/"
CREATE UNIQUE (Legislator136)-[:SERVES_ON]->(CommitteeHSAG)
CREATE UNIQUE (Legislator172)-[:SERVES_ON]->(CommitteeHSAG)
CREATE UNIQUE (Legislator172)-[:SERVES_ON]->(CommitteeHSAP)
CREATE UNIQUE (Legislator179)-[:SERVES_ON]->(CommitteeHSAP)
CREATE UNIQUE (Legislator179)-[:SERVES_ON]->(CommitteeHSAS)
CREATE UNIQUE (Legislator1828)-[:SERVES_ON]->(CommitteeHSAS)
CREATE UNIQUE (Legislator136)-[:SERVES_ON]->(CommitteeHSAS)
