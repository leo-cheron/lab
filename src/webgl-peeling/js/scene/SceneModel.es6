/**
 * Controller
 * @constructor
 */
export default class SceneModel
{
	constructor()
	{
		this.disableSimplify = true;
		
		// animation
		this.lod = 1;
		this.timeline = 0;
		this.spring = 1;
		this.twist = 0;
		this.frictions = 0.2;
		this.randomize = 0;

		// this.spring = 0.35;
		// this.frictions = 0.65;

		// scene
		this.backgroundColor = 0xededed;
		this.fogNear = 4000;
		this.fogFar = 5500;

		// lights
		this.ambiantLight = 0x757575;
		this.mapAmbiantLight = 0xe9e9e9;
		this.spotIntensity = 0.62;
		this.shadowNear = 700;
		this.shadowFar = 5000;
		this.shadowBias = -0.001;

		// mesh
		// this.meshColor = 0xce1c48a; // phong
		this.meshColor = 0xcdb586;
		this.meshSpecular = 0x2f2f2f;
		this.wireframeColor = 0x404040;
		this.wireframeOpacity = 0.18;
		this.pointColor = 0x404040;
		this.MapPointColor = 0xAAAAAA;
		this.pointSize = 12;
		this.wireframeLineWidth = 1;

		// post processing
		// this.noise = true;
		// this.noiseIntensity = 1.0;

		// faces
		// this.facesMinRadius = 0;
		// this.facesMaxRadius = 1;

		// cursor
		this.mouseInteraction = false;
		this.mouseRadius = 180;
	}
}
