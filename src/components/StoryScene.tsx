"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { MemoryItem } from "@/data/memories";

type TogetherParts = {
  years: string;
  months: string;
  days: string;
  hours: string;
};

type StorySceneProps = {
  items: MemoryItem[];
  letterParagraphs: string[];
  signature: string;
  countdown: TogetherParts;
};

type SceneCard = {
  group: THREE.Group;
};

type CountdownTileTexture = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  label: string;
};

const SECTION_GAP = 11.75;

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - safeRadius,
    y + height,
  );
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(nextLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      return;
    }

    currentLine = nextLine;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function createLabelTexture(item: MemoryItem) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 144;

  const context = canvas.getContext("2d");
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  context.fillStyle = "#fef8f1";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(16, 12, 22, 0.72)";
  context.font = "500 34px Georgia";
  context.fillText(item.caption, 32, 58);
  context.font = "600 18px Avenir Next, Arial";
  context.fillStyle = "rgba(16, 12, 22, 0.42)";
  context.fillText(item.date.toUpperCase(), 32, 104);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createPhotoTexture(item: MemoryItem) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 900;

  const context = canvas.getContext("2d");
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, item.tone);
  gradient.addColorStop(1, "#120d18");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(255, 255, 255, 0.18)";
  context.fillRect(42, 42, canvas.width - 84, canvas.height - 84);
  context.strokeStyle = "rgba(255,255,255,0.28)";
  context.lineWidth = 2;
  context.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);

  context.fillStyle = "#fff8ef";
  context.font = "600 28px Avenir Next, Arial";
  context.fillText(item.date, 68, 110);
  context.font = "500 58px Georgia";
  context.fillText(item.caption, 68, canvas.height - 120);
  context.font = "400 22px Avenir Next, Arial";
  context.fillStyle = "rgba(255,248,239,0.84)";
  context.fillText("Pon aqui su foto real", 68, canvas.height - 76);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createLetterTexture(paragraphs: string[], signature: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1500;

  const context = canvas.getContext("2d");
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  const background = context.createLinearGradient(0, 0, 0, canvas.height);
  background.addColorStop(0, "#fff8ef");
  background.addColorStop(1, "#ead9c6");
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(146, 91, 54, 0.06)";
  for (let line = 0; line < 14; line += 1) {
    context.fillRect(110, 250 + line * 78, canvas.width - 220, 2);
  }

  context.strokeStyle = "rgba(103, 73, 53, 0.16)";
  context.lineWidth = 5;
  context.strokeRect(54, 54, canvas.width - 108, canvas.height - 108);

  context.fillStyle = "#8f5a39";
  context.font = "600 28px Avenir Next, Arial";
  context.fillText("PARA ELLA", 110, 134);

  context.fillStyle = "#39271b";
  context.font = "500 106px Georgia";
  context.fillText("Tu carta bonita.", 110, 244);

  context.font = "400 40px Georgia";
  const maxWidth = canvas.width - 220;
  let cursorY = 350;

  paragraphs.forEach((paragraph) => {
    const lines = wrapText(context, paragraph, maxWidth);
    lines.forEach((line) => {
      context.fillText(line, 110, cursorY);
      cursorY += 58;
    });
    cursorY += 48;
  });

  context.fillStyle = "#8f5a39";
  context.font = "500 54px Georgia";
  context.fillText(signature, 110, canvas.height - 150);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createEnvelopeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 900;

  const context = canvas.getContext("2d");
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  const background = context.createLinearGradient(0, 0, 0, canvas.height);
  background.addColorStop(0, "#f7ead8");
  background.addColorStop(1, "#ead6bf");
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "rgba(128, 94, 69, 0.16)";
  context.lineWidth = 6;
  context.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

  context.strokeStyle = "rgba(128, 94, 69, 0.11)";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(86, 86);
  context.lineTo(canvas.width / 2, canvas.height / 2 + 56);
  context.lineTo(canvas.width - 86, 86);
  context.stroke();

  context.fillStyle = "rgba(125, 82, 52, 0.7)";
  context.font = "600 28px Avenir Next, Arial";
  context.fillText("PARA ELLA", 100, 118);
  context.fillStyle = "#4a3224";
  context.font = "500 84px Georgia";
  context.fillText("Toca para abrir", 100, 238);
  context.fillStyle = "rgba(74, 50, 36, 0.62)";
  context.font = "400 34px Georgia";
  context.fillText("Hay una carta guardada aqui dentro.", 100, 308);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createCountdownHeaderTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;

  const context = canvas.getContext("2d");
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "rgba(255, 191, 139, 0.15)");
  gradient.addColorStop(1, "rgba(147, 201, 255, 0.15)");

  drawRoundedRect(context, 12, 12, canvas.width - 24, canvas.height - 24, 62);
  context.fillStyle = gradient;
  context.fill();
  context.strokeStyle = "rgba(255, 241, 224, 0.18)";
  context.lineWidth = 2;
  context.stroke();

  context.fillStyle = "rgba(255, 225, 196, 0.78)";
  context.font = "600 28px Avenir Next, Arial";
  context.fillText("NUESTRO TIEMPO", 72, 86);
  context.fillStyle = "#fff8ef";
  context.font = "500 68px Georgia";
  context.fillText("Desde 18 . 12 . 2022", 72, 168);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createCountdownTileTexture(label: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;

  const context = canvas.getContext("2d");
  if (!context) {
    return {
      canvas,
      context: document.createElement("canvas").getContext("2d")!,
      texture: new THREE.CanvasTexture(canvas),
      label,
    };
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return {
    canvas,
    context,
    texture,
    label,
  };
}

function paintCountdownTile(tile: CountdownTileTexture, value: string) {
  const { canvas, context, texture, label } = tile;
  context.clearRect(0, 0, canvas.width, canvas.height);

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "rgba(255, 211, 167, 0.18)");
  gradient.addColorStop(1, "rgba(129, 165, 255, 0.12)");

  drawRoundedRect(context, 18, 18, canvas.width - 36, canvas.height - 36, 54);
  context.fillStyle = gradient;
  context.fill();
  context.strokeStyle = "rgba(255, 248, 239, 0.18)";
  context.lineWidth = 2;
  context.stroke();

  context.fillStyle = "rgba(255, 231, 206, 0.72)";
  context.font = "600 24px Avenir Next, Arial";
  context.fillText(label.toUpperCase(), 54, 88);

  context.fillStyle = "#fff8ef";
  context.font = "500 188px Georgia";
  context.textAlign = "center";
  context.fillText(value, canvas.width / 2, 292);
  context.textAlign = "start";

  context.fillStyle = "rgba(255, 248, 239, 0.58)";
  context.font = "500 22px Avenir Next, Arial";
  context.fillText("para su cumple mes", 54, 422);

  texture.needsUpdate = true;
}

export default function StoryScene({
  items,
  letterParagraphs,
  signature,
  countdown,
}: StorySceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const countdownUpdaterRef = useRef<((next: TogetherParts) => void) | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 120);
    camera.position.set(0, 0, 12.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const pointer = { x: 0, y: 0 };
    const pointerFollow = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const scrollState = {
      current: 0,
      target: 0,
      viewportHeight: window.innerHeight,
    };
    const layoutState = {
      isPhoneLike: false,
      letterScale: 0.84,
      countdownScale: 0.92,
      photoSpread: 1,
    };

    const textures: THREE.Texture[] = [];
    const photoCards: SceneCard[] = [];
    const floatingPapers: THREE.Mesh[] = [];
    const countdownBars: THREE.Mesh[] = [];
    const letterInteractionTargets: THREE.Object3D[] = [];
    const letterState = {
      current: 0,
      target: 0,
    };

    const backgroundGeometry = new THREE.SphereGeometry(38, 56, 56);
    backgroundGeometry.scale(-1, 1, 1);
    const backgroundMaterial = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        colorA: { value: new THREE.Color("#1a1121") },
        colorB: { value: new THREE.Color("#08050d") },
      },
      vertexShader: `
        varying vec3 vPosition;

        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 colorA;
        uniform vec3 colorB;
        varying vec3 vPosition;

        void main() {
          float mixValue = smoothstep(-24.0, 18.0, vPosition.y);
          gl_FragColor = vec4(mix(colorA, colorB, mixValue), 1.0);
        }
      `,
    });
    scene.add(new THREE.Mesh(backgroundGeometry, backgroundMaterial));

    const ambient = new THREE.AmbientLight("#ffffff", 1.2);
    const warmLight = new THREE.PointLight("#ffbc78", 12, 42, 2);
    warmLight.position.set(0, 0, 7);
    const roseLight = new THREE.PointLight("#f09ccd", 4.5, 34, 2);
    roseLight.position.set(5, -SECTION_GAP, 4);
    const coolLight = new THREE.PointLight("#8cb7ff", 4.2, 34, 2);
    coolLight.position.set(-4.5, -SECTION_GAP * 2, 5);
    scene.add(ambient, warmLight, roseLight, coolLight);

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 820;
    const starPositions = new Float32Array(starCount * 3);

    for (let index = 0; index < starCount; index += 1) {
      const i = index * 3;
      starPositions[i] = (Math.random() - 0.5) * 28;
      starPositions[i + 1] = -SECTION_GAP + (Math.random() - 0.5) * 52;
      starPositions[i + 2] = -4 - Math.random() * 18;
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3),
    );

    const starMaterial = new THREE.PointsMaterial({
      color: "#fff1dd",
      size: 0.075,
      transparent: true,
      opacity: 0.88,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const loader = new THREE.TextureLoader();
    const displayItems = items.slice(0, Math.min(items.length, 10));
    const laneHeights = [1.14, -1.08, 0.58, -0.52, 1.74, -1.68, 0, 1.34, -1.28, 0.96];
    const radiusXMap = [2.5, 3, 3.5, 2.8, 3.8, 3.2, 2.1, 4.1, 3.6, 2.9];
    const radiusZMap = [4.5, 5, 5.4, 4.8, 6, 5.3, 3.9, 6.3, 5.7, 4.4];
    const tiltMap = [0.14, -0.12, 0.06, -0.16, 0.1, -0.08, 0, 0.12, -0.1, 0.04];

    displayItems.forEach((item, index) => {
      const group = new THREE.Group();
      group.userData.baseY = laneHeights[index % laneHeights.length];
      group.userData.radiusX = radiusXMap[index % radiusXMap.length];
      group.userData.radiusZ = radiusZMap[index % radiusZMap.length];
      group.userData.speed = 0.14 + index * 0.012;
      group.userData.offset = (index / displayItems.length) * Math.PI * 2;
      group.userData.tilt = tiltMap[index % tiltMap.length];

      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(2.1, 2.7),
        new THREE.MeshBasicMaterial({
          color: item.tone,
          transparent: true,
          opacity: 0.14,
          side: THREE.DoubleSide,
        }),
      );
      glow.position.z = -0.08;
      group.add(glow);

      const shell = new THREE.Mesh(
        new THREE.PlaneGeometry(1.48, 1.98),
        new THREE.MeshPhysicalMaterial({
          color: "#fff6ee",
          roughness: 0.18,
          metalness: 0.02,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
        }),
      );
      group.add(shell);

      const photoTexture = createPhotoTexture(item);
      textures.push(photoTexture);
      const photoMaterial = new THREE.MeshBasicMaterial({ map: photoTexture });
      const photo = new THREE.Mesh(
        new THREE.PlaneGeometry(1.16, 1.24),
        photoMaterial,
      );
      photo.position.set(0, 0.16, 0.02);
      group.add(photo);

      const labelTexture = createLabelTexture(item);
      textures.push(labelTexture);
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(0.98, 0.26),
        new THREE.MeshBasicMaterial({
          map: labelTexture,
          transparent: true,
        }),
      );
      label.position.set(0, -0.62, 0.02);
      group.add(label);

      if (item.src) {
        loader.load(item.src, (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          textures.push(texture);
          photoMaterial.map = texture;
          photoMaterial.needsUpdate = true;
        });
      }

      scene.add(group);
      photoCards.push({ group });
    });

    const letterGroup = new THREE.Group();
    letterGroup.position.set(0, -SECTION_GAP, 0);
    scene.add(letterGroup);

    const letterAura = new THREE.Mesh(
      new THREE.PlaneGeometry(6.9, 8.9),
      new THREE.MeshBasicMaterial({
        color: "#ffcc9f",
        transparent: true,
        opacity: 0.06,
        side: THREE.DoubleSide,
      }),
    );
    letterAura.position.z = -0.3;
    letterGroup.add(letterAura);

    const letterTexture = createLetterTexture(letterParagraphs, signature);
    textures.push(letterTexture);
    const envelopeTexture = createEnvelopeTexture();
    textures.push(envelopeTexture);

    const paperGroup = new THREE.Group();
    letterGroup.add(paperGroup);

    const letterBack = new THREE.Mesh(
      new THREE.PlaneGeometry(4.9, 6.45),
      new THREE.MeshPhysicalMaterial({
        color: "#ead8c4",
        roughness: 0.55,
        metalness: 0.01,
        clearcoat: 0.4,
        transparent: true,
        opacity: 0,
      }),
    );
    letterBack.position.z = -0.03;
    paperGroup.add(letterBack);

    const letterFront = new THREE.Mesh(
      new THREE.PlaneGeometry(4.62, 6.08),
      new THREE.MeshBasicMaterial({
        map: letterTexture,
        transparent: true,
        opacity: 0,
      }),
    );
    letterFront.position.z = 0.04;
    paperGroup.add(letterFront);

    const envelopeGroup = new THREE.Group();
    envelopeGroup.position.set(0, -1.05, 0.24);
    letterGroup.add(envelopeGroup);

    const envelopeShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(6.15, 4.3),
      new THREE.MeshBasicMaterial({
        color: "#291d22",
        transparent: true,
        opacity: 0.26,
      }),
    );
    envelopeShadow.position.set(0.06, -0.08, -0.18);
    envelopeGroup.add(envelopeShadow);

    const envelopeCard = new THREE.Mesh(
      new THREE.PlaneGeometry(5.48, 3.74),
      new THREE.MeshPhysicalMaterial({
        color: "#f4e5d2",
        roughness: 0.42,
        metalness: 0.02,
        clearcoat: 0.5,
        transparent: true,
        opacity: 1,
      }),
    );
    envelopeCard.position.z = 0.05;
    envelopeGroup.add(envelopeCard);

    const envelopeFront = new THREE.Mesh(
      new THREE.PlaneGeometry(5.22, 3.48),
      new THREE.MeshBasicMaterial({
        map: envelopeTexture,
        transparent: true,
      }),
    );
    envelopeFront.position.z = 0.08;
    envelopeGroup.add(envelopeFront);

    const seal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.34, 0.08, 42),
      new THREE.MeshPhysicalMaterial({
        color: "#c26752",
        roughness: 0.24,
        metalness: 0.08,
        clearcoat: 0.9,
      }),
    );
    seal.position.set(1.68, -0.56, 0.18);
    seal.rotation.x = Math.PI / 2;
    envelopeGroup.add(seal);

    letterInteractionTargets.push(envelopeFront, envelopeCard, seal, letterFront);

    const paperGeometry = new THREE.PlaneGeometry(1.24, 1.62);
    for (let index = 0; index < 18; index += 1) {
      let baseX = (Math.random() - 0.5) * 10;
      let baseY = -SECTION_GAP + (Math.random() - 0.5) * 4.5;

      // Keep the center of the letter scene clear so floating scraps never cover the card.
      while (Math.abs(baseX) < 3 && Math.abs(baseY + SECTION_GAP) < 3.4) {
        baseX = (Math.random() - 0.5) * 10;
        baseY = -SECTION_GAP + (Math.random() - 0.5) * 4.5;
      }

      const paper = new THREE.Mesh(
        paperGeometry,
        new THREE.MeshPhysicalMaterial({
          color: index % 3 === 0 ? "#fff8ef" : "#f6e5d4",
          transparent: true,
          opacity: 0.18,
          roughness: 0.55,
          metalness: 0.02,
        }),
      );
      paper.position.set(
        baseX,
        baseY,
        -1.5 + Math.random() * 4,
      );
      paper.rotation.z = (Math.random() - 0.5) * 1.2;
      paper.rotation.x = (Math.random() - 0.5) * 0.5;
      paper.userData = {
        baseX: paper.position.x,
        baseY: paper.position.y,
        speed: 0.18 + Math.random() * 0.22,
        offset: Math.random() * Math.PI * 2,
        drift: 0.18 + Math.random() * 0.2,
      };
      floatingPapers.push(paper);
      scene.add(paper);
    }

    const countdownGroup = new THREE.Group();
    countdownGroup.position.set(0, -SECTION_GAP * 2, 0);
    scene.add(countdownGroup);

    const countdownHeaderTexture = createCountdownHeaderTexture();
    textures.push(countdownHeaderTexture);
    const countdownHeader = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 1.4),
      new THREE.MeshBasicMaterial({
        map: countdownHeaderTexture,
        transparent: true,
      }),
    );
    countdownHeader.position.set(0, 2.95, 0.15);
    countdownGroup.add(countdownHeader);

    const tileDefinitions = [
      { key: "years", label: "Años", position: new THREE.Vector3(-1.72, 0.86, 0) },
      { key: "months", label: "Meses", position: new THREE.Vector3(1.72, 0.86, 0) },
      { key: "days", label: "Dias", position: new THREE.Vector3(-1.72, -1.36, 0) },
      { key: "hours", label: "Horas", position: new THREE.Vector3(1.72, -1.36, 0) },
    ] as const;

    const countdownTiles = tileDefinitions.map((definition) => {
      const shell = new THREE.Mesh(
        new THREE.BoxGeometry(2.18, 2.18, 0.34),
        new THREE.MeshPhysicalMaterial({
          color: "#181120",
          roughness: 0.22,
          metalness: 0.06,
          clearcoat: 1,
          clearcoatRoughness: 0.18,
          transparent: true,
          opacity: 0.96,
        }),
      );
      shell.position.copy(definition.position);
      countdownGroup.add(shell);

      const tileTexture = createCountdownTileTexture(definition.label);
      textures.push(tileTexture.texture);
      const face = new THREE.Mesh(
        new THREE.PlaneGeometry(1.82, 1.82),
        new THREE.MeshBasicMaterial({
          map: tileTexture.texture,
          transparent: true,
        }),
      );
      face.position.copy(definition.position);
      face.position.z = 0.22;
      countdownGroup.add(face);

      return {
        key: definition.key,
        basePosition: definition.position.clone(),
        shell,
        face,
        texture: tileTexture,
      };
    });

    const barGeometry = new THREE.BoxGeometry(0.24, 2.2, 0.24);
    for (let index = 0; index < 14; index += 1) {
      const angle = (index / 14) * Math.PI * 2;
      const radius = 4.1 + (index % 3) * 0.42;
      const bar = new THREE.Mesh(
        barGeometry,
        new THREE.MeshPhysicalMaterial({
          color: index % 2 === 0 ? "#a7bfff" : "#ffd2a2",
          transparent: true,
          opacity: 0.2,
          roughness: 0.14,
          metalness: 0.08,
          clearcoat: 1,
        }),
      );
      bar.position.set(
        Math.cos(angle) * radius,
        -SECTION_GAP * 2 + (Math.random() - 0.5) * 1.6,
        Math.sin(angle) * radius * 0.74,
      );
      bar.rotation.z = angle * 0.5;
      bar.userData = {
        angle,
        baseY: bar.position.y,
        radius,
        speed: 0.1 + index * 0.01,
      };
      countdownBars.push(bar);
      scene.add(bar);
    }

    countdownUpdaterRef.current = (nextCountdown) => {
      countdownTiles.forEach((tile) => {
        const value = nextCountdown[tile.key];
        paintCountdownTile(tile.texture, value);
      });
    };
    countdownUpdaterRef.current(countdown);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      scrollState.viewportHeight = window.innerHeight;
      const isPhoneLike = width < 760;
      layoutState.isPhoneLike = isPhoneLike;

      camera.aspect = width / height;
      camera.position.z = width / height > 1 ? 12.8 : 15.4;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);

      layoutState.letterScale = isPhoneLike ? 0.5 : 0.84;
      layoutState.countdownScale = isPhoneLike ? 0.56 : 0.92;
      layoutState.photoSpread = isPhoneLike ? 0.88 : 1;

      letterGroup.scale.setScalar(layoutState.letterScale);
      letterGroup.position.x = isPhoneLike ? 0 : 0;
      countdownGroup.scale.setScalar(layoutState.countdownScale);
      countdownHeader.scale.set(isPhoneLike ? 0.74 : 1, isPhoneLike ? 0.74 : 1, 1);
      countdownHeader.position.set(0, isPhoneLike ? 3.15 : 2.95, 0.15);

      countdownTiles.forEach((tile, index) => {
        const mobilePositions = [
          new THREE.Vector3(-1.18, 1.02, 0),
          new THREE.Vector3(1.18, 1.02, 0),
          new THREE.Vector3(-1.18, -1.42, 0),
          new THREE.Vector3(1.18, -1.42, 0),
        ];
        const nextPosition = isPhoneLike
          ? mobilePositions[index]
          : tile.basePosition;

        tile.shell.position.copy(nextPosition);
        tile.face.position.copy(nextPosition);
        tile.face.position.z = 0.22;
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const onPointerDown = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(letterInteractionTargets, false);

      if (hits.length > 0) {
        letterState.target = letterState.target > 0.5 ? 0 : 1;
      }
    };

    const onScroll = () => {
      scrollState.target =
        -(window.scrollY / Math.max(scrollState.viewportHeight, 1)) * SECTION_GAP;
    };

    resize();
    onScroll();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerdown", onPointerDown);

    let frameId = 0;
    const startTime = performance.now();

    const renderLoop = () => {
      const elapsed = (performance.now() - startTime) / 1000;

      scrollState.current += (scrollState.target - scrollState.current) * 0.08;
      camera.position.y += (scrollState.current - camera.position.y) * 0.08;
      pointerFollow.x += (pointer.x - pointerFollow.x) * 0.05;
      pointerFollow.y += (pointer.y - pointerFollow.y) * 0.05;
      camera.position.x += (0 - camera.position.x) * 0.08;
      camera.rotation.z += (0 - camera.rotation.z) * 0.08;
      camera.rotation.x += (0 - camera.rotation.x) * 0.08;

      const targetPositions = photoCards.map((card, index) => {
        const angle =
          elapsed * card.group.userData.speed + card.group.userData.offset;

        return new THREE.Vector3(
          Math.cos(angle) * card.group.userData.radiusX * layoutState.photoSpread,
          card.group.userData.baseY +
            Math.sin(elapsed * 1.1 + index * 0.7) * 0.18,
          Math.sin(angle) * card.group.userData.radiusZ * layoutState.photoSpread,
        );
      });

      for (let i = 0; i < targetPositions.length; i += 1) {
        for (let j = i + 1; j < targetPositions.length; j += 1) {
          const delta = targetPositions[i].clone().sub(targetPositions[j]);
          const distance = delta.length();
          const minimumDistance = 1.52;

          if (distance < minimumDistance) {
            const safeDelta =
              distance < 0.001
                ? new THREE.Vector3(0.2, 0.1, 0)
                : delta.normalize();
            const push = (minimumDistance - distance) * 0.5;
            targetPositions[i].addScaledVector(safeDelta, push);
            targetPositions[j].addScaledVector(safeDelta, -push);
          }
        }
      }

      photoCards.forEach((card, index) => {
        const targetPosition = targetPositions[index];
        card.group.position.lerp(targetPosition, 0.1);
        card.group.rotation.y +=
          (card.group.userData.tilt + pointerFollow.x * 0.08 - card.group.rotation.y) *
          0.08;
        card.group.rotation.x +=
          (pointerFollow.y * 0.035 - card.group.rotation.x) * 0.08;
      });

      letterState.current += (letterState.target - letterState.current) * 0.08;
      const letterOpen = THREE.MathUtils.smoothstep(letterState.current, 0, 1);
      letterGroup.rotation.z =
        Math.sin(elapsed * 0.28) * 0.02 + pointerFollow.x * 0.025;
      letterGroup.rotation.x =
        -0.035 + Math.sin(elapsed * 0.36) * 0.01 + pointerFollow.y * 0.012;
      letterGroup.position.x =
        Math.sin(elapsed * 0.22) * (layoutState.isPhoneLike ? 0.08 : 0.16) +
        pointerFollow.x * (layoutState.isPhoneLike ? 0.08 : 0.18);
      letterAura.scale.setScalar(1 + Math.sin(elapsed * 0.8) * 0.02 + letterOpen * 0.03);
      (letterAura.material as THREE.MeshBasicMaterial).opacity =
        0.05 + letterOpen * 0.05;

      paperGroup.visible = letterOpen > 0.05;
      paperGroup.position.y = THREE.MathUtils.lerp(-0.96, 0.18, letterOpen);
      paperGroup.position.z = THREE.MathUtils.lerp(-0.2, 0.02, letterOpen);
      paperGroup.scale.setScalar(THREE.MathUtils.lerp(0.2, 1, letterOpen));
      paperGroup.rotation.x = THREE.MathUtils.lerp(-0.16, 0, letterOpen);
      paperGroup.rotation.z = THREE.MathUtils.lerp(0.02, 0, letterOpen);
      (letterFront.material as THREE.MeshBasicMaterial).opacity =
        THREE.MathUtils.smoothstep(letterOpen, 0.08, 0.28);
      (letterBack.material as THREE.MeshPhysicalMaterial).opacity =
        THREE.MathUtils.smoothstep(letterOpen, 0.08, 0.28);

      envelopeGroup.visible = letterOpen < 0.985;
      envelopeGroup.position.y = THREE.MathUtils.lerp(-1.05, -2.2, letterOpen);
      envelopeGroup.position.z = THREE.MathUtils.lerp(0.24, -1.1, letterOpen);
      envelopeGroup.rotation.x = THREE.MathUtils.lerp(0, -0.58, letterOpen);
      envelopeGroup.rotation.z = THREE.MathUtils.lerp(0, -0.02, letterOpen);
      envelopeGroup.scale.setScalar(THREE.MathUtils.lerp(1, 0.9, letterOpen));
      (envelopeShadow.material as THREE.MeshBasicMaterial).opacity =
        THREE.MathUtils.lerp(0.26, 0, letterOpen);
      (envelopeFront.material as THREE.MeshBasicMaterial).opacity =
        THREE.MathUtils.lerp(1, 0, letterOpen);
      (envelopeFront.material as THREE.MeshBasicMaterial).transparent = true;
      (envelopeCard.material as THREE.MeshPhysicalMaterial).opacity =
        THREE.MathUtils.lerp(1, 0, letterOpen);
      (envelopeCard.material as THREE.MeshPhysicalMaterial).transparent = true;
      seal.scale.setScalar(THREE.MathUtils.lerp(1, 0.5, letterOpen));
      seal.position.z = THREE.MathUtils.lerp(0.18, -0.08, letterOpen);

      floatingPapers.forEach((paper, index) => {
        const distanceFromLetter = Math.abs(paper.userData.baseY + SECTION_GAP);
        paper.position.x =
          paper.userData.baseX +
          Math.sin(elapsed * paper.userData.speed + paper.userData.offset) * 0.35;
        paper.position.y =
          paper.userData.baseY +
          Math.cos(elapsed * paper.userData.drift + index) * 0.22;
        paper.rotation.z += 0.0015 + index * 0.00005;
        const isTooCloseToCard =
          Math.abs(paper.position.x) < 3.2 &&
          Math.abs(paper.position.y + SECTION_GAP) < 3.6;
        (paper.material as THREE.MeshPhysicalMaterial).opacity = isTooCloseToCard
          ? 0
          : distanceFromLetter < 2.4
            ? 0.03
            : 0.12;
      });

      countdownHeader.position.x = Math.sin(elapsed * 0.3) * 0.12;

      countdownTiles.forEach((tile, index) => {
        tile.shell.rotation.y =
          Math.sin(elapsed * 0.45 + index) * 0.1 + pointerFollow.x * 0.04;
        tile.shell.rotation.x =
          Math.cos(elapsed * 0.5 + index) * 0.03 + pointerFollow.y * 0.025;
        tile.face.rotation.copy(tile.shell.rotation);
      });

      countdownBars.forEach((bar, index) => {
        const angle = bar.userData.angle + elapsed * bar.userData.speed;
        bar.position.x = Math.cos(angle) * bar.userData.radius;
        bar.position.z = Math.sin(angle) * bar.userData.radius * 0.74;
        bar.position.y =
          bar.userData.baseY + Math.sin(elapsed * 0.9 + index) * 0.8;
        bar.rotation.x += 0.004;
        bar.rotation.y += 0.006;
      });

      stars.rotation.y = elapsed * 0.014;
      stars.rotation.x = Math.sin(elapsed * 0.1) * 0.03;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(renderLoop);
    };

    frameId = window.requestAnimationFrame(renderLoop);

    return () => {
      countdownUpdaterRef.current = null;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerdown", onPointerDown);

      textures.forEach((texture) => texture.dispose());
      backgroundGeometry.dispose();
      backgroundMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      paperGeometry.dispose();
      barGeometry.dispose();

      photoCards.forEach((card) => {
        card.group.children.forEach((child) => {
          const object = child as THREE.Mesh;
          object.geometry?.dispose();

          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material?.dispose();
          }
        });
      });

      [
        letterAura,
        letterBack,
        letterFront,
        envelopeShadow,
        envelopeCard,
        envelopeFront,
        seal,
        countdownHeader,
      ].forEach((mesh) => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => material.dispose());
        } else {
          mesh.material.dispose();
        }
      });

      floatingPapers.forEach((paper) => {
        paper.geometry.dispose();
        (paper.material as THREE.Material).dispose();
      });

      countdownTiles.forEach((tile) => {
        tile.shell.geometry.dispose();
        tile.face.geometry.dispose();
        (tile.shell.material as THREE.Material).dispose();
        (tile.face.material as THREE.Material).dispose();
      });

      countdownBars.forEach((bar) => {
        bar.geometry.dispose();
        (bar.material as THREE.Material).dispose();
      });

      renderer.dispose();

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [items, letterParagraphs, signature]);

  useEffect(() => {
    countdownUpdaterRef.current?.(countdown);
  }, [countdown]);

  return <div ref={mountRef} className="story-scene" />;
}
