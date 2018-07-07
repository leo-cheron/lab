/**
 * Controller
 * @constructor
 */
export default class SceneModel
{
	constructor()
	{

		//-----------------------------------------------------o air stream

		this.streamVx = 0.0;
		this.streamVy = 1.35;
		this.power = 0.1;

		//-----------------------------------------------------o noise

		this.noiseVx = 0.0;
		this.noiseVy = 0.4;
		this.noiseY = 1.2;
		this.noiseScale = 0.22;
		this.displayNoise = false;
	}
}