'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const http = require('superagent-promise')(require('superagent'), Promise);
const google = require('googleapis');

module.exports.handler = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      msg: "hello"
    })
  };

  callback(null, response);
};