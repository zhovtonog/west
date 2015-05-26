;
(function () {
	$.fn.jqDrag = function (h, ops) {
		return i(this, h, ops, 'd');
	};
	$.fn.jqDragOff = function (h) {
		return i(this, h);
	};
	$.fn.jqResize = function (h, ops) {
		return i(this, h, ops, 'r');
	};
	$.jqDnR = {
		dnr: {},
		e: 0,
		drag: function (v) {
			var css = M.k == 'd' ? {
				left: Math.max(M.rangex[0], Math.min(M.rangex[1], M.X + v.pageX - M.pX)),
				top: Math.max(M.rangey[0], Math.min(M.rangey[1], M.Y + v.pageY - M.pY))
			} : {
				width: Math.min(M.rangex[1], Math.max(v.pageX - M.pX + M.W, M.rangex[0])),
				height: Math.min(M.rangey[1], Math.max(v.pageY - M.pY + M.H, M.rangey[0]))
			};
			if (M.ops.onDrag && M.ops.onDrag.apply(M.ops, [v, css]) === false) return false;
			E.css(css);
			return false;
		},
		stop: function (v) {
			if (M.ops.onStop) M.ops.onStop.apply(M.ops, [v]);
			$(document).off('mousemove', J.drag).off('mouseup', J.stop);
		},
		mousedown: function (v) {
			var d = v.data,
				p = {};
			E = d.e;
			if (E.css('position') != 'relative') {
				try {
					E.position(p);
				} catch (e) {}
			}
			if (d.ops.onStart) d.ops.onStart.apply(d.ops, [v]);
			M = {
				X: p.left || f('left') || 0,
				Y: p.top || f('top') || 0,
				W: f('width') || E[0].scrollWidth || 0,
				H: f('height') || E[0].scrollHeight || 0,
				pX: v.pageX,
				pY: v.pageY,
				k: d.k,
				ops: d.ops,
				rangex: d.ops.rangex || [0, 0xffff],
				rangey: d.ops.rangey || [0, 0xffff]
			};
			$(document).mousemove($.jqDnR.drag).mouseup($.jqDnR.stop);
			return false;
		}
	};
	var J = $.jqDnR,
		M = J.dnr,
		E = J.e,
		i = function (e, h, ops, k) {
			return e.each(function () {
				h = (h) ? $(h, e) : e;
				h.on('mousedown.jqDnR', {
					e: e,
					k: k,
					ops: ops || {}
				}, $.jqDnR.mousedown).addClass('draggable');
			});
		},
		j = function (e, h) {
			return e.each(function () {
				h = (h) ? $(h, e) : e;
				h.off('mousedown.jqDnR', $.jqDnR.mousedown).removeClass('draggable');
			});
		},
		f = function (k) {
			return parseInt(E.css(k)) || false;
		};
	$.effects = $.effects || {};
	var classAnimationActions = ['add', 'remove', 'toggle'],
		shorthandStyles = {
			border: 1,
			borderBottom: 1,
			borderColor: 1,
			borderLeft: 1,
			borderRight: 1,
			borderTop: 1,
			borderWidth: 1,
			margin: 1,
			padding: 1
		};

	function getElementStyles() {
		var style = document.defaultView ? document.defaultView.getComputedStyle(this, null) : this.currentStyle,
			newStyle = {},
			key, camelCase;
		if (style && style.length && style[0] && style[style[0]]) {
			var len = style.length;
			while (len--) {
				key = style[len];
				if (typeof style[key] == 'string') {
					camelCase = key.replace(/\-(\w)/g, function (all, letter) {
						return letter.toUpperCase();
					});
					newStyle[camelCase] = style[key];
				}
			}
		} else {
			for (key in style) {
				if (typeof style[key] === 'string') {
					newStyle[key] = style[key];
				}
			}
		}
		return newStyle;
	}

	function filterStyles(styles) {
		var name, value;
		for (name in styles) {
			value = styles[name];
			if (value == null || $.isFunction(value) || name in shorthandStyles || (/scrollbar/).test(name) || (!(/color/i).test(name) && isNaN(parseFloat(value)))) {
				delete styles[name];
			}
		}
		return styles;
	}

	function styleDifference(oldStyle, newStyle) {
		var diff = {
				_: 0
			},
			name;
		for (name in newStyle) {
			if (oldStyle[name] != newStyle[name]) {
				diff[name] = newStyle[name];
			}
		}
		return diff;
	}
	$.effects.animateClass = function (value, duration, easing, callback) {
		if ($.isFunction(easing)) {
			callback = easing;
			easing = null;
		}
		return this.queue('fx', function () {
			var that = $(this),
				originalStyleAttr = that.attr('style') || ' ',
				originalStyle = filterStyles(getElementStyles.call(this)),
				newStyle, className = that.attr('className');
			$.each(classAnimationActions, function (i, action) {
				if (value[action]) {
					that[action + 'Class'](value[action]);
				}
			});
			newStyle = filterStyles(getElementStyles.call(this));
			that.attr('className', className);
			that.animate(styleDifference(originalStyle, newStyle), duration, easing, function () {
				$.each(classAnimationActions, function (i, action) {
					if (value[action]) {
						that[action + 'Class'](value[action]);
					}
				});
				if (typeof that.attr('style') == 'object') {
					that.attr('style').cssText = '';
					that.attr('style').cssText = originalStyleAttr;
				} else {
					that.attr('style', originalStyleAttr);
				}
				if (callback) {
					callback.apply(this, arguments);
				}
			});
			var queue = $.queue(this),
				anim = queue.splice(queue.length - 1, 1)[0];
			queue.splice(1, 0, anim);
			$.dequeue(this);
		});
	};
	$.fn.extend({
		_addClass: $.fn.addClass,
		addClass: function (classNames, speed, easing, callback) {
			return speed ? $.effects.animateClass.apply(this, [{
				add: classNames
			}, speed, easing, callback]) : this._addClass(classNames);
		},
		_removeClass: $.fn.removeClass,
		removeClass: function (classNames, speed, easing, callback) {
			return speed ? $.effects.animateClass.apply(this, [{
				remove: classNames
			}, speed, easing, callback]) : this._removeClass(classNames);
		},
		_toggleClass: $.fn.toggleClass,
		toggleClass: function (classNames, force, speed, easing, callback) {
			if (typeof force == "boolean" || force === undefined) {
				if (!speed) {
					return this._toggleClass(classNames, force);
				} else {
					return $.effects.animateClass.apply(this, [(force ? {
						add: classNames
					} : {
						remove: classNames
					}), speed, easing, callback]);
				}
			} else {
				return $.effects.animateClass.apply(this, [{
					toggle: classNames
				}, force, speed, easing]);
			}
		},
		switchClass: function (remove, add, speed, easing, callback) {
			return $.effects.animateClass.apply(this, [{
				add: add,
				remove: remove
			}, speed, easing, callback]);
		},
		jq2Html: function () {
			if (!$(this)) return this;
			return $('<span/>').append(this).html();
		}
	});
})();;
(function ($) {
	jQuery.fn.draggable = function (options) {
		options = jQuery.extend({
			distance: 0,
			draggingClass: "dnd_dragging"
		}, options);
		var offset, margins, startPos, downEvt, helper, passedDistance, dropTargets, currentDropTarget, draggable, tmpOpts = [];
		jQuery(this).on("mousedown.draggable", function (e) {
			if (jQuery(this).hasClass(options.draggingClass) || (helper && passedDistance) || e.metaKey || e.shiftKey || e.ctrlKey) return;
			draggable = jQuery(this);
			margins = {
				left: (parseInt(draggable.css("marginLeft"), 10) || 0),
				top: (parseInt(draggable.css("marginTop"), 10) || 0)
			};
			offset = draggable.offset();
			offset = {
				top: e.pageY - offset.top + margins.top,
				left: e.pageX - offset.left + margins.left
			};
			if (jQuery.isFunction(options.helper)) {
				helper = options.helper.call(draggable, function (option, value) {
					options[option] = value;
					tmpOpts.push(option);
				});
				if (!helper) throw ("DOM node not returned from helper function");
			} else helper = draggable.clone();
			helper.addClass(options.draggingClass).css({
				position: "absolute"
			});
			startPos = {
				top: e.pageY - offset.top + "px",
				left: e.pageX - offset.left + "px"
			};
			jQuery(document).on("mousemove.draggable", drag).on("mouseup.draggable", dragup);
			dropTargets = [];
			var targets = jQuery.dd.targets.join(",");
			if (targets.length > 0) {
				jQuery(targets).each(function (i) {
					var self = jQuery(this);
					var opts = self.data("drop_options");
					if (opts.accept) {
						var accept = opts.accept.split(" ");
						var allow = false;
						$.each(accept, function (k, v) {
							if (draggable.is(v)) allow = true;
						});
						if (!allow) return;
					}
					var o = self.offset();
					dropTargets.push({
						x: o.left,
						y: o.top,
						width: self.outerWidth(),
						height: self.outerHeight(),
						el: self,
						index: i,
						options: opts
					});
				});
			}
			downEvt = e;
			e.preventDefault();
		});

		function drag(e) {
			if (!passedDistance) {
				if (Math.max(Math.abs(downEvt.pageX - e.pageX), Math.abs(downEvt.pageY - e.pageY)) >= options.distance) {
					passedDistance = true;
					if (options.cursorAt) {
						if (options.cursorAt.top) offset.top = options.cursorAt.top + margins.top;
						if (options.cursorAt.left) offset.left = options.cursorAt.left + margins.left;
					}
					helper.appendTo("body");
				} else return;
				if (options.dragStartNotifier) {
					options.dragStartNotifier.apply(this, [draggable, helper]);
				}
			}
			helper.css({
				top: e.pageY - offset.top + "px",
				left: e.pageX - offset.left + "px"
			});
		}

		function dragup(e) {
			jQuery(document).off("mousemove.draggable", drag).off("mouseup.draggable", dragup);
			currentDropTarget = getDropTarget(e);
			if (currentDropTarget) {
				helper.remove();
				currentDropTarget.el.removeClass(currentDropTarget.options.hoverClass);
				if (jQuery.isFunction(currentDropTarget.options.drop)) {
					currentDropTarget.options.drop.call(currentDropTarget.el, {
						helper: helper,
						draggable: draggable,
						position: {
							x: e.pageX,
							y: e.pageY
						}
					});
				}
				cleanUpVars();
			} else {
				helper.animate(startPos, function () {
					jQuery(this).remove();
				});
				cleanUpVars();
			}
			if (options.dragEndNotifier)
				options.dragEndNotifier.apply(this, [draggable, helper]);
		}

		function cleanUpVars() {
			jQuery.each(tmpOpts, function () {
				delete options[this];
			});
			tmpOpts = [];
			offset = margins = startPos = downEvt = helper = passedDistance = dropTargets = currentDropTarget = draggable = null;
		}

		function getDropTarget(e) {
			var topLayer = 0;
			var currentDropTarget = false;
			jQuery.each(dropTargets, function (ix, target) {
				var unknownLayer = target.el.closest('.tw2gui_window').css('z-index');
				if (e.pageX > target.x && e.pageX < target.x + target.width && (e.pageY > target.y && e.pageY < target.y + target.height)) {
					if (topLayer < unknownLayer) {
						topLayer = unknownLayer;
						currentDropTarget = target;
					}
				}
			});
			if (currentDropTarget) {
				$('.tw2gui_window').each(function (ix, window) {
					window = $(window);
					var target = {
						x: window.offset().left,
						y: window.offset().top,
						width: window.outerWidth(),
						height: window.outerHeight(),
						layer: window.css('z-index')
					};
					if (e.pageX > target.x && e.pageX < target.x + target.width && (e.pageY > target.y && e.pageY < target.y + target.height)) {
						if (topLayer < target.layer) {
							topLayer = 0;
							currentDropTarget = false;
							return false;
						}
					}
				});
			}
			return currentDropTarget;
		}
		if (jQuery.browser.msie) {
			jQuery(this).attr('unselectable', 'on');
		}
		return this;
	};
	jQuery.fn.droppable = function (options) {
		options = jQuery.extend({
			hoverClass: 'draghovered'
		}, options);
		var self = jQuery(this);
		self.data("drop_options", options);
		jQuery.dd.targets.push(this.selector);
		return this;
	};
	jQuery.dd = {
		targets: []
	};
	$.fn.setDraggable = function (startNotifier, endNotifier) {
		$(this).addClass('dnd_draggable');
		$(this).draggable({
			helper: function () {
				$('.dnd_dropzone').removeClass('dnd_dropped');
				$('.dnd_draggable').removeClass('dnd_dragElem');
				$(this).addClass('dnd_dragElem');
				return $(this).clone();
			},
			dragStartNotifier: startNotifier,
			dragEndNotifier: endNotifier,
			distance: 10
		});
		return $(this);
	}
	$.fn.asDropzone = function (acceptSelector, destroyDragElem, callbackFunc) {
		$(this).addClass('dnd_dropzone');
		$(this).droppable({
			accept: acceptSelector || '*',
			drop: function () {
				$(this).addClass('dnd_dropped');
				if (destroyDragElem) {
					$(this).append($('.dnd_dragElem'));
					$('.dnd_dragging').remove();
				}
				callbackFunc.call(this, $('.dnd_dragElem'));
				$(this).data('dnd_droppedObj', $('.dnd_dragElem').removeClass('dnd_dragElem'));
				$('.dnd_dragElem').removeClass('dnd_dragElem');
			}
		});
	}
})(jQuery);;
(function () {
	$.fn.wheel = function (fn) {
		return this[fn ? "bind" : "trigger"]("wheel", fn);
	};
	$.event.special.wheel = {
		setup: function () {
			$.event.add(this, wheelEvents, wheelHandler, {});
		},
		teardown: function () {
			$.event.remove(this, wheelEvents, wheelHandler);
		}
	};
	var wheelEvents = !$.browser.mozilla ? "mousewheel" : "DOMMouseScroll" + ($.browser.version < "1.9" ? " mousemove" : "");

	function wheelHandler(event) {
		switch (event.type) {
		case "mousemove":
			return $.extend(event.data, {
				clientX: event.clientX,
				clientY: event.clientY,
				pageX: event.pageX,
				pageY: event.pageY
			});
		case "DOMMouseScroll":
			$.extend(event, event.data);
			event.delta = -event.detail / 3;
			break;
		case "mousewheel":
			event.delta = event.wheelDelta / 120;
			if ($.browser.opera && $.browser.version < 9.2) event.delta *= -1;
			break;
		}
		event.type = "wheel";
		return $.event.handle.call(this, event, event.delta);
	};
})();;
(function ($) {
	var types = ['DOMMouseScroll', 'mousewheel'];
	if ($.event.fixHooks) {
		for (var i = types.length; i;) {
			$.event.fixHooks[types[--i]] = $.event.mouseHooks;
		}
	}
	$.event.special.mousewheel = {
		setup: function () {
			if (this.addEventListener) {
				for (var i = types.length; i;) {
					this.addEventListener(types[--i], handler, false);
				}
			} else {
				this.onmousewheel = handler;
			}
		},
		teardown: function () {
			if (this.removeEventListener) {
				for (var i = types.length; i;) {
					this.removeEventListener(types[--i], handler, false);
				}
			} else {
				this.onmousewheel = null;
			}
		}
	};
	$.fn.extend({
		mousewheel: function (fn) {
			return fn ? this.on("mousewheel", fn) : this.trigger("mousewheel");
		},
		unmousewheel: function (fn) {
			return this.off("mousewheel", fn);
		}
	});

	function handler(event) {
		var orgEvent = event || window.event,
			args = [].slice.call(arguments, 1),
			delta = 0,
			returnValue = true,
			deltaX = 0,
			deltaY = 0;
		event = $.event.fix(orgEvent);
		event.type = "mousewheel";
		if (orgEvent.wheelDelta) {
			delta = orgEvent.wheelDelta / 120;
		}
		if (orgEvent.detail) {
			delta = -orgEvent.detail / 3;
		}
		deltaY = delta;
		if (orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS) {
			deltaY = 0;
			deltaX = -1 * delta;
		}
		if (orgEvent.wheelDeltaY !== undefined) {
			deltaY = orgEvent.wheelDeltaY / 120;
		}
		if (orgEvent.wheelDeltaX !== undefined) {
			deltaX = -1 * orgEvent.wheelDeltaX / 120;
		}
		args.unshift(event, delta, deltaX, deltaY);
		return ($.event.dispatch || $.event.handle).apply(this, args);
	}
})(jQuery);

(function ($, window, undefined) {
	'$:nomunge';
	var elems = $([]),
		jq_resize = $.resize = $.extend($.resize, {}),
		timeout_id, str_setTimeout = 'setTimeout',
		str_resize = 'resize',
		str_data = str_resize + '-special-event',
		str_delay = 'delay',
		str_throttle = 'throttleWindow';
	jq_resize[str_delay] = 250;
	jq_resize[str_throttle] = false;
	$.event.special[str_resize] = {
		setup: function () {
			if (!jq_resize[str_throttle] && this[str_setTimeout]) {
				return false;
			}
			var elem = $(this);
			elems = elems.add(elem);
			$.data(this, str_data, {
				w: elem.width(),
				h: elem.height()
			});
			if (elems.length === 1) {
				loopy();
			}
		},
		teardown: function () {
			if (!jq_resize[str_throttle] && this[str_setTimeout]) {
				return false;
			}
			var elem = $(this);
			elems = elems.not(elem);
			elem.removeData(str_data);
			if (!elems.length) {
				clearTimeout(timeout_id);
			}
		},
		add: function (handleObj) {
			if (!jq_resize[str_throttle] && this[str_setTimeout]) {
				return false;
			}
			var old_handler;

			function new_handler(e, w, h) {
				var elem = $(this),
					data = $.data(this, str_data);
				data.w = w !== undefined ? w : elem.width();
				data.h = h !== undefined ? h : elem.height();
				old_handler.apply(this, arguments);
			};
			if ($.isFunction(handleObj)) {
				old_handler = handleObj;
				return new_handler;
			} else {
				old_handler = handleObj.handler;
				handleObj.handler = new_handler;
			}
		}
	};

	function loopy() {
		timeout_id = window[str_setTimeout](function () {
			$.triggerResizeEvent();
			loopy();
		}, jq_resize[str_delay]);
	};
	$.triggerResizeEvent = function () {
		elems.each(function () {
			var elem = $(this),
				width = elem.width(),
				height = elem.height(),
				data = $.data(this, str_data);
			if (width !== data.w || height !== data.h) {
				elem.trigger(str_resize, [data.w = width, data.h = height]);
			}
		});
	};
})(jQuery, this);

(function ($, undefined) {
	(function () {
		var baseEasings = {};
		$.each(["Quad", "Cubic", "Quart", "Quint", "Expo"], function (i, name) {
			baseEasings[name] = function (p) {
				return Math.pow(p, i + 2);
			};
		});
		$.extend(baseEasings, {
			Sine: function (p) {
				return 1 - Math.cos(p * Math.PI / 2);
			},
			Circ: function (p) {
				return 1 - Math.sqrt(1 - p * p);
			},
			Elastic: function (p) {
				return p === 0 || p === 1 ? p : -Math.pow(2, 8 * (p - 1)) * Math.sin(((p - 1) * 80 - 7.5) * Math.PI / 15);
			},
			Back: function (p) {
				return p * p * (3 * p - 2);
			},
			Bounce: function (p) {
				var pow2, bounce = 4;
				while (p < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {}
				return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - p, 2);
			}
		});
		$.each(baseEasings, function (name, easeIn) {
			$.easing["easeIn" + name] = easeIn;
			$.easing["easeOut" + name] = function (p) {
				return 1 - easeIn(1 - p);
			};
			$.easing["easeInOut" + name] = function (p) {
				return p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn(p * -2 + 2) / 2;
			};
		});
	})();
})(jQuery);

(function (global) {
	var namespace = function (name, value) {
		var parts = name.split('.'),
			scope = global,
			i, len = parts.length;
		for (i = 0; i < len; i++) {
			scope = scope[parts[i]] = scope[parts[i]] || (i == len - 1 && value || {});
		}
		return scope;
	};
	var callsParent = /var x/.test(function () {
		var x;
	}) ? /callParent/ : /\.*/;
	var createWrapper = function (name, value, base) {
		return function () {
			var ret;
			this.callParent = base.prototype[name];
			ret = value.apply(this, arguments);
			this.callParent = null;
			return ret;
		};
	};
	var createClass = function (base, properties) {
		var ctor, prototype, i, Class, property;
		ctor = function () {};
		ctor.prototype = base && base.prototype;
		prototype = new ctor;
		prototype._super = base;
		for (i in properties) {
			property = properties[i];
			if (typeof prototype[i] === 'function' && typeof property === 'function' && callsParent.test(property)) {
				prototype[i] = createWrapper(i, property, base);
			} else {
				prototype[i] = properties[i];
			}
		}
		Class = function () {
			if (prototype.init) this.init.apply(this, arguments);
		};
		Class.prototype = prototype;
		Class.prototype.constructor = Class;
		return Class;
	};
	namespace('west', {
		namespace: namespace,
		createClass: createClass,
		define: function (name, base, properties) {
			if ('string' === typeof base) {
				base = this.get(base);
			}
			namespace(name, createClass(base, properties));
		},
		get: function (name) {
			var namespace = window,
				parts = name.split('.'),
				i;
			for (i = 0; i < parts.length; i++) {
				namespace = namespace[parts[i]];
				if ('undefined' === typeof namespace) {
					break;
				}
			}
			return namespace;
		},
		getClosestTree: function (name) {
			var new_namespace = window,
				parts = name.split('.'),
				steps = [],
				i;
			for (i = 0; i < parts.length; i++) {
				new_namespace = new_namespace[parts[i]];
				if ('undefined' === typeof new_namespace) {
					break;
				} else {
					steps.push(new_namespace);
				}
			}
			return steps;
		},
		getClosest: function (name) {
			var tree = this.getClosestTree(name);
			return tree.pop();
		},
		instanciateSingle: function (path, name, options) {
			options = options || {};
			if ('string' === typeof path) {
				path = path.split('.');
			}
			if ($.isPlainObject(name)) {
				options = name;
				name = null;
			}
			name = name || 'controller';
			var path_id = path.pop();
			path = this.get(path.join('.'));
			if (path && path[path_id] && path[path_id][name]) {
				path[path_id] = new path[path_id][name](options);
				return path[path_id];
			}
			return undefined;
		}
	});
}(window));

function _(text) {
	return text.substr((text.indexOf('|') || 0) + 1);
}

function s(text) {
	for (var i = 1; i < arguments.length; i++) {
		text = text.split('%' + i).join(arguments[i]);
	}
	return text;
}

function ntext(singular, plural, value) {
	if (value == 1) return singular;
	return plural;
}

function gendertext(male, female, gender) {
	gender = gender || Character.getGender();
	return gender === 'male' ? male : female;
}

function round_number(number, max_length) {
	max_length = max_length || 3;
	var units = ['', 'К', 'М', 'Г', 'Т'],
		count = Math.ceil(Math.abs(max_length / 3)) - 1,
		len = Math.ceil(Math.abs(parseInt(number).toString().length / 3)) - 1,
		power = len > count ? len - count : 0,
		calculateNewNumber = function (num, pow) {
			return Math.round(num / Math.pow(1000, pow));
		},
		result = calculateNewNumber(number, power),
		ret = '';
	if (0 === result && power) {
		power += -1;
		result = calculateNewNumber(number, power);
	}
	if (result * Math.pow(1000, power) != number) {
		ret += String('\u2248');
	}
	ret += result + units[power];
	return ret;
}

function format_number(number, thousands_separator) {
	if (!/\d+/.test(number.toString())) {
		return number;
	}
	thousands_separator = thousands_separator || '.';
	var num;
	num = number.toString().match(/(=?(?:\d+\.?\d*)|$)/ig)[0];
	number = number.toString().split(num);
	num = num.split('.');
	var decimal_separator = '.',
		prefix = number[0],
		suffix = number[1],
		int = num[0].split(/(?=(?:\d{3})+(?:$))/g),
		frac = num[1];
	return prefix + int.join(thousands_separator) + (frac && frac.length ? (decimal_separator + frac) : '') + suffix;
}

function deformat_number(number, thousands_separator) {
	if ('number' === typeof number) {
		return number;
	}
	thousands_separator = thousands_separator || '.';
	var decimal_separator = '.',
		num;
	num = number.replace(new RegExp('[' + thousands_separator + ']+', 'g'), '').match(new RegExp('[0-9' + decimal_separator + ']+', 'g'))[0];
	if (!!~num.indexOf(decimal_separator)) {
		num = parseFloat(num.replace(decimal_separator, '.'));
	} else {
		num = parseInt(num);
	}
	return num;
}

function format_money(number, TZ) {
	return format_number(number, TZ);
}

function deformat_money(number, TZ) {
	return deformat_number(number, TZ);
}

function isDateWithin(start, end, check) {
	var c = check instanceof Date ? check : Date.parse(check);
	return (c >= Date.parse(start) && c <= Date.parse(end));
}

function to_cdn(path) {
	return Game.cdnURL ? Game.cdnURL + '/' + path : path;
}

function showlink(url) {
	url = url.unescapeHTML();
	if (url.match(/^https?:\/\/([^\/]*\.|)(youtube|twitter|google|yahoo|the-west|wikipedia)\.(tr|com|de|co\.uk|net|org|pl|nl|se|ro|com\.pt|cz|es|ru|com\.br|hu|gr|dk|sk|fr|it|no\.com)(\/|$)/)) {
		window.open(url);
	} else {
		var $content = $('<div>' +
			"Эта ссылка ведёт на внешний сайт. Внешние сайты могут содержать вирусы и прочую гадость." + "<ul>" + "<li style='font-weight: bold;'>" + "Никогда не вводи свой игровой пароль на внешних сайтах." + "</li>" + "<li>" + "Иди по ссылке только если ты доверяешь игроку, приславшему тебе эту ссылку." + "</li>" + "</ul>" +
			"Пойти по ссылке:" + "<br />" + "<div style='text-align:center;margin:15px 0 0;font-size:16pt;'><b></b></div>" + '</div>');
		$('b', $content).text(url);
		new west.gui.Dialog("Внешняя ссылка", "", west.gui.Dialog.SYS_WARNING).setText($content).addButton("Следовать", function () {
			window.open(url, '_blank');
		}).addButton("cancel").show();
	}
}

function sextext(maleText, femaleText, gender) {
	gender = gender.toLowerCase();
	if (gender == 'male' || gender == 'man') return maleText;
	else return femaleText;
}

function wopen(obj) {
	obj.target = '_blank';
}

function ollisEgg() {
	return "deltaover 896'##\"ok\"'";
}

function get_throbber(withoutText) {
	return $('<div class="throbber">' + '<img src="https://westrus.innogamescdn.com/images/throbber2.gif" alt="' + 'Идёт загрузка'.escapeHTML() + '" />' +
		(withoutText ? '' : 'Идёт загрузка') + '</div>');
}

function isDefined(variable) {
	if (typeof variable == 'undefined' || variable == null) {
		return false;
	} else {
		return true;
	}
}

function countObjectKeys(obj) {
	var count = 0;
	if (Object && Object.keys) {
		count = Object.keys(obj).length;
	} else {
		jQuery.each(obj, function () {
			count++;
		});
	}
	return count;
}

function clone(src) {
	if (src === undefined || typeof src !== 'object' || src === null) {
		return src;
	}
	if (Array.isArray(src)) {
		return src.slice();
	}
	var trg = {};
	for (var i in src) {
		if (!src.hasOwnProperty(i)) continue;
		trg[i] = clone(src[i]);
	}
	return trg;
}

function jq2Html(jqObject) {
	if (!$(jqObject)) return jqObject;
	return $('<span/>').append(jqObject).html();
}

function littleGauss(n) {
	return (n * (n + 1)) / 2;
}

function get_server_date(delta) {
	return new Date(new Date().getTime() + Game.serverTimeDifference - Game.clientTimedrift + (delta === undefined ? 0 : delta));
}

function get_server_date_string(noday, timeinfo, isabsolute) {
	var srvTimer = isabsolute ? new Date(timeinfo) : get_server_date(timeinfo);
	var pad = function (x) {
		return x < 10 ? '0' + x : x;
	}
	var srvDay = pad(srvTimer.getDate());
	var srvMonth = pad(srvTimer.getMonth() + 1);
	var srvYear = srvTimer.getFullYear();
	var srvHours = pad(srvTimer.getHours());
	var srvMinutes = pad(srvTimer.getMinutes());
	var srvSeconds = pad(srvTimer.getSeconds());
	var srvDateText = srvHours + ':' + srvMinutes + ':' + srvSeconds;
	if (noday) return srvDateText;
	return srvDateText + ' ' + srvDay + '/' + srvMonth + '/' + srvYear;
}

function handleOpenWindowRequest(w) {
		var windows = [];
		var m = window.location.search.match(/igw=([a-z.]+)/);
		var s = window.location.search.substring(1).split('&');
		if (s.length) {
			var c = {};
			for (var i = 0; i < s.length; i++) {
				var parts = s[i].split('=');
				c[unescape(parts[0])] = unescape(parts[1]);
			}
		}
		if (m) windows = windows.concat(m[1].split(/\./));
		if (w) windows = windows.concat(w);
		if (!windows.length) return;
		windows.each(function (m) {
			switch (m) {
			case "report":
				if (c['report_id'] && c['hash'])
					ReportWindow.open(c['report_id'], c['hash']);
				else
					MessagesWindow.open('report');
				break;
			case "telegram":
				if (c['telegramid'])
					MessagesWindow.Telegram.open(c['telegramid']);
				else
					MessagesWindow.open();
				break;
			case "fort":
				if (c['id'] && c['x'] && c['y'])
					FortWindow.open(c['id'], c['x'], c['y']);
				else
					FortOverviewWindow.open();
				break;
			case "forum":
				ForumWindow.open();
				break;
			case "fortoverview":
				FortOverviewWindow.open();
				break;
			case 'shop':
				west.window.shop.open('igw');
				break;
			case 'inventory':
				Wear.open();
				break;
			case 'duel':
				DuelsWindow.open();
				break;
			case 'character':
				CharacterWindow.open();
				break;
			case 'friend':
				FriendslistWindow.open();
				break;
			case 'saloon':
				QuestSaloonWindow.open();
				break;
			case 'adventures':
				MultiplayerWindow.open();
				break;
			case 'multiplayer':
				west.window.multiplayer.open();
				break;
			}
		});
	}
	(function () {
		var fns = {};
		window.batch = function (fn, timeout, identifier) {
			var key, timeoutReference;
			timeout = timeout || 5000;
			timeoutReference = window.setTimeout(function () {
				fn();
				delete fns[key];
			}, timeout);
			key = identifier || ('batch-' + timeoutReference);
			if (fns[key]) {
				window.clearTimeout(fns[key]);
			}
			fns[key] = timeoutReference;
			return key;
		};
	})();

function br2nl(str) {
	return str.replace(/<br\s*\/?>/mg, "\n");
}

function nl2br(str) {
		return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
	}
	(function () {
		function g(o) {
			console.log("$f.fireEvent", [].slice.call(o))
		}

		function k(q) {
			if (!q || typeof q != "object") {
				return q
			}
			var o = new q.constructor();
			for (var p in q) {
				if (q.hasOwnProperty(p)) {
					o[p] = k(q[p])
				}
			}
			return o
		}

		function m(t, q) {
			if (!t) {
				return
			}
			var o, p = 0,
				r = t.length;
			if (r === undefined) {
				for (o in t) {
					if (q.call(t[o], o, t[o]) === false) {
						break
					}
				}
			} else {
				for (var s = t[0]; p < r && q.call(s, p, s) !== false; s = t[++p]) {}
			}
			return t
		}

		function c(o) {
			return document.getElementById(o)
		}

		function i(q, p, o) {
			if (typeof p != "object") {
				return q
			}
			if (q && p) {
				m(p, function (r, s) {
					if (!o || typeof s != "function") {
						q[r] = s
					}
				})
			}
			return q
		}

		function n(s) {
			var q = s.indexOf(".");
			if (q != -1) {
				var p = s.slice(0, q) || "*";
				var o = s.slice(q + 1, s.length);
				var r = [];
				m(document.getElementsByTagName(p), function () {
					if (this.className && this.className.indexOf(o) != -1) {
						r.push(this)
					}
				});
				return r
			}
		}

		function f(o) {
			o = o || window.event;
			if (o.preventDefault) {
				o.stopPropagation();
				o.preventDefault()
			} else {
				o.returnValue = false;
				o.cancelBubble = true
			}
			return false
		}

		function j(q, o, p) {
			q[o] = q[o] || [];
			q[o].push(p)
		}

		function e() {
			return "_" + ("" + Math.random()).slice(2, 10)
		}
		var h = function (t, r, s) {
			var q = this,
				p = {},
				u = {};
			q.index = r;
			if (typeof t == "string") {
				t = {
					url: t
				}
			}
			i(this, t, true);
			m(("Begin*,Start,Pause*,Resume*,Seek*,Stop*,Finish*,LastSecond,Update,BufferFull,BufferEmpty,BufferStop").split(","), function () {
				var v = "on" + this;
				if (v.indexOf("*") != -1) {
					v = v.slice(0, v.length - 1);
					var w = "onBefore" + v.slice(2);
					q[w] = function (x) {
						j(u, w, x);
						return q
					}
				}
				q[v] = function (x) {
					j(u, v, x);
					return q
				};
				if (r == -1) {
					if (q[w]) {
						s[w] = q[w]
					}
					if (q[v]) {
						s[v] = q[v]
					}
				}
			});
			i(this, {
				onCuepoint: function (x, w) {
					if (arguments.length == 1) {
						p.embedded = [null, x];
						return q
					}
					if (typeof x == "number") {
						x = [x]
					}
					var v = e();
					p[v] = [x, w];
					if (s.isLoaded()) {
						s._api().fp_addCuepoints(x, r, v)
					}
					return q
				},
				update: function (w) {
					i(q, w);
					if (s.isLoaded()) {
						s._api().fp_updateClip(w, r)
					}
					var v = s.getConfig();
					var x = (r == -1) ? v.clip : v.playlist[r];
					i(x, w, true)
				},
				_fireEvent: function (v, y, w, A) {
					if (v == "onLoad") {
						m(p, function (B, C) {
							if (C[0]) {
								s._api().fp_addCuepoints(C[0], r, B)
							}
						});
						return false
					}
					A = A || q;
					if (v == "onCuepoint") {
						var z = p[y];
						if (z) {
							return z[1].call(s, A, w)
						}
					}
					if (y && "onBeforeBegin,onMetaData,onStart,onUpdate,onResume".indexOf(v) != -1) {
						i(A, y);
						if (y.metaData) {
							if (!A.duration) {
								A.duration = y.metaData.duration
							} else {
								A.fullDuration = y.metaData.duration
							}
						}
					}
					var x = true;
					m(u[v], function () {
						x = this.call(s, A, y, w)
					});
					return x
				}
			});
			if (t.onCuepoint) {
				var o = t.onCuepoint;
				q.onCuepoint.apply(q, typeof o == "function" ? [o] : o);
				delete t.onCuepoint
			}
			m(t, function (v, w) {
				if (typeof w == "function") {
					j(u, v, w);
					delete t[v]
				}
			});
			if (r == -1) {
				s.onCuepoint = this.onCuepoint
			}
		};
		var l = function (p, r, q, t) {
			var o = this,
				s = {},
				u = false;
			if (t) {
				i(s, t)
			}
			m(r, function (v, w) {
				if (typeof w == "function") {
					s[v] = w;
					delete r[v]
				}
			});
			i(this, {
				animate: function (y, z, x) {
					if (!y) {
						return o
					}
					if (typeof z == "function") {
						x = z;
						z = 500
					}
					if (typeof y == "string") {
						var w = y;
						y = {};
						y[w] = z;
						z = 500
					}
					if (x) {
						var v = e();
						s[v] = x
					}
					if (z === undefined) {
						z = 500
					}
					r = q._api().fp_animate(p, y, z, v);
					return o
				},
				css: function (w, x) {
					if (x !== undefined) {
						var v = {};
						v[w] = x;
						w = v
					}
					r = q._api().fp_css(p, w);
					i(o, r);
					return o
				},
				show: function () {
					this.display = "block";
					q._api().fp_showPlugin(p);
					return o
				},
				hide: function () {
					this.display = "none";
					q._api().fp_hidePlugin(p);
					return o
				},
				toggle: function () {
					this.display = q._api().fp_togglePlugin(p);
					return o
				},
				fadeTo: function (y, x, w) {
					if (typeof x == "function") {
						w = x;
						x = 500
					}
					if (w) {
						var v = e();
						s[v] = w
					}
					this.display = q._api().fp_fadeTo(p, y, x, v);
					this.opacity = y;
					return o
				},
				fadeIn: function (w, v) {
					return o.fadeTo(1, w, v)
				},
				fadeOut: function (w, v) {
					return o.fadeTo(0, w, v)
				},
				getName: function () {
					return p
				},
				getPlayer: function () {
					return q
				},
				_fireEvent: function (w, v, x) {
					if (w == "onUpdate") {
						var z = q._api().fp_getPlugin(p);
						if (!z) {
							return
						}
						i(o, z);
						delete o.methods;
						if (!u) {
							m(z.methods, function () {
								var B = "" + this;
								o[B] = function () {
									var C = [].slice.call(arguments);
									var D = q._api().fp_invoke(p, B, C);
									return D === "undefined" || D === undefined ? o : D
								}
							});
							u = true
						}
					}
					var A = s[w];
					if (A) {
						var y = A.apply(o, v);
						if (w.slice(0, 1) == "_") {
							delete s[w]
						}
						return y
					}
					return o
				}
			})
		};

		function b(q, G, t) {
			var w = this,
				v = null,
				D = false,
				u, s, F = [],
				y = {},
				x = {},
				E, r, p, C, o, A;
			i(w, {
				id: function () {
					return E
				},
				isLoaded: function () {
					return (v !== null && v.fp_play !== undefined && !D)
				},
				getParent: function () {
					return q
				},
				hide: function (H) {
					if (H) {
						q.style.height = "0px"
					}
					if (w.isLoaded()) {
						v.style.height = "0px"
					}
					return w
				},
				show: function () {
					q.style.height = A + "px";
					if (w.isLoaded()) {
						v.style.height = o + "px"
					}
					return w
				},
				isHidden: function () {
					return w.isLoaded() && parseInt(v.style.height, 10) === 0
				},
				load: function (J) {
					if (!w.isLoaded() && w._fireEvent("onBeforeLoad") !== false) {
						var H = function () {
							u = q.innerHTML;
							if (u && !flashembed.isSupported(G.version)) {
								q.innerHTML = ""
							}
							if (J) {
								J.cached = true;
								j(x, "onLoad", J)
							}
							flashembed(q, G, {
								config: t
							})
						};
						var I = 0;
						m(a, function () {
							this.unload(function (K) {
								if (++I == a.length) {
									H()
								}
							})
						})
					}
					return w
				},
				unload: function (J) {
					if (this.isFullscreen() && /WebKit/i.test(navigator.userAgent)) {
						if (J) {
							J(false)
						}
						return w
					}
					if (u.replace(/\s/g, "") !== "") {
						if (w._fireEvent("onBeforeUnload") === false) {
							if (J) {
								J(false)
							}
							return w
						}
						D = true;
						try {
							if (v) {
								v.fp_close();
								w._fireEvent("onUnload")
							}
						} catch (H) {}
						var I = function () {
							v = null;
							q.innerHTML = u;
							D = false;
							if (J) {
								J(true)
							}
						};
						setTimeout(I, 50)
					} else {
						if (J) {
							J(false)
						}
					}
					return w
				},
				getClip: function (H) {
					if (H === undefined) {
						H = C
					}
					return F[H]
				},
				getCommonClip: function () {
					return s
				},
				getPlaylist: function () {
					return F
				},
				getPlugin: function (H) {
					var J = y[H];
					if (!J && w.isLoaded()) {
						var I = w._api().fp_getPlugin(H);
						if (I) {
							J = new l(H, I, w);
							y[H] = J
						}
					}
					return J
				},
				getScreen: function () {
					return w.getPlugin("screen")
				},
				getControls: function () {
					return w.getPlugin("controls")._fireEvent("onUpdate")
				},
				getLogo: function () {
					try {
						return w.getPlugin("logo")._fireEvent("onUpdate")
					} catch (H) {}
				},
				getPlay: function () {
					return w.getPlugin("play")._fireEvent("onUpdate")
				},
				getConfig: function (H) {
					return H ? k(t) : t
				},
				getFlashParams: function () {
					return G
				},
				loadPlugin: function (K, J, M, L) {
					if (typeof M == "function") {
						L = M;
						M = {}
					}
					var I = L ? e() : "_";
					w._api().fp_loadPlugin(K, J, M, I);
					var H = {};
					H[I] = L;
					var N = new l(K, null, w, H);
					y[K] = N;
					return N
				},
				getState: function () {
					return w.isLoaded() ? v.fp_getState() : -1
				},
				play: function (I, H) {
					var J = function () {
						if (I !== undefined) {
							w._api().fp_play(I, H)
						} else {
							w._api().fp_play()
						}
					};
					if (w.isLoaded()) {
						J()
					} else {
						if (D) {
							setTimeout(function () {
								w.play(I, H)
							}, 50)
						} else {
							w.load(function () {
								J()
							})
						}
					}
					return w
				},
				getVersion: function () {
					var I = "flowplayer.js 3.2.6";
					if (w.isLoaded()) {
						var H = v.fp_getVersion();
						H.push(I);
						return H
					}
					return I
				},
				_api: function () {
					if (!w.isLoaded()) {
						throw "Flowplayer " + w.id() + " not loaded when calling an API method"
					}
					return v
				},
				setClip: function (H) {
					w.setPlaylist([H]);
					return w
				},
				getIndex: function () {
					return p
				},
				_swfHeight: function () {
					return v.clientHeight
				}
			});
			m(("Click*,Load*,Unload*,Keypress*,Volume*,Mute*,Unmute*,PlaylistReplace,ClipAdd,Fullscreen*,FullscreenExit,Error,MouseOver,MouseOut").split(","), function () {
				var H = "on" + this;
				if (H.indexOf("*") != -1) {
					H = H.slice(0, H.length - 1);
					var I = "onBefore" + H.slice(2);
					w[I] = function (J) {
						j(x, I, J);
						return w
					}
				}
				w[H] = function (J) {
					j(x, H, J);
					return w
				}
			});
			m(("pause,resume,mute,unmute,stop,toggle,seek,getStatus,getVolume,setVolume,getTime,isPaused,isPlaying,startBuffering,stopBuffering,isFullscreen,toggleFullscreen,reset,close,setPlaylist,addClip,playFeed,setKeyboardShortcutsEnabled,isKeyboardShortcutsEnabled").split(","), function () {
				var H = this;
				w[H] = function (J, I) {
					if (!w.isLoaded()) {
						return w
					}
					var K = null;
					if (J !== undefined && I !== undefined) {
						K = v["fp_" + H](J, I)
					} else {
						K = (J === undefined) ? v["fp_" + H]() : v["fp_" + H](J)
					}
					return K === "undefined" || K === undefined ? w : K
				}
			});
			w._fireEvent = function (Q) {
				if (typeof Q == "string") {
					Q = [Q]
				}
				var R = Q[0],
					O = Q[1],
					M = Q[2],
					L = Q[3],
					K = 0;
				if (t.debug) {
					g(Q)
				}
				if (!w.isLoaded() && R == "onLoad" && O == "player") {
					v = v || c(r);
					o = w._swfHeight();
					m(F, function () {
						this._fireEvent("onLoad")
					});
					m(y, function (S, T) {
						T._fireEvent("onUpdate")
					});
					s._fireEvent("onLoad")
				}
				if (R == "onLoad" && O != "player") {
					return
				}
				if (R == "onError") {
					if (typeof O == "string" || (typeof O == "number" && typeof M == "number")) {
						O = M;
						M = L
					}
				}
				if (R == "onContextMenu") {
					m(t.contextMenu[O], function (S, T) {
						T.call(w)
					});
					return
				}
				if (R == "onPluginEvent" || R == "onBeforePluginEvent") {
					var H = O.name || O;
					var I = y[H];
					if (I) {
						I._fireEvent("onUpdate", O);
						return I._fireEvent(M, Q.slice(3))
					}
					return
				}
				if (R == "onPlaylistReplace") {
					F = [];
					var N = 0;
					m(O, function () {
						F.push(new h(this, N++, w))
					})
				}
				if (R == "onClipAdd") {
					if (O.isInStream) {
						return
					}
					O = new h(O, M, w);
					F.splice(M, 0, O);
					for (K = M + 1; K < F.length; K++) {
						F[K].index++
					}
				}
				var P = true;
				if (typeof O == "number" && O < F.length) {
					C = O;
					var J = F[O];
					if (J) {
						P = J._fireEvent(R, M, L)
					}
					if (!J || P !== false) {
						P = s._fireEvent(R, M, L, J)
					}
				}
				m(x[R], function () {
					P = this.call(w, O, M);
					if (this.cached) {
						x[R].splice(K, 1)
					}
					if (P === false) {
						return false
					}
					K++
				});
				return P
			};

			function B() {
				if ($f(q)) {
					$f(q).getParent().innerHTML = "";
					p = $f(q).getIndex();
					a[p] = w
				} else {
					a.push(w);
					p = a.length - 1
				}
				A = parseInt(q.style.height, 10) || q.clientHeight;
				E = q.id || "fp" + e();
				r = G.id || E + "_api";
				G.id = r;
				t.playerId = E;
				if (typeof t == "string") {
					t = {
						clip: {
							url: t
						}
					}
				}
				if (typeof t.clip == "string") {
					t.clip = {
						url: t.clip
					}
				}
				t.clip = t.clip || {};
				if (q.getAttribute("href", 2) && !t.clip.url) {
					t.clip.url = q.getAttribute("href", 2)
				}
				s = new h(t.clip, -1, w);
				t.playlist = t.playlist || [t.clip];
				var I = 0;
				m(t.playlist, function () {
					var K = this;
					if (typeof K == "object" && K.length) {
						K = {
							url: "" + K
						}
					}
					m(t.clip, function (L, M) {
						if (M !== undefined && K[L] === undefined && typeof M != "function") {
							K[L] = M
						}
					});
					t.playlist[I] = K;
					K = new h(K, I, w);
					F.push(K);
					I++
				});
				m(t, function (K, L) {
					if (typeof L == "function") {
						if (s[K]) {
							s[K](L)
						} else {
							j(x, K, L)
						}
						delete t[K]
					}
				});
				m(t.plugins, function (K, L) {
					if (L) {
						y[K] = new l(K, L, w)
					}
				});
				if (!t.plugins || t.plugins.controls === undefined) {
					y.controls = new l("controls", null, w)
				}
				y.canvas = new l("canvas", null, w);
				u = q.innerHTML;

				function J(L) {
					var K = w.hasiPadSupport && w.hasiPadSupport();
					if (/iPad|iPhone|iPod/i.test(navigator.userAgent) && !/.flv$/i.test(F[0].url) && !K) {
						return true
					}
					if (!w.isLoaded() && w._fireEvent("onBeforeClick") !== false) {
						w.load()
					}
					return f(L)
				}

				function H() {
					if (u.replace(/\s/g, "") !== "") {
						if (q.addEventListener) {
							q.addEventListener("click", J, false)
						} else {
							if (q.attachEvent) {
								q.attachEvent("onclick", J)
							}
						}
					} else {
						if (q.addEventListener) {
							q.addEventListener("click", f, false)
						}
						w.load()
					}
				}
				setTimeout(H, 0)
			}
			if (typeof q == "string") {
				var z = c(q);
				if (!z) {
					throw "Flowplayer cannot access element: " + q
				}
				q = z;
				B()
			} else {
				B()
			}
		}
		var a = [];

		function d(o) {
			this.length = o.length;
			this.each = function (p) {
				m(o, p)
			};
			this.size = function () {
				return o.length
			}
		}
		window.flowplayer = window.$f = function () {
			var p = null;
			var o = arguments[0];
			if (!arguments.length) {
				m(a, function () {
					if (this.isLoaded()) {
						p = this;
						return false
					}
				});
				return p || a[0]
			}
			if (arguments.length == 1) {
				if (typeof o == "number") {
					return a[o]
				} else {
					if (o == "*") {
						return new d(a)
					}
					m(a, function () {
						if (this.id() == o.id || this.id() == o || this.getParent() == o) {
							p = this;
							return false
						}
					});
					return p
				}
			}
			if (arguments.length > 1) {
				var t = arguments[1],
					q = (arguments.length == 3) ? arguments[2] : {};
				if (typeof t == "string") {
					t = {
						src: t
					}
				}
				t = i({
					bgcolor: "#000000",
					version: [9, 0],
					expressInstall: "http://static.flowplayer.org/swf/expressinstall.swf",
					cachebusting: false
				}, t);
				if (typeof o == "string") {
					if (o.indexOf(".") != -1) {
						var s = [];
						m(n(o), function () {
							s.push(new b(this, k(t), k(q)))
						});
						return new d(s)
					} else {
						var r = c(o);
						return new b(r !== null ? r : o, t, q)
					}
				} else {
					if (o) {
						return new b(o, t, q)
					}
				}
			}
			return null
		};
		i(window.$f, {
			fireEvent: function () {
				var o = [].slice.call(arguments);
				var q = $f(o[0]);
				return q ? q._fireEvent(o.slice(1)) : null
			},
			addPlugin: function (o, p) {
				b.prototype[o] = p;
				return $f
			},
			each: m,
			extend: i
		});
		if (typeof jQuery == "function") {
			jQuery.fn.flowplayer = function (q, p) {
				if (!arguments.length || typeof arguments[0] == "number") {
					var o = [];
					this.each(function () {
						var r = $f(this);
						if (r) {
							o.push(r)
						}
					});
					return arguments.length ? o[arguments[0]] : new d(o)
				}
				return this.each(function () {
					$f(this, k(q), p ? k(p) : {})
				})
			}
		}
	})();
(function () {
	var e = typeof jQuery == "function";
	var i = {
		width: "100%",
		height: "100%",
		allowfullscreen: true,
		allowscriptaccess: "always",
		quality: "high",
		version: null,
		onFail: null,
		expressInstall: null,
		w3c: false,
		cachebusting: false
	};
	if (e) {
		jQuery.tools = jQuery.tools || {};
		jQuery.tools.flashembed = {
			version: "1.0.4",
			conf: i
		}
	}

	function j() {
		if (c.done) {
			return false
		}
		var l = document;
		if (l && l.getElementsByTagName && l.getElementById && l.body) {
			clearInterval(c.timer);
			c.timer = null;
			for (var k = 0; k < c.ready.length; k++) {
				c.ready[k].call()
			}
			c.ready = null;
			c.done = true
		}
	}
	var c = e ? jQuery : function (k) {
		if (c.done) {
			return k()
		}
		if (c.timer) {
			c.ready.push(k)
		} else {
			c.ready = [k];
			c.timer = setInterval(j, 13)
		}
	};

	function f(l, k) {
		if (k) {
			for (key in k) {
				if (k.hasOwnProperty(key)) {
					l[key] = k[key]
				}
			}
		}
		return l
	}

	function g(k) {
		switch (h(k)) {
		case "string":
			k = k.replace(new RegExp('(["\\\\])', "g"), "\\$1");
			k = k.replace(/^\s?(\d+)%/, "$1pct");
			return '"' + k + '"';
		case "array":
			return "[" + b(k, function (n) {
				return g(n)
			}).join(",") + "]";
		case "function":
			return '"function()"';
		case "object":
			var l = [];
			for (var m in k) {
				if (k.hasOwnProperty(m)) {
					l.push('"' + m + '":' + g(k[m]))
				}
			}
			return "{" + l.join(",") + "}"
		}
		return String(k).replace(/\s/g, " ").replace(/\'/g, '"')
	}

	function h(l) {
		if (l === null || l === undefined) {
			return false
		}
		var k = typeof l;
		return (k == "object" && l.push) ? "array" : k
	}
	if (window.attachEvent) {
		window.attachEvent("onbeforeunload", function () {
			__flash_unloadHandler = function () {};
			__flash_savedUnloadHandler = function () {}
		})
	}

	function b(k, n) {
		var m = [];
		for (var l in k) {
			if (k.hasOwnProperty(l)) {
				m[l] = n(k[l])
			}
		}
		return m
	}

	function a(r, t) {
		var q = f({}, r);
		var s = document.all;
		var n = '<object width="' + q.width + '" height="' + q.height + '"';
		if (s && !q.id) {
			q.id = "_" + ("" + Math.random()).substring(9)
		}
		if (q.id) {
			n += ' id="' + q.id + '"'
		}
		if (q.cachebusting) {
			q.src += ((q.src.indexOf("?") != -1 ? "&" : "?") + Math.random())
		}
		if (q.w3c || !s) {
			n += ' data="' + q.src + '" type="application/x-shockwave-flash"'
		} else {
			n += ' classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'
		}
		n += ">";
		if (q.w3c || s) {
			n += '<param name="movie" value="' + q.src + '" />'
		}
		q.width = q.height = q.id = q.w3c = q.src = null;
		for (var l in q) {
			if (q[l] !== null) {
				n += '<param name="' + l + '" value="' + q[l] + '" />'
			}
		}
		var o = "";
		if (t) {
			for (var m in t) {
				if (t[m] !== null) {
					o += m + "=" + (typeof t[m] == "object" ? g(t[m]) : t[m]) + "&"
				}
			}
			o = o.substring(0, o.length - 1);
			n += '<param name="flashvars" value=\'' + o + "' />"
		}
		n += "</object>";
		return n
	}

	function d(m, p, l) {
		var k = flashembed.getVersion();
		f(this, {
			getContainer: function () {
				return m
			},
			getConf: function () {
				return p
			},
			getVersion: function () {
				return k
			},
			getFlashvars: function () {
				return l
			},
			getApi: function () {
				return m.firstChild
			},
			getHTML: function () {
				return a(p, l)
			}
		});
		var q = p.version;
		var r = p.expressInstall;
		var o = !q || flashembed.isSupported(q);
		if (o) {
			p.onFail = p.version = p.expressInstall = null;
			m.innerHTML = a(p, l)
		} else {
			if (q && r && flashembed.isSupported([6, 65])) {
				f(p, {
					src: r
				});
				l = {
					MMredirectURL: location.href,
					MMplayerType: "PlugIn",
					MMdoctitle: document.title
				};
				m.innerHTML = a(p, l)
			} else {
				if (m.innerHTML.replace(/\s/g, "") !== "") {} else {
					m.innerHTML = "<h2>Flash version " + q + " or greater is required</h2><h3>" + (k[0] > 0 ? "Your version is " + k : "You have no flash plugin installed") + "</h3>" + (m.tagName == "A" ? "<p>Click here to download latest version</p>" : "<p>Download latest version from <a href='http://www.adobe.com/go/getflashplayer'>here</a></p>");
					if (m.tagName == "A") {
						m.onclick = function () {
							location.href = "http://www.adobe.com/go/getflashplayer"
						}
					}
				}
			}
		}
		if (!o && p.onFail) {
			var n = p.onFail.call(this);
			if (typeof n == "string") {
				m.innerHTML = n
			}
		}
		if (document.all) {
			window[p.id] = document.getElementById(p.id)
		}
	}
	window.flashembed = function (l, m, k) {
		if (typeof l == "string") {
			var n = document.getElementById(l);
			if (n) {
				l = n
			} else {
				c(function () {
					flashembed(l, m, k)
				});
				return
			}
		}
		if (!l) {
			return
		}
		if (typeof m == "string") {
			m = {
				src: m
			}
		}
		var o = f({}, i);
		f(o, m);
		return new d(l, o, k)
	};
	f(window.flashembed, {
		getVersion: function () {
			var m = [0, 0];
			if (navigator.plugins && typeof navigator.plugins["Shockwave Flash"] == "object") {
				var l = navigator.plugins["Shockwave Flash"].description;
				if (typeof l != "undefined") {
					l = l.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
					var n = parseInt(l.replace(/^(.*)\..*$/, "$1"), 10);
					var r = /r/.test(l) ? parseInt(l.replace(/^.*r(.*)$/, "$1"), 10) : 0;
					m = [n, r]
				}
			} else {
				if (window.ActiveXObject) {
					try {
						var p = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7")
					} catch (q) {
						try {
							p = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
							m = [6, 0];
							p.AllowScriptAccess = "always"
						} catch (k) {
							if (m[0] == 6) {
								return m
							}
						}
						try {
							p = new ActiveXObject("ShockwaveFlash.ShockwaveFlash")
						} catch (o) {}
					}
					if (typeof p == "object") {
						l = p.GetVariable("$version");
						if (typeof l != "undefined") {
							l = l.replace(/^\S+\s+(.*)$/, "$1").split(",");
							m = [parseInt(l[0], 10), parseInt(l[2], 10)]
						}
					}
				}
			}
			return m
		},
		isSupported: function (k) {
			var m = flashembed.getVersion();
			var l = (m[0] > k[0]) || (m[0] == k[0] && m[1] >= k[1]);
			return l
		},
		domReady: c,
		asString: g,
		getHTML: a
	});
	if (e) {
		jQuery.fn.flashembed = function (l, k) {
			var m = null;
			this.each(function () {
				m = flashembed(this, l, k)
			});
			return l.api === false ? this : m
		}
	}
})();

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

function getRandomSequence(min, max) {
	var tmp = [];
	var seq = [];
	for (var i = min; i <= max; ++i) tmp.push(i);
	do {
		seq.push(tmp.splice(getRandomInt(0, tmp.length - 1), 1)[0]);
	} while (0 < tmp.length);
	return seq;
};

function getRandomString(length) {
	return new Array(length).join().replace(/(.|$)/g, function () {
		return ((Math.random() * 26) | 0 + 10).toString(36);
	});
}

function buildDateObject(timeStr, isServerTime) {
	var regEx, match, d = new Date(0),
		today = new Date();
	regEx = /^(?:(3[01]|[012]?[0-9]|\*)\.(?:(1[012]|0?[1-9]|\*)\.((?:19|20)?\d\d|\*)))?(?: ?(2[0-3]|[01]?\d|\*)\:([0-5]?\d|\*)(?:\:([0-5]?\d|\*))?)?$/;
	if (match = timeStr.match(regEx)) {
		d.setMilliseconds(0);
		d.setSeconds(match[6] !== undefined ? (match[6] == '*' ? today.getSeconds() : match[6]) : 0);
		d.setMinutes(match[5] !== undefined ? (match[5] == '*' ? today.getMinutes() : match[5]) : 0);
		d.setHours(match[4] !== undefined ? (match[4] == '*' ? today.getHours() : match[4]) : 0);
		d.setDate(match[1] !== undefined ? (match[1] == '*' ? today.getDate() : parseInt(match[1], 10)) : today.getDate());
		d.setMonth(match[2] !== undefined ? (match[2] == '*' ? today.getMonth() : parseInt(match[2], 10) - 1) : today.getMonth());
		d.setFullYear(match[3] !== undefined ? (match[3] == '*' ? today.getFullYear() : parseInt(match[3], 10)) : today.getFullYear());
	}
	if (isServerTime) {
		d = new Date(d - Game.serverTimeDifference);
	}
	return d;
};

function buildTimestamp(timeStr, isServerTime) {
	return buildDateObject(timeStr, isServerTime).getTime();
};
west.namespace('west.common', {
	forEach: function (obj, cb, context, include) {
		var value;
		for (var i in obj) {
			if (!include && !obj.hasOwnProperty(i)) continue;
			value = cb.call(context, obj[i], i);
			if (false === value) {
				break;
			}
		}
	},
	some: function (obj, cb, context, include) {
		for (var i in obj) {
			if (!include && !obj.hasOwnProperty(i)) continue;
			if (cb.call(context, obj[i], i)) return true;
		}
		return false;
	},
	swap: function (a, b) {
		var tmp;
		this.forEach(a, function (val, key) {
			tmp = b[key];
			b[key] = val;
			a[key] = tmp;
		});
	},
	createObjKey: function (obj, key, val) {
		if (undefined === obj[key])
			obj[key] = val;
	},
	round: function (number, numberOfDecimals) {
		var aux = Math.pow(10, numberOfDecimals);
		return Math.round(number * aux) / aux;
	},
	floor: function (number, numberOfDecimals) {
		var aux = Math.pow(10, numberOfDecimals);
		return Math.floor(number * aux) / aux;
	},
	ceil: function (number, numberOfDecimals) {
		var aux = Math.pow(10, numberOfDecimals);
		return Math.ceil(number * aux) / aux;
	},
	countTo: function ($el, to, from, cb) {
		from = from || "" !== $el.text() && $el.text() || 0, cb = 'function' === typeof cb ? cb : function (val) {
			$el.text(Math.ceil(val));
		};
		jQuery({
			val: from
		}).animate({
			val: to
		}, {
			duration: 1000,
			easing: 'swing',
			step: function () {
				cb(this.val);
			},
			complete: function () {
				cb(to);
			}
		});
	},
	singularize: function (str) {
		if ('s' === str.slice(-1)) {
			str = str.slice(0, -1);
		}
		return str;
	},
	capitalize: function (str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	},
	pushIfUnique: function (array, item) {
		if (!~array.indexOf(item)) {
			array.push(item);
		}
		return array;
	},
	unshiftIfUnique: function (array, item) {
		if (!~array.indexOf(item)) {
			array.unshift(item);
		}
		return array;
	},
	removeFromArray: function (array, item) {
		var position = array.indexOf(item);
		if (!!~position) {
			array.splice(position, 1);
		}
		return array;
	}
});

function readCookie(name) {
	var nameEQ = escape(name) + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) === ' ')
			c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0)
			return unescape(c.substring(nameEQ.length, c.length));
	}
	return null;
}

var MousePopup = function (text, disableBg, type, handler, delay) {
	this.setXHTML(text);
	this.disableBg = disableBg;
	this.type = type;
	this.teaserTimeoutDelay = delay === undefined ? 1300 : delay + 1000;
	this.handler = handler;
	this.delay = delay === undefined ? 300 : delay;
	this.relativePosition = false;
	this.active = false;
};
MousePopup.prototype.updatePosition = function (e, resetText) {
	if (!this.active || resetText) {
		MousePopup.getEl().html(this.getXHTML());
	}
	var css = this.calculatePosition(e.clientX, e.clientY, e.target, this.type);
	MousePopup.getEl().css({
		top: css.top,
		left: css.left
	});
	if (!this.active) {
		this.active = true;
		this.setTimeout();
	}
	this.notify('onPosUpdate', [css, e]);
};
MousePopup.prototype.calculatePosition = function (x, y, targetEl, type) {
	var top, left, el = MousePopup.getEl(),
		refOffset;
	var scrollLeft, scrollTop, window_height, window_width, margin_bottom, margin_right;
	var height = el.height();
	var width = el.width();
	if (this.relativePosition) {
		refOffset = this.getPopupHolderOffset(targetEl);
		top = this.relativePosition.top + refOffset.top;
		left = this.relativePosition.left + refOffset.left;
	} else {
		scrollLeft = $(window).scrollLeft();
		scrollTop = $(window).scrollTop();
		window_height = window.Map && Map.height || $(window).height();
		margin_bottom = window_height - y;
		window_width = window.Map && Map.width || $(window).width();
		margin_right = window_width - x;
		if (margin_bottom < height + 20) {
			top = window_height - height - 10 + scrollTop;
		} else {
			top = y + scrollTop + 10;
		}
		if (x > (window_width / 2) && type) {
			left = x + scrollLeft - 20 - width;
		} else {
			if (margin_right > width + 25) {
				left = x + scrollLeft + 20;
			} else {
				left = x - 20 - width;
			}
		}
	}
	return {
		top: top,
		left: left,
		width: width,
		height: height
	};
};
MousePopup.prototype.getPopupHolderOffset = function (el) {
	while (el._mpopup !== this && el !== document.body) {
		el = el.parentNode;
	}
	return $(el).offset();
};
MousePopup.prototype.wrap = function (xhtml) {
	var result;
	if ($.type(xhtml) === "string") {
		result = xhtml;
		if (/(teaser_headline)/.test(result)) {
			result = result.replace(/<[^>]*teaser_content.*?>/i, '<div class="teaser_animation">&#8226;&#8226;&#8226;</div>$&')
			this.setTeaserTimeout();
		}
	} else if ($.isFunction(xhtml)) {
		try {
			result = xhtml();
		} catch (e) {
			if (window.DEBUG) console.log('error in MousePopup.wrap - xhtml function thrown an error: ', e);
		}
	} else if ($.isPlainObject(xhtml)) {
		result = '<div class="teaser_headline">' + xhtml.teaser + '</div><div class="teaser_animation">&#8226;&#8226;&#8226;</div><div class="teaser_content">' + xhtml.content + '</div>';
		this.setTeaserTimeout();
	} else {
		if (window.DEBUG) console.log('error in MousePopup.wrap - xhtml of unknown type: ', xhtml);
	}
	if (this.disableBg) {
		return result;
	}
	result = "<div class='tp_front'><div class='tw2gui_bg_tl'></div><div class='tw2gui_bg_tr'></div><div class='tw2gui_bg_bl'></div><div class='tw2gui_bg_br'></div></div>" + "<div class='popup_content'>" + "<table><tr><td>" + result + "</td></tr></table>" + "</div>";
	return result;
};
MousePopup.prototype.setXHTML = function (xhtml) {
	if ($.isPlainObject(xhtml) && !xhtml.teaser) {
		xhtml = xhtml.content;
	}
	this.text = xhtml;
	if (this.active) MousePopup.getEl().html(this.wrap(xhtml));
};
MousePopup.prototype.getXHTML = function (just_text) {
	if (just_text) {
		return this.text;
	} else {
		return this.wrap(this.text);
	}
};
MousePopup.prototype.kill = function () {
	MousePopup.getEl().css({
		visibility: 'hidden',
		top: 0,
		left: 0
	});
	this.active = false;
	MousePopup.clearTimeout();
	MousePopup.clearTeaserTimeout()
	MousePopup.getEl().removeClass('extended');
	this.notify('onHide');
};
MousePopup.clearTeaserTimeout = function () {
	if (MousePopup.teaserTimer) {
		window.clearTimeout(MousePopup.teaserTimer);
	}
};
MousePopup.prototype.setTeaserTimeout = function () {
	MousePopup.clearTeaserTimeout();
	MousePopup.teaserTimer = window.setTimeout(function () {
		MousePopup.getEl().addClass('extended');
	}, this.teaserTimeoutDelay);
};
MousePopup.prototype.setRelativePosition = function (left, top) {
	this.relativePosition = {
		top: top,
		left: left
	};
	return this;
};
MousePopup.prototype.setTimeout = function () {
	MousePopup.clearTimeout();
	var that = this;
	MousePopup.timer = window.setTimeout(function () {
		MousePopup.getEl().css('visibility', 'visible');
		that.notify('onShow');
	}, this.delay);
};
MousePopup.clearTimeout = function () {
	if (MousePopup.timer) window.clearTimeout(MousePopup.timer);
};
MousePopup.prototype.notify = function (action, param) {
	if (this.handler && this.handler[action])
		this.handler[action].apply(this, param || []);
};
MousePopup.getEl = (function () {
	var el;
	return function () {
		return el ? el : (el = $('#popup'));
	};
})();

(function ($) {
	'use strict';
	var single_instance = true,
		class_path = 'west.popup.handler',
		class_parent = null;
	var controller = {
		active_el: null,
		active_popup: null,
		init: function () {
			this.addEventListeners();
			return this;
		},
		addEventListeners: function () {
			this.removeEventListeners();
			$(document).on('mousemove.popup_handler', this.handleMouseMove.bind(this));
			return this;
		},
		removeEventListeners: function () {
			$(document).off('.popup_handler');
			return this;
		},
		handleMouseMove: function (e) {
			var target = e.target,
				active_el = this.active_el,
				active_popup = this.active_popup;
			if (this.canHavePopup(target)) {
				this.checkForPopup(target);
			}
			if (this.hasPopup(target)) {
				if (active_el !== target) {
					this.show(target);
					return this;
				}
			} else {
				if (this.hasParentPopup(target)) {
					target = $(target).closest('.hasMousePopup');
					if (!target.is(active_el)) {
						this.show(target);
						return this;
					}
				} else if (active_el) {
					this.hide();
					return this;
				}
			}
			this.updatePosition(e);
			return this;
		},
		hasParentPopup: function (el) {
			return el._parentHasPopup === true;
		},
		hadParentPopupCheck: function (el) {
			return undefined !== el._parentHasPopup;
		},
		hasPopup: function (el) {
			return el._hasPopup === true;
		},
		hadPopupCheck: function (el) {
			return undefined !== el._hasPopup;
		},
		canHavePopup: function (el) {
			if (el instanceof jQuery) {
				el = el[0];
			}
			if (el === document || el === document.window || el === $('body')[0]) {
				return false;
			}
			return true;
		},
		checkForPopup: function (el) {
			var popup, $el = $(el),
				title = $el.attr('title'),
				parent;
			if (title) {
				popup = title instanceof MousePopup ? title : new MousePopup(title);
				$el.removeAttr('title');
				this.add(el, popup);
				return true;
			}
			if (this.hadPopupCheck(el)) {
				return this.hasPopup(el) || this.hasParentPopup(el);
			}
			el._hasPopup = false;
			if (this.hadParentPopupCheck(el)) {
				return this.hasParentPopup(el);
			}
			parent = el.parentNode;
			if (this.canHavePopup(parent)) {
				if (this.checkForPopup(parent)) {
					el._parentHasPopup = true;
					return true;
				}
			}
			return false;
		},
		updatePosition: function (e) {
			if (this.active_popup) {
				this.active_popup.updatePosition(e);
			}
			return this;
		},
		addPopup: function () {
			return this.add.apply(this, arguments);
		},
		add: function (el, popup) {
			if (!el || !popup || (el instanceof jQuery && !el[0])) {
				return false;
			}
			var $el;
			if (el instanceof jQuery) {
				$el = el;
				el = el[0];
				$el.addClass('hasMousePopup');
			} else {
				$(el).addClass('hasMousePopup');
			}
			el._mpopup = popup instanceof MousePopup ? popup : new MousePopup(popup);
			el._hasPopup = true;
			this.markChildren(el, true);
			return $el || el;
		},
		removePopup: function () {
			return this.remove.apply(this, arguments);
		},
		remove: function (el) {
			if (el instanceof jQuery) {
				el = el[0];
			}
			delete el._mpopup;
			el._hasPopup = false;
			if (!this.hasParentPopup(el)) {
				this.markChildren(el, false);
			}
			return el;
		},
		getPopup: function (el) {
			var popup;
			if (el) {
				if (el instanceof jQuery) {
					el = el[0];
				}
				popup = el._mpopup;
			} else {
				popup = this.active_popup;
			}
			return popup;
		},
		markChildren: function (el, bool) {
			var that = this,
				$el = $(el),
				children = $($el).children();
			children.each(function (i, child) {
				if (that.hasPopup(child)) {
					child._parentHasPopup = bool;
				} else {
					if (bool) {
						child._parentHasPopup = bool;
					} else {
						delete child._parentHasPopup;
						delete child._hasPopup;
					}
					that.markChildren(child, bool);
				}
			});
		},
		show: function (target) {
			if (!target) {
				return;
			}
			var popup;
			if (target instanceof MousePopup) {
				popup = target;
				target = null;
			} else {
				if (target instanceof jQuery) {
					target = target[0];
				}
				popup = target._mpopup;
			}
			if (popup && popup !== this.active_popup) {
				this.hide();
				this.active_el = target;
				this.active_popup = popup;
			}
			return this;
		},
		hide: function (popup) {
			if (this.active_popup) {
				if (popup && this.active_popup !== popup) {
					return this;
				}
				this.active_popup.kill();
			}
			this.active_el = null;
			this.active_popup = null;
			return this;
		}
	};
	west.define(class_path + '.controller', class_parent + '.controller', controller);
	if (single_instance) {
		var path = class_path.split('.'),
			path_id = path.pop();
		path = west.get(path.join('.'));
		if (path && path[path_id] && path[path_id].controller) {
			path[path_id] = new path[path_id].controller;
			window.PopupHandler = path[path_id];
		}
	}
})(jQuery);

Date.prototype.toTime = function () {
	return [this.getHours().zerofill(2), ":", this.getMinutes().zerofill(2), ":", this.getSeconds().zerofill(2)].join("");
};
Date.prototype.toDateString = function () {
	return [this.getDate().zerofill(2), "-", (parseInt(this.getMonth()) + 1).zerofill(2), "-", this.getFullYear()].join("");
};
Date.prototype.toDateTimeString = function () {
	return [this.getDate().zerofill(2), '-', (parseInt(this.getMonth()) + 1).zerofill(2), '-', this.getFullYear() + ' ' +
this.getHours().zerofill(2), ':', this.getMinutes().zerofill(2), ':', this.getSeconds().zerofill(2)].join('');
};
Date.prototype.toDateTimeStringNice = function () {
	var timestamp = this.getTime();
	var withinSameDay = function (timestamp) {
		var now = new Date(),
			check_date = new Date(timestamp);
		return check_date.getDate() === now.getDate() && check_date.getMonth() === now.getMonth() && check_date.getFullYear() === now.getFullYear();
	};
	if (withinSameDay(timestamp)) {
		return s('сегодня в %1', this.toTime());
	}
	if (withinSameDay(timestamp - 86400000)) {
		return s('завтра в %1', this.toTime());
	}
	return s('%1 в %2', this.toDateString(), this.toTime());
};
Date.prototype.locale = {
	dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
};
Date.prototype.getLocalDay = function () {
	return this.locale.dayNames[this.getDay()];
};
Date.prototype.isWinterTime = function () {
	var y1 = this.getFullYear();
	var y2 = this.getFullYear();
	(this.getMonth() + 1) < 12 ? y1 = this.getFullYear() - 1 : y2 = this.getFullYear() + 1;
	return (this >= Date.parse('Dec 01, ' + y1) && this <= Date.parse('Jan 10, ' + y2));
};
Date.prototype.getWeekdayNo = function () {
	var dayNo = this.getDay();
	return dayNo > 0 ? dayNo - 1 : 6;
};
if (!Date.now) {
	Date.now = function now() {
		return new Date().getTime();
	};
}

function ServerDate() {
	this.date = new Date();
	this.date.setTime(this.date.getTime() - Game.clientTimedrift);
};
ServerDate.prototype.setTime = function (time) {
	return this.date.setTime(time);
};
ServerDate.prototype.getTime = function () {
	return this.date.getTime();
};
if (!Function.prototype.bind) {
	Function.prototype.bind = function () {
		if ("function" !== typeof (this)) {
			return this;
		}
		var args = Array.prototype.slice.call(arguments),
			new_scope = args.shift(),
			fn = this,
			fNOP = function () {},
			fnBounded = function () {
				fn.apply(this instanceof(fNOP) && new_scope ? this : new_scope, args.concat(Array.prototype.slice.call(arguments)));
			};
		fNOP.prototype = this.prototype;
		fnBounded.prototype = new fNOP();
		return fnBounded;
	};
}
Array.prototype.rar = function (index) {
	var retval = this[index];
	this.splice(index, 1);
};
if (!Array.prototype.forEach) {
	Array.prototype.forEach = function (callback, thisArg) {
		var T, k, O, len;
		if (this === null) {
			throw new TypeError(' this is null or not defined');
		}
		O = Object(this);
		len = O.length >>> 0;
		if ("function" !== typeof callback) {
			throw new TypeError(callback + ' is not a function');
		}
		if (arguments.length > 1) {
			T = thisArg;
		}
		k = 0;
		while (k < len) {
			var kValue;
			if (k in O) {
				kValue = O[k];
				callback.call(T, kValue, k, O);
			}
			k++;
		}
	};
}
Array.prototype.each = Array.prototype.forEach;
if (!Array.prototype.map) {
	Array.prototype.map = function (callback, thisArg) {
		var T, A, k;
		if (this == null) {
			throw new TypeError(' this is null or not defined');
		}
		var O = Object(this),
			len = O.length >>> 0;
		if (typeof callback !== 'function') {
			throw new TypeError(callback + ' is not a function');
		}
		if (arguments.length > 1) {
			T = thisArg;
		}
		A = new Array(len);
		k = 0;
		while (k < len) {
			var kValue, mappedValue;
			if (k in O) {
				kValue = O[k];
				mappedValue = callback.call(T, kValue, k, O);
				A[k] = mappedValue;
			}
			k++;
		}
		return A;
	};
}
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (elm) {
		var len = this.length,
			from = Number(arguments[1]) || 0;
		from = from < 0 ? Math.ceil(from) : Math.floor(from);
		if (from < 0) from += len;
		for (; from < len; from++) {
			if (from in this && this[from] === elm) return from;
		}
		return -1;
	};
}
if (!Array.prototype.some) {
	Array.prototype.some = function (fun) {
		'use strict';
		if (this == null) {
			throw new TypeError('Array.prototype.some called on null or undefined');
		}
		if (typeof fun !== 'function') {
			throw new TypeError();
		}
		var t = Object(this);
		var len = t.length >>> 0;
		var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
		for (var i = 0; i < len; i++) {
			if (i in t && fun.call(thisArg, t[i], i, t)) {
				return true;
			}
		}
		return false;
	};
}
Array.prototype.shuffle = function () {
	for (var j, x, i = this.length; i; j = Math.floor(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
	return this;
};
if (!Array.prototype.every) {
	Array.prototype.every = function (callbackfn, thisArg) {
		'use strict';
		var T, k, O, len;
		if (this == null) {
			throw new TypeError('this is null or not defined');
		}
		O = Object(this);
		len = O.length >>> 0;
		if (typeof callbackfn !== 'function') {
			throw new TypeError();
		}
		if (arguments.length > 1) {
			T = thisArg;
		}
		k = 0;
		while (k < len) {
			var kValue;
			if (k in O) {
				kValue = O[k];
				var testResult = callbackfn.call(T, kValue, k, O);
				if (!testResult) {
					return false;
				}
			}
			k++;
		}
		return true;
	};
}
if (!Array.isArray) {
	Array.isArray = function (arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}
if (!Array.prototype.filter) {
	Array.prototype.filter = function (fun) {
		'use strict';
		if (this === void 0 || this === null) {
			throw new TypeError();
		}
		var t = Object(this);
		var len = t.length >>> 0;
		if (typeof fun !== 'function') {
			throw new TypeError();
		}
		var res = [];
		var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
		for (var i = 0; i < len; i++) {
			if (i in t) {
				var val = t[i];
				if (fun.call(thisArg, val, i, t)) {
					res.push(val);
				}
			}
		}
		return res;
	};
}
Number.prototype.zerofill = function (len) {
	if (!isDefined(len)) {
		len = 2;
	}
	var tmp = this + '';
	while (tmp.length < len) {
		tmp = '0' + tmp;
	}
	return tmp;
};
Number.prototype.formatDuration = function () {
	var hours = Math.floor(this / 3600);
	var minutes = Math.floor(this / 60 - hours * 60);
	var seconds = Math.floor(this % 60);
	return hours.zerofill() + ':' + minutes.zerofill() + ':' + seconds.zerofill();
};
Number.prototype.formatDurationBuffWay = function () {
	var days = Math.floor(this / 3600 / 24);
	var hours = Math.floor(this / 3600 - days * 24);
	var minutes = Math.floor(this / 60 - hours * 60);
	var seconds = Math.floor(this % 60);
	return days > 0 ? days + 'д.' + " " + hours + 'ч.' : hours > 0 ? hours + 'ч.' + " " + minutes + 'м.' : minutes > 0 ? minutes + " " + 'м.' : seconds > 0 ? seconds + " " + 'с.' : "";
};
Number.prototype.formatDurationWorkProgress = function () {
	var hours = Math.floor(this / 3600);
	var minutes = Math.floor(this / 60 - hours * 60);
	var seconds = Math.floor(this % 60);
	return hours > 0 ? hours + 'ч.' + " " + minutes + 'м.' : minutes > 10 ? minutes + " " + 'м.' : minutes.zerofill() + ":" + seconds.zerofill();
};
Number.prototype.formatBignum = function () {
	var unit = ['T', 'G', 'M', 'k', ''];
	var out = Math.abs(this);
	while (out > 9999 && unit.length >= 2) {
		out /= 1000;
		unit.pop();
	}
	return Math.floor(out) + unit[unit.length - 1];
};
Number.prototype.timestamp2TimeObject = function () {
	var rest = this
	var formattedTime = {};
	formattedTime['days'] = 0;
	formattedTime['hours'] = 0;
	formattedTime['minutes'] = 0;
	formattedTime['seconds'] = 0;
	var tmpRes = 0;
	if (rest >= 86400) {
		tmpRes = rest / 86400;
		formattedTime['days'] = Math.floor(tmpRes);
		rest = (tmpRes - formattedTime['days']) * 86400;
	}
	if (rest >= 3600) {
		tmpRes = rest / 3600;
		formattedTime['hours'] = Math.floor(tmpRes);
		rest = (tmpRes - formattedTime['hours']) * 3600;
	}
	if (rest >= 60) {
		tmpRes = rest / 60;
		formattedTime['minutes'] = Math.floor(tmpRes);
		rest = (tmpRes - formattedTime['minutes']) * 60;
	}
	formattedTime['seconds'] = Math.floor(rest);
	return formattedTime;
}
Number.prototype.getTime2EndString = function (noch) {
	var l10n = {
			'no_noch': function () {
				return '%1 %2';
			},
			'noch': function (count) {
				return ngettext('ещё %1 %2', new Array('ещё %1 %2', 'ещё %1 %2', 'ещё %1 %2'), count);
			},
			'day': function (count) {
				return ngettext('день', new Array('день', 'дня', 'дней'), count);
			},
			'hour': function (count) {
				return ngettext('час', new Array('час', 'часов', 'часов'), count);
			},
			'minute': function (count) {
				return ngettext('минута', new Array('минута', 'минуты', 'минут'), count);
			},
			'second': function (count) {
				return ngettext('секунда', new Array('секунда', 'секунды', 'секунд'), count);
			},
			'default': 'Время истекло'
		},
		txt = l10n.noch,
		result = this.timestamp2TimeObject();
	if ("undefined" !== typeof noch && !noch) {
		txt = l10n.no_noch;
	}
	if (result.days > 0)
		return s(txt(result.days), result.days, l10n.day(result.days));
	else if (result.hours > 0)
		return s(txt(result.hours), result.hours, l10n.hour(result.hours));
	else if (result.minutes > 0)
		return s(txt(result.minutes), result.minutes, l10n.minute(result.minutes));
	else if (result.seconds > 0)
		return s(txt(result.seconds), result.seconds, l10n.second(result.seconds));
	else
		return l10n['default'];
};
Number.prototype.getTimeString4Timestamp = function () {
	var result = this.timestamp2TimeObject();
	if (this <= 0)
		return 'Время истекло';
	var txt = '%1';
	var resString = '';
	if (result.days > 0)
		resString += result.days + ' ' + 'д.' + ', ';
	if (result.hours > 0)
		resString += result.hours + ' ' + 'ч.' + ', ';
	if (result.minutes > 0)
		resString += result.minutes + ' ' + 'м.' + ', ';
	if (result.seconds > 0)
		resString += result.seconds + ' ' + 'с.';
	txt = s(txt, resString);
	return txt;
}
Number.prototype.getTime2EndToken = function (timeOverString) {
	var timestamp = this;
	var result = timestamp.timestamp2TimeObject();
	var txt = [];
	if (result.days > 0)
		txt.push(result.days + 'д.');
	if (result.hours > 0)
		txt.push(result.hours + 'ч.');
	if (result.minutes > 0)
		txt.push(result.minutes + 'м.');
	if (result.seconds > 0)
		txt.push(result.seconds + 'с.');
	if (txt.length == 0)
		return timeOverString ? timeOverString.escapeHTML() : 'Завершены';
	return txt.join(' ');
};
Number.prototype.getTime2EndShort = function (timeOverString) {
	var timestamp = this;
	var result = timestamp.timestamp2TimeObject();
	var txt = [];
	if (result.days > 0) {
		txt.push(result.days + 'д.');
	} else if (result.hours > 1) {
		txt.push(result.hours + 'ч.');
	} else {
		if (result.hours > 0) {
			txt.push(result.hours + 'ч.');
			if (result.minutes > 0) {
				txt.push(result.minutes.zerofill());
			}
		} else {
			if (result.minutes > 0) {
				txt.push(result.minutes + 'м.');
				txt.push(result.seconds.zerofill());
			} else {
				txt.push(result.seconds + 'с.');
			}
		}
	}
	return txt.length > 1 ? txt.join(':') : txt[0];
};
Number.prototype.getFormattedTimeString4Timestamp = function () {
	return new Date(parseInt(this) * 1000).toDateTimeString();
};
Number.prototype.getLocaleFormattedTime4Timestamp = function () {
	return new Date(parseInt(this) * 1000).toLocaleString();
};
String.prototype.shuffle = function () {
	var ls = [],
		i, sc = [],
		idx;
	for (i = 0; i < this.length; i += 1) ls[i] = this.charAt(i);
	for (i = 0; i < this.length; i += 1) {
		idx = Math.floor(Math.random() * ls.length);
		sc.push(ls.splice(idx, 1));
	}
	return sc.join("");
}
String.prototype.escapeHTML = function () {
	return this.replace(/[&<>'"]/g, function (x) {
		switch (x) {
		case '&':
			return '&amp;';
		case '>':
			return '&gt;';
		case '<':
			return '&lt;';
		case "'":
			return '&#39;';
		case '"':
			return '&quot;';
		}
	});
}
String.prototype.unescapeHTML = function () {
	return this.replace(/&(amp|gt|lt|#39|quot);/g, function (x) {
		switch (x) {
		case '&amp;':
			return '&';
		case '&gt;':
			return '>';
		case '&lt;':
			return '<';
		case '&#39;':
			return "'";
		case '&quot;':
			return '"';
		}
	});
}
String.prototype.fillValues = function (obj) {
	return this.replace(/%(\w+)%/g, function (_, k) {
		return obj[k]
	})
}
String.prototype.cutIt = function (len) {
	if (len >= this.length) return this.toString();
	return this.substr(0, (len - 1)) + '...';
}
String.prototype.cut = function (parentWidth) {
	if (parentWidth >= (this.length * 10))
		return this;
	var that = "this";
	var strWidth = parseInt($(that).width() + 10);
	var border = parentWidth - strWidth;
	return this;
}
String.prototype.parseTextblock = function (maxlength) {
	maxlength = maxlength || 50;
	if (this.length <= maxlength) return true;
	var textArr = this.escapeHTML().split(' ');
	for (var i = 0; i < textArr.length; i++) {
		if (textArr[i].toString().length > maxlength)
			return false;
	}
	return true;
};
String.prototype.prepareTextblock = function (maxlength) {
	maxlength = maxlength || 50;
	if (this.length <= maxlength) return this;
	var textArr = this.escapeHTML().split(' ');
	for (var i = 0; i < textArr.length; i++) {
		if (textArr[i].toString().length > maxlength)
			textArr[i] = textArr[i].cutIt(maxlength);
	}
	return textArr.join(' ');
};
String.prototype.replaceAll = function (replacer, replaceWith) {
	return this.replace(new RegExp(replacer, 'g'), replaceWith);
};
String.prototype.containsString = function (substr) {
	return this.indexOf(substr) != -1;
};
if (typeof String.prototype.trim !== 'function') {
	String.prototype.trim = function () {
		return $.trim(this);
	};
}
var objectLength = function (obj) {
	var counter = 0;
	for (var o in obj) {
		if (obj.hasOwnProperty(o))
			counter++;
	}
	return counter;
};
var getPopupWindowCode = function (width, height) {
	return 'onclick="window.open(this.href,\'\', \'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=' + height + ',width=' + width + '\'); return false;"';
};
var Sort = (function () {
	var obj = {};
	obj.create = function (orderBy, get) {
		if (!get) get = function (a) {
			return a;
		};
		return function (x, y) {
			var a = get(orderBy === 'desc' ? y : x);
			var b = get(orderBy === 'desc' ? x : y);
			if (typeof a === 'string')
				return Sort.byString(a, b);
			return Sort.byNumber(a, b);
		};
	};
	obj.byNumber = function (a, b) {
		return a - b;
	};
	obj.byString = function (a, b) {
		return a.toUpperCase().replace(/^Ä/, "A").replace(/^Ö/, "O").replace(/^Ü/, "U").replace(/^É/, "E") > b.toUpperCase().replace(/^Ä/, "A").replace(/^Ö/, "O").replace(/^Ü/, "U").replace(/^É/, "E") ? 1 : -1;
	};
	return obj;
})();
Array.prototype.unique = function () {
	var uqArr = [],
		found = false;
	for (var i = 0; i < this.length; i++) {
		found = false;
		for (var j = 0; j < uqArr.length; j++) {
			for (var key in this[i])
				break;
			if (this[i][key] === uqArr[j][key]) {
				found = true;
				break;
			}
		}
		if (!found) uqArr.push(this[i]);
	}
	return uqArr;
};
(function () {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
	}
	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function (callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function () {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function (id) {
			clearTimeout(id);
		};
}());

(function ($) {
	$(function () {
		if (!window.DEBUG) return;
		var el;
		if (!(el = $('#debugPanel')).length) {
			$('body').append(el = $('<div id="debugPanel" onclick="javascript: this.parentNode.removeChild(this);" />'));
		}
		window.setInterval(function () {
			var info = window._query_info || {},
				fs = Math.min(300, Math.max(8, info.count / 2));
			el.empty().append('<p>jQuery cache count: ' + (Object.keys && Object.keys(jQuery.cache).length || 'get a proper browser') + '</p>').append('<p style="font-size: ' + fs + 'px">Query count: ' + info.count + '</p>').append('<p>Query time: ' + Math.floor(info.time + .5) + '</p>');
		}, 1000);
	});
	$.fn.pulse = function (duration, until) {
		var pulse = function (el, from, to) {
			el.animate(to, duration, 'linear', function () {
				if (!until || false == until(el)) {
					pulse(el, to, from);
				}
			});
		};
		pulse(this, {
			opacity: 0
		}, {
			opacity: 1.0
		});
		return this;
	};
	$.fn.bringToTop = function () {
		if (this.css("z-index") != wman.lastIndex) this.css('z-index', ++wman.lastIndex);
		return this;
	};
	$.fn.md_center = function (opt, callback) {
		var opt = $.extend({
			top: 0,
			left: 0,
			transition: 0,
			opacity: 1.0
		}, opt);
		opt.top = 0 >= opt.top ? ((($(window).height() - $(this).outerHeight()) / 2) || 0) : opt.top;
		opt.left = 0 >= opt.left ? ((($(window).width() - $(this).outerWidth()) / 2) || 0) : opt.left;
		var props = {
			margin: 0,
			top: opt.top + "px",
			left: opt.left + "px",
			opacity: opt.opacity
		};
		if (0 < opt.transition) {
			$(this).animate(props, opt.transition, callback);
		} else $(this).css(props);
		return this;
	}
	$.fn.center = function (x, y, relative) {
		var p = this.position();
		if (!relative) relative = $(window);
		if (x !== false) {
			var w = this.outerWidth();
			var sw = relative.outerWidth();
			this.first().css('left', Math.max((sw - w) >> 1, 0) + "px");
		}
		if (y !== false) {
			var h = this.outerHeight();
			var sh = relative.outerHeight();
			this.first().css('top', Math.max((sh - h) >> 1, 0) + "px");
		}
		return this;
	}
	$.fn.rect = function (margin) {
		margin = margin || 0;
		var p = this.get(0) == window ? {
			left: 0,
			top: 0
		} : $(this).position();
		return {
			x0: p.left + margin,
			x1: $(this).width() + p.left + margin,
			y0: p.top + margin,
			y1: $(this).height() + p.top + margin
		};
	}
	$.fn.inside = function (e, margin) {
		margin = margin || 0;
		var r1 = this.rect(),
			r2 = $(e).rect(margin);
		return r1.x0 >= r2.x0 && r1.x1 <= r2.x1 && r1.y0 >= r2.y0 && r1.y1 <= r2.y1;
	}
	$.fn.cloneObj = function (jsObj) {
		return jQuery.extend(true, {}, jsObj);
	}
	$.fn.isInArray = function (pattern, searchArray) {
		return $.inArray(pattern, searchArray) > -1 ? true : false;
	}
	$.inObject = function (search, obj) {
		for (var key in obj) {
			if (obj[key] == search) return true;
		}
		return false;
	}
	$.removeFromObject = function (value, obj) {
		for (var key in obj) {
			if (obj[key] == value) {
				obj[key] = null;
				return obj;
			}
		}
		return obj;
	}
	$.insertValue2Object = function (value, obj) {
		for (var key in obj) {
			if (obj[key] == null) {
				obj[key] = value;
				return obj;
			}
		}
		return obj;
	}
	$.fn.appendArray = function (jqObjectArray) {
		if (jqObjectArray.length < 1) return (this);
		var translateArray = $.map(jqObjectArray, function (val, ix) {
			return (val.get());
		});
		this.append(translateArray);
		return (this);
	};
	jQuery.prototype.cut = function () {
		var txt = this.text();
		if (!txt || txt == "...")
			return this;
		var parW = this.parent().width();
		var thisW = this.width() + 10;
		if (parW >= thisW)
			return this;
		this.text(txt.substr(0, txt.length - 7) + "...").cut();
	}
	jQuery.prototype.addMousePopup = function (popup) {
		PopupHandler.addPopup(this, popup);
		return this;
	};
	jQuery.prototype.removeMousePopup = function () {
		PopupHandler.removePopup(this);
		return this;
	};
	jQuery.prototype.getMousePopup = function () {
		return PopupHandler.getPopup(this);
	};
})(jQuery);

Ajax = function () {
	jQuery.ajaxSetup({
		type: 'POST',
		dataType: 'json'
	});
	var forcedLogout = false;
	var makeUrl = function (options) {
		var url = 'game.php',
			params = [];
		if (options.window) params.push('window=' + options.window);
		if (options.action) params.push('action=' + options.action, 'h=' + Player.h);
		if (options.ajax) params.push('ajax=' + options.ajax);
		if (options.mode) params.push('mode=' + options.mode);
		return url + params.length ? '?' + params.join('&') : '';
	};
	var responseError = function (message, data) {
		new SystemError(message, undefined, false).show();
		ErrorLog.log(message, data);
	};
	var onFinish = function (window) {
		return function () {
			if (window && window.hideLoader)
				window.hideLoader();
			else if (window && window.hasOwnProperty('window'))
				window.window.hideLoader();
		};
	};
	var onSuccess = function (callback) {
		return function (resp, status, jqXHR) {
			if (!resp)
				return responseError('Empty Server response', JSON.stringify({
					url: this.url,
					data: this.data
				}));
			if (resp.error && 'fatal' == resp.error)
				return responseError('Fatal Server error', JSON.stringify({
					url: this.url,
					data: this.data
				}));
			if (resp.qinf) window._query_info = resp.qinf;
			typeof callback === 'function' && callback(resp);
		};
	};
	var onInvalidSession = function (resp) {
		if (!resp || !resp.logout) return;
		forcedLogout = true;
		Player.forceLogout(resp.message);
		throw 'invalid session';
	};
	var onFail = function (jqXHR, status, error) {
		if ((status === 'error' && error === '') || status === 'abort' || error === 'abort') return;
		responseError('Invalid Server response', JSON.stringify({
			url: this.url,
			data: this.data,
			status: status
		}));
		if (DEBUG && window.console && error !== 'Service Temporarily Unavailable') {
			console.log('Request failed, unexpected/no response:');
			console.log(error.toString() + ':');
			console.log(error.stack);
			console.log('Server\'s response:');
			console.log(jqXHR.responseText);
		}
	}
	var request = function (options) {
		if (forcedLogout) throw 'invalid session';
		var url = options.url || makeUrl(options);
		return jQuery.ajax(url, options).done(onInvalidSession);
	};
	var defaultCallbackRequest = function (options, callback, window) {
		if (window && window.showLoader)
			window.showLoader();
		else if (window && window.hasOwnProperty('window'))
			window.window.showLoader();
		return request(options).always(onFinish(window)).done(onSuccess(callback)).fail(onFail);
	};
	return {
		remoteCall: function (window, action, param, callback, view) {
			return defaultCallbackRequest({
				window: window,
				action: action,
				data: param
			}, callback, view);
		},
		remoteCallMode: function (window, mode, param, callback, view) {
			return defaultCallbackRequest({
				window: window,
				mode: mode,
				data: param
			}, callback, view);
		},
		get: function (window, ajax, param, callback, view) {
			return defaultCallbackRequest({
				window: window,
				ajax: ajax,
				data: param
			}, callback, view);
		},
		gameServiceRequest: function (method, urlparam, post, callback) {
			return defaultCallbackRequest({
				url: Game.serviceURL + '/' + method + '/' + urlparam,
				data: post
			}, callback);
		},
		request: request
	}
}();

(function ($) {
	$.fn.guiElement = function () {
		for (var i = 0; i < this.length; i += 1)
			if (this[i].guiElement) return this[i].guiElement;
		return null;
	}
	west.define('west.gui.Component', null, {
		init: function (ext) {
			for (var k in ext)
				this[k] = ext[k];
		},
		$: function (css) {
			return $(css, this.divMain);
		},
		getMainDiv: function () {
			return this.divMain;
		},
		appendTo: function (el) {
			$(el).append(this.divMain);
			return this;
		},
		addClass: function (cls) {
			$(this.getMainDiv()).addClass(cls);
			return this;
		},
		removeClass: function (cls) {
			$(this.getMainDiv()).removeClass(cls);
			return this;
		},
		setTooltip: function (tooltip) {
			if (tooltip) {
				$(this.getMainDiv()).addMousePopup(tooltip);
			} else {
				this.removeTooltip();
			}
			return this;
		},
		removeTooltip: function () {
			$(this.getMainDiv()).removeMousePopup();
			return this;
		}
	});
	west.define('west.gui.Icon', west.gui.Component, {
		init: function (name, title) {
			this.divMain = $("<img alt='' class='tw2gui-iconset' src='https://westrus.innogamescdn.com/images/tw2gui/pixel-vfl3z5WfW.gif'/>");
			if (undefined !== title) {
				this.setTitle(title);
			}
			if (undefined !== name) {
				this.setName(name);
			}
		},
		setTitle: function (title) {
			return this.setTooltip(title);
		},
		setName: function (name) {
			name = "tw2gui-icon-" + name;
			if (undefined !== this.name)
				this.removeClass(this.name);
			this.addClass(name);
			this.name = name;
			return this;
		},
		getName: function () {
			return this.name;
		}
	});
	west.gui.Icon.get = function (name, title) {
		return new west.gui.Icon(name, title).getMainDiv();
	};
	west.define('west.gui.Textart', west.gui.Component, {
		init: function (tx, width, height, font) {
			this.div = $("<div class='textart_title'/>")[0];
			this.setGlow(3).setScaleX(1).setSize(width, height);
			if (tx) this.setText(tx);
			if (font) this.setFont(font);
		},
		setGlow: function (glow) {
			this.glow = glow;
			if (this.canvas) this.canvas.getContext("2d").shadowBlur = glow;
			return this;
		},
		setSize: function (width, height) {
			if (!(width && height)) {
				return this;
			}
			if (this.canvas) {
				this.canvas.width = width;
				this.canvas.height = height;
				var ctx = this.canvas.getContext("2d");
				ctx.textAlign = "center";
				ctx.textBaseline = "top";
				ctx.shadowBlur = this.glow;
				ctx.shadowColor = "#000";
				ctx.font = this.font;
			}
			$(this.div || this.canvas).css({
				width: width + "px",
				height: height + "px",
				"line-height": height + "px"
			});
			this.width = width;
			this.height = height;
			if (this.text) this.setText(this.text);
			return this;
		},
		setFont: function (font) {
			if (this.div) this.div.style.font = font;
			else this.canvas.font = font;
			this.font = font;
			return this;
		},
		setScaleX: function (x) {
			this.scaleX = x;
			return this;
		},
		appendTo: function (div) {
			$(div).append(this.div || this.canvas);
			return this;
		},
		getText: function () {
			return this.text;
		},
		setText: function (tx) {
			if (this.canvas) {
				var img = new Image();
				img.src = "https://westrus.innogamescdn.com/images/tw2gui/textfield/textglow.jpg?2";
				var self = this;
				img.onload = function () {
					var ctx = self.canvas.getContext("2d");
					var p = ctx.createPattern(img, "repeat");
					ctx.clearRect(0, 0, self.width, self.height);
					ctx.fillStyle = p;
					ctx.setTransform(1, 0, 0, 1, 0, 0);
					ctx.scale(self.scaleX, 1);
					ctx.fillText(tx, self.width / 2 / self.scaleX, 0, self.width);
					ctx.fill();
				}
			} else {
				this.div.innerHTML = tx;
			}
			this.text = tx;
			return this;
		},
		ellipsis: function () {
			this.div.className = (this.div.className || "") + " shorten";
		}
	});
	west.define('west.gui.Button', west.gui.Component, {
		init: function (caption, onclick, context, data, title, cls) {
			this.divMain = $("<div class='tw2gui_button " + ((cls) ? cls : "") + "' " + (title ? ("title='" + title + "'") : "") + ">" + "<div class='tw2gui_button_right_cap'></div>" + "<div class='tw2gui_button_left_cap'></div>" + "<div class='tw2gui_button_middle_bg'></div>" + "</div>").click(this, this.handler.click)[0];
			this.divMain.guiElement = this;
			this.caption = new west.gui.Textart(caption, '', '', '').appendTo(this.divMain);
			this.setCaption(caption);
			this.disabled = false;
			this.onclick = onclick;
			this.context = context;
			this.data = data;
		},
		handler: {
			click: function (e) {
				e.data.click()
			}
		},
		click: function (callback, context, data) {
			if (undefined !== callback) {
				this.onclick = callback;
				this.context = context;
				this.data = data;
				return this;
			}
			if (this.disabled) return this;
			if (this.onclick) this.onclick.apply(this.context, [this, this.data]);
			return this;
		},
		setCaption: function (caption) {
			this.caption.setText(caption);
			return this;
		},
		setMinWidth: function (w) {
			this.divMain.style.minWidth = w + "px";
			return this;
		},
		setMaxWidth: function (w) {
			this.divMain.style.maxWidth = w + "px";
			this.caption.ellipsis();
			return this;
		},
		setWidth: function (w) {
			this.setMinWidth(w).setMaxWidth(w);
			return this;
		},
		disable: function () {
			this.disabled = true;
			this.addClass("inactive");
			return this;
		},
		setVisible: function (state) {
			$(this.divMain).css("display", state ? "inline-block" : "none");
			return this;
		},
		enable: function () {
			this.disabled = false;
			this.removeClass("inactive");
			return this;
		},
		setSelectbox: function (selectbox) {
			var that = this;
			this.click(function (e) {
				selectBox.show(e);
			});
		}
	});
	west.define('west.gui.Iconbutton', west.gui.Component, {
		init: function (icon, onclick, context, data, title) {
			if (icon instanceof west.gui.Icon)
				icon = icon.getMainDiv();
			else
				icon = $('<img class="button_icon" src="' + icon + '" />');
			this.divMain = $('<span class="tw2gui_iconbutton" ' + (title ? 'title="' + title + '"' : '') + '>' + '<span class="tw2gui_button_right_cap"></span>' + '<span class="tw2gui_button_left_cap"></span>' + '<span class="tw2gui_button_middle_bg"></span>' + '</span>').append(icon).click(this, this.handler.click)[0];
			this.divMain.guiElement = this;
			this.disabled = false;
			this.onclick = onclick;
			this.context = context || null;
			this.data = data || null;
		},
		handler: {
			click: function (e) {
				e.data.click()
			}
		},
		click: function () {
			if (this.disabled) return this;
			if (this.onclick) this.onclick.apply(this.context, [this, this.data]);
			return this;
		},
		setTitle: function (title) {
			return this.setTooltip(title);
		},
		setWidth: function (w) {
			$(this.divMain).css('min-width', w + 'px');
			return this;
		},
		disable: function () {
			this.disabled = true;
			this.addClass("inactive");
			return this;
		},
		enable: function () {
			this.disabled = false;
			this.removeClass("inactive");
			return this;
		}
	});
	west.define('west.gui.Scrollbar', west.gui.Component, {
		init: function (horizontal, noautohide) {
			this.divMain = $("<div class='tw2gui_scrollbar'>" + "<div class='tw2gui_scrollbar_bg1' />" + "<div class='tw2gui_scrollbar_bg2' />" + "<div class='tw2gui_scrollbar_pulley_area'>" + "<div class='tw2gui_scrollbar_pulley'>" + "<div class='tw2gui_scrollbar_pulley_bg1' />" + "<div class='tw2gui_scrollbar_pulley_bg2' />" + "<div class='tw2gui_scrollbar_pulley_bg3' />" + "</div>" + "</div>" + "<div class='tw2gui_scrollbar_arrow_leup' />" + "<div class='tw2gui_scrollbar_arrow_ribo' />" + "</div>")[0];
			this.divMain.guiElement = this;
			$(this.divMain).addClass(horizontal ? 'horizontal' : 'vertical').resize(this, this.handler.onResize);
			var that = this;
			$(this.divMain).mousewheel(function (e, d) {
				that.onWheeled(d);
				return false
			});
			$('.tw2gui_scrollbar_arrow_leup', this.divMain).on('mousedown', {
				bar: this,
				dir: -1
			}, this.handler.onArrowMouseDown).on('mouseup', this, this.handler.onArrowMouseUp);
			$('.tw2gui_scrollbar_arrow_ribo', this.divMain).on('mousedown', {
				bar: this,
				dir: 1
			}, this.handler.onArrowMouseDown).on('mouseup', this, this.handler.onArrowMouseUp);
			$('div.tw2gui_scrollbar_pulley_area', this.divMain).on('mousedown', this, this.handler.onAreaMouseDown);
			this._divPullArea = $('div.tw2gui_scrollbar_pulley_area', this.divMain);
			this._divPulley = $('div.tw2gui_scrollbar_pulley', this.divMain);
			this._divPulley.jqDrag(this._divPulley, {
				onStart: this.handler.onDragStart,
				onStop: this.handler.onDragStop,
				onDrag: this.handler.onDrag,
				bar: this
			})
			this.listeners = [];
			this.horizontal = horizontal || false;
			this.currentPosition = 0;
			this.setPullRange(300);
			this.scrollmode = "absolute";
			if (!(this.noautohide = noautohide))
				this.hide();
			this.maxScrolled = true;
		},
		getCurrentPosition: function () {
			return this.currentPosition;
		},
		handler: {
			onDragStart: function () {
				if (this.bar.horizontal) {
					this.rangex = [0, $('div.tw2gui_scrollbar_pulley_area', this.bar.divMain).width() - $('div.tw2gui_scrollbar_pulley', this.bar.divMain).width()];
					this.rangey = [0, 0];
				} else {
					this.rangex = [0, 0];
					this.rangey = [0, $('div.tw2gui_scrollbar_pulley_area', this.bar.divMain).height() - $('div.tw2gui_scrollbar_pulley', this.bar.divMain).height()];
				}
			},
			onDragStop: function () {
				this.bar.move(0);
			},
			onDrag: function () {
				this.bar.scream(true)
			},
			onResize: function (e) {
				e.data.setPullRange();
				e.stopPropagation();
			},
			onAreaMouseDown: function (e) {
				var that = e.data;
				var y = that.horizontal ? e.offsetX || e.layerX : e.offsetY || e.layerY;
				var ph = that._divPulley[that.horizontal ? 'width' : 'height']();
				var py = that._divPulley.position()[that.horizontal ? 'left' : 'top'];
				that.move((y - ph / 2) - py, true);
				return false;
			},
			onArrowMouseDown: function (e) {
				var that = e.data.bar;
				that.move(e.data.dir * 10)
				that._scroller = window.setInterval(function () {
					that.move(e.data.dir * 10)
				}, 100);
				return false;
			},
			onArrowMouseUp: function (e) {
				var that = e.data;
				window.clearInterval(that._scroller);
				delete that._scroller;
			}
		},
		setScrollmode: function (mode) {
			this.scrollmode = mode
			return this;
		},
		setPullRange: function (range) {
			if (range === undefined) range = this.pullRange;
			else this.pullRange = range;
			var havail = this._divPullArea[this.horizontal ? 'width' : 'height']();
			var per = Math.max(15, Math.floor(Math.min(1, (havail + 30) / this.pullRange) * 100));
			this._divPulley.css(this.horizontal ? 'width' : 'height', per + "%");
			this.checkHide(per);
			this.currentPosition = -1;
			return this;
		},
		checkHide: function (per) {
			if (this.noautohide)
				return this;
			if (per == 100 && this.visible()) {
				this.hide();
			} else if (per != 100 && !this.visible()) {
				this.show();
			}
			return this;
		},
		hide: function () {
			this.divMain.style.visibility = "hidden";
		},
		show: function () {
			this.divMain.style.visibility = "visible";
		},
		visible: function () {
			return this.divMain.style.visibility != "hidden";
		},
		addDragListener: function (f, context, data) {
			this.listeners.unshift({
				f: f,
				c: context,
				d: data
			});
			return this;
		},
		removeDragListener: function (f) {
			for (var i = this.listeners.length - 1; i >= 0; i -= 1) {
				this.listeners.splice(i, 1);
			}
			return this;
		},
		move: function (px, animated, absolute) {
			var pulley = $('div.tw2gui_scrollbar_pulley', this.divMain),
				hare = $('div.tw2gui_scrollbar_pulley_area', this.divMain)[this.horizontal ? 'width' : 'height'](),
				topMax = hare - pulley[this.horizontal ? 'width' : 'height'](),
				top = Math.min(topMax, Math.max(0, px + (absolute ? 0 : pulley.position()[this.horizontal ? 'left' : 'top']))),
				css = {};
			css[this.horizontal ? 'left' : 'top'] = top + 'px';
			this.maxScrolled = top == topMax;
			if (animated) {
				var that = this;
				pulley.animate(css, {
					step: function () {
						that.scream()
					}
				});
			} else {
				pulley.css(css);
			}
			return this.scream();
		},
		onWheeled: function (delta) {
			var hare = $('div.tw2gui_scrollbar_pulley_area', this.divMain)[this.horizontal ? 'width' : 'height']();
			var pulley = $('div.tw2gui_scrollbar_pulley', this.divMain);
			var hpul = pulley[this.horizontal ? 'width' : 'height']();
			var hrest = hare - hpul;
			var amount = 0;
			if (hrest >= 0) {
				amount = Math.floor(.5 - delta * 50 * hrest / this.pullRange);
			}
			if (amount == 0) amount = delta < 0 ? 1 : -1;
			this.move(amount);
			return false;
		},
		calcRelpos: function () {
			var hare = $('div.tw2gui_scrollbar_pulley_area', this.divMain)[this.horizontal ? 'width' : 'height']();
			var pulley = $('div.tw2gui_scrollbar_pulley', this.divMain);
			var hpul = pulley[this.horizontal ? 'width' : 'height']();
			var puly = pulley.position()[this.horizontal ? 'left' : 'top'];
			if (hpul + puly > hare) {
				puly = Math.max(0, hare - hpul);
				pulley.css(this.horizontal ? 'left' : 'top', puly + "px");
			}
			return hare == hpul ? 0 : Math.min(1, Math.max(0, puly / (hare - hpul)));
		},
		scream: function (done) {
			var rel = this.calcRelpos();
			if (rel == this.currentPosition) return;
			this.currentPosition = rel;
			var hfull = $(this.divMain)[this.horizontal ? 'width' : 'height']();
			var pxposnow = Math.floor(rel * (this.pullRange - hfull));
			var pxposprev = Math.floor(rel * (this.pullRange - hfull));
			for (var i = this.listeners.length - 1; i >= 0; i -= 1) {
				var h = this.listeners[i];
				h.f.apply(h.c, [this, pxposnow, pxposprev, h.d]);
			}
			return this;
		}
	});
	west.define('west.gui.Scrollpane', west.gui.Component, {
		init: function (classname, noautohide, smartscrolling) {
			this.divMain = $("<div class='tw2gui_scrollpane'>" + "<div class='tw2gui_scrollpane_clipper'>" + "<div class='tw2gui_scrollpane_clipper_contentpane' />" + "</div>" + "<div class='tw2gui_scrollpane_verticalscrollbar_area' />" + "</div>")[0];
			this.divMain.guiElement = this;
			this.contentPane = $('div.tw2gui_scrollpane_clipper_contentpane', this.divMain).resize(this, this.handler.onResize);
			this.clipPane = $('div.tw2gui_scrollpane_clipper', this.divMain);
			$(this.divMain).addClass(classname);
			this.verticalBar = new west.gui.Scrollbar(false, noautohide).addDragListener(this.onScrolled, this, true);
			$('div.tw2gui_scrollpane_verticalscrollbar_area', this.divMain).append(this.verticalBar.getMainDiv());
			var that = this;
			$(this.divMain).mousewheel(function (e, d) {
				that.verticalBar.onWheeled(d);
			});
			this.smartscrolling = smartscrolling;
		},
		handler: {
			onResize: function (e) {
				e.data.onResized();
				e.stopPropagation();
			}
		},
		getContentPane: function () {
			return this.contentPane;
		},
		appendContent: function (c) {
			this.contentPane.append(c);
			return this
		},
		onScrolled: function (bar, pos, oldpos, isvertical) {
			this.contentPane.css('top', -pos + "px");
		},
		onResized: function () {
			var ch = this.contentPane.height(),
				mh = parseInt($(this.divMain).css("max-height")),
				maxScrolled = this.verticalBar.maxScrolled,
				scrollPos = this.getScrollPos();
			if (mh) $(this.divMain).css("height", Math.min(ch, mh));
			this.verticalBar.setPullRange(ch);
			if (!this.verticalBar.visible()) {
				if (scrollPos.rely !== 0) this.scrollTo(0, 0);
				this.clipPane.css("margin-right", "0px");
			} else {
				if (this.smartscrolling && maxScrolled) this.scrollToEnd();
				this.clipPane.css("margin-right", "15px");
			}
		},
		getScrollPos: function () {
			var xy = this.contentPane.position();
			var info = {
				contentHeight: this.contentPane.height(),
				contentWidth: this.contentPane.width(),
				x: -xy.left,
				y: -xy.top,
				clipHeight: this.clipPane.height(),
				clipWidth: this.clipPane.width()
			};
			info.relx = info.clipWidth > info.contentWidth ? 0 : Math.min(1, info.x / (info.contentWidth - info.clipWidth));
			info.rely = info.clipHeight > info.contentHeight ? 0 : Math.min(1, info.y / (info.contentHeight - info.clipHeight));
			return info;
		},
		scrollTo: function (x, y, absolute) {
			this.verticalBar.setPullRange(this.contentPane.height()).move(y, false, absolute);
		},
		scrollToEnd: function () {
			this.scrollTo(0, this.contentPane.height(), true);
		},
		scrollToTop: function () {
			this.scrollTo(0, 0, true);
		},
		scrollBy: function (x, y) {
			this.scrollTo(x, y, false);
		}
	});
	west.define('west.gui.Groupframe', west.gui.Component, {
		init: function (cssclass, content) {
			this.divMain = $("<div class='tw2gui_groupframe " + (cssclass || "") + "'>" + "<div class='tw2gui_groupframe_background bg0'></div>" + "<div class='tw2gui_groupframe_background bg1'></div>" + "<div class='tw2gui_groupframe_background bg2'></div>" + "<div class='tw2gui_groupframe_background bg3'></div>" + "<div class='tw2gui_groupframe_background bg4'></div>" + "<div class='tw2gui_groupframe_frame tw2gui_bg_tl'></div>" + "<div class='tw2gui_groupframe_frame tw2gui_bg_tr'></div>" + "<div class='tw2gui_groupframe_frame tw2gui_bg_bl'></div>" + "<div class='tw2gui_groupframe_frame tw2gui_bg_br'></div>" + "<div class='tw2gui_groupframe_content_pane'>" +
				(content || "") + "</div>" + "</div>");
			this.divMain[0].guiElement = this;
		},
		appendToContentPane: function () {
			var self = $('> div.tw2gui_groupframe_content_pane', this.divMain);
			self.append.apply(self, arguments);
			return this;
		},
		setId: function (id) {
			this.divMain.attr('id', id);
			return this;
		},
		getMainDiv: function () {
			return this.divMain[0];
		}
	});
	west.define('west.gui.Table', west.gui.Component, {
		init: function (no_scrollbar) {
			this.divMain = $('<div class="fancytable"/>').append("<div class='_bg tw2gui_bg_tl'/>", "<div class='_bg tw2gui_bg_tr'/>", "<div class='_bg tw2gui_bg_bl'/>", "<div class='_bg tw2gui_bg_br'/>", "<div class='trows'><div class='thead statics'><div class='row_head'></div></div>" + "<div class='tbody'>" + "<div class='_bg tw2gui_bg_l'/>" + "<div class='_bg tw2gui_bg_r'/>" + "<div class='rows' />" + "</div>" + "<div class='tfoot statics'><div class='row_foot'></div></div></div>");
			this.divMain[0].guiElement = this;
			this.noScrollbar = no_scrollbar;
			if (no_scrollbar) {
				this.tbody = this.$('div.rows', this.divMain);
			} else {
				this.bodyscroll = new west.gui.Scrollpane();
				this.$('div.tbody', this.divMain).append(this.bodyscroll.getMainDiv())
				this.tbody = this.bodyscroll.getContentPane();
			}
			this.column = [];
			this.colnames = {};
			this.rows = [];
		},
		setScrollbar: function () {
			this.noScrollbar = false;
			return this;
		},
		removeScrollbar: function () {
			this.noScrollbar = true;
			return this;
		},
		setId: function (id) {
			this.divMain.attr('id', id);
			return this;
		},
		addColumn: function (css, dataObj) {
			var col = $('<div class="cell cell_' + this.column.length + ' ' + css + '"></div>');
			if (dataObj) col.data(dataObj);
			this.$('>div.trows >div.statics > div').append(col);
			this.colnames[css] = this.column.length;
			this.column.push(css);
			return this;
		},
		addColumns: function (arr_css) {
			var appends = "";
			for (var i = 0; i < arr_css.length; i++) {
				appends += "<div class='cell cell_" + this.column.length + " " + arr_css[i] + "'></div>";
				this.colnames[arr_css[i]] = this.column.length;
				this.column.push(arr_css[i]);
			}
			this.$('>div.trows >div.statics > div').append(appends);
			return this;
		},
		appendRow: function (data, cssclass) {
			var row = $('<div class="row row_' + this.rows.length + ' ' + (cssclass || "") + '"></div>');
			if (undefined != data)
				data.appendTo(row);
			this.rows.push(row);
			this.tbody.append(row);
			return this;
		},
		buildRow: function (cssclass, contentObj, modifyRow) {
			var row = $('<div class="row row_' + this.rows.length + ' ' + (cssclass || "") + '"></div>');
			var appends = '';
			var i = 0;
			for (var key in contentObj) {
				appends += '<div class="cell_' + i + ' ' + key + '">' + contentObj[key] + '</div>';
				i++;
			}
			row.html(appends);
			if (modifyRow)
				row = modifyRow(row);
			this.rows.push(row);
			this.tbody.append(row);
			return this;
		},
		createEmptyMessage: function (text) {
			this.$('div.tbody').append($('<div class="no-content" style="position: absolute; left:20px;right:20px; top:50px; text-align: center;"><img src="https://westrus.innogamescdn.com/images/icons/warn_circle.png">&nbsp;&nbsp;<span class="empty-list" style="font-size: 10pt; font-weight: bold;">' + text + '</span></div>').hide());
			return this;
		},
		clearBody: function () {
			if (!this.noScrollbar)
				this.bodyscroll.scrollToTop();
			this.tbody.empty();
			this.rows = [];
		},
		getCell: function (row, col) {
			if (typeof col == "string") col = this.colnames[col];
			if (col < 0 || col >= this.column.length) return null;
			if (row < 0) row += this.rows.length;
			row = this.$('div.row_' + row).first();
			var cell = $('div.cell_' + col, row);
			if (cell.length == 0) {
				var c;
				for (var i = col - 1; i >= 0; i -= 1) {
					if ((c = $('div.cell_' + i, row)).length) break;
				}
				cell = $('<div class="cell cell_' + col + ' ' + this.column[col] + '"></div>');
				if (!c || !c.length) row.append(cell);
				else c.after(cell);
			}
			return cell;
		},
		getRow: function (id) {
			return id === undefined ? this.rows[this.rows.length - 1] : this.rows[id];
		},
		appendToCell: function (row, col, content) {
			var cell = this.getCell(row, col);
			cell.append(content);
			return this;
		},
		appendTitleToCell: function (row, col, title) {
			var cell = this.getCell(row, col);
			cell.attr('title', title);
			return this;
		},
		appendToThCell: function (row, col, title, content) {
			var cell = this.getCell(row, col);
			cell.append($('<span title="' + title + '">' + content + '</span>'));
			return this;
		},
		appendToFooter: function (cell, content) {
			this.$('div.row_foot div.' + cell, this.divMain).append(content);
			return this;
		},
		removeFooter: function () {
			this.$('div.row_foot', this.divMain).remove();
			return this;
		}
	});
	west.define('west.gui.Htmltable', west.gui.Component, {
		init: function () {
			this.divMain = $('<table class="tw2gui_htmltable"><thead></thead>' + '<tbody><tr><td class="tw2gui_htmltable_tdcontainer" colspan="1">' + '<div class="tw2gui_htmltable_div_content"><table class="tw2gui_htmltable_contenttable"></table></div>' + '</td></tr></tbody><tfoot></tfoot></table>');
			this.divMain[0].guiElement = this;
		},
		buildHeader: function (headerObj) {
			var header = '<tr>';
			var counter = 0;
			for (var key in headerObj) {
				header += '<th class="' + key + '">' + headerObj[key] + '</th>';
				counter++;
			}
			header += '<th class="for_scrollbar">&nbsp;</th></tr>';
			$('thead', this.divMain).html(header);
			$('td.tw2gui_htmltable_tdcontainer', this.divMain).attr('colspan', counter);
			return this;
		},
		buildFooter: function (footerObj) {
			var footer = '<tr>';
			for (var key in footerObj) {
				footer += '<th class="' + key + '">' + footerObj[key] + '</th>';
			}
			footer += '<th class="for_scrollbar">&nbsp;</th></tr>';
			$('tfoot', this.divMain).html(footer);
			return this;
		},
		appendRow: function (id, bodyObj) {
			var row = '<tr id="' + id + '">';
			for (var key in bodyObj) {
				row += '<td class="' + key + '">' + bodyObj[key] + '</td>';
			}
			row += '</tr>';
			$('table.tw2gui_htmltable_contenttable', this.divMain).append($(row));
			return this;
		},
		createRow: function (rowObj) {
			var row = '<tr>';
			for (var key in rowObj) {
				row += '<td class="' + key + '">' + rowObj[key] + '</td>';
			}
			row += '</tr>';
			return row;
		},
		appendRows: function (arrBodyObj) {
			var tbody = '';
			for (var i in arrBodyObj) {
				tbody += this.createRow(arrBodyObj[i]);
			}
			$('table.tw2gui_htmltable_contenttable', this.divMain).html($(tbody));
			return this;
		},
		setSize: function (width, height) {
			$(this.divMain).css({
				'width': width + 'px',
				'height': height + 'px'
			});
			$('div.tw2gui_htmltable_div_content, table.tw2gui_htmltable_contenttable', this.divMain).css({
				'height': height - 25 + 'px'
			});
			return this;
		},
		clearBody: function () {
			$('table.tw2gui_htmltable_contenttable', this.divMain).empty();
		}
	});
	west.define('west.gui.Combobox', west.gui.Component, {
		init: function (id) {
			this.divMain = $('<span ' + (id ? 'id="' + id + '" ' : '') + 'class="tw2gui_combobox"><span class="tw2gui_combobox_text"></span>' + '<input type="hidden" id="' + id + '_value" value="" />' + '<span class="tw2gui_combobox_btn"></span></span>').click(this, this.handler.onDropdown);
			if (id) this.divMain.attr("id", id);
			this.divMain[0].guiElement = this;
			this.items = [];
			this.box = this.$('span.tw2gui_combobox_text');
			this.listeners = [];
			this.directionTop = false;
		},
		handler: {
			onDropdown: function (e) {
				e.data.onDropdown()
			}
		},
		addListener: function (fn, ctx, data) {
			this.listeners.push({
				f: fn,
				c: ctx,
				d: data
			});
			return this;
		},
		modalBoxDirectionTop: function (top) {
			this.directionTop = top;
			return this;
		},
		onDropdown: function () {
			var close = function () {
				$(box.getMainDiv()).hide().slideUp(function () {
					modal.remove()
				});
			}
			var modal = $("<div class='tw2gui_modal_box'></div>").click(close).height(Math.max(document.body.scrollHeight, $(document.body).height())).width(Math.max(document.body.scrollWidth, $(document.body).width()));
			$(document.body).append(modal);
			var pos = this.divMain.offset();
			var boxwrap = $('<div class="tw2gui_combobox_list"></div>').css("min-width", this.box.width() + "px").appendTo(modal);
			var box = new west.gui.Groupframe();
			var that = this;
			for (var i = 0; i < this.items.length; i += 1) {
				var el = this.items[i];
				box.appendToContentPane(el.node.clone().click((function (el) {
					return function () {
						close();
						that.select(el.value);
						return false;
					}
				})(el)));
			}
			$(box.getMainDiv()).appendTo(boxwrap);
			var top = this.directionTop ? (pos.top + 15 - boxwrap.height()) : (pos.top + this.box.height());
			boxwrap.css({
				"left": pos.left + "px",
				"top": top + "px"
			});
		},
		removeItem: function (value) {
			for (var i = 0; i < this.items.length; i += 1)
				if (this.items[i].value == value) break;
			if (i >= this.items.length) return this;
			if (value == this.value) {
				if (this.items.length == 1) {
					this.box.empty();
					this.value = null;
					this.items = [];
					return this;
				}
				this.select(this.items[i > 0 ? i - 1 : i + 1].value);
			}
			this.items.splice(i, 1);
			return this;
		},
		addItem: function (value, htmlelement) {
			if (typeof (htmlelement) == "string") htmlelement = "<span>" + htmlelement + "</span>";
			this.items.push({
				value: value,
				node: $(htmlelement)
			});
			if (this.items.length == 1) {
				this.select(value);
			}
			return this;
		},
		select: function (value) {
			for (var i = 0; i < this.items.length - 1; i += 1)
				if (this.items[i].value == value) break;
			var el = this.items[i];
			this.value = el.value;
			this.$(' > input', this.divMain).val(this.value);
			this.divMain.data('value', this.value);
			this.box.empty().append(el.node.clone());
			for (i = 0; i < this.listeners.length; i++) {
				var fi = this.listeners[i];
				fi.f.apply(fi.c, [value, fi.d]);
			}
			return this;
		},
		getValue: function () {
			return this.value;
		},
		setWidth: function (newWidth) {
			this.$(' > span.tw2gui_combobox_text', this.divMain).css('width', newWidth + 'px');
			return this;
		}
	});
	west.define('west.gui.Selectbox', west.gui.Component, {
		init: function () {
			this.divModal = $("<div class='tw2gui_modal_fixed' />");
			this.divMain = $("<div class='tw2gui_selectbox'>" + "<div class='tw2gui_selectbgr'>" + "<div class='tw2gui_bg_tl'/>" + "<div class='tw2gui_bg_tr'/>" + "<div class='tw2gui_bg_bl'/>" + "<div class='tw2gui_bg_br'/>" + "<div class='arrow'/>" + "</div>" + "<div class='tw2gui_selectbox_header'>" + "<div class='tw2gui_selectbgr'>" + "<div class='tw2gui_bg_tl' />" + "<div class='tw2gui_bg_tr' />" + "</div>" + "<div class='header_title' />" + "</div>" + "<ul class='tw2gui_selectbox_content' />" + "</div>");
			this.divWrap = $("<div class='tw2gui_selectbox_wrapper' />");
			this.elContent = $(".tw2gui_selectbox_content", this.divMain);
			this.items = [];
			this.listeners = [];
		},
		addListener: function (fn, ctx, data) {
			this.listeners.push({
				f: fn,
				c: ctx,
				d: data
			});
			return this;
		},
		removeItem: function (value) {
			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i].value == value)
					break;
			}
			if (i >= this.items.length)
				return this;
			if (value == this.value && 1 == this.items.length) {
				this.box.empty();
				this.value = null;
				this.items = [];
				return this;
			}
			this.items.splice(i, 1);
			this._build();
			return this;
		},
		setHeader: function (header) {
			this.$(".tw2gui_selectbox_header").show();
			this.$(".tw2gui_selectbox_header .header_title").html(header);
			return this;
		},
		setWidth: function (width) {
			this.elContent.css("width", width);
			return this;
		},
		setHeight: function (height) {
			this.elContent.css("height", height);
			return this;
		},
		addEmpty: function () {
			this.addItem(null, $("<div style='height: 16px;' />"));
			return this;
		},
		removeAll: function () {
			this.items = [];
			this._build();
		},
		addItem: function (value, htmlelement, title) {
			if (typeof (htmlelement) == "string") {
				htmlelement = "<span>" + htmlelement + "</span>";
			}
			this.items.push({
				value: value,
				node: $(htmlelement),
				title: title
			});
			this._build();
			return this;
		},
		_getScrollpane: function () {
			if (this.scrollpane) {
				this.scrollpane.getMainDiv().detach();
			} else {
				this.scrollpane = new west.gui.Scrollpane();
				this.getMainDiv().addClass('with_scrollbar');
			}
			this.elContent.empty().append(this.scrollpane.getMainDiv());
			return this.scrollpane.getContentPane();
		},
		_getContent: function () {
			if (this.scrollpane) {
				this.getMainDiv().removeClass('with_scrollbar');
				this.scrollpane.getMainDiv().remove();
				delete this.scrollpane;
			}
			return this.elContent;
		},
		_build: function (show) {
			var item, isSubmenu = false,
				that = this,
				$content;
			if (!show && !this.divWrap.is(':visible')) {
				return;
			}
			if (this.items.length > 14) {
				$content = this._getScrollpane();
			} else {
				$content = this._getContent();
			}
			$content.empty();
			for (var i = 0; i < this.items.length; i++) {
				item = this.items[i];
				isSubmenu = item.title instanceof west.gui.Selectbox;
				var li = $("<li />").append($(item.node));
				if (isSubmenu) {
					li.append(new west.gui.Icon.get('arrowright'));
					(function (li) {
						item.title.hide = function () {
							that.divWrap.remove();
							return this;
						};
						var el = item.title._build(show).getMainDiv(),
							dohide = false;
						el.hide();
						that.divWrap.append(el);
						var onHover = function () {
							dohide = false;
							var pos = li.offset();
							el.css({
								top: pos.top - (li.height()) + 10,
								left: pos.left + that.divMain.width() + 5
							})
							setTimeout(function () {
								el.show();
							}, 400);
						}
						var onFade = function () {
							dohide = true;
							setTimeout(function () {
								if (dohide) el.hide();
							}, 400);
						};
						li.hover(onHover, onFade);
						el.hover(onHover, onFade);
					})(li);
				} else {
					li.attr("title", item.title).click(function (value) {
						return function () {
							that.select(value);
						}
					}(item.value));
				}
				$content.append(li);
			}
			this.divModal.click(function () {
				that.hide();
			});
			return this;
		},
		show: function (e, data) {
			this.showData = data;
			this._build(true);
			this.divWrap.append(this.divMain, this.divModal);
			$("#popup-container").append(this.divWrap);
			if (null != e) {
				this.setPosition(e.clientX, e.clientY);
			}
			return this;
		},
		hide: function () {
			delete this.scrollpane;
			this.divWrap.remove();
			return this;
		},
		select: function (index) {
			if (null == index) return this;
			for (var i = 0; i < this.listeners.length; i++) {
				var fi = this.listeners[i];
				fi.f.apply(fi.c, [index, fi.d, this.showData]);
			}
			this.hide();
			return this;
		},
		setPosition: function (x, y) {
			var top, left, arrClass, el = this.divMain;
			var scrollLeft = $(window).scrollLeft(),
				scrollTop = $(window).scrollTop();
			var window_height = window.Map && Map.height || $(window).height(),
				window_width = window.Map && Map.width || $(window).width(),
				margin_bottom = window_height - y;
			var height = el.height(),
				width = el.width();
			if (margin_bottom < height + 30) {
				arrClass = "bottom";
				top = y - height + scrollTop - 25;
			} else {
				arrClass = "top";
				top = y + scrollTop + 15;
			}
			left = x - (width / 2);
			if (left < 0) {
				left = 0;
			} else if (left + width > (window_width - 35)) {
				left -= (left + width) - window_width + 35 - scrollLeft;
			}
			var arrow = $(".arrow", this.divMain);
			arrow.removeClass("top").removeClass("bottom").addClass(arrClass).css({
				left: x - left - (arrow.width() / 2) + scrollLeft
			});
			$(this.divMain).css({
				top: top,
				left: left
			});
			return this;
		}
	});
	west.define('west.gui.Textfield', west.gui.Component, {
		init: function (tid, type, cls) {
			type = type || 'text';
			this.divMain = $('<span class="tw2gui_textfield_wrapper">' + '<span class="tw2gui_textfield_label" />' + '<span class="tw2gui_textfield"><span><input type="' + type + '" /></span></span></span>');
			var inp = $('input', this.divMain);
			if (tid) inp.attr('id', tid);
			if (cls) inp.attr('class', cls);
			inp[0].guiElement = this.divMain[0].guiElement = this;
			this.listeners = [];
			var that = this;
			inp.keyup(function (e) {
				if (e.keyCode == 13) {
					for (var i = 0; i < that.listeners.length; i++) {
						var fi = that.listeners[i];
						fi.f.apply(fi.c, [inp.val(), fi.d]);
					}
				}
			});
		},
		setName: function (name) {
			this.$('input', this.divMain).attr('name', name);
			return this;
		},
		maxlength: function (ml) {
			this.$('input', this.divMain).attr('maxlength', ml);
			return this;
		},
		setId: function (id) {
			this.$('input', this.divMain).attr('id', id);
			return this;
		},
		setClass4Input: function (className) {
			$('input', this.divMain).attr('class', className);
			return this;
		},
		getField: function () {
			return this.$('> .tw2gui_textfield input', this.divMain);
		},
		getValue: function () {
			return this.getField().attr('value');
		},
		setValue: function (val) {
			this.getField().attr('value', val);
			return this;
		},
		setPlaceholder: function (val) {
			this.getField().attr('placeholder', val);
			return this;
		},
		setTooltip: function (text) {
			this.$('span.tw2gui_textfield', this.divMain).attr('title', text);
			return this;
		},
		setMaxLength: function (val) {
			this.getField().attr('maxlength', val);
			return this;
		},
		setSize: function (size) {
			this.getField().attr('size', size);
			return this;
		},
		setWidth: function (width) {
			this.$('input', this.divMain).css('width', width + 'px');
			return this;
		},
		setLabel: function (label) {
			this.$(' span.tw2gui_textfield_label', this.divMain).html(label);
			return this;
		},
		setReadonly: function (state) {
			if (undefined === state || true === state)
				this.$('input', this.divMain).attr('readonly', 'readonly');
			return this;
		},
		addListener: function (fn, ctx, data) {
			this.listeners.push({
				f: fn,
				c: ctx,
				d: data
			});
			return this;
		},
		onlyNumeric: function () {
			this.$('input', this.divMain).keypress(function (e) {
				var key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
				if (!new RegExp("^[0-9]+$").test(key)) {
					e.preventDefault();
					return false;
				}
			});
			return this;
		},
		focus: function () {
			this.getField().focus();
			return this;
		},
		addKeyUpListener: function (callback, ctx) {
			if (ctx) {
				callback = callback.bind(ctx);
			}
			this.getField().on('keyup', callback);
			return this;
		},
		click: function (callback) {
			this.$("input", this.divMain).on('click', callback);
			return this;
		},
		blur: function (callback) {
			this.$("input", this.divMain).on('blur', callback);
			return this;
		}
	});
	west.define('west.gui.Progressbar', west.gui.Component, {
		init: function (current, max) {
			this.divMain = $('<div class="tw2gui_progressbar">' + '<div class="tw2gui_progressbar_progress">' + '<div class="tw2gui_progressbar_begin"/>' + '<div class="tw2gui_progressbar_end"/>' + '<div class="tw2gui_progressbar_fill"/>' + '<div class="tw2gui_progressbar_contents"/>' + '</div>' + '</div>');
			this.divMain[0].guiElement = this;
			this.valueIsTime = false;
			this.value = current;
			this.maxValue = max;
			this.endless = false;
			this.percentOnly = false;
			this.textOnly = false;
			this.color = 'green';
			this.direction = 'direction_ltr';
			this.update();
		},
		setMaxValue: function (val) {
			this.maxValue = val;
			this.update();
			return this;
		},
		setColor: function (color) {
			this.removeClass(this.color);
			this.addClass(color);
			this.color = color;
			return this;
		},
		setDirection: function (direction) {
			direction = 'direction_' + direction;
			this.removeClass(this.direction);
			this.addClass(direction);
			this.direction = direction;
			return this;
		},
		setValue: function (val) {
			this.value = val;
			this.update();
			return this;
		},
		increase: function (step) {
			this.value = this.value + (step || 1);
			this.update();
			return this;
		},
		showPercentOnly: function (bool) {
			this.percentOnly = bool;
			this.update();
			return this;
		},
		getValue: function () {
			return this.value;
		},
		update: function () {
			var calc, contents, fill;
			if (this.endless)
				calc = 100;
			else {
				calc = this.maxValue > 0 ? Math.floor((this.value / this.maxValue) * 100) : 100;
				calc = calc > 100 ? 100 : calc;
			}
			contents = this.$('div.tw2gui_progressbar_contents', this.divMain);
			fill = this.$('div.tw2gui_progressbar_fill', this.divMain);
			if (null != this.maxValue && null != this.value) {
				if ($.browser.msie && $.browser.version <= 8)
					fill.css("width", calc + "%");
				else {
					fill.css("width", calc + "%");
				}
			}
			contents.empty();
			var v = this.value,
				m = this.maxValue,
				differentValue = this.differentValue;
			if (this.valueIsTime) {
				var tcalc = function (val) {
					var h, m, s;
					m = s = "00";
					h = Math.floor(val / 3600);
					if (0 != (val % 3600)) {
						var c = val - (h * 3600);
						minute = Math.floor(c / 60);
						if (0 != (c % 60)) s = c % 60;
					}
					return (h <= 0 ? "" : h + ":") + m + ":" + s;
				};
				v = tcalc(v);
				m = tcalc(m);
			}
			if (this.endless) contents.append($("<span>" + v + "</span>"));
			else if (this.percentOnly) contents.append($('<span>' + calc + '%</span>'))
			else if (this.textOnly) contents.append("<span>" + v + " / " + m + "</span>");
			else if (this.valueDifferent) contents.append("<span>" + differentValue + "</span>");
			else contents.append($('<span>' + (v + ' / ' + m + (' (' + calc + '%)')) + '</span>'));
		},
		setLabel: function (text, icon) {
			var el = this.$('.tw2gui_progressbar_label', this.divMain);
			if (el) el.remove();
			if (!(icon instanceof west.gui.Icon) && undefined !== icon)
				icon = new west.gui.Icon(icon);
			el = $("<div class='tw2gui_progressbar_label'/>");
			if (undefined !== icon) el.append(icon.getMainDiv());
			el.append("<span>" + text + "</span>");
			this.divMain.prepend(el);
			return this;
		},
		dropShadow: function () {
			this.divMain.append($("<div class='tw2gui_progressbar_shadow'/>"));
			return this;
		},
		setEndless: function (state) {
			this.endless = state;
			this.update();
			return this;
		},
		setTextOnly: function (state) {
			this.textOnly = state;
			this.update();
			return this;
		},
		setValueTime: function () {
			this.valueIsTime = true;
		},
		setDifferentValue: function (value) {
			this.valueDifferent = true;
			this.differentValue = value
		}
	});
	west.define('west.gui.Searchbox', west.gui.Component, {
		init: function (formName, callbackFunction) {
			this.divMain = $('<div class="searchbox"><span class="iSearchbox"></span>' + '<span class="butSearchbox"></span></div>');
			this.$('span.iSearchbox', this.divMain).append(new west.gui.Textfield().setName(formName + '_search').setMaxLength(100).getMainDiv());
			this.divMain[0].guiElement = this;
		},
		setWidth: function (width) {
			this.divMain.css('width', width);
			$('span.iSearchbox .tw2gui_textfield', this.divMain).css({
				'max-width': (width - 40) + 'px',
				'width': (width - 40) + 'px',
				'float': 'left'
			});
			return this;
		},
		addEnterEvent: function () {
			var that = this;
			$('span.iSearchbox .tw2gui_textfield input:text', this.divMain).keypress(function (e) {
				if (e.which == 13) $('.tw2gui_button', that.divMain).click();
			});
		}
	});
	west.define('west.gui.Checkbox', west.gui.Component, {
		init: function (label, groupClass, callback) {
			this.divMain = $('<div class="tw2gui_checkbox ' + groupClass + '" />');
			this.divMain[0].guiElement = this;
			var that = this;
			this.divMain.click(function () {
				that.toggle();
			});
			if (callback) this.setCallback(callback);
			this.setLabel(label);
			this.groupClass = groupClass;
			this.radiobutton = false;
			this.enabled = true;
		},
		setSelected: function (state, noCallback) {
			if (!this.enabled) return this;
			if (state) {
				if (!this.divMain.hasClass('tw2gui_checkbox_checked'))
					this.divMain.addClass('tw2gui_checkbox_checked');
				this.divMain.data('enabled', true);
			} else {
				this.divMain.removeClass('tw2gui_checkbox_checked');
				this.divMain.data('enabled', false);
			}
			if (this.radiobutton) {
				$('div.tw2gui_checkbox.' + this.groupClass).removeClass('tw2gui_checkbox_checked');
				this.divMain.addClass('tw2gui_checkbox_checked');
			}
			if (noCallback) return this;
			if (undefined != this.callback)
				this.callback(state);
			return this;
		},
		isSelected: function () {
			return this.divMain.hasClass('tw2gui_checkbox_checked');
		},
		toggle: function () {
			this.setSelected(!this.isSelected());
			return false;
		},
		setRadiobutton: function () {
			this.divMain.addClass('tw2gui_radiobutton')
			this.radiobutton = true;
			return this;
		},
		reset: function () {
			if (!this.enabled) return this;
			try {
				$(this.divMain).toggleClass('tw2gui_checkbox_checked');
			} catch (e) {
				$(this.divMain).removeClass('tw2gui_checkbox_checked');
			}
			this.divMain.data('enabled', $(this.divMain).hasClass('tw2gui_checkbox_checked'));
			return this;
		},
		setValue: function (value) {
			this.divMain.data('value', value);
			return this;
		},
		getValue: function () {
			return this.divMain.data('value');
		},
		setLabel: function (label) {
			this.divMain.html(label);
			if (undefined == label || "" == label) {
				this.divMain.removeClass('tw2gui_checkbox_labeled');
			} else {
				this.divMain.addClass('tw2gui_checkbox_labeled');
			}
			return this;
		},
		setEnabled: function (state) {
			this.enabled = state;
			this.divMain.data('enabled', state);
			return this;
		},
		setCallback: function (callback) {
			this.callback = callback;
			return this;
		},
		setId: function (id) {
			this.divMain.attr('id', id);
			return this;
		},
		setTitle: function (text) {
			return this.setTooltip(text);
		}
	});
	west.define('west.gui.Accordion', west.gui.Component, {
		init: function (id, name, groupname) {
			this.id = id;
			this.group = groupname;
			this.divMain = $('<div id="' + id + '" class="tw2gui_accordion_categorybar' + (this.group ? ' accordiongroup_' + this.group : '') + '">' + '<div class="accordion_right"></div>' + '<div class="accordion_left_closed"></div>' + '<span class="accordion_label">' + name + '</span>' + '</div>' + '<div id="' + this.id + '_content" class="tw2gui_accordion_content' + (this.group ? ' accordiongroup_' + this.group : '') + '"></div>');
			this.divMain.addClass('accordion_closed');
			$(this.divMain[0]).click(this.click).data('accordiongroup', groupname);
			this.scrollpane = new west.gui.Scrollpane();
			$(this.divMain[1]).append(this.scrollpane.getMainDiv());
		},
		setContent: function (content) {
			$(this.divMain[1]).html(content);
			return this;
		},
		addContentRow: function (content, title) {
			this.scrollpane.appendContent($('<p class="accordion_contentRow" ' + (title ? title : '') + '/>').append(content));
			return this;
		},
		clearContent: function () {
			$('#' + this.id + '_content', this.divMain).empty();
			return this;
		},
		setClickable: function () {
			$(this.accordion).on('click', this.click);
			return this;
		},
		setUnClickable: function () {
			$(this.accordion).off('click');
			return this;
		},
		click: function () {
			if ($(this).hasClass('accordion_opened')) {
				$('#' + this.id + '_content').hide();
				$(this).removeClass('accordion_opened').addClass('accordion_closed');
				$('#' + this.id + ' div.accordion_left_opened').removeClass('accordion_left_opened').addClass('accordion_left_closed');
				$('div.tw2gui_accordion_categorybar.accordiongroup_' + $(this).data("accordiongroup")).show();
			} else {
				if ($(this).attr('class').match('accordiongroup_')) {
					var classes = $(this).attr('class').split(' ');
					$.each(classes, function (k, v) {
						if (v.match('accordiongroup_')) {
							var group = v.split('group_')[1];
							$('div.accordiongroup_' + group + '.accordion_opened').removeClass('accordion_opened').addClass('accordion_closed');
							$('div.accordiongroup_' + group + ' .accordion_left_opened').removeClass('accordion_left_opened').addClass('accordion_left_closed');
							$('div.tw2gui_accordion_content.accordiongroup_' + group).hide();
						}
					});
				}
				$('#' + this.id + '_content').show();
				$(this).removeClass('accordion_closed').addClass('accordion_opened');
				$('#' + this.id + ' .accordion_left_closed').removeClass('accordion_left_closed').addClass('accordion_left_opened');
				$('div.tw2gui_accordion_categorybar.accordiongroup_' + $(this).data("accordiongroup")).hide();
				$(this).show();
			}
		}
	});
	west.define('west.gui.Accordiongroup', west.gui.Component, {
		init: function (groupname) {
			this.divMain = $('<div class="accordion_root ' + groupname + '"></div>');
			this.groupname = groupname;
		},
		addAccordion: function (accordion) {
			this.divMain.append(accordion);
			return this;
		},
		createAccordion: function (id, label) {
			var acc = new west.gui.Accordion(id, label, this.groupname).getMainDiv();
			this.divMain.append(acc);
			return this;
		}
	});
	west.define('west.gui.Textarea', west.gui.Component, {
		init: function (content, classes) {
			this.divMain = $("<span class='tw2gui_textarea " + (classes || "") + "'>" + "<div class='tw2gui_bg'></div>" + "<div class='tw2gui_bg_tl'></div><div class='tw2gui_bg_br'></div>" + "<div class='tw2gui_bg_tr'></div><div class='tw2gui_bg_bl'></div>" + "<div class='tw2gui_textarea_wrapper'><textarea></textarea></div></span>");
			this.divMain[0].guiElement = this;
			this.textarea = $('textarea', this.divMain);
			this.textarea.val(content || "");
		},
		setContent: function (c) {
			this.textarea.val(c || "");
			return this;
		},
		getContent: function () {
			return this.textarea.val();
		},
		setReadonly: function () {
			this.textarea.attr('readonly', 'readonly');
			return this;
		},
		setWidth: function (width) {
			this.textarea.css('width', width);
			return this;
		},
		setHeight: function (height) {
			this.textarea.css('height', height);
			return this;
		},
		setId: function (id) {
			this.textarea.attr('id', id);
			return this;
		},
		setExpandable: function (opts) {
			var align = opts.align || 'left';
			this.toggler = $(s('<div title="%1" class="tw2gui_textarea_toggler %2"></div>', 'Развернуть'.escapeHTML(), 'align_' + align)).click(this.expandToggle.bind(this));
			this._expandable = true;
			this._expandedWidth = opts.width;
			this._closedWidth = this.textarea.width();
			this.getMainDiv().append(this.toggler);
			return this;
		},
		expandToggle: function () {
			if (!this._expandable) return;
			if (this.toggler.hasClass('expanded')) {
				this.textarea.animate({
					width: this._closedWidth
				});
				this.toggler.addMousePopup('Развернуть')
			} else {
				this.textarea.animate({
					width: this._expandedWidth
				});
				this.toggler.addMousePopup('Свернуть');
			}
			this.toggler.toggleClass('expanded');
		}
	});
	west.define('west.gui.Pagebar', west.gui.Component, {
		init: function (page, pages, callback, context, hasNext) {
			var that = this;
			this.relative = pages == null ? true : false;
			this.callback = callback;
			this.context = context;
			this.divMain = $("<div class='tw2gui_pagebar'/>").append($('<span class="button prev firstPage"></span>').click(function () {
				that.btnClick('first');
			}), $('<span class="button prev previousPage"></span>').click(function () {
				that.btnClick('prev');
			}), $("<div class='current_page'/>").click(function () {
				that.togglePagePrompt();
			}), $('<span class="button next nextPage"></span>').click(function () {
				that.btnClick('next');
			}), $('<span class="button next lastPage"></span>').click(function () {
				that.btnClick('last');
			}));
			if (this.relative) $("span.lastPage", this.divMain).remove();
			this.update(page, pages, hasNext);
			if (!this.relative) this.addPageprompt();
		},
		update: function (page, maxPages, hasNext) {
			this.setPage(page);
			this.setMaxPages(maxPages);
			if (this.page <= 1)
				$("span.prev", this.divMain).hide();
			else
				$("span.prev", this.divMain).show();
			if ((!this.relative && this.page >= this.pages) || (this.relative && !hasNext))
				$("span.next", this.divMain).hide();
			else
				$("span.next", this.divMain).show();
		},
		setPage: function (p) {
			this.page = p;
			$("div.current_page", this.divMain).text(this.page);
			if (this.textfield) this.textfield.setValue(this.page);
		},
		setMaxPages: function (p) {
			if (null !== p) {
				this.pages = Math.max(this.page, p);
				$("span.maxpages", this.pageprompt).text("/ " + this.pages);
			}
		},
		addPageprompt: function () {
			var that = this;
			this.textfield = new west.gui.Textfield().setSize(3);
			this.textfield.getField().keypress(function (e) {
				if (e.which == 13) {
					that.pageprompt.hide();
					that.btnClick("certain");
				}
			});
			this.pageprompt = $('<span class="pageprompt"/>').append('<div class="background"/>').append('<div class="frame tw2gui_bg_tl"></div>').append('<div class="frame tw2gui_bg_tr"></div>').append('<div class="frame tw2gui_bg_bl"></div>').append('<div class="frame tw2gui_bg_br"></div>').append(this.textfield.getMainDiv()).append($("<span class='maxpages'>/ " + this.pages + "</span>"));
			this.divMain.append(this.pageprompt);
		},
		btnClick: function (dir) {
			if (this.relative) return this.callback.call(this.context, dir);
			var param = 1;
			switch (dir) {
			case 'next':
				param = this.page + 1;
				break;
			case 'prev':
				param = this.page - 1;
				break;
			case 'first':
				param = 1
				break;
			case 'last':
				param = this.pages;
				break;
			case 'certain':
				param = parseInt(this.textfield.getValue()) || 1;
				break;
			}
			this.callback.call(this.context, Math.min(Math.max(param, 1)), this.pages);
		},
		togglePagePrompt: function () {
			if (this.relative) return;
			this.textfield.setValue(this.page)
			this.pageprompt.toggle();
			this.textfield.getField().focus().val(this.textfield.getValue());
		}
	});
	west.define('west.gui.Bbcodes', west.gui.Component, {
		init: function (target, skip) {
			if (target instanceof west.gui.Textarea)
				target = target.textarea[0];
			this.target = target;
			this.divMain = $("<div class='tw2gui_bbcodes'>" + "<span title='" + 'Жирный' + "' class='bbbold'></span>" + "<span title='" + 'Курсив' + "' class='bbitalic'></span>" + "<span title='" + 'Подчёркивание' + "' class='bbunderline'></span>" + "<span title='" + 'Зачёркивание' + "' class='bbstrike'></span>" +
				(($.inArray("player", skip) === -1) ? "<span title='" + 'Игрок' + "' class='bbplayer'></span>" : "") +
				(($.inArray("town", skip) === -1) ? "<span title='" + 'Город' + "' class='bbtown'></span>" : "") +
				(($.inArray("fort", skip) === -1) ? "<span title='" + 'Форт' + "' class='bbfort'></span>" : "") +
				(($.inArray("alliance", skip) === -1) ? "<span title='" + 'Альянс' + "' class='bballiance'></span>" : "") +
				(($.inArray("url", skip) === -1) ? "<span title='" + 'Ссылка' + "' class='bburl'></span>" : "") + "<div style='clear: both;'></div" + "</div>");
			var BB = new BBCode(this.target);
			$('span.bbbold', this.divMain).click(function () {
				BB.addCodeTag('b');
			});
			$('span.bbitalic', this.divMain).click(function () {
				BB.addCodeTag('i');
			});
			$('span.bbunderline', this.divMain).click(function () {
				BB.addCodeTag('u');
			});
			$('span.bbstrike', this.divMain).click(function () {
				BB.addCodeTag('del');
			});
			if ($.inArray("player", skip) === -1)
				$('span.bbplayer', this.divMain).click(function () {
					BB.addCodeTag('player');
				});
			if ($.inArray("town", skip) === -1)
				$('span.bbtown', this.divMain).click(function () {
					BB.addCodeTag('town');
				});
			if ($.inArray("fort", skip) === -1)
				$('span.bbfort', this.divMain).click(function () {
					BB.addCodeTag('fort');
				});
			if ($.inArray("alliance", skip) === -1)
				$('span.bballiance', this.divMain).click(function () {
					BB.addCodeTag('alliance');
				});
			if ($.inArray("url", skip) === -1)
				$('span.bburl', this.divMain).click(function () {
					BB.addExtendedCodeTag('Введи, пожалуйста, ссылку.', 'url');
				});
		}
	});
	currentHighlight = null;
	west.define('west.gui.Window', west.gui.Component, {
		init: function (title, winclass, noDragEvent) {
			this.divMain = $("<div class='tw2gui_window tw2gui_win2 tw2gui_window_notabs " + (winclass || "") + "'></div>").append("<div class='tw2gui_window_shadow_box'>" + "<div class='tw2gui_window_shadow tw2gui_bg_br'></div>" + "<div class='tw2gui_window_shadow tw2gui_bg_tr'></div>" + "<div class='tw2gui_window_shadow tw2gui_bg_bl'></div>" + "</div>", "<div class='tw2gui_window_inset'>" + "<div class='tw2gui_inner_window_bg'></div>" + "<div class='tw2gui_inner_window_bg2'></div></div>", "<div class='tw2gui_window_inset_bottom'></div>", "<div class='tw2gui_window_inset_right'></div>", "<div class='tw2gui_inner_splitwindow_container'>" + "<div class='tw2gui_inner_splitwindow'>" + "<div class='tw2gui_inner_splitwindow_rightfade'></div>" + "</div></div>", "<div class='tw2gui_window_border tw2gui_bg_tl'></div>", "<div class='tw2gui_window_border tw2gui_bg_br'></div>", "<div class='tw2gui_window_border tw2gui_bg_tr'></div>", "<div class='tw2gui_window_border tw2gui_bg_bl'></div>", "<div class='tw2gui_inner_window_title tw2gui_window_notabs'>" + "<div class='tw2gui_inner_window_title_left'></div>" + "<div class='tw2gui_inner_window_title_right'></div>" + "</div>", "<div class='tw2gui_window_pane'>" + "<div class='tw2gui_window_border_ext tw2gui_window_border_ext_tl'></div>" + "<div class='tw2gui_window_border_ext tw2gui_window_border_ext_tr'></div>" + "<div class='loader'><img src='https://westrus.innogamescdn.com/images/throbber2.gif' /></div>" + "</div>", "<div class='tw2gui_window_content_pane'></div>", "<div class='tw2gui_window_sizer'></div>", "<div class='tw2gui_window_tabbar'><div class='tw2gui_window_tabbar_tabs'></div>" + "<div class='tw2gui_window_tabbar_faderight'></div>" + "<div class='tw2gui_window_tabbar_fadeleft'></div></div>", "<div class='tw2gui_window_tab_control_clipper'><div class='tw2gui_window_tab_control'>" + "<div class='tw2gui_window_tab_control_btnleft'></div>" + "<div class='tw2gui_window_tab_control_btnright'></div>" + "<div class='tw2gui_window_tab_control_select'></div></div></div>", "<div class='tw2gui_window_buttons'>" + "<div class='tw2gui_window_buttons_reload' title='&lt;b&gt;" + 'Обновить содержание' + "'&lt;/b&gt;></div>" + "<div class='tw2gui_window_buttons_closeall' title='&lt;b&gt;" + 'Закрыть все окна' + "&lt;/b&gt;'></div>" + "<div class='tw2gui_window_buttons_minimize' title='&lt;b&gt;" + 'Свернуть окно' + "&lt;/b&gt;'></div>" + "<div class='tw2gui_window_buttons_close' title='&lt;b&gt;" + 'Закрыть окно' + "&lt;/b&gt;'></div>" + "</div>").appendTo("#windows")[0];
			var now = new Date();
			if (now.isWinterTime()) {
				$(this.divMain).addClass('snow');
			} else if (now < buildDateObject('2.4.2014') && now > buildDateObject('1.4.2014')) {
				$(this.divMain).addClass('fire');
			}
			this.divMain.guiElement = this;
			var divTitleHandle = $('div.tw2gui_inner_window_title', this.divMain)[0];
			this.sizeRange = {
				x: [220, 749],
				y: [220, 471]
			};
			this.draggable = noDragEvent ? false : true;
			$(this.divMain).jqResize($('div.tw2gui_window_sizer', this.divMain), {
				rangex: this.sizeRange.x,
				rangey: this.sizeRange.y,
				onStart: this.handler.onResizeStart,
				onStop: this.handler.onResizeStop,
				onDrag: this.handler.onResizing,
				win: this
			});
			if (this.draggable) {
				$(this.divMain).jqDrag(divTitleHandle, {
					onStart: this.handler.onDragStart,
					onStop: this.handler.onDragStop,
					onDrag: this.handler.onDrag,
					win: this
				});
			}
			$(this.divMain).on('mousedown', {
				win: this
			}, this.handler.onWindowMouseDown).on('mouseenter', {
				win: this
			}, this.handler.onWindowMouseEnter);
			$(this.divMain).on('click', {
				win: this
			}, this.handler.onClick);
			$('div.tw2gui_window_tab_control_btnleft', this.divMain).on('click', {
				win: this
			}, this.handler.onClickTabCtrlLeft);
			$('div.tw2gui_window_tab_control_btnright', this.divMain).on('click', {
				win: this
			}, this.handler.onClickTabCtrlRight);
			$('div.tw2gui_window_tab_control_select', this.divMain).on('click', {
				win: this
			}, this.handler.onClickTabCtrlSelect);
			$('div.tw2gui_window_buttons_close', this.divMain).on('click', {
				win: this,
				type: TWE('WINDOW_CLOSE')
			}, this.handler.windowFireEvent);
			$('div.tw2gui_window_buttons_reload', this.divMain).on('click', {
				win: this,
				type: TWE('WINDOW_RELOAD')
			}, this.handler.windowFireEvent);
			$('div.tw2gui_window_buttons_minimize', this.divMain).on('click', {
				win: this,
				type: TWE('WINDOW_MINIMIZE')
			}, this.handler.windowFireEvent);
			$('div.tw2gui_window_buttons_closeall', this.divMain).on('click', {
				win: this,
				type: TWE('WINDOW_CLOSEALL_OPEN')
			}, this.handler.windowFireEvent);
			this.titler = new west.gui.Textart("", "", 32, "bold 20pt Times New Roman").appendTo(divTitleHandle).setScaleX(.8);
			this.setResizeable(false).setTitle(title).center().bringToTop();
			this.tabIds = {};
			this.eventListeners = {};
		},
		showTabLoader: function (tab_id) {
			$(".tw2gui_window_tab" + (tab_id ? '._tab_id_' + tab_id : ''), this.divMain).addClass('loading');
		},
		showLoader: function () {
			$(".tw2gui_window_pane > .loader", this.divMain).show();
			if (!($.browser.msie && $.browser.version <= 8))
				$("div.tw2gui_window_content_pane", this.divMain).css("opacity", "0.5");
		},
		hideLoader: function () {
			$(".tw2gui_window_pane > .loader", this.divMain).hide();
			$(".tw2gui_window_tab.loading", this.divMain).removeClass('loading');
			if (!($.browser.msie && $.browser.version <= 8))
				$("div.tw2gui_window_content_pane", this.divMain).css("opacity", "1.0");
		},
		addEventListener: function (etype, handler, context, data) {
			TWE(etype);
			if (!this.eventListeners[etype]) this.eventListeners[etype] = [{
				f: handler,
				c: context,
				d: data
			}];
			else this.eventListeners[etype].unshift({
				f: handler,
				c: context,
				d: data
			});
			return this;
		},
		setMinSize: function (w, h) {
			this.sizeRange.x[0] = w;
			this.sizeRange.y[0] = h;
			return this;
		},
		setMaxSize: function (w, h) {
			this.sizeRange.x[1] = w;
			this.sizeRange.y[1] = h;
			return this;
		},
		height: function () {
			return $(this.divMain).height();
		},
		width: function () {
			return $(this.divMain).width();
		},
		setId: function (id) {
			this.id = id;
			return this;
		},
		getId: function () {
			return this.id;
		},
		saveAppearance: function () {
			var self = $(this.divMain);
			var pos = self.position();
			return {
				x: self.css("left"),
				y: self.css("top"),
				w: self.width(),
				h: self.height()
			};
		},
		restoreAppearance: function (ap) {
			if (!ap) return this;
			var self = $(this.divMain);
			self.css({
				"left": ap.x,
				"top": ap.y
			}).width(ap.w).height(ap.h);
			return this;
		},
		destroy: function () {
			this.fireEvent(TWE("WINDOW_DESTROY"), this);
			$(this.divMain).remove().empty();
		},
		removeEventListener: function (etype, handler) {
			var ls = this.eventListeners[etype];
			if (!ls) return;
			for (var i = ls.length - 1; i >= 0; i -= 1) {
				if (ls[i] == handler) ls.splice(i, 1);
			}
			return this;
		},
		addTab: function (title, id, onActivate, context, data, closeable) {
			if (this.tabIds[id]) {
				throw 'added tab with that id (' + id + ') already';
			}
			this.tabIds[id] = {
				f: onActivate,
				c: context,
				d: data,
				id: id
			};
			$('div.tw2gui_window_notabs', this.divMain).removeClass('tw2gui_window_notabs');
			$(this.divMain).removeClass('tw2gui_window_notabs');
			$('div.tw2gui_window_tabbar_tabs', this.divMain).append($("<div class='tw2gui_window_tab _tab_id_" + id + "' />").append('<div class="loader"></div>', "<div class='tw2gui_window_tab_text'>" + title + "</div><div class=" + (closeable ? "'tw2gui_window_tab_terminator_close'" : "'tw2gui_window_tab_terminator'") + "></div>").data("tab_id", id));
			$('div._tab_id_' + id, this.divMain).on('click', {
				win: this,
				tabid: id,
				f: onActivate,
				c: context,
				d: data
			}, this.handler.onClickTab)
			if (closeable) {
				var that = this;
				$('div._tab_id_' + id + ' > .tw2gui_window_tab_terminator_close').click(function () {
					that.closeTab(id);
				});
			}
			if (!this.currentActiveTabId) {
				this.activateTab(id, false);
			}
			return this.doLayout();
		},
		renameTab: function (tabId, newTitle) {
			if (!this.tabIds[tabId]) throw 'tabId does not exist';
			this.$('._tab_id_' + tabId + ' .tw2gui_window_tab_text').html(newTitle);
		},
		switchTab: function (tabId) {
			this.activateTab(tabId);
			var self = this;
			this.$('div.tw2gui_window_content_pane > *').each(function (i, e) {
				self.removeClass($(e).attr('class'));
				if ($(e).hasClass(tabId)) {
					$(e).children().fadeIn();
					$(e).show();
					self.addClass(tabId);
				} else {
					$(e).children().fadeOut();
					$(e).hide();
				}
				self.fireEvent(TWE("WINDOW_TAB_SWITCHED"), {
					'DOM': this,
					'tabId': tabId
				});
			});
		},
		hideTab: function (tabId) {
			this.$('._tab_id_' + tabId).hide();
		},
		showTab: function (tabId) {
			this.$('._tab_id_' + tabId).show();
		},
		closeTab: function (id) {
			if (!this.tabIds[id]) return;
			var oldTab = this.tabIds[id];
			delete(this.tabIds[id]);
			var oldTabDiv = $('div._tab_id_' + id, this.divMain);
			if (!oldTabDiv.next().length && !oldTabDiv.prev().length) {
				this.destroy();
			} else {
				var leftTab = oldTabDiv.next().length == 0 ? oldTabDiv.prev() : oldTabDiv.next();
				if (this.currentActiveTabId == id)
					this.activateTab($(leftTab).data('tab_id'), true);
				this.doLayout();
			}
			oldTabDiv.remove();
			this.fireEvent(TWE("TAB_CLOSED"), id);
		},
		fireActivateTab: function (id) {
			var inf = this.tabIds[id]
			if (!inf || !inf.f) return false;
			inf.f.apply(inf.c, [this, id, inf.d]);
		},
		activateTab: function (id, mkEvent) {
			if (!this.tabIds[id]) throw "that tab does not exist";
			$('div.tw2gui_window_tab', this.divMain).removeClass('tw2gui_window_tab_active');
			$('div._tab_id_' + id, this.divMain).addClass('tw2gui_window_tab_active');
			$(this.divMain).addClass('active_tab_id_' + id);
			if (this.currentActiveTabId && this.currentActiveTabId != id) $(this.divMain).removeClass('active_tab_id_' + this.currentActiveTabId);
			this.currentActiveTabId = id;
			if (mkEvent) this.fireActivateTab(id);
			EventHandler.signal("WINDOW_TAB_OPENED", [id]);
			return this;
		},
		handler: {
			onResizeStart: function (event) {
				this.win.bringToTop()
			},
			onResizing: function (e, css) {
				$.triggerResizeEvent();
				css.width = css.width & (~1);
				css.height = css.height & (~1);
				this.win.doLayout();
				this.win.fireEvent(TWE("WINDOW_ONRESIZE"), this.win);
			},
			onResizeStop: function (e) {
				this.win.doLayout();
				this.win.fireEvent(TWE("WINDOW_RESIZED"), this.win);
			},
			onDragStart: function (event) {
				this.win.bringToTop();
				var shad = $('div.tw2gui_window_shadow_box', this.win.divMain);
				this.winwidth = shad.outerWidth() + shad.position().left;
				this.browserwidth = $(window).width();
			},
			onDrag: function (e, css) {
				css.left = Math.min(this.browserwidth - this.winwidth + 610, Math.max(-610, css.left));
				css.top = Math.max(0, css.top);
			},
			onDragStop: function (e, css) {},
			onWindowMouseEnter: function (event) {
				var win = event.data.win;
				if (win == currentHighlight) return;
				if (currentHighlight) currentHighlight.visualBlur();
				currentHighlight = win.visualFocus();
			},
			onWindowMouseDown: function (event) {
				event.data.win.bringToTop()
			},
			onClickTabCtrlLeft: function (e) {
				e.data.win.tabScroll(-1);
			},
			onClickTabCtrlRight: function (e) {
				e.data.win.tabScroll(1);
			},
			onClickTabCtrlSelect: function (e) {
				e.data.win.tabSelect();
			},
			onClickTab: function (e) {
				e.data.win.fireActivateTab(e.data.tabid);
				e.data.win.fireEvent(TWE('WINDOW_TAB_CLICK'), {
					window: e.data.win,
					tabid: e.data.tabid
				});
				return false;
			},
			onClick: function (e) {
				e.data.win.fireEvent(TWE("WINDOW_CLICK"), {
					window: e.data.win
				});
			},
			windowFireEvent: function (e) {
				e.data.win.fireEvent(e.data.type, e.data.win);
			}
		},
		fireEvent: function (etype, edata) {
			TWE(etype);
			if (!this.eventListeners) return;
			var ls = this.eventListeners[etype];
			if (!ls) return this;
			if (!edata) edata = {};
			var i;
			for (i = ls.length - 1; i >= 0; i -= 1) {
				var listener = ls[i];
				listener.f.apply(listener.c, [etype, edata, listener.d]);
			}
			return this;
		},
		visualBlur: function () {
			return this;
		},
		visualFocus: function () {
			return this;
		},
		setMiniTitle: function (t) {
			this.miniTitle = t;
			this.fireEvent(TWE("WINDOW_MINI_TITLE_CHANGED"), this);
			return this;
		},
		getMiniTitle: function () {
			return this.miniTitle || "?";
		},
		setTitle: function (title) {
			if (!title) {
				$(this.divMain).addClass("empty_title");
			} else {
				this.titler.setText(title);
				$(this.divMain).removeClass("empty_title");
			}
			return this;
		},
		setSplitWindow: function (on) {
			if (on) $(this.divMain).addClass("splitwindow");
			else $(this.divMain).removeClass("splitwindow");
			return this;
		},
		setResizeable: function (on) {
			$('div.tw2gui_window_sizer', this.divMain).css("display", on ? "block" : "none");
			return this;
		},
		getContentPane: function () {
			return $('div.tw2gui_window_content_pane', this.divMain)[0];
		},
		appendToContentPane: function () {
			var self = $('div.tw2gui_window_content_pane', this.divMain);
			self.append.apply(self, arguments);
			return this;
		},
		clearContentPane: function () {
			$('div.tw2gui_window_content_pane', this.divMain).empty();
			return this;
		},
		getWindowPane: function () {
			return $('div.tw2gui_window_pane', this.divMain)[0]
		},
		appendToWindowPane: function (x) {
			$('div.tw2gui_window_pane', this.divMain).append(x);
			return this;
		},
		clearWindowPane: function (x) {
			$('div.tw2gui_window_pane', this.divMain).empty();
			return this;
		},
		setSize: function (w, h) {
			$(this.divMain).width(w & (~1)).height(h & (~1));
			this.doLayout();
			return this;
		},
		center: function (x, y) {
			$(this.divMain).center(x, y);
			return this;
		},
		bringToTop: function () {
			$(this.divMain).bringToTop();
			EventHandler.signal("window_focus_changed", [this]);
			this.fireEvent(TWE("WINDOW_FOCUS"), this.win);
			return this;
		},
		doLayout: function () {
			if ($(this.divMain).hasClass('tw2gui_window_notabs')) return;
			var tw = 0;
			var barw = $('div.tw2gui_window_tabbar', this.divMain).width();
			var tabbar = $('div.tw2gui_window_tabbar_tabs', this.divMain);
			var xoff = tabbar.position().left;
			var hidden = [];
			var thres = -5 - xoff;
			$('div.tw2gui_window_tab', this.divMain).each(function (i, e) {
				tw += $(e).outerWidth(true);
				if (tw - thres > barw) hidden.push(e);
			});
			if (xoff < 5 && tw + xoff < barw + 5) tabbar.css('left', Math.min(5, barw - tw));
			var control = $('div.tw2gui_window_tab_control', this.divMain);
			if ((barw > tw - thres || tw == 0) && xoff >= 5) {
				if (this._showtabcontrol) {
					this._showtabcontrol = false;
					control.animate({
						'top': -control.height() + "px"
					}, {
						duration: 100,
						easing: "swing"
					})
				}
			} else {
				if (!this._showtabcontrol) {
					this._showtabcontrol = true;
					control.animate({
						'top': '0px'
					}, {
						duration: 100,
						easing: "swing"
					})
				}
			}
			return this;
		},
		tabScroll: function (dir) {
			if (dir * dir != 1) return this;
			var tabs = $('div.tw2gui_window_tabbar_tabs', this.divMain);
			tabs.clearQueue();
			var xoff = tabs.position().left;
			if ((dir < 0 && xoff >= 5)) return this;
			var tw = 0;
			var barw = $('div.tw2gui_window_tabbar', this.divMain).width();
			var thres = 15 - xoff;
			var scrollto = 0;
			$('div.tw2gui_window_tab', this.divMain).each(function (i, e) {
				if (scrollto) return;
				var ew = $(e).outerWidth(true);
				if (dir > 0 && tw + xoff - 25 > barw) scrollto = tw;
				tw += ew;
				if (dir < 0 && tw >= -xoff) scrollto = -(tw - ew) + 15;
			});
			if (dir > 0 && !scrollto) scrollto = tw;
			if (!scrollto) return this;
			if (dir > 0) {
				tabs.animate({
					left: -(scrollto - barw) + "px"
				});
			} else {
				tabs.animate({
					left: (scrollto) + "px"
				});
			}
			return this;
		},
		tabSelect: function () {
			return this;
		},
		setModal: function () {
			$(this.divMain).append($("<div class='tw2gui_modal' />").append("<img src='https://westrus.innogamescdn.com/images/curtain_bg.png' style='width:100%;height:100%;opacity:0.7;'/>"));
		}
	});
	$(window).on('dblclick', function () {
		return false
	});
	west.define('west.gui.Window.extension.box', west.gui.Component, {
		init: function (win, wrapperPos) {
			this.divMain = $("<div class='tw2gui_window_extension_box'/>");
			this.btn = $("<div title='<b>" + "Закрыть/Открыть".escapeHTML() + "</b>' class='tw2gui_window_extension_box_btn'/>");
			this.pseudobtn = $("<div style='position:absolute;right:0;width:20px;height:20px;z-index:11;cursor:pointer;'/>");
			this.wrapper = $("<div class='tw2gui_window_extension_box_wrap'/>");
			this.wrapperPos = wrapperPos || 25;
			if (wrapperPos && wrapperPos < 25)
				this.wrapperPos = 25;
			var scroll = new west.gui.Scrollpane();
			scroll.appendContent("<div class='tw2gui_window_extension_box_content'/>");
			this.wrapper.append("<div class='tw2gui_window_extension_box_head'/>", scroll.getMainDiv());
			var that = this;
			var clk = function () {
				that.setVisible(!that.visible);
			};
			this.btn.click(clk);
			this.pseudobtn.click(clk);
			this.divMain.append(this.btn, this.wrapper.append(this.pseudobtn));
			$(win.getMainDiv()).prepend(this.divMain);
			this.visible = true;
			return this;
		},
		setVisible: function (state) {
			if (this.visible == state) return false;
			this.btn.css("background-position", state ? "-17px 0" : "0 0");
			var btnCss = {
				left: state ? 264 : this.wrapperPos - 21
			};
			var wrapperCss = {
				left: state ? 0 : -(this.wrapper.outerWidth() - this.wrapperPos)
			};
			if (Config.get("gui.main.animations")) {
				this.btn.stop().animate(btnCss);
				this.wrapper.stop().animate(wrapperCss);
			} else {
				this.btn.css(btnCss);
				this.wrapper.css(wrapperCss);
			}
			this.visible = state;
			return this;
		},
		setHead: function (data) {
			$("div.tw2gui_window_extension_box_head", this.divMain).html(data);
			return this;
		},
		setContent: function (data) {
			$("div.tw2gui_window_extension_box_content", this.divMain).html(data);
			return this;
		}
	});
	west.define('west.gui.Plusminusfield', west.gui.Component, {
		init: function (id, start_value, min_value, max_value, extra_points, callbackPlus, callbackMinus, callbackWheel) {
			var that = this;
			this.divMain = $('<div class="tw2gui_plusminus" id="' + id + '"></div>').mousewheel(function (ev, delta) {
				if (callbackWheel(ev, delta, that)) {
					that.toggleMinus();
					that.togglePlus();
				}
			});
			this.current_value = start_value;
			this.max_value = parseInt(max_value);
			this.min_value = min_value;
			this.extra = extra_points;
			this.revision = 0;
			this.disabledPlus = false;
			this.disabledMinus = false;
			this.id = id;
			this.data = {};
			this.divMain.guiElement = this;
			var minus = $('<span class="butMinus"></span>').click({
				obj: this
			}, function (ev) {
				if (callbackMinus(ev)) {
					that.toggleMinus();
					that.togglePlus();
				}
			});
			var plus = $('<span class="butPlus"></span>').click({
				obj: this
			}, function (ev) {
				if (callbackPlus(ev)) {
					that.toggleMinus();
					that.togglePlus();
				}
			});
			$(this.divMain).append(minus, $('<span unselectable="on" class="displayValue unselectable">' + this.current_value + '</span>'), $('<span unselectable="on" class="displayValueBonus' + (this.extra > 0 ? ' text_green' : '') + ' unselectable">' + parseInt(this.current_value + this.extra) + '</span>').hide(), plus);
			this.toggleMinus();
			this.togglePlus();
		},
		setWidth: function (w) {
			$('span.displayValue, span.displayValueBonus', this.divMain).css('width', w - 24 + 'px');
			return this;
		},
		setValue: function (v) {
			this.revision += (v - this.current_value);
			this.current_value = v;
			return this;
		},
		getValue: function () {
			return this.current_value;
		},
		getStartValue: function () {
			return this.current_value - this.revision;
		},
		setData: function (dataObj) {
			this.data = dataObj;
			return this;
		},
		update: function (start, min, max, extra) {
			this.setValue(start);
			this.max_value = parseInt(max);
			this.min_value = min;
			this.extra = extra;
			return this;
		},
		setMin: function (new_min) {
			if (new_min !== this.min_value && new_min <= this.max_value) {
				this.min_value = new_min;
			}
			return this;
		},
		getMin: function () {
			return this.min_value;
		},
		setMax: function (new_max) {
			if (new_max && new_max !== this.max_value && new_max >= this.min_value) {
				this.max_value = new_max;
			}
			return this;
		},
		getMax: function () {
			return this.max_value;
		},
		togglePlus: function () {
			if (this.max_value == this.current_value) {
				$('span.butPlus', this.divMain).css('opacity', 0.3);
			} else {
				$('span.butPlus', this.divMain).css('opacity', 1);
			}
			return this;
		},
		toggleMinus: function () {
			if (this.min_value == this.current_value) {
				$('span.butMinus', this.divMain).css('opacity', 0.3);
			} else {
				$('span.butMinus', this.divMain).css('opacity', 1);
			}
			return this;
		}
	});
	west.define('west.gui.Dialog', west.gui.Component, {
		init: function (title, msg, icon) {
			this.divMain = $("<div class='tw2gui_dialog'>" + "<div class='tp_front'>" + "<div class='tw2gui_bg_tl'/>" + "<div class='tw2gui_bg_tr'/>" + "<div class='tw2gui_bg_bl'/>" + "<div class='tw2gui_bg_br'/>" + "</div>" + "<div class='tw2gui_inner_window_title'>" + "<div class='tw2gui_inner_window_title_left'/>" + "<div class='tw2gui_inner_window_title_right'/>" + "</div>" + "<div class='tw2gui_dialog_content'>" + "<div class='tw2gui_dialog_text'/>" + "<div style='clear: both;'/>" + "</div>" + "<div/>");
			this.modalframe = null;
			this.text = null;
			this.title = new west.gui.Textart("Сообщение", "", 32, "bold 20pt Times New Roman").appendTo(this.$(".tw2gui_inner_window_title"));
			this.framefix = $("<div class='tw2gui_dialog_framefix' />").append(this.divMain);
			if (undefined !== title) this.setTitle(title);
			if (undefined !== msg) this.setText(msg);
			if (undefined !== icon) this.setIcon(icon);
		},
		after: function (el) {
			el.after(this.divMain);
			return this;
		},
		setX: function (x) {
			this.divMain.css('left', x);
			return this;
		},
		setY: function (y) {
			this.divMain.css('top', y);
			return this;
		},
		setPosition: function (x, y) {
			this.divMain.css({
				'left': x,
				'top': y
			});
			return this;
		},
		setWidth: function (width) {
			this.$(".tw2gui_dialog_content").css("width", width);
			return this;
		},
		setHeight: function (height) {
			this.$(".tw2gui_dialog_content").css("height", height);
			return this;
		},
		setDimension: function (width, height) {
			this.$(".tw2gui_dialog_content").css({
				"width": width,
				"height": height
			});
			return this;
		},
		setCharacter: function (name) {
			this.divMain.append('<div class="tw2gui_dialog_character character_' + name + '"></div>');
			return this;
		},
		removeCharacter: function () {
			this.$(".tw2gui_dialog_character").remove();
			return this;
		},
		getId: function () {
			return this.divMain.attr('id');
		},
		setId: function (id) {
			this.divMain.attr('id', id);
			return this;
		},
		getTitle: function () {
			return this.title.getText();
		},
		setTitle: function (title) {
			this.title.setText(title);
			return this;
		},
		getText: function () {
			return this.text;
		},
		setText: function (msg) {
			var elMsg = undefined,
				e = this.$(".tw2gui_dialog_text");
			try {
				elMsg = $(msg);
				if (0 != elMsg.length)
					e.css("float", "none").html(elMsg);
			} catch (er) {}
			if (undefined === elMsg || 0 == elMsg.length)
				e.text(msg);
			this.text = msg;
			return this;
		},
		setIcon: function (id) {
			this.$(".tw2gui_dialog_icon").remove();
			this.$(".tw2gui_dialog_text").css({
				"float": "none",
				"margin-left": 75
			}).before("<div class='tw2gui_dialog_icon system_icon_" + id + "'/>");
			return this;
		},
		addButton: function (text, callback, context) {
			var e = this.$(".tw2gui_dialog_actions");
			if (0 === e.length) {
				e = $("<div class='tw2gui_dialog_actions'/>");
				this.$(".tw2gui_dialog_content").after(e);
			}
			if (text instanceof west.gui.Button) {
				text.appendTo(e);
				return this;
			}
			switch (text) {
			case "no":
				text = "Нет";
				break;
			case "yes":
				text = "Да";
				break;
			case "ok":
				text = "ОК";
				break;
			case "change":
				text = "Изменить";
				break;
			case "submit":
				text = "Подтвердить";
				break;
			case "cancel":
				text = "Отмена";
				break;
			}
			var btn = new west.gui.Button(text, function () {
				if (!callback || false != callback.call(context, this, btn)) {
					this.hide();
				}
			}, this).appendTo(e);
			return this;
		},
		setModal: function (state, outsideClickCancel, bgopts) {
			if (null !== this.modalframe && false == state) {
				this.modalframe.remove();
				this.modalframe = null;
				this.setBlockGame(false);
				return this;
			}
			bgopts = true === bgopts ? {
				bg: "https://westrus.innogamescdn.com/images/useful/opacity03.png",
				opacity: 1.0
			} : $.extend({
				bg: "https://westrus.innogamescdn.com/images/transparent.png",
				opacity: 1.0
			}, bgopts);
			var zindex = this.divMain.css("z-index");
			zindex = zindex < 1 ? 1 : zindex;
			this.divMain.css("z-index", zindex + 1);
			this.modalframe = $("<a class='tw2gui_dialog_iecockblocker' style='position: relative; z-index: " + zindex + ";'>" + "<img src='" + bgopts.bg + "' style='width:100%;height:100%;opacity:" + bgopts.opacity + ";'/>" + "</a>");
			this.framefix.append(this.modalframe);
			var that = this;
			if (outsideClickCancel) {
				this.modalframe.mousedown(function () {
					if ('function' === typeof (outsideClickCancel)) {
						outsideClickCancel();
					}
					that.hide();
				});
			} else this.modalframe.css("cursor", "default");
			return this;
		},
		setDraggable: function (draggable) {
			if (draggable) {
				this.draggable = draggable;
				this.divMain.jqDrag('.tw2gui_inner_window_title', {
					onStart: this.handler.onDragStart,
					onStop: this.handler.onDragStop,
					onDrag: this.handler.onDrag,
					dialog: this
				});
			} else if (false === draggable) {
				this.draggable = draggable;
				$(this.divMain).jqDragOff('.tw2gui_inner_window_title');
			}
			return this;
		},
		setBlockGame: function (bool) {
			this.getFramefix().toggleClass('no_block', !bool);
			return this;
		},
		handler: {
			onDragStart: function (event) {
				this.dialwidth = this.dialog.divMain.outerWidth();
				this.browserwidth = $(window).width();
			},
			onDrag: function (e, css) {
				css.left = Math.min(this.browserwidth - this.dialwidth + 610, Math.max(-610, css.left));
				css.top = Math.max(0, css.top);
			},
			onDragStop: function (e, css) {}
		},
		getFramefix: function () {
			return this.framefix;
		},
		hide: function () {
			this.framefix.remove();
			return this;
		},
		getMainDiv: function () {
			return this.divMain;
		},
		show: function () {
			this.framefix.appendTo(document.body);
			if (0 == this.divMain.position().left && 0 == this.divMain.position().top) {
				this.divMain.css({
					"top": "50%",
					"left": "50%",
					"margin-top": "-" + (this.divMain.height() / 2) + "px",
					"margin-left": "-" + (this.divMain.width() / 2) + "px"
				});
			} else {
				var f = this.framefix,
					m = this.divMain;
				this.divMain.css({
					"left": Math.max(0, Math.min(m.position().left, f.width() - m.width())),
					"top": Math.max(0, Math.min(m.position().top, f.height() - m.height()))
				});
			}
			return this;
		}
	});
	west.gui.Dialog.SYS_WARNING = "warning";
	west.gui.Dialog.SYS_USERERROR = "usererror";
	west.gui.Dialog.SYS_OK = "ok";
	west.gui.Dialog.SYS_QUESTION = "question";
	west.define('west.gui.TextInputDialog', west.gui.Dialog, {
		init: function (title, msg, placeholder, icon) {
			this.placeholder = placeholder || '';
			west.gui.Dialog.prototype.init.call(this, title, msg, icon);
		},
		setText: function (text) {
			var textfield = new west.gui.Textfield().setPlaceholder(this.placeholder);
			west.gui.Dialog.prototype.setText.call(this, '<div class="fbar-add-dialog">' +
				text + '<br />' +
				jq2Html(textfield.getMainDiv()) + '</div>');
			textfield.getMainDiv().remove();
			return this;
		},
		setPlaceholder: function (placeholder) {
			this.placeholder = placeholder;
			return this;
		},
		addButton: function (text, callback, context) {
			return west.gui.Dialog.prototype.addButton.call(this, text, function (btn) {
				return callback ? callback.call(context, $('input', this.getMainDiv()).val(), this, btn) : undefined;
			}, this);
		},
		show: function () {
			west.gui.Dialog.prototype.show.call(this);
			$('input', this.getMainDiv()).focus().keypress(function (e) {
				if (e.which == 13) {
					$('div.tw2gui_button', this.getMainDiv()).first().click();
					e.preventDefault();
					return false;
				}
			}.bind(this));
			return this;
		}
	});
	west.define('west.gui.AmountSpecifier', west.gui.Component, {
		init: function (max) {
			this.max = max;
			this.current = 1;
			this.divMain = $('' + '<div>' + '<input class="item_popup_input" type="text" value="' + this.current + '" />' + '<span class="item_count_scrolls">' + '<img class="raise" src="https://westrus.innogamescdn.com/images/scrollbar/scroll_up.png" alt="' + 'Выше' + '">' + '<img class="lower" src="https://westrus.innogamescdn.com/images/scrollbar/scroll_down.png" alt="' + 'Ниже' + '">' + '</span>' + '<span class="item_popup_max_count">(' + this.max + ')</span>' + '</div>');
			this.$('.raise').on('click', this.raise.bind(this));
			this.$('.lower').on('click', this.lower.bind(this));
			this.$('.item_popup_max_count').on('click', this.setCount.bind(this));
		},
		getCurrent: function () {
			this.current = parseInt(this.$('.item_popup_input').val());
			return this.current;
		},
		setCount: function () {
			this.getCurrent();
			this.$('.item_popup_input').val(this.max);
		},
		lower: function () {
			this.getCurrent();
			if (this.current > 1) this.current--;
			this.$('.item_popup_input').val(this.current);
		},
		raise: function () {
			this.getCurrent();
			if (this.current < this.max) this.current++;
			this.$('.item_popup_input').val(this.current);
		}
	});
})(jQuery);

west.define('SystemError', west.gui.Dialog, {
	init: function (title, message, relog) {
		this.callParent();
		this.framefix.css("z-index", "9999");
		this.divMain.addClass("system_error");
		this.divMain.append("<div class='critical-error' />");
		this.$(".tp_front").remove();
		this.$(".tw2gui_inner_window_title_left").remove();
		this.$(".tw2gui_inner_window_title_right").remove();
		this.$(".tw2gui_dialog_content").append("<div class='system_instruction'/>");
		if (relog) {
			this.setInstructions(message || "Пожалуйста, зайди ещё раз.");
			this.addButton("На главную страницу", function () {
				window.location = Game.masterURL;
			});
		} else {
			this.setInstructions(message || ("Проверь соединение с интернетом." + "<br/>" + "Обнови страницу."));
			this.addButton("Откат", function () {
				window.location.reload();
				return false;
			})
			if ('production' != Game.environment) {
				this.addButton("Сообщить об ошибке", function () {
					BugreportWindow.open();
				});
			}
			this.addButton("Дальше");
		}
		this.setTitle("Попытка соединения не удалась").setText("Произошла непредусмотренная ошибка.").setModal(true, false, {
			bg: "https://westrus.innogamescdn.com/images/curtain_bg.png",
			opacity: 0.9
		});
	},
	setInstructions: function (instruction) {
		this.$(".system_instruction").empty().append(instruction);
		return this;
	}
});
west.define('UserMessage', west.gui.Dialog, {
	init: function (msg, type) {
		this.callParent();
		this.divMain.css({
			"cursor": "pointer",
			"max-width": "800px"
		});
		this.$(".tw2gui_dialog_text").css({
			"font-size": "20px",
			"padding": "12px 0",
			"max-width": "600px"
		});
		this.setType(undefined === type ? UserMessage.TYPE_ERROR : type).setText(msg);
	},
	getType: function () {
		return this.type;
	},
	setType: function (type) {
		if (undefined === type) return;
		this.type = type;
		switch (type) {
		case UserMessage.TYPE_SUCCESS:
			this.setIcon(west.gui.Dialog.SYS_OK);
			this.setTitle("Успех");
			break;
		case UserMessage.TYPE_HINT:
			this.setIcon(west.gui.Dialog.SYS_WARNING);
			this.setTitle("Подсказка");
			break;
		case UserMessage.TYPE_ERROR:
		default:
			this.setIcon(west.gui.Dialog.SYS_WARNING);
			this.setTitle("Внимание!");
			break;
		}
		return this;
	},
	hide: function () {
		if (!isDefined(window.Config) || !Config.get("gui.main.animations")) {
			this.divMain.delay(2000).hide(10, function () {
				$(this).remove();
			});
		} else {
			this.divMain.delay(600).fadeOut(2000, function () {
				$(this).remove();
			});
		}
	},
	show: function () {
		var main = this.divMain;
		main.unbind();
		var that = this;
		main.click(function () {
			$(this).remove();
		});
		main.hover(function () {
			if ($(this).css("opacity") >= 0.38) {
				$(this).clearQueue();
				$(this).stop();
				$(this).show();
				$(this).css("opacity", 100);
			}
		}, function () {
			that.hide();
		});
		main.mouseover();
		main.appendTo(document.body);
		var t = 20;
		var prop = {
			"left": ($(window).width() - main.width()) / 2,
			top: t
		};
		if (!isDefined(window.Config) || !Config.get("gui.main.animations")) {
			main.css(prop).mouseout();
		} else {
			main.css(jQuery.extend(prop, {
				opacity: 0.0,
				top: t - (t / 2)
			}));
			main.md_center({
				transition: 1000,
				opacity: 1.0,
				top: t
			}, function () {
				main.mouseout();
			});
		}
		return this;
	}
});
UserMessage.TYPE_SUCCESS = "success";
UserMessage.TYPE_ERROR = "error";
UserMessage.TYPE_HINT = "hint";
MessageSuccess = function (msg) {
	return new UserMessage(msg, UserMessage.TYPE_SUCCESS);
};
MessageHint = function (msg) {
	return new UserMessage(msg, UserMessage.TYPE_HINT);
};
MessageError = function (msg) {
	return new UserMessage(msg, UserMessage.TYPE_ERROR);
};

(function ($) {
	$.fn.guiElement = function () {
		for (var i = 0; i < this.length; i += 1)
			if (this[i].guiElement) return this[i].guiElement;
		return null;
	}
	west.define('west.gui.Component', null, {
		init: function (ext) {
			for (var k in ext)
				this[k] = ext[k];
		},
		$: function (css) {
			return $(css, this.divMain);
		},
		getMainDiv: function () {
			return this.divMain;
		},
		appendTo: function (el) {
			$(el).append(this.divMain);
			return this;
		},
		addClass: function (cls) {
			$(this.getMainDiv()).addClass(cls);
			return this;
		},
		removeClass: function (cls) {
			$(this.getMainDiv()).removeClass(cls);
			return this;
		},
		setTooltip: function (tooltip) {
			if (tooltip) {
				$(this.getMainDiv()).addMousePopup(tooltip);
			} else {
				this.removeTooltip();
			}
			return this;
		},
		removeTooltip: function () {
			$(this.getMainDiv()).removeMousePopup();
			return this;
		}
	});
	west.define('west.gui.Icon', west.gui.Component, {
		init: function (name, title) {
			this.divMain = $("<img alt='' class='tw2gui-iconset' src='https://westrus.innogamescdn.com/images/tw2gui/pixel-vfl3z5WfW.gif'/>");
			if (undefined !== title) {
				this.setTitle(title);
			}
			if (undefined !== name) {
				this.setName(name);
			}
		},
		setTitle: function (title) {
			return this.setTooltip(title);
		},
		setName: function (name) {
			name = "tw2gui-icon-" + name;
			if (undefined !== this.name)
				this.removeClass(this.name);
			this.addClass(name);
			this.name = name;
			return this;
		},
		getName: function () {
			return this.name;
		}
	});
	west.gui.Icon.get = function (name, title) {
		return new west.gui.Icon(name, title).getMainDiv();
	};
	west.define('west.gui.Textart', west.gui.Component, {
		init: function (tx, width, height, font) {
			this.div = $("<div class='textart_title'/>")[0];
			this.setGlow(3).setScaleX(1).setSize(width, height);
			if (tx) this.setText(tx);
			if (font) this.setFont(font);
		},
		setGlow: function (glow) {
			this.glow = glow;
			if (this.canvas) this.canvas.getContext("2d").shadowBlur = glow;
			return this;
		},
		setSize: function (width, height) {
			if (!(width && height)) {
				return this;
			}
			if (this.canvas) {
				this.canvas.width = width;
				this.canvas.height = height;
				var ctx = this.canvas.getContext("2d");
				ctx.textAlign = "center";
				ctx.textBaseline = "top";
				ctx.shadowBlur = this.glow;
				ctx.shadowColor = "#000";
				ctx.font = this.font;
			}
			$(this.div || this.canvas).css({
				width: width + "px",
				height: height + "px",
				"line-height": height + "px"
			});
			this.width = width;
			this.height = height;
			if (this.text) this.setText(this.text);
			return this;
		},
		setFont: function (font) {
			if (this.div) this.div.style.font = font;
			else this.canvas.font = font;
			this.font = font;
			return this;
		},
		setScaleX: function (x) {
			this.scaleX = x;
			return this;
		},
		appendTo: function (div) {
			$(div).append(this.div || this.canvas);
			return this;
		},
		getText: function () {
			return this.text;
		},
		setText: function (tx) {
			if (this.canvas) {
				var img = new Image();
				img.src = "https://westrus.innogamescdn.com/images/tw2gui/textfield/textglow.jpg?2";
				var self = this;
				img.onload = function () {
					var ctx = self.canvas.getContext("2d");
					var p = ctx.createPattern(img, "repeat");
					ctx.clearRect(0, 0, self.width, self.height);
					ctx.fillStyle = p;
					ctx.setTransform(1, 0, 0, 1, 0, 0);
					ctx.scale(self.scaleX, 1);
					ctx.fillText(tx, self.width / 2 / self.scaleX, 0, self.width);
					ctx.fill();
				}
			} else {
				this.div.innerHTML = tx;
			}
			this.text = tx;
			return this;
		},
		ellipsis: function () {
			this.div.className = (this.div.className || "") + " shorten";
		}
	});
	west.define('west.gui.Button', west.gui.Component, {
		init: function (caption, onclick, context, data, title, cls) {
			this.divMain = $("<div class='tw2gui_button " + ((cls) ? cls : "") + "' " + (title ? ("title='" + title + "'") : "") + ">" + "<div class='tw2gui_button_right_cap'></div>" + "<div class='tw2gui_button_left_cap'></div>" + "<div class='tw2gui_button_middle_bg'></div>" + "</div>").click(this, this.handler.click)[0];
			this.divMain.guiElement = this;
			this.caption = new west.gui.Textart(caption, '', '', '').appendTo(this.divMain);
			this.setCaption(caption);
			this.disabled = false;
			this.onclick = onclick;
			this.context = context;
			this.data = data;
		},
		handler: {
			click: function (e) {
				e.data.click()
			}
		},
		click: function (callback, context, data) {
			if (undefined !== callback) {
				this.onclick = callback;
				this.context = context;
				this.data = data;
				return this;
			}
			if (this.disabled) return this;
			if (this.onclick) this.onclick.apply(this.context, [this, this.data]);
			return this;
		},
		setCaption: function (caption) {
			this.caption.setText(caption);
			return this;
		},
		setMinWidth: function (w) {
			this.divMain.style.minWidth = w + "px";
			return this;
		},
		setMaxWidth: function (w) {
			this.divMain.style.maxWidth = w + "px";
			this.caption.ellipsis();
			return this;
		},
		setWidth: function (w) {
			this.setMinWidth(w).setMaxWidth(w);
			return this;
		},
		disable: function () {
			this.disabled = true;
			this.addClass("inactive");
			return this;
		},
		setVisible: function (state) {
			$(this.divMain).css("display", state ? "inline-block" : "none");
			return this;
		},
		enable: function () {
			this.disabled = false;
			this.removeClass("inactive");
			return this;
		},
		setSelectbox: function (selectbox) {
			var that = this;
			this.click(function (e) {
				selectBox.show(e);
			});
		}
	});
	west.define('west.gui.Iconbutton', west.gui.Component, {
		init: function (icon, onclick, context, data, title) {
			if (icon instanceof west.gui.Icon)
				icon = icon.getMainDiv();
			else
				icon = $('<img class="button_icon" src="' + icon + '" />');
			this.divMain = $('<span class="tw2gui_iconbutton" ' + (title ? 'title="' + title + '"' : '') + '>' + '<span class="tw2gui_button_right_cap"></span>' + '<span class="tw2gui_button_left_cap"></span>' + '<span class="tw2gui_button_middle_bg"></span>' + '</span>').append(icon).click(this, this.handler.click)[0];
			this.divMain.guiElement = this;
			this.disabled = false;
			this.onclick = onclick;
			this.context = context || null;
			this.data = data || null;
		},
		handler: {
			click: function (e) {
				e.data.click()
			}
		},
		click: function () {
			if (this.disabled) return this;
			if (this.onclick) this.onclick.apply(this.context, [this, this.data]);
			return this;
		},
		setTitle: function (title) {
			return this.setTooltip(title);
		},
		setWidth: function (w) {
			$(this.divMain).css('min-width', w + 'px');
			return this;
		},
		disable: function () {
			this.disabled = true;
			this.addClass("inactive");
			return this;
		},
		enable: function () {
			this.disabled = false;
			this.removeClass("inactive");
			return this;
		}
	});
	west.define('west.gui.Scrollbar', west.gui.Component, {
		init: function (horizontal, noautohide) {
			this.divMain = $("<div class='tw2gui_scrollbar'>" + "<div class='tw2gui_scrollbar_bg1' />" + "<div class='tw2gui_scrollbar_bg2' />" + "<div class='tw2gui_scrollbar_pulley_area'>" + "<div class='tw2gui_scrollbar_pulley'>" + "<div class='tw2gui_scrollbar_pulley_bg1' />" + "<div class='tw2gui_scrollbar_pulley_bg2' />" + "<div class='tw2gui_scrollbar_pulley_bg3' />" + "</div>" + "</div>" + "<div class='tw2gui_scrollbar_arrow_leup' />" + "<div class='tw2gui_scrollbar_arrow_ribo' />" + "</div>")[0];
			this.divMain.guiElement = this;
			$(this.divMain).addClass(horizontal ? 'horizontal' : 'vertical').resize(this, this.handler.onResize);
			var that = this;
			$(this.divMain).mousewheel(function (e, d) {
				that.onWheeled(d);
				return false
			});
			$('.tw2gui_scrollbar_arrow_leup', this.divMain).on('mousedown', {
				bar: this,
				dir: -1
			}, this.handler.onArrowMouseDown).on('mouseup', this, this.handler.onArrowMouseUp);
			$('.tw2gui_scrollbar_arrow_ribo', this.divMain).on('mousedown', {
				bar: this,
				dir: 1
			}, this.handler.onArrowMouseDown).on('mouseup', this, this.handler.onArrowMouseUp);
			$('div.tw2gui_scrollbar_pulley_area', this.divMain).on('mousedown', this, this.handler.onAreaMouseDown);
			this._divPullArea = $('div.tw2gui_scrollbar_pulley_area', this.divMain);
			this._divPulley = $('div.tw2gui_scrollbar_pulley', this.divMain);
			this._divPulley.jqDrag(this._divPulley, {
				onStart: this.handler.onDragStart,
				onStop: this.handler.onDragStop,
				onDrag: this.handler.onDrag,
				bar: this
			})
			this.listeners = [];
			this.horizontal = horizontal || false;
			this.currentPosition = 0;
			this.setPullRange(300);
			this.scrollmode = "absolute";
			if (!(this.noautohide = noautohide))
				this.hide();
			this.maxScrolled = true;
		},
		getCurrentPosition: function () {
			return this.currentPosition;
		},
		handler: {
			onDragStart: function () {
				if (this.bar.horizontal) {
					this.rangex = [0, $('div.tw2gui_scrollbar_pulley_area', this.bar.divMain).width() - $('div.tw2gui_scrollbar_pulley', this.bar.divMain).width()];
					this.rangey = [0, 0];
				} else {
					this.rangex = [0, 0];
					this.rangey = [0, $('div.tw2gui_scrollbar_pulley_area', this.bar.divMain).height() - $('div.tw2gui_scrollbar_pulley', this.bar.divMain).height()];
				}
			},
			onDragStop: function () {
				this.bar.move(0);
			},
			onDrag: function () {
				this.bar.scream(true)
			},
			onResize: function (e) {
				e.data.setPullRange();
				e.stopPropagation();
			},
			onAreaMouseDown: function (e) {
				var that = e.data;
				var y = that.horizontal ? e.offsetX || e.layerX : e.offsetY || e.layerY;
				var ph = that._divPulley[that.horizontal ? 'width' : 'height']();
				var py = that._divPulley.position()[that.horizontal ? 'left' : 'top'];
				that.move((y - ph / 2) - py, true);
				return false;
			},
			onArrowMouseDown: function (e) {
				var that = e.data.bar;
				that.move(e.data.dir * 10)
				that._scroller = window.setInterval(function () {
					that.move(e.data.dir * 10)
				}, 100);
				return false;
			},
			onArrowMouseUp: function (e) {
				var that = e.data;
				window.clearInterval(that._scroller);
				delete that._scroller;
			}
		},
		setScrollmode: function (mode) {
			this.scrollmode = mode
			return this;
		},
		setPullRange: function (range) {
			if (range === undefined) range = this.pullRange;
			else this.pullRange = range;
			var havail = this._divPullArea[this.horizontal ? 'width' : 'height']();
			var per = Math.max(15, Math.floor(Math.min(1, (havail + 30) / this.pullRange) * 100));
			this._divPulley.css(this.horizontal ? 'width' : 'height', per + "%");
			this.checkHide(per);
			this.currentPosition = -1;
			return this;
		},
		checkHide: function (per) {
			if (this.noautohide)
				return this;
			if (per == 100 && this.visible()) {
				this.hide();
			} else if (per != 100 && !this.visible()) {
				this.show();
			}
			return this;
		},
		hide: function () {
			this.divMain.style.visibility = "hidden";
		},
		show: function () {
			this.divMain.style.visibility = "visible";
		},
		visible: function () {
			return this.divMain.style.visibility != "hidden";
		},
		addDragListener: function (f, context, data) {
			this.listeners.unshift({
				f: f,
				c: context,
				d: data
			});
			return this;
		},
		removeDragListener: function (f) {
			for (var i = this.listeners.length - 1; i >= 0; i -= 1) {
				this.listeners.splice(i, 1);
			}
			return this;
		},
		move: function (px, animated, absolute) {
			var pulley = $('div.tw2gui_scrollbar_pulley', this.divMain),
				hare = $('div.tw2gui_scrollbar_pulley_area', this.divMain)[this.horizontal ? 'width' : 'height'](),
				topMax = hare - pulley[this.horizontal ? 'width' : 'height'](),
				top = Math.min(topMax, Math.max(0, px + (absolute ? 0 : pulley.position()[this.horizontal ? 'left' : 'top']))),
				css = {};
			css[this.horizontal ? 'left' : 'top'] = top + 'px';
			this.maxScrolled = top == topMax;
			if (animated) {
				var that = this;
				pulley.animate(css, {
					step: function () {
						that.scream()
					}
				});
			} else {
				pulley.css(css);
			}
			return this.scream();
		},
		onWheeled: function (delta) {
			var hare = $('div.tw2gui_scrollbar_pulley_area', this.divMain)[this.horizontal ? 'width' : 'height']();
			var pulley = $('div.tw2gui_scrollbar_pulley', this.divMain);
			var hpul = pulley[this.horizontal ? 'width' : 'height']();
			var hrest = hare - hpul;
			var amount = 0;
			if (hrest >= 0) {
				amount = Math.floor(.5 - delta * 50 * hrest / this.pullRange);
			}
			if (amount == 0) amount = delta < 0 ? 1 : -1;
			this.move(amount);
			return false;
		},
		calcRelpos: function () {
			var hare = $('div.tw2gui_scrollbar_pulley_area', this.divMain)[this.horizontal ? 'width' : 'height']();
			var pulley = $('div.tw2gui_scrollbar_pulley', this.divMain);
			var hpul = pulley[this.horizontal ? 'width' : 'height']();
			var puly = pulley.position()[this.horizontal ? 'left' : 'top'];
			if (hpul + puly > hare) {
				puly = Math.max(0, hare - hpul);
				pulley.css(this.horizontal ? 'left' : 'top', puly + "px");
			}
			return hare == hpul ? 0 : Math.min(1, Math.max(0, puly / (hare - hpul)));
		},
		scream: function (done) {
			var rel = this.calcRelpos();
			if (rel == this.currentPosition) return;
			this.currentPosition = rel;
			var hfull = $(this.divMain)[this.horizontal ? 'width' : 'height']();
			var pxposnow = Math.floor(rel * (this.pullRange - hfull));
			var pxposprev = Math.floor(rel * (this.pullRange - hfull));
			for (var i = this.listeners.length - 1; i >= 0; i -= 1) {
				var h = this.listeners[i];
				h.f.apply(h.c, [this, pxposnow, pxposprev, h.d]);
			}
			return this;
		}
	});
	west.define('west.gui.Scrollpane', west.gui.Component, {
		init: function (classname, noautohide, smartscrolling) {
			this.divMain = $("<div class='tw2gui_scrollpane'>" + "<div class='tw2gui_scrollpane_clipper'>" + "<div class='tw2gui_scrollpane_clipper_contentpane' />" + "</div>" + "<div class='tw2gui_scrollpane_verticalscrollbar_area' />" + "</div>")[0];
			this.divMain.guiElement = this;
			this.contentPane = $('div.tw2gui_scrollpane_clipper_contentpane', this.divMain).resize(this, this.handler.onResize);
			this.clipPane = $('div.tw2gui_scrollpane_clipper', this.divMain);
			$(this.divMain).addClass(classname);
			this.verticalBar = new west.gui.Scrollbar(false, noautohide).addDragListener(this.onScrolled, this, true);
			$('div.tw2gui_scrollpane_verticalscrollbar_area', this.divMain).append(this.verticalBar.getMainDiv());
			var that = this;
			$(this.divMain).mousewheel(function (e, d) {
				that.verticalBar.onWheeled(d);
			});
			this.smartscrolling = smartscrolling;
		},
		handler: {
			onResize: function (e) {
				e.data.onResized();
				e.stopPropagation();
			}
		},
		getContentPane: function () {
			return this.contentPane;
		},
		appendContent: function (c) {
			this.contentPane.append(c);
			return this
		},
		onScrolled: function (bar, pos, oldpos, isvertical) {
			this.contentPane.css('top', -pos + "px");
		},
		onResized: function () {
			var ch = this.contentPane.height(),
				mh = parseInt($(this.divMain).css("max-height")),
				maxScrolled = this.verticalBar.maxScrolled,
				scrollPos = this.getScrollPos();
			if (mh) $(this.divMain).css("height", Math.min(ch, mh));
			this.verticalBar.setPullRange(ch);
			if (!this.verticalBar.visible()) {
				if (scrollPos.rely !== 0) this.scrollTo(0, 0);
				this.clipPane.css("margin-right", "0px");
			} else {
				if (this.smartscrolling && maxScrolled) this.scrollToEnd();
				this.clipPane.css("margin-right", "15px");
			}
		},
		getScrollPos: function () {
			var xy = this.contentPane.position();
			var info = {
				contentHeight: this.contentPane.height(),
				contentWidth: this.contentPane.width(),
				x: -xy.left,
				y: -xy.top,
				clipHeight: this.clipPane.height(),
				clipWidth: this.clipPane.width()
			};
			info.relx = info.clipWidth > info.contentWidth ? 0 : Math.min(1, info.x / (info.contentWidth - info.clipWidth));
			info.rely = info.clipHeight > info.contentHeight ? 0 : Math.min(1, info.y / (info.contentHeight - info.clipHeight));
			return info;
		},
		scrollTo: function (x, y, absolute) {
			this.verticalBar.setPullRange(this.contentPane.height()).move(y, false, absolute);
		},
		scrollToEnd: function () {
			this.scrollTo(0, this.contentPane.height(), true);
		},
		scrollToTop: function () {
			this.scrollTo(0, 0, true);
		},
		scrollBy: function (x, y) {
			this.scrollTo(x, y, false);
		}
	});
	west.define('west.gui.Groupframe', west.gui.Component, {
		init: function (cssclass, content) {
			this.divMain = $("<div class='tw2gui_groupframe " + (cssclass || "") + "'>" + "<div class='tw2gui_groupframe_background bg0'></div>" + "<div class='tw2gui_groupframe_background bg1'></div>" + "<div class='tw2gui_groupframe_background bg2'></div>" + "<div class='tw2gui_groupframe_background bg3'></div>" + "<div class='tw2gui_groupframe_background bg4'></div>" + "<div class='tw2gui_groupframe_frame tw2gui_bg_tl'></div>" + "<div class='tw2gui_groupframe_frame tw2gui_bg_tr'></div>" + "<div class='tw2gui_groupframe_frame tw2gui_bg_bl'></div>" + "<div class='tw2gui_groupframe_frame tw2gui_bg_br'></div>" + "<div class='tw2gui_groupframe_content_pane'>" +
				(content || "") + "</div>" + "</div>");
			this.divMain[0].guiElement = this;
		},
		appendToContentPane: function () {
			var self = $('> div.tw2gui_groupframe_content_pane', this.divMain);
			self.append.apply(self, arguments);
			return this;
		},
		setId: function (id) {
			this.divMain.attr('id', id);
			return this;
		},
		getMainDiv: function () {
			return this.divMain[0];
		}
	});
	west.define('west.gui.Table', west.gui.Component, {
		init: function (no_scrollbar) {
			this.divMain = $('<div class="fancytable"/>').append("<div class='_bg tw2gui_bg_tl'/>", "<div class='_bg tw2gui_bg_tr'/>", "<div class='_bg tw2gui_bg_bl'/>", "<div class='_bg tw2gui_bg_br'/>", "<div class='trows'><div class='thead statics'><div class='row_head'></div></div>" + "<div class='tbody'>" + "<div class='_bg tw2gui_bg_l'/>" + "<div class='_bg tw2gui_bg_r'/>" + "<div class='rows' />" + "</div>" + "<div class='tfoot statics'><div class='row_foot'></div></div></div>");
			this.divMain[0].guiElement = this;
			this.noScrollbar = no_scrollbar;
			if (no_scrollbar) {
				this.tbody = this.$('div.rows', this.divMain);
			} else {
				this.bodyscroll = new west.gui.Scrollpane();
				this.$('div.tbody', this.divMain).append(this.bodyscroll.getMainDiv())
				this.tbody = this.bodyscroll.getContentPane();
			}
			this.column = [];
			this.colnames = {};
			this.rows = [];
		},
		setScrollbar: function () {
			this.noScrollbar = false;
			return this;
		},
		removeScrollbar: function () {
			this.noScrollbar = true;
			return this;
		},
		setId: function (id) {
			this.divMain.attr('id', id);
			return this;
		},
		addColumn: function (css, dataObj) {
			var col = $('<div class="cell cell_' + this.column.length + ' ' + css + '"></div>');
			if (dataObj) col.data(dataObj);
			this.$('>div.trows >div.statics > div').append(col);
			this.colnames[css] = this.column.length;
			this.column.push(css);
			return this;
		},
		addColumns: function (arr_css) {
			var appends = "";
			for (var i = 0; i < arr_css.length; i++) {
				appends += "<div class='cell cell_" + this.column.length + " " + arr_css[i] + "'></div>";
				this.colnames[arr_css[i]] = this.column.length;
				this.column.push(arr_css[i]);
			}
			this.$('>div.trows >div.statics > div').append(appends);
			return this;
		},
		appendRow: function (data, cssclass) {
			var row = $('<div class="row row_' + this.rows.length + ' ' + (cssclass || "") + '"></div>');
			if (undefined != data)
				data.appendTo(row);
			this.rows.push(row);
			this.tbody.append(row);
			return this;
		},
		buildRow: function (cssclass, contentObj, modifyRow) {
			var row = $('<div class="row row_' + this.rows.length + ' ' + (cssclass || "") + '"></div>');
			var appends = '';
			var i = 0;
			for (var key in contentObj) {
				appends += '<div class="cell_' + i + ' ' + key + '">' + contentObj[key] + '</div>';
				i++;
			}
			row.html(appends);
			if (modifyRow)
				row = modifyRow(row);
			this.rows.push(row);
			this.tbody.append(row);
			return this;
		},
		createEmptyMessage: function (text) {
			this.$('div.tbody').append($('<div class="no-content" style="position: absolute; left:20px;right:20px; top:50px; text-align: center;"><img src="https://westrus.innogamescdn.com/images/icons/warn_circle.png">&nbsp;&nbsp;<span class="empty-list" style="font-size: 10pt; font-weight: bold;">' + text + '</span></div>').hide());
			return this;
		},
		clearBody: function () {
			if (!this.noScrollbar)
				this.bodyscroll.scrollToTop();
			this.tbody.empty();
			this.rows = [];
		},
		getCell: function (row, col) {
			if (typeof col == "string") col = this.colnames[col];
			if (col < 0 || col >= this.column.length) return null;
			if (row < 0) row += this.rows.length;
			row = this.$('div.row_' + row).first();
			var cell = $('div.cell_' + col, row);
			if (cell.length == 0) {
				var c;
				for (var i = col - 1; i >= 0; i -= 1) {
					if ((c = $('div.cell_' + i, row)).length) break;
				}
				cell = $('<div class="cell cell_' + col + ' ' + this.column[col] + '"></div>');
				if (!c || !c.length) row.append(cell);
				else c.after(cell);
			}
			return cell;
		},
		getRow: function (id) {
			return id === undefined ? this.rows[this.rows.length - 1] : this.rows[id];
		},
		appendToCell: function (row, col, content) {
			var cell = this.getCell(row, col);
			cell.append(content);
			return this;
		},
		appendTitleToCell: function (row, col, title) {
			var cell = this.getCell(row, col);
			cell.attr('title', title);
			return this;
		},
		appendToThCell: function (row, col, title, content) {
			var cell = this.getCell(row, col);
			cell.append($('<span title="' + title + '">' + content + '</span>'));
			return this;
		},
		appendToFooter: function (cell, content) {
			this.$('div.row_foot div.' + cell, this.divMain).append(content);
			return this;
		},
		removeFooter: function () {
			this.$('div.row_foot', this.divMain).remove();
			return this;
		}
	});
	west.define('west.gui.Htmltable', west.gui.Component, {
		init: function () {
			this.divMain = $('<table class="tw2gui_htmltable"><thead></thead>' + '<tbody><tr><td class="tw2gui_htmltable_tdcontainer" colspan="1">' + '<div class="tw2gui_htmltable_div_content"><table class="tw2gui_htmltable_contenttable"></table></div>' + '</td></tr></tbody><tfoot></tfoot></table>');
			this.divMain[0].guiElement = this;
		},
		buildHeader: function (headerObj) {
			var header = '<tr>';
			var counter = 0;
			for (var key in headerObj) {
				header += '<th class="' + key + '">' + headerObj[key] + '</th>';
				counter++;
			}
			header += '<th class="for_scrollbar">&nbsp;</th></tr>';
			$('thead', this.divMain).html(header);
			$('td.tw2gui_htmltable_tdcontainer', this.divMain).attr('colspan', counter);
			return this;
		},
		buildFooter: function (footerObj) {
			var footer = '<tr>';
			for (var key in footerObj) {
				footer += '<th class="' + key + '">' + footerObj[key] + '</th>';
			}
			footer += '<th class="for_scrollbar">&nbsp;</th></tr>';
			$('tfoot', this.divMain).html(footer);
			return this;
		},
		appendRow: function (id, bodyObj) {
			var row = '<tr id="' + id + '">';
			for (var key in bodyObj) {
				row += '<td class="' + key + '">' + bodyObj[key] + '</td>';
			}
			row += '</tr>';
			$('table.tw2gui_htmltable_contenttable', this.divMain).append($(row));
			return this;
		},
		createRow: function (rowObj) {
			var row = '<tr>';
			for (var key in rowObj) {
				row += '<td class="' + key + '">' + rowObj[key] + '</td>';
			}
			row += '</tr>';
			return row;
		},
		appendRows: function (arrBodyObj) {
			var tbody = '';
			for (var i in arrBodyObj) {
				tbody += this.createRow(arrBodyObj[i]);
			}
			$('table.tw2gui_htmltable_contenttable', this.divMain).html($(tbody));
			return this;
		},
		setSize: function (width, height) {
			$(this.divMain).css({
				'width': width + 'px',
				'height': height + 'px'
			});
			$('div.tw2gui_htmltable_div_content, table.tw2gui_htmltable_contenttable', this.divMain).css({
				'height': height - 25 + 'px'
			});
			return this;
		},
		clearBody: function () {
			$('table.tw2gui_htmltable_contenttable', this.divMain).empty();
		}
	});
	west.define('west.gui.Combobox', west.gui.Component, {
		init: function (id) {
			this.divMain = $('<span ' + (id ? 'id="' + id + '" ' : '') + 'class="tw2gui_combobox"><span class="tw2gui_combobox_text"></span>' + '<input type="hidden" id="' + id + '_value" value="" />' + '<span class="tw2gui_combobox_btn"></span></span>').click(this, this.handler.onDropdown);
			if (id) this.divMain.attr("id", id);
			this.divMain[0].guiElement = this;
			this.items = [];
			this.box = this.$('span.tw2gui_combobox_text');
			this.listeners = [];
			this.directionTop = false;
		},
		handler: {
			onDropdown: function (e) {
				e.data.onDropdown()
			}
		},
		addListener: function (fn, ctx, data) {
			this.listeners.push({
				f: fn,
				c: ctx,
				d: data
			});
			return this;
		},
		modalBoxDirectionTop: function (top) {
			this.directionTop = top;
			return this;
		},
		onDropdown: function () {
			var close = function () {
				$(box.getMainDiv()).hide().slideUp(function () {
					modal.remove()
				});
			}
			var modal = $("<div class='tw2gui_modal_box'></div>").click(close).height(Math.max(document.body.scrollHeight, $(document.body).height())).width(Math.max(document.body.scrollWidth, $(document.body).width()));
			$(document.body).append(modal);
			var pos = this.divMain.offset();
			var boxwrap = $('<div class="tw2gui_combobox_list"></div>').css("min-width", this.box.width() + "px").appendTo(modal);
			var box = new west.gui.Groupframe();
			var that = this;
			for (var i = 0; i < this.items.length; i += 1) {
				var el = this.items[i];
				box.appendToContentPane(el.node.clone().click((function (el) {
					return function () {
						close();
						that.select(el.value);
						return false;
					}
				})(el)));
			}
			$(box.getMainDiv()).appendTo(boxwrap);
			var top = this.directionTop ? (pos.top + 15 - boxwrap.height()) : (pos.top + this.box.height());
			boxwrap.css({
				"left": pos.left + "px",
				"top": top + "px"
			});
		},
		removeItem: function (value) {
			for (var i = 0; i < this.items.length; i += 1)
				if (this.items[i].value == value) break;
			if (i >= this.items.length) return this;
			if (value == this.value) {
				if (this.items.length == 1) {
					this.box.empty();
					this.value = null;
					this.items = [];
					return this;
				}
				this.select(this.items[i > 0 ? i - 1 : i + 1].value);
			}
			this.items.splice(i, 1);
			return this;
		},
		addItem: function (value, htmlelement) {
			if (typeof (htmlelement) == "string") htmlelement = "<span>" + htmlelement + "</span>";
			this.items.push({
				value: value,
				node: $(htmlelement)
			});
			if (this.items.length == 1) {
				this.select(value);
			}
			return this;
		},
		select: function (value) {
			for (var i = 0; i < this.items.length - 1; i += 1)
				if (this.items[i].value == value) break;
			var el = this.items[i];
			this.value = el.value;
			this.$(' > input', this.divMain).val(this.value);
			this.divMain.data('value', this.value);
			this.box.empty().append(el.node.clone());
			for (i = 0; i < this.listeners.length; i++) {
				var fi = this.listeners[i];
				fi.f.apply(fi.c, [value, fi.d]);
			}
			return this;
		},
		getValue: function () {
			return this.value;
		},
		setWidth: function (newWidth) {
			this.$(' > span.tw2gui_combobox_text', this.divMain).css('width', newWidth + 'px');
			return this;
		}
	});
	west.define('west.gui.Selectbox', west.gui.Component, {
		init: function () {
			this.divModal = $("<div class='tw2gui_modal_fixed' />");
			this.divMain = $("<div class='tw2gui_selectbox'>" + "<div class='tw2gui_selectbgr'>" + "<div class='tw2gui_bg_tl'/>" + "<div class='tw2gui_bg_tr'/>" + "<div class='tw2gui_bg_bl'/>" + "<div class='tw2gui_bg_br'/>" + "<div class='arrow'/>" + "</div>" + "<div class='tw2gui_selectbox_header'>" + "<div class='tw2gui_selectbgr'>" + "<div class='tw2gui_bg_tl' />" + "<div class='tw2gui_bg_tr' />" + "</div>" + "<div class='header_title' />" + "</div>" + "<ul class='tw2gui_selectbox_content' />" + "</div>");
			this.divWrap = $("<div class='tw2gui_selectbox_wrapper' />");
			this.elContent = $(".tw2gui_selectbox_content", this.divMain);
			this.items = [];
			this.listeners = [];
		},
		addListener: function (fn, ctx, data) {
			this.listeners.push({
				f: fn,
				c: ctx,
				d: data
			});
			return this;
		},
		removeItem: function (value) {
			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i].value == value)
					break;
			}
			if (i >= this.items.length)
				return this;
			if (value == this.value && 1 == this.items.length) {
				this.box.empty();
				this.value = null;
				this.items = [];
				return this;
			}
			this.items.splice(i, 1);
			this._build();
			return this;
		},
		setHeader: function (header) {
			this.$(".tw2gui_selectbox_header").show();
			this.$(".tw2gui_selectbox_header .header_title").html(header);
			return this;
		},
		setWidth: function (width) {
			this.elContent.css("width", width);
			return this;
		},
		setHeight: function (height) {
			this.elContent.css("height", height);
			return this;
		},
		addEmpty: function () {
			this.addItem(null, $("<div style='height: 16px;' />"));
			return this;
		},
		removeAll: function () {
			this.items = [];
			this._build();
		},
		addItem: function (value, htmlelement, title) {
			if (typeof (htmlelement) == "string") {
				htmlelement = "<span>" + htmlelement + "</span>";
			}
			this.items.push({
				value: value,
				node: $(htmlelement),
				title: title
			});
			this._build();
			return this;
		},
		_getScrollpane: function () {
			if (this.scrollpane) {
				this.scrollpane.getMainDiv().detach();
			} else {
				this.scrollpane = new west.gui.Scrollpane();
				this.getMainDiv().addClass('with_scrollbar');
			}
			this.elContent.empty().append(this.scrollpane.getMainDiv());
			return this.scrollpane.getContentPane();
		},
		_getContent: function () {
			if (this.scrollpane) {
				this.getMainDiv().removeClass('with_scrollbar');
				this.scrollpane.getMainDiv().remove();
				delete this.scrollpane;
			}
			return this.elContent;
		},
		_build: function (show) {
			var item, isSubmenu = false,
				that = this,
				$content;
			if (!show && !this.divWrap.is(':visible')) {
				return;
			}
			if (this.items.length > 14) {
				$content = this._getScrollpane();
			} else {
				$content = this._getContent();
			}
			$content.empty();
			for (var i = 0; i < this.items.length; i++) {
				item = this.items[i];
				isSubmenu = item.title instanceof west.gui.Selectbox;
				var li = $("<li />").append($(item.node));
				if (isSubmenu) {
					li.append(new west.gui.Icon.get('arrowright'));
					(function (li) {
						item.title.hide = function () {
							that.divWrap.remove();
							return this;
						};
						var el = item.title._build(show).getMainDiv(),
							dohide = false;
						el.hide();
						that.divWrap.append(el);
						var onHover = function () {
							dohide = false;
							var pos = li.offset();
							el.css({
								top: pos.top - (li.height()) + 10,
								left: pos.left + that.divMain.width() + 5
							})
							setTimeout(function () {
								el.show();
							}, 400);
						}
						var onFade = function () {
							dohide = true;
							setTimeout(function () {
								if (dohide) el.hide();
							}, 400);
						};
						li.hover(onHover, onFade);
						el.hover(onHover, onFade);
					})(li);
				} else {
					li.attr("title", item.title).click(function (value) {
						return function () {
							that.select(value);
						}
					}(item.value));
				}
				$content.append(li);
			}
			this.divModal.click(function () {
				that.hide();
			});
			return this;
		},
		show: function (e, data) {
			this.showData = data;
			this._build(true);
			this.divWrap.append(this.divMain, this.divModal);
			$("#popup-container").append(this.divWrap);
			if (null != e) {
				this.setPosition(e.clientX, e.clientY);
			}
			return this;
		},
		hide: function () {
			delete this.scrollpane;
			this.divWrap.remove();
			return this;
		},
		select: function (index) {
			if (null == index) return this;
			for (var i = 0; i < this.listeners.length; i++) {
				var fi = this.listeners[i];
				fi.f.apply(fi.c, [index, fi.d, this.showData]);
			}
			this.hide();
			return this;
		},
		setPosition: function (x, y) {
			var top, left, arrClass, el = this.divMain;
			var scrollLeft = $(window).scrollLeft(),
				scrollTop = $(window).scrollTop();
			var window_height = window.Map && Map.height || $(window).height(),
				window_width = window.Map && Map.width || $(window).width(),
				margin_bottom = window_height - y;
			var height = el.height(),
				width = el.width();
			if (margin_bottom < height + 30) {
				arrClass = "bottom";
				top = y - height + scrollTop - 25;
			} else {
				arrClass = "top";
				top = y + scrollTop + 15;
			}
			left = x - (width / 2);
			if (left < 0) {
				left = 0;
			} else if (left + width > (window_width - 35)) {
				left -= (left + width) - window_width + 35 - scrollLeft;
			}
			var arrow = $(".arrow", this.divMain);
			arrow.removeClass("top").removeClass("bottom").addClass(arrClass).css({
				left: x - left - (arrow.width() / 2) + scrollLeft
			});
			$(this.divMain).css({
				top: top,
				left: left
			});
			return this;
		}
	});
	west.define('west.gui.Textfield', west.gui.Component, {
		init: function (tid, type, cls) {
			type = type || 'text';
			this.divMain = $('<span class="tw2gui_textfield_wrapper">' + '<span class="tw2gui_textfield_label" />' + '<span class="tw2gui_textfield"><span><input type="' + type + '" /></span></span></span>');
			var inp = $('input', this.divMain);
			if (tid) inp.attr('id', tid);
			if (cls) inp.attr('class', cls);
			inp[0].guiElement = this.divMain[0].guiElement = this;
			this.listeners = [];
			var that = this;
			inp.keyup(function (e) {
				if (e.keyCode == 13) {
					for (var i = 0; i < that.listeners.length; i++) {
						var fi = that.listeners[i];
						fi.f.apply(fi.c, [inp.val(), fi.d]);
					}
				}
			});
		},
		setName: function (name) {
			this.$('input', this.divMain).attr('name', name);
			return this;
		},
		maxlength: function (ml) {
			this.$('input', this.divMain).attr('maxlength', ml);
			return this;
		},
		setId: function (id) {
			this.$('input', this.divMain).attr('id', id);
			return this;
		},
		setClass4Input: function (className) {
			$('input', this.divMain).attr('class', className);
			return this;
		},
		getField: function () {
			return this.$('> .tw2gui_textfield input', this.divMain);
		},
		getValue: function () {
			return this.getField().attr('value');
		},
		setValue: function (val) {
			this.getField().attr('value', val);
			return this;
		},
		setPlaceholder: function (val) {
			this.getField().attr('placeholder', val);
			return this;
		},
		setTooltip: function (text) {
			this.$('span.tw2gui_textfield', this.divMain).attr('title', text);
			return this;
		},
		setMaxLength: function (val) {
			this.getField().attr('maxlength', val);
			return this;
		},
		setSize: function (size) {
			this.getField().attr('size', size);
			return this;
		},
		setWidth: function (width) {
			this.$('input', this.divMain).css('width', width + 'px');
			return this;
		},
		setLabel: function (label) {
			this.$(' span.tw2gui_textfield_label', this.divMain).html(label);
			return this;
		},
		setReadonly: function (state) {
			if (undefined === state || true === state)
				this.$('input', this.divMain).attr('readonly', 'readonly');
			return this;
		},
		addListener: function (fn, ctx, data) {
			this.listeners.push({
				f: fn,
				c: ctx,
				d: data
			});
			return this;
		},
		onlyNumeric: function () {
			this.$('input', this.divMain).keypress(function (e) {
				var key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
				if (!new RegExp("^[0-9]+$").test(key)) {
					e.preventDefault();
					return false;
				}
			});
			return this;
		},
		focus: function () {
			this.getField().focus();
			return this;
		},
		addKeyUpListener: function (callback, ctx) {
			if (ctx) {
				callback = callback.bind(ctx);
			}
			this.getField().on('keyup', callback);
			return this;
		},
		click: function (callback) {
			this.$("input", this.divMain).on('click', callback);
			return this;
		},
		blur: function (callback) {
			this.$("input", this.divMain).on('blur', callback);
			return this;
		}
	});
	west.define('west.gui.Progressbar', west.gui.Component, {
		init: function (current, max) {
			this.divMain = $('<div class="tw2gui_progressbar">' + '<div class="tw2gui_progressbar_progress">' + '<div class="tw2gui_progressbar_begin"/>' + '<div class="tw2gui_progressbar_end"/>' + '<div class="tw2gui_progressbar_fill"/>' + '<div class="tw2gui_progressbar_contents"/>' + '</div>' + '</div>');
			this.divMain[0].guiElement = this;
			this.valueIsTime = false;
			this.value = current;
			this.maxValue = max;
			this.endless = false;
			this.percentOnly = false;
			this.textOnly = false;
			this.color = 'green';
			this.direction = 'direction_ltr';
			this.update();
		},
		setMaxValue: function (val) {
			this.maxValue = val;
			this.update();
			return this;
		},
		setColor: function (color) {
			this.removeClass(this.color);
			this.addClass(color);
			this.color = color;
			return this;
		},
		setDirection: function (direction) {
			direction = 'direction_' + direction;
			this.removeClass(this.direction);
			this.addClass(direction);
			this.direction = direction;
			return this;
		},
		setValue: function (val) {
			this.value = val;
			this.update();
			return this;
		},
		increase: function (step) {
			this.value = this.value + (step || 1);
			this.update();
			return this;
		},
		showPercentOnly: function (bool) {
			this.percentOnly = bool;
			this.update();
			return this;
		},
		getValue: function () {
			return this.value;
		},
		update: function () {
			var calc, contents, fill;
			if (this.endless)
				calc = 100;
			else {
				calc = this.maxValue > 0 ? Math.floor((this.value / this.maxValue) * 100) : 100;
				calc = calc > 100 ? 100 : calc;
			}
			contents = this.$('div.tw2gui_progressbar_contents', this.divMain);
			fill = this.$('div.tw2gui_progressbar_fill', this.divMain);
			if (null != this.maxValue && null != this.value) {
				if ($.browser.msie && $.browser.version <= 8)
					fill.css("width", calc + "%");
				else {
					fill.css("width", calc + "%");
				}
			}
			contents.empty();
			var v = this.value,
				m = this.maxValue,
				differentValue = this.differentValue;
			if (this.valueIsTime) {
				var tcalc = function (val) {
					var h, m, s;
					m = s = "00";
					h = Math.floor(val / 3600);
					if (0 != (val % 3600)) {
						var c = val - (h * 3600);
						minute = Math.floor(c / 60);
						if (0 != (c % 60)) s = c % 60;
					}
					return (h <= 0 ? "" : h + ":") + m + ":" + s;
				};
				v = tcalc(v);
				m = tcalc(m);
			}
			if (this.endless) contents.append($("<span>" + v + "</span>"));
			else if (this.percentOnly) contents.append($('<span>' + calc + '%</span>'))
			else if (this.textOnly) contents.append("<span>" + v + " / " + m + "</span>");
			else if (this.valueDifferent) contents.append("<span>" + differentValue + "</span>");
			else contents.append($('<span>' + (v + ' / ' + m + (' (' + calc + '%)')) + '</span>'));
		},
		setLabel: function (text, icon) {
			var el = this.$('.tw2gui_progressbar_label', this.divMain);
			if (el) el.remove();
			if (!(icon instanceof west.gui.Icon) && undefined !== icon)
				icon = new west.gui.Icon(icon);
			el = $("<div class='tw2gui_progressbar_label'/>");
			if (undefined !== icon) el.append(icon.getMainDiv());
			el.append("<span>" + text + "</span>");
			this.divMain.prepend(el);
			return this;
		},
		dropShadow: function () {
			this.divMain.append($("<div class='tw2gui_progressbar_shadow'/>"));
			return this;
		},
		setEndless: function (state) {
			this.endless = state;
			this.update();
			return this;
		},
		setTextOnly: function (state) {
			this.textOnly = state;
			this.update();
			return this;
		},
		setValueTime: function () {
			this.valueIsTime = true;
		},
		setDifferentValue: function (value) {
			this.valueDifferent = true;
			this.differentValue = value
		}
	});
	west.define('west.gui.Searchbox', west.gui.Component, {
		init: function (formName, callbackFunction) {
			this.divMain = $('<div class="searchbox"><span class="iSearchbox"></span>' + '<span class="butSearchbox"></span></div>');
			this.$('span.iSearchbox', this.divMain).append(new west.gui.Textfield().setName(formName + '_search').setMaxLength(100).getMainDiv());
			this.divMain[0].guiElement = this;
		},
		setWidth: function (width) {
			this.divMain.css('width', width);
			$('span.iSearchbox .tw2gui_textfield', this.divMain).css({
				'max-width': (width - 40) + 'px',
				'width': (width - 40) + 'px',
				'float': 'left'
			});
			return this;
		},
		addEnterEvent: function () {
			var that = this;
			$('span.iSearchbox .tw2gui_textfield input:text', this.divMain).keypress(function (e) {
				if (e.which == 13) $('.tw2gui_button', that.divMain).click();
			});
		}
	});
	west.define('west.gui.Checkbox', west.gui.Component, {
		init: function (label, groupClass, callback) {
			this.divMain = $('<div class="tw2gui_checkbox ' + groupClass + '" />');
			this.divMain[0].guiElement = this;
			var that = this;
			this.divMain.click(function () {
				that.toggle();
			});
			if (callback) this.setCallback(callback);
			this.setLabel(label);
			this.groupClass = groupClass;
			this.radiobutton = false;
			this.enabled = true;
		},
		setSelected: function (state, noCallback) {
			if (!this.enabled) return this;
			if (state) {
				if (!this.divMain.hasClass('tw2gui_checkbox_checked'))
					this.divMain.addClass('tw2gui_checkbox_checked');
				this.divMain.data('enabled', true);
			} else {
				this.divMain.removeClass('tw2gui_checkbox_checked');
				this.divMain.data('enabled', false);
			}
			if (this.radiobutton) {
				$('div.tw2gui_checkbox.' + this.groupClass).removeClass('tw2gui_checkbox_checked');
				this.divMain.addClass('tw2gui_checkbox_checked');
			}
			if (noCallback) return this;
			if (undefined != this.callback)
				this.callback(state);
			return this;
		},
		isSelected: function () {
			return this.divMain.hasClass('tw2gui_checkbox_checked');
		},
		toggle: function () {
			this.setSelected(!this.isSelected());
			return false;
		},
		setRadiobutton: function () {
			this.divMain.addClass('tw2gui_radiobutton')
			this.radiobutton = true;
			return this;
		},
		reset: function () {
			if (!this.enabled) return this;
			try {
				$(this.divMain).toggleClass('tw2gui_checkbox_checked');
			} catch (e) {
				$(this.divMain).removeClass('tw2gui_checkbox_checked');
			}
			this.divMain.data('enabled', $(this.divMain).hasClass('tw2gui_checkbox_checked'));
			return this;
		},
		setValue: function (value) {
			this.divMain.data('value', value);
			return this;
		},
		getValue: function () {
			return this.divMain.data('value');
		},
		setLabel: function (label) {
			this.divMain.html(label);
			if (undefined == label || "" == label) {
				this.divMain.removeClass('tw2gui_checkbox_labeled');
			} else {
				this.divMain.addClass('tw2gui_checkbox_labeled');
			}
			return this;
		},
		setEnabled: function (state) {
			this.enabled = state;
			this.divMain.data('enabled', state);
			return this;
		},
		setCallback: function (callback) {
			this.callback = callback;
			return this;
		},
		setId: function (id) {
			this.divMain.attr('id', id);
			return this;
		},
		setTitle: function (text) {
			return this.setTooltip(text);
		}
	});
	west.define('west.gui.Accordion', west.gui.Component, {
		init: function (id, name, groupname) {
			this.id = id;
			this.group = groupname;
			this.divMain = $('<div id="' + id + '" class="tw2gui_accordion_categorybar' + (this.group ? ' accordiongroup_' + this.group : '') + '">' + '<div class="accordion_right"></div>' + '<div class="accordion_left_closed"></div>' + '<span class="accordion_label">' + name + '</span>' + '</div>' + '<div id="' + this.id + '_content" class="tw2gui_accordion_content' + (this.group ? ' accordiongroup_' + this.group : '') + '"></div>');
			this.divMain.addClass('accordion_closed');
			$(this.divMain[0]).click(this.click).data('accordiongroup', groupname);
			this.scrollpane = new west.gui.Scrollpane();
			$(this.divMain[1]).append(this.scrollpane.getMainDiv());
		},
		setContent: function (content) {
			$(this.divMain[1]).html(content);
			return this;
		},
		addContentRow: function (content, title) {
			this.scrollpane.appendContent($('<p class="accordion_contentRow" ' + (title ? title : '') + '/>').append(content));
			return this;
		},
		clearContent: function () {
			$('#' + this.id + '_content', this.divMain).empty();
			return this;
		},
		setClickable: function () {
			$(this.accordion).on('click', this.click);
			return this;
		},
		setUnClickable: function () {
			$(this.accordion).off('click');
			return this;
		},
		click: function () {
			if ($(this).hasClass('accordion_opened')) {
				$('#' + this.id + '_content').hide();
				$(this).removeClass('accordion_opened').addClass('accordion_closed');
				$('#' + this.id + ' div.accordion_left_opened').removeClass('accordion_left_opened').addClass('accordion_left_closed');
				$('div.tw2gui_accordion_categorybar.accordiongroup_' + $(this).data("accordiongroup")).show();
			} else {
				if ($(this).attr('class').match('accordiongroup_')) {
					var classes = $(this).attr('class').split(' ');
					$.each(classes, function (k, v) {
						if (v.match('accordiongroup_')) {
							var group = v.split('group_')[1];
							$('div.accordiongroup_' + group + '.accordion_opened').removeClass('accordion_opened').addClass('accordion_closed');
							$('div.accordiongroup_' + group + ' .accordion_left_opened').removeClass('accordion_left_opened').addClass('accordion_left_closed');
							$('div.tw2gui_accordion_content.accordiongroup_' + group).hide();
						}
					});
				}
				$('#' + this.id + '_content').show();
				$(this).removeClass('accordion_closed').addClass('accordion_opened');
				$('#' + this.id + ' .accordion_left_closed').removeClass('accordion_left_closed').addClass('accordion_left_opened');
				$('div.tw2gui_accordion_categorybar.accordiongroup_' + $(this).data("accordiongroup")).hide();
				$(this).show();
			}
		}
	});
	west.define('west.gui.Accordiongroup', west.gui.Component, {
		init: function (groupname) {
			this.divMain = $('<div class="accordion_root ' + groupname + '"></div>');
			this.groupname = groupname;
		},
		addAccordion: function (accordion) {
			this.divMain.append(accordion);
			return this;
		},
		createAccordion: function (id, label) {
			var acc = new west.gui.Accordion(id, label, this.groupname).getMainDiv();
			this.divMain.append(acc);
			return this;
		}
	});
	west.define('west.gui.Textarea', west.gui.Component, {
		init: function (content, classes) {
			this.divMain = $("<span class='tw2gui_textarea " + (classes || "") + "'>" + "<div class='tw2gui_bg'></div>" + "<div class='tw2gui_bg_tl'></div><div class='tw2gui_bg_br'></div>" + "<div class='tw2gui_bg_tr'></div><div class='tw2gui_bg_bl'></div>" + "<div class='tw2gui_textarea_wrapper'><textarea></textarea></div></span>");
			this.divMain[0].guiElement = this;
			this.textarea = $('textarea', this.divMain);
			this.textarea.val(content || "");
		},
		setContent: function (c) {
			this.textarea.val(c || "");
			return this;
		},
		getContent: function () {
			return this.textarea.val();
		},
		setReadonly: function () {
			this.textarea.attr('readonly', 'readonly');
			return this;
		},
		setWidth: function (width) {
			this.textarea.css('width', width);
			return this;
		},
		setHeight: function (height) {
			this.textarea.css('height', height);
			return this;
		},
		setId: function (id) {
			this.textarea.attr('id', id);
			return this;
		},
		setExpandable: function (opts) {
			var align = opts.align || 'left';
			this.toggler = $(s('<div title="%1" class="tw2gui_textarea_toggler %2"></div>', 'Развернуть'.escapeHTML(), 'align_' + align)).click(this.expandToggle.bind(this));
			this._expandable = true;
			this._expandedWidth = opts.width;
			this._closedWidth = this.textarea.width();
			this.getMainDiv().append(this.toggler);
			return this;
		},
		expandToggle: function () {
			if (!this._expandable) return;
			if (this.toggler.hasClass('expanded')) {
				this.textarea.animate({
					width: this._closedWidth
				});
				this.toggler.addMousePopup('Развернуть')
			} else {
				this.textarea.animate({
					width: this._expandedWidth
				});
				this.toggler.addMousePopup('Свернуть');
			}
			this.toggler.toggleClass('expanded');
		}
	});
	west.define('west.gui.Pagebar', west.gui.Component, {
		init: function (page, pages, callback, context, hasNext) {
			var that = this;
			this.relative = pages == null ? true : false;
			this.callback = callback;
			this.context = context;
			this.divMain = $("<div class='tw2gui_pagebar'/>").append($('<span class="button prev firstPage"></span>').click(function () {
				that.btnClick('first');
			}), $('<span class="button prev previousPage"></span>').click(function () {
				that.btnClick('prev');
			}), $("<div class='current_page'/>").click(function () {
				that.togglePagePrompt();
			}), $('<span class="button next nextPage"></span>').click(function () {
				that.btnClick('next');
			}), $('<span class="button next lastPage"></span>').click(function () {
				that.btnClick('last');
			}));
			if (this.relative) $("span.lastPage", this.divMain).remove();
			this.update(page, pages, hasNext);
			if (!this.relative) this.addPageprompt();
		},
		update: function (page, maxPages, hasNext) {
			this.setPage(page);
			this.setMaxPages(maxPages);
			if (this.page <= 1)
				$("span.prev", this.divMain).hide();
			else
				$("span.prev", this.divMain).show();
			if ((!this.relative && this.page >= this.pages) || (this.relative && !hasNext))
				$("span.next", this.divMain).hide();
			else
				$("span.next", this.divMain).show();
		},
		setPage: function (p) {
			this.page = p;
			$("div.current_page", this.divMain).text(this.page);
			if (this.textfield) this.textfield.setValue(this.page);
		},
		setMaxPages: function (p) {
			if (null !== p) {
				this.pages = Math.max(this.page, p);
				$("span.maxpages", this.pageprompt).text("/ " + this.pages);
			}
		},
		addPageprompt: function () {
			var that = this;
			this.textfield = new west.gui.Textfield().setSize(3);
			this.textfield.getField().keypress(function (e) {
				if (e.which == 13) {
					that.pageprompt.hide();
					that.btnClick("certain");
				}
			});
			this.pageprompt = $('<span class="pageprompt"/>').append('<div class="background"/>').append('<div class="frame tw2gui_bg_tl"></div>').append('<div class="frame tw2gui_bg_tr"></div>').append('<div class="frame tw2gui_bg_bl"></div>').append('<div class="frame tw2gui_bg_br"></div>').append(this.textfield.getMainDiv()).append($("<span class='maxpages'>/ " + this.pages + "</span>"));
			this.divMain.append(this.pageprompt);
		},
		btnClick: function (dir) {
			if (this.relative) return this.callback.call(this.context, dir);
			var param = 1;
			switch (dir) {
			case 'next':
				param = this.page + 1;
				break;
			case 'prev':
				param = this.page - 1;
				break;
			case 'first':
				param = 1
				break;
			case 'last':
				param = this.pages;
				break;
			case 'certain':
				param = parseInt(this.textfield.getValue()) || 1;
				break;
			}
			this.callback.call(this.context, Math.min(Math.max(param, 1)), this.pages);
		},
		togglePagePrompt: function () {
			if (this.relative) return;
			this.textfield.setValue(this.page)
			this.pageprompt.toggle();
			this.textfield.getField().focus().val(this.textfield.getValue());
		}
	});
	west.define('west.gui.Bbcodes', west.gui.Component, {
		init: function (target, skip) {
			if (target instanceof west.gui.Textarea)
				target = target.textarea[0];
			this.target = target;
			this.divMain = $("<div class='tw2gui_bbcodes'>" + "<span title='" + 'Жирный' + "' class='bbbold'></span>" + "<span title='" + 'Курсив' + "' class='bbitalic'></span>" + "<span title='" + 'Подчёркивание' + "' class='bbunderline'></span>" + "<span title='" + 'Зачёркивание' + "' class='bbstrike'></span>" +
				(($.inArray("player", skip) === -1) ? "<span title='" + 'Игрок' + "' class='bbplayer'></span>" : "") +
				(($.inArray("town", skip) === -1) ? "<span title='" + 'Город' + "' class='bbtown'></span>" : "") +
				(($.inArray("fort", skip) === -1) ? "<span title='" + 'Форт' + "' class='bbfort'></span>" : "") +
				(($.inArray("alliance", skip) === -1) ? "<span title='" + 'Альянс' + "' class='bballiance'></span>" : "") +
				(($.inArray("url", skip) === -1) ? "<span title='" + 'Ссылка' + "' class='bburl'></span>" : "") + "<div style='clear: both;'></div" + "</div>");
			var BB = new BBCode(this.target);
			$('span.bbbold', this.divMain).click(function () {
				BB.addCodeTag('b');
			});
			$('span.bbitalic', this.divMain).click(function () {
				BB.addCodeTag('i');
			});
			$('span.bbunderline', this.divMain).click(function () {
				BB.addCodeTag('u');
			});
			$('span.bbstrike', this.divMain).click(function () {
				BB.addCodeTag('del');
			});
			if ($.inArray("player", skip) === -1)
				$('span.bbplayer', this.divMain).click(function () {
					BB.addCodeTag('player');
				});
			if ($.inArray("town", skip) === -1)
				$('span.bbtown', this.divMain).click(function () {
					BB.addCodeTag('town');
				});
			if ($.inArray("fort", skip) === -1)
				$('span.bbfort', this.divMain).click(function () {
					BB.addCodeTag('fort');
				});
			if ($.inArray("alliance", skip) === -1)
				$('span.bballiance', this.divMain).click(function () {
					BB.addCodeTag('alliance');
				});
			if ($.inArray("url", skip) === -1)
				$('span.bburl', this.divMain).click(function () {
					BB.addExtendedCodeTag('Введи, пожалуйста, ссылку.', 'url');
				});
		}
	});
	currentHighlight = null;
	west.define('west.gui.Window', west.gui.Component, {
		init: function (title, winclass, noDragEvent) {
			this.divMain = $("<div class='tw2gui_window tw2gui_win2 tw2gui_window_notabs " + (winclass || "") + "'></div>").append("<div class='tw2gui_window_shadow_box'>" + "<div class='tw2gui_window_shadow tw2gui_bg_br'></div>" + "<div class='tw2gui_window_shadow tw2gui_bg_tr'></div>" + "<div class='tw2gui_window_shadow tw2gui_bg_bl'></div>" + "</div>", "<div class='tw2gui_window_inset'>" + "<div class='tw2gui_inner_window_bg'></div>" + "<div class='tw2gui_inner_window_bg2'></div></div>", "<div class='tw2gui_window_inset_bottom'></div>", "<div class='tw2gui_window_inset_right'></div>", "<div class='tw2gui_inner_splitwindow_container'>" + "<div class='tw2gui_inner_splitwindow'>" + "<div class='tw2gui_inner_splitwindow_rightfade'></div>" + "</div></div>", "<div class='tw2gui_window_border tw2gui_bg_tl'></div>", "<div class='tw2gui_window_border tw2gui_bg_br'></div>", "<div class='tw2gui_window_border tw2gui_bg_tr'></div>", "<div class='tw2gui_window_border tw2gui_bg_bl'></div>", "<div class='tw2gui_inner_window_title tw2gui_window_notabs'>" + "<div class='tw2gui_inner_window_title_left'></div>" + "<div class='tw2gui_inner_window_title_right'></div>" + "</div>", "<div class='tw2gui_window_pane'>" + "<div class='tw2gui_window_border_ext tw2gui_window_border_ext_tl'></div>" + "<div class='tw2gui_window_border_ext tw2gui_window_border_ext_tr'></div>" + "<div class='loader'><img src='https://westrus.innogamescdn.com/images/throbber2.gif' /></div>" + "</div>", "<div class='tw2gui_window_content_pane'></div>", "<div class='tw2gui_window_sizer'></div>", "<div class='tw2gui_window_tabbar'><div class='tw2gui_window_tabbar_tabs'></div>" + "<div class='tw2gui_window_tabbar_faderight'></div>" + "<div class='tw2gui_window_tabbar_fadeleft'></div></div>", "<div class='tw2gui_window_tab_control_clipper'><div class='tw2gui_window_tab_control'>" + "<div class='tw2gui_window_tab_control_btnleft'></div>" + "<div class='tw2gui_window_tab_control_btnright'></div>" + "<div class='tw2gui_window_tab_control_select'></div></div></div>", "<div class='tw2gui_window_buttons'>" + "<div class='tw2gui_window_buttons_reload' title='&lt;b&gt;" + 'Обновить содержание' + "'&lt;/b&gt;></div>" + "<div class='tw2gui_window_buttons_closeall' title='&lt;b&gt;" + 'Закрыть все окна' + "&lt;/b&gt;'></div>" + "<div class='tw2gui_window_buttons_minimize' title='&lt;b&gt;" + 'Свернуть окно' + "&lt;/b&gt;'></div>" + "<div class='tw2gui_window_buttons_close' title='&lt;b&gt;" + 'Закрыть окно' + "&lt;/b&gt;'></div>" + "</div>").appendTo("#windows")[0];
			var now = new Date();
			if (now.isWinterTime()) {
				$(this.divMain).addClass('snow');
			} else if (now < buildDateObject('2.4.2014') && now > buildDateObject('1.4.2014')) {
				$(this.divMain).addClass('fire');
			}
			this.divMain.guiElement = this;
			var divTitleHandle = $('div.tw2gui_inner_window_title', this.divMain)[0];
			this.sizeRange = {
				x: [220, 749],
				y: [220, 471]
			};
			this.draggable = noDragEvent ? false : true;
			$(this.divMain).jqResize($('div.tw2gui_window_sizer', this.divMain), {
				rangex: this.sizeRange.x,
				rangey: this.sizeRange.y,
				onStart: this.handler.onResizeStart,
				onStop: this.handler.onResizeStop,
				onDrag: this.handler.onResizing,
				win: this
			});
			if (this.draggable) {
				$(this.divMain).jqDrag(divTitleHandle, {
					onStart: this.handler.onDragStart,
					onStop: this.handler.onDragStop,
					onDrag: this.handler.onDrag,
					win: this
				});
			}
			$(this.divMain).on('mousedown', {
				win: this
			}, this.handler.onWindowMouseDown).on('mouseenter', {
				win: this
			}, this.handler.onWindowMouseEnter);
			$(this.divMain).on('click', {
				win: this
			}, this.handler.onClick);
			$('div.tw2gui_window_tab_control_btnleft', this.divMain).on('click', {
				win: this
			}, this.handler.onClickTabCtrlLeft);
			$('div.tw2gui_window_tab_control_btnright', this.divMain).on('click', {
				win: this
			}, this.handler.onClickTabCtrlRight);
			$('div.tw2gui_window_tab_control_select', this.divMain).on('click', {
				win: this
			}, this.handler.onClickTabCtrlSelect);
			$('div.tw2gui_window_buttons_close', this.divMain).on('click', {
				win: this,
				type: TWE('WINDOW_CLOSE')
			}, this.handler.windowFireEvent);
			$('div.tw2gui_window_buttons_reload', this.divMain).on('click', {
				win: this,
				type: TWE('WINDOW_RELOAD')
			}, this.handler.windowFireEvent);
			$('div.tw2gui_window_buttons_minimize', this.divMain).on('click', {
				win: this,
				type: TWE('WINDOW_MINIMIZE')
			}, this.handler.windowFireEvent);
			$('div.tw2gui_window_buttons_closeall', this.divMain).on('click', {
				win: this,
				type: TWE('WINDOW_CLOSEALL_OPEN')
			}, this.handler.windowFireEvent);
			this.titler = new west.gui.Textart("", "", 32, "bold 20pt Times New Roman").appendTo(divTitleHandle).setScaleX(.8);
			this.setResizeable(false).setTitle(title).center().bringToTop();
			this.tabIds = {};
			this.eventListeners = {};
		},
		showTabLoader: function (tab_id) {
			$(".tw2gui_window_tab" + (tab_id ? '._tab_id_' + tab_id : ''), this.divMain).addClass('loading');
		},
		showLoader: function () {
			$(".tw2gui_window_pane > .loader", this.divMain).show();
			if (!($.browser.msie && $.browser.version <= 8))
				$("div.tw2gui_window_content_pane", this.divMain).css("opacity", "0.5");
		},
		hideLoader: function () {
			$(".tw2gui_window_pane > .loader", this.divMain).hide();
			$(".tw2gui_window_tab.loading", this.divMain).removeClass('loading');
			if (!($.browser.msie && $.browser.version <= 8))
				$("div.tw2gui_window_content_pane", this.divMain).css("opacity", "1.0");
		},
		addEventListener: function (etype, handler, context, data) {
			TWE(etype);
			if (!this.eventListeners[etype]) this.eventListeners[etype] = [{
				f: handler,
				c: context,
				d: data
			}];
			else this.eventListeners[etype].unshift({
				f: handler,
				c: context,
				d: data
			});
			return this;
		},
		setMinSize: function (w, h) {
			this.sizeRange.x[0] = w;
			this.sizeRange.y[0] = h;
			return this;
		},
		setMaxSize: function (w, h) {
			this.sizeRange.x[1] = w;
			this.sizeRange.y[1] = h;
			return this;
		},
		height: function () {
			return $(this.divMain).height();
		},
		width: function () {
			return $(this.divMain).width();
		},
		setId: function (id) {
			this.id = id;
			return this;
		},
		getId: function () {
			return this.id;
		},
		saveAppearance: function () {
			var self = $(this.divMain);
			var pos = self.position();
			return {
				x: self.css("left"),
				y: self.css("top"),
				w: self.width(),
				h: self.height()
			};
		},
		restoreAppearance: function (ap) {
			if (!ap) return this;
			var self = $(this.divMain);
			self.css({
				"left": ap.x,
				"top": ap.y
			}).width(ap.w).height(ap.h);
			return this;
		},
		destroy: function () {
			this.fireEvent(TWE("WINDOW_DESTROY"), this);
			$(this.divMain).remove().empty();
		},
		removeEventListener: function (etype, handler) {
			var ls = this.eventListeners[etype];
			if (!ls) return;
			for (var i = ls.length - 1; i >= 0; i -= 1) {
				if (ls[i] == handler) ls.splice(i, 1);
			}
			return this;
		},
		addTab: function (title, id, onActivate, context, data, closeable) {
			if (this.tabIds[id]) {
				throw 'added tab with that id (' + id + ') already';
			}
			this.tabIds[id] = {
				f: onActivate,
				c: context,
				d: data,
				id: id
			};
			$('div.tw2gui_window_notabs', this.divMain).removeClass('tw2gui_window_notabs');
			$(this.divMain).removeClass('tw2gui_window_notabs');
			$('div.tw2gui_window_tabbar_tabs', this.divMain).append($("<div class='tw2gui_window_tab _tab_id_" + id + "' />").append('<div class="loader"></div>', "<div class='tw2gui_window_tab_text'>" + title + "</div><div class=" + (closeable ? "'tw2gui_window_tab_terminator_close'" : "'tw2gui_window_tab_terminator'") + "></div>").data("tab_id", id));
			$('div._tab_id_' + id, this.divMain).on('click', {
				win: this,
				tabid: id,
				f: onActivate,
				c: context,
				d: data
			}, this.handler.onClickTab)
			if (closeable) {
				var that = this;
				$('div._tab_id_' + id + ' > .tw2gui_window_tab_terminator_close').click(function () {
					that.closeTab(id);
				});
			}
			if (!this.currentActiveTabId) {
				this.activateTab(id, false);
			}
			return this.doLayout();
		},
		renameTab: function (tabId, newTitle) {
			if (!this.tabIds[tabId]) throw 'tabId does not exist';
			this.$('._tab_id_' + tabId + ' .tw2gui_window_tab_text').html(newTitle);
		},
		switchTab: function (tabId) {
			this.activateTab(tabId);
			var self = this;
			this.$('div.tw2gui_window_content_pane > *').each(function (i, e) {
				self.removeClass($(e).attr('class'));
				if ($(e).hasClass(tabId)) {
					$(e).children().fadeIn();
					$(e).show();
					self.addClass(tabId);
				} else {
					$(e).children().fadeOut();
					$(e).hide();
				}
				self.fireEvent(TWE("WINDOW_TAB_SWITCHED"), {
					'DOM': this,
					'tabId': tabId
				});
			});
		},
		hideTab: function (tabId) {
			this.$('._tab_id_' + tabId).hide();
		},
		showTab: function (tabId) {
			this.$('._tab_id_' + tabId).show();
		},
		closeTab: function (id) {
			if (!this.tabIds[id]) return;
			var oldTab = this.tabIds[id];
			delete(this.tabIds[id]);
			var oldTabDiv = $('div._tab_id_' + id, this.divMain);
			if (!oldTabDiv.next().length && !oldTabDiv.prev().length) {
				this.destroy();
			} else {
				var leftTab = oldTabDiv.next().length == 0 ? oldTabDiv.prev() : oldTabDiv.next();
				if (this.currentActiveTabId == id)
					this.activateTab($(leftTab).data('tab_id'), true);
				this.doLayout();
			}
			oldTabDiv.remove();
			this.fireEvent(TWE("TAB_CLOSED"), id);
		},
		fireActivateTab: function (id) {
			var inf = this.tabIds[id]
			if (!inf || !inf.f) return false;
			inf.f.apply(inf.c, [this, id, inf.d]);
		},
		activateTab: function (id, mkEvent) {
			if (!this.tabIds[id]) throw "that tab does not exist";
			$('div.tw2gui_window_tab', this.divMain).removeClass('tw2gui_window_tab_active');
			$('div._tab_id_' + id, this.divMain).addClass('tw2gui_window_tab_active');
			$(this.divMain).addClass('active_tab_id_' + id);
			if (this.currentActiveTabId && this.currentActiveTabId != id) $(this.divMain).removeClass('active_tab_id_' + this.currentActiveTabId);
			this.currentActiveTabId = id;
			if (mkEvent) this.fireActivateTab(id);
			EventHandler.signal("WINDOW_TAB_OPENED", [id]);
			return this;
		},
		handler: {
			onResizeStart: function (event) {
				this.win.bringToTop()
			},
			onResizing: function (e, css) {
				$.triggerResizeEvent();
				css.width = css.width & (~1);
				css.height = css.height & (~1);
				this.win.doLayout();
				this.win.fireEvent(TWE("WINDOW_ONRESIZE"), this.win);
			},
			onResizeStop: function (e) {
				this.win.doLayout();
				this.win.fireEvent(TWE("WINDOW_RESIZED"), this.win);
			},
			onDragStart: function (event) {
				this.win.bringToTop();
				var shad = $('div.tw2gui_window_shadow_box', this.win.divMain);
				this.winwidth = shad.outerWidth() + shad.position().left;
				this.browserwidth = $(window).width();
			},
			onDrag: function (e, css) {
				css.left = Math.min(this.browserwidth - this.winwidth + 610, Math.max(-610, css.left));
				css.top = Math.max(0, css.top);
			},
			onDragStop: function (e, css) {},
			onWindowMouseEnter: function (event) {
				var win = event.data.win;
				if (win == currentHighlight) return;
				if (currentHighlight) currentHighlight.visualBlur();
				currentHighlight = win.visualFocus();
			},
			onWindowMouseDown: function (event) {
				event.data.win.bringToTop()
			},
			onClickTabCtrlLeft: function (e) {
				e.data.win.tabScroll(-1);
			},
			onClickTabCtrlRight: function (e) {
				e.data.win.tabScroll(1);
			},
			onClickTabCtrlSelect: function (e) {
				e.data.win.tabSelect();
			},
			onClickTab: function (e) {
				e.data.win.fireActivateTab(e.data.tabid);
				e.data.win.fireEvent(TWE('WINDOW_TAB_CLICK'), {
					window: e.data.win,
					tabid: e.data.tabid
				});
				return false;
			},
			onClick: function (e) {
				e.data.win.fireEvent(TWE("WINDOW_CLICK"), {
					window: e.data.win
				});
			},
			windowFireEvent: function (e) {
				e.data.win.fireEvent(e.data.type, e.data.win);
			}
		},
		fireEvent: function (etype, edata) {
			TWE(etype);
			if (!this.eventListeners) return;
			var ls = this.eventListeners[etype];
			if (!ls) return this;
			if (!edata) edata = {};
			var i;
			for (i = ls.length - 1; i >= 0; i -= 1) {
				var listener = ls[i];
				listener.f.apply(listener.c, [etype, edata, listener.d]);
			}
			return this;
		},
		visualBlur: function () {
			return this;
		},
		visualFocus: function () {
			return this;
		},
		setMiniTitle: function (t) {
			this.miniTitle = t;
			this.fireEvent(TWE("WINDOW_MINI_TITLE_CHANGED"), this);
			return this;
		},
		getMiniTitle: function () {
			return this.miniTitle || "?";
		},
		setTitle: function (title) {
			if (!title) {
				$(this.divMain).addClass("empty_title");
			} else {
				this.titler.setText(title);
				$(this.divMain).removeClass("empty_title");
			}
			return this;
		},
		setSplitWindow: function (on) {
			if (on) $(this.divMain).addClass("splitwindow");
			else $(this.divMain).removeClass("splitwindow");
			return this;
		},
		setResizeable: function (on) {
			$('div.tw2gui_window_sizer', this.divMain).css("display", on ? "block" : "none");
			return this;
		},
		getContentPane: function () {
			return $('div.tw2gui_window_content_pane', this.divMain)[0];
		},
		appendToContentPane: function () {
			var self = $('div.tw2gui_window_content_pane', this.divMain);
			self.append.apply(self, arguments);
			return this;
		},
		clearContentPane: function () {
			$('div.tw2gui_window_content_pane', this.divMain).empty();
			return this;
		},
		getWindowPane: function () {
			return $('div.tw2gui_window_pane', this.divMain)[0]
		},
		appendToWindowPane: function (x) {
			$('div.tw2gui_window_pane', this.divMain).append(x);
			return this;
		},
		clearWindowPane: function (x) {
			$('div.tw2gui_window_pane', this.divMain).empty();
			return this;
		},
		setSize: function (w, h) {
			$(this.divMain).width(w & (~1)).height(h & (~1));
			this.doLayout();
			return this;
		},
		center: function (x, y) {
			$(this.divMain).center(x, y);
			return this;
		},
		bringToTop: function () {
			$(this.divMain).bringToTop();
			EventHandler.signal("window_focus_changed", [this]);
			this.fireEvent(TWE("WINDOW_FOCUS"), this.win);
			return this;
		},
		doLayout: function () {
			if ($(this.divMain).hasClass('tw2gui_window_notabs')) return;
			var tw = 0;
			var barw = $('div.tw2gui_window_tabbar', this.divMain).width();
			var tabbar = $('div.tw2gui_window_tabbar_tabs', this.divMain);
			var xoff = tabbar.position().left;
			var hidden = [];
			var thres = -5 - xoff;
			$('div.tw2gui_window_tab', this.divMain).each(function (i, e) {
				tw += $(e).outerWidth(true);
				if (tw - thres > barw) hidden.push(e);
			});
			if (xoff < 5 && tw + xoff < barw + 5) tabbar.css('left', Math.min(5, barw - tw));
			var control = $('div.tw2gui_window_tab_control', this.divMain);
			if ((barw > tw - thres || tw == 0) && xoff >= 5) {
				if (this._showtabcontrol) {
					this._showtabcontrol = false;
					control.animate({
						'top': -control.height() + "px"
					}, {
						duration: 100,
						easing: "swing"
					})
				}
			} else {
				if (!this._showtabcontrol) {
					this._showtabcontrol = true;
					control.animate({
						'top': '0px'
					}, {
						duration: 100,
						easing: "swing"
					})
				}
			}
			return this;
		},
		tabScroll: function (dir) {
			if (dir * dir != 1) return this;
			var tabs = $('div.tw2gui_window_tabbar_tabs', this.divMain);
			tabs.clearQueue();
			var xoff = tabs.position().left;
			if ((dir < 0 && xoff >= 5)) return this;
			var tw = 0;
			var barw = $('div.tw2gui_window_tabbar', this.divMain).width();
			var thres = 15 - xoff;
			var scrollto = 0;
			$('div.tw2gui_window_tab', this.divMain).each(function (i, e) {
				if (scrollto) return;
				var ew = $(e).outerWidth(true);
				if (dir > 0 && tw + xoff - 25 > barw) scrollto = tw;
				tw += ew;
				if (dir < 0 && tw >= -xoff) scrollto = -(tw - ew) + 15;
			});
			if (dir > 0 && !scrollto) scrollto = tw;
			if (!scrollto) return this;
			if (dir > 0) {
				tabs.animate({
					left: -(scrollto - barw) + "px"
				});
			} else {
				tabs.animate({
					left: (scrollto) + "px"
				});
			}
			return this;
		},
		tabSelect: function () {
			return this;
		},
		setModal: function () {
			$(this.divMain).append($("<div class='tw2gui_modal' />").append("<img src='https://westrus.innogamescdn.com/images/curtain_bg.png' style='width:100%;height:100%;opacity:0.7;'/>"));
		}
	});
	$(window).on('dblclick', function () {
		return false
	});
	west.define('west.gui.Window.extension.box', west.gui.Component, {
		init: function (win, wrapperPos) {
			this.divMain = $("<div class='tw2gui_window_extension_box'/>");
			this.btn = $("<div title='<b>" + "Закрыть/Открыть".escapeHTML() + "</b>' class='tw2gui_window_extension_box_btn'/>");
			this.pseudobtn = $("<div style='position:absolute;right:0;width:20px;height:20px;z-index:11;cursor:pointer;'/>");
			this.wrapper = $("<div class='tw2gui_window_extension_box_wrap'/>");
			this.wrapperPos = wrapperPos || 25;
			if (wrapperPos && wrapperPos < 25)
				this.wrapperPos = 25;
			var scroll = new west.gui.Scrollpane();
			scroll.appendContent("<div class='tw2gui_window_extension_box_content'/>");
			this.wrapper.append("<div class='tw2gui_window_extension_box_head'/>", scroll.getMainDiv());
			var that = this;
			var clk = function () {
				that.setVisible(!that.visible);
			};
			this.btn.click(clk);
			this.pseudobtn.click(clk);
			this.divMain.append(this.btn, this.wrapper.append(this.pseudobtn));
			$(win.getMainDiv()).prepend(this.divMain);
			this.visible = true;
			return this;
		},
		setVisible: function (state) {
			if (this.visible == state) return false;
			this.btn.css("background-position", state ? "-17px 0" : "0 0");
			var btnCss = {
				left: state ? 264 : this.wrapperPos - 21
			};
			var wrapperCss = {
				left: state ? 0 : -(this.wrapper.outerWidth() - this.wrapperPos)
			};
			if (Config.get("gui.main.animations")) {
				this.btn.stop().animate(btnCss);
				this.wrapper.stop().animate(wrapperCss);
			} else {
				this.btn.css(btnCss);
				this.wrapper.css(wrapperCss);
			}
			this.visible = state;
			return this;
		},
		setHead: function (data) {
			$("div.tw2gui_window_extension_box_head", this.divMain).html(data);
			return this;
		},
		setContent: function (data) {
			$("div.tw2gui_window_extension_box_content", this.divMain).html(data);
			return this;
		}
	});
	west.define('west.gui.Plusminusfield', west.gui.Component, {
		init: function (id, start_value, min_value, max_value, extra_points, callbackPlus, callbackMinus, callbackWheel) {
			var that = this;
			this.divMain = $('<div class="tw2gui_plusminus" id="' + id + '"></div>').mousewheel(function (ev, delta) {
				if (callbackWheel(ev, delta, that)) {
					that.toggleMinus();
					that.togglePlus();
				}
			});
			this.current_value = start_value;
			this.max_value = parseInt(max_value);
			this.min_value = min_value;
			this.extra = extra_points;
			this.revision = 0;
			this.disabledPlus = false;
			this.disabledMinus = false;
			this.id = id;
			this.data = {};
			this.divMain.guiElement = this;
			var minus = $('<span class="butMinus"></span>').click({
				obj: this
			}, function (ev) {
				if (callbackMinus(ev)) {
					that.toggleMinus();
					that.togglePlus();
				}
			});
			var plus = $('<span class="butPlus"></span>').click({
				obj: this
			}, function (ev) {
				if (callbackPlus(ev)) {
					that.toggleMinus();
					that.togglePlus();
				}
			});
			$(this.divMain).append(minus, $('<span unselectable="on" class="displayValue unselectable">' + this.current_value + '</span>'), $('<span unselectable="on" class="displayValueBonus' + (this.extra > 0 ? ' text_green' : '') + ' unselectable">' + parseInt(this.current_value + this.extra) + '</span>').hide(), plus);
			this.toggleMinus();
			this.togglePlus();
		},
		setWidth: function (w) {
			$('span.displayValue, span.displayValueBonus', this.divMain).css('width', w - 24 + 'px');
			return this;
		},
		setValue: function (v) {
			this.revision += (v - this.current_value);
			this.current_value = v;
			return this;
		},
		getValue: function () {
			return this.current_value;
		},
		getStartValue: function () {
			return this.current_value - this.revision;
		},
		setData: function (dataObj) {
			this.data = dataObj;
			return this;
		},
		update: function (start, min, max, extra) {
			this.setValue(start);
			this.max_value = parseInt(max);
			this.min_value = min;
			this.extra = extra;
			return this;
		},
		setMin: function (new_min) {
			if (new_min !== this.min_value && new_min <= this.max_value) {
				this.min_value = new_min;
			}
			return this;
		},
		getMin: function () {
			return this.min_value;
		},
		setMax: function (new_max) {
			if (new_max && new_max !== this.max_value && new_max >= this.min_value) {
				this.max_value = new_max;
			}
			return this;
		},
		getMax: function () {
			return this.max_value;
		},
		togglePlus: function () {
			if (this.max_value == this.current_value) {
				$('span.butPlus', this.divMain).css('opacity', 0.3);
			} else {
				$('span.butPlus', this.divMain).css('opacity', 1);
			}
			return this;
		},
		toggleMinus: function () {
			if (this.min_value == this.current_value) {
				$('span.butMinus', this.divMain).css('opacity', 0.3);
			} else {
				$('span.butMinus', this.divMain).css('opacity', 1);
			}
			return this;
		}
	});
	west.define('west.gui.Dialog', west.gui.Component, {
		init: function (title, msg, icon) {
			this.divMain = $("<div class='tw2gui_dialog'>" + "<div class='tp_front'>" + "<div class='tw2gui_bg_tl'/>" + "<div class='tw2gui_bg_tr'/>" + "<div class='tw2gui_bg_bl'/>" + "<div class='tw2gui_bg_br'/>" + "</div>" + "<div class='tw2gui_inner_window_title'>" + "<div class='tw2gui_inner_window_title_left'/>" + "<div class='tw2gui_inner_window_title_right'/>" + "</div>" + "<div class='tw2gui_dialog_content'>" + "<div class='tw2gui_dialog_text'/>" + "<div style='clear: both;'/>" + "</div>" + "<div/>");
			this.modalframe = null;
			this.text = null;
			this.title = new west.gui.Textart("Сообщение", "", 32, "bold 20pt Times New Roman").appendTo(this.$(".tw2gui_inner_window_title"));
			this.framefix = $("<div class='tw2gui_dialog_framefix' />").append(this.divMain);
			if (undefined !== title) this.setTitle(title);
			if (undefined !== msg) this.setText(msg);
			if (undefined !== icon) this.setIcon(icon);
		},
		after: function (el) {
			el.after(this.divMain);
			return this;
		},
		setX: function (x) {
			this.divMain.css('left', x);
			return this;
		},
		setY: function (y) {
			this.divMain.css('top', y);
			return this;
		},
		setPosition: function (x, y) {
			this.divMain.css({
				'left': x,
				'top': y
			});
			return this;
		},
		setWidth: function (width) {
			this.$(".tw2gui_dialog_content").css("width", width);
			return this;
		},
		setHeight: function (height) {
			this.$(".tw2gui_dialog_content").css("height", height);
			return this;
		},
		setDimension: function (width, height) {
			this.$(".tw2gui_dialog_content").css({
				"width": width,
				"height": height
			});
			return this;
		},
		setCharacter: function (name) {
			this.divMain.append('<div class="tw2gui_dialog_character character_' + name + '"></div>');
			return this;
		},
		removeCharacter: function () {
			this.$(".tw2gui_dialog_character").remove();
			return this;
		},
		getId: function () {
			return this.divMain.attr('id');
		},
		setId: function (id) {
			this.divMain.attr('id', id);
			return this;
		},
		getTitle: function () {
			return this.title.getText();
		},
		setTitle: function (title) {
			this.title.setText(title);
			return this;
		},
		getText: function () {
			return this.text;
		},
		setText: function (msg) {
			var elMsg = undefined,
				e = this.$(".tw2gui_dialog_text");
			try {
				elMsg = $(msg);
				if (0 != elMsg.length)
					e.css("float", "none").html(elMsg);
			} catch (er) {}
			if (undefined === elMsg || 0 == elMsg.length)
				e.text(msg);
			this.text = msg;
			return this;
		},
		setIcon: function (id) {
			this.$(".tw2gui_dialog_icon").remove();
			this.$(".tw2gui_dialog_text").css({
				"float": "none",
				"margin-left": 75
			}).before("<div class='tw2gui_dialog_icon system_icon_" + id + "'/>");
			return this;
		},
		addButton: function (text, callback, context) {
			var e = this.$(".tw2gui_dialog_actions");
			if (0 === e.length) {
				e = $("<div class='tw2gui_dialog_actions'/>");
				this.$(".tw2gui_dialog_content").after(e);
			}
			if (text instanceof west.gui.Button) {
				text.appendTo(e);
				return this;
			}
			switch (text) {
			case "no":
				text = "Нет";
				break;
			case "yes":
				text = "Да";
				break;
			case "ok":
				text = "ОК";
				break;
			case "change":
				text = "Изменить";
				break;
			case "submit":
				text = "Подтвердить";
				break;
			case "cancel":
				text = "Отмена";
				break;
			}
			var btn = new west.gui.Button(text, function () {
				if (!callback || false != callback.call(context, this, btn)) {
					this.hide();
				}
			}, this).appendTo(e);
			return this;
		},
		setModal: function (state, outsideClickCancel, bgopts) {
			if (null !== this.modalframe && false == state) {
				this.modalframe.remove();
				this.modalframe = null;
				this.setBlockGame(false);
				return this;
			}
			bgopts = true === bgopts ? {
				bg: "https://westrus.innogamescdn.com/images/useful/opacity03.png",
				opacity: 1.0
			} : $.extend({
				bg: "https://westrus.innogamescdn.com/images/transparent.png",
				opacity: 1.0
			}, bgopts);
			var zindex = this.divMain.css("z-index");
			zindex = zindex < 1 ? 1 : zindex;
			this.divMain.css("z-index", zindex + 1);
			this.modalframe = $("<a class='tw2gui_dialog_iecockblocker' style='position: relative; z-index: " + zindex + ";'>" + "<img src='" + bgopts.bg + "' style='width:100%;height:100%;opacity:" + bgopts.opacity + ";'/>" + "</a>");
			this.framefix.append(this.modalframe);
			var that = this;
			if (outsideClickCancel) {
				this.modalframe.mousedown(function () {
					if ('function' === typeof (outsideClickCancel)) {
						outsideClickCancel();
					}
					that.hide();
				});
			} else this.modalframe.css("cursor", "default");
			return this;
		},
		setDraggable: function (draggable) {
			if (draggable) {
				this.draggable = draggable;
				this.divMain.jqDrag('.tw2gui_inner_window_title', {
					onStart: this.handler.onDragStart,
					onStop: this.handler.onDragStop,
					onDrag: this.handler.onDrag,
					dialog: this
				});
			} else if (false === draggable) {
				this.draggable = draggable;
				$(this.divMain).jqDragOff('.tw2gui_inner_window_title');
			}
			return this;
		},
		setBlockGame: function (bool) {
			this.getFramefix().toggleClass('no_block', !bool);
			return this;
		},
		handler: {
			onDragStart: function (event) {
				this.dialwidth = this.dialog.divMain.outerWidth();
				this.browserwidth = $(window).width();
			},
			onDrag: function (e, css) {
				css.left = Math.min(this.browserwidth - this.dialwidth + 610, Math.max(-610, css.left));
				css.top = Math.max(0, css.top);
			},
			onDragStop: function (e, css) {}
		},
		getFramefix: function () {
			return this.framefix;
		},
		hide: function () {
			this.framefix.remove();
			return this;
		},
		getMainDiv: function () {
			return this.divMain;
		},
		show: function () {
			this.framefix.appendTo(document.body);
			if (0 == this.divMain.position().left && 0 == this.divMain.position().top) {
				this.divMain.css({
					"top": "50%",
					"left": "50%",
					"margin-top": "-" + (this.divMain.height() / 2) + "px",
					"margin-left": "-" + (this.divMain.width() / 2) + "px"
				});
			} else {
				var f = this.framefix,
					m = this.divMain;
				this.divMain.css({
					"left": Math.max(0, Math.min(m.position().left, f.width() - m.width())),
					"top": Math.max(0, Math.min(m.position().top, f.height() - m.height()))
				});
			}
			return this;
		}
	});
	west.gui.Dialog.SYS_WARNING = "warning";
	west.gui.Dialog.SYS_USERERROR = "usererror";
	west.gui.Dialog.SYS_OK = "ok";
	west.gui.Dialog.SYS_QUESTION = "question";
	west.define('west.gui.TextInputDialog', west.gui.Dialog, {
		init: function (title, msg, placeholder, icon) {
			this.placeholder = placeholder || '';
			west.gui.Dialog.prototype.init.call(this, title, msg, icon);
		},
		setText: function (text) {
			var textfield = new west.gui.Textfield().setPlaceholder(this.placeholder);
			west.gui.Dialog.prototype.setText.call(this, '<div class="fbar-add-dialog">' +
				text + '<br />' +
				jq2Html(textfield.getMainDiv()) + '</div>');
			textfield.getMainDiv().remove();
			return this;
		},
		setPlaceholder: function (placeholder) {
			this.placeholder = placeholder;
			return this;
		},
		addButton: function (text, callback, context) {
			return west.gui.Dialog.prototype.addButton.call(this, text, function (btn) {
				return callback ? callback.call(context, $('input', this.getMainDiv()).val(), this, btn) : undefined;
			}, this);
		},
		show: function () {
			west.gui.Dialog.prototype.show.call(this);
			$('input', this.getMainDiv()).focus().keypress(function (e) {
				if (e.which == 13) {
					$('div.tw2gui_button', this.getMainDiv()).first().click();
					e.preventDefault();
					return false;
				}
			}.bind(this));
			return this;
		}
	});
	west.define('west.gui.AmountSpecifier', west.gui.Component, {
		init: function (max) {
			this.max = max;
			this.current = 1;
			this.divMain = $('' + '<div>' + '<input class="item_popup_input" type="text" value="' + this.current + '" />' + '<span class="item_count_scrolls">' + '<img class="raise" src="https://westrus.innogamescdn.com/images/scrollbar/scroll_up.png" alt="' + 'Выше' + '">' + '<img class="lower" src="https://westrus.innogamescdn.com/images/scrollbar/scroll_down.png" alt="' + 'Ниже' + '">' + '</span>' + '<span class="item_popup_max_count">(' + this.max + ')</span>' + '</div>');
			this.$('.raise').on('click', this.raise.bind(this));
			this.$('.lower').on('click', this.lower.bind(this));
			this.$('.item_popup_max_count').on('click', this.setCount.bind(this));
		},
		getCurrent: function () {
			this.current = parseInt(this.$('.item_popup_input').val());
			return this.current;
		},
		setCount: function () {
			this.getCurrent();
			this.$('.item_popup_input').val(this.max);
		},
		lower: function () {
			this.getCurrent();
			if (this.current > 1) this.current--;
			this.$('.item_popup_input').val(this.current);
		},
		raise: function () {
			this.getCurrent();
			if (this.current < this.max) this.current++;
			this.$('.item_popup_input').val(this.current);
		}
	});
})(jQuery);

function notify_client_error(e) {
	Ajax.request({
		url: 'logjserr.php',
		data: {
			errmsg: e
		}
	});
}
ErrorLog = {
	list: [],
	log: function () {
		var d = [new Date()],
			i;
		for (i = 0; i < arguments.length; i += 1) d.push(arguments[i]);
		ErrorLog.list.push(d);
	},
	showLog: function () {
		if (ErrorLog.window) document.body.removeChild(ErrorLog.window);
		var d = document.createElement("div");
		var h = document.createElement("div");
		h.innerHTML = "Error Log (click here to close)";
		d.appendChild(h);
		var t = document.createElement("table");
		var i, l = ErrorLog.list,
			j, row;
		var style = function (d) {
			var s = function (k, v) {
				d.style[k] = v;
				return s;
			};
			return s
		};
		style(d)("position", "absolute")("left", "50%")("width", "800px")("height", "600px")
			("background", "#eec")("border", "1px solid red")("overflow", "scroll")
			("marginLeft", "-400px")("top", "20px")("zIndex", "100000");
		style(t)("border", "1px solid black");
		style(h)("borderBottom", "1px solid black")("fontSize", "16pt")
			("fontWeight", "bold")("marginBottom", "5px");
		t.border = "1";
		for (i = 0; i < l.length; i += 1) {
			row = t.insertRow(i);
			for (j = 0; j < l[i].length; j += 1)
				row.insertCell(j).innerHTML = l[i][j];
		}
		d.appendChild(t);
		h.onclick = function () {
			document.body.removeChild(d);
			ErrorLog.window = undefined;
		};
		document.body.appendChild(d);
		ErrorLog.window = d;
	}
}

var WestMaster = (function () {
	var initPortalBar = function (data) {
		if (!data || !data.js || !data.css) return;
		$(document).ready(function () {
			var onFinish = function () {
				$("#pbar").css("display", "block");
				$("body").css("background-position", "50% 28px");
				$("#wrapper").css("top", "28px");
				new Portal.Bar().run();
			};
			$('<link rel="stylesheet" type="text/css" media="all" href="' + data.css + '" />').appendTo('head');
			$.getScript(data.js).done(onFinish);
		});
	};
	var initChromestore = function () {
		if (!window.chrome) return;
		$('#tour').hide();
		$(".chromestore").show();
	};
	return {
		init: function (portalbar, worlds, links, domain) {
			Worlds.data = worlds;
			Registration.agbLink = links.agbLink;
			Registration.privacyLink = links.privacyLink;
			initPortalBar(portalbar);
			WestMaster.domain = domain;
			$(function () {
				initChromestore();
			});
		}
	};
})();
var Popup = {
	CONTAINER_ID: 'popup_container',
	prepare: function (triggerNode) {
		if ($('#' + Popup.CONTAINER_ID)) this._remove();
		var popup, blackout;
		popup = $('<div id="' + Popup.CONTAINER_ID + '"/>');
		blackout = $('<div id="blackout"/>');
		popup.insertBefore($('#wrapper'));
		blackout.insertAfter(popup);
		if (triggerNode.length) {
			popup.append(triggerNode);
			blackout.on('click', function () {
				Popup.remove();
			});
		}
	},
	_remove: function () {
		$('#' + Popup.CONTAINER_ID).remove();
		$('#blackout').remove();
	},
	remove: function () {
		$('#' + Popup.CONTAINER_ID).fadeOut();
		$('#blackout').fadeOut();
	}
}
var Tour = {
	CONTAINER_ID: 'tourPopup',
	page: 0,
	start: function () {
		if ($('#' + Tour.CONTAINER_ID).length) $('#' + Tour.CONTAINER_ID).remove();
		var div, close, next, prev, divwrap;
		div = $('<div id="' + Tour.CONTAINER_ID + '"/>')
		close = $('<div id="closeTour"/>').click(function () {
			Tour.close();
		});
		next = $('<div id="tourNext"/>').click(function () {
			Tour.switchPage(true);
		});
		prev = $('<div id="tourPrev"/>').click(function () {
			Tour.switchPage(false);
		});
		divwrap = $('<div id="tourWrapper"/>');
		divwrap.append(next, prev, close);
		div.append(divwrap);
		Popup.prepare(div);
		this.toggleData(0);
	},
	switchPage: function (next) {
		if (!$('#' + Tour.CONTAINER_ID).length) return;
		next ? this.page++ : this.page--;
		this.toggleData(this.page);
	},
	toggleData: function (page) {
		if (!$('#' + Tour.CONTAINER_ID).length) return;
		var data;
		switch (page) {
		case 0:
			data = {
				image: 'scene01',
				text: 'Кто ты? Золотоискатель, шулер или охотник за преступниками? Тебе решать, какой путь выбрать!'
			};
			break;
		case 1:
			data = {
				image: 'scene02',
				text: 'Построй форт со своими друзьями и вместе отражайте вражеские набеги!'
			};
			break;
		case 2:
			data = {
				image: 'scene03',
				text: 'Построй с другими игроками город и возведи новые здания.'
			};
			break;
		case 3:
			data = {
				image: 'scene06',
				text: 'Исследуй прерии и попадай в переделки на Диком Западе.' + "<br/> <a href=\"#\" onclick=\"Tour.close(); Registration.open();\">" + "Присоединяйся!" + "</a>"
			};
			break;
		}
		if (data) {
			Tour.setImage(data.image);
			Tour.setDescription(data.text);
		} else {
			Tour.close();
		}
	},
	setImage: function (imgName) {
		if (!$('#' + Tour.CONTAINER_ID).length) return;
		var tourImage, div, img;
		tourImage = $('#tourImage');
		if (!tourImage.length) {
			div = $('<div id="tourImage"/>');
			$('#tourWrapper').append(div);
		} else {
			tourImage.empty();
		}
		img = $('<img src="https://westrus.innogamescdn.com/images/startpage/tour/' + imgName + '.png" />');
		$('#tourImage').append(img);
	},
	setDescription: function (text) {
		if (!$('#' + Tour.CONTAINER_ID).length) return;
		var div;
		if (!$('#tourDescription').length) {
			div = $('<div id="tourDescription">' + text + '</div>');
			$('#tourWrapper').append(div);
		} else {
			$('#tourDescription').html(text);
		}
	},
	close: function () {
		this.page = 0;
		Popup.remove();
	}
}
var Media = {
	CONTAINER_ID: 'mediaPopup',
	start: function () {
		this.tab = '';
		this.tabs = [];
		if ($('#' + Media.CONTAINER_ID).length) $('#' + Media.CONTAINER_ID).remove();
		var div, close, next, prev, divwrap, content;
		div = $('<div id="' + Media.CONTAINER_ID + '"/>');
		close = $('<div id="closeMedia"/>').click(function () {
			Media.close();
		});
		content = $('<div id="mediaContent"/>');
		divwrap = $('<div id="mediaWrapper"/>');
		Popup.prepare(div);
		$('#blackout').on('click', function () {
			if ($('#flashplayer'))
				flowplayer('player').stop();
		});
		this.addTab('tour', 'ОБЗОР');
		this.addTab('trailer', 'ТРЕЙЛЕР');
		divwrap.append(content, close);
		div.append(divwrap);
		this.switchTab('tour');
	},
	addTab: function (id, title) {
		var tab = $('<div class="popup-tabs" id="tab_' + id + '">' + title + '</div>');
		tab.css('left', 20 + this.tabs.length * 145);
		tab.click(function () {
			Media.switchTab(id);
		});
		$('#' + Media.CONTAINER_ID).append(tab);
		this.tabs.push(id);
	},
	switchTab: function (id) {
		if (!$('#' + Media.CONTAINER_ID).length) return;
		if ($("#tab_" + this.tab).length)
			$("#tab_" + this.tab).removeClass("active-tab");
		this.tab = id;
		$("#tab_" + this.tab).addClass("active-tab");
		var content = $("#mediaContent");
		this.Tour.page = 0;
		switch (id) {
		case 'screenshots':
			content.html('');
			break;
		case 'trailer':
			content.html('<div id="flashplayer">' + '<a href="/flash/TheWest_Trailer_Final_1280x720.flv"' + 'id="player">' + '</a>' + '</div>');
			flowplayer("player", {
				src: "flash/flowplayer-3.2.7.swf",
				wmode: 'opaque'
			}, {
				clip: {
					autoPlay: false,
					autoBuffering: true
				}
			});
			break;
		case 'tour':
			content.html(Media.Tour.getHTML(0));
			break;
		default:
			break;
		}
	},
	close: function () {
		if ($('#flashplayer').length)
			flowplayer('player').stop();
		this.Tour.page = 0;
		Popup.remove();
	},
	Tour: {
		page: 0,
		tourdata: [{
			'image': 'scene01.png',
			'text': 'Кто ты? Золотоискатель, шулер или охотник за преступниками? Тебе решать, какой путь выбрать!'
		}, {
			'image': 'scene02.png',
			'text': 'Построй форт со своими друзьями и вместе отражайте вражеские набеги!'
		}, {
			'image': 'scene03.png',
			'text': 'Построй с другими игроками город и возведи новые здания.'
		}, {
			'image': 'scene04.png',
			'text': 'Поищи у коммивояжёра редкие предметы.'
		}, {
			'image': 'scene06.png',
			'text': 'Исследуй прерии и попадай в переделки на Диком Западе.'
		}],
		getHTML: function (page) {
			var data = this.tourdata[page];
			return "<div id='media-fingerboard'></div>" + "<img class='scenes' src='https://westrus.innogamescdn.com/images/startpage/tour/" + data.image + "' />" + "<div id='tourdesc'>" + data.text + "</div>" + "<div id='tour-prevpage' onclick='Media.Tour.prevPage()'></div>" + "<div id='tour-nextpage' onclick='Media.Tour.nextPage()'></div>";
		},
		prevPage: function () {
			if (this.page < 1) return;
			$("#mediaContent").html(this.getHTML(--this.page));
		},
		nextPage: function () {
			if (this.page + 1 > this.tourdata.length - 1) {
				Media.close();
				return;
			}
			$("#mediaContent").html(this.getHTML(++this.page));
		}
	}
}
var Features = {
	CONTAINER_ID: 'featuresPopup',
	start: function () {
		if ($('#' + Features.CONTAINER_ID).length) $('#' + Features.CONTAINER_ID).remove();
		var div, close, next, prev, divwrap;
		div = $('<div id="' + Features.CONTAINER_ID + '"/>');
		close = $('<div id="closeFeatures"/>').click(function () {
			Features.close();
		});
		divwrap = $('<div id="featuresWrapper"/>');
		divwrap.append(close);
		div.append(divwrap);
		Popup.prepare(div);
		this.toggleData();
	},
	toggleData: function () {
		if (!$('#' + Features.CONTAINER_ID).length) return;
		var div;
		var features = $('<ul/>');
		features.html("<li>" + 'Захватывающая, эпическая, историческая ролевая игра.' + "</li>" + "<li>" + 'Исследуй Дикий Запад пешком или на скакуне.' + "</li>" + "<li>" + 'Свой путь развития персонажа.' + "</li>" + "<li>" + 'Стратегические командные битвы.' + "</li>" + "<li>" + 'Взаимодействие игроков во множестве игровых аспектов.' + "</li>" + "<li>" + 'Множество захватывающих и интригующих квестов.' + "</li>" + "<li>" + 'Более 15 миллионов игроков по всему миру!' + "</li>");
		var text = $('<div id="featuresText">' + "ОСОБЕННОСТИ ИГРЫ" + '</div>');
		if (!$('#featuresDescription').length) {
			div = $('<div id="featuresDescription"/>').html(text);
			div.append(features);
			$('#featuresWrapper').append(div);
		} else {
			$("featuresDescription").append(features, text);
		}
	},
	close: function () {
		Popup.remove();
	}
}
var Registration = {
	CONTAINER_ID: 'registrationPopup',
	agbLink: '',
	privacyLink: '',
	alreadyLogged: false,
	preferredWorld: null,
	open: function (type, prefill) {
		if (this.alreadyLogged) return;
		if ($('#' + Registration.CONTAINER_ID)) $('#' + Registration.CONTAINER_ID).remove();
		var div, close, left, right, submit, modeLink, divwrap;
		div = $('<div id="' + Registration.CONTAINER_ID + '"></div>');
		close = $('<div id="closeRegistration"></div>').on('click', function () {
			Registration.close();
		});
		left = $('<div id="registForm"></div>');
		right = $('<div id="awards"></div>');
		submit = $('<div id="registrationButton"></div>').on('click', function () {
			Registration.submit();
		});
		divwrap = $('<div id="registrationWrapper"></div>');
		divwrap.append(close, submit, left, right);
		div.append(divwrap);
		Popup.prepare(div);
		this.isOpen = true;
		this.addInputElements(prefill);
		this.addAwards();
		$('#registUsername').focus();
		WestAnalytics.trackPageview('reg_form');
	},
	submit: function () {
		if (this.alreadyLogged || !$('#' + Registration.CONTAINER_ID).length) return;
		var agb = $('#agbAccept').hasClass('checked');
		if (!agb) {
			WestAnalytics.trackEvent('Form Tracking', 'form (registrationForm)', 'error_message|agb_not_accepted');
			new UserMessage('Необходимо согласится с условиями пользования.', UserMessage.TYPE_ERROR).show();
			return;
		}
		var username, password, repeat, email, world;
		username = $('#registUsername').val();
		email = $('#registEmail').val();
		password = $('#registPassword').val();
		repeat = $('#registRepeatPassword').val();
		world = 0;
		Registration.makeRegistration(world, {
			name: username,
			email: email,
			agb: agb ? 1 : 0,
			password: password,
			password_confirm: repeat
		}, function () {
			Registration.close();
			$('body').removeClass('oneClickRegistration');
			$('#playForFree').css('display', 'none');
		});
	},
	makeRegistration: function (world, data, success) {
		var registForm = $('#registForm');
		var registBtn = $('#registrationButton');
		if (registForm.length) {
			registForm.children().hide();
			registForm.append(Auth.getThrobber().css({
				'display': 'block',
				'padding-top': '140px'
			}));
			registBtn.css('display', 'none');
		}
		var register = function (data) {
			var err, key, i;
			if (data.error) {
				err = data.error;
				if (data.errors && data.errors.length) {
					err += '<ul class="reg-error-msg">';
					for (var i = 0; i < data.errors.length; i++) {
						WestAnalytics.trackEvent('Form Tracking', 'form (registrationForm)', 'error_message|' + data.errors[i].code);
						err += '<li>' + data.errors[i].message + '</li>';
					}
				}
				new UserMessage($('<div>' + err + '</div>')).show();
				if ($('#registForm').length) {
					$('#registForm').children().filter(':last').remove().end().show();
					registBtn.css('display', 'block');
				}
			} else if (data.redirect) {
				window.location.href = data.redirect;
			} else {
				new UserMessage(data.success, UserMessage.TYPE_SUCCESS).show();
				try {
					if (success) success();
				} catch (e) {
					notify_client_error(e)
				}
				try {
					Worlds.playerWorlds[data.registerWorld] = data.registerWorld;
				} catch (e) {
					notify_client_error(e)
				}
				try {
					Auth.showLogin(data.playerId, data.password, false, 'reg', true);
				} catch (e) {
					notify_client_error(e)
				}
			}
		};
		Ajax.request({
			url: 'index.php?page=register&ajax=registration&world=' + world,
			data: $.extend(data, {
				friendsdata: JSON.stringify(Auth.friendInviteData)
			})
		}).done(register);
	},
	checkInput: function (type, value, el) {
		if ('repeatpassword' != type) {
			var inform = function (data) {
				if (data.error) {
					new UserMessage(data.msg, UserMessage.TYPE_ERROR).show();
					if (el) el.focus();
				}
			};
			Ajax.request({
				url: 'index.php?page=register&ajax=check_input',
				data: {
					type: type,
					value: value
				}
			}).done(inform);
		} else {
			this.checkPasswordConfirm(value);
		}
	},
	checkPasswordConfirm: function (passwordConfirm, check, el) {
		var diff = (passwordConfirm != check && passwordConfirm != $('input[name=password]').val());
		if (diff) {
			WestAnalytics.trackEvent('Form Tracking', 'form (registrationForm)', 'error_message|password_repeat_mismatch');
			new UserMessage('Необходимо ввести один и тот же пароль два раза.', UserMessage.TYPE_ERROR).show();
			if (el) window.setTimeout(function () {
				el.focus();
			}, 10);
		}
	},
	addInputElements: function (prefill) {
		if (!$('#' + Registration.CONTAINER_ID).length) return;
		var div, username, password, repeat, email, checkcb, checkdiv, checkbox, checkLabel, labelText;
		var getInputElement = function (head, type, id, name, prefillText, next) {
			var div, title, input, br;
			div = $('<div id="' + name + 'Div"></div>');
			title = $('<span>&nbsp;' + head + '</span>');
			input = $('<input type="' + type + '" id="' + id + '" name="' + name + '" value="' + (prefillText || '') + '" />').change(function () {
				Registration.checkInput(name, this.value);
			});
			div.append(title, $('<br/>'), input);
			if (next) chain(input, next);
			return div;
		}
		var chain = function (what, to) {
			$(what).keyup(function (e) {
				if (e.keyCode == 13) {
					$(to).focus();
					return false;
				}
			});
			return what;
		}
		var getPrefillText = function (index) {
			return (undefined !== prefill && undefined !== prefill[index]) ? prefill[index] : '';
		}
		div = $('#registForm');
		username = getInputElement('Игрок:', 'text', 'registUsername', 'name', getPrefillText('username'), 'registPassword');
		password = getInputElement('Пароль:', 'password', 'registPassword', 'password', getPrefillText('password'), 'registRepeatPassword');
		repeat = getInputElement('Подтвердить пароль:', 'password', 'registRepeatPassword', 'repeatpassword', '', 'registEmail');
		email = getInputElement('E-mail:', 'text', 'registEmail', 'email', getPrefillText('email'), 'agbAccept');
		checkdiv = $('<div id="registCheckbox"></div>');
		checkbox = $('<a href="#" id="agbAccept" class="checkbox"></a>').keyup(function (e) {
			if (e.keyCode == 13) {
				$('#registrationButton').click();
			}
		}).click(function () {
			Toggle.checkbox($(this));
		});
		checkcb = $('<div class="cb"></div>');
		labelText = s('Я принимаю <a href=\"%1\" target=\"_blank\">условия</a> и <a href=\"%2\" target=\"_blank\">положение о конфиденциальности данных</a>.', this.agbLink, this.privacyLink) + '<br />';
		checkLabel = $('<label for="agbAccept">' + labelText + '</label>');
		checkdiv.append(checkbox, checkLabel, checkcb);
		div.append(username, password, repeat, email, checkdiv);
	},
	addAwards: function (into, max) {
		if (!into && !$('#' + Registration.CONTAINER_ID)) return;
		var cb;
		max = max || 100;
		var addAward = function (title, txt, src, fl) {
			if (--max < 0) return;
			var award, cb, rate, div, desc, image;
			award = $('<div class="award"></div>');
			cb = $('<div class="cb"></div>');
			div = $("<div></div>");
			if (title) {
				div.append($('<h1>' + title + '</h1>'));
			}
			desc = $('<span>' + txt + '</span>');
			image = $('<img src="https://westrus.innogamescdn.com/images/startpage/registration/awards/' + src + '.png" alt="" class="' + (fl ? 'fl' : null) + '" />');
			div.append(desc);
			award.append(image, div, cb);
			(into || $('#awards')).append(award);
		}
		addAward('Browser Game of The Year 2011', '', 'goty2011', true);
		addAward('Browser Game of The Year 2008', 'Из всех игр, которые мы видели в этом году, Дикий Запад произвёл на нас бесспорно самое сильное впечатление. Все составляющие игры показались жюри весьма убедительными.', 'goty', true);
		addAward(null, 'Как игра, так и форум на меня пока что произвели исключительно положительное впечатление.', 'galaxynews', false);
		addAward(null, 'Как идея, так и процесс игры на Диком Западе вносит приятное разнообразие в обширные джунгли браузерных игр.', 'gamessphere', false);
	},
	close: function () {
		Popup.remove();
	}
}
var Auth = {
	friendInviteData: {},
	oneClickRegister: function () {
		WestAnalytics.trackPageview('reg_click');
		var form = $('#loginForm').get(0);
		var agb = ($('#acceptAGB_1c').hasClass('checked') ? 1 : 0);
		if (!agb) {
			WestAnalytics.trackEvent('Form Tracking', 'form (registrationForm)', 'error_message|agb_not_accepted');
			new UserMessage('Необходимо согласится с условиями пользования.', UserMessage.TYPE_ERROR).show();
			return;
		}
		var avatar_config = {};
		if ($('#avatargen_start').length) {
			var config = AvatarMakeStart.makeConfig(AvatarMakeStart.config);
			for (var i = 0; i < avatarLayers.length; i += 1) {
				if (!avatarLayers.hasOwnProperty(i)) continue;
				var part = avatarLayers[i];
				var path = config[part];
				if (!path) continue;
				path = path.replace(/.png$/, "");
				avatar_config[part] = path;
			}
			avatar_config['background'] = config.background;
			avatar_config['sex'] = AvatarMakeStart.config.gender;
			avatar_config['color'] = AvatarMakeStart.config.skintone;
		}
		try {
			Registration.makeRegistration(Registration.preferredWorld || 0, {
				name: form.username_1c.value,
				email: form.email_1c.value,
				agb: agb,
				password: form.password_1c.value,
				password_confirm: form.passwordconfirm_1c.value,
				hidden_email_hash: Registration.emailHash
			}, function () {
				$('body').removeClass('oneClickRegistration');
				$('#playForFree').hide();
				var loginForm = $('#loginForm').get(0);
				loginForm.username.value = form.username_1c.value;
				loginForm.userpassword.value = form.password_1c.value;
				$('#selectWorld').append('<input type="hidden" name="avatar" value=\'' + JSON.stringify(avatar_config) + '\'"/>');
				if (Auth.friendInviteData.friendid != undefined)
					$('#selectWorld').append('<input type="hidden" name="friend_invite" value="true" />');
			});
		} catch (e) {
			console.log(e);
		}
		return false;
	},
	checkLogin: function () {
		if ($('body').hasClass('oneClickRegistration')) {
			Auth.oneClickRegister();
			return false;
		}
		var handleLoginFade = function () {
			$('#formInner, #loginThrobber').fadeToggle();
		};
		handleLoginFade();
		var usr = $('input[name=username]').val();
		var pwd = $('input[name=userpassword]').val();
		var url = 'index.php?ajax=check_login';
		var registerCallback = function (data) {
			if (typeof data == 'string') {
				handleLoginFade();
				new UserMessage(data, UserMessage.TYPE_ERROR).show();
				WestAnalytics.trackEvent('Form Tracking', 'form (loginForm)', 'error_message|unknown');
			} else if (data.error) {
				handleLoginFade();
				new UserMessage(data.msg, UserMessage.TYPE_ERROR).show();
				if (data.notfounderror) {
					WestAnalytics.trackEvent('Form Tracking', 'form (loginForm)', 'error_message|player_not_found');
					Registration.open(undefined, {
						'username': usr,
						'password': pwd
					});
				} else {
					WestAnalytics.trackEvent('Form Tracking', 'form (loginForm)', 'error_message|wrong_data');
				}
			} else if (data.isBanned != undefined) {
				WestAnalytics.trackEvent('Form Tracking', 'form (loginForm)', 'error_message|player_banned');
				$('#content').empty();
				$('#content').html(data.isBanned);
			} else if (data.isWishingDelete != undefined) {
				WestAnalytics.trackEvent('Form Tracking', 'form (loginForm)', 'error_message|account_for_deletion');
				$('#content').empty();
				$('#content').html(data.isWishingDelete);
			} else {
				handleLoginFade();
				Worlds.playerWorlds = data.playerWorlds;
				Auth.showLogin(data.player_id, data.password, true, 'login');
			}
		};
		Ajax.request({
			url: url,
			data: {
				name: usr,
				password: pwd
			}
		}).done(registerCallback);
		return false;
	},
	showLogin: function (player_id, password, set_cookie, refAction, forceCookie) {
		if (undefined == player_id || undefined == password) return false;
		var setHiddenInput = function (name, value) {
			$('input[name=' + name + ']', $('#selectWorld')).val(value);
		};
		setHiddenInput('world_id', 0);
		setHiddenInput('player_id', player_id);
		setHiddenInput('password', password);
		if (set_cookie) {
			setHiddenInput('set_cookie', $('#cookie').hasClass('checked') ? 1 : 0);
		} else if (forceCookie) {
			setHiddenInput('set_cookie', 1);
		}
		Worlds.show();
		WestAnalytics.trackPageview(refAction + '_world_selection');
		return false;
	},
	login: function (worldId) {
		var form = $('#selectWorld').get(0);
		if (!form) return;
		$('#worldsWrapper').empty();
		$('#worldsWrapper').append(this.getThrobber().css('display', 'block'));
		form.world_id.value = worldId;
		Auth.saveStartTime();
		$(function () {
			$('#selectWorld').submit();
		});
	},
	getThrobber: function () {
		var pleaseWait, div, img, txt;
		txt = 'Идёт загрузка';
		pleaseWait = $('<span>' + txt + '</span>');
		div = $('<div class="throbber"></div>');
		img = $('<img src="https://westrus.innogamescdn.com/images/throbber2.gif" alt="' + txt + '"/>');
		div.append(img, pleaseWait);
		return div;
	},
	saveStartTime: function () {
		document.cookie = 'log_startup_starttime=' + (new Date().getTime()) + '; domain=' + WestMaster.domain + ';path=/';
	}
}
var Worlds = {
	CONTAINER_ID: 'worldsPopup',
	data: null,
	playerWorlds: {},
	DesignHelper: {
		WorldButton: {
			get: function (world) {
				var active = undefined !== Worlds.playerWorlds[world.world_id];
				var row = $('<div id="world_' + world.world_id + '" class="world_row" />');
				var btn = $('<a href="#" class="world name">' + world.name + '</a>').addClass(active ? '' : 'inactive').data('world_id', world.world_id);
				this.addDetails(btn, world);
				var onlineState = world.login ? "online" : "offline";
				row.append(btn, $('<div class="world state" />').append($('<div class="description" />').text("Статус:"), $('<div class="' + onlineState + '"/>').text(world.login ? 'Онлайн' : 'Временно закрыт')), $('<div class="world count" />').append($('<div />').text(this.calcPopulation(world.player_count, world.player_limt))), $('<div class="world last_played" />').append($('<div class="description" />').text("Последний вход:"), $('<div />').text(active && Worlds.playerWorlds[world.world_id][1] != null ? Worlds.playerWorlds[world.world_id][1].getFormattedTimeString4Timestamp() : '-')));
				return row;
			},
			addDetails: function (btn, world) {
				var that = this;
				jQuery(btn).addMousePopup(new MousePopup(this.getDetailsLabel('Сотворение мира', world.start_date) + this.getDetailsLabel('Количество игроков', that.calcPopulation(world.player_count, world.player_limit)) + (world.player_limit ? this.getDetailsLabel('Квота', world.player_limit) : '') + this.getDetailsLabel('Описание', world.description, true) + (world.best ? '<b style="color:green;">(' + 'рекомендован' + ")</b>" : '')));
			},
			calcPopulation: function (count, limit) {
				if (count > 0 && count == limit) {
					return "Занятый";
				}
				if (count > 15000) {
					return "Густонаселённый";
				} else if (count < 15000 && count > 2000) {
					return "Средненаселённый";
				} else {
					return "Малонаселённый";
				}
			},
			getDetailsLabel: function (label, text, newline) {
				if (null == text || undefined == text) text = '-';
				return '<div style="padding-bottom: 8px;"><b>' + label + ':</b> ' + (newline ? "<br/>" : "") + text + "</div>";
			}
		},
		Row: {
			get: function (title, worlds, show, isStatic) {
				var worldsrow, header, toggler, content, toggleOnSymbol, toggleOffSymbol, contentHeader;
				toggleOnSymbol = ' [-]';
				toggleOffSymbol = ' [+]';
				worldsrow = $('<div class="worlds-row"></div>');
				content = $('<div class="row-content"></div>');
				toggler = $('<span class="row-toggle"></span>');
				header = $('<h2>' + title + '</h2>').click(function () {
					if (isStatic) return;
					var display = 'none' == content.css('display');
					content.css('display', display ? 'block' : 'none');
					toggler.html(display ? toggleOnSymbol : toggleOffSymbol);
				});
				content.css('display', show ? 'block' : 'none');
				toggler.html(show ? toggleOnSymbol : toggleOffSymbol);
				var world = null,
					btn = null,
					isEmpty = true;
				for (var key in worlds) {
					if (!worlds.hasOwnProperty(key)) continue;
					isEmpty = false;
					world = worlds[key];
					content.append(Worlds.DesignHelper.WorldButton.get(world));
				}
				if (isEmpty) return worldsrow;
				if (!isStatic) header.css('cursor', 'pointer').append(toggler);
				worldsrow.append(header, content);
				return worldsrow;
			}
		},
		getLayout: function (content) {
			var div, wrap, text, close, header;
			div = $('<div id="worldsPopup"></div>');
			wrap = $('<div id="worldsWrapper"></div>');
			close = $('<div id="closeWorlds"></div>').click(function () {
				Worlds.close();
			});
			text = $('<div id="selectWorldText">' + 'Выбери игровой мир:' + '</div>');
			wrap.append(text, close, content);
			div.append(wrap);
			return div;
		},
		getNoWorlds: function () {
			return $('<div>' + 'Сейчас не доступен ни один мир.' + '</div>');
		}
	},
	show: function () {
		if ($('#' + Worlds.CONTAINER_ID).length) $('#' + Worlds.CONTAINER_ID).remove();
		if ($('#logoutAdvertising')) $('#logoutAdvertising').css('display', 'none');
		var allworlds = $('<div id="allWorlds"></div>').on('click', '.name.world', function (e) {
			Auth.login($(e.target).data('world_id'));
		});
		if (this.data) {
			var mainRow = {};
			var showMoreRow = {};
			var prefRow = {};
			var world = null,
				worldActive = null;
			for (var k in this.data) {
				world = this.data[k];
				worldActive = undefined != Worlds.playerWorlds[world.world_id];
				if (worldActive) mainRow[k] = world;
				else if (world.best && world.register) prefRow[k] = world;
				else if (world.register) showMoreRow[k] = world;
			}
			allworlds.append(Worlds.DesignHelper.Row.get('Твои миры', mainRow, true, true), Worlds.DesignHelper.Row.get('Рекомендуемые миры', prefRow, true), Worlds.DesignHelper.Row.get('Другие миры', showMoreRow));
		} else {
			allworlds.append(Worlds.DesignHelper.getNoWorlds());
		}
		allworlds.append($('<div class="cb"></div>'));
		Popup.prepare(Worlds.DesignHelper.getLayout(allworlds));
		$('.name.world', allworlds).first().focus();
	},
	close: function () {
		Popup.remove();
		if ($('#logoutAdvertising')) $('#logoutAdvertising').css('display', 'block');
	}
}
var Toggle = {
	checkbox: function (el) {
		el = $(el);
		if (el.hasClass('checked')) {
			el.removeClass('checked');
		} else {
			el.addClass('checked');
		}
	}
};
(function () {
	function g(o) {
		console.log("$f.fireEvent", [].slice.call(o))
	}

	function k(q) {
		if (!q || typeof q != "object") {
			return q
		}
		var o = new q.constructor();
		for (var p in q) {
			if (q.hasOwnProperty(p)) {
				o[p] = k(q[p])
			}
		}
		return o
	}

	function m(t, q) {
		if (!t) {
			return
		}
		var o, p = 0,
			r = t.length;
		if (r === undefined) {
			for (o in t) {
				if (q.call(t[o], o, t[o]) === false) {
					break
				}
			}
		} else {
			for (var s = t[0]; p < r && q.call(s, p, s) !== false; s = t[++p]) {}
		}
		return t
	}

	function c(o) {
		return document.getElementById(o)
	}

	function i(q, p, o) {
		if (typeof p != "object") {
			return q
		}
		if (q && p) {
			m(p, function (r, s) {
				if (!o || typeof s != "function") {
					q[r] = s
				}
			})
		}
		return q
	}

	function n(s) {
		var q = s.indexOf(".");
		if (q != -1) {
			var p = s.slice(0, q) || "*";
			var o = s.slice(q + 1, s.length);
			var r = [];
			m(document.getElementsByTagName(p), function () {
				if (this.className && this.className.indexOf(o) != -1) {
					r.push(this)
				}
			});
			return r
		}
	}

	function f(o) {
		o = o || window.event;
		if (o.preventDefault) {
			o.stopPropagation();
			o.preventDefault()
		} else {
			o.returnValue = false;
			o.cancelBubble = true
		}
		return false
	}

	function j(q, o, p) {
		q[o] = q[o] || [];
		q[o].push(p)
	}

	function e() {
		return "_" + ("" + Math.random()).slice(2, 10)
	}
	var h = function (t, r, s) {
		var q = this,
			p = {},
			u = {};
		q.index = r;
		if (typeof t == "string") {
			t = {
				url: t
			}
		}
		i(this, t, true);
		m(("Begin*,Start,Pause*,Resume*,Seek*,Stop*,Finish*,LastSecond,Update,BufferFull,BufferEmpty,BufferStop").split(","), function () {
			var v = "on" + this;
			if (v.indexOf("*") != -1) {
				v = v.slice(0, v.length - 1);
				var w = "onBefore" + v.slice(2);
				q[w] = function (x) {
					j(u, w, x);
					return q
				}
			}
			q[v] = function (x) {
				j(u, v, x);
				return q
			};
			if (r == -1) {
				if (q[w]) {
					s[w] = q[w]
				}
				if (q[v]) {
					s[v] = q[v]
				}
			}
		});
		i(this, {
			onCuepoint: function (x, w) {
				if (arguments.length == 1) {
					p.embedded = [null, x];
					return q
				}
				if (typeof x == "number") {
					x = [x]
				}
				var v = e();
				p[v] = [x, w];
				if (s.isLoaded()) {
					s._api().fp_addCuepoints(x, r, v)
				}
				return q
			},
			update: function (w) {
				i(q, w);
				if (s.isLoaded()) {
					s._api().fp_updateClip(w, r)
				}
				var v = s.getConfig();
				var x = (r == -1) ? v.clip : v.playlist[r];
				i(x, w, true)
			},
			_fireEvent: function (v, y, w, A) {
				if (v == "onLoad") {
					m(p, function (B, C) {
						if (C[0]) {
							s._api().fp_addCuepoints(C[0], r, B)
						}
					});
					return false
				}
				A = A || q;
				if (v == "onCuepoint") {
					var z = p[y];
					if (z) {
						return z[1].call(s, A, w)
					}
				}
				if (y && "onBeforeBegin,onMetaData,onStart,onUpdate,onResume".indexOf(v) != -1) {
					i(A, y);
					if (y.metaData) {
						if (!A.duration) {
							A.duration = y.metaData.duration
						} else {
							A.fullDuration = y.metaData.duration
						}
					}
				}
				var x = true;
				m(u[v], function () {
					x = this.call(s, A, y, w)
				});
				return x
			}
		});
		if (t.onCuepoint) {
			var o = t.onCuepoint;
			q.onCuepoint.apply(q, typeof o == "function" ? [o] : o);
			delete t.onCuepoint
		}
		m(t, function (v, w) {
			if (typeof w == "function") {
				j(u, v, w);
				delete t[v]
			}
		});
		if (r == -1) {
			s.onCuepoint = this.onCuepoint
		}
	};
	var l = function (p, r, q, t) {
		var o = this,
			s = {},
			u = false;
		if (t) {
			i(s, t)
		}
		m(r, function (v, w) {
			if (typeof w == "function") {
				s[v] = w;
				delete r[v]
			}
		});
		i(this, {
			animate: function (y, z, x) {
				if (!y) {
					return o
				}
				if (typeof z == "function") {
					x = z;
					z = 500
				}
				if (typeof y == "string") {
					var w = y;
					y = {};
					y[w] = z;
					z = 500
				}
				if (x) {
					var v = e();
					s[v] = x
				}
				if (z === undefined) {
					z = 500
				}
				r = q._api().fp_animate(p, y, z, v);
				return o
			},
			css: function (w, x) {
				if (x !== undefined) {
					var v = {};
					v[w] = x;
					w = v
				}
				r = q._api().fp_css(p, w);
				i(o, r);
				return o
			},
			show: function () {
				this.display = "block";
				q._api().fp_showPlugin(p);
				return o
			},
			hide: function () {
				this.display = "none";
				q._api().fp_hidePlugin(p);
				return o
			},
			toggle: function () {
				this.display = q._api().fp_togglePlugin(p);
				return o
			},
			fadeTo: function (y, x, w) {
				if (typeof x == "function") {
					w = x;
					x = 500
				}
				if (w) {
					var v = e();
					s[v] = w
				}
				this.display = q._api().fp_fadeTo(p, y, x, v);
				this.opacity = y;
				return o
			},
			fadeIn: function (w, v) {
				return o.fadeTo(1, w, v)
			},
			fadeOut: function (w, v) {
				return o.fadeTo(0, w, v)
			},
			getName: function () {
				return p
			},
			getPlayer: function () {
				return q
			},
			_fireEvent: function (w, v, x) {
				if (w == "onUpdate") {
					var z = q._api().fp_getPlugin(p);
					if (!z) {
						return
					}
					i(o, z);
					delete o.methods;
					if (!u) {
						m(z.methods, function () {
							var B = "" + this;
							o[B] = function () {
								var C = [].slice.call(arguments);
								var D = q._api().fp_invoke(p, B, C);
								return D === "undefined" || D === undefined ? o : D
							}
						});
						u = true
					}
				}
				var A = s[w];
				if (A) {
					var y = A.apply(o, v);
					if (w.slice(0, 1) == "_") {
						delete s[w]
					}
					return y
				}
				return o
			}
		})
	};

	function b(q, G, t) {
		var w = this,
			v = null,
			D = false,
			u, s, F = [],
			y = {},
			x = {},
			E, r, p, C, o, A;
		i(w, {
			id: function () {
				return E
			},
			isLoaded: function () {
				return (v !== null && v.fp_play !== undefined && !D)
			},
			getParent: function () {
				return q
			},
			hide: function (H) {
				if (H) {
					q.style.height = "0px"
				}
				if (w.isLoaded()) {
					v.style.height = "0px"
				}
				return w
			},
			show: function () {
				q.style.height = A + "px";
				if (w.isLoaded()) {
					v.style.height = o + "px"
				}
				return w
			},
			isHidden: function () {
				return w.isLoaded() && parseInt(v.style.height, 10) === 0
			},
			load: function (J) {
				if (!w.isLoaded() && w._fireEvent("onBeforeLoad") !== false) {
					var H = function () {
						u = q.innerHTML;
						if (u && !flashembed.isSupported(G.version)) {
							q.innerHTML = ""
						}
						if (J) {
							J.cached = true;
							j(x, "onLoad", J)
						}
						flashembed(q, G, {
							config: t
						})
					};
					var I = 0;
					m(a, function () {
						this.unload(function (K) {
							if (++I == a.length) {
								H()
							}
						})
					})
				}
				return w
			},
			unload: function (J) {
				if (this.isFullscreen() && /WebKit/i.test(navigator.userAgent)) {
					if (J) {
						J(false)
					}
					return w
				}
				if (u.replace(/\s/g, "") !== "") {
					if (w._fireEvent("onBeforeUnload") === false) {
						if (J) {
							J(false)
						}
						return w
					}
					D = true;
					try {
						if (v) {
							v.fp_close();
							w._fireEvent("onUnload")
						}
					} catch (H) {}
					var I = function () {
						v = null;
						q.innerHTML = u;
						D = false;
						if (J) {
							J(true)
						}
					};
					setTimeout(I, 50)
				} else {
					if (J) {
						J(false)
					}
				}
				return w
			},
			getClip: function (H) {
				if (H === undefined) {
					H = C
				}
				return F[H]
			},
			getCommonClip: function () {
				return s
			},
			getPlaylist: function () {
				return F
			},
			getPlugin: function (H) {
				var J = y[H];
				if (!J && w.isLoaded()) {
					var I = w._api().fp_getPlugin(H);
					if (I) {
						J = new l(H, I, w);
						y[H] = J
					}
				}
				return J
			},
			getScreen: function () {
				return w.getPlugin("screen")
			},
			getControls: function () {
				return w.getPlugin("controls")._fireEvent("onUpdate")
			},
			getLogo: function () {
				try {
					return w.getPlugin("logo")._fireEvent("onUpdate")
				} catch (H) {}
			},
			getPlay: function () {
				return w.getPlugin("play")._fireEvent("onUpdate")
			},
			getConfig: function (H) {
				return H ? k(t) : t
			},
			getFlashParams: function () {
				return G
			},
			loadPlugin: function (K, J, M, L) {
				if (typeof M == "function") {
					L = M;
					M = {}
				}
				var I = L ? e() : "_";
				w._api().fp_loadPlugin(K, J, M, I);
				var H = {};
				H[I] = L;
				var N = new l(K, null, w, H);
				y[K] = N;
				return N
			},
			getState: function () {
				return w.isLoaded() ? v.fp_getState() : -1
			},
			play: function (I, H) {
				var J = function () {
					if (I !== undefined) {
						w._api().fp_play(I, H)
					} else {
						w._api().fp_play()
					}
				};
				if (w.isLoaded()) {
					J()
				} else {
					if (D) {
						setTimeout(function () {
							w.play(I, H)
						}, 50)
					} else {
						w.load(function () {
							J()
						})
					}
				}
				return w
			},
			getVersion: function () {
				var I = "flowplayer.js 3.2.6";
				if (w.isLoaded()) {
					var H = v.fp_getVersion();
					H.push(I);
					return H
				}
				return I
			},
			_api: function () {
				if (!w.isLoaded()) {
					throw "Flowplayer " + w.id() + " not loaded when calling an API method"
				}
				return v
			},
			setClip: function (H) {
				w.setPlaylist([H]);
				return w
			},
			getIndex: function () {
				return p
			},
			_swfHeight: function () {
				return v.clientHeight
			}
		});
		m(("Click*,Load*,Unload*,Keypress*,Volume*,Mute*,Unmute*,PlaylistReplace,ClipAdd,Fullscreen*,FullscreenExit,Error,MouseOver,MouseOut").split(","), function () {
			var H = "on" + this;
			if (H.indexOf("*") != -1) {
				H = H.slice(0, H.length - 1);
				var I = "onBefore" + H.slice(2);
				w[I] = function (J) {
					j(x, I, J);
					return w
				}
			}
			w[H] = function (J) {
				j(x, H, J);
				return w
			}
		});
		m(("pause,resume,mute,unmute,stop,toggle,seek,getStatus,getVolume,setVolume,getTime,isPaused,isPlaying,startBuffering,stopBuffering,isFullscreen,toggleFullscreen,reset,close,setPlaylist,addClip,playFeed,setKeyboardShortcutsEnabled,isKeyboardShortcutsEnabled").split(","), function () {
			var H = this;
			w[H] = function (J, I) {
				if (!w.isLoaded()) {
					return w
				}
				var K = null;
				if (J !== undefined && I !== undefined) {
					K = v["fp_" + H](J, I)
				} else {
					K = (J === undefined) ? v["fp_" + H]() : v["fp_" + H](J)
				}
				return K === "undefined" || K === undefined ? w : K
			}
		});
		w._fireEvent = function (Q) {
			if (typeof Q == "string") {
				Q = [Q]
			}
			var R = Q[0],
				O = Q[1],
				M = Q[2],
				L = Q[3],
				K = 0;
			if (t.debug) {
				g(Q)
			}
			if (!w.isLoaded() && R == "onLoad" && O == "player") {
				v = v || c(r);
				o = w._swfHeight();
				m(F, function () {
					this._fireEvent("onLoad")
				});
				m(y, function (S, T) {
					T._fireEvent("onUpdate")
				});
				s._fireEvent("onLoad")
			}
			if (R == "onLoad" && O != "player") {
				return
			}
			if (R == "onError") {
				if (typeof O == "string" || (typeof O == "number" && typeof M == "number")) {
					O = M;
					M = L
				}
			}
			if (R == "onContextMenu") {
				m(t.contextMenu[O], function (S, T) {
					T.call(w)
				});
				return
			}
			if (R == "onPluginEvent" || R == "onBeforePluginEvent") {
				var H = O.name || O;
				var I = y[H];
				if (I) {
					I._fireEvent("onUpdate", O);
					return I._fireEvent(M, Q.slice(3))
				}
				return
			}
			if (R == "onPlaylistReplace") {
				F = [];
				var N = 0;
				m(O, function () {
					F.push(new h(this, N++, w))
				})
			}
			if (R == "onClipAdd") {
				if (O.isInStream) {
					return
				}
				O = new h(O, M, w);
				F.splice(M, 0, O);
				for (K = M + 1; K < F.length; K++) {
					F[K].index++
				}
			}
			var P = true;
			if (typeof O == "number" && O < F.length) {
				C = O;
				var J = F[O];
				if (J) {
					P = J._fireEvent(R, M, L)
				}
				if (!J || P !== false) {
					P = s._fireEvent(R, M, L, J)
				}
			}
			m(x[R], function () {
				P = this.call(w, O, M);
				if (this.cached) {
					x[R].splice(K, 1)
				}
				if (P === false) {
					return false
				}
				K++
			});
			return P
		};

		function B() {
			if ($f(q)) {
				$f(q).getParent().innerHTML = "";
				p = $f(q).getIndex();
				a[p] = w
			} else {
				a.push(w);
				p = a.length - 1
			}
			A = parseInt(q.style.height, 10) || q.clientHeight;
			E = q.id || "fp" + e();
			r = G.id || E + "_api";
			G.id = r;
			t.playerId = E;
			if (typeof t == "string") {
				t = {
					clip: {
						url: t
					}
				}
			}
			if (typeof t.clip == "string") {
				t.clip = {
					url: t.clip
				}
			}
			t.clip = t.clip || {};
			if (q.getAttribute("href", 2) && !t.clip.url) {
				t.clip.url = q.getAttribute("href", 2)
			}
			s = new h(t.clip, -1, w);
			t.playlist = t.playlist || [t.clip];
			var I = 0;
			m(t.playlist, function () {
				var K = this;
				if (typeof K == "object" && K.length) {
					K = {
						url: "" + K
					}
				}
				m(t.clip, function (L, M) {
					if (M !== undefined && K[L] === undefined && typeof M != "function") {
						K[L] = M
					}
				});
				t.playlist[I] = K;
				K = new h(K, I, w);
				F.push(K);
				I++
			});
			m(t, function (K, L) {
				if (typeof L == "function") {
					if (s[K]) {
						s[K](L)
					} else {
						j(x, K, L)
					}
					delete t[K]
				}
			});
			m(t.plugins, function (K, L) {
				if (L) {
					y[K] = new l(K, L, w)
				}
			});
			if (!t.plugins || t.plugins.controls === undefined) {
				y.controls = new l("controls", null, w)
			}
			y.canvas = new l("canvas", null, w);
			u = q.innerHTML;

			function J(L) {
				var K = w.hasiPadSupport && w.hasiPadSupport();
				if (/iPad|iPhone|iPod/i.test(navigator.userAgent) && !/.flv$/i.test(F[0].url) && !K) {
					return true
				}
				if (!w.isLoaded() && w._fireEvent("onBeforeClick") !== false) {
					w.load()
				}
				return f(L)
			}

			function H() {
				if (u.replace(/\s/g, "") !== "") {
					if (q.addEventListener) {
						q.addEventListener("click", J, false)
					} else {
						if (q.attachEvent) {
							q.attachEvent("onclick", J)
						}
					}
				} else {
					if (q.addEventListener) {
						q.addEventListener("click", f, false)
					}
					w.load()
				}
			}
			setTimeout(H, 0)
		}
		if (typeof q == "string") {
			var z = c(q);
			if (!z) {
				throw "Flowplayer cannot access element: " + q
			}
			q = z;
			B()
		} else {
			B()
		}
	}
	var a = [];

	function d(o) {
		this.length = o.length;
		this.each = function (p) {
			m(o, p)
		};
		this.size = function () {
			return o.length
		}
	}
	window.flowplayer = window.$f = function () {
		var p = null;
		var o = arguments[0];
		if (!arguments.length) {
			m(a, function () {
				if (this.isLoaded()) {
					p = this;
					return false
				}
			});
			return p || a[0]
		}
		if (arguments.length == 1) {
			if (typeof o == "number") {
				return a[o]
			} else {
				if (o == "*") {
					return new d(a)
				}
				m(a, function () {
					if (this.id() == o.id || this.id() == o || this.getParent() == o) {
						p = this;
						return false
					}
				});
				return p
			}
		}
		if (arguments.length > 1) {
			var t = arguments[1],
				q = (arguments.length == 3) ? arguments[2] : {};
			if (typeof t == "string") {
				t = {
					src: t
				}
			}
			t = i({
				bgcolor: "#000000",
				version: [9, 0],
				expressInstall: "http://static.flowplayer.org/swf/expressinstall.swf",
				cachebusting: false
			}, t);
			if (typeof o == "string") {
				if (o.indexOf(".") != -1) {
					var s = [];
					m(n(o), function () {
						s.push(new b(this, k(t), k(q)))
					});
					return new d(s)
				} else {
					var r = c(o);
					return new b(r !== null ? r : o, t, q)
				}
			} else {
				if (o) {
					return new b(o, t, q)
				}
			}
		}
		return null
	};
	i(window.$f, {
		fireEvent: function () {
			var o = [].slice.call(arguments);
			var q = $f(o[0]);
			return q ? q._fireEvent(o.slice(1)) : null
		},
		addPlugin: function (o, p) {
			b.prototype[o] = p;
			return $f
		},
		each: m,
		extend: i
	});
	if (typeof jQuery == "function") {
		jQuery.fn.flowplayer = function (q, p) {
			if (!arguments.length || typeof arguments[0] == "number") {
				var o = [];
				this.each(function () {
					var r = $f(this);
					if (r) {
						o.push(r)
					}
				});
				return arguments.length ? o[arguments[0]] : new d(o)
			}
			return this.each(function () {
				$f(this, k(q), p ? k(p) : {})
			})
		}
	}
})();
(function () {
	var e = typeof jQuery == "function";
	var i = {
		width: "100%",
		height: "100%",
		allowfullscreen: true,
		allowscriptaccess: "always",
		quality: "high",
		version: null,
		onFail: null,
		expressInstall: null,
		w3c: false,
		cachebusting: false
	};
	if (e) {
		jQuery.tools = jQuery.tools || {};
		jQuery.tools.flashembed = {
			version: "1.0.4",
			conf: i
		}
	}

	function j() {
		if (c.done) {
			return false
		}
		var l = document;
		if (l && l.getElementsByTagName && l.getElementById && l.body) {
			clearInterval(c.timer);
			c.timer = null;
			for (var k = 0; k < c.ready.length; k++) {
				c.ready[k].call()
			}
			c.ready = null;
			c.done = true
		}
	}
	var c = e ? jQuery : function (k) {
		if (c.done) {
			return k()
		}
		if (c.timer) {
			c.ready.push(k)
		} else {
			c.ready = [k];
			c.timer = setInterval(j, 13)
		}
	};

	function f(l, k) {
		if (k) {
			for (key in k) {
				if (k.hasOwnProperty(key)) {
					l[key] = k[key]
				}
			}
		}
		return l
	}

	function g(k) {
		switch (h(k)) {
		case "string":
			k = k.replace(new RegExp('(["\\\\])', "g"), "\\$1");
			k = k.replace(/^\s?(\d+)%/, "$1pct");
			return '"' + k + '"';
		case "array":
			return "[" + b(k, function (n) {
				return g(n)
			}).join(",") + "]";
		case "function":
			return '"function()"';
		case "object":
			var l = [];
			for (var m in k) {
				if (k.hasOwnProperty(m)) {
					l.push('"' + m + '":' + g(k[m]))
				}
			}
			return "{" + l.join(",") + "}"
		}
		return String(k).replace(/\s/g, " ").replace(/\'/g, '"')
	}

	function h(l) {
		if (l === null || l === undefined) {
			return false
		}
		var k = typeof l;
		return (k == "object" && l.push) ? "array" : k
	}
	if (window.attachEvent) {
		window.attachEvent("onbeforeunload", function () {
			__flash_unloadHandler = function () {};
			__flash_savedUnloadHandler = function () {}
		})
	}

	function b(k, n) {
		var m = [];
		for (var l in k) {
			if (k.hasOwnProperty(l)) {
				m[l] = n(k[l])
			}
		}
		return m
	}

	function a(r, t) {
		var q = f({}, r);
		var s = document.all;
		var n = '<object width="' + q.width + '" height="' + q.height + '"';
		if (s && !q.id) {
			q.id = "_" + ("" + Math.random()).substring(9)
		}
		if (q.id) {
			n += ' id="' + q.id + '"'
		}
		if (q.cachebusting) {
			q.src += ((q.src.indexOf("?") != -1 ? "&" : "?") + Math.random())
		}
		if (q.w3c || !s) {
			n += ' data="' + q.src + '" type="application/x-shockwave-flash"'
		} else {
			n += ' classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'
		}
		n += ">";
		if (q.w3c || s) {
			n += '<param name="movie" value="' + q.src + '" />'
		}
		q.width = q.height = q.id = q.w3c = q.src = null;
		for (var l in q) {
			if (q[l] !== null) {
				n += '<param name="' + l + '" value="' + q[l] + '" />'
			}
		}
		var o = "";
		if (t) {
			for (var m in t) {
				if (t[m] !== null) {
					o += m + "=" + (typeof t[m] == "object" ? g(t[m]) : t[m]) + "&"
				}
			}
			o = o.substring(0, o.length - 1);
			n += '<param name="flashvars" value=\'' + o + "' />"
		}
		n += "</object>";
		return n
	}

	function d(m, p, l) {
		var k = flashembed.getVersion();
		f(this, {
			getContainer: function () {
				return m
			},
			getConf: function () {
				return p
			},
			getVersion: function () {
				return k
			},
			getFlashvars: function () {
				return l
			},
			getApi: function () {
				return m.firstChild
			},
			getHTML: function () {
				return a(p, l)
			}
		});
		var q = p.version;
		var r = p.expressInstall;
		var o = !q || flashembed.isSupported(q);
		if (o) {
			p.onFail = p.version = p.expressInstall = null;
			m.innerHTML = a(p, l)
		} else {
			if (q && r && flashembed.isSupported([6, 65])) {
				f(p, {
					src: r
				});
				l = {
					MMredirectURL: location.href,
					MMplayerType: "PlugIn",
					MMdoctitle: document.title
				};
				m.innerHTML = a(p, l)
			} else {
				if (m.innerHTML.replace(/\s/g, "") !== "") {} else {
					m.innerHTML = "<h2>Flash version " + q + " or greater is required</h2><h3>" + (k[0] > 0 ? "Your version is " + k : "You have no flash plugin installed") + "</h3>" + (m.tagName == "A" ? "<p>Click here to download latest version</p>" : "<p>Download latest version from <a href='http://www.adobe.com/go/getflashplayer'>here</a></p>");
					if (m.tagName == "A") {
						m.onclick = function () {
							location.href = "http://www.adobe.com/go/getflashplayer"
						}
					}
				}
			}
		}
		if (!o && p.onFail) {
			var n = p.onFail.call(this);
			if (typeof n == "string") {
				m.innerHTML = n
			}
		}
		if (document.all) {
			window[p.id] = document.getElementById(p.id)
		}
	}
	window.flashembed = function (l, m, k) {
		if (typeof l == "string") {
			var n = document.getElementById(l);
			if (n) {
				l = n
			} else {
				c(function () {
					flashembed(l, m, k)
				});
				return
			}
		}
		if (!l) {
			return
		}
		if (typeof m == "string") {
			m = {
				src: m
			}
		}
		var o = f({}, i);
		f(o, m);
		return new d(l, o, k)
	};
	f(window.flashembed, {
		getVersion: function () {
			var m = [0, 0];
			if (navigator.plugins && typeof navigator.plugins["Shockwave Flash"] == "object") {
				var l = navigator.plugins["Shockwave Flash"].description;
				if (typeof l != "undefined") {
					l = l.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
					var n = parseInt(l.replace(/^(.*)\..*$/, "$1"), 10);
					var r = /r/.test(l) ? parseInt(l.replace(/^.*r(.*)$/, "$1"), 10) : 0;
					m = [n, r]
				}
			} else {
				if (window.ActiveXObject) {
					try {
						var p = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7")
					} catch (q) {
						try {
							p = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
							m = [6, 0];
							p.AllowScriptAccess = "always"
						} catch (k) {
							if (m[0] == 6) {
								return m
							}
						}
						try {
							p = new ActiveXObject("ShockwaveFlash.ShockwaveFlash")
						} catch (o) {}
					}
					if (typeof p == "object") {
						l = p.GetVariable("$version");
						if (typeof l != "undefined") {
							l = l.replace(/^\S+\s+(.*)$/, "$1").split(",");
							m = [parseInt(l[0], 10), parseInt(l[2], 10)]
						}
					}
				}
			}
			return m
		},
		isSupported: function (k) {
			var m = flashembed.getVersion();
			var l = (m[0] > k[0]) || (m[0] == k[0] && m[1] >= k[1]);
			return l
		},
		domReady: c,
		asString: g,
		getHTML: a
	});
	if (e) {
		jQuery.fn.flashembed = function (l, k) {
			var m = null;
			this.each(function () {
				m = flashembed(this, l, k)
			});
			return l.api === false ? this : m
		}
	}
})();;
(function ($) {
	window.AvatarMakeStart = {}
	var avatar_data = window.avatar_72x72_data
	var blacklist = {};
	var dir_next = 0;
	AvatarMakeStart.backgroundx = 0;
	AvatarMakeStart.config = {
		gender: "male",
		skintone: "white",
		background: 0,
		head: 0,
		eyes: 0,
		nose: 0,
		mouth: 0,
		beards: -1,
		skin_1: -1,
		skin_2: -1,
		hair: 0,
		accessoires_1: -1,
		accessoires_2: -1,
		clothing: 0,
		hatsa: 0,
		hatsb: 0,
		wounds: 0,
		pose: 0
	};
	AvatarMakeStart.randomize = function () {
		var key = [];
		for (k in AvatarMakeStart.imageMapping) {
			key.push(k);
		}
		var rnd = Math.floor(Math.random() * key.length);
		var tiles = AvatarMakeStart.imageMapping[key[rnd]];
		var test = key[rnd].split('_');
		var config = {};
		for (k in AvatarMakeStart.config) config[k] = AvatarMakeStart.config[k];
		AvatarMakeStart.oldConfig = config;
		AvatarMakeStart.config = {
			gender: test[0],
			skintone: test[1],
			background: Math.floor(Math.random() * (tiles.background.length)),
			head: Math.floor(Math.random() * (tiles.head.length)),
			eyes: Math.floor(Math.random() * (tiles.eyes.length)),
			nose: Math.floor(Math.random() * (tiles.nose.length)),
			mouth: Math.floor(Math.random() * (tiles.mouth.length)),
			beards: test[0] == 'male' ? Math.floor(Math.random() * (tiles.beards1.length + tiles.beards2.length)) : -1,
			skin_1: Math.floor(Math.random() * (tiles.skin.length)),
			skin_2: -1,
			hair: Math.floor(Math.random() * (tiles.hair.length)),
			accessoires_1: Math.floor(Math.random() * (tiles.accessoires.length)),
			accessoires_2: -1,
			clothing: Math.floor(Math.random() * (tiles.clothing.length)),
			hatsa: Math.floor(Math.random() * (tiles.hatsa.length)),
			hatsb: Math.floor(Math.random() * (tiles.hatsb.length)),
			wounds: 0,
			pose: Math.floor(Math.random() * (tiles.pose.length))
		};
		var newconfig = {};
		for (k in AvatarMakeStart.config) newconfig[k] = AvatarMakeStart.config[k];
		AvatarMakeStart.newConfig = newconfig;
		$('#avatargen_hover_undo').addClass('hover_undo').click(function () {
			AvatarMakeStart.previousConfig();
		});
		$('#avatargen_hover_redo').removeClass('hover_forward').off('click');
		AvatarMakeStart.update();
	}
	AvatarMakeStart.previousConfig = function () {
		$('#avatargen_hover_undo').removeClass('hover_undo').off('click');
		$('#avatargen_hover_redo').addClass('hover_forward').click(function () {
			AvatarMakeStart.nextConfig();
		});
		AvatarMakeStart.config = AvatarMakeStart.oldConfig;
		AvatarMakeStart.update();
	}
	AvatarMakeStart.nextConfig = function () {
		$('#avatargen_hover_redo').removeClass('hover_forward').off('click');
		$('#avatargen_hover_undo').addClass('hover_undo').click(function () {
			AvatarMakeStart.previousConfig();
		});
		AvatarMakeStart.config = AvatarMakeStart.newConfig;
		AvatarMakeStart.update();
	}
	AvatarMakeStart.makeConfig = function (c) {
		var notdone = false;
		var cfg = {}
		var map = AvatarMakeStart.imageMapping[c.gender + "_" + c.skintone];
		if (map.beards1) {
			c.beards %= map.beards1.length + map.beards2.length;
			var tmp = c.beards < 0 ? (-c.beards) : c.beards;
			c.beards1 = tmp < map.beards1.length ? tmp : -1;
			c.beards2 = tmp < map.beards1.length ? -1 : tmp - map.beards1.length;
		}
		for (var i = 0; i < avatarLayers.length; i += 1) {
			var k = avatarLayers[i];
			var arr = map[k.match(/[^_]+/)[0]];
			if (!arr) continue;
			var n = c[k] || 0;
			if (k == "eyes" || k == "nose" || k == "mouth" || k == "hair" || k == "clothing") n = (n < 0 ? arr.length - 1 : 0) + n % arr.length;
			else n = (n < 0 ? arr.length + 1 : 0) + n % (arr.length + 1);
			if (((arr[n] || {}).k != null))
				$.each(blacklist, function (key) {
					if (arr[n] != null && (arr[n] || {}).k.match(key)) {
						if (dir_next == 0)
							dir_next = 1;
						if ("beards2" == k || "beards1" == k)
							k = "beards";
						AvatarMakeStart.config[k] = AvatarMakeStart.config[k] + dir_next;
						notdone = true;
						return;
					}
				});
			cfg[k] = (arr[n] || {}).k;
		}
		cfg.background = map.background[c.background];
		if (cfg.hatsa) {
			cfg.hatsb = cfg.hatsa.replace(/hatsa/, "hatsb").replace(/a\.png/, "b.png")
		} else cfg.hatsb = undefined;
		if (notdone)
			return 0;
		return cfg;
	}
	AvatarMakeStart.update = function () {
		var conf = AvatarMakeStart.makeConfig(AvatarMakeStart.config);
		while (conf == 0) {
			conf = AvatarMakeStart.makeConfig(AvatarMakeStart.config);
		}
		tw2widget.avatarPicture($('#avatargen_pic'), 'large', conf);
		AvatarMakeStart.setGenerator();
		return this;
	}
	AvatarMakeStart.setGender = function (g) {
		AvatarMakeStart.config.gender = g;
		return AvatarMakeStart.update();
	}
	AvatarMakeStart.setSkin = function (s) {
		AvatarMakeStart.config.skintone = s;
		return AvatarMakeStart.update();
	}
	AvatarMakeStart.switchThing = function (div, dir) {
		dir_next = dir;
		var cls = $(div.parentNode).attr("class");
		var part = cls.match(/avatar_(.*)_select/)[1];
		AvatarMakeStart.config[part] = AvatarMakeStart.config[part] + dir;
		var tmp = AvatarMakeStart.update();
	}
	AvatarMakeStart.updateDescription = function (k) {
		var span = $("." + k + "_desc > span", $("#avatargen_description_container"))[0];
		if (undefined == span) return;
		span.innerHTML = "(" + (AvatarMakeStart.config[k] + 1) + "/" + (AvatarMakeStart.getPartCount(k) + 1) + ")";
	}
	AvatarMakeStart.getPartCount = function (k) {
		var maxl = AvatarMakeStart.imageMapping[AvatarMakeStart.config.gender + "_" + AvatarMakeStart.config.skintone];
		if ("beards" == k) maxl = maxl["beards1"].length + maxl["beards2"].length;
		else if ("accessoires_1" == k) maxl = maxl["accessoires"].length;
		else if ("skin_1" == k) maxl = maxl["skin"].length;
		else maxl = maxl[k].length;
		return maxl;
	}
	AvatarMakeStart.switchBackground = function (dir) {
		AvatarMakeStart.backgroundx = dir;
		AvatarMakeStart.config["background"] = dir;
		return AvatarMakeStart.update();
	}
	AvatarMakeStart.toggleBackground = function (x) {
		var maxl = AvatarMakeStart.imageMapping[AvatarMakeStart.config.gender + "_" + AvatarMakeStart.config.skintone].background.length - 1;
		x += AvatarMakeStart.backgroundx;
		x = x > maxl ? 0 : (x <= 0 ? maxl : x);
		AvatarMakeStart.switchBackground(x);
		AvatarMakeStart.setGenerator();
	}
	AvatarMakeStart.setGenerator = function () {
		$('#avatargen_background').children().remove();
		var config = {}
		var types = AvatarMakeStart.imageMapping;
		for (k in AvatarMakeStart.config) config[k] = AvatarMakeStart.config[k];
		config.gender == 'female' ? $('.avatar_beards_select').children().addClass('none') : $('.avatar_beards_select').children().removeClass('none');
		['male', 'female'].each(function (el) {
			el == config.gender ? $('#avatargen_pick_' + el).addClass('pick_' + el) : $('#avatargen_pick_' + el).removeClass('pick_' + el);
		});
		['white', 'black', 'brown'].each(function (el) {
			el == config.skintone ? $('#avatargen_pick_' + el).addClass('pick_something') : $('#avatargen_pick_' + el).removeClass('pick_something');
		});
		$('#bg_forward').off('click').click(function () {
			AvatarMakeStart.toggleBackground(1);
		});
		$('#bg_backward').off('click').click(function () {
			AvatarMakeStart.toggleBackground(-1);
		});
		var x = AvatarMakeStart.backgroundx;
		for (var y = 0; y < 1; y++) {
			var img = $("<img style='margin-right:7px;' onclick='AvatarMakeStart.switchBackground(" + x + ")' src='https://westrus.innogamescdn.com/images/avatargen/background/" + types[config.gender + "_" + config.skintone].background[x] + ".jpg' alt='' width='64' />");
			img.appendTo($('#avatargen_background'));
			x++;
		}
	}
	AvatarMakeStart.init = function () {
		var types = {};
		$.getJSON('https://westrus.innogamescdn.com/images/avatargen/metainfo.js', function (data) {
			var key;
			var black = data["restricted"];
			for (key in black) {
				if (black.hasOwnProperty(key)) {
					blacklist[black[key]] = key;
				}
			}
			for (var k in avatar_data) {
				if (!avatar_data.hasOwnProperty(k)) continue;
				var splits = k.split(/\//);
				var charType = splits[0];
				var part = splits[1];
				if (part.match(/\.png/)) part = "head";
				if (!types[charType]) types[charType] = {};
				types[charType][part] = types[charType][part] || [];
				types[charType][part].push(avatar_data[k]);
				avatar_data[k].k = k;
			}
			for (k in types)
				for (part in types[k]) types[k][part].sort(function (a, b) {
					return a.k < b.k ? -1 : 1
				});
			var bglist = [];
			var block;
			for (k in avatar_backgrounds) {
				block = false;
				$.each(blacklist, function (key) {
					if (k == key) {
						block = true;
						return;
					}
				});
				if (!block)
					bglist.push(k);
			}
			bglist.sort();
			for (k in types) types[k].background = bglist;
			AvatarMakeStart.imageMapping = types;
			AvatarMakeStart.update();
			AvatarMakeStart.randomize();
		});
	}
})(jQuery);

var dataLayer = dataLayer || [];
var WestAnalytics = {
	trackPageview: function (page) {
		dataLayer.push({
			'event': 'page',
			'pageName': page
		});
	},
	trackEvent: function (category, action, opt_label) {
		dataLayer.push({
			'event': 'event',
			'eventCategory': category,
			'eventAction': action,
			'eventLabel': opt_label
		});
	},
	setUpEvents: function () {
		var track = function (cat, act, labelSuffix) {
			WestAnalytics.trackEvent(cat, act, labelSuffix);
		};
		var match = function (str, regex) {
			var m = str.match(regex);
			return m ? m[1] : 'unknown';
		};
		$('body').mousedown(function (e) {
			var found, params;
			[['#tour', ['teaser', 'tour', 'tour_v1']], ['#mediaButton', ['teaser', 'media', 'media_v1']], ['#featuresButton', ['teaser', 'features', 'features_v1']], ['#cookie', ['login_form', 'check_box', 'permanent_login']], ['#userOptions > a', ['login_form', 'link_click', 'change_password']], ['#agbAccept', ['registration_form', 'check_box', 'accept_terms']], ['#registCheckbox a[href*=agb]', ['registration_form', 'link_click', 'terms']], ['#registCheckbox a[href*=privacy]', ['registration_form', 'link_click', 'privacy']], ['#registrationButton', ['registration_form', 'button_click', 'register_button']], ['#acceptAGB_1c', ['registration_form_1click', 'check_box', 'accept_terms']], ['#inputAGBAccept_1c a[href*=agb]', ['registration_form_1click', 'link_click', 'terms']], ['#inputAGBAccept_1c a[href*=privacy]', ['registration_form_1click', 'link_click', 'privacy']], ['#registrationButton_1c', ['registration_form_1click', 'button_click', 'register_button']], ['.pb-flag', ['top_navigation', 'dropdown_market', function (el) {
				return match(el.id, /pb-flag-(\w+)/);
			}]], ['.pb-moregames-overview > li', ['top_navigation', 'game_bar', function (el) {
				return match(el.id, /pb_game_(\w+)$/);
			}]], ['.footlink', ['bottom_navigation', 'link_click', function (el) {
				return match(el.className, /footlink-(\w+)/);
			}]], ['#logo', ['game_logo', 'logo_click', 'west']], ['#logo .glow', ['game_logo', 'logo_click', 'west']], ['#playForFree', ['register_button', 'button_click', 'open_registration_form']], ['#show_distractor_button', ['news', 'link_click', 'show_news']], ['.news a[href*=showthread]', ['news', 'link_click', function (el) {
				return WestAnalytics.config.market + '_' + el.href.match(/showthread\.php\?p=(\d+)/)[1];
			}]]].each(function (trackEvent) {
				if (found || !$(e.target).is(trackEvent[0])) return;
				params = trackEvent[1].map(function (param) {
					return typeof param === 'function' ? param.call(null, e.target) : param;
				});
				track.apply(null, params);
				found = true;
			});
		});
	}
};