import THREE from "lib/three/three";
// import SimplifyModifier from "lib/three/extras/modifiers/SimplifyModifier";
// import Wireframe from "lib/three/extras/helpers/WireframeHelper";

// import pointFs from "scene/shaders/pointFs.glsl";
// import pointVs from "scene/shaders/pointVs.glsl";

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
		// var pointMaterial = new THREE.ShaderMaterial(
		// {
		// 	uniforms: {
		// 		uSize: { type: "f", value: this._sceneModel.pointSize },
		// 		uColor: { type: "c", value: new THREE.Color(this._sceneModel.pointColor) },
		// 		uOpacity: { type: "f", value: 0 },

		// 		// fogColor: { type: "c", value: this._sceneModel.backgroundColor },
		// 		// fogNear: { type: "f", value: this._sceneModel.fogNear },
		// 		// fogFar: { type: "f", value: this._sceneModel.fogFar }
		// 	},
		// 	vertexShader: pointVs,
		// 	fragmentShader: pointFs,
		// 	depthWrite: true,
		// 	depthTest: true,
		// 	transparent: true,
		// 	// fog: true
		// });

		// this._points = new THREE.Points(this.mesh.wireframe.geometry, pointMaterial);
		// this._points.matrix = this.mesh.matrixWorld;
		// this._points.matrixAutoUpdate = false;
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
			let ease = 0.05;
			this.rotx += (-this.mouse.y * Math.PI * 0.06 - this.rotx) * ease;
			this.roty += (this.mouse.x * Math.PI * 0.08 - this.roty) * ease;

			this.mesh.rotation.y += (-this.roty + this.rotation - this.mesh.rotation.y) * .2;
			this.mesh.rotation.x = -this.rotx;

			// this.mesh.rotation.y += (this.timeline * 2 * Math.PI - this.mesh.rotation.y) * 0.3;

			// shader
			this.mesh.material.uniforms.timeline.value += (this.timeline - this.mesh.material.uniforms.timeline.value) * 0.3;
			this.mesh.material.uniforms.time.value += this.clock.getDelta();

			// wireframe
			this.mesh.wireframe.material.uniforms.timeline.value = this.mesh.material.uniforms.timeline.value;
			this.mesh.wireframe.material.uniforms.time.value = this.mesh.material.uniforms.time.value;

			if(this.mouseProjection)
			{
				this.mesh.material.uniforms.mouse.value = this.mouseProjection;
				// this.mesh.wireframe.material.uniforms.mouse.value = this.mouseProjection;
			}
			
			// this.mesh.material.uniforms.fogNear.value = this._sceneModel.fogNear;
			// this.mesh.material.uniforms.fogFar.value = this._sceneModel.fogFar;
		}
	}

	show(delay = 0)
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
		
		// if(!this.tlShow)
		{
			this._reset();

			if(this.tlShow) this.tlShow.kill();

			this.tlShow = new TimelineLite({onStart: this._reset.bind(this)});
			this.tlShow.delay(delay);

			var duration = this._sceneModel.duration * 1;

			this.tlShow.to(this.mesh.wireframe.material.uniforms.noiseScale, duration / 2, {value: this._sceneModel.toNoiseScale, ease: Quart.easeOut}, "start");
			this.tlShow.to(this.mesh.wireframe.material.uniforms.noiseThresholding, duration, {value: this._sceneModel.toNoiseThresholding, ease: Quart.easeOut}, "start");
			this.tlShow.to(this.mesh.wireframe.material.uniforms.noiseStrength, duration, {value: this._sceneModel.toNoiseStrength, ease: Quart.easeOut}, "start");
			this.tlShow.to(this.mesh.wireframe.material.uniforms.noiseTranslation.value, duration, {x: this._sceneModel.toNoiseTranslationX, y: this._sceneModel.toNoiseTranslationY, ease: Quart.easeOut}, "start");

			var d = 0.2;
			this.tlShow.to(this.mesh.material.uniforms.noiseScale, duration / 2, {value: this._sceneModel.toNoiseScale, ease: Quart.easeOut, delay: d}, "start");
			this.tlShow.to(this.mesh.material.uniforms.noiseThresholding, duration, {value: this._sceneModel.toNoiseThresholding, ease: Quart.easeOut, delay: d}, "start");
			this.tlShow.to(this.mesh.material.uniforms.noiseStrength, duration, {value: this._sceneModel.toNoiseStrength, ease: Quart.easeOut, delay: d}, "start");
			this.tlShow.to(this.mesh.material.uniforms.noiseTranslation.value, duration, {x: this._sceneModel.toNoiseTranslationX, y: this._sceneModel.toNoiseTranslationY, ease: Quart.easeOut, delay: d}, "start");

			this.tlShow.to(this, 2, {rotation: 2 * Math.PI, ease: Expo.easeOut}, "start");

			// points
			if(this._points)
			{
				this.tlShow.to(this._points.material.uniforms.uOpacity, 3, {value: 1, ease: Quart.easeOut}, "start+=0.5");
				// this.tlShow.to(this._points.material.uniforms.uSize, 2, {value: this._sceneModel.pointSize, ease: Quart.easeOut}, "start+=0.2");
			}
		}
		// else
		// 	this.tlShow.restart(delay);
	}

	_reset()
	{
		this.rotation = 0;
		this.timeline = 0;

		// main mesh
		this.mesh.material.uniforms.orientation.value = 1;

		this.mesh.material.uniforms.noiseThresholding.value = this._sceneModel.fromNoiseThresholding;
		this.mesh.material.uniforms.noiseScale.value = this._sceneModel.fromNoiseScale;
		this.mesh.material.uniforms.noiseStrength.value = this._sceneModel.fromNoiseStrength;

		this.mesh.material.uniforms.noiseTranslation.value.x = this._sceneModel.fromNoiseTranslationX;
		this.mesh.material.uniforms.noiseTranslation.value.y = this._sceneModel.fromNoiseTranslationY;
		
		this.mesh.material.uniforms.noiseInverted.value = 0;

		// wireframe
		this.mesh.wireframe.material.uniforms.noiseThresholding.value = this._sceneModel.fromNoiseThresholding;
		this.mesh.wireframe.material.uniforms.noiseScale.value = this._sceneModel.fromNoiseScale;
		this.mesh.wireframe.material.uniforms.noiseStrength.value = this._sceneModel.fromNoiseStrength;

		this.mesh.wireframe.material.uniforms.noiseTranslation.value.x = this._sceneModel.fromNoiseTranslationX;
		this.mesh.wireframe.material.uniforms.noiseTranslation.value.y = this._sceneModel.fromNoiseTranslationY;
		
		this.mesh.wireframe.material.uniforms.noiseInverted.value = 0;

		this.rotation = -Math.PI / 2;

		if(this._points)
		{
			this._points.material.uniforms.uSize.value = 20;
			this._points.material.uniforms.uOpacity.value = 0;
		}
	}

	hide(delay = 0)
	{
		this.mesh.position.z = -1;

		if(this.tlShow)
			this.tlShow.pause();

		// if(!this.tlHide)
		{
			this.tlHide = new TimelineLite({onComplete: () => 
			{
				if(this.mesh.parent)
					this._scene.remove(this.mesh);
				
				if(this.mesh.wireframe && this.mesh.wireframe.parent)
					this._scene.remove(this.mesh.wireframe);

				if(this._points && this._points.parent)
					this._scene.remove(this._points);

				this.locked = true;
			}});

			this.mesh.material.uniforms.orientation.value = -1;

			this.mesh.wireframe.material.uniforms.noiseInverted.value = 1;
			this.mesh.material.uniforms.noiseInverted.value = 1;

			this.tlHide.delay(delay);

			this.tlHide.to(this, 2, {rotation: 4 * Math.PI, ease: Quart.easeOut}, "start");
			// this.tlHide.to(this, 5, {timeline: 0, ease: Expo.easeOut}, "start");

			var duration = this._sceneModel.duration * 2/3;
			// this.tlHide.to(this.mesh.wireframe.material.uniforms.noiseScale, duration, {value: this._sceneModel.fromNoiseScale, ease: Quart.easeOut}, "start");
			this.tlHide.to(this.mesh.wireframe.material.uniforms.noiseThresholding, duration, {value: this._sceneModel.fromNoiseThresholding, ease: Quart.easeOut}, "start");
			this.tlHide.to(this.mesh.wireframe.material.uniforms.noiseStrength, duration, {value: this._sceneModel.fromNoiseStrength, ease: Quart.easeOut}, "start");
			this.tlHide.to(this.mesh.wireframe.material.uniforms.noiseTranslation.value, duration, {x: this._sceneModel.fromNoiseTranslationX, y: this._sceneModel.fromNoiseTranslationY, ease: Quart.easeOut}, "start");

			var d = 0.1;
			// this.tlHide.to(this.mesh.material.uniforms.noiseScale, duration, {value: this._sceneModel.fromNoiseScale, ease: Quart.easeOut, delay: d}, "start");
			this.tlHide.to(this.mesh.material.uniforms.noiseThresholding, duration, {value: this._sceneModel.fromNoiseThresholding, ease: Quart.easeOut, delay: d}, "start");
			this.tlHide.to(this.mesh.material.uniforms.noiseStrength, duration, {value: this._sceneModel.fromNoiseStrength, ease: Quart.easeOut, delay: d}, "start");
			this.tlHide.to(this.mesh.material.uniforms.noiseTranslation.value, duration, {x: this._sceneModel.fromNoiseTranslationX, y: this._sceneModel.fromNoiseTranslationY, ease: Quart.easeOut, delay: d}, "start");

			// this.tlHide.to(this, 2, {rotation: Math.PI / 3, ease: Expo.easeInOut}, "start");

			// points
			if(this._points)
			{
				this.tlHide.to(this._points.material.uniforms.uOpacity, 0.3, {value: 0, ease: Quart.easeOut}, "start");
				// this.tlHide.to(this._points.material.uniforms.uSize, 0.3, {value: 0, ease: Quart.easeOut}, "start");
			}
		}
		// else
		// 	this.tlHide.restart(delay);
	}

	updateWireframe(color, opacity, linewidth)
	{
		if(this.mesh.wireframe)
		{
			this.mesh.wireframe.material.uniforms.diffuse.value.setHex(color);
			this.mesh.wireframe.material.uniforms.opacity.value = opacity;
			this.mesh.wireframe.material.wireframeLinewidth = linewidth;

			// this.mesh.wireframe.material.needsUpdate = true;
		}
	}
}