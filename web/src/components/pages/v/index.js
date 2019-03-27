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
                                <SearchBar/>
                            </div>
                        );

                    },
                    body(){

                        return (
                            <div className='common-model'>
                                <List>
                                    {
                                        this.state.users.map((curr, index) => (
                                            <ListItem key={index.toString()} onClick={()=>{$this.fun4route("/chart?key="+util.getUrlParam()['roomId']+"&wxid="+curr.username)}}>
                                                <Avatar src={curr.reserved2}   shape="circle"/>
                                                <ListItemText>  {curr.nickname}  </ListItemText>
                                                {curr.unReadCount >0 ?
                                                    <p>{curr.digest}<Badge count={curr.unReadCount} fixed={false}/></p>
                                                    :''
                                                }
                                            </ListItem>
                                        ))
                                    }
                                </List>


                                {/*<div className="common-user-tag">*/}
                                    {/*<FabButton reverse={true} icon={(<Icon icon="add"/>)} position="bottom-right">*/}
                                        {/*{*/}
                                            {/*this.state.clients.map((curr,index)=>{*/}
                                                {/*return <div key={index} onClick={$this.fun4client.bind($this,curr)}>{curr.name}</div>*/}
                                            {/*})*/}
                                        {/*}*/}

                                    {/*</FabButton>*/}
                                {/*</div>*/}
                            </div>
                        );

                    }
                },
                state:{
                    clients:[{name:"白",wxid:"wxid_e51sxv2f8j7822"},{name:"加",wxid:"wxid_e51sxv2f8j7822"},{name:"黑",wxid:"wxid_e51sxv2f8j7822"}],
                    users:[],
                    roomId:"",
                    key:""
                },
                created(){
                    //加入---连接房间
                    window.socketMessage = (data)=>{
                        $this.fun4client();
                    }
                    $this.fun4start()
                },
                mixins:[Mixins4Common],
                methods:{
                     fun4start(){
                        let id = util.getUrlParam()['roomId'];
                        let [roomId,key] = [id,id.split("-")[0]]
                        $this.setState({key:key});
                        const defFun = async ()=>{
                            await new Promise(resolve => {
                                socketRequest("join",{roomId:roomId},(data)=>{
                                    console.log(data)
                                    resolve();
                                })
                            });
                            let {defParam} = window;
                            defParam.roomID = roomId;
                            $this.fun4client()
                        }
                        defFun();
                    },
                    fun4client(){

                        const sql = "select a.nickname,a.username,b.reserved2,c.unReadCount,c.digest from rcontact a INNER JOIN img_flag b  on a.username=b.username left join rconversation c on c.username=a.username where a.username not like '%@app%' and a.verifyFlag=0 ";
                        socketRequest("execSQL",{db:"EnMicroMsg.db",sql:sql },data=>{
                            let id = util.getUrlParam()['roomId'],newList =[];
                            data.forEach(curr=>{
                                if(!id.startsWith(curr.username))newList.push(curr);
                            })

                            $this.setState({users:newList});
                            console.log($this)
                        })
                    },
                }
            }});
    }

}
