const {exec} = require('../db/mysql');

//博客列表
const getList = (author, keyword) =>{
   let sql = `select * from blogs where 1=1 `
   if(author) {
       sql += `and author = '${author}' `
   }
   if(keyword) {
       sql += `and title like '%${keyword}%' `
   }
    sql += `order by createtime desc `
    return exec(sql);
}

//博客详情
const getDetail = (id) =>{
    let sql = `select * from blogs where id = '${id}' `;
    return exec(sql).then(rows =>{
        return rows[0];
    });
   
}

//新建博客
const newBlog = (blogData = {}) =>{
    //blogData是一个博客对象，包含title content author属性
    const {title,content,author} = blogData;
    const createtime = Date.now();

    const sql = `insert into blogs (title,content,createtime,author)
                values ('${title}','${content}',${createtime},'${author}') `

    return exec(sql).then(insertData => {
        console.log('insertData is', insertData);
        return {
            id: insertData.insertId
        }
    })
}

//更新博客
const updateBlog = (id,blogData = {}) =>{
    //id 就是更新博客的id
    //blogData就是一个博客对象，包含title content属性

    const {title,content} = blogData;

    const sql = `update blogs set title = '${title}' , content = '${content}' where id = ${id} `
    
    return exec(sql).then(updateDate =>{
        console.log('updateDate is ',updateDate);
        if(updateDate.affectedRows >0 ){
            return true;
        }
        return false;
    })
}

//删除博客
const deleteBlog = (id,author) =>{
    //id就是要删除博客的id
    const sql = `delete from blogs where id = '${id}' and author = '${author}' `
    return exec(sql).then(delDate =>{
        console.log('delDate id',delDate);
        if(delDate.affectedRows >0 ){
            return true;
        }
        return false;
    })
}

module.exports = {
    getList,
    getDetail,
    newBlog,
    updateBlog,
    deleteBlog
}