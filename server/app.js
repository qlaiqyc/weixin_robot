
class AppBootHook {

    constructor(app) {
        this.app = app;
    }

    async didLoad() {
        // 请将你的插件项目中 app.beforeStart 中的代码置于此处。
    }

    async willReady() {
        String.HasText = function(str) {
            try{

                if (typeof(str) == "undefined") return false;
                if (str == null) return false;
                if (str == 'null') return false;
                if (str == 'undefined') return false;

                if (typeof(str) == 'string')
                    str = str.replace(/(^\s*)|(\s*$)/g, '');
                if (str === '') return false;

            }catch(e){
                return false;
            }
            return true;
        };
        Date.prototype.Format = function (fmt) {
            let o = {
                'M+': this.getMonth() + 1, // 月份
                'd+': this.getDate(), // 日
                'h+': this.getHours(), // 小时
                'm+': this.getMinutes(), // 分
                's+': this.getSeconds(), // 秒
                'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
                'S': this.getMilliseconds() // 毫秒
            }
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
            for (let k in o) { if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))) }
            return fmt
        }

        String.hasEmoji =(substring)=>{
            for ( let i = 0; i < substring.length; i++) {
                let hs = substring.charCodeAt(i);
                if (0xd800 <= hs && hs <= 0xdbff) {
                    if (substring.length > 1) {
                        let ls = substring.charCodeAt(i + 1);
                        let uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000;
                        if (0x1d000 <= uc && uc <= 0x1f77f) {
                            return true;
                        }
                    }
                } else if (substring.length > 1) {
                    let ls = substring.charCodeAt(i + 1);
                    if (ls == 0x20e3) {
                        return true;
                    }
                } else {
                    if (0x2100 <= hs && hs <= 0x27ff) {
                        return true;
                    } else if (0x2B05 <= hs && hs <= 0x2b07) {
                        return true;
                    } else if (0x2934 <= hs && hs <= 0x2935) {
                        return true;
                    } else if (0x3297 <= hs && hs <= 0x3299) {
                        return true;
                    } else if (hs == 0xa9 || hs == 0xae || hs == 0x303d || hs == 0x3030
                        || hs == 0x2b55 || hs == 0x2b1c || hs == 0x2b1b
                        || hs == 0x2b50) {
                        return true;
                    }
                }
            }
        }
        await this.app.redis.del('rooms');
    }
}

module.exports = AppBootHook;
