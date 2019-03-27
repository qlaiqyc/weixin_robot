export default {
    fun4change(key,value){
        const $this = this;

        //规定：只定义二级参数
        var keys = key.split(".");
        var param =  this.state[keys[0]];
        if(keys.length == 1) {
            $this.setState({[keys[0]]:value});
        }else if(keys.length == 2){
            param[keys[1]] = value;
        }else if(keys.length == 3){
            param[keys[1]][keys[2]] = value;
        }
        $this.setState({[keys[0]]: param});
    },
    fun4route(url,type){
        const $this = this;
        if(!String.HasText(type)){
            $this.props.history.push(url);
        }
    },
    fun4backBtn(){
        this.props.history.go(-1);
    }

}
