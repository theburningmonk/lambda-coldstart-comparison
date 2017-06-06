'use strict';

let isColdstart = false;

module.exports.handler = (event, context, callback) => {
  if (!isColdstart) {
    isColdstart = true;
    console.log("this is a coldstart");
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      msg: "hello"
    })
  };

  callback(null, response);
};