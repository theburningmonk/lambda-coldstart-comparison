'use strict';

const Promise = require('bluebird');

module.exports.handler = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      msg: "hello"
    })
  };

  callback(null, response);
};