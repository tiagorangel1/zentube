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
// @grant        GM_deleteValue
// @sandbox      DOM
// @updateURL    https://raw.githubusercontent.com/tiagorangel/zentube/main/src/userscript.user.js
// @downloadURL  https://raw.githubusercontent.com/tiagorangel/zentube/main/src/userscript.user.js
// @connect      raw.githubusercontent.com
// ==/UserScript==

(async function () {
  let filtersCache = JSON.parse(GM_getValue('filters', '{ cached: false }'));

  const updateFilters = async () => {
    const [comments, users] = await Promise.all([
      (async function () {
        return JSON.parse((await GM.xmlHttpRequest({ url: "https://raw.githubusercontent.com/tiagorangel/zentube/main/filters/comments.json" })).responseText)
      })(),
      (async function () {
        return (await GM.xmlHttpRequest({ url: "https://raw.githubusercontent.com/tiagorangel/zentube/main/filters/users.txt" })).responseText.split("\n")
      })(),
    ])

    const data = {
      cached: true,
      comments,
      users
    };

    await GM.setValue("filters", JSON.stringify(data));
    filtersCache = data;
  }

  if (!filtersCache.cached) {
    await updateFilters();
  } else {
    try {
      updateFilters();
    } catch { }
  }

  console.log("filtersCache", filtersCache)
})();