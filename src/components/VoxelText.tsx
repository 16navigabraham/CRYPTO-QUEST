'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

const letterPatterns: { [key: string]: number[][] } = {
    'C': [
        [0,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,0],
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
        [1,0,0,0,1]
    ],
    'Y': [
        [1,0,0,0,1],
        [1,0,0,0,1],
        [0,1,0,1,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0]
    ],
    'P': [
        [1,1,1,1,0],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,1,1,1,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,0,0,0,0]
    ],
    'T': [
        [1,1,1,1,1],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0]
    ],
    'O': [
        [0,1,1,1,0],
        [1,0,0,0,1],
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
        [1,0,0,0,1],
        [0,1,1,1,0]
    ],
    'E': [
        [1,1,1,1,1],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,1,1,1,0],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [1,1,1,1,1]
    ],
    'S': [
        [0,1,1,1,1],
        [1,0,0,0,0],
        [1,0,0,0,0],
        [0,1,1,1,0],
        [0,0,0,0,1],
        [0,0,0,0,1],
        [1,1,1,1,0]
    ],
};

const VoxelText = ({ text }: { text: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

    const materials = useMemo(() => [
        new THREE.MeshPhongMaterial({ color: 0x00BFFF }), // right - deep sky blue
        new THREE.MeshPhongMaterial({ color: 0x4682B4 }), // left - steel blue
        new THREE.MeshPhongMaterial({ color: 0x87CEEB }), // top - sky blue
        new THREE.MeshPhongMaterial({ color: 0x4169E1 }), // bottom - royal blue
        new THREE.MeshPhongMaterial({ color: 0x00BFFF }), // front
        new THREE.MeshPhongMaterial({ color: 0x4682B4 }), // back
    ], []);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        let scene: THREE.Scene | null = new THREE.Scene();

        // Camera setup
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / 50, 0.1, 1000);
        
        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, 50); // Fixed height
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const voxelSize = 0.8;
        const letterWidth = 5 * voxelSize;
        const letterGap = 1.5 * voxelSize;
        const totalTextWidth = (text.length * letterWidth) + ((text.length - 1) * letterGap);
        const startX = -totalTextWidth / 2;

        camera.position.set(totalTextWidth / 2.5, 4, 15);
        camera.lookAt(totalTextWidth / 2.5, 0, 0);
        
        // Function to create voxel letter
        function createVoxelLetter(pattern: number[][]) {
            const group = new THREE.Group();
            const depthLayers = 4;
            const voxelGap = 1;

            for (let z = 0; z < depthLayers; z++) {
                for (let y = 0; y < pattern.length; y++) {
                    for (let x = 0; x < pattern[y].length; x++) {
                        if (pattern[y][x] === 1) {
                            const geometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
                            const cube = new THREE.Mesh(geometry, materials);
                            cube.position.x = x * voxelGap;
                            cube.position.y = (pattern.length - y) * voxelGap - (pattern.length * voxelGap / 2) + 2;
                            cube.position.z = -z * voxelGap;
                            group.add(cube);
                        }
                    }
                }
            }
            return group;
        }

        const textGroup = new THREE.Group();
        let currentX = startX;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i].toUpperCase();
            const pattern = letterPatterns[char];
            if (pattern) {
                const letterGroup = createVoxelLetter(pattern);
                letterGroup.position.x = currentX;
                textGroup.add(letterGroup);
                currentX += (pattern[0].length * voxelSize) + letterGap;
            }
        }
        
        // Static rotation for a good 3D view
        textGroup.rotation.y = -0.3;
        textGroup.rotation.x = -0.1;
        
        scene.add(textGroup);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight1.position.set(5, 10, 7);
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0x00BFFF, 0.4);
        directionalLight2.position.set(-5, 5, -5);
        scene.add(directionalLight2);
        
        // Initial render
        renderer.render(scene, camera);

        // Handle resize
        const handleResize = () => {
            if (!containerRef.current || !scene || !rendererRef.current) return;
            const width = containerRef.current.clientWidth;
            camera.aspect = width / 50;
            camera.updateProjectionMatrix();
            rendererRef.current.setSize(width, 50);
            rendererRef.current.render(scene, camera); // Re-render on resize
        };
        
        window.addEventListener('resize', handleResize);
        
        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            
            if (rendererRef.current && container.contains(rendererRef.current.domElement)) {
                container.removeChild(rendererRef.current.domElement);
            }
            
            if (scene) {
                scene.traverse((object) => {
                    if (object instanceof THREE.Mesh) {
                        object.geometry.dispose();
                        if (Array.isArray(object.material)) {
                            object.material.forEach(material => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                });
            }
            renderer.dispose();
            scene = null;
        };
    }, [text, materials]);

    return (
        <div ref={containerRef} className="w-[300px] h-[50px]" />
    );
};

export default VoxelText;
