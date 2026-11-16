"use strict";

const citacoes = [
  "Acredite em você e continue avançando.",
  "Grandes resultados começam com pequenos passos.",
  "O sucesso é construído todos os dias.",
  "Não desista dos seus objetivos.",
  "Cada desafio é uma oportunidade para crescer."
];

const coresConfete = ["#ff2e93", "#ffd23f", "#00c2ff", "#8a3dff", "#00d98b", "#ff7a1a"];

const elementoCitacao = document.getElementById("citacao");
const botaoNovaCitacao = document.getElementById("btn-nova-citacao");
const card = document.querySelector(".card");
const canvas = document.getElementById("confetes");
const ctx = canvas.getContext("2d");
const prefereMenosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

// Guarda a última citação exibida para impedir repetição consecutiva
let ultimaCitacao = null;
let particulas = [];
let confeteAtivo = false;

/* ---------- Sorteio sem repetição seguida ---------- */
function sortearCitacao() {
  // Com apenas uma frase disponível, não há como evitar a repetição
  if (citacoes.length === 1) {
    return citacoes[0];
  }

  let novaCitacao;

  do {
    const indice = Math.floor(Math.random() * citacoes.length);
    novaCitacao = citacoes[indice];
  } while (novaCitacao === ultimaCitacao);

  ultimaCitacao = novaCitacao;
  return novaCitacao;
}

/* ---------- Exibição da frase, palavra por palavra ---------- */
function montarPalavras(texto) {
  const fragmento = document.createDocumentFragment();
  const palavras = texto.split(" ");

  palavras.forEach((palavra, i) => {
    const span = document.createElement("span");
    span.className = "palavra";
    span.textContent = palavra;
    fragmento.appendChild(span);

    if (i < palavras.length - 1) {
      fragmento.appendChild(document.createTextNode(" "));
    }
  });

  return fragmento;
}

// Remove e recoloca a classe para a animação CSS recomeçar do zero
function reiniciarAnimacao(elemento, classe) {
  elemento.classList.remove(classe);
  void elemento.offsetWidth;
  elemento.classList.add(classe);
}

/* ---------- Confetes ---------- */
function ajustarCanvas() {
  const proporcao = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * proporcao;
  canvas.height = window.innerHeight * proporcao;
  ctx.setTransform(proporcao, 0, 0, proporcao, 0, 0);
}

function criarConfetes(x, y) {
  for (let i = 0; i < 48; i++) {
    const angulo = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
    const velocidade = 5 + Math.random() * 9;

    particulas.push({
      x,
      y,
      vx: Math.cos(angulo) * velocidade,
      vy: Math.sin(angulo) * velocidade,
      tamanho: 6 + Math.random() * 7,
      cor: coresConfete[Math.floor(Math.random() * coresConfete.length)],
      rotacao: Math.random() * Math.PI * 2,
      giro: (Math.random() - 0.5) * 0.4,
      vida: 1,
      desgaste: 0.012 + Math.random() * 0.01,
      redonda: Math.random() < 0.35
    });
  }

  if (!confeteAtivo) {
    confeteAtivo = true;
    requestAnimationFrame(animarConfetes);
  }
}

function animarConfetes() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particulas = particulas.filter((p) => p.vida > 0);

  particulas.forEach((p) => {
    p.vy += 0.28; // gravidade
    p.vx *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.rotacao += p.giro;
    p.vida -= p.desgaste;

    ctx.save();
    ctx.globalAlpha = Math.max(p.vida, 0);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotacao);
    ctx.fillStyle = p.cor;

    if (p.redonda) {
      ctx.beginPath();
      ctx.arc(0, 0, p.tamanho / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.tamanho / 2, -p.tamanho / 4, p.tamanho, p.tamanho / 2);
    }

    ctx.restore();
  });

  if (particulas.length > 0) {
    requestAnimationFrame(animarConfetes);
  } else {
    confeteAtivo = false;
  }
}

/* ---------- Clique no botão ---------- */
function exibirNovaCitacao() {
  const citacao = sortearCitacao();

  elementoCitacao.classList.remove("quote-area__text--inicial");
  elementoCitacao.replaceChildren(montarPalavras(citacao));

  // Cada frase tem seu tema de cores (definido no CSS por data-tema)
  document.body.dataset.tema = String(citacoes.indexOf(citacao) + 1);

  if (prefereMenosMovimento.matches) {
    return;
  }

  reiniciarAnimacao(card, "card--pop");
  reiniciarAnimacao(botaoNovaCitacao, "btn--clique");

  const area = botaoNovaCitacao.getBoundingClientRect();
  criarConfetes(area.left + area.width / 2, area.top);
}

ajustarCanvas();
window.addEventListener("resize", ajustarCanvas);
botaoNovaCitacao.addEventListener("click", exibirNovaCitacao);
