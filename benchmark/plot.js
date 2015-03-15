/**
 * Created by mauricio on 3/14/15.
 */
// plot
var plotly = require('plotly')("maurizzzio", "qe0ece0g1u");
var data = [{
  x:[0,1,2],
  y:[3,2,1],
  type: 'scatter'
}];
var layout = {
  fileopt : "overwrite",
  filename : "quickhull"
};
plotly.plot(data, layout, function (err, msg) {
  if (err) return console.log(err);
  console.log(msg);
});
