'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

const letterPatterns: { [key: string]: number[][] } = {
    'C': [
        [0,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,0,0,0,1],
        [0,1,1,1,0]
    ],
    'R': [
        [1,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,0],
        [1,0,1,0,0],
        [1,0,0,1,0],
    ],
    'Y': [
        [1,0,0,0,1],
        [1,0,0,0,1],
        [0,1,0,1,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
    ],
    'P': [
        [1,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
    ],
    'T': [
        [1,1,1,1,1],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
    ],
    'O': [
        [0,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [0,1,1,1,0]
    ],
    'Q': [
        [0,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,1,0,1],
        [1,0,0,1,0],
        [0,1,1,1,1]
    ],
    'U': [
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [0,1,1,1,0]
    ],
    'E': [
        [1,1,1,1,1],
        [1,0,0,0,0],
        [1,1,1,1,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,1,1,1,1]
    ],
    'S': [
        [0,1,1,1,1],
        [1,0,0,0,0],
        [0,1,1,1,0],
        [0,0,0,0,1],
        [0,0,0,0,1],
        [1,1,1,1,0]
    ],
};

const VoxelText = ({ text }: { text: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    
    const materials = useMemo(() => [
        new THREE.MeshPhongMaterial({ color: 0x00BFFF }), // right
        new THREE.MeshPhongMaterial({ color: 0x4682B4 }), // left
        new THREE.MeshPhongMaterial({ color: 0x87CEEB }), // top
        new THREE.MeshPhongMaterial({ color: 0x4169E1 }), // bottom
        new THREE.MeshPhongMaterial({ color: 0x00BFFF }), // front
        new THREE.MeshPhongMaterial({ color: 0x4682B4 }), // back
    ], []);

    useEffect(() => {
        if (!containerRef.current || typeof window === 'undefined') return;

        const container = containerRef.current;
        const scene = new THREE.Scene();
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        const containerHeight = 80;
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / containerHeight, 0.1, 1000);
        
        renderer.setSize(container.clientWidth, containerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const voxelSize = 0.5;
        const letterSpacing = 0.6;
        const depthLayers = 3;

        function createVoxelLetter(pattern: number[][]) {
            const group = new THREE.Group();
            const patternHeight = pattern.length;
            const yOffset = patternHeight * voxelSize / 2;

            for (let z = 0; z < depthLayers; z++) {
                for (let y = 0; y < patternHeight; y++) {
                    const row = pattern[y];
                    for (let x = 0; x < row.length; x++) {
                        if (row[x] === 1) {
                            const geometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
                            const cube = new THREE.Mesh(geometry, materials);
                            cube.position.set(x * voxelSize, (patternHeight - y) * voxelSize - yOffset, -z * voxelSize);
                            group.add(cube);
                        }
                    }
                }
            }
            return group;
        }

        const textGroup = new THREE.Group();
        let currentX = 0;

        const letterData = text.toUpperCase().split('').map(char => {
            const pattern = letterPatterns[char];
            if (!pattern) return null;
            const width = (pattern[0]?.length || 0) * voxelSize;
            return { pattern, width };
        }).filter(item => item !== null) as { pattern: number[][], width: number }[];


        let totalWidth = 0;
        letterData.forEach(data => {
            totalWidth += data.width;
        });
        totalWidth += (letterData.length - 1) * letterSpacing;

        currentX = -totalWidth / 2;

        letterData.forEach(({ pattern, width }) => {
            const letterGroup = createVoxelLetter(pattern);
            letterGroup.position.x = currentX + width / 2;
            textGroup.add(letterGroup);
            currentX += width + letterSpacing;
        });

        scene.add(textGroup);
        textGroup.rotation.set(0, 0, 0); 
        
        camera.position.set(0, 0, 12);
        camera.lookAt(scene.position);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        renderer.render(scene, camera);

        const handleResize = () => {
            if (!containerRef.current || !renderer || !camera) return;
            const width = containerRef.current.clientWidth;
            camera.aspect = width / containerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(width, containerHeight);
            renderer.render(scene, camera);
        };

        window.addEventListener('resize', handleResize);

        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            // Re-render if needed for dynamic scenes, but we are static
             // renderer.render(scene, camera);
        };
        // animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);

            if (renderer && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            
            scene.traverse(object => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else if (object.material instanceof THREE.Material) {
                        object.material.dispose();
                    }
                }
            });
            renderer.dispose();
        };
    }, [text, materials]);

    return (
        <div ref={containerRef} className="w-full h-[80px] flex items-center justify-center" />
    );
};

export default VoxelText;
