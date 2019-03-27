module.exports ={
    mysql:{
        // 单数据库信息配置
        client: {
            host     : '114.55.127.198',
            port: '13756',
            user     : 'newrank',
            password : 'Newrank123456',
            database: 'analysis'
        },
        // 是否加载到 app 上，默认开启
        app: true,
        // 是否加载到 agent 上，默认关闭
        agent: false,
    },
    redis: {
        client: {
            port: 6379,          // Redis port
            host: '192.168.0.228',   // Redis host
            password: 'cd123456',
            db: 0,
        },
    },
    cluster : {
        listen: {
            port: 3001,
        }
    }
}

