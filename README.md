### Bathe in the Tears of the Empire
### ScrapeSearch

## 
Warning: you MUST use a VPN while using this app. You can get constant captchas at the minimum, and IP bans at the maximum. If you fail to use a VPN while using this app, the consequences are your own fault.
## 

### Desktop app facilitating the ability to save groups of domains for use in automating bulk domain-constrained searches on DuckDuckGo to bypass state / corporate / empire rigging of DuckDuckGo search returns. Utilizes NWJS, Puppeteer, Appdata-path and Cheerio.

## 

![image](https://raw.githubusercontent.com/McZazz/ScrapeSearch/main/cap-1.jpg "ScrapeSearch screencap")

## 

![image](https://raw.githubusercontent.com/McZazz/ScrapeSearch/main/cap-2.jpg "ScrapeSearch screencap")

## 

If you find yourself often avoiding search engines because you know the results are being gamed by state / corporate / empire propagandists, then likely you have spent a lot of time doing the following:

1: Checking bookmarked sites by hand for old articles that should be returned by a search engine but are not. 

2: Running "site:www.domain.com my search terms" by hand, over and over.

You also spend time searching for news agencies all over the world, because even switching your VPN to offshore sources does not fully defeat the reach and proliferation of mainstream American and European news agencies.

If you have lots of sites you would like to search, and you know the fake "recommended" or "popular" results are going to waste your time (If you don't know this, then you must be new to the internet), then you are also wasting time circumventing by hand this atrificial forced scarcity of information.

So, we make scrapers and automate our domain constrained searches :)

As you collect domains, save them inside different groups you specify in ScrapeSearch. Select and deselect whichever combinations of these domain groups needed for your searches as you wish. Your search results are displayed in the center column.

The scraper has a built in variable wait period of on average 4 seconds so as to not annoy DuckDuckGo too much.

This app does not access any service, nor any server other than DuckDuckGo in order to automate your domain constrained searches.

## Usage

Use the plus button to create groups of domains you wish to bind your searches to regularly. Blue is selected, gray is deselected. Check the "The Internet" checkbox to include returns as-is from DuckDuckGo with your constrained searches. In the large center-bottom column, click the title header of a search result and the link is copied to the clipboard and ready to by checked in a browser.

The right column is a work in progress. Time and $ depending, it may or may not expand. But, the idea is to hopefully have an assortment of different search, scrape and analytics jobs available, with unique settings and customization for each. 

## Roadmap

This app is a work in progress!

This app is free, open source software. So, if there is no money that magically appears, I will likely not create any of the "power features" that could make this thing a true weapon fit for defending ourselves fully from the rigged nature of the internet. There are other scrapers too, so you should check around and see what you like.

However, if money does magically appear out of nowhere, some things are possible in the future with ScrapeSearch:

Taken into pipedream-land, transformer models with attention could be used to get more dynamic checks of phrases going. And wouldn't it be nice to see results displayed on a timeline, if needed? Considering how often empire sources memory-hole their own prior reporting as they magically change their positions on things when their masters order them to, or when the empire's endless pursuit to offer nothing of value while forcing our actions to be fully monetizable by themselves, and I can assure you this is enforced by the sanction and drone weilding ones all over the world unfortunately, not just on rigged search engines... a timeline based display of search results then is necessary. Footers, navs and contact pages could be zeroed in on a job designed to create graph displays of associated sites. Something like a "spam filter" could also be appropriated with user created databases of categorized phrases (for identifying anything you want in a search result, or on Reddit, in addition to spam-like comments) to better fine tune searches for all sorts of fun. 

Some simple additions could be sorting of results, vetting sites for search term hits, creating nested search term checks like we would do when going thru results with "ctrl/cmd + f" checks on the text of articles.

Also, more engines may be added in the future, starting with Google. Their "Selfish Ledger" will guide no one. The proliferation of personal scrapers is the beginning of the end of the fraud of empire and toxic modernity. The end of the societal managerial strategies designed by capital and state to shrug off the guilt of their assaults against humanity in such a way that the international working class is brainwashed into believing that the inhumanites of modernity were our own fault, not of capital or state, all along. They perpetuate the rigging of the internet to facilitate this illusion, in addition to the coups, regime change wars and sanction regimes that they perpetuate all over the world so that they can bring business their way due to thier hinderance of the rest of the world, and us, so we bypass thier assaults on humanity however we can. This is my contribution, I hope you like it :)

So hinder the hinderence of the plutocracy. If you like this app and think you can do better, then by all means, do it!!! You can do it!!!

## 

I have the results throttled to 3 search engine pages returned per domain. If you want more, comment out the following lines:
SearchEngines.js
433 - 435 (the if statement with "dev speedy" above it)
However, you will get captchas (and possilby an IP ban) every 5 - 10 searches if you scrape all returned pages every time. Currently there is nothing setup to detect captchas (and the possible IP bans that follow), so the status will just show nothing after about a minute. This means you got a captcha (or ban) and must change your VPN address.

### 
Don't screw this up, because you don't want your actual IP address banned...
### 

This app was tested thouroughly on Windows. I have no idea how well the principal dependency Puppeteer runs on mac and Linux. However, if that is not an issue, since I have this app set up like my other project, OfflineOpenPGP, then it should work on Linux and Mac too, hopefully.

## Install instructions: 

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

open -n -a nwjs --args "[path/to/src]"

Example (src is separate, on the desktop): 

open -n -a nwjs --args "Users/macbook/Desktop/src"

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
If you find this project useful, feel free to dump a tiny bit of crypto in my wallet:

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
