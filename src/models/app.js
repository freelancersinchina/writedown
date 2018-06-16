import axios from 'axios'
import request from '../utils/request'
import {uploadImages} from '../utils/utils'
import config from '../utils/config'
import NebPay from 'nebpay.js'
var nebulas = require("nebulas")

var nebPay = new NebPay()
var neb = new nebulas.Neb();
var Account = nebulas.Account

neb.setRequest(new nebulas.HttpRequest(config.contract.network))

export default {

  namespace: 'app',

  state: {
    uploadToken:"",
	showEditModal:false,
	items:[],
	showDetail:false,
	detail:{
		comments:[],
		images:[]
	},
	comment:'',
	page:0
  },

  subscriptions: {
    setup({ dispatch, history }) {  // eslint-disable-line
      request(config.apis.uploadToken)
      .then(data=>{
         dispatch({
          type:'updateState',
          payload:{
            uploadToken:data.data.uploadtoken
          }
        })
      })
	  dispatch({
		  type:"load",
		  payload:{
			  page:0
		  }
	  })
	  dispatch({
		  type:'updateState',
		  payload:{
			  page:1
		  }
	  })
    },
  },

  effects:{
	*load({payload},{call,put,select}){
		let {page} = payload
		
		let offset = config.note.countPerPage * page


		var from = Account.NewAccount().getAddressString();
		var value = "0";
		var nonce = "0"
		var gas_price = "1000000"
		var gas_limit = "2000000"

		var callFunction = "query";
		var callArgs = JSON.stringify([
			offset
			,
			config.note.countPerPage
		])

		var contract = {
			"function":callFunction,
			"args":callArgs
		}

		let resp = yield neb.api.call(from,config.contract.address,value,nonce,gas_price,gas_limit,contract)

		var result = JSON.parse(resp.result)

		let items = yield select(_=>_.app.items)

		yield put({
			type:'updateState',
			payload:{
				items:items.concat(result)
			}
		})


	},
    *upload({payload},{call,put,select}){
      let token = yield select(_=>_.app.uploadToken)
	  yield put({
		  type:'updateState',
		  payload:{
			  filename:payload.file.name
		  }
	  })
      let images = yield uploadImages({
                    images:[payload.file],
                    token,
                    compress:false
                  })

      yield put({
        type:'updateState',
        payload:{
          imageUrl:images[0]
        }
      })
    },
	*submit({payload},{call,put,select}){

		let {text,title,imageUrl} = yield select(_=>_.app)

		let address = config.contract.address
		let func = "save"

		nebPay.call(address,0,func,JSON.stringify([title,text,JSON.stringify(imageUrl?[imageUrl]:[])]),{
			debug:false
		})

		yield put({
			type:'updateState',
			payload:{
				showEditModal:false
			}
		})
		alert("你记录的事情将在十几秒之后出现在世记中")

	},
	*submitComment({},{call,put,select}){
		let comment = yield select(_=>_.app.comment)
		let detail = yield select(_=>_.app.detail)

		let address = config.contract.address
		let func = 'comment'
		nebPay.call(address,0,func,JSON.stringify([detail.key,comment]))

		alert("你的评论讲在十几秒之后出现在这里")


	},
	*loadMore({},{call,put,select}){
		let page = yield select(_=>_.app.page)
		yield put({
			type:'load',
			payload:{
				page:page
			}
		})
		yield put({
			type:'updateState',
			payload:{
				page:page+1
			}
		})
	}
  },

  reducers: {
    updateState(state, action) {

      return { ...state, ...action.payload };
    },
  },

};
