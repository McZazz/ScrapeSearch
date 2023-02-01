import { makeElement, Component, randomSearch } from "./utils.js";

export class SearchResultCard extends Component {
	constructor({globals=null, link=null, title=null, description=null, height=null}) {
		super(globals);

		this.link_text = link;
		this.title_text = title;
		this.description_text = description;

		this.cont = makeElement({
			type:'div',
			styles:[
				['width', '100%'],
				['display', 'flex'],
				['flexDirection', 'column'],
				['overflow', 'hidden'],
				['borderRadius', `${this.globals['global_styles']['scroll_bar_radius']}px`],
			]
		});

		this.title = makeElement({
			type:'div',
			styles:[
				['width', '100%'],
				['cursor', 'pointer'],
				['color', this.globals['global_styles']['text_area_col']],
				['userSelect', 'none'],
				['background', this.globals['global_styles']['gray_btn_darker']],
				['padding', '3px 7px'],
				// ['background', 'black']
			],
			props:[
				['innerText', this.title_text]
			]
		});
		this.title.addEventListener('click', () => {
			// console.log(this.link_text);
			navigator.clipboard.writeText(this.link_text);
			
			this.globals['statusbar_bot'].displayText(`Copied: ${this.link_text}`);
		});
		this.cont.appendChild(this.title);

		this.description = makeElement({
			type:'div',
			styles:[
				['width', '100%'],
				['padding', '3px 7px'],
				['userSelect', 'none'],
				['background', this.globals['global_styles']['gray_btn_darker2']],
				['color', this.globals['global_styles']['text_area_col']],
				// ['background', 'green']
			],
			props:[
				['innerText', this.description_text]
			]
		});
		if (height !== null) {
			this.description.style.height = height;
		}
		this.cont.appendChild(this.description);

		this.globals['center_col_scroll'].addItem(this);
	}

	createSearchResult = () => {
		// 
	}


}