/* ============================================================
   PORTFÓLIO — ANA CAROLINA MUNIZ
   script.js
   ------------------------------------------------------------
   Este arquivo está dividido em módulos bem comentados:
     1) Configuração (liga/desliga a API do back-end)
     2) Cursor borboleta animado
     3) Menu mobile
     4) Filtros do "Guia de Campo Tech"
     5) CRUD de comentários (criar, ler, editar, apagar)
     6) Pequenos detalhes (ano no rodapé)

   IMPORTANTE: nenhuma dependência externa é necessária — tudo
   aqui é JavaScript puro ("vanilla"), para funcionar em qualquer
   hospedagem estática (GitHub Pages, Vercel, etc.).
============================================================= */

/* ---------- 1) CONFIGURAÇÃO ---------- */
/*
 * Se você publicar o back-end Java/Spring Boot (pasta /backend) em um
 * serviço que aceite aplicações Java (ex.: Render, Railway, AWS, Azure),
 * coloque a URL pública dele aqui. A Vercel hospeda o FRONT-END; o
 * BACK-END Java precisa de outro provedor, pois a Vercel não executa
 * aplicações Java de longa duração (mais detalhes no README).
 *
 * Enquanto API_BASE_URL estiver vazia (""), os comentários funcionam
 * 100% no navegador, usando localStorage — então o site continua
 * funcionando mesmo sem back-end (arquitetura resiliente / "degradação
 * graciosa": se a API cair ou não existir, a experiência não quebra).
 */
const API_BASE_URL = ""; // exemplo quando publicado: "https://seu-backend.onrender.com"

document.addEventListener("DOMContentLoaded", function () {
  iniciarCursorBorboleta();
  iniciarMenuMobile();
  iniciarFiltrosGuia();
  iniciarComentarios();
  document.getElementById("ano-atual").textContent = new Date().getFullYear();
});

/* ============================================================
   2) CURSOR BORBOLETA ANIMADO
   ------------------------------------------------------------
   A ideia: escondemos o cursor padrão (via CSS, classe no <body>)
   e movemos a <div id="cursor-borboleta"> para seguir o mouse,
   com uma pequena suavização ("easing") para parecer um voo e
   não um teleporte.
============================================================= */
function iniciarCursorBorboleta() {
  const borboleta = document.getElementById("cursor-borboleta");
  const botaoToggle = document.getElementById("botao-cursor");
  if (!borboleta) return;

  // Detecta se o dispositivo tem um mouse de precisão (não é touch).
  const temMousePreciso = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const prefereMenosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Em celular/tablet ou quando o usuário pede menos animações,
  // a borboleta não é exibida — por usabilidade e acessibilidade.
  if (!temMousePreciso || prefereMenosMovimento) {
    borboleta.style.display = "none";
    if (botaoToggle) botaoToggle.style.display = "none";
    return;
  }

  let cursorAtivo = true;

  // Posição alvo (onde o mouse está) e posição atual (onde a borboleta está).
  let alvoX = window.innerWidth / 2;
  let alvoY = window.innerHeight / 2;
  let atualX = alvoX;
  let atualY = alvoY;
  let ultimaAtualX = atualX;

  document.body.classList.add("cursor-borboleta-ativo");

  window.addEventListener("mousemove", function (evento) {
    alvoX = evento.clientX;
    alvoY = evento.clientY;
  });

  // Esconde a borboleta quando o mouse sai da janela (ex.: outra aba).
  window.addEventListener("mouseleave", () => borboleta.classList.add("escondido"));
  window.addEventListener("mouseenter", () => borboleta.classList.remove("escondido"));

  // Loop de animação: a cada quadro, a borboleta "persegue" o alvo
  // com suavização (interpolação linear), criando sensação de voo.
  function animar() {
    const suavizacao = 0.16;
    atualX += (alvoX - atualX) * suavizacao;
    atualY += (alvoY - atualY) * suavizacao;

    if (cursorAtivo) {
      // Inclina levemente a borboleta na direção do movimento horizontal.
      const direcao = atualX - ultimaAtualX;
      const inclinacao = Math.max(-18, Math.min(18, direcao * 2));
      borboleta.style.transform =
        `translate(${atualX}px, ${atualY}px) translate(-50%, -50%) rotate(${inclinacao}deg)`;
    }

    ultimaAtualX = atualX;
    requestAnimationFrame(animar);
  }
  requestAnimationFrame(animar);

  // Botão no menu permite ligar/desligar o cursor customizado —
  // importante para quem prefere o cursor padrão do sistema.
  if (botaoToggle) {
    botaoToggle.addEventListener("click", function () {
      cursorAtivo = !cursorAtivo;
      document.body.classList.toggle("cursor-borboleta-ativo", cursorAtivo);
      borboleta.style.display = cursorAtivo ? "block" : "none";
      botaoToggle.setAttribute("aria-pressed", String(cursorAtivo));
      botaoToggle.textContent = cursorAtivo ? "🦋 Cursor: ligado" : "🦋 Cursor: desligado";
    });
  }
}

/* ============================================================
   3) MENU MOBILE
============================================================= */
function iniciarMenuMobile() {
  const botaoMenu = document.getElementById("botao-menu");
  const listaNav = document.getElementById("lista-nav");
  if (!botaoMenu || !listaNav) return;

  botaoMenu.addEventListener("click", function () {
    const aberto = listaNav.classList.toggle("aberta");
    botaoMenu.setAttribute("aria-expanded", String(aberto));
  });

  // Fecha o menu automaticamente ao clicar em um link (boa UX no celular).
  listaNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", () => listaNav.classList.remove("aberta"));
  });
}

/* ============================================================
   4) FILTROS DO GUIA DE CAMPO TECH
============================================================= */
function iniciarFiltrosGuia() {
  const botoesFiltro = document.querySelectorAll(".filtro");
  const cartoes = document.querySelectorAll(".cartao-especimen");

  botoesFiltro.forEach(function (botao) {
    botao.addEventListener("click", function () {
      const categoriaEscolhida = botao.dataset.filtro;

      // Atualiza qual botão está marcado como "ativo".
      botoesFiltro.forEach((b) => {
        b.classList.remove("ativo");
        b.setAttribute("aria-selected", "false");
      });
      botao.classList.add("ativo");
      botao.setAttribute("aria-selected", "true");

      // Mostra apenas os cartões cuja lista de categorias contém a escolhida.
      cartoes.forEach(function (cartao) {
        const categoriasDoCartao = (cartao.dataset.categoria || "").split(" ");
        const deveMostrar = categoriaEscolhida === "todos" || categoriasDoCartao.includes(categoriaEscolhida);
        cartao.classList.toggle("oculto", !deveMostrar);
      });
    });
  });
}

/* ============================================================
   5) CRUD DE COMENTÁRIOS
   ------------------------------------------------------------
   Operações: CREATE (publicar), READ (listar), UPDATE (editar),
   DELETE (apagar). Por padrão usa localStorage; se API_BASE_URL
   estiver configurada, tenta usar a API Java/MySQL e, em caso de
   falha de rede, cai de volta (fallback) para o localStorage —
   isso é o que torna a arquitetura "resiliente".
============================================================= */
const CHAVE_LOCALSTORAGE = "portfolio_ana_comentarios";

function iniciarComentarios() {
  const formulario = document.getElementById("form-comentario");
  const campoId = document.getElementById("comentario-id");
  const campoNome = document.getElementById("comentario-nome");
  const campoTexto = document.getElementById("comentario-texto");
  const botaoCancelar = document.getElementById("botao-cancelar-edicao");
  const botaoEnviar = document.getElementById("botao-enviar-comentario");

  carregarComentarios();

  formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const nome = campoNome.value.trim();
    const texto = campoTexto.value.trim();
    if (!nome || !texto) return;

    const idEmEdicao = campoId.value;

    if (idEmEdicao) {
      await atualizarComentario(idEmEdicao, nome, texto);
    } else {
      await criarComentario(nome, texto);
    }

    formulario.reset();
    campoId.value = "";
    botaoCancelar.hidden = true;
    botaoEnviar.innerHTML = '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Publicar comentário';

    carregarComentarios();
  });

  botaoCancelar.addEventListener("click", function () {
    formulario.reset();
    campoId.value = "";
    botaoCancelar.hidden = true;
    botaoEnviar.innerHTML = '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Publicar comentário';
  });
}

/* ---------- Funções de acesso a dados (localStorage) ---------- */

function lerComentariosLocais() {
  try {
    const dados = localStorage.getItem(CHAVE_LOCALSTORAGE);
    return dados ? JSON.parse(dados) : [];
  } catch (erro) {
    console.error("Não foi possível ler os comentários salvos:", erro);
    return [];
  }
}

function salvarComentariosLocais(listaDeComentarios) {
  localStorage.setItem(CHAVE_LOCALSTORAGE, JSON.stringify(listaDeComentarios));
}

/* ---------- CREATE ---------- */
async function criarComentario(nome, texto) {
  const novoComentario = {
    id: Date.now().toString(),
    nome: sanitizarTexto(nome),
    texto: sanitizarTexto(texto),
    dataCriacao: new Date().toISOString(),
  };

  if (API_BASE_URL) {
    try {
      const resposta = await fetch(`${API_BASE_URL}/api/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoComentario.nome, texto: novoComentario.texto }),
      });
      if (resposta.ok) return; // sucesso: a API já persistiu no MySQL
    } catch (erro) {
      console.warn("API indisponível, salvando localmente. Detalhe:", erro);
    }
  }

  // Fallback (ou modo padrão): guarda no navegador.
  const comentarios = lerComentariosLocais();
  comentarios.unshift(novoComentario);
  salvarComentariosLocais(comentarios);
}

/* ---------- READ ---------- */
async function obterComentarios() {
  if (API_BASE_URL) {
    try {
      const resposta = await fetch(`${API_BASE_URL}/api/comentarios`);
      if (resposta.ok) return await resposta.json();
    } catch (erro) {
      console.warn("API indisponível, exibindo comentários locais. Detalhe:", erro);
    }
  }
  return lerComentariosLocais();
}

/* ---------- UPDATE ---------- */
async function atualizarComentario(id, nome, texto) {
  if (API_BASE_URL) {
    try {
      const resposta = await fetch(`${API_BASE_URL}/api/comentarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: sanitizarTexto(nome), texto: sanitizarTexto(texto) }),
      });
      if (resposta.ok) return;
    } catch (erro) {
      console.warn("API indisponível, atualizando localmente. Detalhe:", erro);
    }
  }

  const comentarios = lerComentariosLocais();
  const indice = comentarios.findIndex((c) => c.id === id);
  if (indice !== -1) {
    comentarios[indice].nome = sanitizarTexto(nome);
    comentarios[indice].texto = sanitizarTexto(texto);
    comentarios[indice].dataEdicao = new Date().toISOString();
    salvarComentariosLocais(comentarios);
  }
}

/* ---------- DELETE ---------- */
async function apagarComentario(id) {
  if (API_BASE_URL) {
    try {
      const resposta = await fetch(`${API_BASE_URL}/api/comentarios/${id}`, { method: "DELETE" });
      if (resposta.ok) return;
    } catch (erro) {
      console.warn("API indisponível, apagando localmente. Detalhe:", erro);
    }
  }

  const comentarios = lerComentariosLocais().filter((c) => c.id !== id);
  salvarComentariosLocais(comentarios);
}

/* ---------- Renderização da lista na tela ---------- */
async function carregarComentarios() {
  const lista = document.getElementById("lista-comentarios");
  const mensagemVazia = document.getElementById("mensagem-sem-comentarios");
  const comentarios = await obterComentarios();

  lista.innerHTML = "";

  if (!comentarios || comentarios.length === 0) {
    mensagemVazia.classList.remove("escondida");
    return;
  }
  mensagemVazia.classList.add("escondida");

  comentarios.forEach(function (comentario) {
    const item = document.createElement("li");
    item.className = "item-comentario";

    const dataFormatada = formatarData(comentario.dataCriacao);

    item.innerHTML = `
      <div class="cabecalho-comentario">
        <strong>${escaparHtml(comentario.nome)}</strong>
        <span class="data-comentario">${dataFormatada}</span>
      </div>
      <p class="texto-comentario">${escaparHtml(comentario.texto)}</p>
      <div class="acoes-comentario">
        <button type="button" class="editar" data-id="${comentario.id}">
          <i class="fa-solid fa-pen" aria-hidden="true"></i> Editar
        </button>
        <button type="button" class="apagar" data-id="${comentario.id}">
          <i class="fa-solid fa-trash" aria-hidden="true"></i> Apagar
        </button>
      </div>
    `;
    lista.appendChild(item);
  });

  // Liga os botões de Editar/Apagar recém-criados.
  lista.querySelectorAll("button.editar").forEach(function (botao) {
    botao.addEventListener("click", () => preencherFormularioParaEdicao(botao.dataset.id, comentarios));
  });
  lista.querySelectorAll("button.apagar").forEach(function (botao) {
    botao.addEventListener("click", async function () {
      const confirmou = window.confirm("Tem certeza que deseja apagar este comentário?");
      if (!confirmou) return;
      await apagarComentario(botao.dataset.id);
      carregarComentarios();
    });
  });
}

function preencherFormularioParaEdicao(id, comentarios) {
  const comentario = comentarios.find((c) => c.id === id || String(c.id) === String(id));
  if (!comentario) return;

  document.getElementById("comentario-id").value = comentario.id;
  document.getElementById("comentario-nome").value = comentario.nome;
  document.getElementById("comentario-texto").value = comentario.texto;
  document.getElementById("botao-cancelar-edicao").hidden = false;
  document.getElementById("botao-enviar-comentario").innerHTML =
    '<i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Salvar edição';

  document.getElementById("comentarios").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- Utilitários de segurança/formatação ---------- */

// Remove espaços extras nas pontas do texto digitado.
function sanitizarTexto(texto) {
  return texto.trim();
}

// Evita XSS: transforma caracteres especiais em entidades HTML antes
// de inserir o conteúdo digitado pela pessoa usuária na página.
function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function formatarData(isoString) {
  if (!isoString) return "";
  const data = new Date(isoString);
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " às " + data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
