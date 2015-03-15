/**
 * Created by mauricio on 3/14/15.
 */
var fs = require('fs');
var limit = process.argv[2];

var LIMIT = +limit;
function p() {
  return -LIMIT + Math.random() * 2 * LIMIT;
}

function genP() {
  return [p(), p(), p()];
}

var points = [];
for (var i = 0; i < +limit; i += 1) {
  points.push(genP());
}

fs.writeFile('./points' + limit + '.json', JSON.stringify(points), function (err) {
  if (err) {
    throw err;
  }
  console.log('saved!')
});
