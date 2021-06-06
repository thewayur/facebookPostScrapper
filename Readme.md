# Facebook posts scrapper

## motivation
    this project was built for a client of mine this was not the first of it's kind ie. scrapping facebook but this was the amalgamate of all the previous versions. 

## steps to build this project
    I was requested to build a facebook scrapper for a project as the project growed it was requested to evolve the scrapper to scrap posts in a specified period of time in the past
        
        1. First I had to calculate the date we will scrap to
        
        2. find the format of facebook GUI that has all the data I needed in one place since the normal web version of fb doesn't provide the date of the post easily in terms of elements on the page so I used the mobile version

        3. come up with query selectors that scrapped the post features I needed alot of studying of the HTML and CSS of the page

        4. convert the fb timestamps to dates no 1 mins or 1 days ago instead 
        dd/mm/yyyy 

        5. iterate the posts on a source's page and scroll to load more posts

        6. stop when the posts where from the target date specified by the user

        7. store the posts in a Json file as json objects to be used later

## Description
    This scrapper Uses puppeteer to automate data extraction.
    This script scraps all the features of a post that was deemed important for my client -author,verification,date,caption,likes count,shares count and comments count- the script is a stand alone component.

## why I used Puppeteer
    from my experience with selenium puppeteer is much more simplified and It met all of my critireas some people have concerns about performance but I find that it works great for my needs

## What I learned
    1. Facebooks frontend is very complicated so I learned how to query select elements and use the console of the browser to test different selectors

    2. how to iterate a scroll feed such as facebook

    3. that page.evaluate has a scope of it's own as in it runs on the browser instead of the V8 engine of node so you have to pass data you need to it as arguments in a specific way not like normal functions

    4. was more exposed to the event loop of js since I needed to make the script pause for a while till the scroll command could run and load new posts 

    5. learned more about asyncronous js and callbacks and js promises

## Exclusive features
    * scrap posts and feature of a fb page
    * till a specified date 
    * for a specified source  

## Note
    * Only scrap public pages posts to avoid violating fbs rules and get your account banned also it is unethical to scrap private information and you could face harsh legal actions. use at your own risk. I only used the script to scrap news from facebook pages of news agencies in Egypt.

    * You need node and npm to use this script 

## Installation
    1. you have to create a .env file in the directory of the script with the following
        ```bash 
        FB_LOGIN="https://www.facebook.com/"
        FB_USER="Your facebook account email"
        FB_PW="your facebook account password"
        ```
    2. to install all the dependencies needed
    ```bash
    npm install 
    ```
    3. run by entering
    ```bash 
    node periodFacebookScrapper.js source periodtoscrap
    ```
## Credits 
    Engineer Amira {Client} 
    Engineer Ahmed {Bahaa partner in this project}

## License
[MIT](https://choosealicense.com/licenses/mit/)