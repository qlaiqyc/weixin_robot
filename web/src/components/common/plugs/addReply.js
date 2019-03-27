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
                                title="回复"
                                footer={[{ text: '取消', onPress: ()=>{$this.setState({tagsModel:false})}},{ text: '确定', onPress: $this.fun4submit}]}
                            >
                                <TextareaItem title="内容：" rows="3" labelNumber={3} onChange={this.fun4change.bind(this, 'formInline.content')} />
                                <Flex  >
                                    <List renderHeader={() => '模拟用户'} className="my-list">
                                        <Flex>

                                            {
                                                (this.state.path == 'true' && (this.state.data.type != 1)) ?
                                                    <Checkbox.CheckboxItem checked={this.state.checkType === 2} key={201} onChange={()=>this.setState({checkType: 2})}>  自己  </Checkbox.CheckboxItem>
                                                    :""
                                            }

                                            <Checkbox.CheckboxItem checked={this.state.checkType === 0} key={199} onChange={()=>this.setState({checkType: 0})}>
                                                虚拟PRO
                                            </Checkbox.CheckboxItem>
                                            <Checkbox.CheckboxItem checked={this.state.checkType === 1} key={200} onChange={()=>this.setState({checkType: 1})}>
                                                水军
                                            </Checkbox.CheckboxItem>

                                        </Flex>


                                        {

                                            this.state.checkType != 2 ?
                                                <List.Item>
                                                    <SearchInput className="search-input-common" onChange={$this.fun4search.bind(this)} />
                                                </List.Item>:""
                                        }


                                        {

                                            this.state.checkType != 2 ?
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
                                                </div>:""
                                        }





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

                    if(!String.HasText(formInline.content)) {util.toast.warn("请输入评论内容");return;}

                    let account_uuid,curr,newParam={};
                    if(checkType == 2){
                        account_uuid = data.account_uuid;
                        newParam = {
                            master_uuid:data.master_uuid,
                            activity_uuid:data.master_activity_uuid,
                            parent_uuid:data.account_uuid,
                            content:formInline.content,
                            account_uuid:data.master_account_uuid,
                            sync_type:0,
                            status:1,
                            comment_type:2
                        };

                    }else{
                        if(searchList.length == 0) { return;}
                        curr = searchList[checkIndex];
                        account_uuid = curr.uuid;
                        newParam = {
                            master_uuid:data.type == 1 ?data.uuid: data.master_uuid,
                            activity_uuid:data.master_activity_uuid,
                            parent_uuid:data.account_uuid,
                            account_uuid:curr.uuid,
                            content:formInline.content,
                            sync_type:0,
                            status:1,
                            comment_type:2
                        };
                    }

                    request.postLoading("message/messages/comment",newParam,result=>{
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
