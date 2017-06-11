'use strict';

const _           = require('lodash');
const co          = require('co');
const Promise     = require('bluebird');
const AWS         = require('aws-sdk');
AWS.config.region = 'us-east-1';
const cloudwatch  = Promise.promisifyAll(new AWS.CloudWatch());
const Lambda      = new AWS.Lambda();

const START_TIME = new Date('2017-06-07T01:00:00.000Z');
const DAYS = 2;
const ONE_DAY = 24 * 60 * 60 * 1000;

let addDays = (startDt, n) => new Date(startDt.getTime() + ONE_DAY * n);

let getFuncStats = co.wrap(function* (funcName) {
  let getStats = co.wrap(function* (startTime, endTime) {
    let req = {
      MetricName: 'Duration',
      Namespace: 'AWS/Lambda',
      Period: 60,
      Dimensions: [ { Name: 'FunctionName', Value: funcName } ],
      Statistics: [ 'Maximum' ],
      Unit: 'Milliseconds',
      StartTime: startTime,
      EndTime: endTime
    };
    let resp = yield cloudwatch.getMetricStatisticsAsync(req);

    return resp.Datapoints.map(dp => { 
      return {
        timestamp: dp.Timestamp,
        value: dp.Maximum
      };
    });
  });

  let stats = [];
  for (let i = 0; i < DAYS; i++) {
    // CloudWatch only allows us to query 1440 data points per request, which 
    // at 1 min period is 24 hours
    let startTime = addDays(START_TIME, i);
    let endTime   = addDays(startTime, 1);
    let oneDayStats = yield getStats(startTime, endTime);

    stats = stats.concat(oneDayStats);
  }

  return _.sortBy(stats, s => s.timestamp);
});

let listFunctions = co.wrap(function* (marker, acc) {
  acc = acc || [];

  let resp = yield Lambda.listFunctions({ Marker: marker, MaxItems: 100 }).promise();

  let functions = resp.Functions
    .map(f => f.FunctionName)
    .filter(fn => fn.includes("coldstart") && !fn.endsWith("run"));

  acc = acc.concat(functions);

  if (resp.NextMarker) {
    return yield listFunctions(resp.NextMarker, acc);
  } else {
    return acc;
  }
});

listFunctions()
  .then(co.wrap(function* (funcs) {
    for (let func of funcs) {
      let stats = yield getFuncStats(func);
      stats.forEach(stat => console.log(`${func},${stat.timestamp},${stat.value}`));
    }
  }));