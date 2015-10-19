module.exports = {
	animateColor: animateColor,
	colorToString: colorToString,
	colorToObj: colorToObj
};

function animateColorStep(start, end, progress) {
	return {
		r: colorEase(start.r, end.r, progress),
		g: colorEase(start.g, end.g, progress),
		b: colorEase(start.b, end.b, progress)
	};
}

function colorEase(a,b,u) {
	return parseInt((1-u) * a + u * b);
}

function animateColor(conf) {
	var start = conf.start;
	var end = conf.end;
	var duration = conf.duration || 500;
	var stepTime = conf.stepTime || 50;

	var startTime = Date.now();
	fadeStep();

	function fadeStep() {
		var currentProgress = Math.min((Date.now() - startTime) / duration, 1);
		var color = animateColorStep(start, end, currentProgress);

		conf.onChange(color);

		if (currentProgress === 1) {
			conf.onFinish && conf.onFinish();
		}
		else {
			setTimeout(fadeStep, stepTime);
		}
	}
}

function colorToString(clr) {
	var alpha = 'a' in clr ? clr.a : 1;
	return 'rgba(' + clr.r + ',' + clr.g + ',' + clr.b + ',' + alpha + ')';
}

function colorToObj(clr) {
	var parts = clr.replace(/rgba?\(/, '').replace(')', '').replace(/ /g,'').split(',');

	var rgba = {
		r: parseInt(parts[0]),
		g: parseInt(parts[1]),
		b: parseInt(parts[2])
	};

	rgba.a = parts.length === 4 ? parseFloat(parts[4]) : 1;

	return rgba;
}
