import React from 'react';
import api,{request,util} from '../../../components/common/common.js';
import {Tabs, WhiteSpace,Badge ,List, TextareaItem,ImagePicker, WingBlank, SegmentedControl,Item,Flex,Tag,Button ,Toast,Picker,Modal,ListView,Radio,Checkbox } from 'antd-mobile';
import SearchInput, {createFilter} from 'react-search-input'
import  {Mixins4Common} from '../mixins/index.js';


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
                                title="添加评论"
                                footer={[{ text: '取消', onPress: ()=>{$this.setState({tagsModel:false})}},{ text: '确定', onPress: $this.fun4submit}]}
                            >
                                <TextareaItem title="内容：" rows="3" labelNumber={3} onChange={this.fun4change.bind(this, 'formInline.content')} />
                                <Flex  >
                                    <List renderHeader={() => '模拟用户'} className="my-list">
                                        <Flex>



                                            <Checkbox.CheckboxItem checked={this.state.checkType === 0} key={199} onChange={()=>this.setState({checkType: 0})}>
                                                虚拟PRO
                                            </Checkbox.CheckboxItem>
                                            <Checkbox.CheckboxItem checked={this.state.checkType === 1} key={200} onChange={()=>this.setState({checkType: 1})}>
                                                水军
                                            </Checkbox.CheckboxItem>

                                        </Flex>

                                        <List.Item>
                                            <SearchInput className="search-input-common" onChange={$this.fun4search.bind(this)} />
                                        </List.Item>


                                        <div className="plug-addComment-list">
                                            {this.state.searchList.map((curr,sindex) => {
                                                return(
                                                    <Radio.RadioItem key={curr.uuid} checked={this.state.checkIndex === sindex}   onChange={() =>{
                                                        this.setState({checkIndex: sindex});
                                                    }}>
                                                        {curr.name}
                                                    </Radio.RadioItem>
                                                )
                                            })}
                                        </div>





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
                    account_uuid:""
                },
                tagsModel:false,
                searchList:[],
                checkIndex:0,
                checkType:1,
                search: 0,
                path:true,
                type:0

            },
            created(){
            },
            watch(nextProps){
                const {propData,hideMine,type} = nextProps;
                const {search} = $this.state;
                if(propData.search <= search) return;

                console.log(nextProps)

                $this.setState({
                    formInline:{ uuid:propData.uuid,account_uuid:propData.account_uuid},
                    tagsModel:true,
                    search:propData.search,
                    data:propData.data,
                    path:hideMine
                })
                $this.fun4search("");
            },
            methods:{
                fun4submit(){
                    //checkParam

                    let {formInline,searchList,checkIndex,checkType,data} = $this.state;
                    let account_uuid,curr;
                    if(searchList.length == 0) { return;}
                    if(!String.HasText(formInline.content)) {util.toast.warn("请输入评论内容");return;}


                    curr = searchList[checkIndex];
                    account_uuid = curr.uuid;


                    request.postLoading("message/sys/add_manager",{ type: 1,  content: formInline.content, uuid: formInline.uuid,  account_uuid:account_uuid ,message_type:8 },result=>{
                        const isRight = (result > 0);
                        util.toast.request(isRight,"","");
                        if(isRight && "onSuccess" in $this.props){  $this.props.onSuccess(isRight,"addTags");   $this.setState({ tagsModel:false })  }
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
        }
        util.created({"this":$this,"page":Page});
    }

}
