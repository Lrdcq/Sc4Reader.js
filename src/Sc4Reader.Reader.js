var Sc4Reader=Sc4Reader?Sc4Reader:{};
Sc4Reader.Reader=function(file){
	this.file=file?file:null;
	this.point=0;
	this.view=null;
}
Sc4Reader.Reader.prototype.bindfile=function(file){
	this.file=file;
}
Sc4Reader.Reader.prototype.seek=function(n){
	if(n){this.point=n;}
	else{return this.point;}
}
Sc4Reader.Reader.prototype.move=function(n){
	if(n){this.point+=n;}
}
Sc4Reader.Reader.prototype.read=function(type,length,dontmove){
	if(!this.file){
		return false;
	}
	if(!this.view){
		this.view=new DataView(this.file);
	}
	type=type?type:'Ulong';
	var num=0,type2='';;
	switch(type){
		case 'Char':type2='Uint';num=8;break;
		case 'Ushort':type2='Uint';num=8;break;
		case 'Short':type2='Int';num=8;break;
		case 'Uint':type2='Uint';num=16;break;
		case 'Int':type2='Int';num=16;break;
		case 'Ulong':type2='Uint';num=32;break;
		case 'Long':type2='Int';num=32;break;
		case 'Float':type2='Float';num=32;break;
		case 'Double':type2='Float';num=64;break;
	}
	try{
		if(type!='String'){
			if(this.view['get'+type2+num]){
				var o=this.view['get'+type2+num](this.point,1);
				if(!length){this.point+=num/8;}
				return type=='Char'?String.fromCharCode(o):o;
			}
		}else{
			var str='',o='a',sp=this.point;
			length=length?length:1024*1024;
			while(length){
				var o=this.view.getUint8(this.point,1);
				this.point++;
				length--;
				if(!o){break;}
				str+=String.fromCharCode(o);
			}
			if(dontmove){this.point=sp;}
			return str;
		}
	}catch(e){			
		alert('read:文件越界！');
		return 0;
	}
}