class DBPFFile {
	tid = 0;
	gid = 0;
	iid = 0;
	data = null;

	compressed = false;
	dataraw = null;
}

class DBPF {
	versionmajor = 0;
	versionminor = 0;
	created = 0;
	modified = 0;

	iversion = 0;
	ientries = 0;
	ioffset = 0;
	isize = 0;
	ientrylength = 0;

	hrentries = 0;
	hroffset = 0;
	hrsize = 0;

	files = [];//list of DBPFFile
}

class DBPFReader {
	file = null;

	constructor(file) {
		if (file) {
			this.load(file);
		}
	}

	load(_file) {
		if (!(_file instanceof ArrayBuffer)) {
			throw 'Input Is Not a File ArrayBuffer';
		}
		let f = new Sc4Reader.Reader(_file);
		let file = new DBPF();

		let headname = f.read('String',4);
		if(headname != "DBPF"){
			throw 'IS NOT DBPF FILE';
		}

		file.versionmajor = f.read();
		file.versionminor = f.read();
		f.move(12);
		file.created = f.read();
		file.modified = f.read();

		file.iversion = f.read();
		file.ientries = f.read();
		file.ioffset = f.read();
		file.isize = f.read();
		file.ientrylength = file.isize / file.ientries;

		file.hrentries = f.read();
		file.hroffset = f.read();
		file.hrsize = f.read();

		let dirfile = null;

		f.seek(file.ioffset);
		for (var i = 0; i < file.ientries; i++) {
			var data = new DBPFFile();
			data.tid = f.read();
			data.gid = f.read();
			data.iid = f.read();
			if (file.ientrylength == 24) { 
				f.read();//冗余字段
			}
			let offset = f.read();
			let size = f.read();
			data.dataraw = data.data = _file.slice(offset, offset + size);
			data.compressed = false;

			if (data.tid == 0xe86b1eef) {
				dirfile = data;
			}

			file.files.push(data);
		}

		if (dirfile) {
			let f = new Sc4Reader.Reader(dirfile.dataraw);
			let len = dirfile.data.byteLength / (file.ientrylength == 24 ? 20 : 16);
			for (let i = 0; i < len; i++){
				let tid = f.read();
				let gid = f.read();
				let iid = f.read();
				file.ientrylength == 24 && f.move(4);
				let size = f.read();
				//寻找文件
				for (let j = 0; j < file.files.length; j++){
					let data = file.files[j];
					if (data.tid == tid && data.gid == gid && data.iid == iid) {
						data.data = this.decompress(data.dataraw, size);
						data.compressed = true;
						break;
					}
				}
			}
		}

		this.file = file;
		return this.file;
	}

	decompress(file, outlen) {

		let f = new Sc4Reader.Reader(file);
		let answerBuffer = new Uint8Array(outlen);
		let answerlen = 0;
		let numplain = 0;
		let numcopy = 0;
		let offset = 0;
		let len = file.byteLength - 9;
		f.seek(9);

		while (len > 0) {
			let cc = f.read('Ushort');
			len -= 1;
			if (cc >= 0xFC) {
				numplain = cc & 0x03;
				if (numplain > len) { numplain = len; }
				numcopy = 0;
				offset = 0;
			} else if (cc >= 0xE0) {
				numplain = (cc - 0xdf) << 2;
				numcopy = 0;
				offset = 0;
			} else if (cc >= 0xC0) {
				len -= 3;
				let byte1 = f.read('Ushort');
				let byte2 = f.read('Ushort');
				let byte3 = f.read('Ushort');
				numplain = cc & 0x03;
				numcopy = ((cc & 0x0c) << 6) + 5 + byte3;
				offset = ((cc & 0x10) << 12 ) + (byte1 << 8) + byte2;
			} else if (cc >= 0x80) {
				len -= 2;
				let byte1 = f.read('Ushort');
				let byte2 = f.read('Ushort');
				numplain = (byte1 & 0xc0) >> 6;
				numcopy = (cc & 0x3f) + 4;
				offset = ((byte1 & 0x3f) << 8) + byte2;
			} else {
				len -= 1;
				let byte1 = f.read('Ushort');
				numplain = (cc & 0x03);
				numcopy = ((cc & 0x1c) >> 2) + 3;
				offset = ((cc & 0x60) << 3) + byte1;
			}

			//copy
			if (numplain > 0) {
				answerBuffer.set(file.slice(f.point, f.point + numplain), answerlen);
				f.move(numplain);
				len -= numplain;
				answerlen += numplain;
			}
			if (numcopy > 0) {
				let fromoffset = answerlen - (offset + 1);
				answerBuffer.set(answerBuffer.buffer.slice(fromoffset, fromoffset + numcopy), answerlen);
				answerlen += numcopy;
			}
		}
		if (answerlen != outlen) {
			throw 'Decompress answerlen != diroutlen';
		}
		//合并buffer
		return answerBuffer.buffer;
	}
}

var Sc4Reader = Sc4Reader ? Sc4Reader : {};
Sc4Reader.DBPF = DBPFReader;