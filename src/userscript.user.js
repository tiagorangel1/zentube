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
        return JSON.parse((await GM.xmlHttpRequest({ url: `${API_ENDPOINT}comments.json` })).responseText)
      })(),
      (async function () {
        return (await GM.xmlHttpRequest({ url: `${API_ENDPOINT}users.txt` })).responseText.split("\n")
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

  setInterval(function () {
    const comments = [...document.querySelectorAll("ytd-comment-view-model")].map((comment) => {
      return {
          element: comment,
          author: comment.querySelector("h3 #author-text span").innerText.replace("@", "").trim(),
          body: comment.querySelector("#content-text").innerText
      }
    });

    if (!comments) { return };

    comments.forEach(comment => {
      const { author, body } = comment;

      if (comment.element.getAttribute("data-zentube-parsed")) { return }

      filtersCache.comments.forEach(filter => {
        if (body.includes(filter.text)) {
          comment.element.style.opacity = ".5";
          comment.element.style.backgroundColor = "red";
        }
      });

      filtersCache.users.forEach(filter => {
        if (author === filter) {
          comment.element.style.backgroundColor = "red";
        }
      });

      comment.element.setAttribute("data-zentube-parsed", "true")
    });
  }, 20)
})();