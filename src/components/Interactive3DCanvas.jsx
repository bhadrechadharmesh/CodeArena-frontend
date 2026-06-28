import React, { useEffect, useRef } from 'react';

export default function Interactive3DCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isOver: false });
  const scrollRef = useRef({ y: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Handle Resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Handle Mouse Move
    const handleMouseMove = (e) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = (e.clientY / window.innerHeight) * 2 - 1;
      mouseRef.current.pixelX = e.clientX;
      mouseRef.current.pixelY = e.clientY;
      mouseRef.current.isOver = true;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Handle Mouse Leave
    const handleMouseLeave = () => {
      mouseRef.current.isOver = false;
    };
    window.addEventListener('mouseleave', handleMouseLeave);

    // Handle Scroll
    const handleScroll = () => {
      scrollRef.current.targetY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);

    // Generate 3D Vertices
    const points = [];

    // 1. Generate Torus Knot vertices (p=3, q=7)
    const knotPointsCount = 120;
    const R = 120; // Major radius
    const r = 50;  // Minor radius
    for (let i = 0; i < knotPointsCount; i++) {
      const phi = (i * 2 * Math.PI) / knotPointsCount;
      const x = (R + r * Math.cos(7 * phi)) * Math.cos(3 * phi);
      const y = (R + r * Math.cos(7 * phi)) * Math.sin(3 * phi);
      const z = r * Math.sin(7 * phi);
      points.push({ x, y, z, baseX: x, baseY: y, baseZ: z, type: 'knot', index: i });
    }

    // 2. Generate Outer Geodesic Sphere vertices
    const numRings = 6;
    const pointsPerRing = 12;
    const sphereRadius = 220;
    for (let i = 0; i < numRings; i++) {
      const theta = (i * Math.PI) / (numRings - 1) - Math.PI / 2;
      const rCosTheta = sphereRadius * Math.cos(theta);
      const rSinTheta = sphereRadius * Math.sin(theta);

      for (let j = 0; j < pointsPerRing; j++) {
        const phi = (j * 2 * Math.PI) / pointsPerRing;
        points.push({
          x: rCosTheta * Math.cos(phi),
          y: rSinTheta,
          z: rCosTheta * Math.sin(phi),
          baseX: rCosTheta * Math.cos(phi),
          baseY: rSinTheta,
          baseZ: rCosTheta * Math.sin(phi),
          type: 'sphere',
          ringIndex: i,
          pointIndex: j,
        });
      }
    }

    // 3. Generate Orbiting Dust Particles
    const particles = [];
    const numParticles = 80;
    for (let i = 0; i < numParticles; i++) {
      const radius = 240 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      particles.push({
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta),
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.015 + 0.005,
      });
    }

    let angleX = 0;
    let angleY = 0;
    let angleZ = 0;

    // Render loop
    const render = () => {
      // Clear canvas with trail blur background
      ctx.fillStyle = document.documentElement.classList.contains('dark')
        ? 'rgba(11, 15, 25, 0.25)'
        : 'rgba(248, 250, 252, 0.25)';
      ctx.fillRect(0, 0, width, height);

      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const scroll = scrollRef.current;
      scroll.y += (scroll.targetY - scroll.y) * 0.05;

      // Base rotations influenced by mouse coordinates and scroll offset
      angleX += 0.002 + mouse.y * 0.003;
      angleY += 0.003 + mouse.x * 0.003;
      angleZ = scroll.y * 0.0015;

      // Zoom factor changes smoothly with scroll position
      const zoomFactor = Math.max(0.5, 1 - scroll.y * 0.0004);
      const fov = 420 * zoomFactor;
      const cameraDistance = 550;

      // Project all vertices to screen space
      const projected = points.map((p) => {
        // Rotate X
        let y1 = p.x * Math.sin(angleX) + p.y * Math.cos(angleX);
        let z1 = p.x * Math.cos(angleX) - p.y * Math.sin(angleX);

        // Rotate Y
        let x2 = p.baseX * Math.cos(angleY) - z1 * Math.sin(angleY);
        let z2 = p.baseX * Math.sin(angleY) + z1 * Math.cos(angleY);

        // Rotate Z
        let x3 = x2 * Math.cos(angleZ) - y1 * Math.sin(angleZ);
        let y3 = x2 * Math.sin(angleZ) + y1 * Math.cos(angleZ);

        const scale = fov / (z2 + cameraDistance);
        return {
          sx: x3 * scale + width / 2,
          sy: y3 * scale + height / 2 - scroll.y * 0.15, // Move slightly on scroll
          sz: z2,
          orig: p,
        };
      });

      // 1. Draw Torus Knot connecting lines
      ctx.lineWidth = 1;
      const knotPoints = projected.filter((p) => p.orig.type === 'knot');
      for (let i = 0; i < knotPoints.length; i++) {
        const p1 = knotPoints[i];
        const p2 = knotPoints[(i + 1) % knotPoints.length];

        const avgZ = (p1.sz + p2.sz) / 2;
        const alpha = Math.max(0.1, 1 - (avgZ + R + r) / (2 * (R + r)));

        ctx.strokeStyle = document.documentElement.classList.contains('dark')
          ? `rgba(99, 102, 241, ${alpha * 0.45})`
          : `rgba(99, 102, 241, ${alpha * 0.55})`;

        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();
      }

      // 2. Draw Sphere connection lines
      ctx.lineWidth = 0.5;
      const spherePoints = projected.filter((p) => p.orig.type === 'sphere');
      for (let i = 0; i < spherePoints.length; i++) {
        const p1 = spherePoints[i];

        // Connect ring loop
        const nextRingIdx =
          p1.orig.pointIndex === pointsPerRing - 1
            ? i - pointsPerRing + 1
            : i + 1;
        const p2 = spherePoints[nextRingIdx];

        const avgZ = (p1.sz + p2.sz) / 2;
        const alpha = Math.max(0.05, 1 - (avgZ + sphereRadius) / (2 * sphereRadius));

        ctx.strokeStyle = document.documentElement.classList.contains('dark')
          ? `rgba(99, 102, 241, ${alpha * 0.15})`
          : `rgba(99, 102, 241, ${alpha * 0.25})`;

        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();

        // Connect vertical slice
        if (p1.orig.ringIndex < numRings - 1) {
          const p3 = spherePoints[i + pointsPerRing];
          const avgZ2 = (p1.sz + p3.sz) / 2;
          const alpha2 = Math.max(0.05, 1 - (avgZ2 + sphereRadius) / (2 * sphereRadius));

          ctx.strokeStyle = document.documentElement.classList.contains('dark')
            ? `rgba(99, 102, 241, ${alpha2 * 0.15})`
            : `rgba(99, 102, 241, ${alpha2 * 0.25})`;

          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p3.sx, p3.sy);
          ctx.stroke();
        }
      }

      // 3. Draw Interactive Cursor connections
      // Draw neon webs connecting the cursor to the nearest 3 vertices of the Knot
      if (mouse.isOver && mouse.pixelX && mouse.pixelY) {
        // Calculate distances from cursor to all projected knot points
        const distances = knotPoints.map((p) => {
          const dx = p.sx - mouse.pixelX;
          const dy = p.sy - mouse.pixelY;
          return { point: p, dist: dx * dx + dy * dy };
        });

        // Sort by distance and take closest 4 vertices
        distances.sort((a, b) => a.dist - b.dist);
        const maxInteractiveDist = 200 * 200; // 200px threshold

        distances.slice(0, 4).forEach((d) => {
          if (d.dist < maxInteractiveDist) {
            const actualDist = Math.sqrt(d.dist);
            const intensity = 1 - actualDist / 200;

            // Draw connecting web lines
            ctx.strokeStyle = document.documentElement.classList.contains('dark')
              ? `rgba(99, 102, 241, ${intensity * 0.4})`
              : `rgba(99, 102, 241, ${intensity * 0.5})`;
            ctx.lineWidth = intensity * 1.5;

            ctx.beginPath();
            ctx.moveTo(mouse.pixelX, mouse.pixelY);
            ctx.lineTo(d.point.sx, d.point.sy);
            ctx.stroke();

            // Draw a tiny highlight dot at the connected vertex
            ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
            ctx.beginPath();
            ctx.arc(d.point.sx, d.point.sy, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // Depth sort all nodes for depth-rendering
      projected.sort((a, b) => b.sz - a.sz);

      // Draw all nodes
      projected.forEach((p) => {
        const isKnot = p.orig.type === 'knot';
        const size = Math.max(1, (isKnot ? 4 : 2) * (fov / (p.sz + cameraDistance)));
        const alpha = Math.max(0.1, 1 - (p.sz + (isKnot ? R : sphereRadius)) / (2 * (isKnot ? R : sphereRadius)));

        ctx.fillStyle = isKnot
          ? `rgba(99, 102, 241, ${alpha})`
          : `rgba(99, 102, 241, ${alpha * 0.4})`;

        ctx.beginPath();
        ctx.arc(p.sx, p.sy, size, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect for close knot points
        if (isKnot && alpha > 0.6) {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha - 0.2})`;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Update and Draw Orbiting Dust Particles
      particles.forEach((p) => {
        p.z -= p.speed * 22;
        if (p.z < -cameraDistance + 50) {
          p.z = 400;
        }

        let y1 = p.x * Math.sin(angleX * 0.15) + p.y * Math.cos(angleX * 0.15);
        let z1 = p.x * Math.cos(angleX * 0.15) - p.y * Math.sin(angleX * 0.15);

        let x2 = p.x * Math.cos(angleY * 0.15) - z1 * Math.sin(angleY * 0.15);
        let z2 = p.x * Math.sin(angleY * 0.15) + z1 * Math.cos(angleY * 0.15);

        let x3 = x2 * Math.cos(angleZ) - y1 * Math.sin(angleZ);
        let y3 = x2 * Math.sin(angleZ) + y1 * Math.cos(angleZ);

        const scale = fov / (z2 + cameraDistance);
        const sx = x3 * scale + width / 2;
        const sy = y3 * scale + height / 2 - scroll.y * 0.08;

        if (sx > 0 && sx < width && sy > 0 && sy < height) {
          const alpha = Math.max(0.05, 1 - (z2 + 300) / 600);
          ctx.fillStyle = document.documentElement.classList.contains('dark')
            ? `rgba(99, 102, 241, ${alpha * 0.35})`
            : `rgba(99, 102, 241, ${alpha * 0.55})`;
          ctx.beginPath();
          ctx.arc(sx, sy, p.size * scale * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: 'normal' }}
    />
  );
}
