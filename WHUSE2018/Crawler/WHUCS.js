const cheerio = require('cheerio');
const superagent = require('superagent');
var defaultSegment = require('../Segment/mySegment').defaultSegment;
var monk = require('monk');
var db = monk('localhost:27017/WHUCS');
var ALLInfo = db.get('CSInfo');
var CSURL = [
			'cs.whu.edu.cn/a/xueshujiangzuofabu/list_39_1.html',
			'cs.whu.edu.cn/a/xinwendongtaifabu/list_37_1.html',
			'cs.whu.edu.cn/plus/list.php?tid=44',
			'cs.whu.edu.cn/a/xinxigongkaifabu/list_38_1.html'
			];



function entrance()
{
//	superagent.get(url2).end(function (err, res) {
//		console.log(res);
//		if (err) throw err;
//		processFirPart(res);
//	}
//);
    var minDate;
    ALLInfo.findOne({}, { sort: { date: -1 } }, function (err, docs) {
        if (docs)
            minDate = docs.date;
        else
            minDate = '1970';
    });
	for (i = 0; i < CSURL.length; ++i) {
		superagent.get(CSURL[i]).end(function (err, res) {
			if (err) throw err;
			processCSHTML(res,minDate);
		}
		);
    }

}


function processCSHTML(res,minDate) {
    let $ = cheerio.load(res.text);
    let data = [];
    $('#container dl dd').each(function(i, element) {
        let _this = $(element);
        var _date = _this.find('i').text();
        var _title = _this.find('a').text();
        if (_date > minDate) {
            data.push({
                title: _title,
                href: 'cs.whu.edu.cn' + _this.find('a').attr('href'),
                date:_date,
                faculty: 'CS',
                tags: defaultSegment(_title)
            });
        }
    });
    ALLInfo.createIndex({tags:1});
    ALLInfo.insert(data);
}

function display() {
 
    ALLInfo.findOne({}, { sort: {date : -1}}, function (err, doc) {// date descend
        console.log(doc);

    });

}

entrance();
display();