import THREE from "lib/three/three";
import Stage from "lib/anonymous/core/Stage";

export default class PointerLockControls
{
	constructor(camera)
	{
		camera.rotation.set(0, 0, 0);

		this.pitchObject = new THREE.Object3D();
		this.pitchObject.add(camera);

		this.yawObject = new THREE.Object3D();
		this.yawObject.add(this.pitchObject);

		this.rollObject = new THREE.Object3D();
		this.rollObject.add(this.yawObject);

		this.rxinc = 0.2;

		this.rx = 0;
		this.ry = 0;
		this.rz = 0;

		this._wheel = 0;

		this.deviceOrientation = window.orientation || 0;

		THREE.PointerLockControls.orientation = new THREE.Vector3();

		// touch device listeners
		Stage.$window
			.on("deviceorientation.pointerLock", this.onDeviceOrientation.bind(this))
			.on("orientationchange.pointerLock", this.onOrientationChange.bind(this));
		
		// desktop
		Stage.$document
			.on("mousemove.pointerLock", this.onMouseMove.bind(this))

		this.enabled = false;
	}

	onMouseMove(e) 
	{
		this.touchDevice = false;

		var mx = -(e.clientX / Stage.width) * 2 + 1;
		var my = -(e.clientY / Stage.height) * 2 + 1;

		this.ry = mx * 0.5;
		this.rx = my * 0.2;
	}

	onDeviceOrientation(e) 
	{
		this.touchDevice = true;

		// quaternion.set(e.alpha, e.beta, e.gamma)
		var betaMax = 60;
		var gammaMax = 90;

		// var a = e.alpha; // not used here

		var b = e.beta;
		var g = e.gamma;

		if(this.deviceOrientation < 0)
		{
			b *= -1;
			g *= -1;
		}

		if(g <= 90 && g >= 20)
		{
			g = g - 180;
			b = Math.sign(b) < 0 ? -b - 180 : 180 - b;
		}

		var beta = b / betaMax; // rotate z
		var gamma = g / gammaMax;

		this.rx = -gamma * 1 - 1 + this.rxinc;
		this.ry = -beta * 0.7;
	}

	onOrientationChange(e)
	{
		this.deviceOrientation = window.orientation || 0;
	}

	update() 
	{
		var ease = this.touchDevice ? 0.05 : 0.025;
		this.yawObject.rotation.y += (this.ry - this.yawObject.rotation.y) * ease;
		this.pitchObject.rotation.x += ((this.rx - this.rxinc) - this.pitchObject.rotation.x) * ease;

		this.rz = (this.ry - this.yawObject.rotation.y) * 0.8;
		this.rollObject.rotation.z += (this.rz - this.rollObject.rotation.z) * ease * 0.8;

		THREE.PointerLockControls.orientation.x = this.pitchObject.rotation.x;
		THREE.PointerLockControls.orientation.y = this.yawObject.rotation.y;
		THREE.PointerLockControls.orientation.z = this.rollObject.rotation.z;
	}

	dispose() 
	{
		Stage.$document.off("mousemove.pointerLock");

		Stage.$window.off("deviceorientation.pointerLock");
		Stage.$window.off("orientationchange.pointerLock");
	}

	getObject() 
	{
		return this.rollObject;
	}

	getDirection() 
	{
		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3( 0, 0, -1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function(v)
		{
			rotation.set( this.pitchObject.rotation.x, this.yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;
		}
	}
} 

THREE.PointerLockControls = PointerLockControls;