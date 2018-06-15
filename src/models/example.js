
export default {

  namespace: 'example',

  state: {},

  subscriptions: {
    setup({ dispatch, history }) {  // eslint-disable-line
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {  // eslint-disable-line
      yield put({ type: 'save' });
    },
	*help(payload,{call,put}){
		yield put({
			type:'save',
			payload:{
				id:1
			}
		})
	}
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },

};
