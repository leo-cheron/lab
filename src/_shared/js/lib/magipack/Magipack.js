/**
 * 
 * Copyright (c) 2014 Keita Kuroki
 * Released under MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *  
 * For more information:
 * https://github.com/keitakun/Magipack.js
 * code@hellokeita.in
 * 
 **/

 
window.Magipack = (function() 
{
	window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
	Magipack.isIE = Boolean(document.all);
	var hasBlob = false;
	try
	{
		hasBlob = Boolean(Blob);
	}catch(e)
	{
		hasBlob = false;
	}
	Magipack.hasBlob = hasBlob;
	Magipack.version = '0.1';
	if(!Magipack.hasBlob)
	{
		var s = document.createElement('script');
		s.type = 'text/vbscript';
		s.text = '' + 
			'Function IEBinaryToArray_ByteStr(Binary)\n' +
			'	IEBinaryToArray_ByteStr = CStr(Binary)\n' +
			'End Function\n' +
			'Function IEBinaryToArray_ByteStr_Last(Binary)\n' +
			'	Dim lastIndex\n' +
			'	lastIndex = LenB(Binary)\n' +
			'	if lastIndex mod 2 Then\n' +
			'		IEBinaryToArray_ByteStr_Last = Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\n' +
			'	Else\n' +
			'		IEBinaryToArray_ByteStr_Last = ""\n' +
			'	End If\n' +
			'End Function';
		document.childNodes[document.childNodes.length - 1].appendChild(s);

		function GetIEByteArray_ByteStr(IEByteArray) 
		{
			var ByteMapping = {};
			for ( var i = 0; i < 256; i++ ) 
			{
				for ( var j = 0; j < 256; j++ ) 
				{
					ByteMapping[ String.fromCharCode( i + j * 256 ) ] = 
						String.fromCharCode(i) + String.fromCharCode(j);
				}
			}
			var rawBytes = IEBinaryToArray_ByteStr(IEByteArray);
			var lastChr = IEBinaryToArray_ByteStr_Last(IEByteArray);
			return rawBytes.replace(/[\s\S]/g, 
				function( match ) { return ByteMapping[match]; }) + lastChr;
		}
	}

	function b64encodeString(value)
	{
		var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
		chars = chars.split('');
		var l = value.length;
		var i = 0;
		var cb = b = 0;
		var bl = 0;
		var v = 0;
		var b0, b1, b2;
		var c0, c1, c2, c3;
		var ret = '';
		while(i < l)
		{
			b0 = value.charCodeAt(i + 0) & 0xFF;
			b1 = value.charCodeAt(i + 1) & 0xFF;
			b2 = value.charCodeAt(i + 2) & 0xFF;
			c0 = b0 >> 2 & 0x3F;
			c1 = (b0 << 4 | b1 >> 4) & 0x3F;
			c2 = (b1 << 2 | b2 >> 6) & 0x3F;
			c3 = b2 & 0x3F;

			ret += chars[c0] + chars[c1] + chars[c2] + chars[c3];
			i += 3;
		}

		i = l % 3;
		l = ret.length;
		if(i == 1)
		{
			ret = ret.substr(0, l - 2) + "==";
		}else if(i == 2)
		{
			ret = ret.substr(0, l - 1) + "=";
		}
		return ret;
	}
	function req()
	{
		if(window.XMLHttpRequest) return new XMLHttpRequest();
		if(window.ActiveXObject)return new ActiveXObject("MSXML2.XMLHTTP.3.0");
	}

	function Magipack(pack, config) {
		this.progress = 0;
		if(pack)
		{
			this.init(pack, config);
		}
	}

	Magipack.prototype._onProgress = function(e)
	{
		p = e.position / e.totalSize;
		if(isNaN(p)) p = 0;
		if(this._configComplete)
		{
			p = p * 0.9 + 0.1;
		}else{
			p *= 0.1;
		}
		this.progress = p;
		if(this.onProgress) this.onProgress(p, 1);
	};

	Magipack.prototype._loadFile = function(path, callback, type)
	{
		var xhr = req();
		if(!type)
		{
			type = 'arraybuffer';
			try
			{
				if(Blob.prototype.slice)
				{
					type = 'blob';
				}
			}catch(e)
			{
			}
		}

		xhr.open('GET', path, true);

		xhr.responseType = type;
		var _callback = callback;
		var _this = this;
		xhr.onprogress = function(e)
		{
			_this._onProgress(e);
		};
		xhr.onreadystatechange = function(e) 
		{
			if (this.readyState == 4) 
			{
				if(_callback) _callback.call(_this, this);
				this.onreadystatechange = null;
			}
		};

		xhr.send(null);
	};

	Magipack.prototype._configLoaded = function(e)
	{
		this._configComplete = true;
		this.config = eval('(' + e.responseText + ')');
		this._loadFile(this.pack, this._packLoaded);
	};

	Magipack.prototype._packLoaded = function(e)
	{
		if(!Magipack.hasBlob)
		{
			this.init(e.responseBody, this.config);
		}else
		{
			this.init(e.response, this.config);
		}
		if(this.onLoadComplete)
		{
			this.onLoadComplete(this);
		}
	};

	Magipack.prototype._findFile = function(name)
	{
		var i;
		i = this.config.length;
		while (i-- > 0)
		{
			if(this.config[i][0] == name)
			{
				return this.config[i];
			}
		}
		while (i-- > 0) 
		{
			if (name.indexOf(this.config[i][0]) >= 0) 
			{
				return this.config[i];
			}
		}
	};

	Magipack.prototype._getRange = function(i, e, type)
	{
		if (!Magipack.hasBlob) 
		{
			if (Magipack.isIE)
			{
				return 'data:' + type + ';base64,' + b64encodeString(this.ieBlob.substr(i, e - i));
			}
		}else 
		{
			var b;
			if(this.blob.slice)
			{
				b = this.blob.slice(i, e, type);
				return window.URL.createObjectURL(b);
			}else if (this.blob.webkitSlice)
			{
				b = this.blob.webkitSlice(i, e, type);
				return window.URL.createObjectURL(b);
			}else if(this.blob.mozSlice)
			{
				b = this.blob.mozSlice(i, e, type);
				return window.URL.createObjectURL(b);
			}
		}
	};

	Magipack.prototype.init = function(pack, config)
	{
		this.config = config;
		if(pack != null)
		{
			if(!Magipack.hasBlob)
			{
				this.ieBlob = GetIEByteArray_ByteStr(pack);
			}else
			{
				this.blob = new Blob([pack]);
			}
		}
	};

	Magipack.prototype.load = function(pack, config)
	{
		this.pack = pack;
		if(config)
		{
			this._loadFile(config, this._configLoaded, 'text');
		}else
		{
			this._loadFile(pack, this._packLoaded);
		}
	};

	Magipack.prototype.getURI = function()
	{
		if(arguments.length == 0) throw new Error('Not enough arguments.');
		if(isNaN(arguments[0]) && !this.config) throw new Error('No config file loaded.');

		var type;

		if(!isNaN(arguments[0]) && !isNaN(arguments[1]))
		{
			type = arguments[2];
			if(!type) type = 'text/plain';
			return this._getRange(arguments[0], arguments[1], type);
		}

		var file = this._findFile(arguments[0]);
		if(!file) throw new Error('File not found in pack.');
		type = file[3];
		if(!type) type = 'text/plain';

		return this._getRange(file[1], file[2], type);
	};

	Magipack.init = function(pack, config) 
	{
		if(this.inited) throw new Error('Magipack static instance already initialized.');
		this._instance = new Magipack(pack, config);
		if(pack)
		{
			this._instance.init(pack, config);
		}
		this.inited = true;
	};

	Magipack.load = function(pack, config) 
	{
		if(!this.inited) this.init();
		this._instance.onLoadComplete = this.onLoadComplete;
		this._instance.load(pack, config);
	};

	Magipack.getURI = function()
	{
		return this._instance.getURI.apply(this._instance, arguments);
	};

	return Magipack;

})();
