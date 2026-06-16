"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function LetterScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 11.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const backgroundGeometry = new THREE.SphereGeometry(18, 40, 40);
    backgroundGeometry.scale(-1, 1, 1);
    const backgroundMaterial = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        colorA: { value: new THREE.Color("#1b1020") },
        colorB: { value: new THREE.Color("#3f2330") },
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
          float mixValue = smoothstep(-8.0, 8.0, vPosition.y);
          gl_FragColor = vec4(mix(colorA, colorB, mixValue), 1.0);
        }
      `,
    });
    scene.add(new THREE.Mesh(backgroundGeometry, backgroundMaterial));

    const ambient = new THREE.AmbientLight("#ffffff", 1.1);
    const pointLight = new THREE.PointLight("#ffd7b0", 10, 28, 2);
    pointLight.position.set(0, 1.4, 5);
    scene.add(ambient, pointLight);

    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = 180;
    const dustPositions = new Float32Array(dustCount * 3);

    for (let index = 0; index < dustCount; index += 1) {
      const i = index * 3;
      dustPositions[i] = (Math.random() - 0.5) * 14;
      dustPositions[i + 1] = (Math.random() - 0.5) * 10;
      dustPositions[i + 2] = (Math.random() - 0.5) * 8;
    }

    dustGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(dustPositions, 3),
    );

    const dustMaterial = new THREE.PointsMaterial({
      color: "#fff0dd",
      size: 0.06,
      transparent: true,
      opacity: 0.68,
      sizeAttenuation: true,
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);

    const papers: THREE.Mesh[] = [];
    const paperGeometry = new THREE.PlaneGeometry(1.3, 1.7);

    for (let index = 0; index < 18; index += 1) {
      const material = new THREE.MeshPhysicalMaterial({
        color: index % 3 === 0 ? "#fff8ef" : "#f6e5d4",
        transparent: true,
        opacity: 0.18,
        roughness: 0.55,
        metalness: 0.02,
      });
      const paper = new THREE.Mesh(paperGeometry, material);
      paper.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
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
      papers.push(paper);
      scene.add(paper);
    }

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    resize();
    window.addEventListener("resize", resize);

    const startTime = performance.now();
    let frameId = 0;

    const renderLoop = () => {
      const elapsed = (performance.now() - startTime) / 1000;

      papers.forEach((paper, index) => {
        paper.position.x =
          paper.userData.baseX + Math.sin(elapsed * paper.userData.speed + paper.userData.offset) * 0.35;
        paper.position.y =
          paper.userData.baseY + Math.cos(elapsed * paper.userData.drift + index) * 0.22;
        paper.rotation.z += 0.0015 + index * 0.00005;
      });

      dust.rotation.y = elapsed * 0.025;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(renderLoop);
    };

    frameId = window.requestAnimationFrame(renderLoop);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      backgroundGeometry.dispose();
      backgroundMaterial.dispose();
      dustGeometry.dispose();
      dustMaterial.dispose();
      paperGeometry.dispose();
      papers.forEach((paper) => {
        (paper.material as THREE.Material).dispose();
      });
      renderer.dispose();

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="section-scene" aria-hidden="true" />;
}
