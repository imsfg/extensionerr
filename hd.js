chrome.runtime.onInstalled.addListener(() => {
  checkLoginStatus();
});

chrome.runtime.onStartup.addListener(() => {
  checkLoginStatus();
});

function checkLoginStatus() {
  chrome.storage.local.get("token", async (data) => {
    if (data.token) {
      try {
        const response = await fetch("http://localhost:3000/verify-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
        });
        const result = await response.json();
        if (result.success) {
          startExtension();
        } else {
          showLoginPage();
        }
      } catch (error) {
        showLoginPage();
      }
    } else {
      showLoginPage();
    }
  });
}

function showLoginPage() {
  chrome.tabs.create({ url: chrome.runtime.getURL("login.html") });
}

function getDateString(nDate) {
  let nDateDate = nDate.getDate();
  let nDateMonth = nDate.getMonth() + 1;
  let nDateYear = nDate.getFullYear();
  if (nDateDate < 10) {
    nDateDate = "0" + nDateDate;
  }
  if (nDateMonth < 10) {
    nDateMonth = "0" + nDateMonth;
  }
  let presentDate = nDateYear + "-" + nDateMonth + "-" + nDateDate;
  return presentDate;
}

function isValidURL(givenURL) {
  return givenURL && givenURL.includes(".");
}

function getDomain(tablink) {
  if (tablink && tablink.length > 0) {
    let url = tablink[0].url;
    return url.split("/")[2];
  }
  return null;
}

function updateTime() {
  chrome.tabs.query(
    { active: true, lastFocusedWindow: true },
    function (activeTab) {
      let domain = getDomain(activeTab);
      if (isValidURL(domain)) {
        let today = new Date();
        let presentDate = getDateString(today);

        fetch("http://localhost:3000/update-time", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ date: presentDate, domain: domain }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to update time");
            }
            return response.json();
          })
          .then((data) => {
            chrome.browserAction.setBadgeText({
              text: secondsToString(data.timeSoFar, true),
            });
          })
          .catch((error) => {
            console.error(error);
            chrome.browserAction.setBadgeText({ text: "" });
          });
      } else {
        chrome.browserAction.setBadgeText({ text: "" });
      }
    }
  );
}


function startExtension() {
  updateTime(); // Call updateTime when extension starts

  var intervalID = setInterval(updateTime, 1000);
  setInterval(checkFocus, 500);

  function checkFocus() {
    chrome.windows.getCurrent(function (window) {
      if (window.focused) {
        if (!intervalID) {
          intervalID = setInterval(updateTime, 1000);
        }
      } else {
        if (intervalID) {
          clearInterval(intervalID);
          intervalID = null;
        }
      }
    });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      let domain = getDomain(tabs);
      if (domain) {
        fetch(`http://localhost:3000/blocked-websites?date1=${today1}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch blocked websites");
            }
            return response.json();
          })
          .then((blockedWebsites) => {
            if (blockedWebsites.includes(domain)) {
              chrome.tabs.update(tabs[0].id, {
                url: chrome.extension.getURL("index.html"),
              });
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });
  }
}
