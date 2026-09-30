const CHAVE_USUARIOS = "usuarios";        
const CHAVE_SESSAO = "usuarioLogado";     

const pegarUsuarios = () => JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
const salvarUsuarios = (lista) => localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(lista));

const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const mostrarErro = (idErro, mensagem) => {
  document.getElementById(idErro).textContent = mensagem;
};

const marcarCampo = (idCampo, temErro) => {
  document.getElementById(idCampo).classList.toggle("invalido", temErro);
};

if (localStorage.getItem(CHAVE_SESSAO)) {
  location.replace("index.html");
}

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

const campoCep = document.getElementById("cad-cep");
const campoCidade = document.getElementById("cad-cidade");

const buscarCep = async () => {
  const cep = campoCep.value.replace(/\D/g, ""); 
  campoCidade.value = "";
  mostrarErro("erro-cad-cep", "");
  marcarCampo("cad-cep", false);

  if (cep === "") return; 

  if (cep.length !== 8) {
    mostrarErro("erro-cad-cep", "O CEP precisa ter 8 números.");
    marcarCampo("cad-cep", true);
    return;
  }

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!resposta.ok) throw new Error("Falha na consulta");
    const dados = await resposta.json();

    
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

campoCep.addEventListener("blur", buscarCep); 

formCadastro.addEventListener("submit", async (evento) => {
  evento.preventDefault(); 

  const nome = document.getElementById("cad-nome").value.trim();
  const email = document.getElementById("cad-email").value.trim().toLowerCase();
  const senha = document.getElementById("cad-senha").value;
  const confirmar = document.getElementById("cad-confirmar").value;

  let tudoCerto = true;

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

  if (campoCep.value.trim() !== "") {
    await buscarCep();
    if (campoCidade.value === "") tudoCerto = false;
  }

  if (!tudoCerto) return;

  const novoUsuario = {
    nome: nome,
    email: email,
    senha: senha, 
    cep: campoCep.value.replace(/\D/g, ""),
    cidade: campoCidade.value,
  };

  const lista = pegarUsuarios();
  lista.push(novoUsuario);
  salvarUsuarios(lista);

  formCadastro.reset();
  campoCidade.value = "";
  trocarAba("entrar");
  document.getElementById("login-email").value = email;
  caixaSucesso.textContent = "Conta criada! Agora é só entrar ♡";
  caixaSucesso.hidden = false;
});

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

  const encontrado = pegarUsuarios().find((u) => u.email === email && u.senha === senha);

  if (!encontrado) {
    mostrarErro("erro-login-geral", "E-mail ou senha incorretos.");
    return;
  }

  localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ nome: encontrado.nome, email: encontrado.email }));
  location.href = "index.html";
});
