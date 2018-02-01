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
mongoose.connect('mongodb://localhost:27017');
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("db connected.")
});

const url = 'https://nj.fang.lianjia.com/loupan/';
let total = 0;

//模型
const loupan = mongoose.model('loupan',{
    src: String,
    name: String,
    discount: String,
    where: String,
    area: String,
    tags: [String],
    types: [String],
    price: String,
    href: String
});

io.on('connection', (socket) => {

    function getPageCount(){
        console.log('抓取总页数...' + url);
        return new Promise(function (resolve, reject) {
            superagent.get(url)
                .end(function (err, sres) {
                    if (err) {
                        console.log(err);
                        console.log(`抓取错误，正在重新抓取总页数...`);
                        getCount(1, total);
                        // return reject(err);
                    }
                    if(sres){
                        const $ = cheerio.load(sres.text);
                        total = JSON.parse($('.list-wrap .page-box').attr('page-data')).totalPage;
                        console.log('页数:' + total);
                        resolve(total);
                    }
                });
        });
    }

    function getPageInfo(page){
        const pageUrl = page===1?url:`${url}pg${page}`;
        console.log('抓取中...' + pageUrl);
        return new Promise(function (resolve, reject) {
            superagent.get(pageUrl)
                .end(function (err, sres) {
                    if (err) {
                        console.log(`抓取错误，正在从失败页(${page})继续...`);
                        getInfo(page, total);
                        // return reject(err);
                    }
                    if(sres){
                        const $ = cheerio.load(sres.text);
                        const items = [];
                        $('.house-lst .pic-panel a').each(function (index, element) {
                            let tagArr = [];
                            let typeArr = [];
                            const $element = $(element);
                            const $img = $($('.house-lst .pic-panel img')[index]);
                            const $info_1 = $($('.house-lst .info-panel .col-1')[index]);
                            const $info_2 = $($('.house-lst .info-panel .col-2')[index]);

                            $info_1.find('.other span').each(function (i, item) {
                                tagArr[i] = $(item).text().replace(/(\t)|(\n)|(\s+)/g,'');
                            });

                            $info_1.find('.type span').each(function (i, item) {
                                typeArr[i] = $(item).text().replace(/(\t)|(\n)|(\s+)/g,'');
                            });

                            const $eleInfo = {
                                src: $img.attr('data-original'),
                                name: $info_1.find('h2 a').text(),
                                discount: $info_1.find('h2 .redTag .text').text(),
                                where: $info_1.find('.where .region').text(),
                                area: $info_1.find('.area').text().replace(/(\t)|(\n)|(\s+)/g,''),
                                tags: tagArr,
                                types: typeArr,
                                price: $info_2.find('.price .average').text().replace(/(\t)|(\n)|(\s+)/g,''),
                                href: $element.attr('href').split('/')[2]
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

        console.log('=================== 抓取完成 ===================');
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

//设置跨域访问
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
