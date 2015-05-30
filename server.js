import restify from 'restify';
import elastic from 'elasticsearch';

let client = new elastic.Client({
    host: 'localhost:9200',
    log: 'error'
})

function getResponse(cb, query) {
    client.ping({
        requestTimeout: Infinity,
        hello: 'elasticsarch!'
    }, function(error) {
        if (error) {
            console.error('ERROR!');
            cb('elasticsarch cluster is down!');
        } else {
            client.search({
                index: 'bolaget',
                body: query
            }, function(error, response){
                if(error){
                    console.log('error', error);
                    cb(error);
                }
                cb(response.hits);
            });
        }
    });
}

function respond(req, res, next) {
    console.time("make_search");
    getResponse(resp => {
        res.send(resp);
        next();
    }, req.body);
    console.timeEnd("make_search");
}

let server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false }));
server.post('/search', respond);
//server.head('/search', respond);

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});
