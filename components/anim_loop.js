export class AnimLoop {
	constructor(globals) {
		// when something needs animating, add it in here, then cehck this.anim_fns.size > 0. if false, set to true and call this.startTick()
		// it is the job of the fn inside 'anim_loop_fns' to remove itself from there if/when complete. 
		// it is the job of the this.tick() to check if this.anim_fns.size > 0 is true, and if there are fns in 'anim_loop_fns', if not, it stops
		this.anim_fns = new Set();
		this.globals = globals;

		this.prev_time = Date.now();
		this.cntr = 0;
	}

	startTick = (add_fn) => {

		let was_stopped = this.anim_fns.size === 0;

		this.anim_fns.add(add_fn);

		if (was_stopped) {
			this.prev_time = Date.now();
			window.requestAnimationFrame(this.tick);
		}
	}

	stopTick = (remove_fn) => {
		this.anim_fns.delete(remove_fn);
		this.cntr = 0;
	}

	tick = () => {
		if (this.anim_fns.size > 0) {
			const current_time = Date.now();
			const delta = current_time - this.prev_time;
			this.prev_time = current_time;

			// console.log('CNTR:',this.cntr, delta);
			this.cntr++;

			this.anim_fns.forEach(item => {
				item(delta);
			});

			window.requestAnimationFrame(this.tick);
		}
	}
}