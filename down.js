let fs = require('fs');
let http = require("http");
const path = require('path');
const decompress = require('decompress');

let process, percent;
let req, flag = 0, globalRes, isStopDown = false;
let timer;

let url = 'http://nodejs.org/dist/v10.15.0/node-v10.15.0-win-x64.zip';
let url1 = 'http://www.canonchain.com/resource/file/canonchain/latest/builds/canonchain-windows-amd64-0.8.1.zip';//win
let url2 = 'http://www.canonchain.com/resource/file/canonchain/latest/builds/canonchain-0.8.1.tar.gz';//MAC
let filePath = 'C:/Users/Administrator/dmo/';
const zipFilePath = path.join(filePath, 'canonchain.zip')

function down() {
    console.log("Start")
    timer = setInterval(() => {
        if (flag !== percent) {
            console.log("检测配置")
            flag = percent;
        } else {
            //相同，有事情了；
            console.log("ERROR 出大事了,下载卡住了,要回炉再造了！！！！！！！！！！！！！！！！！！！！！")
            req = null;
            isStopDown = true;
            clearInterval(timer);
            globalRes.emit('end');
            down();
        }
    }, 3000)

    req = http.get(url2, (res) => {
        let canonData = "";
        globalRes = res;
        res.setEncoding("binary");//binary
        const writeStream = fs.createWriteStream(zipFilePath, { encoding: 'binary' });//创建可写流
        let contentLength = parseInt(res.headers['content-length']);
        console.log("=========================================================")
        res.on("data", (chunk) => {
            canonData += chunk;
            isStopDown = false;
            writeStream.write(chunk)
            process = ((canonData.length) / contentLength) * 100;
            percent = parseInt(Math.floor(process).toFixed(0));
            //任务栏进度条
            console.log(`${percent}%`);
        });
        res.on("end", () => {
            clearInterval(timer);
            canonData = "";
            writeStream.end();
            console.log("+++++++++++++++++++++++++++++++End")
        });
        //结束后，解压
        writeStream.on('finish', () => {
            if (!isStopDown) {
                decompress(zipFilePath, filePath).then(files => console.log('decompress end [全部完成]'))
            }

        })
    });

    //下载canonchain出错
    req.on('error', (e) => {
        console.error('problem with request: ' + e.message);
    });
    req.end();
}
down();