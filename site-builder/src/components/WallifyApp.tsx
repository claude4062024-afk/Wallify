import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import RAPIER from '@dimforge/rapier2d-compat';
import type { SiteConfig, Testimonial } from '../lib/supabase';

// ==========================
// CONFIGURATION CONSTANTS
// ==========================
const PIXELS_PER_METER = 50;
const GRAVITY = { x: 0.0, y: 0.0 };
const RESTITUTION = 0.9;
const FRICTION = 0.1;
const DAMPING_DEFAULT = 0.8;
const DAMPING_HOVER = 10.0;

const COLORS = ['#FFD166', '#EF476F', '#06D6A0', '#118AB2'];

// "Organic" border radii generator
const BORDER_STYLES = [
  '60% 40% 30% 70% / 60% 30% 70% 40%',
  '40% 60% 70% 30% / 40% 50% 60% 50%',
  '50% 50% 30% 70% / 50% 40% 70% 20%',
  '60% 40% 50% 50% / 30% 40% 60% 70%',
];

interface WallifyAppProps {
  testimonials: Testimonial[];
  config: SiteConfig;
}

export default function WallifyApp({ testimonials = [], config }: WallifyAppProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const physicsRef = useRef<{
    world: RAPIER.World;
    bodies: Map<string, RAPIER.RigidBody>;
    walls: RAPIER.RigidBody[];
  } | null>(null);
  const requestRef = useRef<number>();
  const [isReady, setIsReady] = useState(false);

  // 1. Initialize Physics Engine (WASM)
  useEffect(() => {
    let active = true;
    async function initPhysics() {
      try {
        await RAPIER.init();
        if (!active) return;
        
        // Check if world already exists to avoid double init
        if (!physicsRef.current) {
          const world = new RAPIER.World(GRAVITY);
          physicsRef.current = {
            world,
            bodies: new Map(),
            walls: [],
          };
          setIsReady(true);
        }
      } catch (e) {
        console.error("Physics initialization failed", e);
      }
    }
    
    initPhysics();

    return () => {
      active = false;
      if (physicsRef.current) {
        physicsRef.current.world.free();
        physicsRef.current = null;
      }
    };
  }, []);

  // 2. Setup Walls & Bodies
  useEffect(() => {
    if (!isReady || !physicsRef.current || !containerRef.current) return;

    const { world, bodies, walls } = physicsRef.current;
    
    // Clear existing walls
    walls.forEach(w => world.removeRigidBody(w));
    walls.length = 0;

    // Dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;
    const wM = width / PIXELS_PER_METER;
    const hM = height / PIXELS_PER_METER;
    const wallThickness = 2; // meters

    // Create Walls (Floor, Ceiling, Left, Right)
    const createWall = (x: number, y: number, hx: number, hy: number) => {
      const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y);
      const body = world.createRigidBody(bodyDesc);
      const colliderDesc = RAPIER.ColliderDesc.cuboid(hx, hy);
      world.createCollider(colliderDesc, body);
      walls.push(body);
    };

    createWall(wM / 2, hM + wallThickness, wM / 2, wallThickness); // Floor
    createWall(wM / 2, -wallThickness, wM / 2, wallThickness);    // Ceiling
    createWall(-wallThickness, hM / 2, wallThickness, hM / 2);    // Left
    createWall(wM + wallThickness, hM / 2, wallThickness, hM / 2); // Right

    // Create Testimonial Bodies (if they don't exist yet)
    testimonials.forEach((t, i) => {
      if (bodies.has(t.id)) return;

      const x = (Math.random() * (width - 200) + 100) / PIXELS_PER_METER;
      const y = (Math.random() * (height - 200) + 100) / PIXELS_PER_METER;
      
      // Dynamic Body
      const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(x, y)
        .setLinearDamping(DAMPING_DEFAULT)
        .setAngularDamping(0.5);
      
      const body = world.createRigidBody(bodyDesc);
      
      // Box Collider (approximate size of the card: 220px x 160px)
      // Half-extents in meters
      const hw = (220 / 2) / PIXELS_PER_METER;
      const hh = (160 / 2) / PIXELS_PER_METER;
      const colliderDesc = RAPIER.ColliderDesc.cuboid(hw, hh)
        .setRestitution(RESTITUTION)
        .setFriction(FRICTION);
      
      world.createCollider(colliderDesc, body);
      bodies.set(t.id, body);
    });

  }, [isReady, testimonials]);

  // 3. The Animation Loop (Render)
  useLayoutEffect(() => {
    if (!isReady || !physicsRef.current) return;

    const loop = () => {
      const { world, bodies } = physicsRef.current!;
      world.step();

      bodies.forEach((body, id) => {
        const el = document.getElementById(`blob-${id}`);
        if (el) {
          const { x, y } = body.translation();
          const rotation = body.rotation();
          
          const px = x * PIXELS_PER_METER;
          const py = y * PIXELS_PER_METER;
          
          // Apply transformation directly to DOM
          el.style.transform = `translate(${px}px, ${py}px) rotate(${rotation}rad)`;
        }
      });

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isReady]);

  // Handle Resize used to just be implicit by the useEffect running on dependency change,
  // but width/height aren't dependencies. We should add a listener.
  useEffect(() => {
     if (!isReady || !physicsRef.current) return;
     
     const handleResize = () => {
         // Re-run wall creation logic (simplified by just forcing update or manually doing it)
         // For now, simpler to just let it be or reload. 
         // But let's act professional and reload page for physics stability on resize is common practice for this type of demo.
         // Or just update the walls.
         
         // Implementation: Update wall positions.
         const width = window.innerWidth;
         const height = window.innerHeight;
         const wM = width / PIXELS_PER_METER;
         const hM = height / PIXELS_PER_METER;
         const { walls, world } = physicsRef.current!;
         
         // Removing old walls
         walls.forEach(w => world.removeRigidBody(w));
         walls.length = 0;
         
         // Recreating (copy paste logic from above - refactor ideally)
         const wallThickness = 2;
         const createWall = (x: number, y: number, hx: number, hy: number) => {
            const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y);
            const body = world.createRigidBody(bodyDesc);
            const colliderDesc = RAPIER.ColliderDesc.cuboid(hx, hy);
            world.createCollider(colliderDesc, body);
            walls.push(body);
         };
         
         createWall(wM / 2, hM + wallThickness, wM / 2, wallThickness); // Floor
         createWall(wM / 2, -wallThickness, wM / 2, wallThickness);    // Ceiling
         createWall(-wallThickness, hM / 2, wallThickness, hM / 2);    // Left
         createWall(wM + wallThickness, hM / 2, wallThickness, hM / 2); // Right
     };
     
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
  }, [isReady]);

  // 4. Interaction Handlers
  const handleMouseEnter = (id: string) => {
    const body = physicsRef.current?.bodies.get(id);
    if (body) {
      body.setLinearDamping(DAMPING_HOVER);
      body.setAngularDamping(DAMPING_HOVER);
    }
  };

  const handleMouseLeave = (id: string) => {
    const body = physicsRef.current?.bodies.get(id);
    if (body) {
      body.setLinearDamping(DAMPING_DEFAULT);
      body.setAngularDamping(0.5);
      
      // Wake up impulse
      body.applyImpulse(
        { 
          x: (Math.random() - 0.5) * 10.0, 
          y: (Math.random() - 0.5) * 10.0 
        }, 
        true
      );
    }
  };

  if (!isReady) return <div className="w-full h-screen bg-[#F3F4F6] flex items-center justify-center text-slate-400">Loading Interactions...</div>;

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 overflow-hidden bg-[#F8F9FA]"
    >
      {testimonials.map((t, i) => (
        <div
          key={t.id}
          id={`blob-${t.id}`}
          onMouseEnter={() => handleMouseEnter(t.id)}
          onMouseLeave={() => handleMouseLeave(t.id)}
          className="absolute top-0 left-0 w-[220px] p-6 flex flex-col items-center justify-center text-center cursor-pointer select-none will-change-transform"
          style={{
            // Visuals
            backgroundColor: COLORS[i % COLORS.length],
            borderRadius: BORDER_STYLES[i % BORDER_STYLES.length],
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.05), 0 10px 20px rgba(0,0,0,0.1)',
            
            // Centering helper: 
            // The transform places the TOP-LEFT corner at the physics coordinate.
            // We want the CENTER at the physics coordinate.
            marginTop: -80, // Half height of ~160 (content dependent but fixed for physics box)
            marginLeft: -110, // Half width
            minHeight: 160,
          }}
        >
          {t.author_avatar && (
            <img 
              src={t.author_avatar} 
              alt={t.author_name}
              className="w-12 h-12 rounded-full mb-3 border-2 border-black/10 object-cover"
              draggable={false}
            />
          )}
          
          <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight">
            {t.author_name}
          </h3>
          
          {t.author_title && (
            <p className="text-[10px] text-gray-700 uppercase tracking-wider font-semibold mb-2 opacity-70">
              {t.author_title}
            </p>
          )}

          <p className="text-xs text-gray-800 leading-snug font-medium line-clamp-3">
            "{t.content_text}"
          </p>
        </div>
      ))}
      
      <div className="absolute bottom-8 left-8 text-gray-400 text-xs font-medium pointer-events-none opacity-50">
        Google Labs Inspired • 2D Physics
      </div>
    </div>
  );
}
