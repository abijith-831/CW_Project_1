  const form = document.getElementById('addressForm');
  const addressList = document.getElementById('addressList')


  //========== country code generation script ==============
  const phoneInputField = document.querySelector("#phone");
  const phoneInput = window.intlTelInput(phoneInputField, {
    utilsScript:
      "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
  });

  //=============== editing state tracking ===============
  let isEditing = false;
  let editingIndex = -1;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const address = document.getElementById('address').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const email = document.getElementById('email').value.trim();

    
    const countryCode = "+" + phoneInput.getSelectedCountryData().dialCode;
    const countryName = phoneInput.getSelectedCountryData().name;
    const isoCode = phoneInput.getSelectedCountryData().iso2;
    const fullNumber = countryCode + ' ' + phone  

    
    if(!firstName || !lastName || !address || !phone || !mobile || !email){
      showMessage('please fill all the fields','red')
        if (!firstName) document.getElementById("firstName").focus();
        else if (!lastName) document.getElementById("lastName").focus();
        else if (!address) document.getElementById("address").focus();
        else if (!phone) document.getElementById("phone").focus();
        else if (!mobile) document.getElementById("mobile").focus();
        else if (!email) document.getElementById("email").focus();
      return
    }

    //============== Create contact object==============
    const contact = {
      firstName,
      lastName,
      address,
      phone: {
        raw: phone,
        fullNumber,
        countryCode,
        countryName,
        isoCode,
      },
      mobile,
      email,
    };

    // =========== fetch existing contacts from localstorage ==========
    let contacts = JSON.parse(localStorage.getItem("contacts")) || [];

    if (isEditing) {
      //  ========== update existing contact ==========
      contacts[editingIndex] = contact;
      showMessage("Address updated successfully", "green");
      alert('Address updated successfully')
      
      //========= reset editing mode =============
      isEditing = false;
      editingIndex = -1;
      document.getElementById('submitButton').textContent = "Submit";
    } else {
      //======== add new contact ==========
      contacts.unshift(contact);
      showMessage("Address saved successfully", "green");
      alert('Address saved successfully ')
    }

    // ============= s ave updated contacts back to localstorage ==============
    localStorage.setItem("contacts", JSON.stringify(contacts));

    form.reset();
    closeModal();
    renderAddressCards();
    

  });

  const resetButton = document.getElementById("resetBtn");
  resetButton.addEventListener('click',()=>{
    document.getElementById('submitButton').textContent = "Submit";
    isEditing = false;
    editingIndex = -1;
  })



    
//==================== show message ====================
function showMessage(text, color) {
  message.textContent = text;
  message.classList.remove("hidden");
  message.classList.remove("text-green-600", "text-red-600");
  message.classList.add(`text-${color}-600`);

  form.removeEventListener("input", hideMessageOnFilled);

  form.addEventListener("input", hideMessageOnFilled);
}

function hideMessageOnFilled() {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const address = document.getElementById("address").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const mobile = document.getElementById("mobile").value.trim();
  const email = document.getElementById("email").value.trim();

  if (firstName && lastName && address && phone && mobile && email) {
    message.classList.add("hidden");
    message.textContent = "";
    form.removeEventListener("input", hideMessageOnFilled);
  }
}


function closeModal() {
  const modalContainer = document.getElementById("modalContainer");
  const formElement = document.getElementById("addressForm");
  const headingDiv = document.getElementById("headingDiv");
  const originalParent = document.getElementById("formDiv");

  modalContainer.classList.add("hidden");

  originalParent.appendChild(headingDiv);
  originalParent.appendChild(formElement);

  headingDiv.classList.add("hidden");
  originalParent.classList.add("hidden");
}



//=============== rendering address logics ===============
let currentPage = 1;
let currentSearchQuery = '';
let viewType = localStorage.getItem("viewType") || "card";
let itemsPerPage = 6
let currentSortOrder = 'default';

function renderAddressCards(page = 1, maintainFocus = false) {
  let addresses = JSON.parse(localStorage.getItem("contacts")) || [];
  let viewType = localStorage.getItem("viewType") || "card";
  addressList.innerHTML = "";


 let gridColsClass = '';
  if (viewType) {
    gridColsClass =
      itemsPerPage === 6
        ? 'lg:grid-cols-2'
        : itemsPerPage === 12
        ? 'lg:grid-cols-3'
        : 'lg:grid-cols-4';
  }


  const topBar = document.createElement("div");
  topBar.className = "col-span-full flex flex-col md:flex-row justify-between items-center mb-4 gap-4";
  const leftBar = document.createElement("div");
  leftBar.className = "flex items-center";
  leftBar.innerHTML = `
    <div class="flex flex-wrap gap-2 md:gap-4 lg:gap-6 justify-between items-center w-full"> 
      <button id="importBtn" class="shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]  text-sm md:text-md lg:text-xl   cursor-pointer caveat-brush-regular  bg-gray-400 text-black  transform transition-transform duration-300  hover:scale-105 px-3 md:px-4 lg:px-5 py-2  rounded-full hover:bg-gray-500">
        Import
      </button>

      <input  id="searchInput" type="text" placeholder="Search by name..." value="${currentSearchQuery}" class="border shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-sm md:text-md lg:text-xl  border-gray-400 px-3 py-2 rounded-full   focus:outline-none focus:ring-2 focus:ring-blue-400   caveat-brush-regular"/>

      <select  id="sortDropdown"  class="border border-gray-400 text-sm md:text-md lg:text-xl   shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]   px-3 py-2 rounded-full bg-white cursor-pointer    caveat-brush-regular focus:ring-2 focus:ring-blue-400">
        <option value="default" ${currentSortOrder === 'default' ? 'selected' : ''}>Sort</option>
        <option value="asc" ${currentSortOrder === 'asc' ? 'selected' : ''}>A - Z</option>
        <option value="desc" ${currentSortOrder === 'desc' ? 'selected' : ''}>Z - A</option>
      </select>

      <button id="addBtn"  class="shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]   text-sm md:text-md lg:text-xl   cursor-pointer caveat-brush-regular  bg-green-400 text-white  transform transition-transform duration-300   hover:scale-105 px-3 md:px-4 lg:px-5 py-2  rounded-full hover:bg-green-500">
        + Add
      </button>
    </div>
  `;


  const rightBar = document.createElement("div");
  rightBar.className = "flex items-center";
  rightBar.innerHTML = `
    <select id="itemsPerPageDropdown" class="border border-gray-400 text-sm md:text-md lg:text-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] px-3 py-2 rounded-full bg-white cursor-pointer caveat-brush-regular focus:ring-2 focus:ring-blue-400">
        <option value="6" ${itemsPerPage === 6 ? 'selected' : ''}>6 Cards</option>
        <option value="12" ${itemsPerPage === 12 ? 'selected' : ''}>12 Cards</option>
        <option value="20" ${itemsPerPage === 20 ? 'selected' : ''}>20 Cards</option>
    </select>

    <p id="selectedCount" class="ml-4 caveat-brush-regular text-gray-700 font-medium pt-1 text-sm md:text-md lg:text-lg">No Cards selected</p>
    <button id="DownloadSelectedBtn" disabled onclick="downloadSelected()" 
      class="shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] text-sm md:text-md lg:text-xl caveat-brush-regular bg-gray-400 cursor-not-allowed ml-4 text-white px-4 py-2 rounded-full">
      Download Selected
    </button>
    <button id="deleteSelectedBtn" disabled onclick="deleteSelected()" 
      class="caveat-brush-regular text-sm md:text-md lg:text-xl shadow-[3px_3px_0px_0px_rgba(255,0,0,0.5)] bg-red-300 cursor-not-allowed ml-4 text-white px-4 py-2 rounded-full">
      Delete Selected
    </button>
  `;

  topBar.appendChild(leftBar);
  topBar.appendChild(rightBar);
  addressList.appendChild(topBar);

  let start = (page - 1) * itemsPerPage;
  let paginatedAddresses = addresses.slice(start, start + itemsPerPage);
  document.getElementById('itemsPerPageDropdown').addEventListener('change', (e) => {
    itemsPerPage = parseInt(e.target.value);
    localStorage.setItem("itemsPerPage", itemsPerPage);
    renderAddressCards(1);
  });

  //============= modal and address for logic ================
const addButton = document.getElementById('addBtn');
const mainContainer = document.getElementById('formDiv');
const headingDiv = document.getElementById('headingDiv');
const modalContainer = document.getElementById('modalContainer');
const modalContent = document.getElementById('modalContent');
const closeModal = document.getElementById('closeModal');
const formElement = document.getElementById('addressForm');

addButton.addEventListener('click', () => {
  headingDiv.classList.remove('hidden');

  modalContent.innerHTML = ""; 
  modalContent.appendChild(headingDiv);
  modalContent.appendChild(formElement);

  modalContainer.classList.remove('hidden');
});


closeModal.addEventListener('click', () => {
  modalContainer.classList.add('hidden');

  const originalParent = document.getElementById('formDiv');
  originalParent.appendChild(formElement);

  headingDiv.classList.add('hidden');
  originalParent.classList.add('hidden');
});

  //=============== modal logic ends ===============
  const searchInput = document.getElementById('searchInput');
  const sortDropdown = document.getElementById('sortDropdown');

  if (maintainFocus) {
    setTimeout(() => {
      searchInput.focus();
      searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
    }, 0);
  }

  searchInput.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    currentPage = 1;
    renderAddressCards(1, true); 
  });

  sortDropdown.addEventListener('change', (e) => {
    currentSortOrder = e.target.value;
    currentPage = 1;
    renderAddressCards(1);
  });

  if (currentSearchQuery.trim()) {
    const searchTerm = currentSearchQuery.toLowerCase();
    addresses = addresses.filter((a) => 
      a.firstName.toLowerCase().includes(searchTerm) || 
      a.lastName.toLowerCase().includes(searchTerm)
    );
  }


  if (currentSortOrder === "asc") {
    addresses.sort((a, b) => a.firstName.localeCompare(b.firstName));
  } else if (currentSortOrder === "desc") {
    addresses.sort((a, b) => b.firstName.localeCompare(a.firstName));
  }


  if (addresses.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = currentSearchQuery 
      ? `No addresses found for "${currentSearchQuery}"` 
      : "No addresses found. Please add a new contact!";
    emptyMsg.className = "caveat-brush-regular text-gray-500 text-lg font-medium text-center mt-6 col-span-full";
    addressList.appendChild(emptyMsg);
    return;
  }

  const totalPages = Math.ceil(addresses.length / itemsPerPage);
  currentPage = Math.min(page, totalPages);
   start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  paginatedAddresses = addresses.slice(start, end);

  displayAddresses(paginatedAddresses, start, viewType, currentPage, totalPages , gridColsClass);
}

//============= function to render cards ===============
function displayAddresses(paginatedAddresses, start, viewType, currentPage, totalPages , gridColsClass) {
  if (viewType === 'card') {
    displayCardView(paginatedAddresses, start, currentPage, totalPages ,gridColsClass);
  } else {
    displayListView(paginatedAddresses, start, currentPage, totalPages);
  }
}

  //============= Card View Display ===============
  function displayCardView(paginatedAddresses, start, currentPage, totalPages , gridColsClass) {
    addressList.className =
      `my-4 bg-gray-200 px-4 bg-gray-300 bg-cover bg-center py-2 text-xl rounded-md grid grid-cols-1 md:grid-cols-2  ${gridColsClass} gap-6 w-11/12 max-w-8xl min-h-[400px]`;

    paginatedAddresses.forEach((address, index) => {
      const actualIndex = start + index;
      const card = document.createElement("div");
      card.className =
        "address-card bg-white bg-[url('/public/bg-main-white.jpg')]  bg-cover bg-center cursor-pointer caveat-brush-regular rounded-lg px-6 py-2 border border-black-2 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.7)] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] duration-300 relative";

    card.innerHTML = `
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center space-x-4 w-full">
          <div class="flex items-center justify-center w-16 h-16 rounded-full bg-blue-300 text-gray-700 text-2xl font-semibold">
            <h1>${address.firstName[0].toUpperCase()}${address.lastName[0].toUpperCase()}</h1>
          </div>
          <h2 class="text-3xl font-semibold text-center flex-1">
            ${address.firstName.charAt(0).toUpperCase() + address.firstName.slice(1)}
            ${address.lastName.charAt(0).toUpperCase() + address.lastName.slice(1)}
          </h2>
        </div>
        <input 
          type="checkbox" 
          data-index="${actualIndex}" 
          class="hidden contact-checkbox w-5 h-5 ml-4 rounded-full cursor-pointer accent-blue-500"
        />
      </div>

      <p class="flex items-center">
        <strong class="w-24">Address:</strong>
        <span class="flex-1 border-b border-dotted border-gray-800 ml-4 pb-1">
          ${address.address}
        </span>
      </p>

      <p class="flex items-center">
        <strong class="w-24">Phone:</strong>
        <span class="flex-1 border-b border-dotted border-gray-800 ml-4 pb-1">
          ${address.phone.fullNumber}
        </span>
      </p>

      <p class="flex items-center">
        <strong class="w-24">Mobile:</strong>
        <span class="flex-1 border-b border-dotted border-gray-800 ml-4 pb-1">
          ${address.mobile}
        </span>
      </p>

      <p class="flex items-center">
        <strong class="w-24">Email:</strong>
        <span class="flex-1 border-b border-dotted border-gray-800 ml-4 pb-1">
          ${address.email}
        </span>
      </p>

      <div class="flex items-center justify-between mt-4">
        <div class="flex gap-2">
          <button onclick="editAddress(${actualIndex})" class="border border-black bg-blue-400 shadow-[3px_3px_0px_0px_rgba(0,0,255,0.7)] cursor-pointer hover:bg-blue-500 text-white px-3 py-1 rounded-full">
            Edit
          </button>
          <button onclick="deleteContact(${actualIndex})" class="border border-black bg-red-400 shadow-[3px_3px_0px_0px_rgba(255,0,0,1)] cursor-pointer hover:bg-red-500 text-white px-3 py-1 rounded-full">
            Delete
          </button>
        </div>
        <button onclick="downloadSingle(${actualIndex})" class="shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] border bg-gray-300 cursor-pointer rounded-full px-4 py-1 hover:bg-gray-400">
          Download
        </button>
      </div>
    `;

    addressList.appendChild(card);
  });

  // Add pagination
  addPagination(currentPage, totalPages);
}


//============= List View Display ===============
function displayListView(paginatedAddresses, start, currentPage, totalPages) {
  addressList.className =
    "my-4 bg-gray-200 px-4 py-2 bg-gray-300 bg-cover bg-center text-xl rounded-md w-11/12 max-w-8xl h-[calc(100vh-2rem)] overflow-hidden";

  const mainContainer = document.createElement('div');
  mainContainer.className = 'w-full h-full flex flex-col lg:flex-row gap-4 min-w-[300px] p-2';

  const leftContent = document.createElement('div');
  leftContent.id = 'leftSidebar';
  leftContent.className =
    'w-full lg:w-1/4 bg-white h-[calc(100%-1rem)] overflow-auto rounded-lg pr-6 pl-2 transition-all duration-300 relative';


  const shrinkButton = document.createElement('button');
  shrinkButton.id = 'shrinkBtn';
  shrinkButton.className =
    'absolute top-1/4 right-1  z-10 bg-gray-400 hover:bg-gray-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 lg:block hidden';
  shrinkButton.innerHTML = '<';
  shrinkButton.title = 'Toggle Sidebar';

  leftContent.appendChild(shrinkButton);


  shrinkButton.addEventListener('click', () => {
    leftContent.classList.toggle('sidebar-shrunk');
    shrinkButton.innerHTML = leftContent.classList.contains('sidebar-shrunk') ? '>' : '<';
  });

if (!document.getElementById('sidebar-shrink-style')) {
  const style = document.createElement('style');
  style.id = 'sidebar-shrink-style';
  style.innerHTML = `
    /* ===== Shrink Sidebar ===== */
    #leftSidebar.sidebar-shrunk {
      width: 80px !important;
      min-width: 150px !important;
      max-width: 80px !important;
      padding-left: 0.25rem !important;
      padding-right: 0.25rem !important;
      overflow-x: hidden !important;
      transition: all 0.3s ease-in-out;
    }

    /* Hide all inside elements except checkbox + avatar */
    #leftSidebar.sidebar-shrunk .caveat-brush-regular h1.font-semibold,
    #leftSidebar.sidebar-shrunk .caveat-brush-regular span,
    #leftSidebar.sidebar-shrunk .caveat-brush-regular p {
      display: none !important;
    }

    /* Show compact pagination in shrunk mode */
    #leftSidebar.sidebar-shrunk #pagination-expanded {
      display: none !important;
    }
    #leftSidebar.sidebar-shrunk #pagination-shrunk {
      display: flex !important;
    }

    /* In expanded mode, show full pagination and hide compact one */
    #leftSidebar:not(.sidebar-shrunk) #pagination-expanded {
      display: flex !important;
    }
    #leftSidebar:not(.sidebar-shrunk) #pagination-shrunk {
      display: none !important;
    }

    #leftSidebar.sidebar-shrunk .caveat-brush-regular {
      justify-content: center !important;
      flex-direction: row !important;
      gap: 0.5rem !important;
    }

    #leftSidebar.sidebar-shrunk ~ div.lg\\:w-3\\/4 {
      width: 100% !important;
    }
  `;
  document.head.appendChild(style);
}


  const rightContent = document.createElement('div');
  rightContent.className =
    'w-full lg:w-3/4 bg-white h-[calc(100%-1rem)] overflow-auto rounded-lg flex items-center justify-center p-2';
    
  const renderDetails = (address, index) => {
    const actualIndex = start + index;
    rightContent.innerHTML = `
      <div class="caveat-brush-regular border border-blue-300 bg-blue-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl w-full md:w-10/12 p-6 mx-auto flex flex-col items-center text-center space-y-6">

        <!-- ===== Action Buttons ===== -->
        <div class="flex flex-wrap items-center justify-between w-full mb-6">
          <div class="flex flex-wrap gap-4">
            <button onclick="editAddress(${actualIndex})"
              class="border border-black bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,255,0.7)] transition-all duration-200">
              Edit
            </button>
            <button onclick="deleteContact(${actualIndex})"
              class="border border-black bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full shadow-[3px_3px_0px_0px_rgba(255,0,0,1)] transition-all duration-200">
              Delete
            </button>
          </div>

          <div>
            <button onclick="downloadSingle(${actualIndex})"
              class="border border-black bg-gray-300 hover:bg-gray-400 text-black px-5 py-2 rounded-full shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] transition-all duration-200">
              Download
            </button>
          </div>
        </div>

        <!-- ===== Profile Header ===== -->
        <div class="w-full bg-blue-100 rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,0.8)] border border-black flex flex-col sm:flex-row items-center justify-start gap-6 p-6 mb-8">
          <div class="w-32 h-32 flex items-center justify-center rounded-full bg-blue-400 text-gray-800 text-5xl font-bold shadow-md border-4 border-white shrink-0">
            ${address.firstName[0].toUpperCase()}${address.lastName[0].toUpperCase()}
          </div>
          <div class="text-center sm:text-left">
            <h1 class="text-3xl font-bold mb-1 text-gray-900">
              ${address.firstName.charAt(0).toUpperCase() + address.firstName.slice(1)} 
              ${address.lastName.charAt(0).toUpperCase() + address.lastName.slice(1)}
            </h1>
            <p class="text-gray-700 text-lg italic border-t border-dotted border-gray-500 pt-2 mt-1">
              ${address.email}
            </p>
          </div>
        </div>

        <!-- ===== Contact Details ===== -->
        <div class="w-full sm:w-10/12 md:w-8/12 text-left space-y-3 text-base sm:text-lg md:text-xl">
          <p class="flex flex-col sm:flex-row items-start sm:items-center">
            <strong class="w-28">Address:</strong>
            <span class="flex-1 border-b border-dotted border-gray-800 pb-1 sm:ml-3">${address.address}</span>
          </p>
          <p class="flex flex-col sm:flex-row items-start sm:items-center">
            <strong class="w-28">Phone:</strong>
            <span class="flex-1 border-b border-dotted border-gray-800 pb-1 sm:ml-3">${address.phone.fullNumber}</span>
          </p>
          <p class="flex flex-col sm:flex-row items-start sm:items-center">
            <strong class="w-28">Mobile:</strong>
            <span class="flex-1 border-b border-dotted border-gray-800 pb-1 sm:ml-3">${address.mobile}</span>
          </p>
          <p class="flex flex-col sm:flex-row items-start sm:items-center">
            <strong class="w-28">Email:</strong>
            <span class="flex-1 border-b border-dotted border-gray-800 pb-1 sm:ml-3">${address.email}</span>
          </p>
        </div>

      </div>
    `;
  };

  paginatedAddresses.forEach((address, index) => {
    const actualIndex = start + index;
    const EachName = document.createElement('div');
    EachName.className =
      'bg-white m-2 px-4 py-2 rounded shadow cursor-pointer border hover:bg-gray-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] transition';
    EachName.innerHTML = `
      <div class="caveat-brush-regular flex items-center gap-4 sm:gap-6">
        <input type="checkbox" data-index="${actualIndex}" class="contact-checkbox w-4 h-4 sm:w-5 sm:h-5 rounded-full cursor-pointer accent-blue-500" />
        <div class="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-300 text-gray-700 text-xl sm:text-2xl font-semibold">
          <h1>${address.firstName[0].toUpperCase()}${address.lastName[0].toUpperCase()}</h1>
        </div>
        <h1 class="caveat-brush-regular font-semibold text-xl sm:text-2xl">${address.firstName}</h1>
      </div>
    `;

    EachName.addEventListener('click', (e) => {
      if (!e.target.classList.contains('contact-checkbox')) {
        document.querySelectorAll('.selected-name').forEach((el) =>
          el.classList.remove('selected-name')
        );
        EachName.classList.add('selected-name');
        renderDetails(address, index);
      }
    });

    leftContent.appendChild(EachName);

    if (index === 0) {
      EachName.classList.add('selected-name');
      renderDetails(address, index);
    }
  });

  if (!document.getElementById('selected-name-style')) {
    const style = document.createElement('style');
    style.id = 'selected-name-style';
    style.innerHTML = `
      .selected-name {
        background-color: #c1c3c5ff !important;
        color: white;
      }
    `;
    document.head.appendChild(style);
  }

  const paginationDiv = document.createElement('div');
  paginationDiv.id = 'paginationDiv';
  paginationDiv.className =
    'caveat-brush-regular flex justify-center items-center mt-4 sm:mt-6 gap-2 py-4';

  paginationDiv.innerHTML = `
    <!-- Normal view -->
    <div id="pagination-expanded" class="flex items-center gap-2">
      <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}
        class="px-3 sm:px-4 py-1 sm:py-2 border rounded-full ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'} shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)]">
        Prev
      </button>
      <span class="text-gray-700 font-medium text-sm sm:text-base">
        Page ${currentPage} of ${totalPages}
      </span>
      <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}
        class="px-3 sm:px-4 py-1 sm:py-2 border rounded-full ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'} shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)]">
        Next
      </button>
    </div>

    <!-- Shrunk view -->
    <div id="pagination-shrunk" class="hidden items-center gap-2">
      <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}
        class="px-2 py-1 border rounded-full text-lg font-bold 
        ${currentPage === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-black'} 
        shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)]">
        &lt;
      </button>
      <span class="text-gray-700 font-medium text-base">${currentPage}/${totalPages}</span>
      <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}
        class="px-2 py-1 border rounded-full text-lg font-bold 
        ${currentPage === totalPages ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-black'} 
        shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)]">
        &gt;
      </button>
    </div>
  `;



  leftContent.appendChild(paginationDiv);

  mainContainer.appendChild(leftContent);
  mainContainer.appendChild(rightContent);
  addressList.appendChild(mainContainer);
}


//============= Add Pagination ===============
function addPagination(currentPage, totalPages) {
  const paginationDiv = document.createElement("div");
  paginationDiv.className = "caveat-brush-regular col-span-full flex justify-center items-center mt-6 gap-2";
  paginationDiv.innerHTML = `
    <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}
      class="px-4 cursor-pointer py-2 border shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-full ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"}">
      Prev
    </button>
    <span class="text-gray-700 font-medium">Page ${currentPage} of ${totalPages}</span>
    <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}
      class="px-4 py-2 border cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,0.7)] rounded-full ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"}">
      Next
    </button>
  `;
  addressList.appendChild(paginationDiv);
}



//============ mark chechbox when clicking on card ==========
document.addEventListener('click',function(e){
  const card = e.target.closest('.address-card')

  if (!card) return;
  // console.log('cardd',card);
  const checkbox = card.querySelector('.contact-checkbox') 
  
  if (!checkbox) return;
  // console.log('cc',checkbox);
  if (e.target === checkbox) {
    card.classList.add(
        'ring-2',
        'ring-blue-400',
        'bg-blue-50',
        'shadow-lg',
        'shadow-[5px_5px_0px_0px_rgba(0,0,0,0.7)]'
      );
  }

  console.log('cc',checkbox.checked);
  

  checkbox.checked = !checkbox.checked;
  if (checkbox.checked) {
    card.classList.add('ring-2', 'ring-green-400', 'bg-green-100','shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]');
  } else {
    card.classList.remove('ring-2', 'ring-green-400', 'bg-green-100');
  }
  checkbox.dispatchEvent(new Event('change'));
})


//======= Change page function =======
function changePage(page) {
  const addresses = JSON.parse(localStorage.getItem('contacts')) || [];
  const totalPages = Math.ceil(addresses.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderAddressCards(currentPage);
}

document.addEventListener("DOMContentLoaded", () => renderAddressCards(1));



//=============== editing address cards ===============
function editAddress(index){
  const contacts = JSON.parse(localStorage.getItem("contacts")) || [];
  const contact = contacts[index]

  //===== Set editing mode=====
  isEditing = true;
  editingIndex = index;

  //===== Populate form fields=====
  document.getElementById("firstName").value = contact.firstName;
  document.getElementById("lastName").value = contact.lastName;
  document.getElementById("address").value = contact.address;
  document.getElementById("phone").value = contact.phone.raw;
  document.getElementById("mobile").value = contact.mobile;
  document.getElementById("email").value = contact.email;

  const submitButton = document.getElementById('submitButton')
  submitButton.textContent = "Update"

   const modalContainer = document.getElementById("modalContainer");
  const modalContent = document.getElementById("modalContent");
  const formElement = document.getElementById("addressForm");
  const headingDiv = document.getElementById("headingDiv");

  // Move heading and form inside the modal
  modalContent.appendChild(headingDiv);
  modalContent.appendChild(formElement);

  // Show modal
  modalContainer.classList.remove("hidden");
  headingDiv.classList.remove("hidden");
  // =====Scroll to form=====
  form.scrollIntoView({ behavior: 'smooth' });
}


//=============== deleting contact ===============
function deleteContact(index){
  if(confirm('Are you sure you want to delete this contact?')){
    let contacts = JSON.parse(localStorage.getItem("contacts")) || [];
    contacts.splice(index, 1);
    localStorage.setItem("contacts", JSON.stringify(contacts));
    showMessage("Contact deleted successfully!", "green");
    alert('address removed successfully')
    renderAddressCards();
  }
}



//============ downloading single address ==============
function downloadSingle(index){
  const contacts = JSON.parse(localStorage.getItem('contacts'))
  const contact = contacts[index]

  if (!contact) {
    alert("Address not found!");
    return;
  }

  const dataStr = JSON.stringify(contact, null, 2);
  const file = new Blob([dataStr], { type: "application/json" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = `${contact.firstName}_${contact.lastName}_details.json`;
  console.log('fie',file);

  a.click();
  URL.revokeObjectURL(a.href);
  console.log('down',contact)
}



//============ deleting slelected contacts ==============
function deleteSelected(){
  if(confirm('Are you sure you want to delete this selected contact?')){

    
    let contacts = JSON.parse(localStorage.getItem("contacts")) || []
    const checkboxes = document.querySelectorAll('.contact-checkbox:checked')
    
    
    const indexesToDelete = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
    contacts = contacts.filter((_, index) => !indexesToDelete.includes(index));
    console.log('ddddd',indexesToDelete);
    
    localStorage.setItem("contacts", JSON.stringify(contacts));
    
    console.log('ddd',checkboxes);
    showMessage(`${indexesToDelete.length} address deleted successfully!`, "red");
    alert(`${indexesToDelete.length} address deleted successfully!`)
    renderAddressCards();
  }
  
}



//========== toggle enable or disable download & delete button =========
document.addEventListener('click', function(){
  const downloadBtn = document.getElementById('DownloadSelectedBtn');
  const deleteBtn = document.getElementById('deleteSelectedBtn');
  const countText = document.getElementById('selectedCount');
  const checkboxes = document.querySelectorAll('.contact-checkbox');
  const selectedCount = Array.from(checkboxes).filter(cb => cb.checked).length;

  if (downloadBtn || deleteBtn) {
    if (selectedCount > 0) {
      downloadBtn.disabled = false;
      downloadBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-400');
      downloadBtn.classList.add('bg-gray-500', 'hover:bg-gray-600' , 'cursor-pointer');
      deleteBtn.disabled = false;
      deleteBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-red-300');
      deleteBtn.classList.add('bg-red-500', 'hover:bg-red-600','cursor-pointer');
      countText.textContent = `${selectedCount} Cards selected`;
    } else {
      downloadBtn.disabled = true;
      downloadBtn.classList.add( 'cursor-not-allowed', 'bg-gray-400');
      downloadBtn.classList.remove('bg-gray-500', 'hover:bg-gray-600');
      deleteBtn.disabled = true;
      deleteBtn.classList.add( 'cursor-not-allowed', 'bg-red-300');
      deleteBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
      countText.textContent = `No Cards selected`;
    }
  }
})



//============= card / list button toggling ==============
let currentView = localStorage.getItem("viewType") || "card";
updateToggleUI();
document.getElementById('cardViewBtn').addEventListener('click', () => {
  currentView = 'card';
  localStorage.setItem("viewType", currentView);
  updateToggleUI();
  renderAddressCards();
});

document.getElementById('listViewBtn').addEventListener('click', () => {
  currentView = 'list';
  localStorage.setItem("viewType", currentView);
  updateToggleUI();
  renderAddressCards();
});

function updateToggleUI(){
  const cardBtn = document.getElementById('cardViewBtn');
  const listBtn = document.getElementById('listViewBtn');

  if(currentView == 'card'){
    cardBtn.classList.add('bg-black','text-white')
    cardBtn.classList.remove('text-gray-700')
    listBtn.classList.remove('bg-black','text-white')
    listBtn.classList.add('text-gray-700')
  }else{
    listBtn.classList.add('bg-black','text-white')
    listBtn.classList.remove('text-gray-700')
    cardBtn.classList.remove('bg-black','text-white')
    cardBtn.classList.add('text-gray-700')
  }
}



//============ downloading slelected contacts ==============
function downloadSelected(){
  let contacts = JSON.parse(localStorage.getItem("contacts")) || []
  const checkboxes = document.querySelectorAll('.contact-checkbox:checked')

  const indexesToDownload = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));

  console.log('ddd',indexesToDownload);
  contactToDownload = indexesToDownload.map(index=>contacts[index])

  console.log('cc',contactToDownload);

  const dataStr = JSON.stringify(contactToDownload, null, 2);
  const file = new Blob([dataStr], { type: "application/json" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = `${indexesToDownload.length}address_details.json`;
  console.log('fie',file);

  a.click();
  URL.revokeObjectURL(a.href);
  console.log('down',contactToDownload)
  
}


//========== import address as json functionality ========
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.json';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'importBtn') {
    e.preventDefault();
    e.stopPropagation();
    fileInput.click();
  }
});

fileInput.addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);
      console.log('Imported JSON:', importedData);

      let contacts = JSON.parse(localStorage.getItem("contacts")) || [];

      if (Array.isArray(importedData)) {
        importedData.forEach((data) => {
          contacts.unshift(data);
        });
        alert(`${importedData.length} addresses imported successfully!`);
      } else {
        contacts.unshift(importedData);
        alert(`${importedData.firstName} ${importedData.lastName}'s address imported successfully!`);
      }

      localStorage.setItem("contacts", JSON.stringify(contacts));
      console.log('Updated Contacts:', contacts);
      renderAddressCards();
    } catch (err) {
      alert('Invalid JSON file');
      console.error(err);
    }

    event.target.value = ''; // reset input after import
  };

  reader.readAsText(file);
}



