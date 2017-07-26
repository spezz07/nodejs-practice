let fs = require('fs');
let request = require('superagent-charset')(require('superagent'));
let cherrio = require('cheerio')
let num = 1;
let weburl = 'http://www.cartoonmad.com/comic/5827.html' // 漫画的地址
let pichash;// 图片库的id
let startindex = '001' // 开始话数
let endindex = '008' // 结束话数
let page = '001'; // 每一话的开始页码数，001即为从该话数的第一页进行下载
let comname
let url
var comcisdownurl
var pathname
let comnum = '5827'// 文件夹名字
let count = 0
function filedir (comnum) { // 检测是否存在本地文件夹
  return new Promise((resolve, reject)=>{
    fs.access( `${__dirname}\\img\\${comnum}`, function (err){
        if (err) {
          fs.mkdir( `${__dirname}\\img\\${comnum}`, function (err) {
            if (err) {
              console.log(err)
              reject()
            } else {
              console.log('----------------成功创建文件夹----------------')
                pathname = `${__dirname}\\img\\${comnum}`
                resolve(pathname)
            }
          })
        } else {
            pathname = `${__dirname}\\img\\${comnum}`
            console.log(`----------------文件夹已存在----------------\n----------------路径是:${pathname}----------------`)
            resolve()
        }
      }
    )
  })
  }
function imgurl(weburl) { // 获取漫画的真实下载地址
  return new Promise((resolve,reject)=>{
    request.get(weburl)
      .charset('big5')
      .end((err,data)=>{
        console.log(weburl)
        if(err){
          console.log('weburl error')
        }else {
          console.log(`----------------漫画的地址为:${weburl}----------------`)
          let $ = cherrio.load(data.text,{decodeEntities: false})
          comname = $('td[width="472"]').children().eq(5).text()
            console.log(`----------------漫画名字: ${comname}----------------`)
          url =  `http://www.cartoonmad.com/`+ $('a[target="_blank"]').eq(11).attr('href')
            console.log(`----------------正在获取漫画的下载地址----------------`)
            request.get(url)
                .charset('big5')
                .end((err,data)=>{
                        if(err){
                            console.log('获取漫画下载地址失败')
                        }else {
                            let $ = cherrio.load(data.text,{decodeEntities: false})
                            let temp = $('img[oncontextmenu="return false"]').attr('src')
                            comcisdownurl = String(temp.substr(0,(temp.length)-12))
                            resolve()
                        }
                    })}
      })
      }).catch((err)=>{console.log(err)})
}
function filedown (pathname,comcisdownurl) {  // 检测本地是否存在同名图片
  return new Promise((resolve,reject)=>{
    fs.access(`${pathname}\\${num}.jpg`, function (err) {
      if (err) {
          urlchange(comcisdownurl,startindex,endindex)
          resolve()
        } else {
        console.log(`----------------图片${num}已存在----------------`)
          num ++
          filedown(pathname,comcisdownurl)
      }
    })
  })
}
function urlchange(comcisdownurl,startindex,endindex) { // 根据状态码改变下载地址
  request.get(`${comcisdownurl}/${startindex}/${page}.jpg`)
    .end((err,data)=>{
      if(data.status === 404){
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
        page = '001';
        num = num - 1;
      }
      if((startindex-1) >= endindex){
          if(count === 0){
              console.log('下载完毕');
              process.exit()
          }

      }else {
          console.log(`----------------成功获取漫画的下载地址----------------\n----------------No.${num}图片下载地址为:---------------\n---------------${comcisdownurl}/${startindex}/${page}.jpg----------------`)
        console.log(`----------------正在下载No.${num}图片----------------`)
        request.get(`${comcisdownurl}/${startindex}/${page}.jpg`)
               .pipe(fs.createWriteStream(`${pathname}/${num}.jpg`))
               .on('finish',()=>{
                   count --
                   console.log(`----------------No.${num-1}图片下载完毕----------------`)
            })
        num ++;
        page ++;
        count ++
        if(page>=10){
          page = `0${page ++}`;
        } else {
          page = `00${page ++}`;
        }
        urlchange(comcisdownurl,startindex,endindex) // 递归一下
      }
    })
}
let getcomics = async function () { // 尝试使用es7的async进行异步处理（不过还是有点问题。。。）
    console.log("1")
    await filedir(comnum)
    console.log("2")
    await imgurl(weburl)
    console.log("3")
    await filedown(pathname,comcisdownurl)
    console.log("finish")

}
getcomics()

