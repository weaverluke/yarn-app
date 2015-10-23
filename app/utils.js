module.exports = {
	animateColor: animateColor,
	colorToString: colorToString,
	colorToObj: colorToObj,
	animateNumber: animateNumber
}

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

function animateNumber(conf) {
	var startDate = Date.now();
	var previousValue = conf.start;
	conf.ease || (conf.ease = numberEase);
	conf.stepTime || (conf.stepTime = 30);

	next();

	function next() {

		setTimeout(function () {
			var elapsedTime = Date.now() - startDate;
			var currentProgress = Math.min(elapsedTime / conf.duration, 1);
			var easeValue = conf.ease(currentProgress, elapsedTime, 0, 1, conf.duration);

			var newValue = Math.round(conf.start + (conf.end - conf.start) * easeValue);

			// do not repeat values
			if (newValue <= previousValue && newValue < conf.end) {
				newValue++;
			}
			previousValue = newValue;

			//console.log('animate number, newValue', newValue);
			conf.onChange(newValue);

			if (currentProgress !== 1 && newValue !== conf.end) {
				next();
			}
			else {
				conf.onFinish && conf.onFinish();
			}

		}, conf.stepTime);
	}
}

// ease out quad
function numberEase(x, t, b, c, d) {
	return -c *(t/=d)*(t-2) + b;
}
