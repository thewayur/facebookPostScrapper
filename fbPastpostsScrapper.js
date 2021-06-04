const puppeteer = require("puppeteer");
const fs = require("fs");
const calculateDate = require("./DateFormatter.js").default;
const dotenv = require("dotenv");
dotenv.config();

//Main Function
(async () => {
  try {
    //taking arguments
    args = process.argv;
    //source to scrap
    let source = args[2];
    //period to scrap to in days
    let period = args[3];

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

    //setting up puppeteer
    let target = "https://m.facebook.com/" + source;
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: true,
      args: ["--lang=en-US,en-GB,en"],
      executablePath: process.env.CHROME_PATH,
    });
    page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US",
    });

    await page.goto(target, {
      waitUntil: "networkidle0",
    });

    //scraping function
    const posts = await page.evaluate(async () => {
      let posts = [];
      var postcounter = 0;
      //Scraping Data Function
      window.scrollBy(0, window.innerHeight * 10);
      function delay(time) {
        return new Promise(function (resolve) {
          setTimeout(resolve, time);
        });
      }
      await delay(1000);

      async function scrapData() {
        try {
          await window.scrollBy(0, window.innerHeight * 10);

          await delay(2000);

          class Post {
            constructor(document) {
              this.document = document;

              //Selecting a post
              this.postContainer = document.querySelector(
                "#pages_msite_body_contents > div > div:nth-child(4) > div:nth-child(2)"
              );

              //scraping post caption
              this.postdata = this.postContainer.querySelector(
                "div > div._5rgt._5nk5._5wnf._5msi > div > span"
              );
              //console.log(this.postdata);

              //getting post author name
              this.postAuthor = this.postContainer.querySelector("strong");
              //console.log(this.postAuthor);

              //checking the verification badge
              this.postAuthorVerified = this.postContainer.querySelector(
                "span._56_f._5dzy._5dz-._3twv"
              );
              //console.log(this.postAuthorVerified);
              if (this.postAuthorVerified) {
                this.postAuthorVerified = true;
              } else {
                this.postAuthorVerified = false;
              }
              //console.log(this.postAuthorVerified);

              //scraping post date
              this.postTimestamp = this.postContainer.querySelector("abbr");
              //console.log(this.postTimestamp);

              //selecting post footer
              this.postFooter = this.postContainer.querySelector(
                "div._2og4.slimLike._15kj._34qc._4b45"
              );
              //console.log(this.postFooter);

              //scraping number of likes
              this.postLikes = this.postFooter.querySelector(
                "span.like_def._28wy"
              );
              //console.log(this.postLikes);

              //scraping number of comments
              this.postComments =
                this.postFooter.querySelector("span.cmt_def._28wy");
              //console.log(this.postComments);

              //scraping number of Shares
              this.postShares = this.postFooter.querySelector(
                "#counts_feedback_inline_304017164657485 > a > span._28wy"
              );
              //console.log(this.postShares);
            }

            getpostfeatures() {
              try {
                let data = {};
                //gettin the features we are intrested in from the post
                data.author = this.postAuthor.innerText.trim();
                data.isVerified = this.postAuthorVerified;
                data.date = this.postTimestamp.innerText;
                if (this.postdata) {
                  data.post = this.postdata.innerText.trim();
                } else {
                  data.post = "";
                }
                if (this.postLikes) {
                  data.likes = this.postLikes.innerText.trim();
                } else {
                  data.likes = "";
                }
                if (this.postComments) {
                  data.comments = this.postComments.innerText.trim();
                } else {
                  data.comments = "";
                }
                if (this.postShares) {
                  data.shares = this.postShares.innerText.trim();
                } else {
                  data.shares = "";
                }
                if (postTimestamp) {
                  postTimestamp = postTimestamp.innerText;
                } else {
                  postTimestamp = "";
                }
                return data;
              } catch (error) {
                console.log("scrap post error ===> ", error);
              }
            }

            //to remove the post
            removepost() {
              this.postdata.remove();
              this.postContainer.remove();
              this.postLikes.remove();
              this.postFooter.remove();
              this.postAuthor.remove();
              this.postAuthorVerified = null;
              this.postTimestamp.remove();
              this.postShares.remove();
              this.postComments.remove();
            }
          } //end of post class

          const post = new Post(document);

          if (post.postAuthor) {
            postcounter++;
            let mydata = await post.getpostfeatures();
            posts.push({
              post_id: postcounter,
              author: mydata.author,
              isVerified: mydata.isVerified,
              timestamp: mydata.date,
              post: mydata.post,
              likes: mydata.likes,
              comments: mydata.comments,
              shares: mydata.shares,
            });
            console.log(posts);
            //console.log(mydata.date);
            //var date = await calculateDate(mydata.timestamp);
            //console.log(date);
            post.removepost();
            //if (date.normalize()!==targetDate.normalize())  await scrapData();
            // else {
            //   return {
            //     posts: posts,
            //   };
            // }
            await scrapData();
            return posts;
          } else {
            console.log("postList if no post found ==> ", posts);
            return {
              posts: posts,
            };
          }
        } catch (error) {
          console.error("error from scrapDataFunction ==>", error);
        }
      }
      await scrapData();
    });

    //storing the posts we scraped in a json file
    storeDataInJSON("./output/pastposts.json", posts);

    //closing the browser
    //await browser.close();
  } catch (error) {
    console.log("Catched error message", error.message);
    console.log("Catched error stack", error.stack);
    console.log("Catched error ", error);
  }
})();

const scrapPost = () => {};
