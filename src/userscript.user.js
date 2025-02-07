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
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// @sandbox      DOM
// @updateURL    https://github.com/tiagorangel1/zentube/raw/refs/heads/main/src/userscript.user.js
// @downloadURL  https://github.com/tiagorangel1/zentube/raw/refs/heads/main/src/userscript.user.js
// @connect      raw.githubusercontent.com
// ==/UserScript==

(async function () {
  const API_ENDPOINT = "https://raw.githubusercontent.com/tiagorangel1/zentube/refs/heads/main/dist/filters/";
  let filtersCache = JSON.parse(GM_getValue('filters', '{ "cached": false }'));

  const updateFilters = async () => {
    const [comments, users] = await Promise.all([
      (async function () {
        return JSON.parse((await GM_xmlhttpRequest({ url: `${API_ENDPOINT}comments.json` })).responseText)
      })(),
      (async function () {
        return (await GM_xmlhttpRequest({ url: `${API_ENDPOINT}users.txt` })).responseText.split("\n")
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