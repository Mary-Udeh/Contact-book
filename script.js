  let contacts = JSON.parse(localStorage.getItem('contacts')) || [];

  const contactForm = document.getElementById('contact-form');
  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');
  const editIndexInput = document.getElementById('edit-index');
  const submitBtn = document.getElementById('submit-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const searchInput = document.getElementById('search-input');
  const contactList = document.getElementById('contact-list');
  const errorMsg = document.getElementById('error-msg');

  // Regex Patterns for Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9\s\-]{7,15}$/;

  function saveAndRender() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
    renderContacts();
  }

  function validateInputs(name, phone, email) {
    if (!name.trim()) return "Name cannot be empty.";
    if (!phoneRegex.test(phone)) return "Please enter a valid phone number.";
    if (!emailRegex.test(email)) return "Please enter a valid email address.";
    return null;
  }

  function renderContacts(filterText = '') {
    contactList.innerHTML = '';
    
    const filteredContacts = contacts.filter(c => 
      c.name.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filteredContacts.length === 0) {
      contactList.innerHTML = '<li class="empty-list">No contacts found.</li>';
      return;
    }

    filteredContacts.forEach((contact, index) => {
      // Find actual index in global contacts array
      const originalIndex = contacts.indexOf(contact);

      const li = document.createElement('li');
      li.className = 'contact-card';
      li.innerHTML = `
        <div class="contact-info">
          <p><strong>${escapeHtml(contact.name)}</strong></p>
          <p>📞 ${escapeHtml(contact.phone)}</p>
          <p>✉️ ${escapeHtml(contact.email)}</p>
        </div>
        <div class="card-actions">
          <button class="edit-btn" onclick="startEdit(${originalIndex})">Edit</button>
          <button class="delete-btn" onclick="deleteContact(${originalIndex})">Delete</button>
        </div>
      `;
      contactList.appendChild(li);
    });
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  // Handle Add / Edit Submission
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    errorMsg.style.display = 'none';

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();
    const editIndex = parseInt(editIndexInput.value);

    const validationError = validateInputs(name, phone, email);
    if (validationError) {
      errorMsg.textContent = validationError;
      errorMsg.style.display = 'block';
      return;
    }

    if (editIndex === -1) {
      // Add Contact
      contacts.push({ name, phone, email });
    } else {
      // Edit Contact
      contacts[editIndex] = { name, phone, email };
      resetForm();
    }

    contactForm.reset();
    saveAndRender();
  });

  function startEdit(index) {
    const contact = contacts[index];
    nameInput.value = contact.name;
    phoneInput.value = contact.phone;
    emailInput.value = contact.email;
    editIndexInput.value = index;

    submitBtn.textContent = 'Update Contact';
    cancelBtn.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteContact(index) {
    if (confirm('Are you sure you want to delete this contact?')) {
      contacts.splice(index, 1);
      saveAndRender();
      if (editIndexInput.value == index) resetForm();
    }
  }

  function resetForm() {
    editIndexInput.value = '-1';
    submitBtn.textContent = 'Add Contact';
    cancelBtn.style.display = 'none';
    contactForm.reset();
  }

  cancelBtn.addEventListener('click', resetForm);

  searchInput.addEventListener('input', (e) => {
    renderContacts(e.target.value);
  });

  // Initial Load
  renderContacts();
