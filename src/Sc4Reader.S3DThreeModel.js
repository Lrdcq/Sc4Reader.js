class S3DThreeModel {
	geometrys = []; //will be THREE.Geometry list
	s3d = null; //will be S3D

	constructor() {
	}

	static convertS3DtoS3DThreeModel(s3d) {
		let model = new S3DThreeModel();
		model.s3d = s3d;
		model.object = new THREE.Group();

		s3d.anim.group.forEach(function(group) {
			//目前只处理第一帧
			let vertex = s3d.vert.group[group.frames[0].vertex];
			let index = s3d.indx.group[group.frames[0].index];
			
			let geometry = new THREE.Geometry();
			vertex.vertices.forEach(function(v) {
				geometry.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
			});

			geometry.faceVertexUvs[0] = [];
			for (let i = 0; i < index.indices.length; i += 3) {
				let face = new THREE.Face3(index.indices[i], index.indices[i + 1], index.indices[i + 2]);
				geometry.faces.push(face);
				geometry.faceVertexUvs[0].push([new THREE.Vector2(vertex.vertices[face.a].u, vertex.vertices[face.a].v), new THREE.Vector2(vertex.vertices[face.b].u, vertex.vertices[face.b].v), new THREE.Vector2(vertex.vertices[face.c].u, vertex.vertices[face.c].v)]);
			}
			geometry.computeBoundingSphere();

			model.geometrys.push(geometry);
		});

		return model;
	}

}

var Sc4Reader = Sc4Reader ? Sc4Reader : {};
Sc4Reader.S3DThreeModel = S3DThreeModel;