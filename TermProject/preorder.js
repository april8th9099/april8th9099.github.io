
function submitPreorder() {
  const name = document.getElementById('name').value.trim();
  const country = document.getElementById('country').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!name || !country || !phone || !email) {
    alert('Please fill in all fields.');
    return;
  }

  alert('Pre-Registration Complete!');
}
