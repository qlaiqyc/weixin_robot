import superagent from 'superagent'
import {Toast} from 'antd-mobile';

export  default  {
    request(param){
        let token ="911023d6a76f4b41b441ca0092b016c6";// zs;localStorage.getItem("auth");
        token="a2685f4535f3426ebb0665763959dcee"//cs
        let execuFun = {
            success(res){
                //接口错误
                console.log("----")
                 param.success(res.body.data,res.header,res.body);
            },
            error(res){
                //服务器错误
                console.log(res.error,res.statusText)

            }
        };

        superagent[param.type](("/api/v1/")+param.url).set('Accept','application/json').set('Authorization',token).set('Content-Type','application/x-www-form-urlencoded').send(param.param).end(function(req,res){ if(res.statusCode == 200){ execuFun.success(res); }else{ execuFun.error(res); } })
    },
    urlParam(cdata){
        var result = [];
        for(var p in cdata) result.push(p+"="+cdata[p]);
        result =("?" +result.join("&"));
        return result;
    },
    delete(url,param,success,error) {

        url = url+this.urlParam(param);
        var cparam = {"type":"delete",url:url,param:param,success:success,error:error};

        this.request(cparam);

    },
    get(url,param,success,error) {

        url = url+this.urlParam(param);
        var cparam = {"type":"get",url:url,param:param,success:success,error:error};

        this.request(cparam);

    },
    post(url,param,showLoading,success,error) {
        var cparam = {"type":"post",url:url,param:param,showLoading:showLoading,success:success,error:error};

        this.request(cparam);

    },
    put(url,param,success,error) {
        var cparam = {"type":"put",url:url,param:param,success:success,error:error};


        this.request(cparam);
    },
    //===add Loading
    postLoading(url,param,success,error) {
        var cparam = {"type":"post",url:url,param:param,success:success,error:error};
         Toast.loading("努力,请求中", 1000);
         this.request(cparam);
    },
    deleteLoading(url,param,success,error) {
        Toast.loading("努力,请求中", 1000);

        url = url+this.urlParam(param);
        var cparam = {"type":"delete",url:url,param:param,success:success,error:error};
        this.request(cparam);
    },
    putLoading(url,param,success,error) {
        Toast.loading("努力,请求中", 1000);
        var cparam = {"type":"put",url:url,param:param,success:success,error:error};
        this.request(cparam);
    },
    getLoading(url,param,success,error) {
        Toast.loading("努力,请求中", 1000);
        url = url+this.urlParam(param);
        var cparam = {"type":"get",url:url,param:param,success:(a,b,c)=>{ success(a,b,c); Toast.hide(); },error:error};
        this.request(cparam);

    },
};
