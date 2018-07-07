export default class Stage
{
	constructor() 
	{
	}

	static resize()
	{
		Stage.width = Stage.$window.width();
		Stage.height = Stage.$window.height();
	}
}

Stage.$window = $(window);
Stage.$document = $(document);
Stage.$body = $("body");

Stage.dpr = window.devicePixelRatio !== undefined ? window.devicePixelRatio : 1;