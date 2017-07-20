let fs = require('fs');
let request = require('request');
let page = '001';
let num = 1;
let weburl = 'web4.cartoonmad.com';
let pichash = 'c86eo736r62';// 图片库的id
let index = 1427;//漫画序号
let startindex = '001';// 开始页
let endindex = '260'; // 结束页
function imgDownload() {
    let url = `http://${weburl}/${pichash}/${index}/${startindex}/${page}.jpg`;
    let filepath = 'img/'+ num + '.jpg';
    console.log(`现在下载第${num}张图片,\n图片地址:${url},\n图片位置:${filepath}`);
    request(url,function (error, response, body) {
        if(response.statusCode === 404){
            startindex = parseInt(startindex);
            console.log(startindex);
            if(startindex<10){
                startindex = `00${startindex+1}`;
            }
            else if(startindex>=10 && startindex<100){
                startindex = `0${startindex+1}`;
            }
            else if(startindex>=100){
                startindex = `${startindex+1}`;
            }
            console.log(startindex);
            page = '000';
            num = num - 1;
        }
        if((startindex-1) == endindex){
            console.log('下载完毕');
            process.exit()
        }else {
            request(url).pipe(fs.createWriteStream(filepath));
            num ++;
            page ++;
            if(page>=10){
                page = `0${page ++}`;
            }
            else {
                page = `00${page ++}`;
            }
            imgDownload();
        }
        });
}
 imgDownload()