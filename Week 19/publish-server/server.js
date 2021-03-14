let http = require("http");
let https = require("https");
let unzipper = require("unzipper");
let querystring = require('querystring');


// 2. auth：接收code   用code+client_id+client_secret换token
function auth(request, response) {
    let query = querystring.parse(request.url.match(/^\/auth\?([\s\S]+)$/)[1]);
    getToken(query.code, function (info) {
        console.log(info);
        response.write(`<a href='http://localhost:8083/?token=${info.access_token}'>publish</a>`)
        response.end();
    });
}

function getToken(code, callback) {
    const client_id = "Iv1.8394dc94ceafd7ce";
    const client_secret = "b4450219f647da4792419d499f2800ea53d03a8c";

    let request = https.request({
        hostname: "github.com",
        path: `/login/oauth/access_token?code=${code}&client_id=${client_id}&client_secret=${client_secret}`,
        port: 443,
        method: "POST"
    }, function (response) {
        let body = "";
        response.on('data', chunk => {
            body += (chunk.toString());
        })
        response.on('end', chunk => {
            callback(querystring.parse(body));
        })
    });
    request.end();
}

// 4. publish：用token获取用户信息，检查权限，接受发布
function publish(request, response) {
    let query = querystring.parse(request.url.match(/^\/publish\?([\s\S]+)$/)[1]);
    if (query.token.length > 0) {
        getUser(query.token, info => {
            if (info.login === "wbpmrck") {
                request.pipe(unzipper.Extract({ path: '../server/public/' }));
                request.on('end', function () {
                    response.end("success !");
                })  
            }
        });
    }
}

function getUser(token, callback) {

    let request = https.request({
        hostname: "api.github.com",
        path: `/user`,
        port: 443,
        method: "GET",
        headers: {
            Authorization: `token ${token}`,
            "User-Agent": 'toy-publish wbpmrck'
        }
    }, function (response) {
        let body = "";
        response.on('data', chunk => {
            body += (chunk.toString());
        })
        response.on('end', chunk => {
            callback(JSON.parse(body));
        })
        
    });
    request.end();
}

http.createServer(function (request, response) {

    if (request.url.match(/^\/auth\?/)) {
        return auth(request, response);
    }
    if (request.url.match(/^\/publish\?/)) {
        return publish(request, response);
    }
}).listen(8082);