const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

import { randRangeInc } from "../utils.js";

export class DuckDuck {
	constructor() {

		/*
			save file for the absolute paths
			other relative terms we can add:
			firstOfType
			lastOfType
			children
			notEnds
			allOfType
			result
		*/

		let path = {
			container_id_of_all_results: 'links',
			classname_of_each_result: 'nrn-react-div',
			each_result_to_link: [
				{action:'firstChild', times:3, type:'any'},
				{action:'lastChild', times:1, type:'a'},
				{action:'parseResult', result_action:[
					{get_from:'self', return_props:'href'}
				]}
			],
			each_result_to_title: [
				{action:'firstChild', times:2, type:'any'},
				{action:'nextSibling', times:1, type:'any'},
				{action:'firstChild', times:3, type:'any'},
				{action:'parseResult', result_action:[
					{get_from:'self', return_props:'text'}
				]}
			],
			each_result_to_description: [
				{action:'firstChild', times:1, type:'any'},
				{action:'lastChild', times:1, type:'any'},
				{action:'firstChild', times:1, type:'any'},
				{action:'lastChild', times:1, type:'any'},
				{action:'parseResult', result_action:[
					{get_from:'children', return_props:'text', recurse:true}
				]}
			],
			each_result_to_date: [
				{action:'firstChild', times:1, type:'any'},
				{action:'lastChild', times:1, type:'any'},
				{action:'firstChild', times:2, type:'any'},
				{action:'parseResult', result_action:[
					{get_from:'self', return_props:'text'}
				]}
			]
		}

		this.browser = null;
		this.page = null;
		this.wait_min = 2000;
		this.wait_max = 6000;
	}

	addPluses = (search) => {
		let pattern = / +/g;
		return search.replaceAll(pattern, '+');
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

