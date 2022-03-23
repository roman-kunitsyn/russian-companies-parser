const https = require("https");
const { parse } = require("node-html-parser");
const fs = require("fs");

getRecuestForCompanies();

function getRecuestForCompanies() {
  let url =
    "https://inventure.com.ua/news/world/polnyj-spisok:-inostrannye-kompanii-kotorye-ushli-iz-rossii";

  let request = https.get(url, (res) => {
    if (res.statusCode !== 200) {
      console.error(
        `Did not get an OK from the server. Code: ${res.statusCode}`,
      );
      res.resume();
      return;
    }
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("close", () => {
      let json = transformHtmlDataToJson(data);
      fs.writeFile(
        "russian-companies-status.json",
        JSON.stringify(json, null, 2),
        function (err) {
          if (err) {
            throw err;
          }
          console.log("Saved!");
        },
      );
    });
  });
}

function transformHtmlDataToJson(data) {
  let document = parse(data);
  let table = document.querySelectorAll("table tbody tr");
  table.forEach = [].forEach;
  let arrayOfCompanies = [];

  let state = "";
  let description = "";

  table.forEach((item, index, array) => {
    let record = item.querySelectorAll("td");
    if (record.length === 1) {
      state = record[0].innerText
        .split("/")[0]
        .replace(/&nbsp;/g, "")
        .trim();
      description = record[0].innerText
        .split("/")[1]
        .replace(/&nbsp;/g, "")
        .split("(")[0]
        .trim();
      return;
    } else {
      let title = record[0].innerText;
      let action = record[1].innerText;
      if (
        action.toUpperCase() === "Действия".toUpperCase() &&
        title.toUpperCase() === "Название".toUpperCase()
      ) {
        return;
      }
      state;
      arrayOfCompanies.push(
        getCompanyRecord(title, action, state, description),
      );
    }
  });
  return arrayOfCompanies;
}

function getCompanyRecord(title, action, state, description) {
  return {
    title,
    action,
    state,
    description,
  };
}
