// Class Created
class ContactManager {
  constructor() {
    // 1. Initialize State
    this.contacts = JSON.parse(localStorage.getItem('contacts')) || [];

    // 2. Cache DOM Elements
    this.contactForm = document.getElementById('contact-form');
    this.nameInput = document.getElementById('name');
    this.phoneInput = document.getElementById('phone');
    this.emailInput = document.getElementById('email');
    this.editIndexInput = document.getElementById('edit-index');
    this.submitBtn = document.getElementById('submit-btn');
    this.cancelBtn = document.getElementById('cancel-btn');
    this.searchInput = document.getElementById('search-input');
    this.contactList = document.getElementById('contact-list');
    this.errorMsg = document.getElementById('error-msg');

    // 3. Validation Rules
    this.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.phoneRegex = /^\+?[0-9\s\-]{7,15}$/;

    // 4. Start App
    this.initEventListeners();
    this.renderContacts();
  }

  // Method: Set up DOM event listeners
  initEventListeners() {
    this.contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
    this.cancelBtn.addEventListener('click', () => this.resetForm());
    this.searchInput.addEventListener('input', (e) => this.renderContacts(e.target.value));

    // Event delegation for dynamic Edit/Delete buttons
    this.contactList.addEventListener('click', (e) => {
      const index = e.target.dataset.index;
      if (e.target.classList.contains('edit-btn')) {
        this.startEdit(index);
      } else if (e.target.classList.contains('delete-btn')) {
        this.deleteContact(index);
      }
    });
  }

  // Method: Save to LocalStorage and trigger render
  saveAndRender() {
    localStorage.setItem('contacts', JSON.stringify(this.contacts));
    this.renderContacts();
  }

  // Method: Validate form fields
  validateInputs(name, phone, email) {
    if (!name.trim()) return "Name cannot be empty.";
    if (!this.phoneRegex.test(phone)) return "Please enter a valid phone number.";
    if (!this.emailRegex.test(email)) return "Please enter a valid email address.";
    return null;
  }

  // Method: Render contacts list to DOM using explicit loops
  renderContacts(filterText = '') {
    this.contactList.innerHTML = '';

    // Loop 1: Filter contacts using a for...of loop
    const filteredContacts = [];
    for (const contact of this.contacts) {
      if (contact.name.toLowerCase().includes(filterText.toLowerCase())) {
        filteredContacts.push(contact);
      }
    }

    if (filteredContacts.length === 0) {
      this.contactList.innerHTML = '<li class="empty-list">No contacts found.</li>';
      return;
    }

    // Loop 2: Loop through filtered contacts to build DOM cards
    for (let i = 0; i < filteredContacts.length; i++) {
      const contact = filteredContacts[i];
      const originalIndex = this.contacts.indexOf(contact);

      const li = document.createElement('li');
      li.className = 'contact-card';
      li.innerHTML = `
        <div class="contact-info">
          <p><strong>${this.escapeHtml(contact.name)}</strong></p>
          <p>📞 ${this.escapeHtml(contact.phone)}</p>
          <p>✉️ ${this.escapeHtml(contact.email)}</p>
        </div>
        <div class="card-actions">
          <button class="edit-btn" data-index="${originalIndex}">Edit</button>
          <button class="delete-btn" data-index="${originalIndex}">Delete</button>
        </div>
      `;
      this.contactList.appendChild(li);
    }
  }

  // Method: Sanitize text to prevent XSS
  escapeHtml(text) {
    return text.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  // Method: Handle Form Submission (Add or Edit)
  handleSubmit(e) {
    e.preventDefault();
    this.errorMsg.style.display = 'none';

    const name = this.nameInput.value.trim();
    const phone = this.phoneInput.value.trim();
    const email = this.emailInput.value.trim();
    const editIndex = parseInt(this.editIndexInput.value);

    const validationError = this.validateInputs(name, phone, email);
    if (validationError) {
      this.errorMsg.textContent = validationError;
      this.errorMsg.style.display = 'block';
      return;
    }

    if (editIndex === -1) {
      this.contacts.push({ name, phone, email });
    } else {
      this.contacts[editIndex] = { name, phone, email };
      this.resetForm();
    }

    this.contactForm.reset();
    this.saveAndRender();
  }

  // Method: Load contact into form for editing
  startEdit(index) {
    const contact = this.contacts[index];
    this.nameInput.value = contact.name;
    this.phoneInput.value = contact.phone;
    this.emailInput.value = contact.email;
    this.editIndexInput.value = index;

    this.submitBtn.textContent = 'Update Contact';
    this.cancelBtn.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Method: Delete contact
  deleteContact(index) {
    if (confirm('Are you sure you want to delete this contact?')) {
      this.contacts.splice(index, 1);
      this.saveAndRender();
      if (this.editIndexInput.value == index) this.resetForm();
    }
  }

  // Method: Reset form UI back to default "Add" state
  resetForm() {
    this.editIndexInput.value = '-1';
    this.submitBtn.textContent = 'Add Contact';
    this.cancelBtn.style.display = 'none';
    this.contactForm.reset();
  }
}

// Instantiate the Class
document.addEventListener('DOMContentLoaded', () => {
  new ContactManager();
});