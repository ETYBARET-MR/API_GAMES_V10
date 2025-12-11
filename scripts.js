const API = "/api";

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);

  if (!res.ok) {
    // Captura erro HTTP (404, 500, etc)
    const text = await res.text(); // captura o HTML do erro
    console.error(`Erro ao acessar ${url}:`, text);
    throw new Error(`Erro HTTP ${res.status}: ${text.substring(0, 100)}`);
  }

  try {
    return await res.json();
  } catch (err) {
    const text = await res.text();
    console.error("Resposta não é JSON. Conteúdo:", text);
    throw new Error("Resposta não é JSON válida.");
  }
}

/* ---------------- CADASTRO ---------------- */

document.querySelector("#form-cadastro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = e.target.nome.value;
  const email = e.target.email.value;

  try {
    const json = await fetchJSON(`${API}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email }),
    });

    if (json.sucesso) {
      localStorage.setItem("usuario_id", json.usuario.id_usuario);
      alert("Usuário cadastrado! Seu ID foi salvo automaticamente.");
    } else {
      alert("Erro ao cadastrar usuário: " + json.erro);
    }

  } catch (error) {
    alert("Falha ao cadastrar usuário: " + error.message);
  }
});

/* ---------------- ENVIAR FEEDBACK ---------------- */

document.querySelector("#form-feedback").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id_usuario = localStorage.getItem("usuario_id");
  if (!id_usuario) {
    return alert("Erro: Nenhum usuário cadastrado! Cadastre-se antes de enviar feedback.");
  }

  const jogo = e.target.jogo.value;
  const comentario = e.target.comentario.value;

  try {
    await fetchJSON(`${API}/feedbacks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario, jogo, comentario }),
    });

    alert("Feedback enviado!");
    e.target.reset();
    carregarFeedbacks();

  } catch (error) {
    alert("Falha ao enviar feedback: " + error.message);
  }
});

/* ---------------- LISTAR FEEDBACKS ---------------- */

async function carregarFeedbacks() {
  try {
    const feedbacks = await fetchJSON(`${API}/feedbacks`);
    const ul = document.getElementById("feedbacks");

    ul.innerHTML = "";

    feedbacks.forEach((f) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${f.usuario || "Usuário"}</strong> sobre <em>${f.jogo}</em>: ${f.comentario}`;
      ul.appendChild(li);
    });

  } catch (error) {
    console.error("Erro ao carregar feedbacks:", error);
  }
}

carregarFeedbacks();
