module.exports ={
    redis: {
        client: {
            port: 6379,          // Redis port
            host: '127.0.0.1',   // Redis host
            password: '',
            db: 0,
        },
    },
    cluster : {
        listen: {
            port: 3000,
        }
    },
    mysql:{
        // 单数据库信息配置
        client: {
            host     : '127.0.0.1',
            port: '3306',
            user     : 'root',
            password : 'root',
            database: 'nodeserver'
        },
        // 是否加载到 app 上，默认开启
        app: true,
        // 是否加载到 agent 上，默认关闭
        agent: false,
    },
}

