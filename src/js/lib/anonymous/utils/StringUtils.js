StringUtils = module.exports = function() {};

StringUtils.strip_tags = function(input, allowed)
{
	allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
		commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
	return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1)
	{
		return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
	});
};

StringUtils.isMail = function(input)
{
	var string = input.val();
	var reg = new RegExp('^[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*@[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*[\.]{1}[a-z]{2,6}$', 'i');

	return reg.test(string);
};

StringUtils.isEmpty = function(input)
{
	var string = input.val().replace(" ", "");

	return string == "";
};

StringUtils.toTitleCase = function(string)
{
	return string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

/**
 * remove special chars of a string
 */
StringUtils.removeSpecialChar = function (source, removeSpaces)
{
	if(removeSpaces === undefined)
		removeSpaces = true;

	var specialChars = "()!$'?:,&+-.ŠŒŽšœžŸ¥µÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýÿ".split("");
	var regularChars = "------------SOZsozYYuAAAAAAACEEEEIIIIDNOOOOOOUUUUYsaaaaaaaceeeeiiiionoooooouuuuyy".split("");
	if(removeSpaces)
	{
		specialChars.push(" ");
		regularChars.push("-");
	}

	var splittedString = source.split("");
	var string = "";
	var i;
	var length = splittedString.length;
	for (i = 0; i < length; i++)
	{
		var char = splittedString[i];

		var index = specialChars.indexOf(char);
		if(index != -1)
			string += regularChars[index];
		else
			string += char;
	}
	return string;
};

StringUtils.randomString = function() 
{
	if (window.crypto) 
	{
		var a = window.crypto.getRandomValues(new Uint32Array(3)),
			token = '';
		for (var i = 0, l = a.length; i < l; i++) token += a[i].toString(36);

		return token;
	} else 
	{
		return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
	}
};