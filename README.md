
# Maratona do Coelho 🐰

**Maratona do Coelho** é um jogo de plataforma 2D desenvolvido com tecnologias web modernas, trazendo a nostalgia dos clássicos da era 16-bits (Super Nintendo) para o navegador. 

Baseado nas aventuras da **Turma da Mônica**, o jogo coloca o jogador no controle da Mônica em uma perseguição frenética pelo Bairro do Limoeiro para recuperar seu inseparável coelhinho azul, o Sansão.

## 📖 História e Contexto

O Cebolinha aprontou mais uma! Ele pegou o Sansão e saiu correndo pelo bairro. Agora, a Mônica precisa atravessar obstáculos, pular entre plataformas e percorrer 6.000 metros o mais rápido possível para alcançar o "rebolado" do seu amigo (ou rival) e garantir que seu coelhinho volte para casa em segurança.

## 🎮 Funcionalidades

- **Estética Retro:** Gráficos em Pixel Art com renderização otimizada para manter o aspecto "crispy" dos consoles antigos.
- **Física de Precisão:** Movimentação fluida e responsiva, com detecção de colisão AABB (Axis-Aligned Bounding Box).
- **Ambiente Dinâmico:** Cenários inspirados no Bairro do Limoeiro, com parallax no fundo e elementos clássicos como cercas de madeira e prédios ao fundo.
- **Progressão em Tempo Real:** HUD que exibe a distância percorrida e o progresso total da fase.
- **Suporte Multiplataforma:** Jogue no PC via teclado ou em dispositivos móveis através de controles por toque integrados.

## ⌨️ Controles

### Desktop (Teclado)
- **Seta para Direita / D:** Mover para a frente
- **Seta para Esquerda / A:** Mover para trás
- **Seta para Cima / Espaço / W:** Pular
- **P:** Pausar (visto na tela inicial)

### Mobile (Touch)
- Botões direcionais no lado esquerdo da tela para movimentação.
- Botão de ação circular no lado direito para pular.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as melhores práticas de engenharia de software front-end:

- **React 19:** Para gerenciamento de estado e interface do usuário.
- **TypeScript:** Garantindo robustez e tipagem estática para a lógica da engine física.
- **HTML5 Canvas API:** Utilizado para a renderização de alto desempenho do jogo a 60 FPS.
- **Tailwind CSS:** Estilização da interface de menus e overlays.
- **Lucide React:** Ícones modernos para a UI.

## 🚀 Como Executar

Como este é um projeto baseado em módulos ES6 e React, basta servir os arquivos através de um servidor local:

1. Certifique-se de estar na raiz do projeto.
2. Utilize qualquer servidor estático (como `serve`, `live-server` ou o próprio ambiente de desenvolvimento do navegador).
3. Abra o `index.html`.

---

*Aviso Legal: Este é um projeto de fã com fins educacionais e de portfólio. Os personagens Mônica, Cebolinha e Sansão são marcas registradas de Maurício de Sousa Produções.*
