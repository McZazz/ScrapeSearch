import { makeElement, Component } from './utils.js';
import { SquareButton, CheckMark } from './buttons.js';

export class TheInternet extends Component {
	constructor({globals=null, selected=null}) {
		super(globals);
		this.selected = selected;

		this.cont = makeElement({
			type:'div',
			styles:[
				['display', 'flex'],
				['alignItems', 'center'],
				['width', '100%'],
				['height', '100%'],
			]
		});

		this.title = makeElement({
			type:'div',
			styles:[
				['display', 'flex'],
				['alignItems', 'center'],
				['justifyContent', 'center'],
				['height', '100%'],
				['flexGrow', '1'],
				['fontFamily', 'Arial'],
				['paddingTop', '1px'],
				['userSelect', 'none'],
				['fontSize', '18px'],
				['color', this.globals['global_styles']['text_area_col2']],
			],
			props:[
				['innerText', 'The Internet']
			]
		});
		this.cont.appendChild(this.title);

		// selected btn
		this.check_selected = new CheckMark({
			hover_col:this.globals['global_styles']['blue_btn_darkest2'], 
			normal_col:this.globals['global_styles']['blue_btn_darkest']
		});

		this.select_btn = new SquareButton({		
			globals:this.globals, 
			image:this.check_selected,
			hover_col:this.globals['global_styles']['blue_btn_darker2'],
			normal_col:this.globals['global_styles']['blue_btn_normal'],
			width:`${this.globals['global_styles']['input_height']}px`, 
			height:`${this.globals['global_styles']['input_height']}px`, 
			btn_type:'click', 
			border_radius:'3px', 
			click_callback:this.deselect
		});

		// deselected btn
		this.check_deselected = new CheckMark({
			hover_col:this.globals['global_styles']['gray_btn_darkest2'], 
			normal_col:this.globals['global_styles']['gray_btn_darkest']
		});

		this.deselect_btn = new SquareButton({		
			globals:this.globals, 
			image:this.check_deselected,
			hover_col:this.globals['global_styles']['gray_btn_darker'],
			normal_col:this.globals['global_styles']['gray_btn_normal'],
			width:`${this.globals['global_styles']['input_height']}px`, 
			height:`${this.globals['global_styles']['input_height']}px`, 
			btn_type:'click', 
			border_radius:'3px', 
			click_callback:this.select
		});

		if (this.selected === true) {
			this.cont.appendChild(this.select_btn.cont);
		} else {
			this.cont.appendChild(this.deselect_btn.cont);
		}
		
	}

	select = () => {
		this.cont.replaceChild(this.select_btn.cont, this.deselect_btn.cont);
		this.selected = true;
	}

	deselect = () => {
		this.cont.replaceChild(this.deselect_btn.cont, this.select_btn.cont);
		this.selected = false;
	}
}

