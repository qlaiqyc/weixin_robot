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
                        <div className="plug-addspecial">
                            <Modal
                                className="plug-addspecial-model"
                                visible={this.state.specialModel}
                                transparent
                                maskClosable={false}
                                title="选择标签"
                                footer={[{ text: '取消', onPress: ()=>{$this.setState({specialModel:false})}},{ text: '确定', onPress: $this.fun4submit}]}
                            >
                                <Flex>
                                    <Flex.Item>专题 </Flex.Item>
                                    <Flex.Item> 卡片</Flex.Item>
                                </Flex>

                                <Flex>
                                    <Flex.Item style={{height:300,overflow:"auto"}}>

                                        {this.state.special.map((curr ,index) => {
                                            if(curr.type ==0){
                                                if(index == this.state.specialIndex ){
                                                    return <Tag style={{margin:0}} selected key={curr.uuid} onChange={()=>$this.setState({specialIndex:index})}>{curr.title}</Tag>
                                                }else{
                                                    return  <Tag style={{margin:0}}  key={curr.uuid} onChange={()=>$this.setState({specialIndex:index})}>{curr.title}</Tag>
                                                }
                                            }
                                        })}

                                    </Flex.Item>
                                    <Flex.Item style={{height:300,overflow:"auto"}}>
                                        {this.state.special.map((curr ,index) => {
                                            if(curr.type == 1) {
                                                if(index == this.state.specialIndex){
                                                    return <Tag style={{margin:0}} selected key={curr.uuid} onChange={()=>$this.setState({specialIndex:index})}>{curr.title}</Tag>
                                                }else{
                                                    return  <Tag style={{margin:0}}  key={curr.uuid} onChange={()=>$this.setState({specialIndex:index})}>{curr.title}</Tag>
                                                }
                                            }

                                        })}
                                    </Flex.Item>
                                </Flex>


                            </Modal>
                        </div>
                    );
                },

            },
            state:{

                formInline:{
                    message_uuid:"",
                },
                specialModel:false,
                special:[],
                specialIndex:0,
                search:0

            },
            created(){
                $this.fun4run();
            },
            watch(nextProps){
                const {propData} = nextProps;
                const {search} = $this.state;
                if(propData.search <= search) return;


                $this.setState({
                    formInline:{  message_uuid:propData.message_uuid },
                    specialModel:true,
                    search:propData.search
                })
                $this.fun4run();
            },
            methods:{
                fun4run(){
                    if($this.state.special.length > 0) return;
                    //请求接口获取数据（由于这个接口的数据 没有参数传递所以 只请求一次）
                    request.get("message/sys/special/v2",{},result=>{
                        $this.setState({special:result})
                    })
                },

                fun4submit(){
                    //checkParam
                    let {formInline ,special,specialIndex} = $this.state;
                    const curr = special[specialIndex];

                    request.postLoading("message/sys/special/v2/"+curr.uuid+"/message/"+formInline.message_uuid+"/category",{category:""},result=>{
                        const isRight = (result == 1);
                        util.toast.request(isRight,"","");
                        if(isRight){
                            $this.props.onSuccess(isRight,"addspecial");
                            $this.setState({ specialModel:false })
                        }

                    })


                },

            }
        }
        util.created({"this":$this,"page":Page});
    }

}
