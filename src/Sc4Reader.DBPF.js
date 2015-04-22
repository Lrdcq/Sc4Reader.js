var Sc4Reader=Sc4Reader?Sc4Reader:{};
Sc4Reader.DBPF=function(file){
	this.file={};
	if(file){this.load(file);}
}
Sc4Reader.DBPF.prototype.load=function(_file){
	var f=null,file={};
	this.file_data=this.file_data?this.file_data:_file;
	this.reader=f=this.reader?this.reader:new Sc4Reader.Reader(_file);
	file.headname=f.read('String',4);
	if(file.headname!="DBPF"){
		return false;
	}
	file.ersionmajor=f.read();
	file.versionminor=f.read();
	f.move(12);
	file.created=f.read();
	file.modified=f.read();
	file.iversion=f.read();
	file.ientries=f.read();
	file.ioffset=f.read();
	file.isize=f.read();
	file.ientrylength=file.isize/file.ientries;
	file.hrentries=f.read();
	file.hroffset=f.read();
	file.hrsize=f.read();
	//f.read('Ulong');f.read('Ulong');f.read('Ulong');f.read('Ulong');f.read('Ulong');f.read('Ulong');f.read('Ulong');f.read('Ulong');
	file.list=[];
	f.seek(file.ioffset);
	var dir=null;
	for(var i=0;i<file.ientries;i++){
		var data={}
		data.typeid=f.read();
		data.groupid=f.read();
		data.instid=f.read();
		if(file.ientrylength==24){f.read();}
		data.offset=f.read();
		data.size=f.read();
		file.list.push(data);
		if(data.typeid==0xe86b1eef){dir=data;}
	}
	if(dir){
		var dir_list=[]
		f.seek(dir.offset);
		var len=dir.size/(file.ientrylength==24?20:16);
		for(var i=0;i<len;i++){
			var dirdata={}
			dirdata.typeid=f.read();
			dirdata.groupid=f.read();
			dirdata.instid=f.read();
			file.ientrylength==24&&f.move(4);
			dirdata.size=f.read();
			dir_list.push(dirdata);
		}
		this.dirfile=dir_list;
		/*
		var len2=file.list.length;
		for(var i=0;i<len;i++){
			for(var j=0;j<len2;j++){
				if((dir_list[i].instid==file.list[j].instid)&&(dir_list[i].typeid==file.list[j].typeid)&&(dir_list[i].groupid==file.list[j].groupid)&&(!file.list[j].compressed)){
					file.list[j].compressed=dir_list[i].size;
					dir_list[i].file=file.list[j];
					break;
				}
			}
		}*/
	}
	this.file=file;
	return this.file;
}