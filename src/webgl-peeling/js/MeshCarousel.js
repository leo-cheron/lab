import THREE from "lib/three/three";
import MeshFactory from "scene/mesh/MeshFactory";
import AnimatedMesh from "scene/mesh/AnimatedMesh";
import TweenLite from "lib/tweenLite/TweenLite";
import Stage from "lib/anonymous/core/Stage";

// import OrbitControls from "lib/three/extras/controls/OrbitControls";

export default class MeshManager
{
	constructor(scene)
	{
		this._scene = scene.scene;
		this._sceneModel = scene.model;
		this._camera = scene.camera;

		this.load();

		// mouse movement
		// this._plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
		this._plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 1400, 1), new THREE.MeshBasicMaterial({color: 0xFF0000, visible: false}));
		// this._plane.depthTest = false;
		// this._plane.depthWrite = false;
		this._plane.translateZ(180);
		this._scene.add(this._plane);

		this._raycaster = new THREE.Raycaster();

		// mouse movement

		this.mouse = new THREE.Vector2();
		this.mouse.x = 0;
		this.mouse.y = 0;

		// controls
		document.addEventListener('mousemove', this._onDocumentMouseMove.bind(this), false);

		// this.controls = new THREE.OrbitControls(this._camera, scene.renderer.domElement);
		// this.controls.enableDamping = true;
		// this.controls.dampingFactor = 0.9;
		// this.controls.enableZoom = true;
	}

	//-----------------------------------------------------o loading

	load()
	{
		this._factory = new MeshFactory(this._sceneModel);

		// this.meshesId = [MeshFactory.TYPE_HELMET, MeshFactory.TYPE_HORN, MeshFactory.TYPE_EAGLE, MeshFactory.TYPE_EASEL];
		this.meshesId = [MeshFactory.TYPE_HELMET, MeshFactory.TYPE_HORN, MeshFactory.TYPE_EAGLE, MeshFactory.TYPE_BED];
		// this.meshesId = [MeshFactory.TYPE_HELMET,  MeshFactory.TYPE_HORN];
		// this.meshesId = [MeshFactory.TYPE_BOX];
		this.animatedMeshes = [];
		this.loadProgress = 0;

		for (var i = 0, l = this.meshesId.length; i < l; ++i)
			this._factory.build(this.meshesId[i], this._onMeshBuilt.bind(this));
	}

	_onMeshBuilt(mesh, type)
	{
		// new mesh creation
		mesh.scale.set(0.9, 0.9, 0.9);
		// mesh.position.x = 500;

		var animatedMesh = new AnimatedMesh(mesh, this._scene, this._sceneModel);
		animatedMesh.type = type;

		this.animatedMeshes[this.meshesId.indexOf(type)] = animatedMesh;

		if(++this.loadProgress == this.meshesId.length)
		{
			this.loaded = true;
			this.index = -1;
			this.next();
		}
	}

	//-----------------------------------------------------o public

	update()
	{
		if (this.loaded)
		{
			if(this._mouseProjection)
			{
				let ease = 0.1;
				this.mouseProjection.add(this._mouseProjection.point.clone().sub(this.mouseProjection).multiply({x: ease, y: ease, z: ease}));
			}

			for (var i = 0, l = this.animatedMeshes.length; i < l; ++i)
			{
				let animatedMesh = this.animatedMeshes[i];
				if(!animatedMesh.locked)
				{
					animatedMesh.mouse = this.mouse;

					if(this._mouseProjection)
						animatedMesh.mouseProjection = this.mouseProjection;
					
					animatedMesh.update();
				}
			}
		}
	}

	prev()
	{
		if(this.index > 0)
		{
			if(this.animatedMesh)
				this.animatedMesh.hide();
			
			this.animatedMesh = this.animatedMeshes[--this.index];
			this.animatedMesh.show();
		}
	}

	next()
	{
		if(this.index < this.animatedMeshes.length - 1)
		{
			if(this.animatedMesh)
				this.animatedMesh.hide();

			this.animatedMesh = this.animatedMeshes[++this.index];
			this.animatedMesh.show();
		}
	}

	destroy()
	{
		this._scene = null;
	}

	//-----------------------------------------------------o mouse handlers

	_onDocumentMouseMove(e)
	{
		// this.mouse.x = (e.clientX - Stage.width * 0.5);
		// this.mouse.y = (e.clientY - Stage.height * 0.5);
		this.mouse.x = (e.clientX / Stage.width) * 2 - 1;
		this.mouse.y = - (e.clientY / Stage.height) * 2 + 1;

		this._raycaster.setFromCamera(this.mouse, this._camera);
		this._mouseProjection = this._raycaster.intersectObject(this._plane, false)[0];

		if(!this.mouseProjection && this._mouseProjection)
			this.mouseProjection = new THREE.Vector3(this._mouseProjection.point.x, this._mouseProjection.point.y, this._mouseProjection.point.z);

		// if(intersection)
		// 	console.log("MeshManager", this.mouse.x, this.mouse.y, intersection.point.x, intersection.point.y);

		// var projector = new THREE.Projector();
		// 	var planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
		// 	var mv = new THREE.Vector3(
		// 	    (cX / window.innerWidth) * 2 - 1,
		// 	    -(cY / window.innerHeight) * 2 + 1,
		// 	    0.5 );
		// 	var raycaster = projector.pickingRay(mv, camera);
		// 	var pos = raycaster.ray.intersectPlane(planeZ);

	}
}
