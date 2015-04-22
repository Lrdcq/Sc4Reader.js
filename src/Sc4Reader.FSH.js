var Sc4Reader=Sc4Reader?Sc4Reader:{};
Sc4Reader.FSH=function(file){
	this.file={};
	this.img=null;
	if(file){this.decode(file);}
}
Sc4Reader.FSH.prototype.decode=function(_file){
	var n=function(num,now,to){
		return num*(to-1)/(now-1);
	}
	var f=null,file={};
	this.reader=f=this.reader?this.reader:new Sc4Reader.Reader(_file);
	//head
	file.headname=f.read('String',4);
	if(file.headname!='SHPI'){
		return false;
	}
	file.size=f.read();
	file.count=f.read();
	file.did=f.read('String',4);
	//entry
	file.entry=[];
	for(var i=0;i<file.count;i++){
		f.seek(16+8*i);
		var a={};
		a.name=f.read();
		a.offset=f.read();
		file.entry.push(a);
	}
	//data
	file.img=[];
	for(var i=0;i<file.entry.length;i++){
		//data i entry
		f.seek(file.entry[i].offset);
		var a={};
		a.rid=f.read('Ushort');
		f.move(3);
		a.width=f.read('Uint');
		a.height=f.read('Uint');
		a.xcoordinate=f.read('Uint');
		a.ycoordinate=f.read('Uint');
		a.xposition=f.read('Uint');
		a.yposition=f.read('Uint');
		//data i data
		var check_count=a.width*a.height/16;
		a.check=[];
		for(var j=0;j<check_count;j++){
			var c=[];
			//read alpha
			if(a.rid==0x61){
				for(var k=0;k<8;k++){
					var al=f.read('Ushort');
					c[(k*2)*4+3]=n(al&0x0f,16,256);
					c[(k*2+1)*4+3]=n((al&0xf0)>>4,16,256);
				}
			}else if(a.rid==0x60){
				for(var k=0;k<8;k++){
					c[(k*2)*4+3]=255;
					c[(k*2+1)*4+3]=255;
				}
			}
			//read rgb
			if(a.rid==0x61||a.rid==0x60){
				var c1=f.read('Uint');
				var c2=f.read('Uint');
				var c_l=[];
				c_l[0]=[n((c1&0xF800)>>11,32,256),n((c1&0x07E0)>>5,64,256),n((c1&0x001F),32,256)];
				c_l[1]=[n((c2&0xF800)>>11,32,256),n((c2&0x07E0)>>5,64,256),n((c2&0x001F),32,256)];
				if(c1>c2){
					c_l[2]=[c_l[0][0]*2/3+c_l[1][0]/3,c_l[0][1]*2/3+c_l[1][1]/3,c_l[0][2]*2/3+c_l[1][2]/3];
					c_l[3]=[c_l[1][0]*2/3+c_l[0][0]/3,c_l[1][1]*2/3+c_l[0][1]/3,c_l[1][2]*2/3+c_l[0][2]/3];
				}else{
					c_l[2]=[c_l[0][0]/2+c_l[1][0]/2,c_l[0][1]/2+c_l[1][1]/2,c_l[0][2]/2+c_l[1][2]/2];
					c_l[3]=[0,0,0];
				}
				for(var k=0;k<4;k++){
					var al=f.read('Ushort');
					var a_l=[(al&0x03),(al&0x0C)>>2,(al&0x30)>>4,(al&0xC0)>>6];
					for(var l=0;l<4;l++){
						c[(k*4+l)*4+0]=c_l[a_l[l]][0];
						c[(k*4+l)*4+1]=c_l[a_l[l]][1];
						c[(k*4+l)*4+2]=c_l[a_l[l]][2];
					}
				}
			}
			a.check.push(c);
		}
		//apply to canvas
		var cv=document.createElement('canvas');
		cv.width=a.width;cv.height=a.height;
		var cxn=cv.getContext('2d');
		var d=cxn.createImageData(a.width,a.height);
		for(var j=0;j<a.width*a.height;j++){
			var w=j%a.width,h=Math.floor(j/a.width);
			var cid=Math.floor(w/4)+Math.floor(h/4)*(a.width/4);
			var did=w%4+(h%4)*4;
			try{
				d.data[j*4]=Math.floor(a.check[cid][did*4]);
				d.data[j*4+1]=Math.floor(a.check[cid][did*4+1]);
				d.data[j*4+2]=Math.floor(a.check[cid][did*4+2]);
				d.data[j*4+3]=Math.floor(a.check[cid][did*4+3]);
			}catch(e){
				alert('canvas:out of data')
			}
		}
		cxn.putImageData(d,0,0);
		a.canvas=cv;
		file.img.push(a);
	}
	this.file=file;
	return this.file;
}