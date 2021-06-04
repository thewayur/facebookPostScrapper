const puppeteer = require("puppeteer");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const WAIT_FOR_PAGE = 1000;
const DELAY_INPUT = 1;

(async () => {
  const calculateDate = require("./DateFormatter");
  try {
    //taking arguments
    args = process.argv;
    //source to scrap
    let source = args[2];
    //period to scrap to in days
    let period = args[3];
    //calculating the date we will scrap to
    if (typeof parseInt(period) == "number" && period == parseInt(period)) {
      console.log(source);
      console.log(period);
      let targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - period);
      var dd = String(targetDate.getDate()).padStart(2, "0");
      var mm = String(targetDate.getMonth() + 1).padStart(2, "0");
      var yyyy = targetDate.getFullYear();
      targetDate = mm + "/" + dd + "/" + yyyy;
      console.log("will scrap till " + targetDate);
    } else {
      console.log("please enter a valid numeric period of day as third arg");
      delay(10);
      process.exit(1);
    }
    //starting Chrome
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROME_PATH,
      headless: false,
    });
    const context = browser.defaultBrowserContext();
    await context.overridePermissions(process.env.FB_LOGIN, ["notifications"]);

    //Opening the Facebook Login
    const page = await browser.newPage({ viewport: null });
    await page.goto(process.env.FB_LOGIN);
    await delay(WAIT_FOR_PAGE);

    //logging in
    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', process.env.FB_USER, {
      delay: DELAY_INPUT,
    });
    await page.type('input[name="pass"]', process.env.FB_PW, {
      delay: DELAY_INPUT,
    });
    await Promise.all([
      await page.click('button[data-testid="royal_login_button"]'),
      page.waitForNavigation({ waitUntil: "networkidle0" })
    ]);

    //Opening the Facebook Group
    let target = "https://m.facebook.com/" + source;
    await page.goto(target);
    await delay(WAIT_FOR_PAGE);

    let posts = await page.evaluate(async () => {
      // let calculateDate = require("./DateFormatter.js");
      var delay = (time) => {
        return new Promise(function (resolve) {
          setTimeout(resolve, time);
        });
      };

      let scrap = (document) => {
        class Post {
          cosntructor(
            author,
            caption,
            verified,
            date ,
            likes,
            shares,
            comments
          ) {
            this.author = author;
            this.verified = verified;
            this.date = date;
            this.caption = caption;
            this.likes = likes;
            this.shares = shares;
            this.comments = comments;
          }
        }
        //Selecting a post
        let postContainer = document.querySelector("div.story_body_container");
        // console.log("the post");
        // console.log(postContainer);

        //scraping post Author
        postAuthor = postContainer.querySelector(
          "header > div._4g34._5i2i._52we > div > div > div._4g34 > h3 > strong > span > a"
        ).innerText;
        console.log("Author");
        console.log(postAuthor);

        //scraping post Varification status
        postVerified = postContainer.querySelector(
          "header > div._4g34._5i2i._52we > div > div > div._4g34 > h3 > strong > span > span"
        );
        let isverified;
        if (postVerified) {
          isverified = true;
        } else {
          isverified = false;
        }
        console.log("verification status");
        console.log(isverified);

        //scraping post Date
        postDate = postContainer.querySelector("abbr").innerText;
        console.log("date");
        console.log(postDate);
        postDate = calculateDate(postDate);
        console.log("date");
        console.log(postDate);

        //scrapping post caption
        postCaption = postContainer.querySelector(
          "div._5rgt._5nk5._5wnf._5msi > div > span > p"
        );

        if (postCaption) {
          postCaption = postCaption.innerText.trim();
        } else {
          postCaption = "";
        }
        console.log("caption");
        console.log(postCaption);

        //selecting post footer
        postFooter = document.querySelector(
          "footer"
        );
        // console.log("footer");
        // console.log(postFooter);

        //scrapping number of likes
        postLikes = postFooter.querySelector(
          "div > div._34qc._3hxn._3myz._4b45 > a > div > div._1w1k > div"
        );

        if (postLikes) {
          postLikes = postLikes.innerText.split(" ")[0];
        } else {
          postLikes = "";
        }
        console.log("Likes");
        console.log(postLikes);

        //scrapping number of comments
        postComments = postFooter.querySelector(
          "div > div._34qc._3hxn._3myz._4b45 > a > div >div._1fnt> span:nth-child(1)"
        );

        if (postComments) {
          postComments = postComments.innerText.split(" ")[0];
        } else {
          postComments = "";
        }
        console.log("Comments");
        console.log(postComments);

        //scrapping number of shares
        postShares = postFooter.querySelector(
          "div > div._34qc._3hxn._3myz._4b45 > a > div >div._1fnt> span:nth-child(2)"
        );

        if (postShares) {
          postShares = postShares.innerText.split(" ")[0];
        } else {
          postShares = "";
        }
        console.log("shares");
        console.log(postShares);

        post = Post(postAuthor, isverified, postDate, postCaption,postLikes,postComments,postShares);
        return post;
      };

      let postArray = [],
        resume;
      window.scrollBy(0, window.innerHeight * 10);
      await delay(1000);
      window.scrollBy(0, window.innerHeight);
      await delay(1000);
      let count = 1;
      do {
        let post;
        console.log("iteration " + count++);
        window.scrollBy(0, window.innerHeight);
        setTimeout((post = await scrap(document)), 0);
        setTimeout(console.log(post), 0);
        setTimeout(() => {
          //date = calculateDate(post.date);
          date = post.date;
          console.log(date);
          if (targetDate === date) {
            resume = true;
          } else {
            resume = false;
          }
        }, 0);
        posts.push(post);
      } while (resume);
      return postArray;
    });
    console.log(posts);
    //closing the browser
    await browser.close();
  } catch (error) {
    console.error(
      "--------------------------\nCatched error \n" +
        error.stack +
        "\n--------------------------------"
    );
    //console.log("Catched error ", error.stack);
  }
})();

//Storig data into json file
const storeDataInJSON = async (file, data) => {
  console.log(data);
  return fs.writeFileSync(file, JSON.stringify(data), (err) => {
    if (err) {
      return err;
    }
    return;
  });
};

var delay = (time) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};
