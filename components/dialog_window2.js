import { makeElement, appendAnimStyles, Component, setPermStyles, appendMultiple, roundToTwo } from './utils.js';
import { SquareButton, CanvasX } from './buttons.js';

export class DialogWindow2 extends Component {
	constructor({globals=null, clickXY=null, parent_cont=null, nullify_this_in_parent_cb=null, header_height=null, header_bg=null, body_bg=null, width=null, adjust_scroll_cont_height_cb=null, reset_scroll_cb=null}={}) {
		super(globals);

		this.nullify_this_in_parent_cb = nullify_this_in_parent_cb;
		// this.header_height = this.globals['global_styles']['input_height'] + (this.globals['global_styles']['inner_panel_margins'] * 2) - 2; 
		this.parent_cont = parent_cont;
		this.header_height = header_height; 
		// console.log('header height',this.header_height);

		this.adjust_scroll_cont_height_cb = adjust_scroll_cont_height_cb;
		this.reset_scroll_cb = reset_scroll_cb;

		this.currently_resizing = false;

		this.limit = 15;

		this.resize_objects = new Set();

		this.min_width = 500;
		this.min_height = this.header_height + 10; ////////////////////////////////////////////////////////////////
		this.max_height = 500;

		this.left_limit_hit = false;
		this.width = width;

		this.clickXY = clickXY;
		this.window_width = window.outerWidth;
		this.window_height = window.outerHeight;

		this.top = this.clickXY.pos.y - (this.header_height / 2) - this.globals['global_styles']['title_bar_height'];
		this.left = this.clickXY.pos.x - (this.header_height * 2);
		
		this.cont = makeElement({
			type:'div',
			styles:[
				['position', 'absolute'],
				['display', 'flex'],
				['overflow', 'hidden'],
				['zIndex', '1'],
				['flexDirection', 'column'],
				['top', `${this.top}px`],
				['left', `${this.left}px`],
				['width', `${this.width}px`],
				// ['height', '100px'],
				// ['background', 'blue'],
				['boxShadow', this.globals['global_styles']['dialog_shadow']],
				['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`]
			]
		});

		this.cont_relative = makeElement({
			type:'div',
			styles:[
				['position', 'relative'],
				['zIndex', '2'],
				['display', 'flex'],
				['flexDirection', 'column'],
				['height', '100%'],
				['width', '100%']
				// ['background', 'orange']
			]
		});
		this.cont.appendChild(this.cont_relative);

		///////////////////////////// resizers and content

		this.resizers_content_cont = makeElement({
			type:'div',
			styles:[
				['width', '100%'],
				['position', 'relative'],
				['zIndex', '0'],
				['flexGrow', '1'],
				['display', 'flex'],
				['flexDirection', 'column']
				// ['background', 'lightgray']
			]
		});
		this.cont_relative.appendChild(this.resizers_content_cont);

		// top row resizers

		this.top_center = new CornerDrag({
			adjust_scroll_cont_height_cb:this.adjust_scroll_cont_height_cb,
			reset_scroll_cb:this.reset_scroll_cb,
			globals:globals, 
			parent_cont:this.resizers_content_cont, 
			parent_object:this,
			background:this.globals['global_styles']['body_bg_color_darker2'],
			height:'2px',
			width:'100%',
			tauri_cursor:'nResize',
			js_cursor:'n-resize',
			type:'n'
		});
		this.top_center.cont.style.zIndex = '4';

		// top left corner
		this.top_left = new CornerDrag({
			adjust_scroll_cont_height_cb:this.adjust_scroll_cont_height_cb,
			reset_scroll_cb:this.reset_scroll_cb,
			globals:globals, 
			parent_cont:this.top_center.cont, 
			parent_object:this,
			background:this.globals['global_styles']['body_bg_color_darker2'],
			height:'10px',
			width:'10px',
			tauri_cursor:'nwResize',
			js_cursor:'nw-resize',
			type:'nw'
		});
		this.top_left.cont.style.position = 'absolute';
		this.top_left.cont.style.zIndex = '5';
		this.top_left.cont.style.clipPath = 'polygon(0 0, 100% 0, 100% 20%, 40% 20%, 20% 40%, 20% 100%, 0 100%)';

		// top right corner
		this.top_right = new CornerDrag({
			adjust_scroll_cont_height_cb:this.adjust_scroll_cont_height_cb,
			reset_scroll_cb:this.reset_scroll_cb,
			globals:globals, 
			parent_cont:this.top_center.cont, 
			parent_object:this,
			background:this.globals['global_styles']['body_bg_color_darker2'],
			height:'10px',
			width:'10px',
			tauri_cursor:'neResize',
			js_cursor:'ne-resize',
			type:'ne'
		});
		this.top_right.cont.style.position = 'absolute';
		this.top_right.cont.style.zIndex = '5';
		this.top_right.cont.style.top = '0';
		this.top_right.cont.style.right = '0';
		this.top_right.cont.style.clipPath = 'polygon(100% 100%, 80% 100%, 80% 40%, 60% 20%, 0 20%, 0 0, 100% 0)';

		// content of dialog

		this.content = makeElement({
			type:'div',
			styles:[
				['position', 'absolute'],
				['top', '0'],
				['left', '0'],
				['width', '100%'],
				['height', '100%'],
				['zIndex', '1'],
				['display', 'flex'],
				['flexDirection', 'column']
			]
		});
		this.resizers_content_cont.appendChild(this.content);

		// header

		this.header = makeElement({
			type:'div',
			styles:[
				['width', '100%'],
				['minHeight', `${this.header_height}px`],
				['background', header_bg],
				['display', 'flex'],
				['justifyContent', 'flex-end'],
				['alignItems', 'center'],
				['paddingRight', '6px'],
			]
		});
		this.content.appendChild(this.header);

		// body

		this.body = makeElement({
			type:'div',
			styles:[
				['width', '100%'],
				['flexGrow', '1'],
				['background', body_bg],
				['display', 'flex']
				// ['justifyContent', 'center'],
				// ['alignItems', 'center']
			]
		});
		this.content.appendChild(this.body);


		this.makeDragable(this.header);

		// left side resizer

		this.middle_left = new CornerDrag({
			globals:globals, 
			parent_cont:this.resizers_content_cont, 
			parent_object:this,
			background:this.globals['global_styles']['body_bg_color_darker2'],
			height:'100%',
			width:'2px',
			tauri_cursor:'wResize',
			js_cursor:'w-resize',
			type:'w'
		});
		this.middle_left.cont.position = 'absolute';
		this.middle_left.cont.style.zIndex = '2';
		this.middle_left.cont.style.top = '0';
		this.middle_left.cont.style.left = '0';

		// right side resizer

		this.middle_right = new CornerDrag({
			globals:globals, 
			parent_cont:this.resizers_content_cont, 
			// zIndex:'6',
			parent_object:this,
			background:this.globals['global_styles']['body_bg_color_darker2'],
			height:'100%',
			width:'2px',
			tauri_cursor:'eResize',
			js_cursor:'e-resize',
			type:'e'
		});
		this.middle_right.cont.style.position = 'absolute';
		this.middle_right.cont.style.zIndex = '2';
		this.middle_right.cont.style.top = '0';
		this.middle_right.cont.style.right = '0';

		// center bottom corner

		this.bot_center = new CornerDrag({
			adjust_scroll_cont_height_cb:this.adjust_scroll_cont_height_cb,
			reset_scroll_cb:this.reset_scroll_cb,
			globals:globals, 
			parent_cont:this.resizers_content_cont, 
			parent_object:this,
			background:this.globals['global_styles']['body_bg_color_darker2'],
			z_index:'2',
			height:'2px',
			width:'100%',
			tauri_cursor:'sResize',
			js_cursor:'s-resize',
			type:'s'
		});
		this.bot_center.cont.style.position = 'absolute';
		this.bot_center.cont.style.bottom = '0';
		this.bot_center.cont.style.left = '0';

		// top left corner

		this.bot_left = new CornerDrag({
			adjust_scroll_cont_height_cb:this.adjust_scroll_cont_height_cb,
			reset_scroll_cb:this.reset_scroll_cb,
			globals:globals, 
			parent_cont:this.bot_center.cont, 
			parent_object:this,
			background:this.globals['global_styles']['body_bg_color_darker2'],
			height:'10px',
			width:'10px',
			tauri_cursor:'swResize',
			js_cursor:'sw-resize',
			type:'sw'
		});
		this.bot_left.cont.style.position = 'absolute';
		this.bot_left.cont.style.bottom = '0';
		this.bot_left.cont.style.zIndex = '6';
		this.bot_left.cont.style.left = '0';
		this.bot_left.cont.style.clipPath = 'polygon(0 0, 20% 0, 20% 60%, 40% 80%, 100% 80%, 100% 100%, 0 100%)';

		// bot right corner

		this.bot_right = new CornerDrag({
			adjust_scroll_cont_height_cb:this.adjust_scroll_cont_height_cb,
			reset_scroll_cb:this.reset_scroll_cb,
			globals:globals, 
			parent_cont:this.bot_center.cont, 
			parent_object:this,
			background:this.globals['global_styles']['body_bg_color_darker2'],
			height:'10px',
			width:'10px',
			tauri_cursor:'seResize',
			js_cursor:'se-resize',
			type:'se'
		});
		this.bot_right.cont.style.position = 'absolute';
		this.bot_right.cont.style.bottom = '0';
		this.bot_right.cont.style.zIndex = '6';
		this.bot_right.cont.style.right = '0';
		this.bot_right.cont.style.clipPath = 'polygon(0 80%, 60% 80%, 80% 60%, 80% 0, 100% 0, 100% 100%, 0 100%)';


		////////////////// content body, header, close button
		// this.makeDragable(this.header);
		this.image = null;

		this.image = new CanvasX({
			globals:this.globals,
			container:this.text_area, 
			height:this.globals['global_styles']['input_height'], 
			width:this.globals['global_styles']['input_height'], 
			lineWidth:3.25, 
			padding:5,
			normal_col:this.globals['global_styles']['gray_btn_darkest'],
			hover_col:this.globals['global_styles']['gray_btn_darkest2']
		});
		//(from:nameofuser) until:2019-01-31 since:2018-01-31

		this.close_window = new SquareButton({		
			globals:this.globals, 
			image:this.image,
			hover_col:this.globals['global_styles']['gray_btn_darker'],
			normal_col:this.globals['global_styles']['gray_btn_normal'],
			width:`${this.globals['global_styles']['input_height']}px`, 
			height:`${this.globals['global_styles']['input_height']}px`, 
			btn_type:'click', 
			border_radius:'3px', 
			click_callback:this.removeDialog
		});
		// this.close_window.cont.style.margin = '2px 3px 0 0';
		this.close_window.setStyles([['margin', '2px 3px 0 0']]);
		this.header.appendChild(this.close_window.cont);

	}


	setContHeight = () => {

		this.resetHeaderAndBodyBoundingRects();

		// num cards + num below margins of them + header
		// console.log('header', this.header_height, (this.url_height + this.url_bot_margins));
		// this.min_height = ((this.url_height * this.url_arr.length) + this.url_bot_margins) + this.header_height + (this.url_bot_margins * 3);
		this.min_height = this.body_size.height + this.header_size.height;
		// console.log('setContHeight', this.min_height);
		this.cont.style.height = `${this.min_height}px`;
	}

	showDialog = () => {
		this.globals['global_screen_resize'].addToUpdater(this);
		// this.globals['pages_cont'].appendChild(this.cont);		
		this.parent_cont.appendChild(this.cont);	
		// 	// this.url_arr.forEach(item => {
		// 	// 	item.image.ctx.stroke();
		// 	// 	item.image.setAsNormal();
		// 	// });	
	
	}

	removeDialog = () => {
		this.globals['global_screen_resize'].removeFromUpdater(this);
		this.nullify_this_in_parent_cb();
		// this.globals['pages_cont'].removeChild(this.cont);
		this.parent_cont.removeChild(this.cont);
	}

	resetBoundingRects = () => {
		this.cont_size = this.cont.getBoundingClientRect();
	}

	resetHeaderAndBodyBoundingRects = () => {
		this.header_size = this.header.getBoundingClientRect();
		this.body_size = this.body.getBoundingClientRect();
	}



	startDragEvent = (event) => {
		this.resetBoundingRects();

		this.throttle = Date.now();

		// console.log('bounding:::', this.body_size);
		this.first_click_top_offset = event.pos.y - this.cont_size.top;
		this.first_click_left_offset = event.pos.x - this.cont_size.left;

		this.prev_top = null;
		this.prev_left = null;

		// this.globals['anim_loop'].startTick(this.dragOnceInAnimLoop);

	}

	moveDragEvent = (event) => {

		// let new_throttle = Date.now();

		// console.log('throttle:::', new_throttle - this.throttle);

		// if (new_throttle - this.throttle >= 10) {
			// this.throttle = new_throttle;

			this.dragOnce(event);

		// }
	}

	dragOnceInAnimLoop = (delta) => {
		this.cont.style.top = `${this.top}px`;
		this.cont.style.left = `${this.left}px`;
	}

	dragOnce = (event) => {
		// window.requestAnimationFrame(() => {
			this.resetBoundingRects();

			let new_top = event.pos.y - this.globals['global_styles']['title_bar_height'] - this.first_click_top_offset;
			let new_left = event.pos.x - this.first_click_left_offset;

			if (this.cont_size.right < this.limit && this.prev_left >= new_left && this.prev_left !== null) {
				// left limit
				new_left = this.prev_left;
			}
			else if (this.cont_size.left > window.outerWidth - this.limit && this.prev_left <= new_left && this.prev_left !== null) {
				// right limit
				new_left = this.prev_left;
			}
			
			if (this.cont_size.top > window.outerHeight - this.limit && this.prev_top <= new_top && this.prev_top !== null) {
				// bottom limit
				new_top = this.prev_top;
			}
			else if (this.cont_size.top < this.globals['global_styles']['title_bar_height'] - this.header_height + this.limit && this.prev_top > new_top && this.prev_top !== null) {
				new_top = this.prev_top;
			}

			this.prev_top = new_top;
			this.prev_left = new_left;

			this.top = new_top;
			this.left = new_left;

			///////////////// putting into anim loop function 
			this.cont.style.top = `${this.top}px`;
			this.cont.style.left = `${this.left}px`;
		// });
	}

	stopDragEvent = (event) => {
		// console.log('default fn, stop drag', event);
		// this.dragOnce(event);
		// this.globals['anim_loop'].stopTick(this.dragOnceInAnimLoop);
	}

	clearHovers = (other_obj) => {
		this.resize_objects.forEach(obj => {
			if (other_obj !== obj) {
				obj.cursorToNull();
			}
		});
	}

	resetHovers = () => {
		this.resize_objects.forEach(obj => {
			obj.cursorToHover();
		});
	}

	screenResizeUpdate = () => {
		this.resetBoundingRects();

		let new_window_width = window.outerWidth;
		let new_window_height = window.outerHeight;

		let window_offset_width = (new_window_width - this.window_width) / 2;
		let window_offset_height = (new_window_height - this.window_height) / 2;

		this.window_height = new_window_height;
		this.window_width = new_window_width;

		this.top = window_offset_height + this.top;
		this.left = window_offset_width + this.left;

		if (this.top < -this.limit) {
			// bring it down
			this.top = -this.header_height + this.limit;
		}
		else if (this.top > window.outerHeight - this.globals['global_styles']['title_bar_height'] - this.limit) {
			// bring it up
			this.top = window.outerHeight - this.globals['global_styles']['title_bar_height'] - this.limit;
		}

		if (this.left < -this.cont_size.width + this.limit) {
			this.left = -this.cont_size.width + this.limit;
		}
		else if (this.left > window.outerWidth - this.limit) {
			this.left = window.outerWidth - this.limit;
		}

		this.cont.style.top = `${this.top}px`;
		this.cont.style.left = `${this.left}px`;

		// console.log('dialog screen update', window.outerHeight, window.innerHeight, window.innerWidth, window.outerWidth);
	}
}


export class CornerDrag extends Component {
	constructor({
		globals=null, 
		parent_cont=null, 
		parent_object=null, 
		background=null,
		height=null,
		width=null,
		top=null, 
		bottom=null, 
		left=null, 
		right=null, 
		tauri_cursor=null, 
		js_cursor=null, 
		z_index=null,
		type=null,
		adjust_scroll_cont_height_cb=null,
		reset_scroll_cb=null
	}={}) {
		super(globals);

		this.tauri_cursor = tauri_cursor;
		this.js_cursor = js_cursor;

		this.adjust_scroll_cont_height_cb = adjust_scroll_cont_height_cb;
		this.reset_scroll_cb = reset_scroll_cb;

		this.type = type;

		this.parent_object = parent_object;
		this.parent_cont = parent_cont;

		this.cont = makeElement({
			type:'div',
			styles:[
				['zIndex', `${z_index}`],
				['background', background],
				['cursor', js_cursor],
				['width', width],
				['height', height]
			]
		});
		// this.cont.setAttribute('_hovertype', this.globals['id_manager'].createId());

		this.parent_cont.appendChild(this.cont);
		this.parent_object.resize_objects.add(this);
		this.makeDragable(this.cont);

	}

	cursorToNull = () => {
		this.cont.style.cursor = null;
	}

	cursorToHover = () => {
		this.cont.style.cursor = this.js_cursor;
	}

	startDragEvent = (event) => {
		this.globals['other_is_dragging'] = this;
		this.parent_object.clearHovers(this);
		document.body.style.cursor = this.js_cursor;
		this.resetBoundingRects();

		let x = event.pos.x;
		let y = event.pos.y;

		this.first_click = {
			x:x,
			y:y
		};
	
	}

	moveDragEvent = (event) => {

		let x_diff = event.pos.x - this.first_click.x;
		let y_diff = event.pos.y - this.first_click.y;

		// console.log(y_diff);

		if (this.type === 's') {
			this.setS(y_diff);
		}
		else if (this.type === 'e') {
			this.setE(x_diff);
		}
		else if (this.type === 'se') {
			this.setS(y_diff);
			this.setE(x_diff);
		}
		else if (this.type === 'n') {
			this.setN(y_diff);
		}
		else if (this.type === 'w') {
			this.setW(x_diff);
		}
		else if (this.type === 'ne') {
			this.setN(y_diff);
			this.setE(x_diff);
		}
		else if (this.type === 'nw') {
			this.setN(y_diff);
			this.setW(x_diff);
		}
		else if (this.type === 'sw') {
			this.setW(x_diff);
			this.setS(y_diff);
		}



		// console.log('diff', x_diff, y_diff, window.outerHeight, this.cont_size.height);
		// console.log(new_bot, this.parent_object.cont.style.height);
		// console.log('default fn, move drag', event);;
	}

	setS = (y_diff) => {
		// console.log('aaaa');
		let new_height = this.cont_size.height + y_diff;
		if (new_height >= this.parent_object.min_height) {
			if (this.adjust_scroll_cont_height_cb) {
				this.adjust_scroll_cont_height_cb(new_height);
				this.reset_scroll_cb();
			}
			this.parent_object.cont.style.height = `${new_height}px`;
		}
	}

	setE = (x_diff) => {
		// console.log('bbbbbb');
		let new_width = this.cont_size.width + x_diff;
		if (new_width >= this.parent_object.min_width) {
			this.parent_object.cont.style.width = `${new_width}px`;
		}
	}

	setN = (y_diff) => {
		// console.log('cccccc');
		let new_height = this.cont_size.height - y_diff;

		if (new_height >= this.parent_object.min_height) {
			if (this.adjust_scroll_cont_height_cb) {
				this.adjust_scroll_cont_height_cb(new_height);
				this.reset_scroll_cb();
			}
			let new_top = this.cont_size.top - this.globals['global_styles']['title_bar_height'] + y_diff;
			this.parent_object.cont.style.top = `${new_top}px`;
			this.parent_object.cont.style.height = `${new_height}px`;
		}
	}

	setW = (x_diff) => {
		// console.log('dddddd');
		let new_width = this.cont_size.width - x_diff;

		if (new_width >= this.parent_object.min_width) {
			let new_right = this.cont_size.left + x_diff;

			this.parent_object.cont.style.left = `${new_right}px`;
			this.parent_object.cont.style.width = `${new_width}px`;
		}
	}

	stopDragEvent = (event) => {
		this.globals['other_is_dragging'] = null;
		this.parent_object.resetHovers();
		document.body.style.cursor = null;
		// console.log('default fn, stop drag', event);
	}

	resetBoundingRects = () => {
		this.cont_size = this.parent_object.cont.getBoundingClientRect();

	}
}