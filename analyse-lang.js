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

let readStats = co.wrap(function* () {
  let contents = yield fs.readFileAsync('results.csv', 'utf-8');
  let rows = contents
    .split('\n')
    .filter(str => str.match(/aws-coldstart-(\w+\w*)-dev-memory-(\d+\d*)/i))
    .map(str => {
      let parts = str.split(',');
      let funcName = parts[0];
      let matchRes = funcName.match(/aws-coldstart-(\w+\w*)-dev-memory-(\d+\d*)/i);

      let lang = matchRes[1];
      let memorySize = parseInt(matchRes[2]);

      return {
        function: parts[0],
        lang: lang,
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
    nodejs6: { y: [], x: [], type: "box", boxpoints: "all", name: "nodejs6" },
    golang: { y:[], x: [], type: "box", boxpoints: "all", name: "golang"}
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
  let byLangSize = _.groupBy(rows, r => `${r.lang}-${r.memorySize}MB`);

  let statsByLangSize = _.mapValues(
    byLangSize,
    rs => {
      let values = rs.map(r => r.value);
      let stats = new Stats();
      stats.push(values);

      return {
        lang: rs[0].lang,
        memorySize: rs[0].memorySize,
        stddev: math.std(values),
        mean: math.mean(values),
        median: math.median(values),
        '95%-tile': stats.percentile(95),
        '99%-tile': stats.percentile(99)
      };
    });

    console.log('lang,memory size,std dev,mean,median,95%-tile,99%-tile');
    for (let x of _.values(statsByLangSize)) {
      console.log(`${x.lang},${x.memorySize},${x.stddev},${x.mean},${x.median},${x['95%-tile']},${x['99%-tile']}`);
    }
});

boxPlot();
// calcStats();