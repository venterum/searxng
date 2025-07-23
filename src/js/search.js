/* SPDX-License-Identifier: AGPL-3.0-or-later */
(function (w, d, searxng) {
  'use strict';

  var qinput_id = "q", qinput;

  function submitIfQuery () {
    if (qinput.value.length  > 0) {
      var search = document.getElementById('search');
      setTimeout(search.submit.bind(search), 0);
    }
  }

  function createClearButton (qinput) {
    var cs = document.getElementById('clear_search');
    var updateClearButton = function () {
      if (qinput.value.length === 0) {
        cs.classList.add("empty");
      } else {
        cs.classList.remove("empty");
      }
    };

    // update status, event listener
    updateClearButton();
    cs.addEventListener('click', function (ev) {
      qinput.value = '';
      qinput.focus();
      updateClearButton();
      ev.preventDefault();
    });
    qinput.addEventListener('keydown', updateClearButton, false);
  }

  const fetchResults = async (query) => {
    let request;
    if (searxng.settings.method === 'GET') {
      const reqParams = new URLSearchParams();
      reqParams.append("q", query);
      request = fetch("./autocompleter?" + reqParams.toString());
    } else {
      const formData = new FormData();
      formData.append("q", query);
      request = fetch("./autocompleter", {
        method: 'POST',
        body: formData,
      });
    }

    request.then(async function (response) {
      const results = await response.json();

      if (!results) return;

      const autocomplete = d.querySelector(".autocomplete");
      const autocompleteList = d.querySelector(".autocomplete ul");
      autocomplete.classList.add("open");
      autocompleteList.innerHTML = "";

      // show an error message that no result was found
      if (!results[1] || results[1].length == 0) {
        const noItemFoundMessage = document.createElement("li");
        noItemFoundMessage.classList.add('no-item-found');
        noItemFoundMessage.innerHTML = searxng.settings.translations.no_item_found;
        autocompleteList.appendChild(noItemFoundMessage);
        return;
      }

      for (let result of results[1]) {
        const li = document.createElement("li");
        li.innerText = result;

        searxng.on(li, 'mousedown', () => {
          qinput.value = result;
          const form = d.querySelector("#search");
          form.submit();
          autocomplete.classList.remove('open');
        })
        autocompleteList.appendChild(li);
      }
    });
  }

  searxng.ready(function () {
    // Focus search input on large screens, only on the root directory
    if (window.location.pathname === '/' && window.matchMedia("(min-width: 50em)").matches) document.getElementById("q").focus();
    qinput = d.getElementById(qinput_id);
    const autocomplete = d.querySelector(".autocomplete");
    const autocompleteList = d.querySelector(".autocomplete ul");

    if (qinput !== null) {
      // clear button
      createClearButton(qinput);

      // autocompleter
      if (searxng.settings.autocomplete) {
        searxng.on(qinput, 'input', () => {
          const query = qinput.value;
          if (query.length < searxng.settings.autocomplete_min) return;
          fetchResults(query);
        });

        searxng.on(qinput, 'keyup', (e) => {
          let currentIndex = -1;
          const listItems = autocompleteList.children;
          for (let i = 0; i < listItems.length; i++) {
            if (listItems[i].classList.contains('active')) {
              currentIndex = i;
              break;
            }
          }

          let newCurrentIndex = -1;
          if (e.key === "ArrowUp") {
            if (currentIndex >= 0) listItems[currentIndex].classList.remove('active');
            // we need to add listItems.length to the index calculation here because the JavaScript modulos
            // operator doesn't work with negative numbers
            newCurrentIndex = (currentIndex - 1 + listItems.length) % listItems.length;
          } else if (e.key === "ArrowDown") {
            if (currentIndex >= 0) listItems[currentIndex].classList.remove('active');
            newCurrentIndex = (currentIndex + 1) % listItems.length;
          } else if (e.key === "Tab" || e.key === "Enter") {
            autocomplete.classList.remove('open');
          }

          if (newCurrentIndex != -1) {
            const selectedItem = listItems[newCurrentIndex];
            selectedItem.classList.add('active');

            if (!selectedItem.classList.contains('no-item-found')) qinput.value = selectedItem.innerText;
          }
        });
      }
    }

    // Additionally to searching when selecting a new category, we also
    // automatically start a new search request when the user changes a search
    // filter (safesearch, time range or language) (this requires JavaScript
    // though)
    if (
      qinput !== null
        && searxng.settings.search_on_category_select
      // If .search_filters is undefined (invisible) we are on the homepage and
      // hence don't have to set any listeners
        && d.querySelector(".search_filters") != null
    ) {
      searxng.on(d.getElementById('safesearch'), 'change', submitIfQuery);
      searxng.on(d.getElementById('time_range'), 'change', submitIfQuery);
      searxng.on(d.getElementById('language'), 'change', submitIfQuery);
    }

    const categoryButtons = d.querySelectorAll("button.category_button");
    for (let button of categoryButtons) {
      searxng.on(button, 'click', (event) => {
        if (event.shiftKey) {
          event.preventDefault();
          button.classList.toggle("selected");
          return;
        }

        // manually deselect the old selection when a new category is selected
        const selectedCategories = d.querySelectorAll("button.category_button.selected");
        for (let categoryButton of selectedCategories) {
          categoryButton.classList.remove("selected");
        }
        button.classList.add("selected");
      })
    }

    // override form submit action to update the actually selected categories
    const form = d.querySelector("#search");
    if (form != null) {
      searxng.on(form, 'submit', (event) => {
        event.preventDefault();
        const categoryValuesInput = d.querySelector("#selected-categories");
        if (categoryValuesInput) {
          let categoryValues = [];
          for (let categoryButton of categoryButtons) {
            if (categoryButton.classList.contains("selected")) {
              categoryValues.push(categoryButton.name.replace("category_", ""));
            }
          }
          categoryValuesInput.value = categoryValues.join(",");
        }
        form.submit();
      });
    }
  });

})(window, document, window.searxng);