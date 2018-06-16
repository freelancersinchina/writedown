import React from 'react';
import { connect } from 'dva';
import styles from './IndexPage.less';
import { Timeline } from 'antd';
import { Card,Button,Modal } from 'antd';
import  Logo  from "../assets/logo.png"
const { Meta } = Card;


class IndexPage extends React.Component {

  state={
    width:0,
    height:0,
    showDetail:false,
  }

  handleShowDetail(){
    this.setState({
      showDetail:true
    })
  }

  handleShowDetailClose(){
    this.setState({
      showDetail:false
    })
  }

  render(){

	let items = this.props.items

	let self = this

    let editBox = (
      <div className={styles.editBox}>
        <div className={styles.title}>
          <input type='text' onChange={(e)=>this.props.changeTitle(e.target.value)}/>
        </div>
        <div className={styles.textarea}>
          <textarea onChange={e=>this.props.changeText(e.target.value)}/>
        </div>
        <div className={styles.imageUpload}>
          <div className={styles.uploadBtn}>
            <Button>上传图片</Button>
            <input type='file' onChange={(e)=>this.props.uploadImage(e.target.files[0])}/>
          </div>
          <div className={styles.fileName}>
			{this.props.filename}
            
          </div>
        </div>
       
      </div>
    )

    let editModal = (
      <Modal
        title="记录今天发生的事情"
        visible={this.props.showEditModal}
        footer={
          (
            <div className={styles.submit}>
              <Button onClick={this.props.close}>Cancel</Button>
              <Button type="primary" onClick={this.props.submit}>Ok</Button>
            </div>
          )
        }
		onCancel={this.props.close}
		onOk={this.props.submit}
        >
        {editBox}
      </Modal>
    )

    let commentBox = (
      <div className={styles.commentBox}>
        <div className={styles.input}><textarea onChange={e=>self.props.changeComment(e.target.value)}/></div>
        <div className={styles.submit}>
          <Button type="primary" onClick={self.props.submitComment}>Submit</Button>
        </div>
      </div>
    )

	let detail = this.props.detail

	let comments = []

	let comment 
	for(let i=0;i<detail.comments.length;i++){
		comments.push(
			<div className={styles.comment}>
				<div className={styles.level}>#{i+1}</div>
				<div className={styles.body}>
					<div className={styles.meta}>
						来自 {detail.comments[i].author}
					</div>
                    <pre className={styles.content}>
						{detail.comments[i].text}
                    </pre>
				</div>
			</div>
				)
	}

    let detailModal = (
      <Modal 
            title={detail.title}
            visible={self.props.showDetailModal}
            onOk={this.handleShowDetail.bind(this)}
            onCancel={self.props.closeDetail}
            footer={commentBox}
          >
          <div className={styles.detail}>
            <div className={styles.content}>{detail.text}</div>
            <div className={styles.images}>
              <img src={detail.images[0]}/>
            </div>
            <div className={styles.comments}>
              <div className={styles.title}>
                评论
              </div>
              <div className={styles.list}>
				{comments}
              </div>
            </div>
          </div>

      </Modal>
    )

	// group items
	let days = {}
	
	for(let i=0;i<items.length;i++){
		let item = items[i]
		let year = (new Date(item.time)).getFullYear()
		let month = (new Date(item.time)).getMonth()+1
		let day = (new Date(item.time)).getDate()

		if(days[[year,month,day].join('-')]){
			days[[year,month,day].join('-')].push(item)
		}
		else{
			days[[year,month,day].join('-')] = [item];
		}

	}

	let timeline = []
	let events = []

	for(var key in days){
		
		for(let j=0;j<days[key].length;j++){
			events.push(
				<div className={styles.item} onClick={()=>self.props.showDetail(days[key][j])} key={key+'-'+j}>
					<div className={styles.cover}
						style={{backgroundImage:`url(${days[key][j].images[0]})`}}></div>
					<div className={styles.content}>
						{days[key][j].title}
					</div>
				</div>)
		}
		timeline.push(
			<Timeline.Item key={key}>
				<div className={styles.list}>
					<div className={styles.meta}>
						{key}
					</div>
					{events}
				</div>
			</Timeline.Item>

		)
		

	}


    return (
      <div className={styles.page}>
        <div className={styles.cover} style={{width:this.state.width,height:this.state.height}} >
          <div className={styles.logo}>
            <img src={Logo}/>
          </div>
          <div className={styles.menus}>
            <a href="https://explorer.nebulas.io/#/address/n1m9pFy8oTZmt61s59uqaMHYCuW7RhNnwxu" target="_blank">合约</a>
            <a href="https://github.com/freelancersinchina/writedown" target="_blank">源码</a>
          </div>
          <h1>世记</h1>
          一起记录世界上正在发生的事情
        </div>
        <div className={styles.body}>
          {detailModal}
          {editModal}
          <div className={styles.filters}>
          </div>
          <div className={styles.timeline}>

          <Timeline>
            <Timeline.Item>
              <div className={styles.list}>
                <Button onClick={this.props.edit}>今天世界上发生了什么？记录一下</Button>
              </div>
            </Timeline.Item>
			{timeline}
            <Timeline.Item>
              <div className={styles.list}>
                <Button loading={self.props.loading.effects['app/loadMore']==true?true:false} onClick={self.props.load}>点击加载更多</Button>
              </div>
            </Timeline.Item>
          </Timeline>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount(){
    let width = document.body.clientWidth;
    let height = document.body.clientHeight;

    let offset = document.body.scrollLeft

    this.setState({
      width:width-offset,
      height
    })

    window.addEventListener("resize",this.handleResize.bind(this))

    
  }

  componentWillUnmount(){
    window.removeEventListener("resize",this.handleResize.bind(this))
  }

  handleResize(){
    let width = document.body.clientWidth;
    let height = document.body.clientHeight;

    let offset = document.body.scrollLeft

    this.setState({
      width:width-offset,
      height
    })
  }
  
}



IndexPage.propTypes = {
  
};
const mapStateToProps = state=>({
	filename:state.app.filename,
	showEditModal:state.app.showEditModal,
	items:state.app.items,
	detail:state.app.detail,
	showDetailModal:state.app.showDetail,
	loading:state.loading

})
const mapDispatchToProps = dispatch=>({
  uploadImage:(file)=>dispatch({
    type:"app/upload",
    payload:{
      file
    }
  }),
	close:()=>dispatch({
		type:"app/updateState",
		payload:{
			showEditModal:false
		}
	}),
	edit:()=>dispatch({
		type:"app/updateState",
		payload:{
			showEditModal:true,
			title:"",
			text:"",
			imageUrls:[]

		}
	}),
	changeTitle:(v)=>dispatch({
		type:"app/updateState",
		payload:{
			title:v
		}
	}),
	changeText:(v)=>dispatch({
		type:"app/updateState",
		payload:{
			text:v
		}
	}),
	submit:()=>dispatch({
		type:'app/submit'
	}),
	showDetail:item=>dispatch({
		type:'app/updateState',
		payload:{
			showDetail:true,
			detail:item
		}
	}),
	closeDetail:()=>dispatch({
		type:'app/updateState',
		payload:{
			showDetail:false
		}
	}),
	changeComment:v=>dispatch({
		type:'app/updateState',
		payload:{
			comment:v
		}
	}),
	submitComment:()=>dispatch({
		type:'app/submitComment'
	}),
	load:()=>dispatch({
		type:'app/loadMore'
	})
})

export default connect(mapStateToProps,mapDispatchToProps)(IndexPage);
