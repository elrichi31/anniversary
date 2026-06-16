"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function CountdownScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 12.2);

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
        colorA: { value: new THREE.Color("#0b1020") },
        colorB: { value: new THREE.Color("#22152b") },
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
    const pointLight = new THREE.PointLight("#8fb6ff", 10, 28, 2);
    pointLight.position.set(0, 0, 5.5);
    scene.add(ambient, pointLight);

    const bars: THREE.Mesh[] = [];
    const barGeometry = new THREE.BoxGeometry(0.28, 2.3, 0.28);

    for (let index = 0; index < 14; index += 1) {
      const material = new THREE.MeshPhysicalMaterial({
        color: index % 2 === 0 ? "#a7bfff" : "#ffd2a2",
        transparent: true,
        opacity: 0.22,
        roughness: 0.14,
        metalness: 0.08,
        clearcoat: 1,
      });
      const bar = new THREE.Mesh(barGeometry, material);
      const angle = (index / 14) * Math.PI * 2;
      const radius = 3.8 + (index % 3) * 0.45;
      bar.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 1.8,
        Math.sin(angle) * radius * 0.65,
      );
      bar.rotation.z = angle * 0.5;
      bar.userData = {
        angle,
        radius,
        speed: 0.1 + index * 0.01,
      };
      bars.push(bar);
      scene.add(bar);
    }

    const sparkGeometry = new THREE.BufferGeometry();
    const sparkCount = 160;
    const sparkPositions = new Float32Array(sparkCount * 3);

    for (let index = 0; index < sparkCount; index += 1) {
      const i = index * 3;
      sparkPositions[i] = (Math.random() - 0.5) * 14;
      sparkPositions[i + 1] = (Math.random() - 0.5) * 8;
      sparkPositions[i + 2] = (Math.random() - 0.5) * 8;
    }

    sparkGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(sparkPositions, 3),
    );

    const sparkMaterial = new THREE.PointsMaterial({
      color: "#f8f4ff",
      size: 0.07,
      transparent: true,
      opacity: 0.72,
      sizeAttenuation: true,
    });
    const sparks = new THREE.Points(sparkGeometry, sparkMaterial);
    scene.add(sparks);

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

      bars.forEach((bar, index) => {
        const angle = bar.userData.angle + elapsed * bar.userData.speed;
        bar.position.x = Math.cos(angle) * bar.userData.radius;
        bar.position.z = Math.sin(angle) * bar.userData.radius * 0.65;
        bar.position.y = Math.sin(elapsed * 0.9 + index) * 0.8;
        bar.rotation.x += 0.004;
        bar.rotation.y += 0.006;
      });

      sparks.rotation.y = elapsed * 0.03;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(renderLoop);
    };

    frameId = window.requestAnimationFrame(renderLoop);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      backgroundGeometry.dispose();
      backgroundMaterial.dispose();
      barGeometry.dispose();
      bars.forEach((bar) => {
        (bar.material as THREE.Material).dispose();
      });
      sparkGeometry.dispose();
      sparkMaterial.dispose();
      renderer.dispose();

      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="section-scene" aria-hidden="true" />;
}
