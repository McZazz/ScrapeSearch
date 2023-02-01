import { makeElement, setPermStyles, Component, randomSearch } from "./utils.js";
import { ScrollVert } from './scroll_vert.js';
import { Slider } from './slider.js';
import { SquareButton, PlusSign, CheckMark, CanvasPlus, TextButton } from './buttons.js';
import { GroupCard } from './group_card.js';
// import { AddGroupDialog } from './add_group_dialog.js';
import { AddGroupDialog2 } from './add_group_dialog2.js';
import { TextInput } from './inputs.js';

import { DomainGroupManager } from './engine/DomainGroupManager.js';

import { SearchViaGroups } from './engine/SearchViaGroups.js';
import { SearchResultCard } from './SearchResultCard.js';

import { TheInternet } from './TheInternet.js';


export class SearchPage extends Component {
	constructor({globals=null, domain_mngr=null}) {
		super(globals);
		this.id = 'search_page';
		this.scroll_width = '280px';
		this.panel_margins = '18px';
		this.add_dialog = null;

		this.cont = makeElement({
			type:'div', 
			styles:[
				['width', '100%'], 
				['height', '100%'], 
				['padding', `7px`], 
				['background', this.global_styles.body_bg_color], 
				['position', 'absolute'], 
				['display', 'flex'], 
				['justifyContent', 'center'], 
				['alignItems', 'center']
			]
		});

		// add this to globals and append to dom
		this.globals['pages_cont'].appendChild(this.cont);
		this.globals['pages'][this.id] = this.cont;

		// create search container
		this.search_cont = makeElement({
			type:'div', 
			styles:[
				['height', '100%'], 
				// ['height', '631px'], 
				['flexGrow', '1'], 
				// ['width', '1135px'], 
				['display', 'flex'], 
				['flexDirection', 'column']
			]
		});

		this.cont.appendChild(this.search_cont);

		// create parts of speech buttons row cont
		// this.speech_btns_row = makeElement({
		// 	type:'div', 
		// 	styles:[
		// 		['height', '26px'], 
		// 		['width', '100%'], 
		// 		['background', this.globals['global_styles']['panel_dark_bg']],
		// 		['marginBottom', this.panel_margins]
		// 	]
		// });
		// this.search_cont.appendChild(this.speech_btns_row);

		// create bottom row
		this.bottom_row = makeElement({
			type:'div', 
			styles:[
				['width', '100%'], 
				['flex-grow', '1'], 
				['display', 'flex']
			]
		});

		this.bottom_row = setPermStyles(this.bottom_row, [['width', '100%'], ['flex-grow', '1'], ['display', 'flex']]);
		this.search_cont.appendChild(this.bottom_row);

		// left col for groups, individuals, and weights
		this.left_col_cont = makeElement({
			type:'div',
			styles:[
				['width', this.scroll_width],
				['height', '100%'],
				['display', 'flex'],
				['flexDirection', 'column']
			]
		});
		this.bottom_row.appendChild(this.left_col_cont);

		// create row for btns and weights
		this.left_col_btns_row = makeElement({
			type:'div',
			styles:[
				['width', '100%'],
				['height', '35px'],
				['display', 'flex'],
				['marginBottom', `${this.globals['global_styles']['inner_panel_margins']}px`],
				['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`]
			]
		});
		this.left_col_cont.appendChild(this.left_col_btns_row);

		// group create / search container
		this.groups_btns = makeElement({
			type:'div',
			styles:[
				['width', '100px'],
				['height', '100%'],
				['padding', '0 4px'],
				['display', 'flex'],
				['justifyContent', 'space-around'],
				['alignItems', 'center'],
				['marginRight', `${this.globals['global_styles']['inner_panel_margins']}px`],
				['background', this.globals['global_styles']['panel_dark_bg']],
				['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`],
			]
		});
		this.left_col_btns_row.appendChild(this.groups_btns);

		// create and append deselct button
		const deselect = (event) => {
			// console.log('clicking deselect');
			this.scroll_left.deselectAll();
		}

		const check1 = new CheckMark({
			hover_col:this.globals['global_styles']['gray_btn_darkest2'], 
			normal_col:this.globals['global_styles']['gray_btn_darkest']
		});

		this.deselect_btn = new SquareButton({		
			globals:this.globals, 
			image:check1,
			hover_col:this.globals['global_styles']['gray_btn_darker'],
			normal_col:this.globals['global_styles']['gray_btn_normal'],
			width:`${this.globals['global_styles']['input_height']}px`, 
			height:`${this.globals['global_styles']['input_height']}px`, 
			btn_type:'click', 
			border_radius:'3px', 
			click_callback:deselect
		});
		this.groups_btns.appendChild(this.deselect_btn.cont);
		// this.deselect_btn.cont.style.boxShadow = this.globals['global_styles']['btn_inset_shadow_gray'];

		// create and append selct button
		const select = (event) => {
			// console.log('clicking select');
			this.scroll_left.selectAll();
		}

		const check2 = new CheckMark({
			hover_col:this.globals['global_styles']['blue_btn_darkest2'], 
			normal_col:this.globals['global_styles']['blue_btn_darkest']
		});

		this.select_btn = new SquareButton({		
			globals:this.globals, 
			// container:this.groups_btns,
			image:check2,
			hover_col:this.globals['global_styles']['blue_btn_darker2'],
			normal_col:this.globals['global_styles']['blue_btn_normal'],
			width:`${this.globals['global_styles']['input_height']}px`, 
			height:`${this.globals['global_styles']['input_height']}px`, 
			btn_type:'click', 
			border_radius:'3px', 
			click_callback:select
		});
		this.groups_btns.appendChild(this.select_btn.cont);
		// this.select_btn.cont.style.boxShadow = this.globals['global_styles']['btn_inset_shadow_blue'];

		// create and append add btn
		const add = (event) => {
			let clickXY = {
				pos:{
					x:event.clientX,
					y:event.clientY
				}
			}

			if (this.add_dialog === null) {

				this.add_dialog = new AddGroupDialog2({
					globals:this.globals, 
					clickXY:clickXY, 
					cards_container_obj:this.scroll_left,
					nullify_this_in_parent_cb:this.nullifyAddDialog, 
					add_groupcard_to_panel_cb:this.addGroupCardToPanel,
					parent_cont:this.globals['pages_cont'],
					header_height:36, 
					header_bg:this.globals['global_styles']['body_bg_color_darker'],
					body_bg:this.globals['global_styles']['body_bg_color_darker'], 
					width:450
				});

				this.add_dialog.append();
			}
		}

		// const plus = new PlusSign({
		// 	globals:this.globals,
		// 	width:'4px', 
		// 	border_radius:'1px',
		// 	hover_col:this.globals['global_styles']['gray_btn_darkest2'], 
		// 	normal_col:this.globals['global_styles']['gray_btn_darkest']
		// });



		this.new_grp_plus = new CanvasPlus({
			globals:this.globals,
			height:this.globals['global_styles']['input_height'], 
			width:this.globals['global_styles']['input_height'], 
			lineWidth:3, 
			padding:4,
			normal_col:this.globals['global_styles']['gray_btn_darkest'],
			hover_col:this.globals['global_styles']['gray_btn_darkest2']
		});


		this.add_btn = new SquareButton({		
			globals:this.globals, 
			// container:this.groups_btns,
			image:this.new_grp_plus,
			hover_col:this.globals['global_styles']['gray_btn_darker'],
			normal_col:this.globals['global_styles']['gray_btn_normal'],
			class_list:null,
			width:`${this.globals['global_styles']['input_height']}px`, 
			height:`${this.globals['global_styles']['input_height']}px`, 
			btn_type:'click', 
			border_radius:'2px', 
			click_callback:add
		});
		this.groups_btns.appendChild(this.add_btn.cont);

		// this.add_btn.cont.style.boxShadow = this.globals['global_styles']['btn_inset_shadow_gray'];

		// weights cont
		this.the_internet_cont = makeElement({
			type:'div',
			styles:[
				['flexGrow', '1'],
				['height', '100%'],
				['display', 'flex'],
				['paddingRight', '7px'],
				['alignItems', 'center'],
				['background', this.globals['global_styles']['panel_dark_bg']],
				['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`]
			]
		});
		this.left_col_btns_row.appendChild(this.the_internet_cont);

		this.the_internet = new TheInternet({globals:this.globals, selected:true});
		this.the_internet_cont.appendChild(this.the_internet.cont);
		this.globals['the_internet'] = this.the_internet;


		// component of weights
		// this.weights_slider = new Slider({
		// 	globals:this.globals, 
		// 	is_vertical:false, 
		// 	container:this.the_internet_cont, 
		// 	id:'weights_slider',
		// 	anim_styles:{
		// 		handle_col_normal: this.globals['global_styles']['slider_gray'],
		// 		handle_col_hover: this.globals['global_styles']['slider_gray_hover'],
		// 	}
		// });
		// this.internet_card = new InternetGroupCard(globals);
		// this.the_internet_cont.appendChild(this.internet_card.cont);

		// this.internet_card = new InternetGroupCard({
		// 	globals:this.globals, 
		// 	selected:true
		// });

		// this.the_internet_cont.appendChild(this.internet_card.cont);

		// create left scroll box
		this.sites_cont = makeElement({
			type:'div', 
			styles:[
				['width', '100%'], 
				['flexGrow', '1'], 
				['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`],
				['overflow', 'hidden'],
				['background', this.globals['global_styles']['panel_dark_bg']],
			]
		});
		this.left_col_cont.appendChild(this.sites_cont);

		this.scroll_left = new ScrollVert({
			globals:this.globals, 
			scroll_side:'right', 
			start_block_length:'7px', 
			end_block_length:'7px', 
			id:'sites_scroll',
			parent_obj:this
		});
		// this.scroll_left.scroll.end_block.style.height = '1px'; // webview 1px end of cont draw error in effect
		// console.log(this.scroll_left.scroll.end_block.style.height);
		this.scroll_left.setBarStyles([
			['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`],
			['width', '14px'],
			['margin', '0 8px']
		]);

		

		// this.scroll_left.scroll.bar.style.borderRadius = `${this.globals['global_styles']['scroll_bar_radius']}px`;
		// this.scroll_left.scroll.bar.style.width = '14px';
		// this.scroll_left.scroll.bar.style.margin = '0 8px';
		this.sites_cont.appendChild(this.scroll_left.cont);


		if (domain_mngr) {
			Object.keys(domain_mngr.domain_groups).forEach(key => {
				let obj = domain_mngr.domain_groups[key];
				// console.log(obj);
				this.addGroupCardToPanel(obj);
			});
		}

		// console.log(this.scroll_left.cards);

		// // create center column
		this.center_col = makeElement({
			type:'div', 
			styles:[
				['height', '100%'], 
				['flex-grow', '1'], 
				['minWidth', '350px'],
				['padding', `0 ${this.panel_margins}`],
				['display', 'flex'],
				['flexDirection', 'column'],
			]
		});
		this.bottom_row.appendChild(this.center_col);

		// create text entry in center column
		this.text_area_cont = makeElement({
			type:'div',
			styles:[
				['height', `${this.globals['global_styles']['input_height']}px`],
				['maxWidth', '100%'],
				['display', 'flex'],
				// ['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`]
			]
		});
		this.center_col.appendChild(this.text_area_cont);


		this.search_btn = new TextButton({		
			globals:this.globals, 
			text:'Search',
			class_list:'blue_btn',
			width:'58px',
			click_callback:null
		});

		// // create search button
		// this.search_btn = new SquareButton({
		// 	globals:this.globals, 
		// 	cont_obj:this.search_status,
		// 	class_list:'blue_btn',
		// 	width:'75px', 
		// 	height:'100%', 
		// 	btn_type:'click', 
		// 	border_radius:`${this.globals['global_styles']['scroll_bar_radius']}px`, 
		// 	click_callback:null //////////////// setting this at the end so no crash
		// });
		// // this.search_btn.cont.innerText = 'Search';
		// this.search_btn.setText('Search');
		// this.search_btn.setStyles([
		// 	['fontFamily', 'Arial'],
		// 	['userSelect', 'none'],
		// 	['fontSize', '18px'],
		// 	['display', 'flex'],
		// 	['justifyContent', 'center'],
		// 	['alignItems', 'center']
		// ]);
		this.text_area_cont.appendChild(this.search_btn.cont);

		this.text_area = new TextInput({globals:this.globals});
		this.text_area.setInputStyles([['flexGrow', '1'], ['marginLeft', `${this.globals['global_styles']['inner_panel_margins']}px`]]);
		this.text_area_cont.appendChild(this.text_area.cont);

		//create search and status area
		this.search_status = makeElement({
			type:'div',
			styles:[
				['height', `${this.globals['global_styles']['input_height']}px`],
				['maxWidth', '100%'],
				['display', 'flex'],
				['marginTop', `${this.globals['global_styles']['inner_panel_margins']}px`],
				['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`]
			]
		});
		this.center_col.appendChild(this.search_status);



		// create status area
		this.status_area_cont = makeElement({
			type:'div',
			styles:[
				['flexGrow', '1'],
				['display', 'flex'],
				['overflow', 'hidden'],
				['position', 'relative'],
				['alignItems', 'center'],
				['paddingLeft', '7px'],
				['height', '100%'],
				['background', this.globals['global_styles']['panel_dark_bg']],
				['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`]
			]
		});
		this.search_status.appendChild(this.status_area_cont);

		this.status_area = makeElement({
			type:'div',
			styles:[
				['position', 'absolute'],
				['display', 'flex'],
				['whiteSpace', 'nowrap'],
				['alignItems', 'center'],
				['height', '100%'],
				['color', this.globals['global_styles']['text_area_col3']],
			]
		});
		this.status_area_cont.appendChild(this.status_area);
		this.globals['status_bar'] = this.status_area;

		///////////////////////////////////// 2nd search status
		this.search_status_bot_cont = makeElement({
			type:'div',
			styles:[
				['height', `${this.globals['global_styles']['input_height']}px`],
				['maxWidth', '100%'],
				['display', 'flex'],
				['alignItems', 'center'],
				['position', 'relative'],
				['alignItems', 'center'],
				['paddingLeft', '7px'],
				['overflow', 'hidden'],
				['background', this.globals['global_styles']['panel_dark_bg']],
				['display', 'flex'],
				['marginTop', `${this.globals['global_styles']['inner_panel_margins']}px`],
				['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`]
			]
		});
		this.center_col.appendChild(this.search_status_bot_cont);

		this.search_status_bot = makeElement({
			type:'div',
			styles:[
				['position', 'absolute'],
				['display', 'flex'],
				['whiteSpace', 'nowrap'],
				['alignItems', 'center'],
				['height', '100%'],
				['color', this.globals['global_styles']['text_area_col3']],
			]
		});
		this.search_status_bot_cont.appendChild(this.search_status_bot);

		this.globals['status_bar_bot'] = this.search_status_bot;
		////////////////////

		// let save_search_plus = new CanvasPlus({
		// 	globals:this.globals,
		// 	height:this.globals['global_styles']['input_height'], 
		// 	width:this.globals['global_styles']['input_height'], 
		// 	lineWidth:3, 
		// 	padding:4,
		// 	normal_col:this.globals['global_styles']['gray_btn_darkest'],
		// 	hover_col:this.globals['global_styles']['gray_btn_darkest2']
		// });

		// const saveSearch = (event) => {
		// 	console.log('save search, closing broswer');
		// 	// this.duck_duck.closeBrowser();
		// }

		// this.save_search_add_btn = new SquareButton({		
		// 	globals:this.globals, 
		// 	image:save_search_plus,
		// 	hover_col:this.globals['global_styles']['gray_btn_darker'],
		// 	normal_col:this.globals['global_styles']['gray_btn_normal'],
		// 	class_list:null,
		// 	width:`${this.globals['global_styles']['input_height']}px`,    
		// 	height:`${this.globals['global_styles']['input_height']}px`, 
		// 	btn_type:'click', 
		// 	border_radius:'2px', 
		// 	click_callback:saveSearch
		// });
		// this.save_search_add_btn.setStyles([['marginLeft', `${this.globals['global_styles']['inner_panel_margins']}px`]]);
		// this.search_status.appendChild(this.save_search_add_btn.cont);
		// this.save_search_add_btn.strokeImage();

		// create search targets area //////////////////////////////////////////// search resuts here
		this.saved_searches_area = makeElement({
			type:'div',
			styles:[
				['flexGrow', '1'],
				['minWidth', '100%'],
				['marginTop', this.panel_margins],
				['background', this.globals['global_styles']['panel_dark_bg']],
				// ['padding', '7px 0 0 7px'],
				['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`],
				['overflow', 'hidden']
			]
		});
		this.center_col.appendChild(this.saved_searches_area);


		this.center_col_scroll = new ScrollVert({
			globals:this.globals, 
			scroll_side:'right', 
			start_block_length:'7px', 
			end_block_length:'7px', 
			id:'saved_searches_scroll',
			test_contents:false
		});
		this.center_col_scroll.setBarStyles([
			['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`],
			['width', '14px'],
			['margin', '0 8px']
		]);
		// this.center_col_scroll.scroll.track.style.height = null;
		// this.center_col_scroll.scroll.track.style.maxHeight = '100%';
		// this.center_col_scroll.scroll.track.style.margin = '4px 0 3px 0'; // webview 1px draw error in effect

		// this.center_col_scroll.scroll.bar.style.borderRadius = `${this.globals['global_styles']['scroll_bar_radius']}px`;
		// this.center_col_scroll.scroll.bar.style.width = '14px';
		// this.center_col_scroll.scroll.bar.style.margin = '0 8px';
		this.saved_searches_area.appendChild(this.center_col_scroll.cont);
		this.globals['center_col_scroll'] = this.center_col_scroll;


		// for (let i = 0; i < 35; i++) {
		// 	let test_result1 = new SearchResultCard({
		// 		globals:this.globals, 
		// 		link:'www.link.com/34werwerr3rrwefsdffsf/w3rwef234fef234rwerfsef/3fswfwefsf/sdfw34ffsdfsdfwf/efsdfsdff', 
		// 		title:'title', 
		// 		description:'asdf weafsfasdf wef fasdfas fwef'
		// 	});
		// }

		// for (let i = 0; i < 15; i++) {
		// 	let test_result3 = new SearchResultCard({
		// 		globals:this.globals, 
		// 		link:'fakelonk.org', 
		// 		title:'title', 
		// 		description:'asdf weafsfasdf wef fasdfas fwef',
		// 		height:'103px'
		// 	});
		// }

		// for (let i = 0; i < 15; i++) {
		// 	let test_result1 = new SearchResultCard({
		// 		globals:this.globals, 
		// 		link:'plutocratManagerialTheory.edu', 
		// 		title:'title', 
		// 		description:'asdf weafsfasdf wef fasdfas fwef'
		// 	});
		// }

		// let test_result2 = new SearchResultCard({
		// 	globals:this.globals, 
		// 	link:'link', 
		// 	title:'title', 
		// 	description:'The LAST ONE'
		// });


		// // create right scroll box
		this.right_col = makeElement({
			type:'div', 
			styles:[
				['width', this.scroll_width], 
				['height', '100%'], 
				['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`],
				['overflow', 'hidden'],
				['background', this.globals['global_styles']['panel_dark_bg']],
			]
		});
		this.bottom_row.appendChild(this.right_col);

		this.scroll_right = new ScrollVert({
			globals:this.globals,
			scroll_side:'right',
			start_block_length:'7px',
			end_block_length:'7px',
			id:'algos_scroll',
			test_contents:false
		});
		this.scroll_right.setBarStyles([
			['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`],
			['width', '14px'],
			['margin', '0 8px']
		]);
		this.right_col.appendChild(this.scroll_right.cont);

		this.addJobCardToPanel({
			title:'Search Via Groups',
			selected:true,
			domain_group_id:'3432r54235'
		});

		this.search_btn.click_callback = this.searchBtnClicked;


		this.new_grp_plus.setAsNormal();
    this.new_grp_plus.setAsNormal();
    this.new_grp_plus.setAsNormal(); // prob just use svg and img from now on...
		////////////////////////////////////// available in globals


	}

	static construct = async (globals) => {
		let domain_mngr = await DomainGroupManager.construct({
			globals:globals,
			cards_container_obj:this.scroll_left, 
			add_card_to_dom_cb:this.addGroupCardToPanel
		});

		return new SearchPage({globals:globals, domain_mngr:domain_mngr});
	}

	searchBtnClicked = async (event) => {
		// button first checks the jobs panel for active cards, then here it instantiates teh correct card and runs the job
		let selected = this.scroll_right.getFirstSelectedCard();

		// console.log('selected job card:', selected);

		if (selected) {
			if (selected.job_type === 'SearchViaGroups') {
				let domain_mngr = await DomainGroupManager.construct({globals:this.globals,cards_container_obj:this.scroll_left, add_card_to_dom_cb:this.addGroupCardToPanel});
				let domains = domain_mngr.getSelectedDomains();
				// get selected domain groups
				let search_str = this.text_area.getText();

				if (!search_str) {
					search_str = randomSearch();
				}

				// display status message
				this.globals['statusbar_top'].displayText(`Search: ${search_str}`);

				// clear results
				this.center_col_scroll.removeAll();

				selected.runJob(search_str, domains);
			}
		} else {
			// display message to select a job
			this.globals['statusbar_top'].displayText(`From the panel to the right, select a search job.`);
		}
		///////////////////////////////////////////////////////////////////////////// start canned search
		// let search = randomSearch();
		// console.log('clicking search', `${search}`);
		// this.duckduckgo.search({engine:'duckduckgo', search_terms:search, max:20});
		///////////////////////////////////////////////////////////////////////////// end canned search
	}


	nullifyAddDialog = () => {
		this.add_dialog = null;
	}

	addGroupCardToPanel = (new_group) => {
		if (new_group) {
			// console.log('adding new group to panel:', new_group);

			let card = new GroupCard({
				title:new_group.title, 
				selected:new_group.selected,
				domain_group_id:new_group.id,
				globals:this.globals,
				container_object:this.scroll_left,
				card_type:'GroupCard'
			});

			this.scroll_left.addNewCard(card);
		}
	}

	addJobCardToPanel = (job) => {
		if (job) {
			// let card = new GroupCard({
			// 	title:job.title, 
			// 	selected:job.selected,
			// 	domain_group_id:job.id,
			// 	globals:this.globals,
			// 	container_object:this.scroll_right,
			// 	card_type:'JobCard'
			// });

			let card = new SearchViaGroups({
				title:job.title, 
				selected:job.selected,
				globals:this.globals,
				container_object:this.scroll_right,
			});

			this.scroll_right.addNewCard(card);
		}
	}

	// removeAddDialog = () => {
	// 	if (this.add_dialog !== null) {
	// 		this.globals['global_screen_resize'].removeFromUpdater(this.add_dialog);
	// 		this.globals['pages_cont'].removeChild(this.add_dialog.cont);
	// 		this.add_dialog = null;
	// 		console.log('removed it');
	// 	}
	// }
}