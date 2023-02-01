import { makeElement, appendAnimStyles, Component, setPermStyles, appendMultiple, roundToTwo } from './utils.js';

export class ScrollBar extends Component {
	constructor({
								globals=null, 
								end_blocks=false,
								start_block_length=null,
								end_block_length=null,
								id='', 
								side='', 
								track_thickness='', 
								track_styles=[], 
								bar_styles=[], 
								anim_styles={
									subclass_name: '',
									bar_normal: '',
									bar_hover: '',
									bar_active: ''
								},
								container=null,
								container_class=null,
								scroll_cont=null, 
								scroll_drawer=null,
								scroll_hides=false,
								disable_wheel=false,
								scroll_drawer_padding=null
							}={}) {

		super(globals);
		this.id = id;

		this.scroll_drawer_padding = scroll_drawer_padding;

		this.container_class = container_class;

		this.init_now = true;
		this.start_block_length = start_block_length;
		this.end_block_length = end_block_length;

		this.is_vertical = null;
		this.length_side = null;
		this.bar_ends_start = null;
		this.drag_dir = null;
		this.width_side = null;
		if (side === 'left' || side === 'right') {
			this.is_vertical = true;
			this.length_side = 'height';
			this.width_side = 'width';
			this.bar_ends_start = 'top';
			this.bar_ends_end = 'bottom';
			this.drag_dir = 'y';
			this.cont_flex_dir = 'column';
		} else {
			this.is_vertical = false;
			this.length_side = 'width';
			this.width_side = 'height';
			this.bar_ends_start = 'left';
			this.bar_ends_end = 'right';
			this.drag_dir = 'x';
			this.cont_flex_dir = 'row';
		}


		this.side = side;

		this.scrollcont_at_start = null;
		this.scrollcont_at_stop = null;
		if (this.side === 'left' || this.side === 'top') {
			this.scrollcont_at_start = true;
		} else {
			this.scrollcont_at_stop = false;
		}

		this.track_thickness = track_thickness;
		this.container = container; // container for this scrollbar and the below scroll_cont

		this.scroll_cont = scroll_cont;
		this.scroll_drawer = scroll_drawer;
		// this.getTrackLength(this.container);
		this.drawer_loc = 0; 
		this.bar_pos = 0;
		this.scroll_hides = scroll_hides;
		this.disable_wheel = disable_wheel;
		this.wheel_mult = 20;
		this.track_click_bar_move_overshoot = 5;

		this.x = null;
		this.y = null;

		this.bar_is_hovering = false;
		this.bar_is_active = false;


		let cont_styles = [['display', 'flex'], ['flexDirection', this.cont_flex_dir]];

		// these are added at the end of the param arrays by similar name
		if (this.is_vertical === true) {
			cont_styles = cont_styles.concat([['height', '100%'], ['width', track_thickness]]);
			track_styles = track_styles.concat([['position', 'relative'], ['height', '100%'], ['width', '100%']]);
			bar_styles = bar_styles.concat([['position', 'absolute'], ['height', '25%'], ['width', '100%']]);
		} else {
			cont_styles = cont_styles.concat([['width', '100%'], ['height', track_thickness]]);
			track_styles = track_styles.concat([['position', 'relative'], ['width', '100%'], ['height', '100%']]);
			bar_styles = bar_styles.concat([['position', 'absolute'], ['width', '25%'], ['height', '100%']]);
		}


		// create container pieces for end blocks 
		// console.log('cont styles', cont_styles);
		this.cont = makeElement({
			type:'div', 
			styles:cont_styles
		});

		this.track_styles = track_styles;
		this.bar_styles = bar_styles;

		// create track element
		this.track = makeElement({type:'div', styles:this.track_styles});

		// create bar element
		this.bar = makeElement({type:'div', styles:this.bar_styles});
		// bar.setAttribute('_parent_obj', this.id);

		// for hover / active background colors

		this.bar_classname = 'scrollbar';
		this.bar_normal = null;
		this.bar_hover = null;
		this.bar_active = null;

		if (anim_styles !== undefined) {

			if (anim_styles.subclass_name !== undefined && anim_styles.subclass_name !== '') {
				this.bar_classname += `_${anim_styles.subclass_name}`;
			}

			if (anim_styles.bar_normal !== undefined && anim_styles.bar_normal !== '') {
				this.bar_normal = anim_styles.bar_normal;
				this.bar.style.backgroundColor = this.bar_normal;
			}

			if (anim_styles.bar_hover !== undefined && anim_styles.bar_hover !== '') {
				this.bar_hover = anim_styles.bar_hover;
			}

			if (anim_styles.bar_active !== undefined && anim_styles.bar_active !== '') {
				this.bar_active = anim_styles.bar_active;
			}

		}


		//------------ Listeners

		// hover
		if (this.bar_hover !== null && this.bar_hover !== undefined) {
			this.bar.addEventListener('mouseenter', (event) => {
					this.bar_is_hovering = true;
					this.bar.style.backgroundColor = this.bar_hover;
				
			});

			this.bar.addEventListener('mouseleave', (event) => {
					this.bar_is_hovering = false;

					if (!this.bar_is_active) {
						this.bar.style.backgroundColor = this.bar_normal;
					}
			});
		}

		///////////////////////////////////////////////////////////////////////////////////////////////// refactor for new listener
		// this.bar.addEventListener('mousedown', (event) => {
		// 	event.preventDefault();

		// 	this.bar_is_active = true;

		// 	// managing :active color here due to need of preventDefault above to prevent cross element / event pollution 
		// 	if (this.bar_active !== null) {
		// 		this.bar.style.backgroundColor = this.bar_active;
		// 	}

		// 	this.x = event.clientX;
		// 	this.y = event.clientY;

		// 	// console.log('init click xy',this.x,this.y);
		// 	this.global_drag_listener.setDragging(this);

		// });


		this.container.addEventListener('wheel', (event) => {

			if (!this.disable_wheel) {
				this.resetBoundingRects();

				let amt = 0;
	      // event.preventDefault();
	      if (event.wheelDelta > 0) {
	        amt -= 1;
	      } else {
	        amt += 1;
	    	}

	    	let bar_percent = this.barPercentOfTrack();
	    	// console.log('bar_percent', bar_percent);

	    	amt *= this.wheel_mult * bar_percent;

	    	this.moveBar(amt, false);

	    	// this.setScrolledAreaFromBar();
			}
		});

		this.track.addEventListener('click', (event) => {

			if (event.target === this.track) {
				this.resetBoundingRects();
				this.trackClickSetsBar(event, false);
			}
		});

		this.track.appendChild(this.bar);


		// if there are end blocks, we insert them
		this.start_block = null;
		this.end_block = null;

		if (end_blocks === true) {
			this.start_block = makeElement({
				type:'div', 
				styles:[
					[this.length_side, this.start_block_length],
					[this.width_side, '100%'],
					['background', this.globals['global_styles']['panel_dark_bg']]
				]
			});
			// this.start_block.addEventListener('click', (event) => {
			// 	console.log('block click');
			// 	this.trackClickSetsBar(event, true);
			// });

			this.end_block = makeElement({
				type:'div', 
				styles:[
					[this.length_side, this.end_block_length],
					[this.width_side, '100%'],
					['background', this.globals['global_styles']['panel_dark_bg']]
				]
			});
			// this.end_block.addEventListener('click', (event) => {
			// 	console.log('block click');
				
			// });

			this.cont.addEventListener('click', (event) => {
				// console.log('cont click'); // clicks on adjacent edges sometimes fall thru to the cont... webview err
				this.trackClickSetsBar(event, true);
			})

			this.track.style[this.length_side] = null;
			this.track.style.flexGrow = '1';

			appendMultiple(this.cont, [this.start_block, this.track, this.end_block]);
		} else {
			// append without blocks
			this.cont.appendChild(this.track);
		}



		// if (this.bar_classname !== '') {
		// 	this.bar.classList = this.bar_classname;
		// }


		// set sizes and append

		this.globals['global_screen_resize'].addToUpdater(this);
		this.makeDragable(this.bar);

		this.resetBoundingRects();
		this.setBarSize();

		// console.log('track:', this.container_size.bottom, 'bar:', this.bar_size.bottom);
	}

	setBarStyles = (style_arr) => {
		style_arr.forEach(style => {
			this.bar.style[style[0]] = style[1];
		});
	}

	screenResizeUpdate = () => {

		let start_scrollarea_loc_percent = this.bar_pos / this.getEmptyTracklength();
		this.resetBoundingRects();
		// percent is "the way down" for the bar, and "the way up" for drawer

		this.setBarSize();
		this.resetBoundingRects();

		this.forceBarPosWithPercent(start_scrollarea_loc_percent);

	}

	// roundToTwo = (num) => {
	// 	return Number.parseInt(num * 100) / 100;
	// }	

	forceContainerNotSmall = () => {
		this.resetBoundingRects();

		if (this.length_side === 'height') {
			if (this.container_size[this.length_side] < this.bar_size[this.width_side] * 2) {
				// console.log('high smoosh');
				this.container.style.minHeight = `${this.bar_size[this.width_side] * 2}px`;
			}
		} else {
			if (this.container_size[this.length_side] < this.bar_size[this.length_side]) {
				// console.log('wide smoosh');
				this.container.style.minWidth = `${this.bar_size[this.length_side]}px`;
			}
		}

	}

	forceBarPosWithPercent = (percent) => {
		if (percent > 1) {
			percent = 1;
		}

		let travelable_area = this.track_size[this.length_side] - this.bar_size[this.length_side];
		let new_bar_pos = travelable_area * percent;

		// once number gets tiny, the next step delivers NaN if we don't adjust it first
		if (!new_bar_pos || new_bar_pos < 0) {
			new_bar_pos = 0;
		}

		this.bar_pos = new_bar_pos;
		this.bar.style[this.bar_ends_start] = `${roundToTwo(this.bar_pos)}px`;

		this.setScrolledAreaFromBar();
		this.forceContainerNotSmall();
		// console.log('did it',new_bar_pos);

	}


	barPercentOfTrack = () => {
		return this.bar_size[this.length_side] / this.track_size[this.length_side];
	}

	clickWasInsideEnds = (click) => {
		return click[this.drag_dir] < this.track_size[this.bar_ends_end] && click[this.drag_dir] > this.track_size[this.bar_ends_start];
	}

	clickWasNotInsideBar = (click) => {
		return click[this.drag_dir] > this.bar_size[this.bar_ends_end] || click[this.drag_dir] < this.bar_size[this.bar_ends_start];
	}

	trackClickSetsBar = (event, blocks_clicked) => {

		this.resetBoundingRects();

		let click = {
			x: event.clientX,
			y: event.clientY
		}

		if ((blocks_clicked && this.clickWasNotInsideBar(click)) || (this.clickWasInsideEnds(click) && this.clickWasNotInsideBar(click))) {
			// clickable regions were clicked
		
			let bar_pos = this.bar_pos;
			let bar_height = this.bar_size.height;

			let clicked_before = (click[this.drag_dir] - this.track_size[this.bar_ends_start]) - this.bar_pos < 0;

			let new_bar_pos = -1;

			if (clicked_before) {
				new_bar_pos = click[this.drag_dir] - this.track_size[this.bar_ends_start] - this.track_click_bar_move_overshoot;
				if (new_bar_pos < 0 || new_bar_pos <= this.track_click_bar_move_overshoot /* * 1.8 */ ) {
					new_bar_pos = 0;
				}
			} else {
				new_bar_pos = click[this.drag_dir] - this.track_size[this.bar_ends_start] + this.track_click_bar_move_overshoot;
				if (new_bar_pos > this.track_size[this.length_side] || new_bar_pos >= this.track_size[this.length_side] - (this.track_click_bar_move_overshoot /* * 1.8 */ )) {
					new_bar_pos = this.track_size[this.length_side];
				}
				new_bar_pos = new_bar_pos - this.bar_size[this.length_side];
			}

			this.bar_pos = new_bar_pos;
			this.bar.style[this.bar_ends_start] = `${roundToTwo(this.bar_pos)}px`;
			this.setScrolledAreaFromBar();
		}

	}

	firstClickAndCurrMouseDiff = (event) => {
		// console.log(event.pos[this.drag_dir]);
		return this[this.drag_dir] - event.pos[this.drag_dir];
	}

	// barPosPercentOfMovableArea = () => {
	// 	// 1 is start, 0 is end
	// 	let movable_length = (1 - this.barPercentOfTrack());
	// 	return (this.getEmptyTracklength() - this.bar_pos) / this.getEmptyTracklength();
	// }

	// scrollAreaMaxMovableLen = () => {
	// 	return this.scrolldrawer_size[this.length_side] - this.container_size[this.length_side];
	// }

	getBarPosFromStyle = () => {
		return Number.parseFloat(this.bar.style[this.bar_ends_start].replace('px', ''));
	}

	setScrolledAreaFromBar = () => {

		// console.log(this.getBarPosFromStyle());

		let movable_length = (1 - this.barPercentOfTrack());
		let barPosPercentOfMovableArea = (this.getEmptyTracklength() - this.getBarPosFromStyle()) / this.getEmptyTracklength();
		let scrollAreaMaxMovableLen = this.scrolldrawer_size[this.length_side] - this.container_size[this.length_side];

		let new_scrolledarea_pos = scrollAreaMaxMovableLen - (scrollAreaMaxMovableLen * barPosPercentOfMovableArea);
		// console.log(new_scrolledarea_pos);
		this.scroll_drawer.style[this.bar_ends_start] = `-${roundToTwo(new_scrolledarea_pos)}px`;
	}

	drawerIsLarger = () => {
		// console.log('cont',this.container_size[this.length_side], 'drawer', this.scrolldrawer_size[this.length_side]);
		return this.scrolldrawer_size[this.length_side] > this.container_size[this.length_side];
	}

	resetBoundingRects = () => {
		this.container_size = this.container.getBoundingClientRect();
		this.scrollcont_size = this.scroll_cont.getBoundingClientRect();
		this.scrolldrawer_size = this.scroll_drawer.getBoundingClientRect();
		this.bar_size = this.bar.getBoundingClientRect();
		this.track_size = this.track.getBoundingClientRect();
	}

	getEmptyTracklength = () => {
		return this.track_size[this.length_side] - this.bar_size[this.length_side];
	}

	moveBar = (amt, move_is_done) => {

		let new_pos = this.bar_pos + amt;
		let empty_track_len = this.getEmptyTracklength();

		// console.log('empty:', empty_track_len);

		// console.log('');

		if (new_pos < 0) {
			new_pos = 0;
		} 
		else if (new_pos > empty_track_len) {
			new_pos = empty_track_len;
		}
		this.bar.style[this.bar_ends_start] = `${roundToTwo(new_pos)}px`;

		if (move_is_done === false) {
			this.bar_pos = new_pos;
			// this.setScrolledAreaFromBar();
		}
		this.setScrolledAreaFromBar();
	}

	startDragEvent = (event) => {
		if (this.otherIsNotDragging()) {
			this.bar_is_active = true;

			// managing :active color here due to need of preventDefault above to prevent cross element / event pollution 
			if (this.bar_active !== null) {
				this.bar.style.backgroundColor = this.bar_active;
			}

			this.x = event.pos.x;
			this.y = event.pos.y;

		}
	}

	moveDragEvent = (event) => {
		this.receiveDragEvent(event);
	}

	stopDragEvent = (event) => {
		if (this.otherIsNotDragging()) {
			this.receiveDragEvent(event);
		}
	}

	receiveDragEvent = (event) => {
		this.resetBoundingRects();

		if (event.moved) {
			let amt = this.firstClickAndCurrMouseDiff(event);
		
			// correct for the dir we are using here
			if (amt <= 0) {
				amt = Math.abs(amt);
			} else {
				amt = -amt;
			}

			this.moveBar(amt, event.dragging);

		}

		if (event.dragging === false) {

			this.bar_is_active = false;

			// managing :active color here due to need of preventDefault above to prevent cross element / event pollution 
			if (this.bar_active !== null) {
				if (this.bar_is_hovering === false) {
					this.bar.style.backgroundColor = this.bar_normal;
				} else {

					if (this.bar_is_hovering) {
					this.bar.style.backgroundColor = this.bar_hover;

					} else {
						this.bar.style.backgroundColor = this.bar_normal;
					}
				}
			}
		}
	}


	barCanMoveUp = () => {
		this.resetBoundingRects();
		return this.scrollcont_size[this.bar_ends_start] > Number.parseInt(this.scrolldrawer_size[this.bar_ends_start]);
	}

	barCanMoveDown = () => {
		this.resetBoundingRects();
		return Number.parseInt(this.scrolldrawer_size[this.bar_ends_end]) > this.scrollcont_size[this.bar_ends_end];
	}

	registerExternalDragInitiator = (element, action) => {
		this.external_drag_initiator = element;
		this.external_drag_action = action;
	}

	startExternalDrag = () => {
		this.globals['anim_loop'].startTick(this.externalDragItemMovesBar);
	}

	stopExternalDrag = () => {
		this.globals['anim_loop'].stopTick(this.externalDragItemMovesBar);
	}

	externalDragItemMovesBar = (delta) => {
		this.resetBoundingRects();
		
		// while this fn is called, dragged item MUST still be in global_drag or this fails
		this.globals['global_drag'].drag_target.resetBoundingRects();
		this.globals['global_drag'].drag_target.checkCardCrossing();

		let amt = 0;
		let percent_speed = 0;

		if (this.external_drag_action === 'upward') {
			amt -= (delta * 0.1) * this.external_drag_initiator.getCardIsAbovePercent(this.external_drag_initiator.click_y);
		} else {
      amt += (delta * 0.1) * this.external_drag_initiator.getCardBelowPercent(this.external_drag_initiator.click_y);
  	}

  	let bar_percent = this.barPercentOfTrack();

  	amt *= this.wheel_mult * bar_percent; // * this.external_drag_initiator.animloop_speed;
  	this.moveBar(amt, false);
  	this.external_drag_initiator.forceCardUnderMouse();
	}

	appendTrackIfNotPresent = () => {
		if (!this.container.contains(this.cont)) {
			if (this.scrollcont_at_start) {
				this.container.insertBefore(this.cont, this.container.firstChild);
			} else {
				this.container.appendChild(this.cont);
			}
			this.forceBarPosWithPercent(0);
		}
	}

	ensureBarNotTiny = (bar_length) => {
		if (bar_length < this.bar_size[this.width_side] * 2) {
			bar_length = this.bar_size[this.width_side] * 2;
		}

		return bar_length;
	}

	setBarSize = () => {
		if (this.scrolldrawer_size[this.length_side] > this.container_size[this.length_side]) {
			// append track if not present
			this.appendTrackIfNotPresent();
			this.removeScrollIsGonePadding();

			if (this.scroll_hides) {
				this.track.style.visibility = 'visible';
			} 

			let percent = this.container_size[this.length_side] / this.scrolldrawer_size[this.length_side];
			if (this.init_now) {
				// console.log('init now');
				this.forceBarPosWithPercent(0);
				this.init_now = false;
			}
			let bar_length = this.track_size[this.length_side] * percent;

			// ensure it doesn't get tiny
			bar_length = this.ensureBarNotTiny(bar_length);

			this.bar.style[this.length_side] = `${roundToTwo(bar_length)}px`;
		} else {
			if (this.container.contains(this.track)) {
				this.hideBar();
			} else {
				if (this.scroll_hides) {
					this.track.style.visibility = 'hidden';
					this.appendTrackIfNotPresent();
				}
			}
		}
	}

	hideBar = () => {
		if (this.scroll_hides) {
			this.track.style.visibility = 'hidden';
		} else {
			this.addScrollIsGonePadding();
			this.container.removeChild(this.cont);
			this.scroll_drawer.style.top = '0px'; /////////////////// possibly breaks scrolls other than dialog?
		}
	}

	barIsVisible = () => {
		this.resetBoundingRects();
		return this.drawerIsLarger();
	}

	addScrollIsGonePadding = () => {
		this.scroll_drawer.style.paddingRight = `${this.scroll_drawer_padding}px`;
		// console.log('added margin right');
	}

	removeScrollIsGonePadding = () => {
		this.scroll_drawer.style.paddingRight = null;
		// console.log('removed margin right');
	}
}