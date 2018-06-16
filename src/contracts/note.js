"use strict";
// n1m9pFy8oTZmt61s59uqaMHYCuW7RhNnwxu
// dcfd95157f493ea8e801d61264e35a58744b683d1330659e7949460f1aec544b
var NoteItem = function(text){
	if(text){
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.title = obj.title;
		this.text = obj.text;
		this.author = obj.author;
		this.images = obj.images;
		this.comments = obj.comments;
		this.time = obj.time;
	}
	else{
		this.key = "";
		this.title = "";
		this.text = "";
		this.author = "";
		this.images = [];
		this.comments = [];
		this.time = (new Date()).getTime();
	}
}

NoteItem.prototype = {
	toString:function(){
		return JSON.stringify(this);
	}
}

var Note = function(){
	LocalContractStorage.defineMapProperty(this,"repo",{
		parse:function(text){
			return new NoteItem(text);
		},
		stringify:function(o){
			return o.toString();
		}

	});
	LocalContractStorage.defineProperty(this,"key",{
		parse:function(text){
			return parseInt(text);
		}
	});
}

Note.prototype = {
	init:function(){
	},
	save:function(title,text,images){

		images = JSON.parse(images);
		title = title.trim();
		text = text.trim();

		var author = Blockchain.transaction.from;
		var time = (new Date()).getTime();
		var key = this.key++;

		var noteItem = new NoteItem();
		noteItem.key = key;
		noteItem.title = title;
		noteItem.text = text;
		noteItem.author = author;
		noteItem.images = images;
		noteItem.comments = [];
		noteItem.time = time;

		this.repo.put(key,noteItem);
	},
    query:function(offset,count){
		var noteItems = []

		let start = this.key - offset -1;
		let end = this.key - offset - count;

		for(let i=start;i>=end&&i>=0;i--){
			noteItems.push(this.repo.get(i))
		}
		return noteItems
    },
	get:function(key){
		
		if(key===''){
			throw new Error('empty key');
		}
		return this.repo.get(key);
	},
	comment:function(key,text){

		var item = this.repo.get(key);

		if(item==null){
			throw new Error("nonexisting note item");
		}

		text = text.trim();

		var author = Blockchain.transaction.from;

		var comment = {
			text:text,
			author:author,
			time:(new Date()).getTime()
		};
		item.comments.push(comment);
		this.repo.put(key,item);

	}
}
module.exports = Note;



