const http = require('http');
const app = require('./app');
const port = process.env.PORT || 8000;

const server = http.createServer(app);
console.log("Server started at port " + port);
server.listen(port);