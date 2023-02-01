import { makeElement, setPermStyles, Component } from "./utils.js";
import { ScrollBar } from './scrollbar.js';
import { GlobalScreenResizeUpdater } from './global_screen_resize_updater.js';
import { DomainGroupManager } from './engine/DomainGroupManager.js';
import { AddGroupDialog2 } from './add_group_dialog2.js';

export class ScrollVert extends Component {
	constructor({globals=null, scroll_side=null, start_block_length=null, end_block_length=null, test_contents=false, id=null, parent_obj=null}={}) {
		super(globals);
		this.id = id;
		this.scroll_side = scroll_side;

		this.parent_obj = parent_obj;

		this.scroll_drawer_padding = 7;
		this.card_swap_offset = null;

		this.card_settings_dialog = null;

		this.cards = {};
		this.cards_keys = new Set();
		this.prev_added_key = null;

		this.cont = makeElement({
			type:'div', 
			styles:[
				['display', 'flex'], 
				['width', '100%'], 
				['height', '100%']
			]
		});

		this.scroll_cont = makeElement({
			type:'div', 
			styles:[
				['display', 'flex'], 
				['position', 'relative'], 
				['height', '100%'], 
				['flexGrow', '1'], 
				['overflow', 'hidden']
			]
		});

		this.scroll_drawer = makeElement({
			type:'div', 
			styles:[
				['position', 'absolute'], 
				['width', '100%'], 
				// ['background', 'gray'],
				['minHeight', '100%'],
				['paddingLeft', `${this.scroll_drawer_padding}px`],
				['paddingTop', `${this.scroll_drawer_padding}px`]
			]
		});
		this.scroll_drawer2 = makeElement({
			type:'div',
			styles:[
				['position', 'relative'],
				['height', '100%'],
				['width', '100%']
			]
		});
		this.scroll_drawer.appendChild(this.scroll_drawer2);


		// if (test_contents === true) {
		// 	let thing1 = makeElement({
		// 		type:'div',
		// 		styles:[
		// 			['width', '30px'],
		// 			['marginTop', '10px'],
		// 			['height', '300px'],
		// 			['background', 'red']
		// 		]
		// 	});
		// 	let thing2 = makeElement({
		// 		type:'div',
		// 		styles:[
		// 			['width', '30px'],
		// 			['height', '300px'],
		// 			['background', 'brown']
		// 		]
		// 	});
		// 	let thing3 = makeElement({
		// 		type:'div',
		// 		styles:[
		// 			['width', '30px'],
		// 			['height', '300px'],
		// 			['background', 'purple'],
		// 			['marginBottom', '10px']
		// 		]
		// 	});
		// 	this.scroll_drawer2.appendChild(thing1);
		// 	this.scroll_drawer2.appendChild(thing2);
		// 	this.scroll_drawer2.appendChild(thing3);
		// }


		this.cont.appendChild(this.scroll_cont);
		this.scroll_cont.appendChild(this.scroll_drawer);

		this.scroll = new ScrollBar({
			globals: globals,
			scroll_drawer_padding:this.scroll_drawer_padding,
			end_blocks: true,
			start_block_length: start_block_length,
			end_block_length: end_block_length,
			side: this.scroll_side,
			track_thickness: this.globals['global_styles']['scroll_track_thickness'],
			// track_styles: [['background', '#455071']], 
			container: this.cont,
			container_class: this,
			scroll_cont: this.scroll_cont,
			scroll_drawer: this.scroll_drawer,
			test_contents:test_contents,
			anim_styles: {
				subclass_name: 'reds',
				bar_normal: this.globals['global_styles']['btn_gray_bg'],
				bar_hover: this.globals['global_styles']['btn_gray_hover'],
				bar_active: this.globals['global_styles']['btn_gray_hover']
			}
		});
	}

	setBarStyles = (styles_arr) => {
		this.scroll.setBarStyles(styles_arr);
	}




	openCardSettingsDialog = (card_data, event) => {
		if (this.card_settings_dialog === null) {
			// console.log('opening dialog for', card_data);

			let clickXY = {
				pos:{
					x:event.clientX,
					y:event.clientY
				}
			}

			let card = card_data.card_obj;

			this.card_settings_dialog = new AddGroupDialog2({
				globals:this.globals, 
				clickXY:clickXY, 
				cards_container_obj:this,
				nullify_this_in_parent_cb:this.nullifyAddDialog, 
				add_groupcard_to_panel_cb:this.parent_obj.addGroupCardToPanel,
				parent_cont:this.globals['pages_cont'],
				header_height:36, 
				header_bg:this.globals['global_styles']['body_bg_color_darker'],
				body_bg:this.globals['global_styles']['body_bg_color_darker'], 
				width:450,
				card:card
			});

			this.card_settings_dialog.addDeleteBtn();
			this.card_settings_dialog.setSaveUpdateBtnText('Update');

			// this.card_settings_dialog.save_group_btn.cont.innerText = 'Update';
			this.card_settings_dialog.save_group_btn.cont.style.minWidth = '55px';

			this.card_settings_dialog.title_input.cont.value = card_data.title;

			card_data.urls.forEach(item => {
				this.card_settings_dialog.appendOneUrlRow(item);
			});

			this.card_settings_dialog.id = card_data.id;
			this.card_settings_dialog.key = card_data.key;

			this.card_settings_dialog.append();
		}
	}

	nullifyAddDialog = () => {
		this.card_settings_dialog = null;
	}


	setContentContDrawerHeight = (card_height, num_childnodes) => {
		// console.log(1, this.drawer_height, card_height, num_childnodes);
		this.drawer_height = ((card_height + this.scroll_drawer_padding) * (num_childnodes + 1));
		this.scroll_drawer2.style.height = `${this.drawer_height}px`;
		// console.log(2, this.drawer_height);
	}

	getNumChildNodes = () => {
		return this.scroll_drawer2.childNodes.length;
	}


	addItem = (item) => {


		// console.log('%%%%%%%%%', this.cards);

		item.cont.style.marginBottom = `${this.scroll_drawer_padding}px`;

		// let item_size = item.cont.getBoundingClientRect();

		// this.cards.push(item);
		let num_childnodes = this.getNumChildNodes();

		// container size must be forced or else the container collapses due to to amny absolute positioned things ina  row,
		// this way the scroll bar shows
		let top = (item.height + this.scroll_drawer_padding) * num_childnodes;
		let bot = top + item.height;
		let mid = top + ((bot - top) / 2);

		item.cont.style.top = `${top}px`;
		item.cont.style.zIndex = '0';

		////////////////////////////////
		// this.drawer_height = (item.height + this.scroll_drawer_padding) * (num_childnodes);
		// this.scroll_drawer2.style.height = `${this.drawer_height}px`;
		//////////////////
		this.setContentContDrawerHeight(item.height, num_childnodes);
		///////////

		this.scroll_drawer2.appendChild(item.cont);

		// add to structs that keep track of mositional data for making it easy to bump them by dragged card
		// let item_size = item.resetBoundingRects();
		// if (this.card_swap_offset === null) {
		// 	this.card_swap_offset_orig = item_size.top;
		// 	this.card_swap_offset = item_size.top;
		// }
		// let top = item_size.top;
		// let mid = item_size.mid;
		// let bot = item_size.bottom;
		// let prev = this.cards.keys()[this.cards.keys().];

		if (this.prev_added_key !== null) {
			this.cards[this.prev_added_key]['next'] = mid;
		}

		let card_map = new Map();
		card_map['card'] = item;
		card_map['top'] = top;
		card_map['mid'] = mid;
		card_map['bot'] = bot;
		card_map['prev'] = this.prev_added_key;
		card_map['next'] = null;

		this.cards[mid] = card_map;
		this.cards_keys.add(mid);
		item.key = mid;

		// console.log('keys',this.cards);
		this.prev_added_key = mid;

		this.scroll.screenResizeUpdate();

		if (this.scroll.barIsVisible()) {
			this.scroll.removeScrollIsGonePadding();
		} else {
			this.scroll.addScrollIsGonePadding();
		}

	}

	addNewCard = (card) => {

		this.addItem(card);
		card.resetBoundingRects();
	}

	selectAll = () => {
		// console.log('cards', this.cards);
		this.cards_keys.forEach(key => {
			this.cards[key].card.select();
		});

		this.saveAllCardStates();
	}

	getFirstSelectedCard = () => {

		let found_selected = null;

		Object.keys(this.cards).every(key => {
			let curr = this.cards[key].card;
			// console.log('mmmmmmmmmmm',curr, curr.selected);
			if (curr.selected === true) {
				found_selected = curr;
				return false;
			}

			return true;
		});

		return found_selected;
	}

	deselectAll = () => {
		this.cards_keys.forEach(key => {
			this.cards[key].card.deselect();
		});

		this.saveAllCardStates();
	}

	saveAllCardStates = async () => {
		const domain_mngr = await DomainGroupManager.construct({
			globals:this.globals,
			cards_container_obj:this, 
			add_card_to_dom_cb:null
		});

		domain_mngr.addNewGroup();
	}

	resetBoundingRects = () => {
		this.scrolldrawer_size = this.scroll_drawer.getBoundingClientRect();
		this.scrolldrawer2_size = this.scroll_drawer2.getBoundingClientRect();
		this.scrollcont_size = this.scroll_cont.getBoundingClientRect();
	}

	getCardsCont2Top = () => {
		this.resetBoundingRects();
		return this.scrolldrawer2_size.top;
	}

	getCardsContTop = () => {
		this.resetBoundingRects();
		return this.scrolldrawer_size.top;
	}

	moveCardUpAnimLoop = (delta) => {
		let new_pos = this.moving_this_card_up.resetBoundingRects().top - (this.moving_card_speed * delta);

		if (new_pos < this.cards[this.move_key].top) {
			new_pos = this.cards[this.move_key].top;
			this.globals['anim_loop'].stopTick(this.moveCardUpAnimLoop);
		}

		this.moving_this_card_up.cont.style.top = `${new_pos}px`;
	}


	// getTargetTop = (prev_key) => {
	// 	return this.cards[prev_key].top - this.getContTop() - this.scroll_drawer_padding;
	// }

	swapPlaces = (first, second) => {
		// console.log('before', this.cards);

		let got_first_card = this.cards[first].card;
		got_first_card.key = second;

		let got_second_card = this.cards[second].card;
		got_second_card.key = first;

		// swap cards and keep pos data
		this.cards[first].card = got_second_card;
		this.cards[first].card.key = this.cards[first].mid; // this does get used later in animations / swaps
		this.cards[second].card = got_first_card;
		this.cards[second].card.key = this.cards[second].mid; // this does get used later in animations / swaps

		// console.log('after', this.cards);
	}

	getDrawerTop = () => {
		return this.scroll_drawer.getBoundingClientRect().top;
	}

	getDrawer2Top = () => {
		return this.scroll_drawer2.getBoundingClientRect().top;
	}

	getDrawerContTop = () => {
		return this.scroll_cont.getBoundingClientRect().top;
	}

	getDrawerContBot = () => {
		return this.scroll_cont.getBoundingClientRect().bottom;
	}

	removeItem = async (delete_id, delete_key) => {

		let delete_dom_key = null
		let last_key = null;
		// console.log('before delete', this.cards);
 

		let card_height = null;

		let iter_card = this.cards[delete_key];

		while (true) {
			// console.log('iterating in while::::', iter_card, iter_card.card.title_text);
			let key = iter_card.mid;
			let curr_id = this.cards[key].card.domain_group_id;

			if (card_height === null) {
				card_height = this.cards[key].card.height;
			}

			// delete out of dom while we still have it
			if (curr_id === delete_id) {
				delete_dom_key = key;
				this.scroll_drawer2.removeChild(this.cards[delete_key].card.cont);
			}

			// move next card to current place in this.cards
			if (delete_dom_key !== null && this.cards[key].next) {
				// console.log('moving next:',this.cards[key].next,'moving curr:',key);
				this.cards[key].card = this.cards[this.cards[key].next].card;
				this.cards[key].card.key = this.cards[key].mid;
				this.cards[key].card.cont.style.top = `${this.cards[key].top}px`;
			}

			// delete last one
			if (this.cards[key].next === null) {
				// console.log('got the last one', key);

				// if prev, null it's next
				if (this.cards[key].prev) {
					this.cards[this.cards[key].prev].next = null;
				}

				delete this.cards[key];
				this.cards_keys.delete(key);
			}

			if (iter_card.next !== null) {
				iter_card = this.cards[iter_card.next];

				if (!iter_card) {
					break;
				}
			} else {
				break;
			}
		}
		// do last one

		////// find in dom nums , move all, and delete last
		// this.cards_keys.forEach(key => {
		// 	let curr_id = this.cards[key].card.domain_group_id;

		// 	// get information
		// 	if (curr_id === delete_id) {
		// 		delete_dom_key = key;
		// 		// console.log('found card to delete', key);
		// 		this.scroll_drawer2.removeChild(this.cards[delete_dom_key].card.cont);
		// 	}

		// 	// move next card to current place in this.cards
		// 	if (delete_dom_key !== null && this.cards[key].next) {
		// 		// console.log('moving next:',this.cards[key].next,'moving curr:',key);
		// 		this.cards[key].card = this.cards[this.cards[key].next].card;
		// 		this.cards[key].card.key = this.cards[key].mid;
		// 		this.cards[key].card.cont.style.top = `${this.cards[key].top}px`;
		// 	}

		// 	// delete last one
		// 	if (this.cards[key].next === null) {
		// 		// console.log('got the last one', key);

		// 		// if prev, null it's next
		// 		if (this.cards[key].prev) {
		// 			this.cards[this.cards[key].prev].next = null;
		// 		}

		// 		delete this.cards[key];
		// 		this.cards_keys.delete(key);
		// 	}

		
		// });


		let num_childnodes = this.getNumChildNodes();
		this.setContentContDrawerHeight(card_height, num_childnodes - 1);

		this.scroll.screenResizeUpdate();

		// console.log('after delete', this.cards);

		// console.log('delte in scroll_vert', delete_id, delete_dom_key, this.cards, this.cards_keys);
	}

	setStylesAfterbarRemoved = () => {
		this.scroll_drawer.style.paddingRight = `${this.scroll_drawer_padding}px`;
	}

	removeAll = () => {
		while (this.scroll_drawer2.hasChildNodes()) {
			this.scroll_drawer2.removeChild(this.scroll_drawer2.firstChild);
		}
		this.cards = new Map();
		this.cards_keys = new Set();
		this.prev_added_key = null;

		let num_childnodes = this.getNumChildNodes();
		this.setContentContDrawerHeight(0);

		this.scroll.screenResizeUpdate();
	}

}