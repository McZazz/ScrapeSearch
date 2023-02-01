import { makeElement, setPermStyles, appendAnimStyles, Component } from "./utils.js";
// const { appWindow } = window.__TAURI__.window;

// export class TitleBarButton extends Component {
// 	constructor(globals, id) {
// 		super(globals);
// 		this.id = id;

// 		let title_bar_button = makeElement('svg', [['id', id], ['classList', 'win_control_btn'], ['innerHTML',`<svg class="svg" style="clip-rule:evenodd;fill-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2" viewBox="0 0 10 10"><rect width="10" height="10" style="fill-opacity:0"/><path d="m10 0h-10v10h10v-10zm-1 1v8h-8v-8h8z" style="fill:${this.global_styles.titlebar_color}"/></svg>`]]);
// 		title_bar_button = setPermStyles(title_bar_button, [['userSelect', 'none']]);

// 		this.cont = title_bar_button;

// 		this.globals['window'][this.id] = this;
// 	}
// }

export class TitleBar extends Component {
	constructor(globals) {
		super(globals);

		/*
		title_bar
			win_controls_cont
				win_minimize
				win_restore
				win_maximize
				win_close
		*/

		this.id = 'title_bar';
		this.btn_cont_width = 38;
		this.btn_size = 13;
		this.diagonal = this.btn_size * Math.sqrt(2);
		this.window_size = 'lg';
		this.resize_btn_clicked = false;
		this.mac_btns_cont_width = this.btn_cont_width * .7;

		this.cont = makeElement({
			type:'div', 
			props:[
				['id', this.id]
			], 
			styles:[
				['display', 'flex'], 
				['alignItems', 'center'], 
				['background', this.global_styles.titlebar_color], 
				['minHeight', `${this.global_styles.title_bar_height}px`], 
				['webkitAppRegion', 'drag']	
			]
		});

		if (this.globals['is_mac'] === false) {
			this.cont.style.justifyContent = 'flex-end';
		}

		this.win_controls_cont = makeElement({
			type:'div', 
			props:[
				['id', 'win_controls_cont'], 
				// ['classList', 'ignore_event']
			], 
			styles:[
				['display', 'flex'], 
				['flexDirection', 'row'], 
				['justifyContent', 'flex-end'], 
				['alignItems', 'center'], 
				['height', '100%'], 
				['webkitAppRegion', 'no-drag']
			]
		});

		////////////////////////////////////
		// dblclick on titlebar
		// this.dbl_click = makeElement({
		// 	type:'div',
		// 	styles:[
		// 		['position', 'relative'],
		// 		['width', '100%'],
		// 		['height', '100%'],
		// 		['background', 'yellow'],
		// 	]
		// });

		//////////////// fix for double clicks messing up icons, both are needed or else the other fails
		nw.Window.get().on('maximize', () => {
			if (this.resize_btn_clicked === false) {
				this.maximizeToRestore();
			}
			this.resize_btn_clicked = false;
		});

		nw.Window.get().on('restore', () => {
			if (this.resize_btn_clicked === false) {
				this.restoreToMaximize();
			}
			this.resize_btn_clicked = false;
		});


		/////// do mac check here for buttons left

		// title_bar.appendChild(this.dbl_click);
		this.cont.appendChild(this.win_controls_cont);

		////////////////////////////////////////////////////////////////////
		// win_minimize cont
		// let win_minimize = new TitleBarButton(globals, 'win_minimize');
		this.win_minimize_cont = makeElement({
			type:'div', 
			props:[
				['id', 'win_minimize_cont'], 
			], 
			styles:[
				['width', `${this.btn_cont_width}px`], 
				['height', `100%`], 
				['display', 'flex'], 
				['justifyContent', 'center'], 
				['alignItems', 'center']
			]
		});



		if (this.globals['is_mac'] === false) {

			this.win_minimize_cont.classList = 'win_control_btn';

			let win_minimize = makeElement({
				type:'div', 
				styles:[
					['width', `${this.btn_size}px`], 
					['height', `${this.btn_size}px`], 
					['display', 'flex'], 
					['flexDirection', 'column'], 
					['justifyContent', 'flex-end']
				]
			});
			this.win_minimize_cont.appendChild(win_minimize);

			let win_minimize_bot = makeElement({
				type:'div', 
				styles:[
					['height', '1px'], 
					['width', '100%'], 
					['background', this.global_styles.titlebar_btns]
				]
			});
			win_minimize.appendChild(win_minimize_bot);

			this.win_minimize_cont.addEventListener('click', () => {
				this.resize_btn_clicked = true;
				nw.Window.get()['minimize']();
			});

		} else {

			this.win_controls_cont.classList = 'mac_icons';


			this.win_minimize_cont.style.width = `${this.mac_btns_cont_width}px`;
			
			let mac_minimize = makeElement({
				type:'div',
				props:[
					['classList', 'mac_minimize mac_btns'],
					['id', 'mac_minimize'],
				]
			});
			this.win_minimize_cont.appendChild(mac_minimize);

			let mac_min_img = makeElement({
				type:'div',
				props:[
					['id', 'mac_min_img'],
					['classList', 'mac_btns_images']
				]
			});
			mac_minimize.appendChild(mac_min_img);

			mac_minimize.addEventListener('click', () => {
				this.resize_btn_clicked = true;
				nw.Window.get()['minimize']();
			});
		}



		this.win_controls_cont.addEventListener('wheel', (event) => { // prevent wheel from scroll on title bar btns
      event.stopPropagation();
      event.preventDefault();
    });

		this.win_controls_cont.appendChild(this.win_minimize_cont);
		//
		/////////////////////////////////////////////////////////////////////


		////////////////////////////////////////////////////////////////////
		// win_restore cont
		this.win_restore_cont = makeElement({
			type:'div', 
			props:[
				['id', 'win_restore_cont'], 
				// ['classList', 'win_control_btn']
			], 
			styles:[
				['width', `${this.btn_cont_width}px`], 
				['height', `100%`], ['display', 'flex'], 
				['justifyContent', 'center'], 
				['alignItems', 'center']
			]
		});



		if (this.globals['is_mac'] === false) {

			this.win_restore_cont.classList = 'win_control_btn';

			let win_restore = makeElement({
				type:'div', 
				styles:[
					['width', `${this.btn_size}px`], 
					['height', `${this.btn_size}px`], 
					['display', 'flex'], 
					['flexDirection', 'column'], 
					['justifyContent', 'flex-end'], 
					['position', 'relative']
				]
			});
			this.win_restore_cont.appendChild(win_restore);

			let win_restore_1 = makeElement({
				type:'div', 
				styles:[
					['position', 'absolute'], 
					['top', '0'], 
					['right', '0'], 
					['height', '1px'], 
					['background', this.global_styles.titlebar_btns], 
					['width', '80%']
				]
			});
			win_restore.appendChild(win_restore_1);

			let win_restore_2 = makeElement({
				type:'div', 
				styles:[
					['position', 'absolute'], 
					['top', '0'], ['right', '0'], 
					['width', '1px'], 
					['background', this.global_styles.titlebar_btns], 
					['height', '80%']
				]
			});
			win_restore.appendChild(win_restore_2);

			let win_restore_3 = makeElement({
				type:'div', 
				styles:[
					['position', 'absolute'], 
					['top', '0'], 
					['right', '80%'], 
					['width', '1px'], 
					['background', this.global_styles.titlebar_btns], 
					['height', '20%']
				]
			});
			win_restore.appendChild(win_restore_3);

			let win_restore_4 = makeElement({
				type:'div', 
				styles:[
					['position', 'absolute'], 
					['bottom', '20%'], 
					['right', '0'], 
					['height', '1px'], 
					['background', this.global_styles.titlebar_btns], 
					['width', '20%']
				]
			});
			win_restore.appendChild(win_restore_4);

			let win_restore_5 = makeElement({
				type:'div', 
				styles:[
					['position', 'absolute'], 
					['top', '20%'], 
					['left', '0'], 
					['height', '1px'], 
					['background', this.global_styles.titlebar_btns], 
					['width', '80%']
				]
			});
			win_restore.appendChild(win_restore_5);

			let win_restore_6 = makeElement({
				type:'div', 
				styles:[
					['position', 'absolute'], 
					['top', '20%'], 
					['left', '80%'], 
					['height', '80%'], 
					['background', this.global_styles.titlebar_btns], 
					['width', '1px']
				]
			});
			win_restore.appendChild(win_restore_6);

			let win_restore_7 = makeElement({
				type:'div', 
				styles:[
					['position', 'absolute'], 
					['bottom', '0'], 
					['left', '0'], 
					['height', '1px'], 
					['background', this.global_styles.titlebar_btns], 
					['width', '80%']
				]
			});
			win_restore.appendChild(win_restore_7);

			let win_restore_8 = makeElement({
				type:'div', 
				styles:[
					['position', 'absolute'], 
					['bottom', '0'], 
					['left', '0'], 
					['height', '80%'], 
					['background', this.global_styles.titlebar_btns], 
					['width', '1px']
				]
			});
			win_restore.appendChild(win_restore_8);

		this.win_restore_cont.addEventListener('click', () => {
			this.resize_btn_clicked = true;
			this.restoreToMaximize();
		});

		} else {

			this.win_restore_cont.style.width = `${this.mac_btns_cont_width}px`;
			
			let mac_restore = makeElement({
				type:'div',
				props:[
					['classList', 'mac_restore mac_btns'],
					['id', 'mac_restore']
				]
			});
			this.win_restore_cont.appendChild(mac_restore);

			let mac_restore_img = makeElement({
				type:'div',
				props:[
					['id', 'mac_restore_img'],
					['classList', 'mac_btns_images']
				]
			});
			mac_restore.appendChild(mac_restore_img);

			mac_restore.addEventListener('click', () => {
				this.resize_btn_clicked = true;
				this.restoreToMaximize();
			});
			
		}


		// win_controls_cont.appendChild(this.win_restore_cont);	
		//
		////////////////////////////////////////////////////////////////

		//////////////////////////////////////////////////////////////////////////
		//
		this.win_maximize_cont = makeElement({
			type:'div', 
			props:[
				['id', 'win_maximize_cont'], 
				// ['classList', 'win_control_btn']
			], 
			styles:[
				['width', `${this.btn_cont_width}px`], 
				['height', `100%`], 
				['display', 'flex'], 
				['justifyContent', 'center'], 
				['alignItems', 'center']
			]
		});


		if (this.globals['is_mac'] === false) {

			this.win_maximize_cont.classList = 'win_control_btn';

			let win_maximize = makeElement({
				type:'div', 
				styles:[
					['width', `${this.btn_size}px`], 
					['height', `${this.btn_size}px`], 
					['display', 'flex'], 
					['flexDirection', 'column'], 
					['justifyContent', 'flex-end'], 
					['position', 'relative']
				]
			});
			this.win_maximize_cont.appendChild(win_maximize);

			let win_maximize_1 = makeElement({
				type:'div', 
				styles:[
					['position', 'absolute'], 
					['top', '0'], 
					['left', '0'], 
					['height', '100%'], 
					['background', this.global_styles.titlebar_btns], 
					['width', '1px']
				]
			});
			win_maximize.appendChild(win_maximize_1);

			let win_maximize_2 = makeElement({
				type:'div', 
				styles:[
					['position', 'absolute'], 
					['top', '0'], 
					['left', '0'], 
					['height', '1px'], 
					['background', this.global_styles.titlebar_btns], 
					['width', '100%']
				]
			});
			win_maximize.appendChild(win_maximize_2);

			let win_maximize_3 = makeElement({
				type:'div', 
				styles:[
					['position', 'absolute'], 
					['top', '0'], 
					['right', '0'], 
					['height', '100%'], 
					['background', this.global_styles.titlebar_btns], 
					['width', '1px']
				]
			});
			win_maximize.appendChild(win_maximize_3);

			let win_maximize_4 = makeElement({
				type:'div', 
				styles:[
					['position', 'absolute'], 
					['bottom', '0'], 
					['right', '0'], 
					['height', '1px'], 
					['background', this.global_styles.titlebar_btns], 
					['width', '100%']
				]
			});
			win_maximize.appendChild(win_maximize_4);

			this.win_maximize_cont.addEventListener('click', () => {
				this.resize_btn_clicked = true;
				this.maximizeToRestore();
			});

		} else {

			this.win_maximize_cont.style.width = `${this.mac_btns_cont_width}px`;
			
			let mac_maximize = makeElement({
				type:'div',
				props:[
					['classList', 'mac_maximize mac_btns'],
					['id', 'mac_maximize']
				]
			});
			this.win_maximize_cont.appendChild(mac_maximize);

			let mac_maximize_img = makeElement({
				type:'div',
				props:[
					['id', 'mac_maximize_img'],
					['classList', 'mac_btns_images']
				]
			});
			mac_maximize.appendChild(mac_maximize_img);

			mac_maximize.addEventListener('click', () => {
				this.resize_btn_clicked = true;
				this.maximizeToRestore();
			});

		}



		this.win_controls_cont.appendChild(this.win_maximize_cont);


		///////////////////////////////////////////////////////////////////////////


		// titlebar_btns:
		///////////////////////////////////////////////////////////////////////////////
		//
		this.win_close_cont = makeElement({
			type:'div', 
			props:[
				['id', 'win_close_cont'], 
				// ['classList', 'win_control_btn']
			], 
			styles:[
				['width', `${this.btn_cont_width}px`], 
				['height', `100%`], ['display', 'flex'], 
				['justifyContent', 'center'], 
				['alignItems', 'center']
			]
		});


		if (this.globals['is_mac'] === false) {

			this.win_close_cont.classList = 'win_control_btn';

			let win_close = makeElement({
				type:'div', 
				styles:[
					['width', `${this.btn_size}px`], 
					['height', `${this.btn_size}px`], 
					['display', 'flex'], 
					['flexDirection', 'column'], 
					['justifyContent', 'flex-end'], 
					['position', 'relative']
				]
			});
			this.win_close_cont.appendChild(win_close);

			let win_close_1 = makeElement({
				type:'div', 
				styles:[
					['position', 'absolute'], 
					['height', '1px'], 
					['bottom', '-0.5px'], 
					['left', '0'], 
					['width', `${this.diagonal}px`], 
					['transformOrigin', '0% 0%'], 
					['background', this.global_styles.titlebar_btns2], 
					['transform', 'rotate(-45deg)']
				]
			});
			win_close.appendChild(win_close_1);

			let win_close_2 = makeElement({
				type:'div', 
				styles:[
					['position', 'absolute'], 
					['top', '-0.5px'], 
					['left', '0'], 
					['height', '1px'], 
					['width', `${this.diagonal}px`], 
					['transformOrigin', '0%'], 
					['background', this.global_styles.titlebar_btns2], 
					['transform', 'rotate(45deg)']
				]
			});
			win_close.appendChild(win_close_2);

			this.win_close_cont.addEventListener('click', () => {
				nw.Window.get()['close']();
			});

		} else {

			this.win_close_cont.style.width = `${this.mac_btns_cont_width}px`;

			let mac_close = makeElement({
				type:'div',
				props:[
					['classList', 'mac_close mac_btns'],
					['id', 'mac_close']
				]
			});
			this.win_close_cont.appendChild(mac_close);

			let mac_close_img = makeElement({
				type:'div',
				props:[
					['id', 'mac_close_img'],
					['classList', 'mac_btns_images']
				]
			});
			mac_close.appendChild(mac_close_img);

			mac_close.addEventListener('click', () => {
				nw.Window.get()['close']();
			});
		}



		this.win_controls_cont.appendChild(this.win_close_cont);
		///////////////////////////////////////////////////////////////////////////////
		// reorder for mac
		if (this.globals['is_mac'] === true) {
			this.win_controls_cont.appendChild(this.win_minimize_cont);
			this.win_controls_cont.appendChild(this.win_maximize_cont);
		}

		////////////////////////////////


		// set body properties now, or else title bar is broken
		setPermStyles(document.body, [['display', 'flex'], ['overflow', 'hidden'], ['flexDirection', 'column'], ['margin', '0'], ['overflow', 'hidden'], ['padding', '0'], ['height', '100vh'], ['width', '100%'], ['background', this.global_styles.body_bg_color], ['fontFamily', `monospace`]]);

		// document.getElementById('titleBar').append
		document.body.appendChild(this.cont);

		// create container for all pages
		this.pages_cont = makeElement({
			type:'div', 
			styles:[
				['width', '100%'], 
				['height', '100%'], 
				['background', this.global_styles.body_bg_color], 
				['position', 'relative'],
				['overflow', 'hidden']
			]
		});
		this.globals['pages_cont'] = this.pages_cont;
		document.body.appendChild(this.pages_cont);

		this.globals['window'][this.id] = this;

	}

	appLoadMaximizedCheck = () => {
		// let screen_width = screen.availWidth;
		// let screen_height = screen.availHeight;

		// let window_width = window.outerWidth;
		// let window_height = window.outerHeight;

		// if (nw.Window.get().width >= screen_width && nw.Window.get().height >= screen_height) {
		// 	this.maximizeToRestore();
		// }
	}

	restoreToMaximize = () => {
		this.win_controls_cont.replaceChild(this.win_maximize_cont, this.win_restore_cont);
		nw.Window.get()['restore']();
	}

	maximizeToRestore = () => {
		this.win_controls_cont.replaceChild(this.win_restore_cont, this.win_maximize_cont);
		nw.Window.get()['maximize']();
	}
}




