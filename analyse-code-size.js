// set this to your plot.ly account
const username = process.env.USERNAME;
const api_key  = process.env.API_KEY;

const _       = require('lodash');
const co      = require('co');
const Promise = require('bluebird');
const plotly  = require('plotly')(username, api_key);
const fs      = Promise.promisifyAll(require("fs"));
const math    = require('mathjs');
const Stats   = require('fast-stats').Stats;

const CodeSizes = {
  'no-deps': 366,                         // 366 bytes
  'bluebird-only': 185 * 1024,            // 185KB
  'bluebird-lodash-only': 895.8 * 1024,   // 895.8KB
  'large-deps': 5.5 * 1024 * 1024,        // 5.5MB
  'extra-large-deps': 14.3 * 1024 * 1024  // 14.3MB
};

let readStats = co.wrap(function* () {
  let contents = yield fs.readFileAsync('results.csv', 'utf-8');
  let rows = contents
    .split('\n')
    .filter(str => str.match(/aws-coldstart-nodejs6-package-size-dev-(.*)-(\d+\d*)/i))
    .map(str => {
      let parts = str.split(',');
      let funcName = parts[0];
      let matchRes = funcName.match(/aws-coldstart-nodejs6-package-size-dev-(.*)-(\d+\d*)/i);

      let group = matchRes[1];
      let memorySize = parseInt(matchRes[2]);

      return {
        function: parts[0],
        codeSize: CodeSizes[group],
        memorySize: memorySize,
        value: parts[2]
      };
    });

  return rows;
});

let boxPlot = co.wrap(function*() {
  let rows = _.sortBy(yield readStats(), r => r.memorySize);

  let byLang = {
    csharp: { y: [], x: [], type: "box", boxpoints: "all", name: "csharp" },
    java:   { y: [], x: [], type: "box", boxpoints: "all", name: "java" },
    python: { y: [], x: [], type: "box", boxpoints: "all", name: "python" },
    nodejs6: { y: [], x: [], type: "box", boxpoints: "all", name: "nodejs6" }
  }

  rows.forEach(row => {  
    byLang[row.lang].y.push(row.value);
    byLang[row.lang].x.push(`${row.memorySize}MB`);
  });

  let data = _.values(byLang);
  let layout = {
    yaxis: {
      title: "cold start (milliseconds)",
      zeroline: false
    },
    xaxis: {
      title: "memory size"
    },
    boxmode: "group"
  };

  let graphOptions = { filename: "cold-start-by-language", fileopt: "overwrite" };
  plotly.plot(data, graphOptions, function (err, msg) {    
    let childProc = require('child_process');
    console.log(msg);

    childProc.exec(`open -a "Google Chrome" ${msg.url}`);
  });
  
});

let calcStats = co.wrap(function*() {
  let rows = yield readStats();
  let byCodeSize = _.groupBy(rows, r => `${r.codeSize}-${r.memorySize}MB`);
  
  let statsByCodeSize = _.mapValues(
    byCodeSize, 
    rs => {
      let values = rs.map(r => r.value);
      let stats = new Stats();
      stats.push(values);

      return {
        codeSize: rs[0].codeSize,
        memorySize: rs[0].memorySize,
        stddev: math.std(values),
        mean: math.mean(values),
        median: math.median(values),
        '95%-tile': stats.percentile(95),
        '99%-tile': stats.percentile(99)
      };
    });

    console.log('codesize (bytes),memory size,std dev,mean,median,95%-tile,99%-tile');
    for (let x of _.values(statsByCodeSize)) {
      console.log(`${x.codeSize},${x.memorySize},${x.stddev},${x.mean},${x.median},${x['95%-tile']},${x['99%-tile']}`);
    }
});

// boxPlot();
calcStats();