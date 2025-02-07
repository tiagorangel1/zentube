// ==UserScript==
// @name         ZenTube
// @namespace    zentube
// @copyright    AGPL-3.0
// @version      0.1.0
// @description  Clean YouTube comments from hate, spam, harassment and trolls.
// @author       Tiago Rangel
// @match        http://youtube.com/*
// @match        https://youtube.com/*
// @match        http://www.youtube.com/*
// @match        https://www.youtube.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @sandbox      DOM
// @updateURL    https://raw.githubusercontent.com/tiagorangel/zentube/main/src/userscript.user.js
// @downloadURL  https://raw.githubusercontent.com/tiagorangel/zentube/main/src/userscript.user.js
// @connect      raw.githubusercontent.com
// ==/UserScript==

(async function () {
  let filtersCache = JSON.parse(GM_getValue('filters', '{ "cached": false }'));

  const updateFilters = async () => {
    try {
      const [comments, users] = await Promise.all([
        fetch("https://raw.githubusercontent.com/tiagorangel/zentube/main/filters/comments.json")
          .then(response => response.json()),
        fetch("https://raw.githubusercontent.com/tiagorangel/zentube/main/filters/users.txt")
          .then(response => response.text())
          .then(text => text.split("\n"))
      ]);

      const data = {
        cached: true,
        comments,
        users
      };

      GM_setValue("filters", JSON.stringify(data));
      filtersCache = data;
      console.log("Filters updated:", data);
    } catch (error) {
      console.error("Error updating filters:", error);
    }
  }

  if (!filtersCache.cached) {
    console.log("Initial filter update");
    await updateFilters();
  } else {
    console.log("Cache exists, updating in background");
    try {
      updateFilters();
    } catch (error) {
      console.error("Background update failed:", error);
    }
  }

  console.log("filtersCache:", filtersCache);
})();