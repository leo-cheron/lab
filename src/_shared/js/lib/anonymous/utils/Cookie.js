Cookie = function() {};

Cookie.set = function(name, value, domain, path, hour)
{
	if (hour) 
	{
		var today = new Date();
		var expire = new Date();
		expire.setTime(today.getTime() + 3600000 * hour);
	}
	document.cookie = name + "=" + value + "; " + (hour ? ("expires=" + expire.toGMTString() + "; ") : "") + (path ? ("path=" + path + "; ") : "path=/; ") + (domain ? ("domain=" + domain + ";") : ("domain=" + window.location.host + ";"));
	return true;
};

Cookie.get = function(name)
{
	var r = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*)");
	var m = document.cookie.match(r);
	return (!m ? "" : m[1]);
};