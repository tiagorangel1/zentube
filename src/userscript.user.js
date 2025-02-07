// ==UserScript==
// @name         ZenTube
// @namespace    zentube
// @copyright    AGPL-3.0
// @version      0.1.0
// @description  Clean YouTube comments from hate, spam, harassment and trolls.
// @author       Tiago Rangel
// @match        *://youtube.com/*
// @match        *://www.youtube.com/*
// @include      *://www.youtube.com/**
// @include      *://youtube.com/**
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// @sandbox      DOM
// @updateURL    https://raw.githubusercontent.com/tiagorangel/zentube/main/src/userscript.user.js
// @downloadURL  https://raw.githubusercontent.com/tiagorangel/zentube/main/src/userscript.user.js
// @connect      raw.githubusercontent.com
// ==/UserScript==

(async function () {
  let filtersCache = JSON.parse(GM_getValue('filters', '{ "cached": false }'));

  const updateFilters = async () => {
    const [comments, users] = await Promise.all([
      (async function () {
        return JSON.parse((await GM_xmlhttpRequest({ url: "https://raw.githubusercontent.com/tiagorangel/zentube/main/filters/comments.json" })).responseText)
      })(),
      (async function () {
        return (await GM_xmlhttpRequest({ url: "https://raw.githubusercontent.com/tiagorangel/zentube/main/filters/users.txt" })).responseText.split("\n")
      })(),
    ])

    const data = {
      cached: true,
      comments,
      users
    };

    GM_setValue("filters", JSON.stringify(data));
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