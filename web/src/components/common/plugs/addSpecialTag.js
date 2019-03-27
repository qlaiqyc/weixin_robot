import React from 'react';
import api,{request,util} from '../../../components/common/common.js';
import {Tabs, WhiteSpace,Badge ,List, TextareaItem,ImagePicker, WingBlank, SegmentedControl,Item,Flex,Tag,Button ,Toast,Picker,Modal,ListView,Radio,Checkbox } from 'antd-mobile';
import SearchInput, {createFilter} from 'react-search-input'
import  {Mixins4Common} from '../mixins/index.js';


export default class mine4fielddetail extends React.Component{
    constructor(props){
        super(props);
        const $this = this;

        util.created({"page": {
                htmUtil:{
                    layout(){
                        return (
                            <div className="plug-addTags">
                                <Modal
                                    visible={this.state.tagsModel}
                                    transparent
                                    maskClosable={false}
                                    title="加入专题"
                                    footer={[{ text: '取消', onPress: ()=>{$this.setState({tagsModel:false})}},{ text: '确定', onPress: $this.fun4submit}]}
                                >
                                    <TextareaItem title="标签：" rows="4" labelNumber={3} onChange={this.fun4change.bind(this, 'formInline.content')} />

                                    <Flex  >

                                        <List renderHeader={() => '选择标签'} className="plug-addSpecialTag-list">
                                            {this.state.tags.map((curr,index)=>{

                                                if(index == this.state.specialIndex ){
                                                    return <div style={{margin:0}} className="plug-addSpecialTag-tag plug-addSpecialTag-tag-activity" key={curr.uuid} onClick={()=>$this.setState({specialIndex:index})}>{curr.title}</div>
                                                }else{
                                                    return  <div style={{margin:0}} className="plug-addSpecialTag-tag " key={curr.uuid} onClick={()=>$this.setState({specialIndex:index})}>{curr.title}</div>
                                                }
                                                // return (<List.Item key={curr.uuid}>{curr.title}</List.Item>)
                                            })}
                                        </List>
                                    </Flex>
                                </Modal>
                            </div>
                        );
                    },

                },
                mixins:[Mixins4Common],
                state:{

                    formInline:{
                        uuid:"",

                    },
                    tagsModel:false,
                    tags:[],
                    specialIndex:0,
                    search: 0

                },
                created(){
                },
                watch(nextProps){
                    const {propData} = nextProps;
                    const {search} = $this.state;
                    if(propData.search <= search) return;

                    $this.setState({
                        formInline:{ uuid:propData.uuid,  },
                        tagsModel:true,
                        search:propData.search
                    })

                    $this.fun4run();
                },
                methods:{
                    fun4run(){
                        let {tags} = $this.state;
                        if(tags.length > 0) return;
                        request.getLoading("message/sys/special/v2",{},result=>{
                            $this.setState({tags:result});
                        })
                    },
                    fun4submit(){
                        //checkParam
                        let {formInline,tags,specialIndex} = $this.state;

                        if(tags.length == 0) { return;}

                        if(!String.HasText(formInline.content)){
                            util.toast.warn("请输入 tag");
                            return;
                        }

                        let curr = tags[specialIndex];

                        request.putLoading("message/special/sys/message",{uuid:curr.uuid,message_uuid:formInline.uuid,link_type:1,type:1},result=>{
                            const isRight = (result > 0);
                            util.toast.request(isRight,"","");
                        });

                        request.postLoading("/message/sys/special/v2/"+curr.uuid+"/message/"+formInline.uuid+"/viewpoint",{ special_uuid: 1,  message_uuid:formInline.uuid, viewpoint: formInline.content },result=>{
                            const isRight = (result > 0);
                            util.toast.request(isRight,"","");
                            $this.setState({ tagsModel:false })
                        })


                    },
                    fun4search(keyword){
                        let {checkType} = $this.state;
                        let param = {type: 0, keyword:keyword, pageNumber: 1,pageSize: 5};
                        let url = checkType == 0 ? "account/accounts/searchForVirProComment" : "account/accounts/navy";
                        request.getLoading(url,param,result=>{
                            util.toast.hide();
                            $this.setState({searchList:result.accounts})
                        });
                    }
                }
            },"this":$this});
    }

}
