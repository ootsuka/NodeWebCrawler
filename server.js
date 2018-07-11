const express = require('express');
const cheerio = require('cheerio');
const superagent = require('superagent');
const app = express();

//socket.io
let server = require('http').Server(app);
let io = require('socket.io')(server);

//middleware
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

io.on('connection', function(socket){
  console.log('a user connected');
});

server.listen(8080, function () {
    console.log('listening on port 8080');
});

//mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/loupan');
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("db connected.")
});

const url = 'https://cd.fang.lianjia.com/loupan/';
let total = 0;

//模型
const loupan = mongoose.model('loupan',{
    src: String,
    name: String,
    where: String,
    area: String,
    tags: [String],
    type: String,
    status: String,
    price: String,
    href: String
});

io.on('connection', (socket) => {

    function getPageCount(){
        console.log('crawling total page...' + url);
        return new Promise(function (resolve, reject) {
            superagent.get(url)
                .end(function (err, sres) {
                    if (err) {
                        console.log(err);
                        console.log(`error, continue crawling total page...`);
                        getCount(1, total);
                        // return reject(err);
                    }
                    if(sres){
                        const $ = cheerio.load(sres.text);
                        total = Math.floor(JSON.parse($('.page-box').attr('data-total-count')) / 10);
                        console.log('page:' + total);
                        resolve(total);
                    }
                });
        });
    }

    function getPageInfo(page){
        const pageUrl = page===1?url:`${url}pg${page}`;
        console.log('crawling...' + pageUrl);
        return new Promise(function (resolve, reject) {
            superagent.get(pageUrl)
                .end(function (err, sres) {
                    if (err) {
                        console.log(`error，continue crawling from (${page})...`);
                        getInfo(page, total);
                        // return reject(err);
                    }
                    if(sres){
                        const $ = cheerio.load(sres.text);
                        const items = [];
                        $('.resblock-list').each(function (index, element) {
                            let tagArr = [];
                            let typeArr = [];
                            const $element = $(element);
                            const name = $element.find('.resblock-name a').text();
                            const imageSrc = $element.find('.resblock-img-wrapper img').attr('data-original');
                            const location = $element.find('.resblock-location a').text();
                            const area = $element.find('.resblock-location :nth-child(3)').text();
                            $element.find('.resblock-tag span').each(function (i, item) {
                              tagArr[i] = $(item).text().replace(/(\t)|(\n)|(\s+)/g,'');
                            });
                            const type = $element.find('.resblock-type').text();
                            const status = $element.find('.sale-status').text();
                            const price = $element.find('.main-price :first-child').text();
                            const href = $element.find('.resblock-name a').attr('href');
                            console.log(href);
                            const $eleInfo = {
                                src: imageSrc,
                                name: name,
                                where: location,
                                area: area,
                                tags: tagArr,
                                type: type,
                                status: status,
                                price: price,
                                href: href
                            };

                            loupan.create($eleInfo, function (err) {
                                if(err) console.log(err);
                            });
                            items.push($eleInfo);
                        });
                        resolve(items);
                    }
                });
        })
    }

    async function getCount() {
        socket.emit('progress', { page: `crawling total...` });
        await getPageCount();
        socket.emit('progress', { page: `total page crawled：${total}！` });
        getInfo(1, total);
    }

    async function getInfo(start, total) {
        for(let i = start;i <= total;i++){
            socket.emit('progress', { progress: `crawling ${i} page...` });
            const pageInfo = await getPageInfo(i);
            console.log(pageInfo);
            socket.emit('progress', { progress: `finished crawling ${i}page！` });
        }

        console.log('=================== finished ===================');
        socket.emit('progress', { progress: 'finished' });
    }

    socket.on('request', function (request) {
        console.log(request);
        loupan.remove({},function (err) {
            if(err) console.log(err);
        });
        getCount();
    });
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/show/', function (req, res) {
  loupan.find({})
      .exec((err, result) => {
        if (err) console.log(err);
        else {
          res.send(JSON.stringify(result));
        }
      });
});

//设置跨域访问
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
