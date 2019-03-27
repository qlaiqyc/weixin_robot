module.exports = {
    memory:{
        url:"https://www.weseepro.com"//"https://www.jianshipro.cn"//
    },
    table : {
        user:"node_xposed_user",
        handle:"node_xposed_user_handle"
    },
    global:{
        get(key){
            return global[key];
        },
        set(key,value){
            global[key]= value
        }
    }
}
