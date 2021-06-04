const calculateDate = (dateScrapped) => {
  var dateCalculated = new Date();

  dateWords = dateScrapped.split(" ");

  if (dateScrapped.includes("now")) {
    return dateCalculated.toLocaleString();
  } else if (dateScrapped.includes("min") || dateScrapped.includes("minute")) {
    var mins = dateScrapped.substr(0, dateScrapped.indexOf(" "));
    dateCalculated.setMinutes(dateCalculated.getMinutes() - mins);
    return dateCalculated.toLocaleString();
  } else if (dateScrapped.includes("hr") || dateScrapped.includes("hour")) {
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
      month.length > 3 ? months.indexOf(month) : shortMonths.indexOf(month),
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
      month.length > 3 ? months.indexOf(month) : shortMonths.indexOf(month),
      day,
      hours,
      mins
    );

    return result.toLocaleString();
  }
};

module.exports =  calculateDate;
