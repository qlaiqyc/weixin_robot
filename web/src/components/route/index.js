import React from 'react';
import { BrowserRouter , Route  } from 'react-router-dom'
import api,{request,util} from '../../components/common/common.js';

import v4index   from "../pages/v/index.js";
import v4chart   from "../pages/v/chart.js";
import v4start   from "../pages/v/start.js";
class App extends React.Component {

    constructor(){
        super();
        util.created({"page":{
                htmUtil:{
                    layout(){
                        return (
                            <BrowserRouter>
                                <div>
                                    <Route exact path="/chart" component={v4chart}/>
                                    <Route exact path="/index" component={v4index}/>
                                    <Route exact path="/" component={v4start}/>
                                </div>
                            </BrowserRouter>
                        );
                    }
                },
                state:{

                },
                created(){

                },
                methods:{

                }
            },"this":this})
    }

}

export default (App);
