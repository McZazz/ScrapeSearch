import { makeElement, appendAnimStyles, Component, setPermStyles, appendMultiple, roundToTwo } from './utils.js';
import { DialogWindow2 } from './dialog_window2.js';
import { ScrollcontRightRound } from './scrollcont_right_round.js';
import { TextInput, UrlInputAndBtn2 } from './inputs.js';
import { SquareButton, TextButton, CanvasPlus } from './buttons.js';
import { DomainGroupManager } from './engine/DomainGroupManager.js';

export class AddGroupDialog2 extends DialogWindow2 {
	constructor({
		globals=null, 
		clickXY=null, 
		parent_cont=null, 
		cards_container_obj=null,
		nullify_this_in_parent_cb=null, 
		add_groupcard_to_panel_cb=null,
		header_height=null, 
		header_bg=null, 
		body_bg=null, 
		width=null,
		card=null

	}={}) {

		const adjustScrollContHeight = (new_height) => {
			new_height = new_height - this.header_height - this.btns_row_height;
			this.agd_cont.style.height = `${new_height - (this.margins_thickness * 2)}px`
			// console.log('adjusting scroll height::', new_height, this.btns_row_height);
		}

		const resetScroll = () => {
			this.scroll.resetAll();
		}

		super({
			globals:globals, 
			clickXY:clickXY, 
			parent_cont:parent_cont, 
			nullify_this_in_parent_cb:nullify_this_in_parent_cb, 
			header_height:header_height, 
			header_bg:header_bg, 
			body_bg:body_bg, 
			width:width,
			adjust_scroll_cont_height_cb:adjustScrollContHeight,
			reset_scroll_cb:resetScroll
		});

		this.card = card;

		this.id = null;

		this.url_arr = [];
		this.cards_container_obj = cards_container_obj;
		this.add_groupcard_to_panel_cb = add_groupcard_to_panel_cb;

		this.min_width = width;

		this.btns_row_height = 36;
		this.margins_thickness = 7;

		this.body.style.paddingBottom = `${this.margins_thickness}px`;

		this.agd_content = makeElement({
			type:'div',
			styles:[
				['display', 'flex'],
				['flexDirection', 'column'],
				['width', '100%'],
				['maxHeight', '100%'],
				['padding', `0 9px 0 9px`],
			]
		});
		this.body.appendChild(this.agd_content);

		let radius = this.globals['global_styles']['scroll_bar_radius'];

		this.agd_btns = makeElement({
			type:'div',
			styles:[
				['display', 'flex'],
				// ['alignItems', 'center'],
				['width', '100%'],
				// ['padding', '0 7px'],
				['marginBottom', `${this.margins_thickness}px`], ////////////// add to adjustScrollContHeight
				['minHeight', `${this.btns_row_height}px`]
			]
		});
		this.agd_content.appendChild(this.agd_btns);

		this.agd_btns_left = makeElement({
			type:'div',
			styles:[
				['display', 'flex'],
				['flexGrow', '1'],
				['borderRadius', `${radius}px`],
				['padding', '0 7px'],
				['alignItems', 'center'],
				['background', this.globals['global_styles']['panel_dark_bg']]
			]
		});

		this.agd_btns_right = makeElement({
			type:'div',
			styles:[
				['display', 'flex'],
				['borderRadius', `${radius}px`],
				// ['display', 'flex'],
				['alignItems', 'center'],
				['marginLeft', '7px'],
				['padding', '0 7px'],
				['background', this.globals['global_styles']['panel_dark_bg']]
			]
		});

		this.agd_btns.appendChild(this.agd_btns_left)
		this.agd_btns.appendChild(this.agd_btns_right)

		// create btn
		this.save_group_btn = new TextButton({		
			globals:globals, 
			text:'Save',
			class_list:'gray_btn_hover_darker',
			width:'45px',
			click_callback:this.saveGroup
		});
		this.agd_btns_left.appendChild(this.save_group_btn.cont);

		// title input
		this.title_input = new TextInput({globals:globals});
		this.title_input.setInputStyles([['flexGrow', '1'], ['marginLeft', '7px']]);
		this.agd_btns_left.appendChild(this.title_input.cont);

		// add new row btn
		this.addbtn_image = new CanvasPlus({
			globals:this.globals,
			height:this.globals['global_styles']['input_height'], 
			width:this.globals['global_styles']['input_height'], 
			lineWidth:3, 
			padding:4,
			normal_col:this.globals['global_styles']['gray_btn_darkest'],
			hover_col:this.globals['global_styles']['gray_btn_darkest2']
		});

		this.addbtn = new SquareButton({		
			globals:this.globals, 
			image:this.addbtn_image,
			hover_col:this.globals['global_styles']['gray_btn_darker'],
			normal_col:this.globals['global_styles']['gray_btn_normal'],
			width:`${this.globals['global_styles']['input_height']}px`, 
			height:`${this.globals['global_styles']['input_height']}px`, 
			click_callback:this.appendOneUrlRowCb
		});
		this.agd_btns_right.appendChild(this.addbtn.cont);
		this.addbtn.strokeImage();

		this.agd_cont = makeElement({ ///////////////////////// height of this one needs to change with added items and user resize !!!!!!!!
			type:'div',
			styles:[
				['display', 'flex'],
				['width', '100%'],
				['overflow', 'hidden'],
				['height', '200px'], ///////////////////////////////////////////////////////////////////////////////// ADD BORDER RADIUS
				['borderRadius', `${radius}px`],
				['background', this.globals['global_styles']['panel_dark_bg']]
				// ['paddingTop', '7px'],
			]
		});
		this.agd_content.appendChild(this.agd_cont);


		this.scroll = new ScrollcontRightRound({globals:globals, test_contents:false});
		this.scroll.setBarStyles([
			['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`],
			['width', '14px'],
			['margin', '0 8px']
		]);
		this.scroll.setScrollContentContStyles([['paddingLeft', '7px']]);
		this.agd_cont.appendChild(this.scroll.cont);

	}

	addDeleteBtn = () => {

		const deleteBtn = async () => {
			// console.log('deleting this group');

			const domain_mngr = await DomainGroupManager.construct({
				globals:this.globals,
				cards_container_obj:this.cards_container_obj, 
				add_card_to_dom_cb:this.add_groupcard_to_panel_cb
			});

			// console.log('id to deleteeeeeeeeeeeeeeeeee', this.id, this.key);
			domain_mngr.deleteOneCard(this.id, this.key);

			//////////////////////////////////////////////////////////////////////////// close here
			this.removeDialog();

		}

		this.delete_btn = new TextButton({		
			globals:this.globals, 
			text:'Delete',
			class_list:'gray_btn_hover_darker',
			width:'55px',
			click_callback:deleteBtn
		});
		this.delete_btn.setStyles([['marginLeft', `${this.margins_thickness}px`]]);
		this.agd_btns_left.insertBefore(this.delete_btn.cont, this.title_input.cont);
	}

	setSaveUpdateBtnText = (new_text) => {
		this.save_group_btn.cont.innerText = new_text;
	}

	setSaveUpdateBtnStyles = (styles_arr) => {
		styles_arr.forEach(style => {
			this.save_group_btn.cont.style[style[0]] = style[1];
		});
	}

	append = () => {
		window.requestAnimationFrame(() => {

			this.showDialog();

			this.setContHeight();
			this.scroll.resetAll();

			this.url_arr.forEach(item => {
				item.image.ctx.stroke();
				item.image.setAsNormal();
				// console.log('didit');
			});

			this.addbtn_image.ctx.stroke();
			this.addbtn_image.setAsNormal();
		});
	}

	deleteRow = (row_obj) => {

		// make sure there is always 1 left
		if (row_obj) {
			window.requestAnimationFrame(() => {
				this.scroll.removeItem(row_obj.cont);
				this.scroll.resetAll();

				// clear out old one
				let new_arr = [];
				this.url_arr.forEach(item => {
					if (item !== row_obj) {
						new_arr.push(item);
					}

					this.url_arr = new_arr;
				});
			});
		}
	}

	appendOneUrlRowCb = () => {
		this.appendOneUrlRow();
	}

	appendOneUrlRow = (url) => {

		window.requestAnimationFrame(() => {
			let a_row = new UrlInputAndBtn2({globals:this.globals, parent_obj:this});
			// a_row.cont.style.marginTop = `${this.margins_thickness}px`;
			a_row.setContStyles([['marginTop', `${this.margins_thickness}px`]]);

			if (url) {
				a_row.input.cont.value = url;
			}

			this.scroll.addItem(a_row.cont);
			this.url_arr.unshift(a_row);
		});
	}

	packageNewGroupData = () => {
		let is_empty = true;

		let title = this.title_input.cont.value;
		if (title !== '') {
			is_empty = false;
		}

		let domains_arr = [];

		this.url_arr.forEach(item => {
			let addit = item.input.cont.value;
			if (addit !== '') {
				is_empty = false;
				domains_arr.unshift(addit);
			}
		});

		if (is_empty) {
			return null;
		}

		// states are s===selected, d===deselected, e===excluded
	  let result = {
	  	title:title,
	  	selected:true,
	  	urls:domains_arr
	  }

	  return result;
	}

	saveGroup = async () => {
		let data_pack = this.packageNewGroupData(); 
		// console.log('data_pack', data_pack);

		if (data_pack) {
			// console.log('**** saving new card 1', data_pack);
			// domaingroupmanager loads all domain group ids    {cards_container_obj=null, add_card_to_dom_cb=null}
			const domain_mngr = await DomainGroupManager.construct({
				globals:this.globals,
				cards_container_obj:this.cards_container_obj, 
				add_card_to_dom_cb:this.add_groupcard_to_panel_cb
			});

			if (domain_mngr === null) {
				// console.log('**** saving new card 2', data_pack);
				// file is missing, make it
				this.add_groupcard_to_panel_cb(null);
				return;
			}

			// save new group if no ide is present here
			if (this.id === null) {
				// console.log('**** saving new card 3', data_pack);
				await domain_mngr.addNewGroup(data_pack);
			} else {
				// console.log('**** saving new card 4', data_pack);
				this.card.setTitle(data_pack.title);
				await domain_mngr.updateGroup(data_pack, this.id);
			}
		}
	}
}