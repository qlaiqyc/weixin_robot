import React from 'react';
import api,{request,util} from '../../../components/common/common.js';
import {Tabs, WhiteSpace,Badge ,List, TextareaItem,ImagePicker, WingBlank, SegmentedControl,Item,Flex,Tag,Button ,Toast,Picker,Modal,ListView,Radio,Checkbox } from 'antd-mobile';



export default class mine4fielddetail extends React.Component{
    constructor(props){
        super(props);
        const $this = this;

        const Page = {
            htmUtil:{
                layout(){
                    return (
                        <div className="plug-addTags">
                            <Modal
                                visible={this.state.tagsModel}
                                transparent
                                maskClosable={false}
                                title="选择标签"
                                footer={[{ text: '取消', onPress: ()=>{$this.setState({tagsModel:false})}},{ text: '确定', onPress: $this.fun4submit}]}
                            >
                                <Flex wrap="wrap">
                                    {this.state.tags.map((curr ,index) => {
                                        if(index == this.state.tagsIndex){
                                            return <Tag style={{margin:5}} selected key={curr.uuid} onChange={()=>$this.setState({tagsIndex:index})}>{curr.title}</Tag>
                                        }else{
                                            return  <Tag style={{margin:5}}  key={curr.uuid} onChange={()=>$this.setState({tagsIndex:index})}>{curr.title}</Tag>
                                        }
                                    })}
                                </Flex>
                            </Modal>
                        </div>
                    );
                },

            },
            state:{

                formInline:{
                    field_uuid:"",

                },
                tagsModel:false,
                tags:[],
                tagsIndex:0,
                search:0,

            },
            created(){
            },
            watch(nextProps){
                const {propData} = nextProps;
                const {search} = $this.state;
                if(propData.search <= search) return;

                $this.setState({
                    formInline:{ field_uuid:propData.field_uuid, message_uuid:propData.message_uuid, type: 1,tag:"" },
                    tagsModel:true,
                    search:propData.search
                })
                $this.fun4run();



            },
            methods:{
                fun4run(){
                    if($this.state.tags.length > 0) return;
                    //请求接口获取数据（由于这个接口的数据 没有参数传递所以 只请求一次）
                    request.get("activity/field/sys",{},result=>{
                        let list = [], arr = ['推荐','日报','刷屏','专题']
                        result.fields.forEach(curr=>{
                            if(!arr.includes(curr.title)) list.push(curr);
                        })

                        $this.setState({tags:list})

                    })


                },
                fun4start(){

                },
                fun4tag(curr){


                },
                fun4submit(){
                    //checkParam
                    let {formInline ,tags,tagsIndex} = $this.state;
                    formInline.tag = tags[tagsIndex].title;
                    formInline.field_uuid = tags[tagsIndex].uuid;
                    request.postLoading("message/field/sys",formInline,result=>{
                        const isRight = (result == 1);
                        util.toast.request(isRight,"","");
                        if(isRight){
                            $this.props.onSuccess(isRight,"addTags");
                            $this.setState({ tagsModel:false })
                        }

                    })


                },

            }
        }
        util.created({"this":$this,"page":Page});
    }

}
