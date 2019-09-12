(function () {
  // get elements
  const form = document.getElementById("input-form");
  const input = document.getElementById("input-value");
  const feedback = document.querySelector(".feedback");
  const listItems = document.querySelector(".list-items");
  const clearBtn = document.querySelector(".clearBtn");
  // add event listeners
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const value = input.value;
    if (value === "") {
      showFeedback(feedback, "can not add empty value", "alert-danger");
    } else {
      // add to list
      addItem(value);
      // add to storage
      addStorage(value);
    }
  });
  //delete all items
  clearBtn.addEventListener("click", function () {
    while (listItems.children.length > 0) {
      listItems.removeChild(listItems.children[0]);
      // clear storage
      clearStorage();
    }
  });
  // delete one item
  listItems.addEventListener("click", function (event) {
    if (event.target.parentElement.classList.contains("remove-icon")) {
      let parent = event.target.parentElement.parentElement;
      listItems.removeChild(parent);

      let text = event.target.parentElement.previousElementSibling.textContent;
      clearSingle(text);
      //
    }
  });
  // show all items
  document.addEventListener("DOMContentLoaded", function () {
    loadItems();
  });
  // functions
  // show feedback
  function showFeedback(element, text, result) {
    element.classList.add("showItem", `${result}`);
    element.innerHTML = `<p>${text}</p>`;
    setTimeout(function () {
      element.classList.remove("showItem", `${result}`);
    }, 3000);
  }
  // add item
  function addItem(value) {
    const div = document.createElement("div");
    div.classList.add("item", "my-3", "d-flex", "justify-content-between", "p-2");
    div.innerHTML = `<h5 class="item-title text-capitalize">${value}</h5>
      <span class="remove-icon"><i class="fas fa-trash"></i></span>`;
    listItems.appendChild(div);
    showFeedback(feedback, "item added to the list", "alert-success");
    input.value = "";
  }
  // add to local storage
  function addStorage(value) {
    let items;
    if (localStorage.getItem("grocery-list")) {
      items = JSON.parse(localStorage.getItem("grocery-list"));
    } else {
      items = [];
    }
    items.push(value);
    localStorage.setItem("grocery-list", JSON.stringify(items));
  }
  // clear local storage
  function clearStorage() {
    localStorage.removeItem("grocery-list");
  }
  //clear single item
  function clearSingle(value) {
    const tempItems = JSON.parse(localStorage.getItem("grocery-list"));
    // console.log(tempItems);
    const items = tempItems.filter(function (item) {
      if (item !== value) {
        return item;
      }
    });
    localStorage.removeItem("grocery-list");
    localStorage.setItem("grocery-list", JSON.stringify(items));
  }
  //show all items from local storage
  function loadItems() {
    if (localStorage.getItem("grocery-list")) {
      const items = JSON.parse(localStorage.getItem("grocery-list"));
      items.forEach(function (item) {
        const div = document.createElement("div");
        div.classList.add(
          "item",
          "my-3",
          "d-flex",
          "justify-content-between",
          "p-2"
        );
        div.innerHTML = `<h5 class="item-title text-capitalize">${item}</h5>
      <span class="remove-icon"><i class="fas fa-trash"></i></span>`;
        listItems.appendChild(div);
      });
    }
  }
})();

