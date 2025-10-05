// main.js
// Requires GSAP, Barba, Three.js loaded via CDN (see index.html).
// Replace assets/hero.mp4, assets/... images with your real assets.

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP plugin
    gsap.registerPlugin(ScrollToPlugin);

    // set year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Simple mobile menu toggle
    const ham = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');
    ham && ham.addEventListener('click', () => {
        navList.classList.toggle('open');
        ham.classList.toggle('open');
    });

    // GSAP intro animations for initial load
    const intro = () => {
        const tl = gsap.timeline();
        tl.from('.brand-logo', { y: -10, opacity: 0, duration: 0.6, ease: 'power3.out' })
            .from('.brand-text', { x: -8, opacity: 0, duration: 0.5 }, '-=0.4')
            .from('.nav-link', { y: -8, opacity: 0, stagger: 0.08, duration: 0.45 }, '-=0.35')
            .from('.title', { y: 10, opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.2')
            .from('.subtitle', { y: 8, opacity: 0, duration: 0.6 }, '-=0.5')
            .from('.hero-actions .btn', { y: 8, opacity: 0, stagger: 0.08, duration: 0.5 }, '-=0.4')
            .from('.featured-card', { scale: 0.98, opacity: 0, stagger: 0.12, duration: 0.6 }, '-=0.7');
    };

    // Initialize Barba for smooth transitions
    barba.init({
        sync: true,
        transitions: [{
            name: 'fade',
            leave(data) {
                return gsap.to(data.current.container, { opacity: 0, duration: 0.45 });
            },
            enter(data) {
                window.scrollTo(0, 0);
                return gsap.from(data.next.container, { opacity: 0, duration: 0.45 }).then(() => {
                    intro();
                });
            }
        }],
        views: [{
            namespace: 'home',
            afterEnter(data) {
                onWindowResize();
            }
        }]
    });

    intro();

    /* -----------------------------
       Three.js simple scene
       ----------------------------- */
    let renderer, scene, camera, mesh, light;
    const canvas = document.getElementById('three-canvas');

    const initThree = () => {
        if (!canvas) return;
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.set(0, 0, 6);

        const geometry = new THREE.TorusKnotGeometry(0.9, 0.28, 150, 20);
        const material = new THREE.MeshStandardMaterial({
            color: 0x1565d8,
            emissive: 0x072144,
            metalness: 0.6,
            roughness: 0.2,
            envMapIntensity: 0.8,
            transparent: true,
            opacity: 0.95
        });

        mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(0.9, 0.9, 0.9);
        scene.add(mesh);

        light = new THREE.PointLight(0xa8c8ff, 1.2);
        light.position.set(4, 4, 6);
        scene.add(light);
        scene.add(new THREE.AmbientLight(0xffffff, 0.25));

        const particlesGeo = new THREE.BufferGeometry();
        const count = 200;
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
            pos[i] = (Math.random() - 0.5) * 12;
        }
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const particlesMat = new THREE.PointsMaterial({ size: 0.03, transparent: true, opacity: 0.45 });
        const points = new THREE.Points(particlesGeo, particlesMat);
        scene.add(points);

        gsap.from(mesh.rotation, { y: -1.2, x: -0.2, duration: 1.2, ease: 'power3.out' });
        gsap.from(mesh.scale, { x: 0.2, y: 0.2, z: 0.2, duration: 1.2, ease: 'back.out(1.4)' });
    };

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        if (mesh) {
            mesh.rotation.y += 0.004;
            mesh.rotation.x = Math.sin(t * 0.4) * 0.12;
            mesh.position.y = Math.sin(t * 0.6) * 0.06;
        }
        if (light) {
            light.position.x = Math.cos(t * 0.6) * 4;
            light.position.y = Math.sin(t * 0.4) * 3;
        }
        if (renderer && scene && camera) renderer.render(scene, camera);
    }

    function onWindowResize() {
        if (!canvas || !renderer) return;
        const width = canvas.clientWidth || window.innerWidth;
        const height = canvas.clientHeight || window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    initThree();
    animate();
    window.addEventListener('resize', onWindowResize);

    /* -----------------------------
       Smooth scrolling & event delegation
       ----------------------------- */
    document.addEventListener('click', (e) => {
        // Handle smooth scrolling for anchor links
        const a = e.target.closest('a');
        if (a && a.getAttribute('href')?.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                gsap.to(window, { scrollTo: { y: target.offsetTop - 70 }, duration: 0.8, ease: 'power2.inOut' });
            }
        }

        // Handle filter button active state for chart controls
        const btn = e.target.closest('.filter-btn');
        if (btn) {
            const group = btn.parentElement;
            group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
    }, false);
});