export class StatusBarManager {
	constructor(globals, status_bar) {
		this.globals = globals;
		this.status_bar = status_bar;
	}

	displayText = (text) => {

		this.text_arr = [];

		// make array of reveal text aniamted
		for (let i = 1; i <= text.length + 3; i += 3) {

			let new_text = text.slice(0, i);
			this.text_arr.unshift(new_text);
		}

		this.just_started = true;
		// save to a this. and a prev time
		this.last_time = Date.now();
		this.globals['anim_loop'].stopTick(this.runTextRevealWipeInAnimloop);
		this.globals['anim_loop'].startTick(this.runTextRevealWipeInAnimloop);
	}

	runTextRevealWipeInAnimloop = (delta) => {
		// get curr time, if enough time has passed, reveal next item in arr
		// this.globals['status_bar']
		if (this.text_arr.length > 0) {
			let new_time = Date.now();

			if (this.just_started === true) {
				this.globals[this.status_bar].innerText = '';
				this.just_started = false;
			} else {
				if (new_time - this.last_time >= 3) {
					this.last_time = Date.now();
					this.globals[this.status_bar].innerText = this.text_arr.pop(); 
				}
			}

		} else {
			// console.log('stopped tick');
			this.globals['anim_loop'].stopTick(this.runTextRevealWipeInAnimloop);
		}


	}


}