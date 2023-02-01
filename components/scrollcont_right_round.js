import { makeElement, setPermStyles, Component } from "./utils.js";
import { ScrollBar } from './scrollbar.js';
import { GlobalScreenResizeUpdater } from './global_screen_resize_updater.js';


export class ScrollcontRightRound extends Component {
	constructor({globals=null, test_contents=false}={}) {
		super(globals);
		this.scroll_side = 'right';

		this.startend_blocks_length = 7;
		this.scroll_drawer_padding = 7;
		this.card_swap_offset = null;

		this.cont = makeElement({
			type:'div', 
			styles:[
				['display', 'flex'], 
				['width', '100%'], 
				['height', '100%'],
				['position', 'relative']
			]
		});

		this.scroll_cont = makeElement({
			type:'div', 
			styles:[
				['display', 'flex'], 
				['position', 'relative'], 
				// ['flexGrow', '1'], 
				['flexGrow', '1'], 
				['overflow', 'hidden'],
			]
		});
		this.cont.appendChild(this.scroll_cont);

		this.scroll_drawer = makeElement({
			type:'div', 
			styles:[
				['position', 'absolute'], 
				['width', '100%'], 
				// ['background', 'gray'],
				['minHeight', '100%'],
				// ['paddingLeft', `${this.scroll_drawer_padding}px`],
				// ['paddingTop', `${this.scroll_drawer_padding}px`] /////////////////////////////////////
			]
		});
		this.scroll_cont.appendChild(this.scroll_drawer);

		this.scroll_content_cont = makeElement({
			type:'div',
			styles:[
				['display', 'flex'],
				['background', this.globals['global_styles']['panel_dark_bg']], /////////////////////////////////// ADD BORDER RADIUS
				['flexDirection', 'column'],
				['height', '100%'],
				['width', '100%'],
			]
		});
		this.scroll_drawer.appendChild(this.scroll_content_cont);


		this.scroll_spacer_bot = makeElement({
			type:'div',
			styles:[
				['width', '100%'],
				['height', '7px'],
			]
		});
		// this.scroll_content_cont.appendChild(this.scroll_spacer_top);
		this.scroll_content_cont.appendChild(this.scroll_spacer_bot);

		if (test_contents === true) {
			let thing1 = makeElement({
				type:'div',
				styles:[
					['width', '100px'],
					['height', '100px'],
					['marginTop', '7px'],
					['background', 'red']
				]
			});
			let thing2 = makeElement({
				type:'div',
				styles:[
					['width', '30px'],
					['height', '600px'],
					['background', 'brown']
				]
			});
			let thing3 = makeElement({
				type:'div',
				styles:[
					['width', '100px'],
					['height', '100px'],
					['background', 'purple'],
				]
			});
			this.scroll_content_cont.insertBefore(thing1, this.scroll_spacer_bot);
			this.scroll_content_cont.insertBefore(thing2, this.scroll_spacer_bot);
			this.scroll_content_cont.insertBefore(thing3, this.scroll_spacer_bot);
		}

		this.scroll = new ScrollBar({
			globals: globals,
			end_blocks: true,
			start_block_length: `${this.startend_blocks_length}px`,
			end_block_length: `${this.startend_blocks_length}px`,
			side: this.scroll_side,
			track_thickness: this.globals['global_styles']['scroll_track_thickness'],
			// track_styles: [['background', '#455071']], 
			container: this.cont,
			container_class: this,
			scroll_cont: this.scroll_cont,
			scroll_drawer: this.scroll_drawer,
			scroll_drawer_padding:this.scroll_drawer_padding,
			anim_styles: {
				bar_normal: this.globals['global_styles']['btn_gray_bg'],
				bar_hover: this.globals['global_styles']['btn_gray_hover'],
				bar_active: this.globals['global_styles']['btn_gray_hover']
			}
		});


	}

	setBarStyles = (styles_arr) => {
		this.scroll.setBarStyles(styles_arr);
	}

	setScrollContentContStyles = (styles_arr) => {
		styles_arr.forEach(style => {
			this.scroll_content_cont.style[style[0]] = style[1];
		});
	}

	resetAll = () => {
		this.scroll.screenResizeUpdate();

		if (this.scroll.barIsVisible()) {
			this.scroll.removeScrollIsGonePadding();
		} else {
			this.scroll.addScrollIsGonePadding();
		}
	}


	addItem = (item_cont) => {

		// margin top is needed every one


		// append
		if (this.scroll_content_cont.childNodes.length === 1) {
			this.scroll_content_cont.insertBefore(item_cont, this.scroll_spacer_bot);
		} else {
			this.scroll_content_cont.insertBefore(item_cont, this.scroll_content_cont.firstChild);
		}

		this.scroll.screenResizeUpdate();

		if (this.scroll.barIsVisible()) {
			this.scroll.removeScrollIsGonePadding();
		} else {
			this.scroll.addScrollIsGonePadding();
		}
	}

	resetBoundingRects = () => {
		this.scrolldrawer_size = this.scroll_drawer.getBoundingClientRect();
		this.scrolldrawer2_size = this.scroll_content_cont.getBoundingClientRect();
		this.scrollcont_size = this.scroll_cont.getBoundingClientRect();
	}

	removeItem = (item_cont) => {
		this.scroll_content_cont.removeChild(item_cont);
	}

}