const {loginCheck} = require('../controller/user');
const {SuccessModel,ErrorModel} = require('../model/resModel');
const {get,set} = require('../db/redis')
//获取cookie的过期时间
const getCookieExpires = () =>{
    const d = new Date()
    console.log(d.toLocaleString())
    d.setTime(d.getTime() + 24*60*60*1000)
    console.log('d.toGMTString() is',d.toGMTString())//格林威治
    return d.toGMTString()
}

const handleUserRouter = (req,res) =>{
    const method = req.method;//GET POST
    //登录
    if(method === 'POST' && req.path === '/api/user/login'){
        const {username,password} = req.body;
        // const {username,password} = req.query;
        const result = loginCheck(username,password);
        return result.then(data =>{
            if(data.username){
                // console.log(data.username)
                //设置cookie
                // res.setHeader('Set-Cookie', `username=${data.username}; path=/;httpOnly;expires=${getCookieExpires()}}`)
                
                //设置session
                req.session.username = data.username 
                req.session.realname = data.realname

                //同步到redis中
                set(req.sessionId,req.session)

                return new SuccessModel()
            }
            return new ErrorModel('登录失败');
        })
        
    }

    //登录验证的测试
    if(method === 'GET' && req.path === '/api/user/login-test'){
        if(req.session.username){
            return Promise.resolve(
                new SuccessModel(req.session.username)
            )
        }
        if(req.session.username==null){
            return Promise.resolve(
                new ErrorModel('尚未登录')
            )
        }
        
    }

}
module.exports = handleUserRouter