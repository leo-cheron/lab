export default class poissonDiscSampler
{
	constructor(width, height, radius)
	{
		this.k = 10, // maximum number of samples before rejection

		this.width = width;
		this.height = height;
		this.radius = radius;
		this.radius2 = radius * radius,
		this.R = 3 * this.radius2,
		this.cellSize = this.radius * Math.SQRT1_2,
		this.gridWidth = width / this.cellSize | 0 + 1,
		this.gridHeight = height / this.cellSize | 0 + 1,

		console.log("PoissonDiskSampler", this.width, this.height, this.cellSize );
		
		this.reset();
	}

	reset()
	{
		this.grid = new Array(this.gridWidth * this.gridHeight),
		this.queue = [],
		this.queueSize = 0,
		this.sampleSize = 0;
	}

	get()
	{
		if (!this.sampleSize) 
			return this.sample(0, 0);
			// return this.sample(this.width * .5, this.height * .5);

		// Pick a random existing sample and remove it from the queue.
		while (this.queueSize) 
		{
			var i = Math.random() * this.queueSize | 0,
				s = this.queue[i];

			// Make a new candidate between [radius, 2 * radius] from the existing sample.
			for (var j = 0; j < this.k; ++j) 
			{
				var a = 2 * Math.PI * Math.random(),
					r = Math.sqrt(Math.random() * this.R + this.radius2),
					x = s[0] + r * Math.cos(a),
					y = s[1] + r * Math.sin(a);

				// Reject candidates that are outside the allowed extent,
				// or closer than 2 * radius to any existing sample.
				if (0 <= x && x < this.width && 0 <= y && y < this.height && this.far(x, y)) 
					return this.sample(x, y);
			}

			this.queue[i] = this.queue[--this.queueSize];
			this.queue.length = this.queueSize;
		}
	}

	far(x, y) 
	{
		var i = x / this.cellSize | 0,
			j = y / this.cellSize | 0,
			i0 = Math.max(i - 2, 0),
			j0 = Math.max(j - 2, 0),
			i1 = Math.min(i + 3, this.gridWidth),
			j1 = Math.min(j + 3, this.gridHeight);

		for (j = j0; j < j1; ++j) 
		{
			var o = j * this.gridWidth;
			for (i = i0; i < i1; ++i) 
			{
				if (s = this.grid[o + i]) 
				{
					var s,
						dx = s[0] - x,
						dy = s[1] - y;
					if (dx * dx + dy * dy < this.radius2) return false;
				}
			}
		}

		return true;
	}

	sample(x, y) 
	{
		var s = [x, y];
		this.queue.push(s);
		this.grid[this.gridWidth * (y / this.cellSize | 0) + (x / this.cellSize | 0)] = s;
		++this.sampleSize;
		++this.queueSize;

		return s;
	}
}