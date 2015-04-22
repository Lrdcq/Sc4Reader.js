var Sc4Reader=Sc4Reader?Sc4Reader:{};
Sc4Reader.Loader=function(file){
	this.file=file?file:null;
	if(window.FileReader){
		this.reader=new FileReader();
	}else{
		return false;
	}
	this.dom=null;
	this.data=null;
	this.onload=function(data){}
	this.onerror=function(error){}
}
Sc4Reader.Loader.prototype.bind=function(dom){
	if(dom.getAttribute('type')=='file'){
		this.dom=dom;
		return true;
	}
	return false;
}
Sc4Reader.Loader.prototype.open=function(dom){
	if(dom){this.bind(dom);}
	var _this=this;
	this.reader.onload=function() { 
		_this.data=this.result;
		_this.onload(_this.data);
	}
	this.reader.onerror=this.reader.onabort=function(e){
		_this.onerror(e);
	}
	if(this.dom.files&&this.dom.files[0]){
		this.file=this.dom.files[0];
	}else{
		return false;
	}
	if(this.file){
		this.reader.readAsArrayBuffer(this.file);
		return true;
	}
	return false;
}