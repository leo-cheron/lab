var MouseEvent = module.exports = function() {};

MouseEvent.touch = $.os.tablet || $.os.phone;

// mouse / touch
MouseEvent.DOWN = MouseEvent.touch ? "touchstart" : "mousedown";
MouseEvent.UP = MouseEvent.touch ? "touchend" : "mouseup";
MouseEvent.CLICK = MouseEvent.touch ? "click" : "click";
MouseEvent.MOVE = MouseEvent.touch ? "touchmove" : "mousemove";

MouseEvent.ENTER = "mouseenter";
MouseEvent.LEAVE = "mouseleave";
MouseEvent.OVER = "mouseover";
MouseEvent.OUT = "mouseout";

MouseEvent.WHEEL = "mousewheel DOMMouseScroll MozMousePixelScroll";
MouseEvent.SCROLL = "scroll";
