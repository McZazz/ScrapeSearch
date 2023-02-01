export class GlobalDragListener {
	constructor(globals) {
		this.globals = globals;
		this.id = 'global_drag_listener';

		this.just_started = false;

		this.drag_id = null;
		this.drag_target = null;
		this.moved = false;
		this.pos = {x:0,y:0}; // window event listener mosuemove, clientX and clientY === entire screen mousemove for drags
		this.dragging = false;

		window.addEventListener('mousedown', (event) => {

			this.globals['other_is_dragging'] = null;

			let drag_id = event.target.getAttribute('_dragable');

			if (event.target.getAttribute('_dragable') && event.which === 1) {

				this.moved = false;
				this.just_started = true;
				// find and call draggable to initiate grad sequence
				this.pos.x = event.clientX;
				this.pos.y = event.clientY;
				this.drag_id = drag_id;

				this.transmitEvent();
			}
		});

		window.addEventListener('mousemove', (event) => { // putting on window allows dragging outside if left click is held!!!
			if (this.drag_target) { // not having this means ghosting and errors crosstalk occurs on things we drag that aren't handled here
				event.preventDefault();

				if (this.drag_target !== null) {

					let new_x = event.clientX;
					let new_y = event.clientY;

					if (new_x !== this.pos.x || new_y !== this.pos.y) {
						this.moved = true;
						this.dragging = true;

						this.pos.x = new_x;
						this.pos.y = new_y;

						// console.log(`X: ${this.pos.x}, Y: ${this.pos.y} | drag: ${this.dragging}`);
						this.transmitEvent();
					}
				}
			}

		});

		window.addEventListener('mouseup', (event) => {
			// console.log(event.target.getAttribute('_parent_obj'));
			// console.log(event.target);

			if (this.drag_target) {
				event.preventDefault();
				this.globals['other_is_dragging'] = null;

				if (this.drag_target) {
				
					this.dragging = false;

					this.transmitEvent();
				}
			}

		});
	}

	transmitEvent = () => {
		let pos = this.pos;
		let dragging = this.dragging;
		let moved = this.moved;
		let drag_id = this.drag_id;

		const data = {
			pos: pos,
			dragging: dragging,
			moved: moved,
			drag_id: drag_id
		};

		if (this.just_started) {
			// mousedown
			this.just_started = false;
			this.drag_target = this.globals['dragables'][drag_id];
			this.drag_target.startDragEvent(data);
			this.globals['other_is_dragging'] = this.drag_target;
		} else {
			if (data.dragging) {
				// mousemove
				this.drag_target.moveDragEvent(data);
			} else {
				// mouseup
				this.drag_target.stopDragEvent(data);
				// reset properties
				this.moved = false;
				this.drag_target = null;
				this.drag_id = null;
				this.pos = {x:0,y:0};
			}
		}
	}
}