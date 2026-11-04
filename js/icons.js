(() => {
  const hero = document.getElementById("hero");
  const content = hero?.querySelector(":scope > div:first-child");
  if (!hero || !content) return;

  const devicon = name =>
    `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name}/${name}-original.svg`;
  const groups = [
    {
      side: "l",
      items: [
        ["Java", "java", "JV", "#f89820"],
        ["Spring Boot", "spring", "SB", "#6db33f"],
        ["Node.js", "nodejs", "JS", "#68a063"],
        ["React", "react", "⚛", "#61dafb"],
        ["SQL / MySQL", "mysql", "SQL", "#00758f"],
        ["MongoDB", "mongodb", "M", "#47a248"]
      ]
    },
    {
      side: "r",
      items: [
        ["Microservices", "", "⬡", "#a855f7"],
        ["HTML5", "html5", "H5", "#e44d26"],
        ["CSS3", "css3", "C3", "#1572b6"],
        ["JavaScript", "javascript", "JS", "#f7df1e"],
        ["PHP", "php", "PHP", "#8892bf"],
        ["DSA", "", "{ }", "#00f5ff"]
      ]
    }
  ];

  const tiles = groups.map(({ side, items }) => {
    const field = document.createElement("div");
    field.className = `tech ${side}`;
    field.setAttribute("aria-label", `${side === "l" ? "Backend" : "Frontend"} technologies`);

    items.forEach(([name, icon, fallback, color]) => {
      const tile = document.createElement("div");
      tile.className = "tc";
      tile.style.setProperty("--c", color);
      tile.innerHTML = `<div class="ti" title="${name}"><span class="ic"></span></div><div class="nm">${name}</div>`;

      const iconContainer = tile.querySelector(".ic");
      if (icon) {
        const image = document.createElement("img");
        image.src = devicon(icon);
        image.alt = "";
        image.addEventListener("error", () => {
          image.remove();
          iconContainer.textContent = fallback;
        }, { once: true });
        iconContainer.append(image);
      } else {
        iconContainer.textContent = fallback;
      }

      const iconBox = tile.querySelector(".ti");
      const pop = () => {
        iconBox.classList.remove("pop");
        void iconBox.offsetWidth;
        iconBox.classList.add("pop");
      };
      tile.addEventListener("mouseenter", pop);
      tile.addEventListener("click", pop);
      field.append(tile);
    });

    hero.append(field);
    return { field, side, tiles: [...field.querySelectorAll(".tc")] };
  });

  function positionIcons() {
    const heroRect = hero.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    const heroStyle = getComputedStyle(hero);
    const paddingLeft = parseFloat(heroStyle.paddingLeft);
    const paddingRight = parseFloat(heroStyle.paddingRight);
    const gutterWidth = Math.min(
      contentRect.left - heroRect.left - paddingLeft,
      heroRect.right - contentRect.right - paddingRight
    );
    const widthSize = Math.floor((gutterWidth - 24) / 2);
    const heightSize = Math.floor((2 * heroRect.height - 286) / 7);
    const size = Math.min(150, widthSize, heightSize);
    const itemHeight = size + 34;
    const firstTop = 12;
    const lastTop = heroRect.height - itemHeight - 12;

    groups.forEach((group, groupIndex) => {
      const { field, tiles: groupTiles } = tiles[groupIndex];
      field.hidden = size < 52;
      if (field.hidden) return;

      field.style.setProperty("--s", `${size}px`);
      const minLeft = group.side === "l"
        ? paddingLeft + 12
        : contentRect.right - heroRect.left + 12;
      const maxLeft = group.side === "l"
        ? contentRect.left - heroRect.left - size - 12
        : heroRect.width - paddingRight - size - 12;
      const outerLeft = group.side === "l" ? minLeft : maxLeft;
      const innerLeft = group.side === "l" ? maxLeft : minLeft;
      const verticalStep = (lastTop - firstTop) / (groupTiles.length - 1);

      groupTiles.forEach((tile, index) => {
        tile.style.left = `${index % 2 === 0 ? outerLeft : innerLeft}px`;
        tile.style.top = `${firstTop + verticalStep * index}px`;
      });
    });
  }

  let resizeFrame = 0;
  const scheduleLayout = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(positionIcons);
  };
  window.addEventListener("resize", scheduleLayout);
  positionIcons();

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let mouseX = -999;
  let mouseY = -999;
  window.addEventListener("mousemove", event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });
  window.addEventListener("mouseleave", () => {
    mouseX = -999;
    mouseY = -999;
  });

  const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));
  function animate(time) {
    if (window.innerWidth >= 1200) {
      tiles.forEach(({ tiles: groupTiles }) => {
        groupTiles.forEach((tile, index) => {
          const icon = tile.querySelector(".ti");
          const rect = icon.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const dx = centerX - mouseX;
          const dy = centerY - mouseY;
          const distance = Math.hypot(dx, dy) || 1;
          let rotateX = Math.cos(time / 1500 + index) * 10;
          let rotateY = Math.sin(time / 1200 + index) * 14;
          let moveX = 0;
          let moveY = 0;

          if (distance < 420) {
            rotateY += clamp((mouseX - centerX) / 10, 40);
            rotateX += clamp(-(mouseY - centerY) / 10, 40);
          }
          if (distance < 170) {
            const force = (1 - distance / 170) * 30;
            moveX = dx / distance * force;
            moveY = dy / distance * force;
          }

          icon.style.setProperty("--rx", `${rotateX.toFixed(1)}deg`);
          icon.style.setProperty("--ry", `${rotateY.toFixed(1)}deg`);
          icon.style.setProperty("--px", `${moveX.toFixed(1)}px`);
          icon.style.setProperty("--py", `${moveY.toFixed(1)}px`);
        });
      });
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();
