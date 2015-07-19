"use strict";

/**
 * Date: 29/10/13
 * Time: 14:06
 * @author Leo Cheron
 * @constructor
 */
var InteractiveElements = module.exports = function ()
{
	this.dom = $("#map");
	this._init();
};

InteractiveElements.prototype._init = function ()
{
	this._updateCount = 0;

	this._btns = [];
	this._btnsCount = MAP.points.length;
	this.dummies = $('<div class="dummies"></div>');
	this.btns = $('<div class="buttons"></div>');
	for (var i = 0; i < this._btnsCount; i++)
	{
		btn = this._createBtn(MAP.points[i]);
		if(!btn) continue;

		this.dummies.append(btn.dummy);		
		this.btns.append(btn);

		this._btns.push(btn);
	}
	this.dom.find(".wrapper").prepend(this.btns).prepend(this.dummies);
};

InteractiveElements.prototype._createBtn = function(data) 
{
	var pointTypes 	= 	["twitter", "instagram", "interview", "chapter", "river", "waterfall", "helico", "pan",  "location-rock", "location-lac"],
		cssTypes 	= 	["twitter", "instagram", "sound",     "chapter", "sea",   "waterfall", "hel",    "view", "rock",          "sea"],
		moduleTypes = 	[Module.TYPE_TWITTER, Module.TYPE_INSTAGRAM, Module.TYPE_INTERVIEW, "chapter", Module.TYPE_MULTICAM, Module.TYPE_MULTICAM, Module.TYPE_VIDEOPICKER, Module.TYPE_PAN, Module.TYPE_LOCATION, Module.TYPE_LOCATION];

	var index = pointTypes.indexOf(data.name);
	if(index == -1) return null; 

	var self = this,
	csstype = cssTypes[index],
	module = moduleTypes[index],
	btnWrapper;

	if(data.name == "chapter")
	{
		/*
		'<div class="display">'+
							'<div class="mask">'+
								'<p>title entry</p>'+
								'<span class="circle"></span>'+
								'<span class="line"></span>'+
							'</div>'+
						'</div>'+
		*/
		if(data.id != undefined && data.id < CHAPTERS.length)
		{
			var title = CHAPTERS[parseInt(data.id)].name+"";
			btnWrapper = $('<div class="btn-wrapper"><div class="title">' +
									'<div class="btn-title rotate"><p class="heading-4 heading-underlined">' + title.split("</span>").join("</span><br>") + '</p></div>'+
									'<span class="circle"></span>' +
									'<span class="line"></span>' +
							'</div></div>');
			btnWrapper.btn = btnWrapper.find(".rotate");
		}
	}
	else
	{
		var html = '<div class="btn-wrapper"><div class="rotate">';
		switch(data.type || data.name)
		{
			case Module.TYPE_TWITTER:
				var account = $("#twitter .twitter__account").eq(data.accountId - 1);
				var content = account.find(".list--tweets li").eq(data.id - 1);
				html +=	'<div class="tooltip tooltip--s">' +
							'<p class="meta-info">' + content.find('.meta-info').text() + '</p>' +
							'<p class="heading-1">' + account.find('.heading-1').text() + '</p>' +
							'<p>' + content.find('.teasing-4').html() + '</p>' +
						'</div>';
				break;
			case Module.TYPE_INSTAGRAM:
				var picture = $("#instagram__photos li").eq(data.id - 1);
				html +=	'<div class="tooltip tooltip--instagram tooltip--s tooltip--img">' +
							'<span class="temp" data-src="' + picture.attr("data-src") + '" ></span>' +
						'</div>';
				break;
			case Module.TYPE_INTERVIEW:
				var n = data.id < 10 ? "0" + data.id : data.id;
				html +=	'<div class="tooltip tooltip--interview tooltip--s tooltip--img">' +
							'<span class="btn btn--round btn--round--large"><i class="icon icon-hover icon-play-b"></i><i class="icon icon-play"></i></span>' +
							'<span class="temp" data-src="' + Config.IMAGE_PATH + "interview/" + n + '.jpg"></span>' +
						'</div>';
				break;
			case "helico":
				html +=	'<div class="tooltip tooltip--module tooltip--s tooltip--img">' +
							'<span class="temp" data-src="' + Config.IMAGE_PATH + 'popins/helicopter.jpg"></span>' +
						'</div>';
				break;
			case Module.TYPE_PAN:
				html +=	'<div class="tooltip tooltip--module tooltip--s tooltip--img">' +
							'<span class="temp" data-src="' + Config.IMAGE_PATH + 'popins/pan.jpg"></span>' +
						'</div>';
				break;
			case "location-lac": 
				html +=	'<div class="tooltip tooltip--module tooltip--s tooltip--img">' +
							'<span class="temp" data-src="' + Config.IMAGE_PATH + 'popins/lake.jpg"></span>' +
						'</div>';
				break;
			case "location-rock": 
				html +=	'<div class="tooltip tooltip--module tooltip--s tooltip--img">' +
							'<span class="temp" data-src="' + Config.IMAGE_PATH + 'popins/mountain.jpg"></span>' +
						'</div>';
				break;
			case "river": 
				html +=	'<div class="tooltip tooltip--module tooltip--s tooltip--img">' +
							'<span class="temp" data-src="' + Config.IMAGE_PATH + 'popins/river.jpg"></span>' +
						'</div>';
				break;
			case "waterfall": 
				html +=	'<div class="tooltip tooltip--module tooltip--s tooltip--img">' +
							'<span class="temp" data-src="' + Config.IMAGE_PATH + 'popins/waterfall.jpg"></span>' +
						'</div>';
				break;
		}

		html +=		'<div class="btn btn--round btn--round--large"><i class="icon icon-hover icon-type-' + csstype + '-b"></i><i class="icon icon-type-' + csstype + '"></i></div>' +
				'</div></div>';

		btnWrapper = $(html);
		btnWrapper.tooltip = btnWrapper.find(".tooltip");
		btnWrapper.btn = btnWrapper.find(".rotate");
	}

	if(!btnWrapper) return null;

	btnWrapper.type = data.name;
	btnWrapper.prevOffset = {left: 0, right: 0};
	if(data.name == "chapter")
		btnWrapper.dummy = $('<i class="chapter"></i>');
	/*else
		btnWrapper.dummy = $('<i></i>');*/

	if(TOUCH)
	{
		btnWrapper
			.on("singleTap", function(e)
			{
				if(btnWrapper.tooltip.shown)
				{
					btnWrapper.tooltip.shown = false;
					self._hideTooltip(btnWrapper.tooltip);
				}
				else
				{
					btnWrapper.tooltip.shown = true;
					self._displayTooltip(btnWrapper.tooltip);
				}
			})
			.on("doubleTap", function() 
			{
				self._onSelect(data);
			});

		if(btnWrapper.tooltip) 
			btnWrapper.tooltip.on("tap", function()
			{
				self._onSelect(data);
			});
	}
	else
	{
		btnWrapper
			.on(Event.CLICK, function(e)
			{
				self._onSelect(data);
			})
			.on(Event.ENTER, function(e)
			{
				self._displayTooltip(btnWrapper.tooltip);
			})
			.on(Event.LEAVE, function(e)
			{
				self._hideTooltip(btnWrapper.tooltip);
			});
	}

	// positionning
	//btn.dummy.css({top: data.y, left: data.x});
	var z = 3;
	for (var i = 0; i < data.z; i++) 
		z += 0.08;
	//z -= 0.08;

	if(btnWrapper.type == "chapter")
		btnWrapper.t = "translate3d(" + data.x + "px," + data.y + "px," + (1 + data.z * z) + "px)"; // rotateY(90deg) rotateZ(270deg)
	else
		btnWrapper.t = "translate3d(" + data.x + "px," + data.y + "px," + ((TOUCH ? 70 : 40) + data.z * z) + "px)";

	if(data.name == "chapter")
		Normalize.transform(btnWrapper.dummy[0], btnWrapper.t);	
	Normalize.transform(btnWrapper[0], btnWrapper.t);

	if(TOUCH) Normalize.transform(btnWrapper.btn[0], "rotateX(45deg)");

	return btnWrapper;
};

InteractiveElements.prototype._displayTooltip = function (tooltip)
{
	if(tooltip)
	{
		if(TOUCH) $(".tooltip").css("display", "none");
		tooltip.css("display", "block");
		tooltip.animate({opacity: 1}, 200, "ease-out");
		var temp = tooltip.find(".temp");
		if(temp.length)
			temp.replaceWith("<img src='" + temp.attr("data-src") + "'>");
	}
};

InteractiveElements.prototype._hideTooltip = function (tooltip)
{
	if(tooltip)
	{
		tooltip.animate({opacity: 0}, 200, "ease-out", function()
		{
			tooltip.css("display", "none");
		});
	}
}

InteractiveElements.prototype._onSelect = function(data) 
{
	var self = this;
	switch(data.type || data.name)
	{
		case Module.TYPE_TWITTER:
			self.dom.trigger(TrackedPoint.SELECT, [Module.TYPE_TWITTER, data.accountId]);
			break;
		case Module.TYPE_INSTAGRAM:
			self.dom.trigger(TrackedPoint.SELECT, [Module.TYPE_INSTAGRAM]);
			break;
		case Module.TYPE_INTERVIEW:
			self.dom.trigger(TrackedPoint.SELECT, [Module.TYPE_INTERVIEW, data.id]);
			break;
		case Module.TYPE_MULTICAM:
			self.dom.trigger(TrackedPoint.SELECT, [Module.TYPE_MULTICAM, data.id]);
			break;
		case Module.TYPE_VIDEOPICKER:
			self.dom.trigger(TrackedPoint.SELECT, [Module.TYPE_VIDEOPICKER, data.id]);
			break;
		case Module.TYPE_LOCATION:
			self.dom.trigger(TrackedPoint.SELECT, [Module.TYPE_LOCATION, data.id]);
			break;
		case Module.TYPE_PAN:
			self.dom.trigger(TrackedPoint.SELECT, [Module.TYPE_PAN]);
			break;
		case Module.TYPE_CHAPTER:
			self.dom.trigger(TrackedPoint.SELECT, [Module.TYPE_CHAPTER, CHAPTERS[parseInt(data.id)].frame]);
			break;
		case "location-lac": 
		case "location-rock": 
			//console.log("this is id -- "+data.id);
			self.dom.trigger(TrackedPoint.SELECT, [Module.TYPE_LOCATION, data.id]);
			break;
		case "river": 
		case "waterfall": 
			self.dom.trigger(TrackedPoint.SELECT, [Module.TYPE_MULTICAM, data.id]);
			break;
		case "helico": 
			self.dom.trigger(TrackedPoint.SELECT, [Module.TYPE_VIDEOPICKER]);
			break;
	}
};

InteractiveElements.prototype.show = function() 
{
	this._shown = true;
	this.btns.css("display", "block");
	this.btns.animate({"opacity": 1}, 1000, "cubic-bezier(0.165, 0.840, 0.440, 1.000)");
};

InteractiveElements.prototype.hide = function() 
{
	var self = this;
	this._shown = false;
	this.btns.animate({"opacity": 0}, 300, "ease-out", function()
	{
		self.btns.css("display", "none");
	});
};

InteractiveElements.prototype.update = function (rx, ry, now)
{
	if(this._shown || now)
	{		
		var frq = TOUCH ? 4 : 2;
		if(this._updateCount++ == frq || now)
		{
			this._updateCount = 0;
			for (var i = 0, l = this._btns.length; i < l; ++i) 
			{
				var btnWrapper = this._btns[i];
				//if(!i) console.log("InteractiveElements.js", btn.offset().left, btn.offset().top);
				/*if(btn.type != "chapter")
				{*/

					/*var offset = btn.dummy.offset();
					//var yPos = getComputedStyle(btn.dummy[0]);

					var dx = offset.left - btn.prevOffset.left;
					if(dx < 0) dx *= -1;
					var dy = offset.top - btn.prevOffset.top;
					if(dy < 0) dy *= -1;

					if(dx > 0.05 || dy > 0.05)
					{
						if(btn.type != "chapter")
						{
							//if(i > 10 && i < 20)
							//Normalize.transform(btn[0], "translate3d(" + (offset.left) + "px," + (offset.top) + "px,0px)");			
						}
						else
						{
							//Normalize.transform(btn[0], "translate3d(" + (offset.left + 5) + "px," + (offset.top + 5) + "px,1px)");
						}
						//Normalize.transform(btn[0], "translate3d(" + (100+Math.random() * 200) + "px," + (100+Math.random() * 200) + "px,1px)");
					}*/

					//Normalize.transform(btnWrapper[0], btnWrapper.t + "rotateX(" + ( 270 ) + "deg) rotateY(" + (ry) + "deg) rotateZ(" + (0) + "deg)");
					//Normalize.transform(btnWrapper.btn[0], "rotateY(" + (0 ) + "deg) rotateZ(" + (0) + "deg) rotateX(" + (90 - rx) + "deg)");

					Normalize.transform(btnWrapper[0], btnWrapper.t + "rotateX(" + 270 + "deg) rotateY(" + ry + "deg)");
					if(!TOUCH) Normalize.transform(btnWrapper.btn[0], "rotateX(" + (90 - rx) + "deg)");

				//	btn.prevOffset = offset;
				//}
			};
		}
	}

	//console.log("TEST ", getComputedStyle(this._btns[3].dummy[0], null).webkitTransform, this._btns[3].dummy.offset().top);
};