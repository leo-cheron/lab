import THREE from "lib/three/three";
import Stage from "lib/anonymous/core/Stage";
import MouseEvent from "lib/anonymous/events/MouseEvent";

export default class MouseInteraction
{
	constructor(scene, camera, model)
	{
		this._scene = scene;
		this._model = model;
		this._camera = camera;

		this.mouse = new THREE.Vector2();
		this.projection = new THREE.Vector3();

		this.init();
	}

	init()
	{
		// mouse movement
		this._planeZ = new THREE.Mesh(new THREE.PlaneBufferGeometry(12000, 8000, 1), new THREE.MeshBasicMaterial({color: 0x0000FF, wireframe: true, side: THREE.DoubleSide, visible: true}));
		this._planeZ.position.y = 300;
		this._planeZ.position.z = 4000 - 8000 * 0.5;
		this._planeZ.rotation.x = -Math.PI * 0.5;
		this._scene.add(this._planeZ);

		this._planeY = new THREE.Mesh(new THREE.PlaneBufferGeometry(4000, 2000, 1), new THREE.MeshBasicMaterial({color: 0xFF0000, wireframe: true, visible: true}));
		// this._planeY.depthTest = false;
		// this._planeY.depthWrite = false;
		this._planeY.translateY(1000);
		this._planeY.translateZ(3500);
		// this._planeY.translateZ(3700);
		this._scene.add(this._planeY);

		this._raycaster = new THREE.Raycaster();

		Stage.$document.on(MouseEvent.MOVE + ".interaction", this._onDocumentMouseMove.bind(this));
	}

	destroy()
	{
		this._scene = null;
		this._model = null;

		Stage.$document.off(MouseEvent.MOVE + ".interaction");
	}

	//-----------------------------------------------------o handlers

	_onDocumentMouseMove(e)
	{
		// this.mouse.x = (e.clientX - Stage.width * 0.5);
		// this.mouse.y = (e.clientY - Stage.height * 0.5);
		this.mouse.x = (e.clientX / Stage.width) * 2 - 1;
		this.mouse.y = -(e.clientY / Stage.height) * 2 + 1;

		this._raycaster.setFromCamera(this.mouse, this._camera);

		var intersectionz = this._raycaster.intersectObject(this._planeZ, false)[0];
		if(intersectionz)
		{
			intersectionz.distance -= 100;
			if(intersectionz.distance < 0) intersectionz.distance = 0;
			if(intersectionz.distance > 800) intersectionz.distance = 800;

			this.projection = intersectionz.point;
			this.projection.z = -intersectionz.distance;
		}

		var intersectiony = this._raycaster.intersectObject(this._planeY, false)[0];
		if(intersectiony)
		{
			this.projection.x = intersectiony.point.x;
			// this.projection.y = intersectiony.point.y - this._model.cameraY;
			// this.projection.y -= this._model.cameraY;
		}
		// console.log("MouseInteraction", intersectionz);

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
