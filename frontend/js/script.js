const API = "http://localhost:3000/api/auth";

// SIGNUP
async function signup() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const district = document.getElementById("district").value;

  if (name === "") {
    alert("Name is required");
    return;
  }

  if (!/^\d{10}$/.test(phone)) {
    alert("Phone number must be exactly 10 digits");
    return;
  }

  
 if (district === "") {
  alert("Please select a district");
  return;
} 

  if (password.length < 8) {
    alert("Password must be at least 8 characters");
    return;
  }


  const res = await fetch(`${API}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      phone,
      district,
      password
    })
  });

  const data = await res.json();

  alert(data.message);

  if (res.ok) {
    window.location.href = "login.html";
  }
}

// LOGIN
async function login() {
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;

  if (!phone || !password) {
    alert("Phone and password are required");
    return;
  }

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      phone,
      password
    })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    window.location.href = "dashboard.html";
  } else {
    alert(data.message);
  }
}

// DASHBOARD
function loadDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("user").innerText =
    `Welcome ${user.name}`;
}

if (document.getElementById("user")) {
  loadDashboard();
}

// LOGOUT
function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

//for click event
document.addEventListener("DOMContentLoaded", () => {
  const fields = [
    document.getElementById("name"),
    document.getElementById("phone"),
    document.getElementById("district"),
    document.getElementById("password")
  ];

  fields.forEach((field, index) => {
    field.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        if (index < fields.length - 1) {
          fields[index + 1].focus();
        } else {
          signup();
        }
      }
    });
  });
});