'use strict';

const co      = require('co');
const AWS     = require('aws-sdk');
AWS.config.region = 'us-east-1';
const Lambda  = new AWS.Lambda();

let functions = [];

let listFunctions = co.wrap(function* () {
  // I know my account has < 100 functions, so...
  let resp = yield Lambda.listFunctions({ MaxItems: 100 }).promise();

  return resp.Functions
    .map(f => f.FunctionName)
    .filter(fn => fn.includes("coldstart") && !fn.endsWith("run"));
});

let run = co.wrap(function* () {
  if (functions.length == 0) {
    console.log("fetching relevant functions...");

    functions = yield listFunctions();
    console.log(`found ${functions.length} functions`);
    functions.forEach(console.log);
  }

  console.log("invoking $LATEST...");
  for (let func of functions) {
    yield Lambda.invoke({
      FunctionName: func,
      InvocationType: "Event"
    }).promise();
  }
});

run();