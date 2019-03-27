import React from 'react';
import api,{request,util} from '../../../components/common/common.js';
import { PullToRefresh, ListView, Card ,WhiteSpace,Flex,TextareaItem} from 'antd-mobile';
import {Button,Textarea } from 'bee-mobile';
import Mixins4Common from "../../common/mixins/common";
export default class v4index extends React.Component{
    constructor(){
        super();
        const $this = this;
        const {socketRequest} = window
        util.created({"this":$this,"page": {
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
                        this.chartBody = React.createRef();
                        return (
                            <div className='v-index-head'>
                                <div className='common-model'>

                                    <PullToRefresh
                                        damping={60}
                                        // ref={el => this.ptr = el}
                                        style={{
                                            height: this.state.height,
                                            overflow: 'auto',
                                        }}
                                        indicator={{ deactivate: '上拉可以刷新' }}
                                        direction='down'
                                        refreshing={this.state.refreshing}
                                        onRefresh={this.fun4refreshing.bind($this)}
                                    >

                                        {this.state.charts.map((curr,sindex)=>{
                                            // className={curr.status == 3 ? 'common-chart-card' : "common-chart-card-mine"
                                            return  curr.status == 3?

                                                <Flex align="start" ref={this.chartBody}   key={sindex} className="common-chart-card"  >
                                                    <img src={curr.user.reserved2} style={{height:20,width:20,    borderRadius:4}}></img>
                                                    <div style={{paddingLeft: 10}}>
                                                        <div className="common-chart-name">{curr.user.nickname+"     "+curr.time}</div>
                                                        <div className='common-chart-content'>
                                                            {curr.content}
                                                        </div>
                                                    </div>
                                                </Flex>:


                                                <Flex align="start" ref={this.chartBody}   key={sindex} className="common-chart-card-mine" >

                                                    <div style={{paddingLeft: 10,width:'calc(100% - 20px)',textAlign:"left"}}>
                                                        <div className="common-chart-name" style={{paddingRight: 10,textAlign:"right"}}>{curr.time+"     "+curr.user.nickname}</div>
                                                        <div className='common-chart-content'>
                                                            {curr.content}
                                                        </div>
                                                    </div>
                                                    <img src={curr.user.reserved2} style={{height:20,width:20,    borderRadius:4}}></img>
                                                </Flex>
                                        })}

                                    </PullToRefresh>

                                </div>
                            </div>
                        );

                    },
                    body(){

                        return (
                            <div className='common-model common-chart-send'>
                                <Flex align="start">
                                    <div style={{width: 'calc(100% - 60px)',height: '8vh'}}>
                                        <TextareaItem
                                            title=""
                                            value={this.state.formInline.content}
                                            autoHeight
                                            labelNumber={5}
                                            onChange={this.fun4change.bind(this, 'formInline.content')}
                                        />
                                        {/*<Textarea placeholder="请输入内容"  onChange={this.fun4change.bind(this, 'formInline.content')} />*/}
                                    </div>
                                    <Button theme="success" onClick={this.fun4send.bind(this)}>发送</Button>
                                </Flex>
                            </div>
                        );

                    }
                },
                mixins:[Mixins4Common],
                state:{
                    key:"",
                    uuid:"",
                    charts:[],
                    user:{},
                    defUser:{
                        nickname:"自己",
                        reserved2:"http://wx.qlogo.cn/mmhead/ver_1/hlme7rMUI9ExCXANB6I6ibpoWWMvBcqpjaT1fptNUczJ9ndh6Dj5QWOAM2dST1dMKBoWsicjZbHQSTOBNXibQqOrLkeQ9cNJp6lpH1MTlR5HNM/96"
                    },
                    formInline:{
                        content:''
                    },
                    height:"92vh",
                    refreshing:false,
                },
                created(){
                    console.log("-----createds")
                    const key =
                    $this.setState({uuid:util.getUrlParam()['wxid'],key:util.getUrlParam()['key']});
                    const defFun = async ()=>{
                        await new Promise(resolve => {
                            socketRequest("join",{roomId:util.getUrlParam()['key']},(data)=>{
                                console.log(data,123)
                                resolve();
                            })
                        });
                        let {defParam} = window;
                        defParam.roomID = $this.state.key;
                        $this.fun4start();

                    }
                    defFun();


                },
                methods:{

                    async fun4start(){
                        const {uuid} = $this.state;
                        console.log($this)
                        const users = await new Promise(resolve => {


                            const sql = "select a.nickname,a.username,b.reserved2 from rcontact a INNER JOIN img_flag b  on a.username=b.username where a.username='"+uuid+"'";
                            console.log(sql,"----asd")
                            socketRequest("execSQL",{db:"EnMicroMsg.db",sql:sql },data=>{
                                console.log("----99999")
                                resolve(data);
                            })
                        });

                        $this.setState({user:users[0]});
                        $this.fun4search();
                        window.socketMessage = (data)=>{
                            $this.fun4search();
                        }
                    },
                    async fun4search(){
                        const {user,defUser,uuid} = $this.state;
                        await new Promise(resolve => {  setTimeout(()=>{resolve()},300); })
                        const charts = await new Promise(resolve => {
                            const sql= "select a.content,a.status ,a.createTime from message a where talker='"+uuid+"' and (a.status=2 or a.status=3) order by a.msgId desc limit 10";
                            console.log(sql)
                            socketRequest("execSQL",{db:"EnMicroMsg.db",sql:sql },data=>{
                                resolve(data.map(curr=>{
                                    if(curr.status == 3) curr.user =  user;
                                    if(curr.status == 2) curr.user =  defUser;
                                    // curr.createTime =( new Date(parseInt(curr.createTime))).Format("yyyy-MM-dd hh:mm:ss")
                                    curr.time = (new Date(parseFloat(curr.createTime))).Format("MM-dd hh:mm:ss")
                                    return curr;
                                }).reverse());
                            })
                        });

                        $this.setState({charts:charts});
                        this.fun4scroll();

                    },
                    fun4send(){
                        const {uuid,formInline} = $this.state;
                        const param = {wxid:uuid,text:formInline.content}
                        socketRequest("sendMsg",param,data=>{
                            $this.setState({formInline:{content: ""}});
                            $this.fun4search();
                        })
                    },
                    fun4scroll(data){
                        const key = "div.am-pull-to-refresh",ele = document.querySelector(key);
                        console.log('----asd',ele)

                        ele.scrollTop = (ele.scrollHeight)
                    },
                    fun4refreshing(event){
                        console.log(event)
                    },
                }
            }});
    }

}
