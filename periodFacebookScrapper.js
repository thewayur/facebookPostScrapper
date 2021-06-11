const puppeteer = require("puppeteer");
const fs = require("fs");
const dotenv = require("dotenv");
const { resolve } = require("path");
dotenv.config();

const WAIT_FOR_PAGE = 1000;
const DELAY_INPUT = 1;
let targetDate;

(async () => {
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
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - period);
      var dd = String(targetDate.getDate());
      var mm = String(targetDate.getMonth() + 1);
      var yyyy = targetDate.getFullYear();
      targetDate = mm + "/" + dd + "/" + yyyy;
      console.log("will scrap till " + targetDate);
    } else {
      console.log("please enter a valid numeric period of day as third arg");
      process.exit(1);
    }
    //starting Chrome
    const browser = await puppeteer.launch({
      headless: true,
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

    let pastposts = await page.evaluate(async (targetDate) => {
      let posts = [];

      var delay = (time) => {
        return new Promise(function (resolve) {
          setTimeout(resolve, time);
        });
      };

      let dateGreaterthanorEqual = (date, targetdate) => {
        try{
          temp1 = targetdate.split("/");
        //console.log("target date", temp1);
        temp2 = date.split("/");
        //console.log("post date", temp2);
        let eq;
        if (
          //months are the same
          parseInt(temp2[0]) == parseInt(temp1[0]) &&
          //post date day is greater than target date day
          parseInt(temp2[1]) >= parseInt(temp1[1]) &&
          //years are the same
          parseInt(temp2[2]) == parseInt(temp1[2])
        ) {
          eq = true;
        } else {
          console.log("post date is beyond target date");
          eq = false;
        }
        return eq;
        }catch(error){
          console.error("error while comparing dates",error.message,error.stack);
          throw error;
        }
      };
      const calculateDate = (dateScrapped) => {
        var dateCalculated = new Date();

        dateWords = dateScrapped.split(" ");

        if (dateScrapped.includes("now")) {
          return dateCalculated.toLocaleString();
        } else if (
          dateScrapped.includes("min") ||
          dateScrapped.includes("minute")
        ) {
          var mins = dateScrapped.substr(0, dateScrapped.indexOf(" "));
          dateCalculated.setMinutes(dateCalculated.getMinutes() - mins);
          return dateCalculated.toLocaleString();
        } else if (
          dateScrapped.includes("hr") ||
          dateScrapped.includes("hour")
        ) {
          var hours = dateScrapped.substr(0, dateScrapped.indexOf(" "));
          dateCalculated.setHours(dateCalculated.getHours() - hours);
          return dateCalculated.toLocaleString();
        } else if (dateScrapped.includes("Yesterday")) {
          //  Yesterday at 11:48 AM
          dateCalculated.setHours(dateCalculated.getHours() - 24);
          dateCalculated.setHours(0);
          dateCalculated.setMinutes(0);
          dateCalculated.setSeconds(0);
          var date = dateScrapped.split(" ");
          var hours = date[2].split(":")[0];
          var mins = date[2].split(":")[1];

          dateCalculated.setHours(hours);
          dateCalculated.setMinutes(mins);

          return dateCalculated.toLocaleString();
        } else if (dateWords.length === 5) {
          //  17 December 2020 at 11:24

          const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];

          const shortMonths = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];

          var date = dateScrapped.split(" ");
          var day = date[0];
          var month = date[1];
          var year = date[2];
          var hours = date[4].split(":")[0];
          var mins = date[4].split(":")[1];

          var result = new Date(
            year,
            month.length > 3
              ? months.indexOf(month)
              : shortMonths.indexOf(month),
            day,
            hours,
            mins
          );

          return result.toLocaleString();
        } else {
          //  March 31 at 4:01 PM

          const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];

          const shortMonths = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];

          var date = dateScrapped.split(" ");
          var day = date[0];
          var month = date[1];
          if (date[3]) {
            var hours = date[3].split(":")[0];
            var mins = date[3].split(":")[1];
          } else {
            var hours = "0";
            var mins = "0";
          }

          var result = new Date(
            dateCalculated.getFullYear(),
            month.length > 3
              ? months.indexOf(month)
              : shortMonths.indexOf(month),
            day,
            hours,
            mins
          );

          return result.toLocaleString();
        }
      };

      let scrap = (count) => {
        try {
          //console.log(count);
          //Selecting a post
          let article = document.querySelectorAll("article")[count];

          let postContainer = article.querySelector("div.story_body_container");
          // console.log("the post");
          // console.log(postContainer);

          //scraping post Author
          postAuthor = postContainer.querySelector(
            "header > div._4g34._5i2i._52we > div > div > div._4g34 > h3 > :nth-child(1) > :nth-child(1)"
          ).innerText;
          // console.log("Author");
          // console.log(postAuthor);

          //scraping post Varification status
          postVerified = postContainer.querySelector(
            "header > div._4g34._5i2i._52we > div > div > div._4g34 > h3> :nth-child(1)>:nth-child(2)"
          );
          postVerifiedlive = postContainer.querySelector(
            "header > div._4g34._5i2i._52we > div > div > div._4g34 > h3>:nth-child(1)>:nth-child(1)>:nth-child(2)"
          );
          let isverified;
          if (postVerified || postVerifiedlive) {
            isverified = true;
          } else {
            isverified = false;
          }
          // console.log("verification status");
          // console.log(isverified);

          //scraping post Date
          postDate = postContainer.querySelector("abbr").innerText;
          postDate = calculateDate(postDate);
          // console.log("date");
          // console.log(postDate);

          //scrapping post caption
          postCaption = postContainer.querySelector(
            "div._5rgt._5nk5._5wnf._5msi > div > span > p"
          );

          if (postCaption) {
            postCaption = postCaption.innerText.trim();
          } else {
            postCaption = "";
          }
          // console.log("caption");
          // console.log(postCaption);

          //selecting post footer
          postFooter = article.querySelector("footer");
          // console.log("footer");
          // console.log(postFooter);

          //scrapping number of likes
          postLikes = postFooter.querySelector(
            "div > div._34qc._3hxn._3myz._4b45 > a > div > div._1w1k > div"
          );

          if (postLikes) {
            postLikes = postLikes.innerText.trim();
            console.log(postLikes);
            if (postLikes.contains("and")) {
              let temp = postLikes.split("and");
              postLikes = temp[1].trim();
              temp = postLikes.split(" "); 
              postLikes = temp[0].trim();
            } else if (postLikes.contains(" ")) {
              postLikes = postLikes.split(" ")[0];
            }
          } else {
            postLikes = "";
          }
          // console.log("Likes");
          // console.log(postLikes);

          //scrapping number of comments
          postComments = postFooter.querySelector(
            "div > div._34qc._3hxn._3myz._4b45 > a > div >div._1fnt> span:nth-child(1)"
          );

          if (postComments) {
            postComments = postComments.innerText.trim();
            console.log(postComments);
            if (postComments.contains("and")) {
              let temp = postComments.split("and");
              postComments = temp[1].trim();
              temp = postComments.split(" ");
              postComments = temp[0].trim();
            } else if (postComments.contains(" ")) {
              postComments = postComments.split(" ")[0];
            }
          } else {
            postComments = "";
          }
          // console.log("Comments");
          // console.log(postComments);

          //scrapping number of shares
          postShares = postFooter.querySelector(
            "div > div._34qc._3hxn._3myz._4b45 > a > div >div._1fnt> span:nth-child(2)"
          );

          if (postShares) {
            postShares = postShares.innerText.trim();
            console.log(postShares);
            if (postShares.contains("and")) {
              let temp = postShares.split("and");
              postShares = temp[1].trim();
              temp = postShares.split(" ");
              postShares = temp[0].trim();
            } else if (postShares.contains(" ")) {
              postShares = postShares.split(" ")[0];
            }
          } else {
            postShares = "";
          }
          // console.log("shares");
          // console.log(postShares);

          post = {
            id: count,
            author: postAuthor,
            verified: isverified,
            date: postDate,
            caption: postCaption,
            likes: postLikes,
            comments: postComments,
            shares: postShares,
          };
          return post;
        } catch (error) {
          console.error("error while scrapping", error.stack);
        }
      };
      try {
        let resume;
        window.scrollBy(0, window.innerHeight * 10);
        await delay(1000);
        window.scrollBy(0, window.innerHeight);
        await delay(1000);
        let count = 0;
        do {
          //console.log("iteration" + count);
          post = await scrap(count);
          date = post.date.split(",")[0];
          //console.log(targetDate + "..." + date);
          //console.log(post);
          if (dateGreaterthanorEqual(date, targetDate)) {
            resume = true;
            posts.push(post);
            window.scrollBy(0, window.innerHeight * 5);
            await delay(500);
            count++;
          } else {
            resume = false;
          }
        } while (resume);
      } catch (error) {
        console.error();
      }
      return posts;
    }, targetDate);
    posts = pastposts;
    dates2 = targetDate.split("/");

    // directory path
    const dir = "./output/" + source;
    try {
      // create new directory
      fs.mkdir(dir, (err) => {
        console.log("a new Directory was created for output " + dir);
      });
    } catch (error) {
      if (error.errno == -4075) {
      } else {
        console.error();
      }
    }
    savingName =
      dir +
      "/" +
      source +
      "_" +
      dates2[0] +
      "-" +
      dates2[1] +
      "-" +
      dates2[2] +
      ".json";
    await storeDataInJSON(savingName, posts);
    console.log("saved scraps in " + savingName);
    //closing the browser
    await browser.close();
  } catch (error) {
    console.error(
      "--------------------------\n" +
        "some Error occured" + error.stack +
        "\n--------------------------------"
    );
  }
})();

//Storig data into json file
const storeDataInJSON = async (file, data) => {
  //console.log(data);
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

// let datesEqual = (date1, date2) => {
//   temp1 = date1.split("/");
//   temp2 = date2.split("/");
//   eq = false;
//   if (temp1[0] == temp2[0] && temp1[1] == temp2[1] && temp1[2] == temp2[2]) {
//     eq = true;
//   }
//   return eq;
// };
