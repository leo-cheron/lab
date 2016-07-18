import THREE from "lib/three/three";
// import SimplifyModifier from "lib/three/extras/modifiers/SimplifyModifier";
import Wireframe from "lib/three/extras/helpers/WireframeHelper";

import pointFs from "scene/shaders/pointFs.glsl";
import pointVs from "scene/shaders/pointVs.glsl";

import TimelineLite from "lib/tweenLite/TimelineLite";

// import FaceNormalsHelper from "lib/three/extras/helpers/FaceNormalsHelper";

export default class AnimatedMesh 
{
	constructor(mesh, scene, model)
	{
		this._scene = scene;
		this._sceneModel = model;

		this.mesh = mesh;

		this.init();
	}

	init()
	{
		this.clock = new THREE.Clock();

		this.rotx = 0;
		this.roty = 0;
		this.timeline = 0; // [0-1]
		this.rotation = 0;

		// point cloud
		var pointMaterial = new THREE.ShaderMaterial(
		{
			uniforms: {
				uSize: { type: "f", value: 0.0/*this._sceneModel.pointSize*/ },
				uColor: { type: "c", value: new THREE.Color(this._sceneModel.pointColor) },

				// fogColor: { type: "c", value: this._sceneModel.backgroundColor },
				// fogNear: { type: "f", value: this._sceneModel.fogNear },
				// fogFar: { type: "f", value: this._sceneModel.fogFar }
			},
			vertexShader: pointVs,
			fragmentShader: pointFs,
			depthWrite: true,
			depthTest: true,
			transparent: true,
			// fog: true
		});

		this._points = new THREE.Points(this.mesh.wireframe.geometry, pointMaterial);
		this._points.matrix = this.mesh.matrixWorld;
		this._points.matrixAutoUpdate = false;
	}

	destroy()
	{
		if(this.mesh.parent)
			this._scene.remove(this.mesh);
		
		if(this.mesh.wireframe && this.mesh.wireframe.parent)
			this._scene.remove(this.mesh.wireframe);

		if(this._points && this._points.parent)
			this._scene.remove(this._points);

		this._scene = null;

		this._sceneModel = null;
	}

	update()
	{
		// vertices animation
		if(this.mesh && !this.locked)
		{
			// rotation
			let ease = 0.03;
			this.rotx += (-this.mouse.y * Math.PI * 0.06 - this.rotx) * ease;
			this.roty += (this.mouse.x * Math.PI * 0.08 - this.roty) * ease;

			this.mesh.rotation.y += (-this.roty + this.rotation - this.mesh.rotation.y) * .2;
			this.mesh.rotation.x = -this.rotx;

			// this.mesh.rotation.y += (this.timeline * 2 * Math.PI - this.mesh.rotation.y) * 0.3;

			// shader
			this.mesh.material.uniforms.timeline.value += (this.timeline - this.mesh.material.uniforms.timeline.value) * 0.3;
			this.mesh.material.uniforms.time.value += this.clock.getDelta();

			if(this.mouseProjection)
				this.mesh.material.uniforms.mouse.value = this.mouseProjection;
			
			// this.mesh.material.uniforms.fogNear.value = this._sceneModel.fogNear;
			// this.mesh.material.uniforms.fogFar.value = this._sceneModel.fogFar;
		}
	}

	show(delay = 0.6)
	{
		this.locked = false;

		this.mesh.position.z = 1;

		if(!this.mesh.parent)
			this._scene.add(this.mesh);

		if(this.mesh.wireframe && !this.mesh.wireframe.parent)
			this._scene.add(this.mesh.wireframe);

		if(this._points && !this._points.parent)
			this._scene.add(this._points)

		if(this.tlHide)
			this.tlHide.pause();
		
		if(!this.tlShow)
		{
			this.tlShow = new TimelineLite({onStart: () =>
			{
				if(this.mesh.wireframe)
					this.mesh.wireframe.material.opacity = 0;

				this.rotation = 0;
				this.timeline = 0;

				this.mesh.material.uniforms.orientation.value = 1;

				this._points.material.uniforms.uSize.value = 0;
			}});

			this.tlShow.delay(delay);

			this.tlShow.to(this, 2, {rotation: 2 * Math.PI, ease: Expo.easeOut}, "start");
			this.tlShow.to(this, 5, {timeline: 1, ease: Expo.easeOut}, "start");

			// points
			if(this._points)
				this.tlShow.to(this._points.material.uniforms.uSize, 2, {value: this._sceneModel.pointSize, ease: Quart.easeOut}, "start");

			// wireframe
			if(this.mesh.wireframe)
				this.tlShow.to(this.mesh.wireframe.material, 1, {opacity: this._sceneModel.wireframeOpacity, ease: Quart.easeOut}, "start");
		}
		else
			this.tlShow.restart(delay);
	}

	hide(delay = 0)
	{
		this.mesh.position.z = -1;

		if(this.tlShow)
			this.tlShow.pause();

		if(!this.tlHide)
		{
			this.tlHide = new TimelineLite({onComplete: () => 
			{
				if(this.mesh.parent)
					this._scene.remove(this.mesh);
				
				if(this.mesh.wireframe && this.mesh.wireframe.parent)
					this._scene.remove(this.mesh.wireframe);

				if(this._points.parent)
					this._scene.remove(this._points);

				this.locked = true;
			}});

			this.mesh.material.uniforms.orientation.value = -1;

			this.tlHide.delay(delay);

			this.tlHide.to(this, 2, {rotation: 4 * Math.PI, ease: Expo.easeOut}, "start");
			this.tlHide.to(this, 5, {timeline: 0, ease: Expo.easeOut}, "start");

			// points
			if(this._points)
				this.tlHide.to(this._points.material.uniforms.uSize, 1, {value: 0, ease: Quart.easeOut}, "start+=0.3");

			// wireframe
			if(this.mesh.wireframe)
				this.tlHide.to(this.mesh.wireframe.material, 1, {opacity: 0, ease: Quart.easeOut}, "start+=0.4");
		}
		else
			this.tlHide.restart(delay);
	}

	updateWireframe(color, opacity, linewidth)
	{
		if(this.mesh.wireframe)
		{
			this.mesh.wireframe.material.color.setHex(color);
			this.mesh.wireframe.material.opacity = opacity;
			this.mesh.wireframe.material.linewidth = linewidth;
		}
	}
}