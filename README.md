### ScrapeSearch

## 
Warning: you MUST use a VPN while using this app. You can get constant captchas at the minimum, and IP bans at the maximum. If you fail to use a VPN while using this app, the consequences are your own fault.
## 

### Desktop app facilitating the ability to save groups of domains for use in automating bulk domain-constrained searches on DuckDuckGo to bypass state / corporate / empire rigging of DuckDuckGo search returns. Utilizes NWJS, Puppeteer, Appdata-path and Cheerio.

## 

![image](https://raw.githubusercontent.com/McZazz/ScrapeSearch/main/cap-1.jpg "ScrapeSearch screencap")

## 

### Bathe in the Tears of the Empire

If you find yourself often avoiding search engines because you know the results are being gamed by state / corporate / empire propagandists, then likely you have spent a lot of time doing the following:

1: Checking bookmarked sites by hand for old articles that should be returned by a search engine but are not. 

2: Running "site:www.domain.com my search terms" by hand, over and over.

You also spend time searching for news agencies all over the world, because even switching your VPN to offshore sources does not fully defeat the reach and proliferation of mainstream American and European news agencies.

If you have lots of sites you would like to search, and you know the fake "recommended" or "popular" results are going to waste your time (If you don't know this, then you must be new to the internet), then you are also wasting time circumventing by hand this atrificial forced scarcity of information.

So, we make scrapers and automate our domain constrained searches :)

As you collect domains, save them inside different groups you specify in ScrapeSearch. Select and deselect whichever combinations of these domain groups needed for your searches as you wish. Your search results are displayed in the center column.

The scraper has a built in variable wait period of on average 4 seconds between each interaction online, so as to not annoy DuckDuckGo too much.

This app does not access any service, nor any server other than DuckDuckGo in order to automate your domain constrained searches.

## Usage

Use the plus button to create groups of domains you wish to bind your searches to regularly. Blue is selected, gray is deselected. Check the "The Internet" checkbox to include returns as-is from DuckDuckGo with your constrained searches. In the large center-bottom column, click the title header of a search result and the link is copied to the clipboard and ready to by checked in a browser.

The right column is a work in progress. Time and $ depending, it may or may not expand. But, the idea is to hopefully have an assortment of different search, scrape and analytics jobs available, with unique settings and customization for each. 

## 

<p align="center" width="100%">
    <img width="54%" src="https://raw.githubusercontent.com/McZazz/ScrapeSearch/main/howto1.PNG">
</p>

## 

<p align="center" width="100%">
    <img width="32%" src="https://raw.githubusercontent.com/McZazz/ScrapeSearch/main/howto2.PNG">
</p>

## 

<p align="center" width="100%">
    <img width="36%" src="https://raw.githubusercontent.com/McZazz/ScrapeSearch/main/howto3.PNG">
</p>

## 

<p align="center" width="100%">
    <img width="36%" src="https://raw.githubusercontent.com/McZazz/ScrapeSearch/main/howto4.PNG">
</p>

## 

<p align="center" width="100%">
    <img width="47%" src="https://raw.githubusercontent.com/McZazz/ScrapeSearch/main/howto5.PNG">
</p>

## 

## Roadmap

This app is a work in progress!

The "Selfish Ledger" of the plutocracy will guide no one. The proliferation of personal scrapers, and other tools to defeat fakery is the beginning of the end of the fraud of empire and toxic modernity. The end of the societal managerial strategies designed by capital and state to shrug off the guilt of their assaults against humanity in such a way that the international working class is brainwashed into believing that the inhumanites of modernity were our own fault, not of capital or state, all along. They perpetuate the rigging of the internet to facilitate this illusion, in addition to the crimes they commit such as demographic engineering, coups, regime change wars and sanction regimes that they perpetuate all over the world so that they can bring business their way due to thier hinderance of the rest of the world, and us. So we bypass thier assaults on humanity however we can. This is my contribution, I hope you like it :)

Hinder the hinderence of the plutocracy. Don't let the dogmatists of gatekeeperism win. If you like this app and think you can do better, then by all means, do it!!! You can do it!!! Imagine a spider added to this thing due to links being deleted from the search engines entirely, a personal spider for everyone!!!

## 

I have the results throttled to 3 search engine pages returned per domain. If you want more, comment out the following lines:
SearchEngines.js
433 - 435 (the if statement with "dev speedy" above it)
However, you will get captchas (and possilby an IP ban) every 5 - 10 searches if you scrape all returned pages every time. Currently there is nothing setup to detect captchas (and the possible IP bans that follow), so the status will just show nothing after about a minute. This means you got a captcha (or ban) and must change your VPN address.

Also, it could be improved by having puppeteer type the search string into the search input, rather than jamming it into the url bar.

### 
USE A VPN, don't screw this up, because you don't want your actual IP address banned...
### 

This app was tested thouroughly on Windows. I have no idea how well the principal dependency Puppeteer runs on mac and Linux. However, if that is not an issue, since I have this app set up like my other project, OfflineOpenPGP, then it should work on Linux and Mac too, hopefully.

## Install instructions: 

Note for all platforms: If you have never used npm to install Puppeteer, you will need to do "npm i puppeteer" separate from "npm install". "npm i puppeteer" will install the chrome install that it accesses in a folder in your home path: ".cache/puppeteer". At least on Windows, "npm install" (with the package.json set with puppeteer as a dependency) will not install this chrome version that puppeteer uses. Also, for distribution, it is necesarry to create an app data folder in the user's usual app data path, and have the chrome dl and run from there.

To accomplish this portable setup (app runs in a singular folder, uses app data path for dl and install of chrome and managing app settings data), do the following:
create a file called ".puppeteerrc.cjs" in the root project dir, and add the following to it (using getAppDataPath() from the appdata-path lib, the "FolderNameInUsersAppdataPath" will need to be created by your app BEFORE later presented code Dls and installs chrome)

const {join} = require('path');  
const getAppDataPath = require('appdata-path');  
let root = getAppDataPath('FolderNameInUsersAppdataPath');  
module.exports = {  
    cacheDirectory: join(root, '.cache', 'puppeteer'),  
};  

In your main.js, or wherever you would like to run it (preferably everytime your app starts), the download and install for chrome looks like this:

const path = require('path');  
const {execSync} = require('child_process');  
const {downloadBrowser} = require('puppeteer/internal/node/install.js');  
await downloadBrowser();  

It is a good idea to have a check for the folder structure, chrome.exe, and delete first if malformed. The downloadBrowser() in puppeteer also does this, but only if the folder structure is malformed.

Finally, your custom chrome path needs to be called when doing "puppeteer.launch()":  
example assuming we already put the custom chrome path into "this.my_custom_chrome_path" somewhere else:  
this.browser = await this.puppeteer.launch({headless:true, executablePath:this.my_custom_chrome_path});  

## Windows:
Go to nwjs.io, and download the "Normal" version of nwjs for Windows.

Copy the contents of the "src" folder of ScrapeSearch into the nwjs top level folder.

Make sure you have NPM installed, make sure you are still in the top level folder (package.json is present) and run:
npm install

nw.exe is the application that starts the app, double click it or make a shortcut.

Your saved data will be found in the appdata folder:
C:\Users\[your-windows-user-name]\AppData\Roaming\ScrapeSearch



## Mac:
go to nwjs.io, and download the "Normal" version of nwjs for Mac

Place the unpacked nwjs app directory in your applications folder.

The ScrapeSearch source files can be dumped in the nwjs top level folder, or kept in a separate location.

In the ScrapeSearch src directory, set Mac titlebar buttons in main.js by finding this: "globals['is_mac'] = false;" and changing it to this:
"globals['is_mac'] = true;"

Make sure you have NPM installed, and inside the ScrapeSearch src folder with package.json run:
npm install

(the following will be what you do to start the app each time):
Open a terminal inside the nwjs executable app directory, run the following command to start it, with the path pointing to the src folder in the ScrapeSearch folder: 

open -n -a [path/to/nwjs] --args "[path/to/src]"

Example (src is separate, on the desktop. nwjs-sdk is also on desktop): 

open -n -a /Users/macbook/Desktop/nwjs-sdk/nwjs.app/Contents/MacOS/nwjs --args "Users/macbook/Desktop/app-src"; 

Your saved data can be found in your system level user data folder, inside a directory named "ScrapeSearch".



## Linux:
go to nwjs.io, and download the "Normal" version of nwjs for Linux.
Extract it to the directory of your choice.

copy the contents of the "src" folder of ScrapeSearch into the nwjs top level folder.

Make sure you have NPM installed, make sure you are still in the top level folder (package.json is present) and run:
npm install

Run either of the following commands to start it: 

(separate src inside nwjs folder) 

./nw .

(all source files inside same nwjs folder) 

./nw

Your saved data can be found in your system level user data directory, inside a directory named "ScrapeSearch", likely here: "/home/dev2/.config/ScrapeSearch". This was tested on Linux Mint, however other versions of Linux may not be friendly with this concenpt so if it is not saving anything, you will have to modify the source to point to a hardcoded directoy.

## Development:
This project is written 100% in object oriented Vanilla JS.
If you find this project useful, feel free to dump a tiny bit of crypto in my wallet. Future public releases of this app are not guaranteed.

## 
ZEC: 

t1SFSSr6Da8jVLCq4GMqvuWtkBgLN6ssFho

## 
BTC: 

bc1q7q2ewrhw5wcmuc3gsd54vdkdywx60zamfj93qn

## 

## Dependencies:
              nwjs
https://github.com/nwjs/nw.js


              appdata-path
https://github.com/demurgos/appdata-path


              cheerio
https://github.com/cheeriojs/cheerio


              puppeteer
https://github.com/puppeteer/puppeteer
