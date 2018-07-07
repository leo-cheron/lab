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
		this.streamVy = 0.9;

		//-----------------------------------------------------o baud

		this.baudX = 0.0;
		this.baudY = 0.0;

		//-----------------------------------------------------o noise

		this.noiseVx = 0.0;
		this.noiseVy = 0.4;
		this.noiseY = 1.2;
		this.noiseScale = 0.2;
		this.displayNoise = false;
	}
}