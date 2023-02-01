import { makeElement, appendAnimStyles, Component, setPermStyles, appendMultiple, roundToTwo } from './utils.js';

export class Slider extends Component {
	constructor({
								globals=null, 
								is_vertical=false, 
								container=null, 
								id=null,
								anim_styles={
									handle_col_normal: '',
									handle_col_hover: '',
									handle_col_active: ''
								}
							}={}) {

		super(globals);

		this.slider_percent = null;

		this.id = id;
		this.is_vertical = is_vertical;
		this.container = container;
		this.track_thickness = '6px';
		this.handle_height_mid = 11;
		this.handle_width_mid = 5;
		this.track_mid = 3;
		this.track_margins = '8px';
		this.handle_width = '10px';
		this.handle_height = `${this.globals['global_styles']['input_height']}px`;
		this.track_length = '100%';
		this.wheel_mult = 4;

		this.init_click_offset = 0;

		this.handle_col_normal = null;
		this.handle_col_hover = null;
		this.handle_col_active = null;

		this.handle_is_hovering = false;
		this.handle_is_moving = false;
		this.handle_is_active = false;

		if (anim_styles !== null && anim_styles !== undefined) {
			this.handle_col_normal = anim_styles.handle_col_normal;
			this.handle_col_hover = anim_styles.handle_col_hover;
			this.handle_col_active = anim_styles.handle_col_active;
		}


		let cont_padding = null;

		if (this.is_vertical === true) {
			cont_padding = ['padding', `${this.track_margins} 0`];
			this.length_side = 'height';
			this.width_side = 'width';
			this.bar_ends_start = 'top';
			this.bar_ends_end = 'bottom';
			this.drag_dir = 'y';
			this.cont_flex_dir = 'column';
		} else {
			cont_padding = ['padding', `0 ${this.track_margins}`];
			this.is_vertical = false;
			this.length_side = 'width';
			this.width_side = 'height';
			this.bar_ends_start = 'left';
			this.bar_ends_end = 'right';
			this.drag_dir = 'x';
			this.cont_flex_dir = 'row';
		}

		this.cont = makeElement({
			type:'div',
			styles:[
				[this.width_side, '100%'],
				['flexGrow', '1'],
				['display', 'flex'],
				cont_padding,
				['flexDirection', this.cont_flex_dir],
				['alignItems', 'center']
			]
		});

		this.cont.addEventListener('mouseup', (event) => {

			if (this.otherIsNotDragging()) {
				
				this.resetBoundingRects();
				let event_converted = this.convertEventToDragEvent(event);
				let target = event.target.getAttribute('_dragable');

				if (event.target.getAttribute('_dragable') === null) {
					this.placeHandleOnce(event_converted);
				}

				if (!this.handle_is_moving && target !== null) {
					// add in the init click offset here because we are directly on top
					// of the handle
					event_converted.pos[this.drag_dir] += this.init_click_offset;
					this.placeHandleOnce(event_converted);
				}

				this.init_click_offset = 0;
			}

		});

		this.cont.addEventListener('wheel', (event) => {
			this.resetBoundingRects();
			this.testpos = this.getTrackStartToHandleCenterOffset();

      // event.preventDefault();
      if (event.wheelDelta > 0) {
        this.testpos += this.wheel_mult;
      } else {
        this.testpos -= this.wheel_mult;
    	}

    	this.placeHandleOnce(this.offsetToFakeEvent(this.testpos));

		});

		this.track = makeElement({
			type:'div',
			styles:[
				[this.width_side, this.track_thickness],
				['flexGrow', '1'],
				['position', 'relative'],
				['borderRadius', '2px'],
				['background', this.globals['global_styles']['near_black_col2']],
			]
		});
		this.cont.appendChild(this.track);

		this.handle = makeElement({
			type:'div',
			styles:[
				[this.width_side, this.handle_height],
				[this.length_side, this.handle_width],
				['position', 'absolute'],
				['top', `-${this.handle_height_mid - this.track_mid}px`],
				['left', `-${this.handle_width_mid}px`],
				['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`],
				['background', this.handle_col_normal]
			]
		});

		if (this.handle_col_hover !== null && this.handle_col_hover !== undefined) {
			this.handle.addEventListener('mouseenter', (event) => {
				this.handle_is_hovering = true;

				if (!this.handle_is_active) {
					this.handle.style.backgroundColor = this.handle_col_hover;
				}
			});

			this.handle.addEventListener('mouseleave', (event) => {

				this.handle_is_hovering = false;

				if (!this.handle_is_active) {
					this.handle.style.backgroundColor = this.handle_col_normal;
				}
			});
		}

		this.makeDragable(this.handle);
		this.track.appendChild(this.handle);

		this.container.appendChild(this.cont);

		// this.globals['global_screen_resize'].addToUpdater(this);
		this.resetBoundingRects();

		this.placeHandleOnce(this.fakeClickFromPercent(0.33));

	}

	resetBoundingRects = () => {
		this.handle_size = this.handle.getBoundingClientRect();
		this.track_size = this.track.getBoundingClientRect();
	}

	convertEventToDragEvent = (event) => {
		return {
			pos: {
				x: event.clientX,
				y: event.clientY
			}
		}
	}

	offsetToFakeEvent = (fake_event) => {
		let result = fake_event + this.track_size[this.bar_ends_start];

		return {
			pos: {
				x: result,
				y: result
			}
		}
	}

	startDragEvent = (event) => {
		this.handle_is_active = true;
		this.resetBoundingRects();

		// managing :active color here due to need of preventDefault above to prevent cross element / event pollution 
		if (this.handle_col_active !== null) {
			this.handle.style.backgroundColor = this.handle_col_active;
		}

		let click = this.getClick(event);

		this.init_click_offset = this.getClickToTrackStartOffset(click) - this.getTrackStartToHandleCenterOffset();

	}

	moveDragEvent = (event) => {
		this.handle_is_moving = true;
		this.resetBoundingRects();
		this.placeHandleOnce(event);

	}

	stopDragEvent = (event) => {
		this.resetBoundingRects();

		this.init_click_offset = 0;

		// this.placeHandleOnce(event);

		if (this.handle_is_hovering) {
			this.handle.style.backgroundColor = this.handle_col_hover;
		} else {
			this.handle.style.backgroundColor = this.handle_col_normal;
		}
		this.handle_is_active = false;
		this.handle_is_moving = false;
	}

	placeHandleOnce = (event) => {

		// event must be in {pos:{x:1, y:4}} format

		let final_pos = event.pos[this.drag_dir] - this.track_size[this.bar_ends_start] - this.handle_width_mid  - this.init_click_offset;

		// deal with overshoot
		if (final_pos < 0 - this.handle_width_mid) {
			final_pos = 0  - this.handle_width_mid;
		}
		else if (final_pos > this.getTrackLength() - this.handle_width_mid) {
			final_pos = this.getTrackLength()  - this.handle_width_mid;
		}

		// update
		this.handle.style[this.bar_ends_start] = `${final_pos}px`;

		this.resetBoundingRects();

		this.slider_percent = roundToTwo(this.getHandlePosAsPercent() * 100);
	}

	fakeClickFromPercent = (percent) => {
		let click = roundToTwo(percent * this.track_size[this.length_side]) + this.track_size[this.bar_ends_start];
		
		return {
			pos: {
				x: click,
				y: click
			}
		}
	}

	bindClickToTravelableArea = (click) => {
		if (this.clickIsAbove(click)) {
			click = this.track_size[this.bar_ends_end];
		}
		else if (this.clickIsBelow(click)) {
			click = this.track_size[this.bar_ends_start];
		}

		return click;
	}

	resetBoundingRects = () => {
		this.track_size = this.track.getBoundingClientRect();
		this.handle_size = this.handle.getBoundingClientRect();
	}

	clickedInTravelableArea = (click) => {
		return click >= this.track_size[this.bar_ends_start] && click <= this.track_size[this.bar_ends_end];
	}

	getClick = (event) => {
		return event.pos[this.drag_dir];
	}

	clickIsBelow = (click) => {
		return click < this.track_size[this.bar_ends_start];
	}

	clickIsAbove = (click) => {
		return click > this.track_size[this.bar_ends_end];
	}

	getTrackStartToHandleCenterOffset = () => {
		return this.handle_size[this.bar_ends_start] - this.track_size[this.bar_ends_start] + this.handle_width_mid;
	}

	getClickToTrackStartOffset = (click) => {
		// click is either the y or x data, depending on direction
		return click - this.track_size[this.bar_ends_start];
	}

	getTrackLength = () => {
		return this.track_size[this.bar_ends_end] - this.track_size[this.bar_ends_start];
	}

	getHandlePosAsPercent = () => {
		return this.getTrackStartToHandleCenterOffset() / this.getTrackLength();
	}

	screenResizeUpdate = () => {
		this.resetBoundingRects();
	}
}