import { global_styles } from './global_styles.js';
import { GlobalScreenResizeUpdater } from './global_screen_resize_updater.js';
import { GlobalDragListener } from './global_drag_listener.js';
import { AnimLoop } from './anim_loop.js';

const existsSync = nw.require('fs').existsSync;
const mkdir = nw.require('fs').mkdir;
const readFileNw = nw.require('fs/promises').readFile;
const writeFileNw = nw.require('fs/promises').writeFile;




export const makeElement = ({
															type=''/*String of html tag type*/, 
															props=[]/*[['id', 'stuff'], ['classList', 'notbootstrap']]*/, 
															styles=[]/*[['backgroundColor', '#334455'], ['fontFamily', 'Ariel']]*/
														}={}) => {

	let result = document.createElement(type);

	props.forEach((prop) => {
		result[prop[0]] = prop[1]; 
	});

	result = setPermStyles(result, styles);

	return result; // Node
}


export const setPermStyles = (element/*Node*/, styles/*[['backgroundColor', '#334455'], ['fontFamily', 'Ariel']]*/) => {

	styles.forEach((item) => {
		element.style[item[0]] = item[1]; 
	});

	return element; // Node
}

export const appendAnimStyles = (id/*String*/, styles/*'#stuff:hover {background-color: red;}'*/) => {

	let result = document.createElement('style');
	result.id = id;

	result.textContent = styles;

	document.head.appendChild(result)
}

export const appendMultiple = (cont, children) => {
	children.forEach(child => {
		cont.appendChild(child);
	});
}

export const randRangeInc = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const randomSearch = () => {
	let range = [2, 3, 4, 5];
	let words = ['bob', 'burgers', 'cartoon', 'network', 'car', 'french', 'english', 'and', 'television', 'computer', 'garrison', 'quarry', 'stadium', 'table', 'funny', 'memes', 'news', 'on', 'stick', 'game', 'console', 'clothes', 'dress', 'chair', 'carpet', 'lasagna', 'dish', 'deep', 'smell', 'how to', 'fix my', 'snack', 'emmerson', 'stag', 'meyer', 'queen', 'king', 'runny', 'oscar', 'wall', 'big', 'small', 'store', 'shop', 'forum', 'poker', 'blackjack', 'magazine', 'clipazine', 'agency', 'every', 'day', 'is', 'exactly', 'the', 'broken', 'alone', 'danger', 'john', 'stanley', 'rosa', 'roderick', 'cooper', 'bealey', 'dirge', 'amazing', 'dirt', 'mud', 'My', 'blue', 'checkmark', 'still', 'says', 'Im', 'notable', 'in', 'media', 'or', 'whatever', 'When', 'do', 'forest', 'desert', 'space', 'planet', 'curtain', 'get', 'the', 'fancy','caption', 'about', 'being', 'probably', 'not', 'notable', 'nozzle', 'math', 'problem'];

	let amt = range[Math.floor(Math.random() * range.length)];

	let final = [];
	while (final.length < amt) {
		let new_word = words[Math.floor(Math.random() * words.length)];
		if (!final.includes(new_word)) {
			final.push(new_word);
		}
	}

	return final.join('+');
}

export const readFile = async (path) => {
  // const readFile = nw.require('fs/promises').readFile;

  try {
    const result = await readFileNw(path, { encoding: 'utf8' });
    return result;
  } catch (err) {
    return null;
  }
}

export const writeFile = async ({path=null, json_str=null}={}) => {
	
	try {
		await writeFileNw(path, json_str);
		return true;
	} catch (err) {
		return false;
	}
}


export const createEmptyJSONFile = async (path, filename) => {
	path = `${path}/${filename}`;
	if (!existsSync(path)) {
		await writeFile({path:path, json_str:'{}'});
	}
}


export const createAppData = async (globals) => {

	let path = globals['appdata_path'];

	// .replace('\\ScrapeSearch', '')
	if (existsSync(path)) {
		// check that file exists
		// return true;
		createEmptyJSONFile(path, 'domain_groups.json');
	} else {
		// path = path.replace('\\ScrapeSearch', '');
		// path = path.replace('/ScrapeSearch', '');
		mkdir(path, (er) => {
			if (er) {
				console.log(er);
			} else {
				// console.log('should be creating file');
				createEmptyJSONFile(path, 'domain_groups.json');
			}
		});
	}
}



export const initGlobals = () => {
	const globals = new Map();
	globals['global_styles'] = global_styles;
	globals['dragables'] = new Map();
	globals['window'] = new Map();
	globals['pages'] = new Map();
	globals['buttons'] = new Map();
	globals['pages_cont'] = null;
	globals['active_page'] = null;
	globals['other_is_dragging'] = null;
	globals['id_manager'] = new RandIdManager({id_len:4});
	globals['global_screen_resize'] = new GlobalScreenResizeUpdater();
	globals['anim_loop'] = new AnimLoop(globals);
	globals['global_drag'] = new GlobalDragListener(globals);
	globals['center_col_scroll'] = null;

	return globals;
}

export class BoundingRectsmanager {
	constructor(ele) {
		this.ele = ele;
		this.rect = this.ele.getBoundingClientRect();
	}

	updateRectFromDom = () => {
		this.rect = this.ele.getBoundingClientRect();
	}

	
}

export class Component {
	constructor(globals) {
		this.globals = globals;

		this.global_styles = this.globals['global_styles'];
		// this.dragables = this.globals['dragables'];
		// this.window = this.globals['window'];
		// this.pages = this.globals['pages'];
		// this.pages_cont = this.globals['pages_cont'];
		// this.active_page = this.globals['active_page'];

		this.focus = false;
	}

	makeDragable = (elementToDragable) => {
		let dragable_id = this.globals['id_manager'].createId();
		elementToDragable.setAttribute('_dragable', dragable_id);
		this.globals['dragables'][dragable_id] = this;
	}

	startDragEvent = (event) => {
		console.log('default fn, start drag:', event);
	}

	moveDragEvent = (event) => {
		console.log('default fn, move drag', event);;
	}

	stopDragEvent = (event) => {
		console.log('default fn, stop drag', event);
	}

	otherIsNotDragging = () => {
		return this.globals['other_is_dragging'] === this || this.globals['other_is_dragging'] === null;
	}

}

export const roundToTwo = (num) => {
	return Number.parseInt(num * 100) / 100;
}	



export const getPosSizeData = (element) => {
	let pos = element.getBoundingClientRect();
	let width = pos.right - pos.left;
	let height = pos.bottom - pos.top;
	let top = pos.top;
	let bottom = pos.bottom;
	let left = pos.left;
	let right = pos.right;

	return {width, height, top, bottom, left, right};
}

export const plusSign = ({width=null, border_radius=null, center_on_parent=null, hover_col=null, normal_col=null}={}) => {
	let cont_styles = [
		['height', '100%'],
		['width', '100%'],
		['position', 'relative']
	];
	let cont = makeElement({type:'div', styles:cont_styles});

	let horiz_styles = [
		['height', width],
		['width', '100%'],	
		['position', 'absolute'],
		['top', center_on_parent],
		['borderRadius', border_radius]
	];
	let horizontal = makeElement({type:'div', styles:horiz_styles, props:[['classList', class_list]]});
	cont.appendChild(horizontal);

	let vert_styles = [
		['height', '100%'],
		['width', width],	
		['position', 'absolute'],
		['left', center_on_parent],
		['borderRadius', border_radius]
	];
	let vertical = makeElement({type:'div', styles:vert_styles, props:[['classList', class_list]]});

	cont.appendChild(vertical);

	return cont;
}



export class RandIdManager {
	constructor({id_len=null, existing_ids=null}={}) {
		this.id_len = id_len;
		this.existing_ids = new Set();

		if (existing_ids) {
			existing_ids.forEach(id => {
				this.existing_ids.add(id);
			});
		}
	}

	add = (id) => {
		this.existing_ids.add(id);
	}

	createId = ({id_type=''/*String*/}={}) => {
	  // let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789012345678901234567890123456789012345678901!@#$%&*?!@#$%&*?!@#$%&*?';
	  let chars = 'abcdefghijklmnopqrstuvwxyz';
	  let result = id_type;
	  let cntr = 0;

	  while (true) {
	    for (let i=0; i<this.id_len; i++) {
	      result += chars.charAt(Math.floor(Math.random() * chars.length));
	    }

      if (this.existing_ids.has(result)) {
        cntr++;
      } else {
      	this.existing_ids.add(result);
      	return result;
      }

	    if (cntr >= 10) {
	    	this.id_len++;
	    }
	  }
	}
}


