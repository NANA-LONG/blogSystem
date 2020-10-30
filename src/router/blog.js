const {getList,
    getDetail,
    newBlog,
    updateBlog,
    deleteBlog
} = require('../controller/blog');


const {SuccessModel,ErrorModel} = require('../model/resModel');

//登录验证
function loginCheck(req){
if(req.session.username==null){
    return Promise.resolve(
        new ErrorModel('尚未登录')
    )
}
}
const handleBlogRouter = (req,res) =>{
    const method = req.method;//GET POST
    let {id} = req.query;

    //获取博客列表
    if(method === 'GET' && req.path === '/api/blog/list'){
        let {author, keyword} = req.query;
        let result = getList(author, keyword);
        return result.then(listData =>{
            return new SuccessModel(listData);
        })  
        
    }

    //获取博客详情
    if(method === 'GET' && req.path === '/api/blog/detail'){
        let result= getDetail(id);
        return result.then(detailData =>{
            return new SuccessModel(detailData);
        });
        
    }

    //新增一篇博客
    if(method === 'POST' && req.path === '/api/blog/new'){  
        //登录验证
       let loginCheckResult = loginCheck(req)
       if(loginCheckResult){
           return loginCheckResult
       }
       req.body.author = req.session.username;//真数据
       const result = newBlog(req.body);
       return result.then(data =>{
            return new SuccessModel(data);
       })
       
    }

    //更新一篇博客
    if(method === 'POST' && req.path === '/api/blog/update'){
        function loginCheck(req){
            if(req.session.username==null){
                return Promise.resolve(
                    new ErrorModel('尚未登录')
                )
            }
            }
        const result = updateBlog(id,req.body);
        return result.then(val =>{
            if(val){
                return new SuccessModel();
            }else{
                return new ErrorModel('更新博客失败');
            }
        })
       
    }

    //删除一篇博客
    if(method === 'POST' && req.path === '/api/blog/del'){
        function loginCheck(req){
            if(req.session.username==null){
                return Promise.resolve(
                    new ErrorModel('尚未登录')
                )
            }
            }
        req.body.author = 'zhangsan';//假数据
        const result = deleteBlog(id,author);
        return result.then(val =>{
            if(val){
                return new SuccessModel();
            }else{
                return new ErrorModel('删除博客失败');
            }
        })
       
    }

}

module.exports = handleBlogRouter