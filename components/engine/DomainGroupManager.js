
import { readFile, writeFile, RandIdManager, createAppData } from "../utils.js";

export class DomainGroupManager {
	constructor({globals=null, domain_groups=null, cards_container_obj=null, add_card_to_dom_cb=null}={}) {
		this.globals = globals;
		this.cards_container_obj = cards_container_obj;
		this.add_card_to_dom_cb = add_card_to_dom_cb;
		this.domain_groups = domain_groups; // these need to be mappified with card id as key
		this.rand_id_manager = new RandIdManager({id_len:4, existing_ids:this.getIdArr()});

		// console.log('cards in domain grp mngr:::', this.domain_groups);
	}

	static construct = async ({globals=null, cards_container_obj=null, add_card_to_dom_cb=null}={}) => {
		// await open the file
		let domain_groups = await readFile(`${globals['appdata_path']}/domain_groups.json`);

		// mappify domain_groups, the ids of cards are keys of map
		if (domain_groups) {
			return new DomainGroupManager({
				globals:globals,
				domain_groups:JSON.parse(domain_groups), 
				cards_container_obj:cards_container_obj, 
				add_card_to_dom_cb:add_card_to_dom_cb
			});
		} else {
			return null;
		}
	}



	getNewId = () => {
		return this.rand_id_manager.createId();
	}

	deleteOneCard = async (delete_id, delete_key) => {

		this.cards_container_obj.removeItem(delete_id, delete_key);
		delete this.domain_groups[delete_id];

		this.orderDomainGroupsForSave();
	
		// save to file
		let wtf = await this.saveGroupToFile();

		// console.log('after delete 1', delete_obj.card, delete_obj.mid);
		// console.log('after delete in DMG', this.domain_groups);

	}

	getSelectedDomains = () => {
		// console.log('domain gorups:::::', this.domain_groups);

		let domains_arr = [];
		Object.keys(this.domain_groups).forEach(key => {
			let curr = this.domain_groups[key];

			if (curr.selected) {
				// console.log('going');
				curr.urls.forEach(url => {
					if (!domains_arr.includes(url)) {
						domains_arr.push(url);
					}
				});
			}
		});

		return domains_arr;
	}

	orderDomainGroupsForSave = ({data_pack=null, id=null}={}) => {
		// console.log('cards form dom in orderdg for save::', this.cards_container_obj);
		let ordered = {};

		if (data_pack) {
			// console.log('**** saving new card 6');
			// console.log('adding one first');
			ordered[id] = data_pack;
		}


		let cards_in_dom = this.cards_container_obj.cards;
		Object.keys(cards_in_dom).forEach(card => {
			// console.log('**** saving new card 7');
			let card_in_dom = cards_in_dom[card].card;
			let curr_id = card_in_dom.domain_group_id;
			// let selected_dom = card_in_dom = card_in_dom.selected;
			let selected_dom = card_in_dom.selected;
			let card_here_got = this.domain_groups[curr_id];
			card_here_got.selected = selected_dom;
			// console.log('card while reordering:::', card_here_got);
			ordered[curr_id] = card_here_got;

		});		

		this.domain_groups = ordered;
	}

	addAllCardsToPanel = () => {
		this.cards_container_obj.removeAll();
		Object.keys(this.domain_groups).forEach(key => {
			let obj = this.domain_groups[key];
			obj.id = key;
			this.add_card_to_dom_cb(obj);
		});
	}

	updateGroup = async (data_pack, id) => {

		// console.log('updating in DGM', data_pack, id, this.domain_groups);

		let group = this.domain_groups[id];
		// console.log('group',group);
		group['selected'] = data_pack['selected'];
		group['title'] = data_pack['title'];
		group['urls'] = data_pack['urls'];

		// console.log('after update', id);

		// this.addAllCardsToPanel();

		// save to file
		await this.saveGroupToFile(id);
	}

	addNewGroup = async (data_pack) => {
		// re order per what is seen on screen
		// so if the passed thing is null, we can just resave like on re-arranging by hand

		let new_id = null;

		if (data_pack) {
			// console.log('**** saving new card 5');
			new_id = this.getNewId();
			this.orderDomainGroupsForSave({data_pack:data_pack, id:new_id});
			this.addAllCardsToPanel();
			// let new_domaingroups = {};
			// this.domain_groups[new_id] = data_pack;
		} else {
			this.orderDomainGroupsForSave();
		}

		// save to file
		await this.saveGroupToFile(new_id);
	}

	saveGroupToFile = async (new_id) => {
		// save to file
		let file_saved = await writeFile({path:`${this.globals['appdata_path']}/domain_groups.json`, json_str:JSON.stringify(this.domain_groups)});

		return file_saved; 
	}

	getIdArr = () => {
		let id_arr = [];

		Object.keys(this.domain_groups).forEach(key => {
			id_arr.push(key);
		});

		return id_arr;
	}
}





