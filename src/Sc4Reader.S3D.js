class S3DHeadSection {
	size = 0;
	version = 1;
	subversion = 5;
}

class S3DVertSection {
	size = 0;
	group = [];
}

class S3DVertGroup {
	flags = 0;
	format = 0x80004001;
	vertices = [];
}

class S3DVert {
	x = 0;
	y = 0;
	z = 0;
	u = 0;
	v = 0;
}

class S3DIndxSection {
	size = 0;
	group = [];
}

class S3DIndxGroup {
	flags = 0;
	stride = 0;
	indices = [];
}

class S3DPrimSection {
	size = 0;
	group = [];
}

class S3DPrimGroup {
	subgroup = [];
}

class S3DPrim {
	primitiveType = 0;//0 = Triangles (typical), 1 = Triangle Strip, 2 = Triangle Fan, 3 = Quads, 4 = Quad Fan
	firstIndex = 0;
	numberIndices = 0;
}

class S3DMatsSection {
	size = 0;
	group = [];
}

class S3DMatsGroup {
	flags = 0;//bitmask: 1 = Alpha Test, 2 = Depth Test, 8 = Backface Culling, 16 = Frame Buffer Blend, 32 = Texturing, 64 = Color Writes, 128 = Depth Writes
	alphaFunction = 0;
	depthFunction = 0;
	sourceBlendFactor = 0;
	destinationBlendFactor = 0;
	alphaThreshold = 0;
	materialClass = 0;
	textures = [];
}

class S3DMatsTexture {
	IID = 0x00000000;
	uWrapMode = 0;
	vWrapMode = 0;
	magnif = 0;
	minif = 0;
	animationRate = 0;
	animationMode = 0;
	name = '';
}

class S3DAnimSection {
	size = 0;
	frames = 1;
	frameRate = 0;
	animationMode = 0;
	flags = 0;
	displacement = 0;
	group = [];
}

class S3DAnimGroup {
	flags = 0;
	name = '';
	frames = [];
}

class S3DAnim {
	vertex = 0;
	index = 0;
	primitive = 0;
	material = 0;
}

class S3DPropSection {
	size = 0;
	group = [];
}

class S3DPropGroup {
	mesh = 0;
	frame = 1;
	assignment = '';
	assignedValue = '';
}

class S3DRegpSection {
	size = 0;
	group = [];
}

class S3DRegpGroup {
	name = '';
	subgroup = [];
}

class S3DRegp {
	x = 0;
	y = 0;
	z = 0;
	ox = 0;
	oy = 0;
	oz = 0;
	ow = 0;
}

class S3D {
	fileSize = 0;
	head;
	vert;
	indx;
	prim;
	mats;
	anim;
	prop;
	regp;
}

class S3DReader {
	file = null;

	constructor(file) {
		if (file) {
			this.load(file);
		}
	}

	loadHeader(f) {
		let head = new S3DHeadSection();
		head.size = f.read();
		head.version = f.read('Uint');
		head.subversion = f.read('Uint');
		return head;
	}

	loadVert(f) {
		let vert = new S3DVertSection();
		vert.size = f.read();
		let count = f.read();
		for (let i = 0; i < count; i++) {
			let data = new S3DVertGroup();
			data.flags = f.read('Uint');
			let countInner = f.read('Uint');
			data.format = f.read();
			for (let j = 0; j < countInner; j++) {
				let v = new S3DVert();
				v.x = f.read('Float');
				v.y = f.read('Float');
				v.z = f.read('Float');
				v.u = f.read('Float');
				v.v = f.read('Float');
				data.vertices[j] = v;
			}
			vert.group[i] = data;
		}
		return vert;
	}

	loadIndx(f) {
		let indx = new S3DIndxSection();
		indx.size = f.read();
		let count = f.read();
		for (let i = 0; i < count; i++) {
			let data = new S3DIndxGroup();
			data.flags = f.read('Uint');
			data.stride = f.read('Uint');
			let countInner = f.read('Uint');
			let readType = 'Uint';
			switch (data.stride) {
				case 1:
					readType = 'Ushort';
					break;
				case 4:
					readType = 'Ulong';
					break;
				case 2:
				default:
					readType = 'Uint';
			}
			for (let j = 0; j < countInner; j++) {
				data.indices[j] = f.read(readType);
			}
			indx.group[i] = data;
		}
		return indx;
	}

	loadPrim(f) {
		let prim = new S3DPrimSection();
		prim.size = f.read();
		let count = f.read();
		for (let i = 0; i < count; i++) {
			let data = new S3DPrimGroup();
			let countInner = f.read('Uint');
			data.subgroup = [];
			for (let j = 0; j < countInner; j++) {
				let v = new S3DPrim();
				v.primitiveType = f.read();
				v.firstIndex = f.read();
				v.numberIndices = f.read();
				data.subgroup[j] = v;
			}
			prim.group[i] = data;
		}
		return prim;
	}

	loadMats(f, head) {
		let mats = new S3DMatsSection();
		mats.size = f.read();
		let count = f.read();
		for (let i = 0; i < count; i++) {
			let data = new S3DMatsGroup();
			data.flags = f.read();//bitmask: 1 = Alpha Test, 2 = Depth Test, 8 = Backface Culling, 16 = Frame Buffer Blend, 32 = Texturing, 64 = Color Writes, 128 = Depth Writes
			data.alphaFunction = f.read('Ushort');
			data.depthFunction = f.read('Ushort');
			data.sourceBlendFactor = f.read('Ushort');
			data.destinationBlendFactor = f.read('Ushort');
			data.alphaThreshold = f.read('Uint');
			data.materialClass = f.read();
			f.read('Ushort');//无用
			let textureCount = f.read('Ushort');
			for (let j = 0; j < textureCount; j++) {
				let v = new S3DMatsTexture();
				v.IID = f.read();
				v.uWrapMode = f.read('Ushort');
				v.vWrapMode = f.read('Ushort');
				if (head.subversion >= 5) {
					v.magnif = f.read('Ushort');
					v.minif = f.read('Ushort');
				}
				v.animationRate = f.read('Uint');
				v.animationMode = f.read('Uint');
				let strLen = f.read('Ushort');
				v.name = f.read('String');

				data.textures[j] = v;
			}
			mats.group[i] = data;
		}
		return mats;
	}

	loadAnim(f) {
		let anim = new S3DAnimSection();
		anim.size = f.read();
		anim.frames = f.read('Uint');
		anim.frameRate = f.read('Uint');
		anim.animationMode = f.read('Uint');
		anim.flags = f.read();
		anim.displacement = f.read('Float');
		let count = f.read('Uint');
		for (let i = 0; i < count; i++) {
			let data = new S3DAnimGroup();
			let strLen = f.read('Ushort');
			data.flags = f.read('Ushort');
			data.name = f.read('String');
			for (let j = 0; j < anim.frames; j++) {
				let v = new S3DAnim();
				v.vertex = f.read('Uint');
				v.index = f.read('Uint');
				v.primitive = f.read('Uint');
				v.material = f.read('Uint');
				data.frames[j] = v;
			}

			anim.group[i] = data;
		}
		return anim;
	}

	loadProp(f) {
		let prop = new S3DPropSection();
		prop.size = f.read();
		let count = f.read();
		for (let i = 0; i < count; i++) {
			let data = new S3DPropGroup();
			data.mesh = f.read('Uint');
			data.frame = f.read('Uint');
			f.read('Ushort');
			data.assignment = f.read('String');
			f.read('Ushort');
			data.assignedValue = f.read('String');
			prop.group[i] = data;
		}
		return prop;
	}

	loadRegp(f) {
		let regp = new S3DRegpSection();
		regp.size = f.read();
		let count = f.read();
		for (let i = 0; i < count; i++) {
			let data = new S3DRegpGroup();
			f.read('Ushort');
			data.name = f.read('String');
			let subgroupCount = f.read('Uint');
			for (let j = 0; j < subgroupCount; j++) {
				let v = new S3DRegp();
				v.x = f.read('Float');
				v.y = f.read('Float');
				v.z = f.read('Float');
				v.ox = f.read('Float');
				v.oy = f.read('Float');
				v.oz = f.read('Float');
				v.ow = f.read('Float');
				data.subgroup[j] = v;
			}

			regp.group[i] = data;
		}
		return regp;
	}

	load(_file) {
		if (!(_file instanceof ArrayBuffer)) {
			throw 'Input Is Not a File ArrayBuffer';
		}
		let f = new Sc4Reader.Reader(_file);
		let file = new S3D();

		//文件头
		let headname = f.read('String',4);
		if (headname != "3DMD"){
			throw 'IS NOT S3D FILE';
		}
		file.fileSize = f.read();

		while (f.point < file.fileSize) {
			let sectionName = f.read('String',4);
			switch (sectionName) {
				case 'HEAD':
					file.head = this.loadHeader(f);
					break;
				case 'VERT':
					file.vert = this.loadVert(f);
					break;
				case 'INDX':
					file.indx = this.loadIndx(f);
					break;
				case 'PRIM':
					file.prim = this.loadPrim(f);
					break;
				case 'MATS':
					file.mats = this.loadMats(f, file.head);
					break;
				case 'ANIM':
					file.anim = this.loadAnim(f);
					break;
				case 'PROP':
					file.prop = this.loadProp(f);
					break;
				case 'REGP':
					file.regp = this.loadRegp(f);
					break;
				default:
					throw 'Unknown Section Header Name';
			}
		}

		this.file = file;
		return this.file;
	}
}

var Sc4Reader = Sc4Reader ? Sc4Reader : {};
Sc4Reader.S3D = S3DReader;