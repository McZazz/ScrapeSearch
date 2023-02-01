const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
import { SearchResultCard } from '../SearchResultCard.js';

import { randRangeInc } from "../utils.js";

export const duckduckSearch = () => {
	return {
		get_container: '#links',
		container_actions: [
			{action:'get_childnodes'}
		], 
		classname_of_each_result: 'nrn-react-div',
		each_result_to_link: [
			{action:'firstChild'},
			{action:'firstChild'},
			{action:'firstChild'},
			{action:'lastChild'},
			{action:'getResult', get_from:'self', get:'href'}
		],
		each_result_to_title: [
			{action:'firstChild'},
			{action:'firstChild'},
			{action:'nextSibling'},
			{action:'firstChild'},
			{action:'firstChild'},
			{action:'firstChild'},
			{action:'getResult', get_from:'self', get:'text'}
		],
		each_result_to_description: [
			{action:'firstChild'},
			{action:'lastChild'},
			{action:'firstChild'},
			{action:'lastChild'},
			{action:'getResult', get_from:'children', get:'text'}
		],
		each_result_to_date: [
			{action:'firstChild'},
			{action:'lastChild'},
			{action:'firstChild', num_children:2},
			{action:'firstChild'},
			{action:'getResult', get_from:'self', get:'text', conditions:['get_text_first_child_only', 'date_check']}
		]
	}
}

export class SearchEngines {
	constructor(globals, engine) {
		this.engine = engine;
		this.globals = globals;

		this.browser = null;
		this.page = null;
		this.wait_min = 2000;
		this.wait_max = 6000;

		this.links_found = new Set();

	}

	// https://duckduckgo.com/?q=site%3Ahttps://www.rudaw.net/english+stick+big+the+how+to+memes&ia=web
	// https://duckduckgo.com/?q=site%3Ahttps%3A%2F%2Fwww.rudaw.net%2Fenglish+border+secure+sdf&ia=web

	addPluses = (search) => {
		let pattern = / +/g;
		return search.replaceAll(pattern, '+');
	}

	escapeUrlChars = (search) => {
		search = search.replaceAll(':', '%3A');
		return search.replaceAll('/', '%2F');
	}

	removeExtraSpaces = (text) => {
		let pattern = / +/g;
		return text.replaceAll(pattern, ' ');
	}

	removeFirstSpace = (text) => {

		if (text.length > 0) {
			let first = text.slice(0, 1);

			if (first === ' ') {
				text = text.slice(1, text.length);
			}
		}

		return text;
	}

	getValueFromObj = (key, obj) => {
		if (this.hasKey(key, obj)) {
			return obj[key];
		}
		return null;
	}

	parseContainerActions = async () => {
		let parent_cont_exists = await this.selectorExists(this.instructions.get_container);
		let results_cont = null;

		if (parent_cont_exists) {
			let html = await this.page.content();
			let $ = cheerio.load(html);

			let results = $(this.instructions.get_container, html);
			// console.log('ersults::::', results);
			// html just turned into a cheerio has a '0' to start with 

			/// parse contaier actions
			if (this.hasKey('container_actions', this.instructions)) {
				// console.log('has container actions');

				// check that the container actions have actions to do
				let cont_actions = this.instructions.container_actions;
				// run container actions
				if (cont_actions.length > 0) {
					// console.log('cont actions have length');

					// iterate all actions and process actions
					cont_actions.every(item => {
						// get fields from action obj item
						let action = this.getValueFromObj('action', item);

						// get_childnodes instruction
						if (action === 'get_childnodes') {
							// console.log('cont-actions has get_chilnodes action');

							if (this.hasKey('0', results)) {
								results = results['0'];
								if (this.hasKey('children', results)) {
									results_cont = results['children'];
								}
							}
							else if (this.hasKey('children', results)) {
								results_cont = results['children'];
							}
						} // end get_childnodes instruction

						return true;
					});
				}
			}
		}

		// console.log('results at end of cont parse', results_cont);
		return results_cont;
	}

	parseSearch = async (search_result) => {
		search_result = await this.parseContainerActions();
		return this.parseSearchResultsActions(search_result);
	}

	monthCheck = (str) => {

		// if (str.length > 50) {
		// 	return false;
		// }

		let months = ['jan', 'january', 'feb', 'february', 'mar', 'march', 'apr', 'april', 'may', 'jun', 'june', 'july', 'aug', 'august', 'sep', 'sept', 'september', 'oct', 'october', 'nov', 'november', 'dec', 'december'];

		let found = false;

		months.every(month => {
			let index = str.toLowerCase().indexOf(month);
			if (index !== -1 && index < 30) {
				// console.log('$$$$$$$$$$$$');
				found = true;
				return false;
			}

			return true;
		});

		return found;
	}

	parseOneSearchResultField = (search_result, instruction) => {

		let final_text = 'none';

		if (search_result && this.hasKey(instruction, this.instructions)) {
			// console.log('parseOne, has instruction:::', instruction);
			// parse results to get link

			this.instructions[instruction].every(item => {
				// get fields of instruction
				let action = this.getValueFromObj('action', item);
				let type = this.getValueFromObj('type', item);
				let num_children = this.getValueFromObj('num_children', item);
				let get_from = this.getValueFromObj('get_from', item);
				let get = this.getValueFromObj('get', item);
				let conditions = this.getValueFromObj('conditions', item);
				let operations = this.getValueFromObj('operations', item);

				/////////////////////////////////////////////////////////
				// drilling down
				if (action !== 'getResult') {

					search_result = search_result[action];

					/////////////////////////////////////////////////////
					// exclusions
					// break if null 
					if (search_result === null) {
						return false;
					}

					// check for matching classname if specified
					if (type !== null && type !== 'any') {
						if (!this.parseClassCheck(type, search_result)) {
							return false;
						}
					}

					if (num_children !== null) {
						if (this.hasKey('children', search_result)) {
							if (search_result['children'].length !== num_children) {
								return false;
							}
						}
						// console.log('QQQQQQQQQQQQQQQQQQQ');
					}

					// if there is a children num req, cehck it
					// if (num_children !== null && this.hasKey('children', search_result)) {
					// 	// console.log('$$$$$$ num_children:::', search_result, search_result.children.length, num_children);
					// 	if (search_result.children.length !== num_children) {
					// 		return false;
					// 	}
					// 	console.log('$$$', search_result, search_result.children.length, num_children);
					// }

				}
				else if (action === 'getResult') {
					////////////////////////////////////////////
					// process final instruction
					
					// process href gets
					if (get === 'href') {
						// console.log('$$$ getting href:::',search_result);
						search_result = this.getCheerioAttribs('href', search_result);
						if (search_result !== null) {
							final_text = search_result;
						}
					}
					else if (get === 'text') {

						if (conditions && conditions.includes('get_text_first_child_only')) {
							final_text = this.getCheerioText(search_result, true);
						} else {
							// cases without conditions
							final_text = this.getCheerioText(search_result, false);
						}

						// if (conditions && conditions.includes('date_check')) {
						// 	if (!this.monthCheck(final_text)) {
						// 		final_text = 'none';
						// 	}
						// }


					}
				}

				// identify last check before parsing result
				// console.log(`drilling down | ::`, search_result);
				return true;
			});
		}

		return final_text;
	}

	cheerioTypeOf = (obj) => {
		if (this.hasKey('type', obj)) {
			return obj['type'];
		}
		return null;
	}

	getCheerioText = (obj, get_first_child_only) => {
		if (this.hasKey('children', obj)) {
			obj = obj['children'];

			let text = '';

			obj.every(item => {
				let cheerioType = this.cheerioTypeOf(item);
				// if it's type:text, just get the text
				if (cheerioType === 'text') {
					text += item['data'];
				}
				else if (cheerioType === 'tag') {
					if (this.hasKey('children', item)) {
						item = item['children'];
						if (this.hasKey('0', item)) {
							item = item['0'];
							if (this.hasKey('data', item)) {
								text += item['data'];
							}
						}
					}
				}

				// if it's type:tag, must drill down to get the text
				if (get_first_child_only) {
					return false;
				}
				return true;
			});

			text = this.removeExtraSpaces(text);
			text = this.removeFirstSpace(text);
			return text;
		}
		return 'none';
	}

	getCheerioAttribs = (attribute, obj) => {
		if (this.hasKey('attribs', obj)) {
			obj = obj['attribs'];
			if (this.hasKey(attribute, obj)) {
				return obj[attribute];
			}
		}
		return null;
	}

	parseClassCheck = (class_str, obj) => {
		if (this.hasKey('attribs', obj) && this.isNotNone(class_str)) {
			obj = obj['attribs'];
			if (this.hasKey('class', obj)) {
				obj = obj['class'];
				if (this.isNotNone(obj) && obj.toLowerCase().includes(class_str.toLowerCase())) {
					return true;
				}
			}
		}

		return false;
	}

	parseSearchResultsActions = (search_result) => {
		let results_arr = [];

		// console.log('search_result in parseSearchResultsActions:::', search_result); ////////////////////// check that this is the whole dom delivery

		if (this.isNotNone(search_result)) {

			search_result.forEach(item => {

				// make sure we have the correct class if necesarry
				let process_this = true;

				if (this.hasKey('classname_of_each_result', this.instructions)) {
					let classcheck = this.instructions.classname_of_each_result;
					if (classcheck !== 'any' && this.parseClassCheck(classcheck, item) === false) {
						process_this = false;
					}
				}

				// if class is correct, go
				if (process_this) {

					let link = this.parseOneSearchResultField(item, 'each_result_to_link');
					let title = this.parseOneSearchResultField(item, 'each_result_to_title');
					let date = this.parseOneSearchResultField(item, 'each_result_to_date');
					let descript = this.parseOneSearchResultField(item, 'each_result_to_description');

					let result = {link:link, title:title, date:date, descript:descript};
					// console.log('parsed result to screen::', result); ///////////////////////////////////////////////////////////////////////
					// APPEND TO SCREEN HERE
					////////////////////////////////////////////////////////////////////////////////////////////////////////
					if (!this.links_found.has(link)) {

						this.links_found.add(link);

						let _result = new SearchResultCard({
							globals:this.globals, 
							link:link, 
							title:title, 
							description:descript
						});
					}
				}
			});
		}
		// console.log('final:::', results_arr);
		return results_arr;
	}

	countChildNodes = (obj) => {
		let count = 0;

		if (this.hasKey('children', obj)) {	
			count = obj.children.length;
		}

		return count;
	}

	getResultsScrollingPagePersistant = async () => {

		let prior_found = 0;
		let curr_found = 0;
		let page_load_err = false;

		let cntr = 0; 

		let search_result = null;
		let results_arr = [];
		let both_were_zero_cntr = 0;

		while (true) {

			// check for next button
			let next_btn_exists = await this.selectorExists(this.next_page_button);
			// no more next buttons, exit loop with what we got
			if (!next_btn_exists) {	
				break;
			}

			await this.scrollDown();
			// await this.page.click('.result--more a');
			await this.page.click(this.next_page_button);
			await this.wait();

			// dev speedy ///////////////////////////////////////////////////////////////////// throttling to 3 search return pages per domain
			cntr++;
			if (cntr >= 2) {
				break;
			}

		}

		// get results
		// search_result = await this.parseContainerActions();
		search_result = await this.parseSearch(search_result);

		return search_result;
	}

	wait = async () => {
		let rand_range = randRangeInc(this.wait_min, this.wait_max);
		// console.log('rand range', rand_range);

		await this.page.waitForTimeout(rand_range);
	}

	selectorExists = async (selector) => {
		let exists = true;
		await this.page.waitForSelector(selector).catch(error => exists = false);

		return exists;
	}

	scrollDown = async () => {
		await this.page.evaluate(() => {
	  	window.scrollTo(0, window.document.body.scrollHeight);
		});
	}

	duckDuckByDomainStr = (domain, search_str) => {
		return `https://duckduckgo.com/?q=site%3A${domain}+${search_str}&ia=web`;
	}

	duckDuckStr = (search_str) => {
		return `https://duckduckgo.com/?q=${search_str}&ia=web`;
	}

	search = async ({search_terms=null/*String*/, domain=null/*String*/, max=null/*int*/}={}) => {

		// console.log('$$$$$$$ clearing out prev links');
		this.links_found = new Set();

		// setup
		if (this.browser === null) {
			this.browser = await puppeteer.launch();
			this.page = await this.browser.newPage();
		}

		this.max = max;

		// console.log(this.engine);

		if (this.engine === 'duckduckgo') {
			this.instructions = duckduckSearch();
			this.next_page_button = '.result--more a';

			// console.log('inside actually doein gsearch');

			// prepare search string and load search instructions
			this.search_terms = this.addPluses(search_terms);
			this.search_terms = this.escapeUrlChars(this.search_terms);
			if (domain) {
				this.search_terms = this.duckDuckByDomainStr(domain, this.search_terms);
				// console.log('.......... there is domain');
			} else {
				this.search_terms = this.duckDuckStr(this.search_terms);
				// console.log('.......... no domain');
			}
			// this.search_terms = `https://duckduckgo.com/?q=${this.search_terms}&t=h_&ia=web`; // h_ prob means opera
			// https://duckduckgo.com/?q=site%3Amdn.org+url+escape+codes&t=ffab&ia=web  /// prob means firefox
			// https://duckduckgo.com/?q=site%3Amdn.org+url+escape+codes&ia=web
			// https://duckduckgo.com/?q=site%3Amdn.org+object+foreach&t=brave&ia=web 
		} else {
			// console.log('returning null after making search terms but never searching');
			return null;
		}

		// console.log('**** isnide search:', this.search_terms);

		// // goto page and run search
		this.page.goto(this.search_terms);

		// get all results, paginating if appropriate
		let results = null;
		if (this.engine === 'duckduckgo') {
			results = await this.getResultsScrollingPagePersistant();

			// console.log('done with getting search results');
			return results;
		}
		// console.log('returning null after not acutally searching');
		return null;
	}

	searchOnce = async (search) => {
		// setup
		if (this.browser === null) {
			this.browser = await puppeteer.launch();
			this.page = await this.browser.newPage();
		}

		search = this.addPluses(search);

		this.page.goto(`https://duckduckgo.com/?q=${search}&t=h_&ia=web`);

		for (let i = 0; i < 10; i++) {

			await this.page.waitForSelector('.result--more a').catch(error => i = 11)

			if (i === 11) {	
				break;
			}

			await this.page.evaluate(() => {
		  	window.scrollTo(0, window.document.body.scrollHeight);
			});

			await this.page.click('.result--more a');

			let rand_range = randRangeInc(this.wait_min, this.wait_max);
			// console.log('rand range', rand_range);

			await this.page.waitForTimeout(rand_range);
		}

		const html = await this.page.content();
		const $ = cheerio.load(html);

		// get child nodes
		// const links = $('#links', html);
		// console.log(links);
		let links = $('#links', html);

		if (this.hasKey('0', links)) {
			links = links['0'];
		} else {
			// console.log('return no page result');
		}

		if (this.hasKey('children', links)) {

			if (this.hasKey('children', links)) {
				links = links.children;

				if (this.isNotNone(links)) {
					// console.log('getting link titles, links, descripts...', links);

					links.forEach(link => {
						// console.log(this.linkAndTitle(link));
					});
				} else {
					// console.log('return no page result');
				}

			} else {
				// console.log('return no page result');
			}
		} else {
			// console.log('return no page result');
		}

		// console.log('search done');

	}

	hasKey = (key, obj) => {
		if (obj && key in obj) {
			return true;
		} else {
			return false;
		}
	}

	isNotNone = (obj) => {
		if (obj && obj !== 'none') {
			return true;
		} else {
			return false;
		}
	}

	linkAndTitle = (cont/*cheerio*/) => {

		let title = 'none';
		let link = 'none';
		let descript = 'none';

		if (this.isNotNone(cont)) {

			let full = ['firstChild','firstChild','nextSibling','firstChild','firstChild','firstChild','children','0','data'];

			if ('firstChild' in cont) {
				cont = cont.firstChild;
			} else {
				return ['none', 'none', 'none'];
			}

			if (this.isNotNone(cont)) {

				// console.log('cont', cont);

				// get descript object
				descript = cont;
				let to_descript = ['lastChild', 'firstChild', 'firstChild', 'children'];

				to_descript.every(item => {

					// console.log('every', item);

					if (this.isNotNone(descript) && item in descript) {
						descript = descript[item];
					} else {
						descript = 'none';
						return false;
					}

					return true;
				});

				// console.log('descript obj', descript);

				// concat description text from descript obj
				let descript_concat = '';

				if (this.isNotNone(descript)) {

					// console.log('descript:::::::', descript);

					descript.forEach(item => {
						if (this.hasKey('data', item)) {
							descript_concat += item.data;
						} else {
							// for the text in <b> tags
							if (this.hasKey('children', item)) {
								item = item['children'];
								if (this.hasKey('0', item)) {
									item = item['0'];
									if (this.hasKey('data', item)) {
										descript_concat += item.data;
									}
								}
							}
						}
					});
				}

				if (descript_concat === '') {
					descript = 'none';
				} else {
					descript = this.removeExtraSpaces(descript_concat);
					descript = this.removeFirstSpace(descript);
				}

				// get to link area
				let to_link = ['firstChild','nextSibling','firstChild','firstChild'];

				to_link.every(item => {

					if (this.isNotNone(cont) && item in cont) {
						cont = cont[item];
					} else {
						cont = 'none';
						return false;
					}

					return true;
				});

				if (this.isNotNone(cont)) {

					// console.log('before getting link and title',cont);

					let link = cont;

					['attribs','href'].every(item => {
						if (this.hasKey(item, link)) {
							link = link[item];
						} else {
							link = 'none';
							return false;
						}

						return true;
					});

					// console.log('aaaaaaaaa',link);

					let title = cont;

					['children','0','children','0','data'].every(item => {
						if (this.hasKey(item, title)) {
							title = title[item];
						} else {
							title = 'none';
							return false;
						}

						return true;
					});

					// console.log('bbbbbbbbbb', title);
					return {title:title, link:link, descript:descript};
				}
			}
		}

		return {title:title, link:link, descript:descript};
	}


	closeBrowser = async () => {
		await this.browser.close();
	}
}

