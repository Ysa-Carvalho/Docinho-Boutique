// ============================================================
// HOME DA DOCINHO BOUTIQUE
// ============================================================

// ---------- SESSÃO: quem está logado? ----------
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario) {
  location.replace("login.html");
}

const primeiroNome = usuario ? usuario.nome.split(" ")[0] : "";
document.getElementById("nome-usuario").textContent = `Oi, ${primeiroNome}!`;

document.getElementById("botao-sair").addEventListener("click", () => {
  localStorage.removeItem("usuarioLogado");
  location.href = "login.html";
});

// ---------- DADOS ----------
// Cada item é um OBJETO (as características de um slide/depoimento).
// A lista com todos eles é um ARRAY.
// As imagens são do Unsplash. Se algum link quebrar, troque só o campo "imagem".
// Se a imagem não carregar, o fundo pastel (cor1 e cor2) aparece no lugar.
const banners = [
  {
    titulo: "Looks fofos para todos os dias",
    texto: "Peças delicadas em tons suaves para você se sentir linda.",
    botao: "Ver achadinhos",
    imagem: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
    cor1: "#ffd1e3",
    cor2: "#e4d7ff",
  },
  {
    titulo: "Acessórios que brilham com você",
    texto: "Colares, brincos e anéis para completar cada produção.",
    botao: "Quero brilhar",
    imagem: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80",
    cor1: "#d3f5e5",
    cor2: "#ffe6d5",
  },
  {
    titulo: "Novidades chegando com carinho",
    texto: "Escolha suas favoritas e salve com um coraçãozinho.",
    botao: "Conhecer novidades",
    imagem: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
    cor1: "#e4d7ff",
    cor2: "#ffd1e3",
  },
];

// Depoimentos inventados, só para o projeto.
const depoimentos = [
  {
    nome: "Marina Duarte",
    detalhe: "Cliente da Docinho",
    texto: "As peças são lindas demais e o tecido é de ótima qualidade. Já virei cliente fiel.",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
  {
    nome: "Camila Rocha",
    detalhe: "Estudante de Design",
    texto: "Tudo chega bem embalado e os acessórios são ainda mais bonitos pessoalmente. Amei o acabamento.",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    nome: "Beatriz Lima",
    detalhe: "Professora",
    texto: "Comprei um colar para presentear e todo mundo elogiou. A qualidade é de primeira.",
    avatar: "https://i.pravatar.cc/150?img=45",
  },
  {
    nome: "Julia Nogueira",
    detalhe: "Cliente da Docinho",
    texto: "As cores são delicadas e as peças são caprichadas. Dá até vontade de usar todo dia!",
    avatar: "https://i.pravatar.cc/150?img=44",
  },
];

const beneficios = [
  { icone: "🎀", titulo: "Escolhidas com carinho", texto: "Cada peça é selecionada a dedo para deixar seu dia mais bonito." },
  { icone: "💎", titulo: "Qualidade que dura", texto: "Acabamento caprichado em roupas e acessórios para usar sem medo." },
  { icone: "💌", titulo: "Embalagem de presente", texto: "Seu pedido chega arrumadinho, pronto para dar ou guardar." },
];

// ---------- CARROSSEL (uma função que serve para os dois carrosséis) ----------
const criarCarrossel = ({ trilho, anterior, proximo, areaPontos, total, intervalo }) => {
  let atual = 0;
  let temporizador;

  // Cria um pontinho para cada slide
  const pontos = [];
  for (let i = 0; i < total; i++) {
    const ponto = document.createElement("button");
    ponto.className = "ponto";
    ponto.setAttribute("aria-label", `Ir para o slide ${i + 1}`);
    ponto.addEventListener("click", () => {
      irPara(i);
      reiniciarTempo();
    });
    areaPontos.appendChild(ponto);
    pontos.push(ponto);
  }

  // Move o trilho: cada slide ocupa 100% da largura
  const irPara = (indice) => {
    atual = (indice + total) % total; // dá a volta: depois do último vem o primeiro
    trilho.style.transform = `translateX(-${atual * 100}%)`;
    pontos.forEach((p, i) => p.classList.toggle("ativo", i === atual));
  };

  const reiniciarTempo = () => {
    clearInterval(temporizador);
    temporizador = setInterval(() => irPara(atual + 1), intervalo);
  };

  anterior.addEventListener("click", () => {
    irPara(atual - 1);
    reiniciarTempo();
  });
  proximo.addEventListener("click", () => {
    irPara(atual + 1);
    reiniciarTempo();
  });

  irPara(0);
  reiniciarTempo();
};

// ---------- SEÇÃO 1: BANNER ----------
const montarBanner = () => {
  const trilho = document.getElementById("trilho-banner");

  banners.forEach((b) => {
    const slide = document.createElement("div");
    slide.className = "slide slide-banner";
    // Três camadas: véu rosado, foto e, por baixo, um fundo pastel (caso a foto falhe)
    slide.style.backgroundImage = `linear-gradient(90deg, rgba(255,245,250,0.92) 0%, rgba(255,245,250,0.5) 55%, rgba(255,245,250,0) 100%), url("${b.imagem}"), linear-gradient(135deg, ${b.cor1}, ${b.cor2})`;
    slide.innerHTML = `
      <div class="banner-texto">
        <h1>${b.titulo}</h1>
        <p>${b.texto}</p>
        <a class="btn" href="#produtos">${b.botao}</a>
      </div>
    `;
    trilho.appendChild(slide);
  });

  criarCarrossel({
    trilho: trilho,
    anterior: document.getElementById("banner-anterior"),
    proximo: document.getElementById("banner-proximo"),
    areaPontos: document.getElementById("pontos-banner"),
    total: banners.length,
    intervalo: 5000,
  });
};

// ---------- SEÇÃO 2: PRODUTOS (API) ----------
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

const atualizarContadorFavoritos = () => {
  document.getElementById("contador-favoritos").textContent = favoritos.length;
};

const alternarFavorito = (id, botao) => {
  if (favoritos.includes(id)) {
    favoritos = favoritos.filter((f) => f !== id); // tira da lista
  } else {
    favoritos.push(id); // coloca na lista
  }
  localStorage.setItem("favoritos", JSON.stringify(favoritos));

  const ativo = favoritos.includes(id);
  botao.classList.toggle("ativo", ativo);
  botao.textContent = ativo ? "♥" : "♡";
  atualizarContadorFavoritos();
};

const formatarPreco = (valor) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "USD" });

const criarCardProduto = (produto) => {
  const card = document.createElement("article");
  card.className = "card-produto";
  const favoritado = favoritos.includes(produto.id);

  card.innerHTML = `
    <button class="botao-favorito ${favoritado ? "ativo" : ""}" aria-label="Favoritar">${favoritado ? "♥" : "♡"}</button>
    <img src="${produto.image}" alt="${produto.title}">
    <h3>${produto.title}</h3>
    <span class="categoria">${produto.category}</span>
    <span class="preco">${formatarPreco(produto.price)}</span>
  `;

  const botao = card.querySelector(".botao-favorito");
  botao.addEventListener("click", () => alternarFavorito(produto.id, botao));

  return card;
};

const carregarProdutos = async () => {
  const area = document.getElementById("lista-produtos");
  area.innerHTML = `<p class="aviso">Carregando as fofurinhas...</p>`;

  try {
    const resposta = await fetch("https://fakestoreapi.com/products");
    if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);

    const todos = await resposta.json(); // um ARRAY de OBJETOS

    // Fica só com as categorias que combinam com o tema
    const selecionados = todos
      .filter((p) => p.category === "jewelery" || p.category === "women's clothing")
      .slice(0, 8);

    area.innerHTML = "";
    selecionados.forEach((p) => area.appendChild(criarCardProduto(p)));
  } catch (erro) {
    console.error(erro);
    area.innerHTML = `
      <div class="aviso">
        <p>Não consegui carregar os produtos agora.</p>
        <button class="btn" id="tentar-de-novo">Tentar de novo</button>
      </div>
    `;
    document.getElementById("tentar-de-novo").addEventListener("click", carregarProdutos);
  }
};

// ---------- SEÇÃO 3: DEPOIMENTOS ----------
const montarDepoimentos = () => {
  const trilho = document.getElementById("trilho-depoimentos");

  depoimentos.forEach((d) => {
    const slide = document.createElement("div");
    slide.className = "slide slide-depoimento";
    slide.innerHTML = `
      <div class="card-depoimento">
        <div class="avatar"><span>${d.nome.charAt(0)}</span></div>
        <div class="estrelas">★★★★★</div>
        <p>“${d.texto}”</p>
        <strong>${d.nome}</strong>
        <small>${d.detalhe}</small>
      </div>
    `;

    // A foto entra por cima da inicial. Se não carregar, a inicial continua aparecendo.
    const foto = document.createElement("img");
    foto.src = d.avatar;
    foto.alt = d.nome;
    foto.addEventListener("error", () => foto.remove());
    slide.querySelector(".avatar").appendChild(foto);

    trilho.appendChild(slide);
  });

  criarCarrossel({
    trilho: trilho,
    anterior: document.getElementById("depo-anterior"),
    proximo: document.getElementById("depo-proximo"),
    areaPontos: document.getElementById("pontos-depoimentos"),
    total: depoimentos.length,
    intervalo: 6500,
  });
};

// ---------- SEÇÃO 4: BENEFÍCIOS ----------
const montarBeneficios = () => {
  const area = document.getElementById("lista-beneficios");
  beneficios.forEach((b) => {
    const card = document.createElement("div");
    card.className = "card-beneficio";
    card.innerHTML = `
      <div class="icone">${b.icone}</div>
      <h3>${b.titulo}</h3>
      <p>${b.texto}</p>
    `;
    area.appendChild(card);
  });
};

// ---------- COMEÇA TUDO AQUI ----------
if (usuario) {
  atualizarContadorFavoritos();
  montarBanner();
  carregarProdutos();
  montarDepoimentos();
  montarBeneficios();
}
