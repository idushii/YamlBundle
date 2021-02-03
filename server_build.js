// содежимое index.js
const http = require('http')
const port = 3000
const {exec, execSync} = require('child_process');

const  requestHandler = async (request, response) => {
    console.log(request.url)
    if (request.url === '/ping') {
        response.end('pong');
    } else if (request.url === '/prognoz') {
        console.log('/app1');
        try {
            const res2 = (await (execSync('node cli-prognoz.js')));
            console.log(String.fromCharCode.apply(null, res2));
            response.end(String.fromCharCode.apply(null, res2));
        } catch (e) {
            console.log(String.fromCharCode.apply(null, e.output[1]));
            response.end(String.fromCharCode.apply(null, e.output[1]));
        }
    } else {
        response.end('No command');
    }
}
const server = http.createServer(requestHandler)
server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})
