
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
        new THREE.MeshPhongMaterial({ color: 0x00BFFF }), // right - deep sky blue
        new THREE.MeshPhongMaterial({ color: 0x4682B4 }), // left - steel blue
        new THREE.MeshPhongMaterial({ color: 0x87CEEB }), // top - sky blue
        new THREE.MeshPhongMaterial({ color: 0x4169E1 }), // bottom - royal blue
        new THREE.MeshPhongMaterial({ color: 0x00BFFF }), // front
        new THREE.MeshPhongMaterial({ color: 0x4682B4 }), // back
    ], []);

    useEffect(() => {
        if (!containerRef.current || typeof window === 'undefined') return;

        const container = containerRef.current;
        let scene: THREE.Scene | null = new THREE.Scene();
        let renderer: THREE.WebGLRenderer | null = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
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

        const letters = text.toUpperCase().split('');
        const letterData = letters.map(char => {
             const pattern = letterPatterns[char];
             if (!pattern) return null;
             const width = (pattern[0]?.length || 0) * voxelSize;
             return { char, pattern, width };
        }).filter(Boolean) as { char: string, pattern: number[][], width: number }[];

        let totalWidth = 0;
        letterData.forEach(data => {
            totalWidth += data.width + letterSpacing;
        });
        totalWidth -= letterSpacing;

        let startOffset = -totalWidth / 2;
        currentX = startOffset;

        letterData.forEach(({ pattern, width }) => {
            const letterGroup = createVoxelLetter(pattern);
            letterGroup.position.x = currentX + width / 2;
            textGroup.add(letterGroup);
            currentX += width + letterSpacing;
        });

        textGroup.rotation.set(-0.1, -0.25, 0); 
        scene.add(textGroup);

        camera.position.set(0, 2, 12);
        camera.lookAt(0, 0, 0);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        renderer.render(scene, camera);

        const handleResize = () => {
            if (!containerRef.current || !renderer || !scene || !camera) return;
            const width = containerRef.current.clientWidth;
            camera.aspect = width / containerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(width, containerHeight);
            renderer.render(scene, camera);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);

            if (renderer && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            
            scene?.traverse(object => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else if (object.material instanceof THREE.Material) {
                        object.material.dispose();
                    }
                }
            });
            renderer?.dispose();
            scene = null;
            renderer = null;
        };
    }, [text, materials]);

    return (
        <div ref={containerRef} className="w-full h-[80px] flex items-center justify-center" />
    );
};

export default VoxelText;
