import { makeElement, appendAnimStyles, Component, setPermStyles, appendMultiple, roundToTwo } from './utils.js';

export class SquareButton extends Component {
	constructor({
		globals=null, 
		width=null, 
		height=null, 
		cont_obj=null/*class object*/,
		image=null, 
		click_callback=null,
		hover_col=null,
		normal_col=null,
		class_list=null
	}={}) {

		super(globals);

		this.click_callback = click_callback;

		this.hover_col = hover_col;
		this.normal_col = normal_col;
		this.width = width;
		this.height = height;
		this.image = image;
		this.border_radius = 3;

		this.state = false;

		this.cont = makeElement({type:'div', styles:[
			['height', this.height],
			['width', this.width],
			['background', this.normal_col],
			['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`]     
		], props:[
			['classList', this.class_list]
		]});
		this.cont.addEventListener('click', (event) => {
			this.click_callback(event); 
		});


		if (this.image) {
			this.cont.appendChild(this.image.cont);

			this.cont.addEventListener('mouseenter', () => {
				this.image.setAsHover();
				this.cont.style.background = this.hover_col;
			});
			this.cont.addEventListener('hover', () => {
				this.image.setAsHover();
				this.cont.style.background = this.hover_col;
			});
			this.cont.addEventListener('mouseleave', () => {
				this.image.setAsNormal();
				this.cont.style.background = this.normal_col;
			});
		} else {
			this.class_list = class_list;
			this.cont.classList = this.class_list;
		}

	}

	setText = (new_text) => {
		this.cont.innerText = new_text;
	}

	setStyles = (style_arr) => {
		style_arr.forEach(style => {
			this.cont.style[style[0]] = style[1];
		});
	}

	strokeImage = () => {
		if (this.image) {
			this.cont.appendChild(this.image.cont);
			this.image.ctx.stroke();
		}
	}

}

export class HoverChanging {
	constructor({normal_col=null, hover_col=null, is_canvas=false}={}) {
		this.hover_col = hover_col;
		this.normal_col = normal_col;
		this.is_canvas = is_canvas;
		this.color_changes = [];
	}

	addToColorChanges = (element) => {
		this.color_changes.push(element);
	}

	setAsHover = () => {
		this.color_changes.forEach(item => {
			if (!this.is_canvas) {
				item.style.background = this.hover_col;
			} else {
				item.strokeStyle = this.hover_col;
				item.stroke();
			}
		});
	}

	setAsNormal = () => {
		this.color_changes.forEach(item => {
			if (!this.is_canvas) {
				item.style.background = this.normal_col;
			} else {
				item.strokeStyle = this.normal_col;
				item.stroke();
			}
		});
	}
}

export class TextButton extends SquareButton {
	constructor({		
			globals=null, 
			class_list=null,
			width=null, 
			text=null,
			click_callback=null
		}={}) {
		super({		
			globals:globals, 
			class_list:class_list,
			width:width, 
			height:`${globals['global_styles']['input_height']}px`, 
			btn_type:'click', 
			border_radius:`${globals['global_styles']['scroll_bar_radius']}px`, 
			click_callback:click_callback
		});
		this.setText(text);
		this.setStyles([
			['fontFamily', 'Arial'],
			['userSelect', 'none'],
			['fontSize', '14px'],
			['display', 'flex'],
			['justifyContent', 'center'],
			['alignItems', 'center'],
			['minWidth', width]
		]);
	}
}

export class CanvasX extends HoverChanging {
	constructor({ 
								globals=null,
								width=null/*num*/, 
								height=null/*num*/, 
								lineWidth=null/*num*/, 
								normal_col=null/*string*/,
								hover_col=null/*string*/,
								padding=null/*num*/
							}={}) {

		super({normal_col:normal_col, hover_col:hover_col, is_canvas:true});

		this.globals = globals;

		this.cont = document.createElement('canvas');
		this.cont.height = height;
		this.cont.width = width;

		this.ctx = this.cont.getContext('2d');

		this.ctx.moveTo(0+padding,0+padding);
		this.ctx.lineTo(width-padding, height-padding);
		this.ctx.lineWidth = lineWidth;
		this.ctx.strokeStyle = normal_col;
		this.ctx.lineCap = 'square';

		this.ctx.moveTo(width-padding,padding);
		this.ctx.lineTo(0+padding, height-padding);

		this.ctx.stroke();

		this.color_changes = [this.ctx];
	}

}


export class CanvasMinus extends HoverChanging {
	constructor({ 
								globals=null,
								width=null/*num*/, 
								height=null/*num*/, 
								lineWidth=null/*num*/, 
								normal_col=null/*string*/,
								hover_col=null/*string*/,
								padding=null/*num*/
							}={}) {

		super({normal_col:normal_col, hover_col:hover_col, is_canvas:true});

		this.globals = globals;

		this.cont = document.createElement('canvas');
		this.cont.height = height;
		this.cont.width = width;

		this.ctx = this.cont.getContext('2d');

		this.ctx.moveTo(0+padding, width/2);
		this.ctx.lineTo(width-padding, width/2);
		this.ctx.lineWidth = lineWidth;
		this.ctx.strokeStyle = normal_col;
		this.ctx.lineCap = 'square';

		this.color_changes = [this.ctx];

		this.ctx.stroke();

	}

}


export class CanvasPlus extends HoverChanging {
	constructor({ 
								globals=null,
								width=null/*num*/, 
								height=null/*num*/, 
								lineWidth=null/*num*/, 
								normal_col=null/*string*/,
								hover_col=null/*string*/,
								padding=null/*num*/
							}={}) {

		super({normal_col:normal_col, hover_col:hover_col, is_canvas:true});

		this.globals = globals;


		this.cont = document.createElement('canvas');
		this.cont.height = height;
		this.cont.width = width;

		this.ctx = this.cont.getContext('2d');

		this.ctx.moveTo(0+padding, width/2);
		this.ctx.lineTo(width-padding, width/2);
		this.ctx.moveTo(width/2, 0+padding);
		this.ctx.lineTo(width/2, height-padding);
		this.ctx.lineWidth = lineWidth;
		this.ctx.strokeStyle = normal_col;
		this.ctx.lineCap = 'square';

		this.color_changes = [this.ctx];

		this.ctx.stroke();

	}

}


export class PlusSign extends HoverChanging {
	constructor({
		globals=null,
		width=null, 
		border_radius=null, 
		center_on_parent=null, 
		hover_col=null, 
		normal_col=null
	}={}) {

		super({normal_col:normal_col, hover_col:hover_col});

		this.globals = globals;

		this.cont = makeElement({
			type:'div', 
			styles:[
				['height', '100%'],
				['minWidth', '100%'],
				['position', 'relative']
			]
		});

		this.horiz_cont = makeElement({
			type:'div',
			styles:[
				['position', 'absolute'],
				['height', '100%'],
				['width', '100%'],
				['display', 'flex'],
				['justifyContent', 'center'],
				['alignItems', 'center']
			]
		});
		this.cont.appendChild(this.horiz_cont);

		this.horizontal = makeElement({
			type:'div', 
			styles:[
				['height', width],
				['width', '80%'],	
				['background', this.normal_col],
				['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`]
			]
		});
		this.horiz_cont.appendChild(this.horizontal);

		this.vertical_cont = makeElement({
			type:'div',
			styles:[
				['height', '100%'],
				['width', '100%'],
				['position', 'absolute'],
				['display', 'flex'],
				['justifyContent', 'center'],
				['alignItems', 'center']
			]
		});
		this.cont.appendChild(this.vertical_cont);

		this.vertical = makeElement({
			type:'div', 
			styles:[
				['height', '80%'],
				['width', width],	
				['background', this.normal_col],
				['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`]
			]
		});
		this.vertical_cont.appendChild(this.vertical)

		this.addToColorChanges(this.vertical);
		this.addToColorChanges(this.horizontal);

	}
}

// export class PlusSign2 extends HoverChanging {
// 	constructor({hover_col:hover_col, normal_col:normal_col}={}) {

// 		super({hover_col:hover_col, normal_col:normal_col});

// 		let cont_styles = [
// 			['height', '100%'],
// 			['width', '100%'],
// 			['clipPath', 'polygon(10% 41%, 41% 41%, 41% 10%, 59% 10%, 59% 41%, 90% 41%, 90% 57%, 59% 57%, 59% 90%, 41% 90%, 41% 57%, 10% 57%)'],
// 			['background', this.normal_col]
// 		];
// 		this.cont = makeElement({type:'div', styles:cont_styles});

// 		this.color_changes = [this.cont];
// 	}
// }


export class CheckMark extends HoverChanging {
	constructor({hover_col:hover_col, normal_col:normal_col}={}) {

		super({hover_col:hover_col, normal_col:normal_col});

		let cont_styles = [
			['height', '100%'],
			['width', '100%'],
			// ['clipPath', 'polygon(77% 13%, 91% 21%, 44% 91%, 4% 62%, 15% 49%, 41% 69%)'],
			['clipPath', 'polygon(17% 52%, 41% 67%, 69% 10%, 87% 19%, 49% 95%, 6% 69%)'],
			['background', this.normal_col]
		];
		this.cont = makeElement({type:'div', styles:cont_styles});

		this.color_changes = [this.cont];
	}

}
