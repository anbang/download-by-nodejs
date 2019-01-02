let fs = require('fs');
let http = require("http");
let https =require('https');
const path = require('path');
const decompress = require('decompress');

let process, percent;
let req, flag = 0, globalRes, isStopDown = false;
let timer=null;

let url = 'http://nodejs.org/dist/v10.15.0/node-v10.15.0-win-x64.zip';
let url1 = 'http://www.canonchain.com/resource/file/canonchain/latest/builds/canonchain-windows-amd64-0.8.1.zip';//win
let url2 = 'http://www.canonchain.com/resource/file/canonchain/latest/builds/canonchain-0.8.1.tar.gz';//MAC
let url3= 'https://canonchain-public.oss-cn-hangzhou.aliyuncs.com/node/mac/canonchain-lastest.tar.gz';

let filePath = __dirname;
const zipFilePath = path.join(filePath, 'canonchain.zip')

function down() {
    console.log("Start")
    clearInterval(timer);
    timer = setInterval(() => {
        if (flag !== percent) {
            console.log("检测配置",percent)
            flag = percent;
        } else {
            //相同，有事情了；
            console.log("ERROR 出大事了,可能下载到99%卡住了,要回炉再造了！！！！！！！！！！！！！！！！！！！！！")
            req = null;
            isStopDown = true;
            clearInterval(timer);
            timer=null;
            // globalRes.emit('destroy');
            globalRes.emit('end');
            down();
        }
    }, 3000)

    req = http.get(url1, (res) => {
        let canonData = "";
        globalRes = res;
        res.setEncoding("binary");//binary
        const writeStream = fs.createWriteStream(zipFilePath, { encoding: 'binary' });//创建可写流
        let contentLength = parseInt(res.headers['content-length']);
        console.log("=========================================================")
        res.on("data", (chunk) => {
            canonData += chunk;
            writeStream.write(chunk)
            isStopDown = false;
            process = ((canonData.length) / contentLength) * 100;
            percent = parseInt(Math.floor(process).toFixed(0));
            //任务栏进度条
            console.log(`${percent}% => ${process.toFixed(3)}`);
            // globalRes.destroy();
        });
        res.on("end", () => {
            canonData = "";
            writeStream.end();
            console.log("+++++++++++++++++++++++++++++++End")
        });
        // res.on('destroy',()=>{
        //     console.log("download destroy",canonData.length)
        // })
        //结束后，解压
        writeStream.on('finish', () => {
            if (!isStopDown) {
                clearInterval(timer);
                timer=null;
                decompress(zipFilePath, filePath).then(files => console.log('decompress end [全部完成]'))
            }
        })
    });

    //Error
    req.on('error', (e) => {
        console.error('problem with request: ' + e.message);
    });
    req.end();
}
down();