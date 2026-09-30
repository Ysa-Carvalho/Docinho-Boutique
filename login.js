// ============================================================
// LOGIN E CADASTRO
// Tudo fica salvo no localStorage (a "gavetinha" do navegador).
// ============================================================

const CHAVE_USUARIOS = "usuarios";        // lista de todas as contas criadas
const CHAVE_SESSAO = "usuarioLogado";     // quem está logado agora

// ---------- Funções de apoio (arrow functions) ----------
const pegarUsuarios = () => JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
const salvarUsuarios = (lista) => localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(lista));

const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Escreve (ou limpa) a mensagem de erro embaixo de um campo
const mostrarErro = (idErro, mensagem) => {
  document.getElementById(idErro).textContent = mensagem;
};

// Pinta a borda do campo de vermelho quando tem erro
const marcarCampo = (idCampo, temErro) => {
  document.getElementById(idCampo).classList.toggle("invalido", temErro);
};

// Se já tem alguém logado, não precisa ver a tela de login
if (localStorage.getItem(CHAVE_SESSAO)) {
  location.replace("index.html");
}

// ---------- Abas (Entrar / Cadastrar) ----------
const abas = document.querySelectorAll(".aba");
const formLogin = document.getElementById("form-login");
const formCadastro = document.getElementById("form-cadastro");
const caixaSucesso = document.getElementById("mensagem-sucesso");

const trocarAba = (nomeAba) => {
  abas.forEach((aba) => {
    aba.classList.toggle("ativa", aba.dataset.aba === nomeAba);
  });
  formLogin.hidden = nomeAba !== "entrar";
  formCadastro.hidden = nomeAba !== "cadastrar";
};

abas.forEach((aba) => {
  aba.addEventListener("click", () => {
    caixaSucesso.hidden = true;
    trocarAba(aba.dataset.aba);
  });
});

// ---------- CEP: consulta na ViaCEP (função assíncrona) ----------
const campoCep = document.getElementById("cad-cep");
const campoCidade = document.getElementById("cad-cidade");

const buscarCep = async () => {
  const cep = campoCep.value.replace(/\D/g, ""); // tira tudo que não é número
  campoCidade.value = "";
  mostrarErro("erro-cad-cep", "");
  marcarCampo("cad-cep", false);

  if (cep === "") return; // CEP é opcional

  if (cep.length !== 8) {
    mostrarErro("erro-cad-cep", "O CEP precisa ter 8 números.");
    marcarCampo("cad-cep", true);
    return;
  }

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!resposta.ok) throw new Error("Falha na consulta");
    const dados = await resposta.json();

    // A ViaCEP responde { erro: true } quando o CEP não existe
    if (dados.erro) {
      mostrarErro("erro-cad-cep", "CEP não encontrado.");
      marcarCampo("cad-cep", true);
      return;
    }
    campoCidade.value = `${dados.localidade} - ${dados.uf}`;
  } catch (erro) {
    console.error(erro);
    mostrarErro("erro-cad-cep", "Não consegui consultar o CEP agora.");
    marcarCampo("cad-cep", true);
  }
};

campoCep.addEventListener("blur", buscarCep); // blur = quando sai do campo

// ---------- CADASTRO ----------
formCadastro.addEventListener("submit", async (evento) => {
  evento.preventDefault(); // impede a página de recarregar

  const nome = document.getElementById("cad-nome").value.trim();
  const email = document.getElementById("cad-email").value.trim().toLowerCase();
  const senha = document.getElementById("cad-senha").value;
  const confirmar = document.getElementById("cad-confirmar").value;

  let tudoCerto = true;

  // Validação campo por campo
  if (nome.length < 3) {
    mostrarErro("erro-cad-nome", "Digite seu nome (mínimo 3 letras).");
    tudoCerto = false;
  } else {
    mostrarErro("erro-cad-nome", "");
  }
  marcarCampo("cad-nome", nome.length < 3);

  if (!emailValido(email)) {
    mostrarErro("erro-cad-email", "Digite um e-mail válido.");
    tudoCerto = false;
  } else if (pegarUsuarios().some((u) => u.email === email)) {
    mostrarErro("erro-cad-email", "Esse e-mail já tem cadastro.");
    tudoCerto = false;
  } else {
    mostrarErro("erro-cad-email", "");
  }
  marcarCampo("cad-email", document.getElementById("erro-cad-email").textContent !== "");

  if (senha.length < 6) {
    mostrarErro("erro-cad-senha", "A senha precisa ter pelo menos 6 caracteres.");
    tudoCerto = false;
  } else {
    mostrarErro("erro-cad-senha", "");
  }
  marcarCampo("cad-senha", senha.length < 6);

  if (confirmar !== senha) {
    mostrarErro("erro-cad-confirmar", "As senhas não são iguais.");
    tudoCerto = false;
  } else {
    mostrarErro("erro-cad-confirmar", "");
  }
  marcarCampo("cad-confirmar", confirmar !== senha);

  // Se o CEP foi preenchido, confere de novo antes de salvar
  if (campoCep.value.trim() !== "") {
    await buscarCep();
    if (campoCidade.value === "") tudoCerto = false;
  }

  if (!tudoCerto) return;

  // Cada usuário é um OBJETO; a lista de usuários é um ARRAY de objetos
  const novoUsuario = {
    nome: nome,
    email: email,
    senha: senha, // só para estudo! Em site de verdade a senha nunca fica assim.
    cep: campoCep.value.replace(/\D/g, ""),
    cidade: campoCidade.value,
  };

  const lista = pegarUsuarios();
  lista.push(novoUsuario);
  salvarUsuarios(lista);

  // Volta para a aba de entrar com o e-mail já preenchido
  formCadastro.reset();
  campoCidade.value = "";
  trocarAba("entrar");
  document.getElementById("login-email").value = email;
  caixaSucesso.textContent = "Conta criada! Agora é só entrar ♡";
  caixaSucesso.hidden = false;
});

// ---------- LOGIN ----------
formLogin.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const senha = document.getElementById("login-senha").value;

  let tudoCerto = true;
  mostrarErro("erro-login-geral", "");

  if (!emailValido(email)) {
    mostrarErro("erro-login-email", "Digite um e-mail válido.");
    tudoCerto = false;
  } else {
    mostrarErro("erro-login-email", "");
  }
  marcarCampo("login-email", !emailValido(email));

  if (senha === "") {
    mostrarErro("erro-login-senha", "Digite sua senha.");
    tudoCerto = false;
  } else {
    mostrarErro("erro-login-senha", "");
  }
  marcarCampo("login-senha", senha === "");

  if (!tudoCerto) return;

  // Procura no array o usuário que tem esse e-mail e essa senha
  const encontrado = pegarUsuarios().find((u) => u.email === email && u.senha === senha);

  if (!encontrado) {
    mostrarErro("erro-login-geral", "E-mail ou senha incorretos.");
    return;
  }

  // Guarda só o necessário (nunca a senha) na "sessão"
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ nome: encontrado.nome, email: encontrado.email }));
  location.href = "index.html";
});
