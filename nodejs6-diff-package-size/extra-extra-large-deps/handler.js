'use strict';

require('bluebird');
require('lodash');
require('superagent-promise')(require('superagent'), Promise);
require('googleapis');
require('aws-sdk');
require('co');
require('fb');
require('imagemagick');
require('mongodb');
require('request-promise');
require('neo4j');
require('sinon');
require('react');
require('react-dom');
require('underscore');
require('commander');
require('jquery');
require('express');

module.exports.handler = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      msg: "hello"
    })
  };

  callback(null, response);
};