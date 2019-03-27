'use strict';

const Controller = require('egg').Controller;

class ApiController extends Controller {
    async getAllRooms() {
        const { ctx, app } = this;
        const {redis,mysql} = app
        const {helper} = ctx
        const rooms =await redis.get('rooms')
        const allDrivice = mysql.s

        const results = await mysql.query("select * from "+helper.table.user+" where username=parent_wx");
        ctx.body =  {data:{rooms:JSON.parse(rooms),user:results}}
    }
}

module.exports = ApiController;
