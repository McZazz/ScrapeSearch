import { makeElement, setPermStyles, appendAnimStyles } from "./utils.js";
import { SquareButton, CanvasMinus, CanvasPlus } from './buttons.js';

export class TextInput {
	constructor({globals=null}={}) {
		this.globals = globals;
		this.global_styles = this.globals['global_styles'];
		this.focus = false;

		this.cont = makeElement({
			type:'input',
			props:[
				['classList', 'inputs']
			],
			styles:[
				['overflow', 'hidden'],
				['fontSize', '15px'],
				['paddingLeft', '5px'],
				['height', `${this.globals['global_styles']['input_height']}px`],
				['background', this.globals['global_styles']['text_area_col']],
				['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`],
			],
		});

	}

	setInputStyles = (style_arr) => {
		style_arr.forEach(style => {
			this.cont.style[style[0]] = style[1];
		});
	}

	setInputAttrs = (attr_arr) => {
		attr_arr.forEach(attr => {
			this.cont[attr[0]] = attr[1];
		});
	}

	getText = () => {
		let text = this.cont.value;

		if (text === '') {
			return null;
		}
		
		return text;
	}
}

export class UrlInputAndBtn2 {
	constructor({globals=null, parent_obj=null}={}) {
		this.globals = globals;
		this.parent_obj = parent_obj;
		this.global_styles = this.globals['global_styles'];

		this.active_bg = this.globals['global_styles']['text_area_col']
		this.inactive_bg = this.globals.global_styles.panel_dark_bg

		this.cont = makeElement({
			type:'div',
			styles:[
				['display', 'flex'],
				['flexDirection', 'row']
			]
		});

		// input
		this.input = new TextInput({globals:globals});
		this.input.setInputStyles([
			['background', this.active_bg],
			['flexGrow', '1'],
			['background', this.active_bg],
		]);
		this.input.setInputAttrs([
			['tabIndex', '0']
		]);

		// this.input.cont.style.background = this.active_bg;
		// this.input.cont.style.flexGrow = '1';
		// this.input.cont.tabIndex = '0';

		this.cont.appendChild(this.input.cont);
		this.makeMinusBtn();
	}

	setContStyles = (styles_arr) => {
		styles_arr.forEach(style => {
			this.cont.style[style[0]] = style[1];
		});
	}

	makeMinusBtn = () => {
		// minus button
		this.image = new CanvasMinus({
			globals:this.globals,
			height:this.globals['global_styles']['input_height'], 
			width:this.globals['global_styles']['input_height'], 
			lineWidth:3.25, 
			padding:5,
			normal_col:this.globals['global_styles']['gray_btn_darkest'],
			hover_col:this.globals['global_styles']['gray_btn_darkest2']
		});
		this.btn = new SquareButton({		
			globals:this.globals, 
			image:this.image,
			hover_col:this.globals['global_styles']['gray_btn_darker'],
			normal_col:this.globals['global_styles']['gray_btn_normal'],
			width:`${this.globals['global_styles']['input_height']}px`, 
			height:`${this.globals['global_styles']['input_height']}px`, 
			click_callback:this.deleteRow
		});
		this.btn.setStyles([['marginLeft', '7px']]);

		this.cont.appendChild(this.btn.cont);
		this.btn.strokeImage();
	}

	deleteRow = () => {
		// console.log('deleting row');
		this.parent_obj.deleteRow(this);
	}

}