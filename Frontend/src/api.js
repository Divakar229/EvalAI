const BASE = "http://127.0.0.1:8000";

const headers = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const api = {

  login: (email, password) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    return fetch(`${BASE}/auth/login`, {
      method: "POST",
      body: form,
    }).then(async r => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || "Login failed");
      return data;
    });
  },

  register: (name, email, password) =>
    fetch(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    }).then(async r => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || "Register failed");
      return data;
    }),

  evaluate: (formData) =>
    fetch(`${BASE}/evaluate`, {
      method: "POST",
      headers: headers(),
      body: formData,
    }).then(async r => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || "Evaluation failed");
      return data;
    }),

  listResults: () =>
    fetch(`${BASE}/results`, {
      headers: headers(),
    }).then(async r => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || "Failed to fetch results");
      return data;
    }),

  getResult: (id) =>
    fetch(`${BASE}/results/${id}`, {
      headers: headers(),
    }).then(async r => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || "Result not found");
      return data;
    }),

  deleteResult: (id) =>
    fetch(`${BASE}/results/${id}`, {
      method: "DELETE",
      headers: headers(),
    }).then(async r => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || "Delete failed");
      return data;
    }),
};