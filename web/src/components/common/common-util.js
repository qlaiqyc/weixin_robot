import {  BrowserRouter as Router,  Route,Link } from 'react-router-dom'
import {Toast} from 'antd-mobile';

var PageObj = function(){
    return {
        global:{},//全局使用对象
        created(data){

           //变量作用域提升
           let Page  = data.page;
           let $this = data.this;

           for(let p in Page.methods)$this[p] = Page.methods[p];
           for(let p in Page.htmUtil)$this[p] = Page.htmUtil[p];

           if("mixins" in Page){
               Page.mixins.forEach(curr=>{
                   for(let p in curr)$this[p] = curr[p];
               })
           }

           $this.state = Page.state;

            // Object.defineProperties($this.state,"",{
            //     set(){
            //         console.log('--defin=--set---')
            //     },
            //     get(){
            //         console.log('--defin=--get---')
            //     },
            // })

           $this.render = ()=>{
               return $this.layout.call($this);
           }

           $this.componentWillMount = Page.beforeCreate;
           $this.componentWillUnmount = Page.destroyed;
           $this.componentWillReceiveProps = Page.watch;//组件prop 更新时执行
           $this.componentDidMount = Page.created;
       },
        router(data){
            var $this = data.this;
            var type = String.HasText(data.type) ? data.type : "push";
            var execuFun = {
                push(){
                    $this.props.history.push(data.url);
                },
                replace(){

                },
                go(){

                },
            };
            execuFun[type]();

        },
        toast:{
            request(type,messageSuccess,messageError){
                Toast.hide();
                let msgs = String.HasText(messageSuccess) ? messageSuccess:"尊敬的管理员，已成功";
                let msge = String.HasText(messageError) ? messageError:"尊敬的管理员，失败了，联系下开发人员";
                type?Toast.success(msgs, 1.5):Toast.success(msge, 1.5);
            },
            warn(message){
                Toast.info(message,1.5);
            },
            hide(){
                Toast.hide();
            }
        },
        outLink(data){
            let id4a = 'until-open-url-a',id4span = 'until-open-url-span',$url = document.querySelector('#' + id4a)

            if (data.url.indexOf('mp.weixin.qq') > -1) {
                if (data.url.indexOf('?') > 0) {
                    data.url = data.url + '&rd2werd=1#wechat_redirect'
                } else {
                    data.url = data.url + '?rd2werd=1#wechat_redirect'
                }
            }
            let ba = "";
            if (!String.HasText($url)) {
                ba = document.createElement('a')
                var bspan = document.createElement('span')

                ba.id = id4a
                ba.href = data.url
                bspan.id = id4span

                ba.appendChild(bspan)

                document.body.appendChild(ba)
            } else {
                ba = document.querySelector('#' + id4a)
                ba.target = '_self'
                ba.href = data.url
            }
            ba.click()

        },
        getUrlParam (url) {
            var url = url?url:window.location.href // 获取url中"?"符后的字串
            var theRequest = {}
            if (url.indexOf('?') != -1) {
                var str = url.split('?')[1]
                var strs = str.split('&')

                for (var i = 0; i < strs.length; i++) {
                    theRequest[strs[i].split('=')[0]] = (strs[i].split('=')[1])
                }
            }
            return theRequest
        },
        uploadFile(data){


            let $this = data.this

            let param = {}
            console.log(data)

            let accessid = ''
            let accesskey = ''
            let host = ''
            let policyBase64 = ''
            let signature = ''
            let callbackbody = ''
            let filename = ''
            let key = ''
            let expire = 0
            let g_object_name = ''
            let g_object_name_type = ''
            let timestamp = Date.parse(new Date()) / 1000
            let now = timestamp
            let imgW = ''
            let imgH = ''
            let plupload = window.plupload;
            let i,suffix,tmp_name;

            let result = ''// 返回值
            let globalFiles = [];


            function send_request () {
                var xmlhttp = null
                if (window.XMLHttpRequest) {
                    xmlhttp = new XMLHttpRequest()
                }
                Toast.loading("努力,上传中", 1000);
                if (xmlhttp != null) {
                    var serverUrl = '/api/v1/auth/auths/' + (data.type == 'pic' ? 'uploadSysImage' : 'uploadSysVideo')
                    xmlhttp.open('Post', serverUrl, false)
                    xmlhttp.setRequestHeader('Authorization', localStorage.getItem('auth'))
                    xmlhttp.send(null)
                    return xmlhttp.responseText
                } else {
                    alert('Your browser does not support XMLHTTP.')
                }
            };
            function get_signature () {
                // 可以判断当前expire是否超过了当前时间,如果超过了当前时间,就重新取一下.3s 做为缓冲
                now = timestamp = Date.parse(new Date()) / 1000
                if (expire < now + 3) {
                    var body = send_request()
                    console.log(body)

                    var obj = eval('(' + body + ')')
                    obj = obj.data
                    if (data.type == 'pic') {
                        result = obj.e + '/' + obj.d + '.jpg?uuid=' + obj.f + '&width=' + imgW + '&height=' + imgH
                    } else {
                        result = obj.e + '/' + obj.d + '.jpg?uuid=' + obj.f
                    }

                    // obj.e = "https://insight-dev.oss-cn-hangzhou.aliyuncs.com"
                    host = obj['e']
                    policyBase64 = obj['b']
                    accessid = obj['a']
                    signature = obj['c']
                    expire = parseInt(obj['f'])
                    callbackbody = obj['callback']
                    key = obj['d']

                    return true
                }
                return false
            };

            function random_string (len) {
                var len = len || 32
                var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
                var maxPos = chars.length
                var pwd = ''
                for (i = 0; i < len; i++) {
                    pwd += chars.charAt(Math.floor(Math.random() * maxPos))
                }
                return pwd
            }

            function get_suffix (filename) {
                var pos = filename.lastIndexOf('.')
                var suffix = ''
                if (pos != -1) {
                    suffix = filename.substring(pos)
                }
                return suffix
            }

            function calculate_object_name (filename) {
                if (g_object_name_type == 'local_name') {
                    g_object_name += '${filename}'
                } else if (g_object_name_type == 'random_name') {
                    suffix = get_suffix(filename)
                    g_object_name = key + random_string(10) + suffix
                }
                return ''
            }

            function get_uploaded_object_name (filename) {
                if (g_object_name_type == 'local_name') {
                    tmp_name = g_object_name
                    tmp_name = tmp_name.replace('${filename}', filename)
                    return tmp_name
                } else if (g_object_name_type == 'random_name') {
                    return g_object_name
                }
            }



            function set_upload_param (up, filename, ret) {
                if (ret == false) {
                    ret = get_signature()
                }

                var new_multipart_params = {
                    'key': key + '.jpg',
                    'policy': policyBase64,
                    'OSSAccessKeyId': accessid,
                    'success_action_status': '200',   // 让服务端返回200,不然，默认会返回204
                    'callback': '',
                    'signature': signature
                }

                up.setOption({
                    'url': host,
                    'multipart_params': new_multipart_params
                })

                up.start()
            }

            function upload_statck(curr){
                let reader = new FileReader()
                reader.readAsDataURL(curr.getNative())
                reader.onload = function (e) {
                    let image = new Image()
                    image.src = e.target.result
                    image.onload = function () {
                        console.log('-----------------------')
                        console.log(this.width, this.height)
                        imgW = this.width
                        imgH = this.height
                        set_upload_param(uploader, '', false)
                    }
                }

            }

            plupload.removeAllEvents()

            var uploader = new plupload.Uploader({
                runtimes: 'html5,flash,silverlight,html4',
                browse_button: data.id,
                // multi_selection: false,
                //  container: document.getElementById('container'),
                flash_swf_url: '/static/js/alyUpload/plupload-2.1.2/js/Moxie.swf',
                silverlight_xap_url: '/static/js/alyUpload/lib/plupload-2.1.2/js/Moxie.xap',
                url: 'https://oss-cn-hangzhou.aliyuncs.com',

                // filters: {
                //   mime_types: [ // 只允许上传图片和zip文件
                //     {
                //       title: 'Image files',
                //       extensions: 'jpg,gif,png,bmp'
                //     },
                //     {
                //       title: 'Zip files',
                //       extensions: 'zip,rar'
                //     },
                //     {
                //       title: 'video files',
                //       extensions: 'mpg,m4v,mp4,flv,3gp,mov,avi,rmvb,mkv,wmv'
                //     }],
                //   max_file_size: '100mb',  // 最大只能上传10mb的文件
                //   prevent_duplicates: true // 不允许选取重复文件
                // },

                init: {
                    PostInit: function () {

                    },

                    FilesAdded: function (up, files) {
                        console.log(up)
                        console.log(files)
                        // 只上传 同类型 否则 提示 错误
                        var isRitht = false
                        var execuFun = {
                            video () {
                                const types = 'mpg,m4v,mp4,flv,3gp,mov,avi,rmvb,mkv,wmv,ts'.split(',')
                                var tnum = 0
                                files.forEach(curr => { types.forEach(sitem => { if (curr.name.endsWith(sitem)) tnum++ }) })
                                if (files.length == tnum) {
                                    set_upload_param(uploader, '', false)
                                } else {
                                    Toast.info("仅支持mpg,m4v,mp4,flv,3gp,mov,avi,rmvb,mkv,wmv,ts",1.5);
                                }
                            },
                            pic () {
                                const types = 'jpg,gif,png,bmp,jpeg'.split(',')
                                var tnum = 0
                                files.forEach(curr => { types.forEach(sitem => { if (curr.name.endsWith(sitem)) tnum++ }) })

                                if(files.length > 1){
                                    Toast.info("仅支持单独传",1.5);
                                    return;
                                }
                                if (files.length == tnum) {
                                    var reader = new FileReader()
                                    reader.readAsDataURL(files[0].getNative())
                                    reader.onload = function (e) {
                                        var image = new Image()
                                        image.src = e.target.result
                                        image.onload = function () {
                                            console.log('-----------------------')
                                            console.log(this.width, this.height)
                                            imgW = this.width
                                            imgH = this.height
                                            set_upload_param(uploader, '', false)
                                        }
                                    }
                                } else {
                                    Toast.info("仅支持jpg,gif,png,bmp,jpeg",1.5);
                                }
                            }
                        }

                        execuFun[data.type]()
                    },

                    BeforeUpload: function (up, file) {
                       // set_upload_param(up, file.name, true)
                    },

                    UploadProgress: function (up, file) {

                    },

                    FileUploaded: function (up, file, info) {
                        console.log('=======info========', up, file, info)
                        console.log(result)
                        Toast.hide();

                        data.callback(result)
                    },

                    Error: function (up, err) {
                        Toast.info("上传失败",1.5);
                    }
                }
            })

            uploader.init()

            return uploader

        },
        async ioStart(){
            const {io}= window;
            const  $this = this;
            if(!String.HasText(io)){
                await new Promise(resolve => {setTimeout(()=>{resolve()},300)});
                $this.ioStart();
                return;
            }

            console.log(io)

            const url = "http://47.97.226.48:9000";
         //   const url = 'http://localhost:3000';
            let socket = io(url,{

                // 实际使用中可以在这里传递参数
                // query: {
                //     clientId: `client_web_${Math.random()}`,
                // },

                transports: ['websocket']
            });


            const baseRequest = (tag,key,data)=>{
                let {defParam} = window;
                if(!String.HasText(defParam)){
                    defParam= {roomID:"",client:"web"};
                    window.defParam = defParam;
                }

                socket.emit(tag, {
                    key:key,
                    room:defParam,
                    data:data
                });
            };

            const defFun = {

                getAllUser(data){
                },
                sendMsg(data){
                    //console.log(data)
                },
                sendFriends(data){
                    // console.log(data)
                },
                execSQL(data){
                    //   console.log(data)
                },
                join(data){
                    //   console.log(data)
                },
                message(data){

                    const {socketMessage} = window;
                    if(!String.HasText(socketMessage))return;
                    socketMessage(data)
                }
            };

            let copyFun = Object.assign({},defFun);

            const request = (key,data,success)=>{
                console.log(99)

                baseRequest('message',key,data);

                //发送请求，回调请求

                copyFun[key] =success;

                socket.on("message", result=>{

                    const { key, room,data } = result;
                    if(key in copyFun) copyFun[key](data);
                    //回调
                    copyFun = Object.assign({},defFun);
                });
            };
            const memory = {
                join:"join",
                getAllUser:"getAllUser",
                sendMsg:"sendMsg",
                sendFriends:"sendFriends",
            }

            await new Promise(resolve => {
                socket.on('connect', ()=> {
                    resolve();
                    const id = socket.id;

                    console.log('#connect,', id, socket);

                    socket.on('start', msg => {
                        console.log('#start,', msg);
                    });
                });
            })

            window.socket =socket;
            window.socketRequest =request;
        }
    }
};

export  default  PageObj();
