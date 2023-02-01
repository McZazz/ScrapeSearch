import { GroupCard } from '../group_card.js';
import { SearchEngines } from "./SearchEngines.js";

export class SearchViaGroups extends GroupCard {
	constructor({title=null, selected=null, globals=null, container_object=null}) {
		super({
			title:title,
			selected:selected,
			globals:globals,
			container_object:container_object,
			card_type:'JobCard'
		});

		this.duckduckgo = new SearchEngines(this.globals, 'duckduckgo');
		this.job_type = 'SearchViaGroups';

		this.job_card_settings_btn_clicked_cb = this.openSettings;
	}

	runJob = async (search_str, domains) => {
		// console.log('*** inside runJob');

		search_str = this.duckduckgo.addPluses(search_str);

		// let results_arr = [];

		/////////////////////////////
		if (this.globals['the_internet'].selected === true) {
			this.globals['statusbar_top'].displayText(`Domain: Entire internet | Search: ${search_str}`);
			// console.log('searching entire internet', search_str);
			let result_all = await this.searchDuckDuck(search_str, null);
			// results_arr.push(result);
			await this.duckduckgo.wait();
		}

		for (let i = 0; i < domains.length; i++) {
			let domain = domains[i];


			///////////////////////////////////////////////////////////////////////////// status bar doamin updates here
			this.globals['statusbar_top'].displayText(`Domain: ${domain} | Search: ${search_str}`);

			// let search = this.duckDuckSiteSearchStr(domain, search_str);
			// search = this.duckduckgo.escapeUrlChars(search);
			// console.log('in domain loop, searching::::', search_str, domain);
			let result = await this.searchDuckDuck(search_str, domain);

			// results_arr.push(result);
			// console.log(result);
			await this.duckduckgo.wait();

			// https://duckduckgo.com/?q=site%3Ahttps://www.rudaw.net/english+stick+big+the+how+to+memes&ia=web
			// https://duckduckgo.com/?q=site%3Ahttps%3A%2F%2Fwww.rudaw.net%2Fenglish+border+secure+sdf&ia=web
		}

		this.globals['statusbar_top'].displayText(`Search complete`);
	}

	openSettings = () => {
		// console.log('SearchViaGroups job card clicked here');
	}

	searchDuckDuck = async (search, domain) => {
		let result = await this.duckduckgo.search({search_terms:search, domain:domain, max:20});
		return result;
	}

	packSearchResult = (link, title, description) => {
		return {
			link:link,
			title:title,
			description:description
		}
	}

	duckDuckSiteSearchStr = (domain, search_str) => {
		return `https://duckduckgo.com/?q=site%3A${domain}+${search_str}&ia=web`;
	}


}