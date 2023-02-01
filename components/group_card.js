import { makeElement, appendAnimStyles, Component, setPermStyles, appendMultiple, roundToTwo } from './utils.js';
import { DomainGroupManager } from './engine/DomainGroupManager.js';

export class GroupCard extends Component {
	constructor({globals=null, container_object=null, title=null, domain_group_id=null, hasSettings=true, selected=true, card_type=null}={}) {
		super(globals);
		this.container_object = container_object;
		this.height = 40;
		this.too_high_amt = this.height + 10;

		this.card_type = card_type;

		this.title_text = title;
		this.domain_group_id = domain_group_id;

		this.hasSettings = hasSettings;

		this.selected = selected;

		this.job_card_settings_btn_clicked_cb = null;

		this.selected_handle_class = 'blue_btn2';
		this.selected_settings_class = 'blue_btn3';
		this.selected_background = this.globals['global_styles']['blue_btn_darker2'];

		this.deselected_handle_class = 'gray_btn';
		this.deselected_settings_class = 'gray_btn3';
		this.deselected_background = this.globals['global_styles']['gray_btn_darker'];

		this.prior_animloop_call = null;
		this.curr_animloop_call = null;

		this.card_size = null;

		this.key = null;
		this.prev_top = null;
		this.prev_bot = null;

		this.slide_card = null;
		this.slide_card_target = null;

		this.halt = false;

		this.cont = makeElement({
			type:'div',
			styles:[
				['height', `${this.height}px`],
				['minWidth', '100%'],
				['position', 'absolute'],
				['overflow', 'hidden'],
				['background', this.selected_background],
				['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`]
			]
		});


		this.handle = makeElement({
			type:'div',
			styles:[
				['height', '17px'],
				['width', '100%'],			
				['paddingRight', '3px'],			
				['display', 'flex'],			
				['justifyContent', 'flex-end'],
				['alignItems', 'center']	
			],
			props:[['classList', this.selected_handle_class]]
		});
		this.makeDragable(this.handle);

		if (hasSettings) {
			this.settings = makeElement({
				type:'div',
				styles:[
					['width', '12px'],
					['height', '12px'],
					['borderRadius', '6px']
				],
				props:[['classList', this.selected_settings_class]]
			});

			if (this.card_type === 'GroupCard') {
				this.settings.addEventListener('click', (event) => {
					// console.log('GroupCard settings clicked');
					this.openGroupCardSettings(event)
				});
			}
			else if (this.card_type === 'JobCard') {
				this.settings.addEventListener('click', (event) => {
					this.job_card_settings_btn_clicked_cb();
				});
			}

			this.handle.appendChild(this.settings);
		}

		this.cont.appendChild(this.handle);

		this.title = makeElement({
			type:'div',
			props:[
				['innerText', this.title_text]
			],
			styles:[
				['width', '100%'],
				['overflow', 'hidden'],
				['position', 'relative'],
				['paddingTop', '4px'],
				['userSelect', 'none'],
				['pointerEvents', 'none'],
				['color', this.globals['global_styles']['text_area_col']],
				['fontFamily', 'arial'],
				['display', 'flex'],
				['justifyContent', 'center'],
				['alignItems', 'center'],
			]
		});
		this.cont.addEventListener('click', (event) => {
			if (event.target === this.cont) {
				// toggle selected

				this.toggleSelectionState();
			}
		});
		this.cont.appendChild(this.title);
		this.setSelectionState();
		///////////////// used by scroll container to determine when 
		///////////////// dragged items are on top, to move the underneath cards
	}

	setTitle = (new_title) => {
		this.title_text = new_title;
		this.title.innerText = new_title;
	}

	getTitle = () => {
		return this.title_text;
	}

	setId = (new_id) => {
		this.domain_group_id = new_id;
	}

	getId = () => {
		return this.domain_group_id;
	}

	toggleSelectionState = () => {
		if (this.selected === true) {
			this.deselect();
		} else {
			this.select();
		}

		this.reSaveAfterStateChange();
	}

	setSelectionState = () => {
		if (this.selected === true) {
			this.select();
		} else {
			this.deselect();
		} 
		
	}

	select = () => {
		this.selected = true;
		this.cont.style.background = this.selected_background;
		if (this.hasSettings) {
			this.settings.classList.add(this.selected_settings_class);
			this.settings.classList.remove(this.deselected_settings_class);
		}
		this.handle.classList.add(this.selected_handle_class);
		this.handle.classList.remove(this.deselected_handle_class);
	}

	deselect = () => {
		this.selected = false;
		this.cont.style.background = this.deselected_background;
		if (this.hasSettings) {
			this.settings.classList.add(this.deselected_settings_class);
			this.settings.classList.remove(this.selected_settings_class);
		}
		this.handle.classList.add(this.deselected_handle_class);
		this.handle.classList.remove(this.selected_handle_class);
	}


	setPrevTopBot = () => {
		if (this.card_size !== null) {
			this.prev_top = this.card_size.top;
			this.prev_bot = this.card_size.bottom;
		}
	}

	resetBoundingRects = () => {
		this.setPrevTopBot();
		this.card_size = this.cont.getBoundingClientRect();
		this.card_size.mid = this.card_size.bottom - (this.height/2);

		return this.card_size;
	}

	startDragEvent = (event) => {
		// console.log('default fn, start drag:', event);
		this.resetBoundingRects();
		
		this.throttle = Date.now();

		this.start_pos = this.getCardTop();
		this.first_click_offset = this.getFirstClickOffset(event.pos.y);
		this.cont.style.zIndex = '1';
		this.cont.style.boxShadow = '0 0 16px 8px #1E233065';

	}

	forceCardUnderMouse = () => {
		this.resetBoundingRects();
		this.cont.style.top = `${this.click_y - this.container_object.getDrawer2Top() - this.first_click_offset}px`;
	}

	slideUp = (delta) => {
		let new_top = this.slide_card_start - (delta * 0.5);

		if (new_top < this.slide_card_target) {
			this.slide_card.cont.style.top = `${this.slide_card_target}px`;
			this.globals['anim_loop'].stopTick(this.slideUp);
		} else {
			this.slide_card.cont.style.top = `${new_top}px`;
			this.slide_card_start = new_top;
		}
	}

	slideDown = (delta) => {
		let new_top = this.slide_card_start + (delta * 0.5);

		if (new_top > this.slide_card_target) {
			this.slide_card.cont.style.top = `${this.slide_card_target}px`;
			this.globals['anim_loop'].stopTick(this.slideDown);
		} else {
			this.slide_card.cont.style.top = `${new_top}px`;
			this.slide_card_start = new_top;
		}
	}

	checkCardCrossing = () => {
		this.container_object.cards_keys.forEach(key => {

			if (this.key !== key) {

				let cont_top = this.container_object.getCardsCont2Top();

				// calculating the offset to get top breaks this, don't do it until placing the cards
				let p_bot = this.prev_bot - cont_top; // these maths need to get added to parent
				let c_bot = this.card_size.bottom - cont_top; // these maths need to get added to parent

				// if we just crossed a card mid going downward
				if (p_bot - 1 < key && c_bot + 1 > key) {

					this.slideACard({key:key, type:'prev'});
				}

				let p_top = this.prev_top - cont_top; // these maths need to get added to parent
				let c_top = this.card_size.top - cont_top; // these maths need to get added to parent


				if (p_top + 1 > key && c_top - 1 < key) {

					this.slideACard({key:key, type:'next'});					
				}
			}
		});
	}

	slideACard = ({key=null, type=null/*'next', 'prev', 'target'*/, start=null, stop=null}={}) => {

		if (type === 'target') {

			let next_key = this.key;

			let slide_card2 = this;
			slide_card2.slide_card = this;
			slide_card2.slide_card_target = stop;
			slide_card2.slide_card_start = start;

			this.globals['anim_loop'].stopTick(slide_card2.slideUp);
			this.globals['anim_loop'].stopTick(slide_card2.slideDown);

			if (stop < start) {
				// going up
				this.globals['anim_loop'].startTick(slide_card2.slideUp);
			}
			else if (stop > start) {
				// going down
				this.globals['anim_loop'].startTick(slide_card2.slideDown);
			} else {
				// already there
				this.cont.style.top = `${this.start_pos}px`;
			}

			this.container_object.swapPlaces(key, next_key);

		} else {

			let next_key = this.container_object.cards[key][type];

			let slide_card2 = this.container_object.cards[key].card;
			slide_card2.slide_card = this.container_object.cards[key].card;
			slide_card2.slide_card_target = this.container_object.cards[next_key].top;
			slide_card2.slide_card_start = this.container_object.cards[key].top;

			// have to swap this independently or else it gets lost from the swap
			this.start_pos = this.container_object.cards[key].top;

			this.globals['anim_loop'].stopTick(slide_card2.slideUp);
			this.globals['anim_loop'].stopTick(slide_card2.slideDown);

			if (type === 'next') {
				this.globals['anim_loop'].startTick(slide_card2.slideDown);
			} else {
				this.globals['anim_loop'].startTick(slide_card2.slideUp);
			}

			this.container_object.swapPlaces(key, next_key);
		}
	}

	openGroupCardSettings = async (event) => {

		//////////////////////// for the other panels, this needs to be a setting in parent

		const domain_mngr = await DomainGroupManager.construct({globals:this.globals,cards_container_obj:this.container_object});
		// console.log(domain_mngr);
		let urls_arr = domain_mngr['domain_groups'][this.domain_group_id]['urls']
		// console.log('thing', urls_arr);
		let result = {
	  	title:this.title_text,
	  	selected:this.selected,
	  	id:this.domain_group_id,
	  	key:this.key,
	  	urls:urls_arr,
	  	card_obj:this
	  }
	  // console.log(result);
	  this.container_object.openCardSettingsDialog(result, event);
	}

	moveDragEvent = (event) => {

		// let new_throttle = Date.now();
		// // throttle
		// if (new_throttle - this.throttle >= 16) {
		// 	this.throttle = new_throttle;


			this.click_y = event.pos.y;

			this.resetBoundingRects();

			// as we are dragged, we check for crossings of other cards to init animations
			this.checkCardCrossing();

			let drawer2_top = this.container_object.getDrawer2Top();
			let cont_top = this.container_object.getCardsContTop();

			this.cont.style.top = `${event.pos.y - drawer2_top - this.first_click_offset}px`;

			this.hold_loc = event.pos.y - drawer2_top - this.first_click_offset;

			let card_above_percent = this.getCardIsAbovePercent(event.pos.y);
			let card_below_percent = this.getCardBelowPercent(event.pos.y);

			// if bar can go up, pass the speed to the anim loop to anim
			if (card_above_percent > 0 && this.container_object.scroll.barCanMoveUp()) {
				// only go when the indicator changes
				if (this.prior_animloop_call !== 'upward') {
					this.prior_animloop_call = 'upward';
					this.container_object.scroll.registerExternalDragInitiator(this, 'upward');
					this.container_object.scroll.startExternalDrag();
				}
			}
			else if (card_below_percent > 0 && this.container_object.scroll.barCanMoveDown()) {
				// only go when the indicator changes
				if (this.prior_animloop_call !== 'downward') {
					this.prior_animloop_call = 'downward';
					this.container_object.scroll.registerExternalDragInitiator(this, 'downward');
					this.container_object.scroll.startExternalDrag();
				}
			} else {
				// only go when the indicator changes
				if (this.prior_animloop_call !== 'cancel') {
					this.prior_animloop_call = 'cancel';
					this.container_object.scroll.registerExternalDragInitiator(this, 'cancel');
					this.container_object.scroll.stopExternalDrag();
				}
			}
		// }
	}

	stopDragEvent = (event) => {
		this.container_object.scroll.stopExternalDrag();
		this.resetBoundingRects();
		this.cont.style.zIndex = '0';
		this.cont.style.boxShadow = null;

		// get info for placing the dropped card
		let cont_top = this.container_object.getCardsCont2Top();
		let curr_top = this.card_size.top - cont_top;

		// if too far above, start off just above the top
		let too_high = this.card_size.top + this.too_high_amt;
		let too_low = this.container_object.scroll_drawer2.getBoundingClientRect().bottom;
		if (cont_top > too_high) {
			// set for too high
			curr_top = -this.too_high_amt;
			this.cont.style.top = `${curr_top}px`;
		}
		else if (this.card_size.top > too_low) {
			// set for too low
			curr_top = too_low - cont_top;
			this.cont.style.top = `${curr_top}px`;
		}

		// drop with an animation
		this.slideACard({key:this.key, type:'target', start:curr_top, stop:this.start_pos});	

		this.reSaveAfterStateChange();

	}

	reSaveAfterStateChange = async () => { 
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////
		if (this.card_type === 'GroupCard') {
			let domain_mngr = await DomainGroupManager.construct({globals:this.globals,cards_container_obj:this.container_object});
			domain_mngr.addNewGroup();
		}
		else if (this.card_type === 'JobCard') {
			// console.log('resaving job card loc is needed');
		}

	}

	getCardTop = () => {
		let cont_top = this.container_object.getCardsCont2Top();
		return this.card_size.top - cont_top;
	}

	getFirstClickOffset = (click_y) => {
		return click_y - this.card_size.top;
	}

	getCardIsAbovePercent = (click_y) => {
		let cont_top = this.container_object.getDrawerContTop();
		let top = cont_top - (click_y - this.first_click_offset);

		let result = 0;

		if (top > 0) {
			result = top / this.height;
			if (result > 1) {
				result = 1;
			}
		}

		return result;
	}

	getCardBelowPercent = (click_y) => {
		let cont_bot = this.container_object.getDrawerContBot();
		let bottom = (click_y - this.first_click_offset + this.height) - cont_bot;

		let result = 0;

		if (bottom > 0) {
			result = bottom / this.height;
			if (result > 1) {
				result = 1;
			}
		}

		return result;
	}

	packageFakeEvent = (event, moved, dragging) => {
		return {
			pos:{
				x:event.x,
				y:event.y
			},
			moved:moved,
			dragging:dragging
		};
	}
}

