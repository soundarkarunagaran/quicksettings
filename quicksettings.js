(function() {
	var QuickSettings = {
		_topZ: 1,

		_panel: null,
		_titleBar: null,
		_content: null,
		_startX: 0,
		_startY: 0,
		_hidden: false,
		_collapsed: false,
		_controls: null,
		_keyCode: -1,
		_draggable: true,
		_collapsible: true,
		_globalChangeHandler: null,

		create: function(x, y, title) {
			var obj = Object.create(this);
			obj._init(x, y, title);
			return obj;
		},

		_init: function(x, y, title) {
			this._bindHandlers();
			this._createPanel(x, y);
			this._createTitleBar(title || "QuickSettings");
			this._createContent();

			document.body.appendChild(this._panel);
		},

		_bindHandlers: function() {
			this._startDrag = this._startDrag.bind(this);
			this._drag = this._drag.bind(this);
			this._endDrag = this._endDrag.bind(this);
			this._doubleClickTitle = this._doubleClickTitle.bind(this);
			this._onKeyUp = this._onKeyUp.bind(this);
		},

		_createPanel: function(x, y) {
			this._panel = document.createElement("div");
			this._panel.className = "msettings_main";
			this._panel.style.zIndex = ++QuickSettings._topZ;
			this.setPosition(x || 0, y || 0);
			this._controls = {};
		},

		_createTitleBar: function(text) {
			this._titleBar = document.createElement("div");
			this._titleBar.textContent = text;
			this._titleBar.className = "msettings_title_bar";

			this._titleBar.addEventListener("mousedown", this._startDrag);
			this._titleBar.addEventListener("dblclick", this._doubleClickTitle);

			this._panel.appendChild(this._titleBar);
		},

		_createContent: function() {
			this._content = document.createElement("div");
			this._content.className = "msettings_content";
			this._panel.appendChild(this._content);
		},

		setPosition: function(x, y) {
			this._panel.style.left = x + "px";
			this._panel.style.top = Math.max(y, 0) + "px";
			return this;
		},

		setSize: function(w, h) {
			this._panel.style.width = w + "px";
			this._content.style.width = w + "px";
			this._content.style.height = (h - this._titleBar.offsetHeight) + "px";
			return this;
		},

		setWidth: function(w) {
			this._panel.style.width = w + "px";
			this._content.style.width = w + "px";
			return this;
		},

		setDraggable: function(draggable) {
			this._draggable = draggable;
			if(this._draggable || this._collapsible) {
				this._titleBar.style.cursor = "pointer";
			}
			else {
				this._titleBar.style.cursor = "default";
			}
			return this;
		},

		setCollapsible: function(collapsible) {
			this._collapsible = collapsible;
			if(this._draggable || this._collapsible) {
				this._titleBar.style.cursor = "pointer";
			}
			else {
				this._titleBar.style.cursor = "default";
			}
			return this;
		},

		_startDrag: function(event) {
			if(this._draggable) {
				this._panel.style.zIndex = ++QuickSettings._topZ;
				document.addEventListener("mousemove", this._drag);
				document.addEventListener("mouseup", this._endDrag);
				this._startX = event.clientX;
				this._startY = event.clientY;
			}
			event.preventDefault();
		},

		_drag: function(event) {
			var x = parseInt(this._panel.style.left),
				y = parseInt(this._panel.style.top),
				mouseX = event.clientX,
				mouseY = event.clientY;

			this.setPosition(x + mouseX - this._startX, y + mouseY - this._startY);
			this._startX = mouseX;
			this._startY = mouseY;
			event.preventDefault();
		},

		_endDrag: function(event) {
			document.removeEventListener("mousemove", this._drag);
			document.removeEventListener("mouseup", this._endDrag);
			event.preventDefault();
		},

		_doubleClickTitle: function() {
			if(this._collapsible) {
				this.toggleCollapsed();
			}
		},

		setGlobalChangeHandler: function(handler) {
			this._globalChangeHandler = handler;
			return this;
		},

		toggleCollapsed: function() {
			if(this._collapsed) {
				this.expand();
			}
			else {
				this.collapse();
			}
			return this;
		},

		collapse: function() {
			this._panel.removeChild(this._content);
			this._collapsed = true;
			return this;
		},

		expand: function() {
			this._panel.appendChild(this._content);
			this._collapsed = false;
			return this;
		},

		hide: function() {
			this._panel.style.visibility = "hidden";
			this._hidden = true;
			return this;
		},

		show: function() {
			this._panel.style.visibility = "visible";
			this._panel.style.zIndex = ++QuickSettings._topZ;
			this._hidden = false;
			return this;
		},

		_createContainer: function() {
			var container = document.createElement("div");
			container.className = "msettings_container";
			return container;
		},

		_createLabel: function(title) {
			var label = document.createElement("div");
			label.innerHTML = title;
			label.className = "msettings_label";
			return label;
		},

		setKey: function(char) {
			this._keyCode = char.toUpperCase().charCodeAt(0);
			document.body.addEventListener("keyup", this.onKeyUp);
			return this;
		},

		_onKeyUp: function(event) {
			if(event.keyCode === this._keyCode) {
				this.toggleVisibility();
			}
		},

		toggleVisibility: function() {
			if(this._hidden) {
				this.show();
			}
			else {
				this.hide();
			}
			return this;
		},

		bindRange: function(title, min, max, value, step, object) {
			this.addRange(title, min, max, value, step, function(value) {
				object[title] = value;
			});
			return this;
		},

		bindNumber: function(title, min, max, value, step, object) {
			this.addNumber(title, min, max, value, step, function(value) {
				object[title] = value;
			});
			return this;
		},

		addRange: function(title, min, max, value, step, callback) {
			this._addNumber("range", title, min, max, value, step, callback);
			return this;
		}, 

		addNumber: function(title, min, max, value, step, callback) {
			this._addNumber("number", title, min, max, value, step, callback);
			return this;
		}, 

		_isIE: function() {
			if(navigator.userAgent.indexOf("rv:11") != -1) {
				return true;
			}
			if(navigator.userAgent.indexOf("MSIE") != -1) {
				return true;
			}
			return false;
		},

		_addNumber: function(type, title, min, max, value, step, callback) {
			var container = this._createContainer();

			var input = document.createElement("input");
			input.type = type;
			input.id = title;
			input.min = min || 0;
			input.max = max || 100;
			input.step = step || 1;
			input.value = value || 0;
			if(type === "range") {
				input.className = "msettings_range";
			}
			else {
				input.className = "msettings_text_input";
			}

			var label = this._createLabel("<b>" + title + ":</b> " + input.value);

			container.appendChild(label);
			container.appendChild(input);
			this._content.appendChild(container);
			this._controls[title] = {
				container: container,
				control: input,
				label: label,
				callback: callback
			};

			var eventName = "input";
			if(type === "range" && this._isIE()) {
				eventName = "change";
			}
			var gch = this._globalChangeHandler;
			input.addEventListener(eventName, function() {
				label.innerHTML = "<b>" + title + ":</b> " + input.value;
				if(callback) {
					callback(parseFloat(input.value));
				}
				if(gch) {
					gch();
				}
			});
		}, 

		getRangeValue: function(title) {
			return parseFloat(this._controls[title].control.value);
		},

		getNumberValue: function(title) {
			return parseFloat(this._controls[title].control.value);
		},

		setRangeValue: function(title, value) {
			return this.setNumberValue(title, value);
		},

		setNumberValue: function(title, value) {
			var control = this._controls[title];
			control.control.value = value;
			control.label.innerHTML = "<b>" + title + ":</b> " + control.control.value;
			if(control.callback) {
				control.callback(parseFloat(control.control.value));
			}
			if(this._globalChangeHandler) {
				this._globalChangeHandler();
			}
			return this;
		},

		setRangeParameters: function(title, min, max, step) {
			return this.setNumberParameters(title, min, max, step);
		},

		setNumberParameters: function(title, min, max, step) {
			var control = this._controls[title];
			control.control.min = min;
			control.control.max = max;
			control.control.step = step;
			return this;
		},

		bindBoolean: function(title, value, object) {
			this.addBoolean(title, value, function(value) {
				object[title] = value;
			});
			return this;
		},

		addBoolean: function(title, value, callback) {
			var container = this._createContainer();

			var label = document.createElement("span");
			label.className = "msettings_checkbox_label";
			label.textContent = title;

			var checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			checkbox.id = title;
			checkbox.checked = value;
			checkbox.className = "msettings_checkbox";

			container.appendChild(checkbox);
			container.appendChild(label);
			this._content.appendChild(container);
			this._controls[title] = {
				container: container,
				control: checkbox,
				callback: callback
			};

			var gch = this._globalChangeHandler;
			checkbox.addEventListener("change", function() {
				if(callback) {
					callback(checkbox.checked);
				}
				if(gch) {
					gch();
				}
			});
			label.addEventListener("click", function() {
				if(checkbox.disabled) {
					return;
				}
				checkbox.checked = !checkbox.checked;
				if(callback) {
					callback(checkbox.checked);
				}
				if(gch) {
					gch();
				}
			});
			return this;
		},

		getBoolean: function(title) {
			return this._controls[title].control.checked;
		},

		setBoolean: function(title, value) {
			this._controls[title].control.checked = value;
			if(this._controls[title].callback) {
				this._controls[title].callback(value);
			}
			if(this._globalChangeHandler) {
				this._globalChangeHandler();
			}
			return this;
		},

		addButton: function(title, callback) {
			var container = this._createContainer();

			var button = document.createElement("input");
			button.type = "button";
			button.id = title;
			button.value = title;
			button.className = "msettings_button";

			container.appendChild(button);
			this._content.appendChild(container);
			this._controls[title] = {
				container: container,
				control: button
			}

			var gch = this._globalChangeHandler;
			button.addEventListener("click", function() {
				if(callback) {
					callback(button);
				}
				if(gch) {
					gch();
				}
			});
			return this;
		},

		bindColor: function(title, color, object) {
			this.addColor(title, color, function(value) {
				object[title] = value;
			});
			return this;
		},

		addColor: function(title, color, callback) {
			var container = this._createContainer();
			var label = this._createLabel("<b>" + title + ":</b> " + color);

			var colorInput = document.createElement("input");
			try {
				colorInput.type = "color";
			}
			catch(e) {
				colorInput.type = "text";
			}
			colorInput.id = title;
			colorInput.value = color || "#ff0000";
			colorInput.className = "msettings_color";

			container.appendChild(label);
			container.appendChild(colorInput);
			this._content.appendChild(container);
			this._controls[title] = {
				container: container,
				control: colorInput,
				label: label,
				callback: callback
			};

			var gch = this._globalChangeHandler;
			colorInput.addEventListener("input", function() {
				label.innerHTML = "<b>" + title + ":</b> " + colorInput.value;
				if(callback) {
					callback(colorInput.value);
				}
				if(gch) {
					gch();
				}
			});
			return this;
		},

		getColor: function(title) {
			return this._controls[title].control.value;
		},

		setColor: function(title, value) {
			var control = this._controls[title];
			control.control.value = value;
			control.label.innerHTML = "<b>" + title + ":</b> " + control.control.value;
			if(control.callback) {
				control.callback(control.control.value);
			}
			if(this._globalChangeHandler) {
				this._globalChangeHandler();
			}
			return this;
		},

		bindText: function(title, text, object) {
			this.addText(title, text, function(value) {
				object[title] = value;
			});
			return this;
		},

		addText: function(title, text, callback) {
			var container = this._createContainer();
			var label = this._createLabel("<b>" + title + "</b>");

			var textInput = document.createElement("input");
			textInput.type = "text";
			textInput.id = title;
			textInput.value = text || "";
			textInput.className = "msettings_text_input";

			container.appendChild(label);
			container.appendChild(textInput);
			this._content.appendChild(container);
			this._controls[title] = {
				container: container,
				control: textInput,
				label: label,
				callback: callback
			}

			var gch = this._globalChangeHandler;
			textInput.addEventListener("input", function() {
				if(callback) {
					callback(textInput.value);
				}
				if(gch) {
					gch();
				}
			});
			return this;
		}, 

		addPassword: function(title, text, callback) {
			var container = this._createContainer();
			var label = this._createLabel("<b>" + title + "</b>");

			var textInput = document.createElement("input");
			textInput.type = "password";
			textInput.id = title;
			textInput.value = text || "";
			textInput.className = "msettings_text_input";

			container.appendChild(label);
			container.appendChild(textInput);
			this._content.appendChild(container);
			this._controls[title] = {
				container: container,
				control: textInput,
				label: label,
				callback: callback
			}

			var gch = this._globalChangeHandler;
			textInput.addEventListener("input", function() {
				if(callback) {
					callback(textInput.value);
				}
				if(gch) {
					gch();
				}
			});
			return this;
		}, 

		bindPassword: function(title, text, object) {
			this.addPassword(title, text, function(value) {
				object[title] = value;
			});
			return this;
		},



		addTextArea: function(title, text, callback) {
			var container = this._createContainer();
			var label = this._createLabel("<b>" + title + "</b>");

			var textInput = document.createElement("textarea");
			textInput.id = title;
			textInput.rows = 5;
			textInput.value = text || "";
			textInput.className = "msettings_textarea";

			container.appendChild(label);
			container.appendChild(textInput);
			this._content.appendChild(container);
			this._controls[title] = {
				container: container,
				control: textInput,
				label: label,
				callback: callback
			}

			var gch = this._globalChangeHandler;
			textInput.addEventListener("input", function() {
				if(callback) {
					callback(textInput.value);
				}
				if(gch) {
					gch();
				}
			});
			return this;
		}, 

		setTextAreaRows: function(title, rows) {
			this._controls[title].control.rows = rows;
			return this;
		},

		getText: function(title) {
			return this._controls[title].control.value;
		},

		setText: function(title, text) {
			var control = this._controls[title];
			control.control.value = text;
			if(control.callback) {
				control.callback(text);
			}
			if(this._globalChangeHandler) {
				this._globalChangeHandler();
			}
			return this;
		},

		addDate: function(title, date, callback) {
			if(this._isIE()) {
				console.log("returning....")
				return this.addText(title, date, callback);
			}
			var container = this._createContainer();
			var label = this._createLabel("<b>" + title + "</b>");

			var dateInput = document.createElement("input");
			dateInput.type = "date";
			dateInput.id = title;
			dateInput.value = date || "";
			dateInput.className = "msettings_text_input";

			container.appendChild(label);
			container.appendChild(dateInput);
			this._content.appendChild(container);
			this._controls[title] = {
				container: container,
				control: dateInput,
				label: label,
				callback: callback
			}

			var gch = this._globalChangeHandler;
			dateInput.addEventListener("input", function() {
				if(callback) {
					callback(dateInput.value);
				}
				if(gch) {
					gch();
				}
			});
			return this;
		},

		bindDate: function(title, date, object) {
			this.addDate(title, date, function(value) {
				object[title] = value;
			});
			return this;
		},



		addTime: function(title, time, callback) {
			if(this._isIE()) {
				return this.addText(title, time, callback);
			}

			var container = this._createContainer();
			var label = this._createLabel("<b>" + title + "</b>");

			var timeInput = document.createElement("input");
			timeInput.type = "time";
			timeInput.id = title;
			timeInput.value = time || "";
			timeInput.className = "msettings_text_input";

			container.appendChild(label);
			container.appendChild(timeInput);
			this._content.appendChild(container);
			this._controls[title] = {
				container: container,
				control: timeInput,
				label: label,
				callback: callback
			}

			var gch = this._globalChangeHandler;
			timeInput.addEventListener("input", function() {
				if(callback) {
					callback(timeInput.value);
				}
				if(gch) {
					gch();
				}
			});
			return this;
		},

		bindTime: function(title, time, object) {
			this.addTime(title, time, function(value) {
				object[title] = value;
			});
			return this;
		},



		addInfo: function(title, info) {
			var container = this._createContainer();
			container.innerHTML = info;
			this._controls[title] = {
				container: container
			};
			this._content.appendChild(container);
			return this;
		},

		bindDropDown: function(title, items, object) {
			this.addDropDown(title, items, function(value) {
				object[title] = value.value;
			});
			return this;
		},

		addDropDown: function(title, items, callback) {
			var container = this._createContainer();

			var label = this._createLabel("<b>" + title + "</b>");
			var select = document.createElement("select");
			for(var i = 0; i < items.length; i++) {
				var option = document.createElement("option");
				option.label = items[i];
				select.add(option);
			};
			var gch = this._globalChangeHandler;
			select.addEventListener("change", function() {
				var index = select.selectedIndex,
					options = select.options;

				if(callback) {
					callback({
						index: index,
						value: options[index].label
					});
				}
				if(gch) {
					gch();
				}
			});
			select.className = "msettings_select";

			container.appendChild(label);
			container.appendChild(select);
			this._content.appendChild(container);

			this._controls[title] = {
				container: container,
				control: select,
				label: label,
				callback: callback
			};
			return this;
		},

		getDropDownValue: function(title) {
			var control = this._controls[title],
				select = control.control,
				index = select.selectedIndex,
				options = select.options;
			return {
				index: index,
				value: options[index].label
			}
		},

		setDropDownIndex: function(title, index) {
			var control = this._controls[title],
				options = control.control.options;
			control.control.selectedIndex = index;
			if(control.callback) {
				control.callback({
					index: index,
					value: options[index].label
				});
			}
			if(this._globalChangeHandler) {
				this._globalChangeHandler();
			}
			return this;
		},

		getInfo: function(title) {
			return this._controls[title].container.innerHTML;
		},

		setInfo: function(title, info) {
			this._controls[title].container.innerHTML = info;
			return this;
		},

		addImage: function(title, imageURL) {
			var container = this._createContainer(),
				label = this._createLabel("<b>" + title + "</b>");
				img = document.createElement("img");
			img.className = "msettings_image";
			img.src = imageURL;

			container.appendChild(label);
			container.appendChild(img);
			this._content.appendChild(container);

			this._controls[title] = {
				container: container,
				control: img,
				label: label
			};
			return this;
		},

		setImageURL: function(title, imageURL) {
			this._controls[title].control.src = imageURL;
			return this;
		},

		addProgressBar: function(title, max, value, showNumbers) {
			var container = this._createContainer(),
				label = this._createLabel("");
				progress = document.createElement("progress");
			progress.className = "msettings_progress";
			progress.max = max;
			progress.value = value;
			if(showNumbers) {
				label.innerHTML = "<b>" + title + ":<b> " + value + " / " + max;
			}
			else {
				label.innerHTML = "<b>" + title + "<b>";
			}

			container.appendChild(label);
			container.appendChild(progress);
			this._content.appendChild(container);

			this._controls[title] = {
				container: container,
				control: progress,
				showNumbers: showNumbers,
				label: label
			};
			return this;
		},

		getProgress: function(title) {
			return this._controls[title].control.value;
		},

		setProgress: function(title, value) {
			var progress = this._controls[title].control;
			progress.value = value;
			if(this._controls[title].showNumbers) {
				this._controls[title].label.innerHTML = "<b>" + title + ":<b> " + progress.value + " / " + progress.max;
			}
			else {
				this._controls[title].label.innerHTML = "<b>" + title + "<b>";
			}
			return this;
		},

		addElement: function(title, element) {
			var container = this._createContainer(),
				label = this._createLabel("<b>" + title + "</b>");

			container.appendChild(label);
			container.appendChild(element);
			this._content.appendChild(container);

			this._controls[title] = {
				container: container,
				label: label
			};
			return this;
		},

		addHTML: function(title, html) {
			var div = document.createElement("div");
			div.innerHTML = html;
			this.addElement(title, div);
			return this;
		},

		removeControl: function(title) {
			if(this._controls[title]){
				var container = this._controls[title].container;
			}
			if(container && container.parentElement) {
				container.parentElement.removeChild(container);
			}
			this._controls[title] = null;
			return this;
		},

		enableControl: function(title) {
			if(this._controls[title].control) {
				this._controls[title].control.disabled = false;
			}
			return this;
		},

		disableControl: function(title) {
			if(this._controls[title].control) {
				this._controls[title].control.disabled = true;
			}
			return this;
		}
	};

	if (typeof define === "function" && define.amd) {
	    define(QuickSettings);
	} else {
	   window.QuickSettings = QuickSettings;
	}

}());
