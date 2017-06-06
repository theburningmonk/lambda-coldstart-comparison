'use strict';

const Promise = require('bluebird');
const _ = require('lodash');

module.exports.handler = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      msg: "hello"
    })
  };

  callback(null, response);
};