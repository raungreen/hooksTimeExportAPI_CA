const axios = require('axios');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

let APIkey = process.env.APIkey;
let base64 = new Buffer(APIkey + ':xxx').toString('base64');

console.log(process.env);

app.get('/time_entries', function(req, res) {
  let query = req.query.queryStr;
  let url = `https://creativeanvil.teamwork.com?query=${query}`;

  axios({
    method: 'get',
    url,
    auth: {
      username: '' /*place API Key here*/,
      password: 'x'
    }
  })
    .then(function(response) {
      res.send(JSON.stringify(response.data));
    })
    .catch(function(error) {
      console.log(error);
    });
});

// launch our backend into a port
app.listen(port, () => console.log(`LISTENING ON PORT ${port}`));
// app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
