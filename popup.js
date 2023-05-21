document.addEventListener("DOMContentLoaded", function () {
  var bookmarkInput = document.getElementById("bookmarkInput");
  var shortcutInput = document.getElementById("shortcutInput");
  var bookmarkButton = document.getElementById("bookmarkButton");
  var bookmarkList = document.getElementById("bookmarkList");

  // Load the bookmarks from storage
  chrome.storage.sync.get("bookmarks", function (data) {
    var bookmarks = data.bookmarks || [];
    displayBookmarks(bookmarks);
  });

  bookmarkButton.addEventListener("click", function () {
    var url = bookmarkInput.value.trim();
    var shortcut = shortcutInput.value.trim();

    if (url !== "" && shortcut !== "") {
      // Retrieve existing bookmarks from storage
      chrome.storage.sync.get("bookmarks", function (data) {
        var bookmarks = data.bookmarks || [];
        bookmarks.push({ url: url, shortcut: shortcut });

        // Save updated bookmarks to storage
        chrome.storage.sync.set({ bookmarks: bookmarks }, function () {
          displayBookmarks(bookmarks);
          bookmarkInput.value = "";
          shortcutInput.value = "";
        });
      });
    }
  });

  // Event delegation to handle opening the link in a new tab and removing a bookmark
  bookmarkList.addEventListener("click", function (event) {
    if (event.target.classList.contains("openButton")) {
      event.preventDefault();
      var bookmarkItem = event.target.parentNode;
      var url = bookmarkItem.dataset.url;
      chrome.tabs.create({ url: url });
    } else if (event.target.classList.contains("removeButton")) {
      event.preventDefault();
      var bookmarkItem = event.target.parentNode;
      var url = bookmarkItem.dataset.url;
      removeBookmark(url);
    }
  });

  // Keyboard shortcut to open a bookmarked link
  document.addEventListener("keydown", function (event) {
    if (event.ctrlKey) {
      var shortcut = String.fromCharCode(event.keyCode).toLowerCase();
      chrome.storage.sync.get("bookmarks", function (data) {
        var bookmarks = data.bookmarks || [];
        var matchedBookmark = bookmarks.find(function (bookmark) {
          return bookmark.shortcut.toLowerCase() === shortcut;
        });

        if (matchedBookmark) {
          event.preventDefault();
          chrome.tabs.create({ url: matchedBookmark.url });
        }
      });
    }
  });

  function displayBookmarks(bookmarks) {
    bookmarkList.innerHTML = "";
    bookmarks.forEach(function (bookmark) {
      var listItem = document.createElement("li");
      listItem.className = "bookmarkItem";
      listItem.dataset.url = bookmark.url;

      var link = document.createElement("a");
      link.href = bookmark.url;
      link.target = "_blank";
      link.textContent = bookmark.url;
      link.className = "bookmarkLink";

      var shortcutSpan = document.createElement("span");
      shortcutSpan.textContent = "Shortcut: Ctrl+" + bookmark.shortcut;
      shortcutSpan.className = "shortcutSpan";

      var openButton = document.createElement("button");
      openButton.textContent = "Open";
      openButton.className = "openButton";

      var removeButton = document.createElement("button");
      removeButton.textContent = "Remove";
      removeButton.className = "removeButton";

      listItem.appendChild(link);
      listItem.appendChild(shortcutSpan);
      listItem.appendChild(openButton);
      listItem.appendChild(removeButton);
      bookmarkList.appendChild(listItem);
    });
  }

  function removeBookmark(url) {
    chrome.storage.sync.get("bookmarks", function (data) {
      var bookmarks = data.bookmarks || [];
      var updatedBookmarks = bookmarks.filter(function (bookmark) {
        return bookmark.url !== url;
      });

      // Save updated bookmarks to storage
      chrome.storage.sync.set({ bookmarks: updatedBookmarks }, function () {
        displayBookmarks(updatedBookmarks);
      });
    });
  }
});
