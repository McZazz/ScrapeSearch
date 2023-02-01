//nw.Window.get().showDevTools();

import { TitleBar } from './components/title_bar.js';
import { initGlobals, appendAnimStyles, createAppData } from './components/utils.js';
import { GlobalDragListener } from './components/global_drag_listener.js';
import { SearchPage } from './components/search_page.js';
import { GlobalScreenResizeUpdater } from './components/global_screen_resize_updater.js'; 
import { StatusBarManager } from './components/engine/StatusBarManager.js';
const getAppDataPath = require('appdata-path');

const globals = initGlobals();

let anim_styles = `
* {
  margin:  0;
  padding:  0;
  box-sizing: border-box;
}

::selection {
  background: #A0A5B2;
}

.inputs {
  border: none;
}

.inputs:focus {
  outline: none;
}

.win_control_btn:hover {
	background: ${globals['global_styles'].body_bg_color};
}

.gray_btn {
  background: ${globals['global_styles'].gray_btn_normal};
}

.gray_btn:hover {
  background: ${globals['global_styles'].gray_btn_hover};
}

.gray_btn2 {
  background: ${globals['global_styles'].gray_btn_darker};
}

.gray_btn2:hover {
  background: ${globals['global_styles'].gray_btn_normal};
}

.gray_btn3 {
  background: ${globals['global_styles'].gray_btn_darker};
}

.gray_btn3:hover {
  background: ${globals['global_styles'].gray_btn_darkest};
}

.gray_btn_hover_darker {
  background: ${globals['global_styles']['gray_btn_normal']};
}

.gray_btn_hover_darker:hover {
  background: ${globals['global_styles']['gray_btn_darker']};
}

.blue_btn {
  background: ${globals['global_styles'].blue_btn_normal};
}

.blue_btn:hover {
  background: ${globals['global_styles'].blue_btn_darker2};
}

.blue_btn2 {
  background: ${globals['global_styles'].blue_btn_normal};
}

.blue_btn2:hover {
  background: ${globals['global_styles'].blue_btn_hover};
}

.blue_btn3 {
  background: ${globals['global_styles'].blue_btn_darker2};
}

.blue_btn3:hover {
  background: ${globals['global_styles'].blue_btn_darkest};
}

.gray_plus {
  background: ${globals['global_styles'].gray_btn_normal};
}

.gray_plus:hover {
  background: red;
}

.gray_plus_bg_hover:hover {
  background: #41424A;
}

.mac_btns {
  width: 14px;
  height: 14px;
  border-radius: 14px;
  overflow: hidden;
}

.mac_btns_images {
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-position: center;
  image-rendering: pixelated;
}

.mac_close {
  background: rgb(246,82,84);
}

#mac_close:active {
  background: #F69B7F;
}

#mac_close_img {
  opacity: 0;
  background-image: url("img/mac_close.png");
  transition: opacity 100ms;
}

.mac_icons:hover #mac_close_img {
  opacity: 1;
}

.mac_maximize, .mac_restore {
  background: rgb(53,198,79);
}

#mac_maximize:active, #mac_restore:active {
  background: #6BDD82;
}

#mac_maximize_img {
  opacity: 0;
  background-image: url("img/mac_maximize.png");
  transition: opacity 100ms;
}

#mac_restore_img {
  opacity: 0;
  background-image: url("img/mac_restore.png");
  transition: opacity 100ms;
}

.mac_icons:hover #mac_maximize_img, .mac_icons:hover #mac_restore_img {
  opacity: 1;
}

.mac_minimize {
  background: rgb(249,188,77);
}

#mac_minimize:active {
  background: #E8EB87;
}

#mac_min_img {
  opacity: 0;
  background-image: url("img/mac_minimize.png");
  transition: opacity 100ms;
}

.mac_icons:hover #mac_min_img {
  opacity: 1;
}`;

appendAnimStyles('style_globals', anim_styles);

globals['is_mac'] = false;
globals['appdata_path'] = getAppDataPath('ScrapeSearch').replaceAll('\\', '/');
// console.log(globals['appdata_path']);
createAppData(globals);


// create title bar
const title_bar = new TitleBar(globals);
title_bar.appLoadMaximizedCheck();

// add pages
const search_page = SearchPage.construct(globals);


globals['statusbar_top'] = new StatusBarManager(globals, 'status_bar');
globals['statusbar_bot'] = new StatusBarManager(globals, 'status_bar_bot');

// const tray = new nw.Tray({ title: 'Tray', icon: 'img/tray_win.png' });