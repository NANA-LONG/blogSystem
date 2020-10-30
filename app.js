const handleBlogRouter = require('./src/router/blog.js');
const handleUserRouter = require('./src/router/user.js');
const {get,set} = require('./src//db/redis')

const querystring = require('querystring');
// const SESSION_DATA = {
//     userid1: {username:'zhangsan',password:'123'},
//     userid2:{username:'lisi',password:'123'}
// }
const SESSION_DATA = {}

const getCookieExpires = () =>{
    const d = new Date()
    d.setTime(d.getTime() + 24*60*60*1000)
    // console.log('d.toGMTString() is',d.toGMTString())//格林威治
    return d.toGMTString()
}

//session数据
let serverHandle = (req,res) =>{
    //设置返回格式 JSON
    res.setHeader('Content-type','application/json');

    //获取path
    const url = req.url;
    req.path = url.split('?')[0];

    //解析query
    req.query = querystring.parse(url.split('?')[1]);

    //获取getPostData
    function getPostData (req){
        return new Promise((resolve,reject) =>{
            if(req.method !== 'POST'){
                resolve({})
                return
            }

            if(req.headers['content-type'] !== 'application/json'){
                resolve({})
                return
            }

            let postData = ''
            req.on('data',chunk =>{
                postData += chunk.toString()
            })
        
            req.on('end',() =>{
                if(!postData){
                    resolve({})
                    return
                }
                resolve(JSON.parse(postData))
            })
        })
    }

    //解析cookie
    req.cookie = { }
    const cookieStr = req.headers.cookie || '' //k1=v1;k2=v2;k3=v3
    cookieStr.split(';').forEach(item => {
        if(!item){
            return
        }
        const arr = item.split('=')
        const key = arr[0].trim()
        const val = arr[1].trim()
        console.log(key,val)
        req.cookie[key] = val  
    });
    // console.log('req.cookie is',req.cookie)

    
    //解析session
    // let needCookie = false
    // let userId = req.cookie.userid
    // if(userId){
    //     if(!SESSION_DATA[userId]){
    //         SESSION_DATA[userId] = {} 
    //     }
    // }else{
    //     needCookie = true
    //     userId = `${Date.now()}_${Math.random()}`
    //     //如何往SESSION_DATA里面赋值（初始化）
    //     SESSION_DATA[userId] = {}
    //     // console.log(SESSION_DATA)  // 1、 { '1589793208558_0.6501956056239968': {} }
    // }
    // req.session = SESSION_DATA[userId]

    // 解析redis中的数据，获取redis中的用户信息   req.session
    let needCookie = false
    let userId = req.cookie.userid
    if(!userId){
        needCookie = true
        userId = `${Date.now()}_${Math.random()}`
        set(userId,{})
    }
    req.sessionId = userId
    get(req.sessionId).then(sessionData =>{
        if(sessionData == null){
            set(req.sessionId,{})
            req.session = {}
        }
        req.session = sessionData
        return getPostData(req)
    })
    .then((postData) =>{
        req.body = postData;

         //1、处理blog路由
        const blogResult = handleBlogRouter(req,res);
        if(blogResult){
            blogResult.then(blogData =>{
                if(needCookie){
                    res.setHeader('Set-Cookie', `userid=${userId}; path=/;httpOnly;expires=${getCookieExpires()}}`)
                }
                res.end(
                    JSON.stringify(blogData)
                )
            })
            return
        }

        //2、处理user路由
        const userResult = handleUserRouter(req,res);
        if(userResult){
            userResult.then(userData =>{
                if(needCookie){
                    res.setHeader('Set-Cookie', `userid=${userId}; path=/;httpOnly;expires=${getCookieExpires()}}`)
                }
                res.end(
                    JSON.stringify(userData)
                )
            })
            return
        }
        //3、未命中路由，返回404错误
        res.writeHeader(404,{"Content-type":"text/plain"});
        res.end('404 Not Found');

    })
   

}


module.exports = serverHandle;