import React from 'react';
import api,{request,util} from '../../../components/common/common.js';
import {Button,Row,FabButton,Icon,Content,List,ListItem,ListItemText,Avatar,SearchBar,Badge } from 'bee-mobile';
import Mixins4Common from "../../common/mixins/common";

export default class v4index extends React.Component{
    constructor(){
        super();
        const $this = this;
        const {socketRequest} = window

        util.created({"this":$this,"page":{
                htmUtil:{
                    layout(){
                        return (
                            <div id="v-index">
                                {this.head()}
                                {this.body()}
                            </div>
                        );
                    },
                    head(){
                        return (
                            <div className='v-index-head'>
                            </div>
                        );

                    },
                    body(){

                        return (
                            <div className='common-model'>
                                <div className="start-item">

                                    {this.state.clients.map((curr,index)=>{

                                        return (
                                            <div key={curr.key+"-"+index} className="page-start-item">
                                                <Button theme="primary" block={true}> {curr.name}</Button>
                                                <div className="start-item-btn">
                                                {curr.list.map((obj,sindex)=>{
                                                    return (<Button onClick={$this.fun4index.bind($this,curr,obj)} key={index+"-"+sindex} theme="success">{obj.num+"/"+obj.maxNum}</Button>);
                                                })}
                                                </div>

                                            </div>
                                        )

                                    })
                                    }

                                </div>


                            </div>
                        );

                    }
                },
                state:{
                    clients:[],//[{name:"白",wxid:"wxid_e51sxv2f8j7822"},{name:"加",wxid:"wxid_e51sxv2f8j7822"},{name:"黑",wxid:"wxid_e51sxv2f8j7822"}],
                },
                created(){

                    const callback = async (result)=>{
                        //const result ={"rooms":{"android":["wxid_k4d0qbpd5c8r22","wxid_e51sxv2f8j7822"],"web":[],"wxid_k4d0qbpd5c8r22":[{"room":1,"num":1,"maxNum":2},{"room":2,"num":1,"maxNum":2},{"room":3,"num":1,"maxNum":2},{"room":4,"num":1,"maxNum":2},{"room":5,"num":1,"maxNum":2}],"wxid_e51sxv2f8j7822":[{"room":1,"num":1,"maxNum":2},{"room":2,"num":1,"maxNum":2},{"room":3,"num":1,"maxNum":2},{"room":4,"num":1,"maxNum":2},{"room":5,"num":1,"maxNum":2}]},"user":[{"id":1,"username":"wxid_e51sxv2f8j7822","nickname":"VIVO达人","alias":"vivoProSP","status":2,"head_image":null,"parent_wx":"wxid_e51sxv2f8j7822","addtime":"2019-03-21T08:19:12.000Z"},{"id":15,"username":"wxid_qqosm8piqggw22","nickname":"人格分发","alias":"iamxunipro","status":1,"head_image":"http://wx.qlogo.cn/mmhead/ver_1/vqwWVaUKvDdSTc5qSRP3JD3LqAObsOoYgk7Of4OqpudrYBicIOrV5q1bicH81z77uSsmEkR08TayzMKDNrbOkF3sFlbYonhogW8VQ6MqoRdWA/96","parent_wx":"wxid_qqosm8piqggw22","addtime":"2019-03-21T08:19:12.000Z"},{"id":30,"username":"wxid_k4d0qbpd5c8r22","nickname":"123bb49","alias":"a123bb49","status":2,"head_image":null,"parent_wx":"wxid_k4d0qbpd5c8r22","addtime":"2019-03-21T09:26:44.000Z"}]};
                        let map4user = {};
                        result.user.forEach(curr=>{ map4user[curr.username] = curr;  });

                        const volist =result.rooms.android.map(curr=>{
                            return {
                                key:curr,
                                list:[result.rooms[curr][0]],
                                name:map4user[curr].nickname
                            }
                        })
                        $this.setState({clients:volist});
                    };
                 //   callback();

                    //request.get("getAllRooms",{}, callback)

                    //this.fun4start();
                },
                mixins:[Mixins4Common],
                methods:{
                    fun4index(curr,obj){
                        const key = curr.key+"-"+obj.room;
                        if(obj.maxNum == obj.num){
                            return;
                        }
                        $this.fun4route("/index?roomId="+key)
                    }

                }
            }});
    }

}
