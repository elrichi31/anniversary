"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { MemoryItem } from "@/data/memories";

type LoveSceneProps = {
  items: MemoryItem[];
};

type SceneCard = {
  group: THREE.Group;
};

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

export default function LoveScene({ items }: LoveSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<SceneCard[]>([]);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0, 13.4);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const textures: THREE.Texture[] = [];

    const backgroundGeometry = new THREE.SphereGeometry(18, 48, 48);
    backgroundGeometry.scale(-1, 1, 1);
    const backgroundMaterial = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        colorA: { value: new THREE.Color("#1b1324") },
        colorB: { value: new THREE.Color("#09060f") },
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
          float mixValue = smoothstep(-8.5, 8.5, vPosition.y);
          gl_FragColor = vec4(mix(colorA, colorB, mixValue), 1.0);
        }
      `,
    });
    scene.add(new THREE.Mesh(backgroundGeometry, backgroundMaterial));

    const ambient = new THREE.AmbientLight("#ffffff", 1.2);
    scene.add(ambient);

    const pointLight = new THREE.PointLight("#ffb46f", 12, 30, 2);
    pointLight.position.set(0, 0, 6);
    scene.add(pointLight);

    const fillLight = new THREE.PointLight("#dbe5ff", 4, 26, 2);
    fillLight.position.set(-5, 2.4, 4);
    scene.add(fillLight);

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 320;
    const starPositions = new Float32Array(starCount * 3);

    for (let index = 0; index < starCount; index += 1) {
      const i = index * 3;
      const radius = 7 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = radius * Math.cos(phi) * 0.72;
      starPositions[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(starPositions, 3),
    );

    const starsMaterial = new THREE.PointsMaterial({
      color: "#fff1dd",
      size: 0.08,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeometry, starsMaterial);
    scene.add(stars);

    const loader = new THREE.TextureLoader();
    const displayItems = items.slice(0, Math.min(items.length, 10));
    const laneHeights = [1.14, -1.08, 0.58, -0.52, 1.74, -1.68, 0, 1.34, -1.28, 0.96];
    const radiusXMap = [2.5, 3, 3.5, 2.8, 3.8, 3.2, 2.1, 4.1, 3.6, 2.9];
    const radiusZMap = [4.5, 5, 5.4, 4.8, 6, 5.3, 3.9, 6.3, 5.7, 4.4];
    const tiltMap = [0.14, -0.12, 0.06, -0.16, 0.1, -0.08, 0, 0.12, -0.1, 0.04];

    cardsRef.current = displayItems.map((item, index) => {
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

      const shellMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.48, 1.98),
        new THREE.MeshPhysicalMaterial({
          color: "#fff6ee",
          roughness: 0.18,
          metalness: 0.02,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
        }),
      );
      group.add(shellMesh);

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

      return { group };
    });

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      const aspect = width / height;

      camera.aspect = width / height;
      camera.position.z = aspect > 1 ? 13.8 : 11.8;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const pointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    resize();
    window.addEventListener("resize", resize);
    mount.addEventListener("pointermove", pointerMove);

    const startTime = performance.now();
    let frameId = 0;

    const renderLoop = () => {
      const elapsed = (performance.now() - startTime) / 1000;

      const targetPositions = cardsRef.current.map((card, index) => {
        const angle =
          elapsed * card.group.userData.speed + card.group.userData.offset;

        return new THREE.Vector3(
          Math.cos(angle) * card.group.userData.radiusX,
          card.group.userData.baseY +
            Math.sin(elapsed * 1.1 + index * 0.7) * 0.18,
          Math.sin(angle) * card.group.userData.radiusZ,
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

      cardsRef.current.forEach((card, index) => {
        const targetPosition = targetPositions[index];

        card.group.position.lerp(targetPosition, 0.1);
        card.group.rotation.y +=
          (card.group.userData.tilt + pointerRef.current.x * 0.08 - card.group.rotation.y) *
          0.08;
        card.group.rotation.x +=
          (pointerRef.current.y * 0.04 - card.group.rotation.x) * 0.08;
      });

      stars.rotation.y = elapsed * 0.025;
      stars.rotation.x = Math.sin(elapsed * 0.16) * 0.04;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(renderLoop);
    };

    frameId = window.requestAnimationFrame(renderLoop);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      mount.removeEventListener("pointermove", pointerMove);

      textures.forEach((texture) => texture.dispose());
      backgroundGeometry.dispose();
      backgroundMaterial.dispose();
      starGeometry.dispose();
      starsMaterial.dispose();

      cardsRef.current.forEach((card) => {
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

      renderer.dispose();

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [items]);

  return <div ref={mountRef} className="love-scene" aria-hidden="true" />;
}
