import React, { Component } from 'react';
import logo from './logo.svg';
import Route from './components/route/index';
import './App.css';
import 'antd-mobile/dist/antd-mobile.css'
import api,{request,util} from './components/common/common.js';
import Mixins4Common from "./components/common/mixins/common";


String.HasText = function(str) {
    try{

        if (typeof(str) == "undefined") return false;
        if (str == null) return false;
        if (str == 'null') return false;
        if (str == 'undefined') return false;

        if (typeof(str) == 'string')
            str = str.replace(/(^\s*)|(\s*$)/g, '');
        if (str === '') return false;

    }catch(e){
        return false;
    }
    return true;
};
Date.prototype.Format = function (fmt) {
    var o = {
        'M+': this.getMonth() + 1, // 月份
        'd+': this.getDate(), // 日
        'h+': this.getHours(), // 小时
        'm+': this.getMinutes(), // 分
        's+': this.getSeconds(), // 秒
        'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
        'S': this.getMilliseconds() // 毫秒
    }
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
    for (var k in o) { if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))) }
    return fmt
}
class App extends Component {

    constructor(){
        super();
        const $this = this;

        util.created({"this":$this,"page":{
                htmUtil:{
                    layout(){
                        return (
                            <div className="App">
                                {this.state.isStart ? <Route></Route> : ''}
                            </div>
                        );
                    },

                },
                state:{
                    isStart:false
                },
                created(){

                    const defFun = async()=>{
                        await  util.ioStart();
                        $this.setState({isStart:true});
                    }
                    defFun();
                }

            }});
    }
}

export default App;
