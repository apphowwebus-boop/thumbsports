import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GarmentAppearance, GarmentVisualKind } from '../data/catalog';
import {
  createFloorConcreteTexture,
  createGarmentThreeCutout,
  createModelWhiteThreeTexture,
  createPlacardTexture,
  createWallPlasterTexture,
  getBrandedModelDataUrl,
  getGarmentPreviewDataUrl,
} from '../utils/garmentTexture';

export interface ShowroomItem {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  visualKind: GarmentVisualKind;
  basePhoto: string;
  modelWhitePhoto?: string;
  hookYRatio: number;
  appearance: GarmentAppearance;
}

interface Showroom3DProps {
  items: ShowroomItem[];
  levelKey: string;
  levelTitle: string;
  levelSubtitle: string;
  actionLabel: string;
  scrollRunwayRef?: React.RefObject<HTMLElement | null>;
  onSelectItem: (item: ShowroomItem) => void;
}

interface HangingNode {
  group: THREE.Group;
  hitMesh: THREE.Mesh;
  garmentMesh: THREE.Mesh;
  shadowMesh: THREE.Mesh;
  placardMesh: THREE.Mesh;
  baseAngle: number;
  item: ShowroomItem;
  currentPull: number;
}

const WALL_RADIUS = 16.5;
const RAIL_RADIUS = 15.65;
const RAIL_HEIGHT = 4.48;
const GARMENT_HEIGHT = 3.42;
const GARMENT_WIDTH = 2.565; // 3:4 crisp gallery panel aspect ratio
const PANEL_SUSPENSION_DROP = 0.22;
const GARMENT_CENTER_Y = RAIL_HEIGHT - PANEL_SUSPENSION_DROP - GARMENT_HEIGHT * 0.5;
const ITEM_ARC_STEP = 0.172;
const FOCUS_CAM_RADIUS = 8.4;
const OVERVIEW_CAM_RADIUS = 6.0;

const _vec3A = new THREE.Vector3();
const _pointerNdc = new THREE.Vector2();

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export const Showroom3D: React.FC<Showroom3DProps> = ({
  items,
  levelKey,
  levelTitle,
  levelSubtitle,
  actionLabel,
  scrollRunwayRef,
  onSelectItem,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<ShowroomItem | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'focus' | 'overview'>('focus');
  const [fallbackPreviews, setFallbackPreviews] = useState<Record<string, string>>({});

  const onSelectRef = useRef(onSelectItem);
  onSelectRef.current = onSelectItem;

  const targetAngleRef = useRef(0);
  const currentAngleRef = useRef(0);
  const targetCamRadiusRef = useRef(FOCUS_CAM_RADIUS);
  const currentCamRadiusRef = useRef(FOCUS_CAM_RADIUS);
  const targetZoomPulseRef = useRef(0);
  const currentZoomPulseRef = useRef(0);
  const maxAngleRef = useRef(0.35);
  const scrollRangeRef = useRef<{ min: number; max: number }>({ min: 0, max: 0 });
  const manualOverrideRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const nodesRef = useRef<HangingNode[]>([]);
  const hoveredIdRef = useRef<string | null>(null);
  const requestRenderRef = useRef<() => void>(() => {});
  const itemsGroupRef = useRef<THREE.Group | null>(null);
  const sharedRef = useRef<{
    steelMat: THREE.MeshStandardMaterial;
    maxAniso: number;
  } | null>(null);

  useEffect(() => {
    targetCamRadiusRef.current = viewMode === 'focus' ? FOCUS_CAM_RADIUS : OVERVIEW_CAM_RADIUS;
    requestRenderRef.current();
  }, [viewMode]);

  // Smooth scroll-linked camera sweep across the curved brushed-steel railing
  useEffect(() => {
    if (!scrollRunwayRef) return;
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const runway = scrollRunwayRef.current;
      if (!runway) return;
      const curY = window.scrollY;
      // If user actively scrolled the page, release any arrow/drag override back to scroll control
      if (Math.abs(curY - lastScrollYRef.current) > 4) {
        manualOverrideRef.current = false;
      }
      lastScrollYRef.current = curY;
      if (manualOverrideRef.current) return;

      const rect = runway.getBoundingClientRect();
      const scrollableDist = Math.max(1, rect.height - window.innerHeight);
      const progress = THREE.MathUtils.clamp(-rect.top / scrollableDist, 0, 1);

      const { min, max } = scrollRangeRef.current;
      targetAngleRef.current = THREE.MathUtils.lerp(min, max, progress);
      requestRenderRef.current();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollRunwayRef, levelKey]);

  // 2D fallback previews if WebGL fails
  useEffect(() => {
    if (!webglFailed) return;
    let cancelled = false;
    Promise.all(
      items.map(async (it) => {
        const url = it.modelWhitePhoto
          ? await getBrandedModelDataUrl(it.modelWhitePhoto)
          : await getGarmentPreviewDataUrl(
              it.visualKind,
              it.basePhoto,
              it.hookYRatio,
              it.appearance,
            );
        return [it.id, url] as const;
      }),
    ).then((entries) => {
      if (!cancelled) {
        setFallbackPreviews(Object.fromEntries(entries));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [webglFailed, items]);

  // Initialize Three.js Boutique Showroom Scene ONCE
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#ffffff');
    scene.fog = new THREE.Fog('#ffffff', 24, 54);

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 80);
    camera.position.set(0, GARMENT_CENTER_Y + 0.12, -FOCUS_CAM_RADIUS);
    camera.lookAt(0, GARMENT_CENTER_Y - 0.1, -RAIL_RADIUS);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe8eaed, 1.55);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.95);
    keyLight.position.set(3.5, 9.5, 3);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf8fafc, 0.55);
    rimLight.position.set(-5, 5, -2);
    scene.add(rimLight);

    const archGroup = new THREE.Group();
    scene.add(archGroup);

    const wallTex = createWallPlasterTexture(maxAniso);
    const floorTex = createFloorConcreteTexture(maxAniso);
    const arcSpan = Math.PI * 1.32;
    const arcStart = Math.PI - arcSpan / 2;

    // 1. Curved Pure-White Studio Gallery Wall
    const wallGeo = new THREE.CylinderGeometry(
      WALL_RADIUS,
      WALL_RADIUS,
      8.2,
      96,
      1,
      true,
      arcStart,
      arcSpan,
    );
    const wallMat = new THREE.MeshBasicMaterial({
      map: wallTex,
      color: 0xffffff,
      toneMapped: false,
      side: THREE.BackSide,
    });
    const curvedWall = new THREE.Mesh(wallGeo, wallMat);
    curvedWall.position.y = 4.1;
    archGroup.add(curvedWall);

    // 2. Crisp Architectural Baseboard Trim
    const baseboardGeo = new THREE.CylinderGeometry(
      WALL_RADIUS - 0.02,
      WALL_RADIUS - 0.02,
      0.16,
      96,
      1,
      true,
      arcStart,
      arcSpan,
    );
    const baseboardMat = new THREE.MeshStandardMaterial({
      color: 0xe6e7ea,
      roughness: 0.75,
      side: THREE.BackSide,
    });
    const baseboard = new THREE.Mesh(baseboardGeo, baseboardMat);
    baseboard.position.y = 0.08;
    archGroup.add(baseboard);

    // 3. Light Gallery Studio Floor
    const floorGeo = new THREE.CircleGeometry(WALL_RADIUS + 1.5, 96);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      color: 0xf7f8fa,
      roughness: 0.65,
      metalness: 0.04,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = 0;
    floor.receiveShadow = !isSoftwareGl;
    archGroup.add(floor);

    // 4. Curved Floor Rail Guide directly under the garment rail
    const floorLineGeo = new THREE.RingGeometry(
      RAIL_RADIUS - 0.04,
      RAIL_RADIUS + 0.04,
      96,
      1,
      -Math.PI / 2 - arcSpan / 2,
      arcSpan,
    );
    floorLineGeo.rotateX(Math.PI / 2);
    const floorLineMat = new THREE.MeshStandardMaterial({
      color: 0xc5c1b8,
      roughness: 0.65,
    });
    const floorLine = new THREE.Mesh(floorLineGeo, floorLineMat);
    floorLine.position.y = 0.012;
    archGroup.add(floorLine);

    // 5. Overhead Architectural Track Light Valance
    const valanceCurvePts: THREE.Vector3[] = [];
    const railSteps = 80;
    const railArc = Math.PI * 1.18;
    for (let i = 0; i <= railSteps; i++) {
      const a = -railArc / 2 + (i / railSteps) * railArc;
      valanceCurvePts.push(
        new THREE.Vector3(
          Math.sin(a) * (RAIL_RADIUS + 0.15),
          5.65,
          -Math.cos(a) * (RAIL_RADIUS + 0.15),
        ),
      );
    }
    const valanceCurve = new THREE.CatmullRomCurve3(valanceCurvePts);
    const valanceGeo = new THREE.TubeGeometry(valanceCurve, 96, 0.055, 12, false);
    const valanceMat = new THREE.MeshStandardMaterial({
      color: 0x202123,
      roughness: 0.45,
      metalness: 0.5,
    });
    const valanceTrack = new THREE.Mesh(valanceGeo, valanceMat);
    archGroup.add(valanceTrack);

    // 6. CONTINUOUS CURVED BRUSHED-STEEL GARMENT RAILING
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xd0d3d6,
      metalness: 0.92,
      roughness: 0.18,
    });

    const railCurvePts: THREE.Vector3[] = [];
    for (let i = 0; i <= railSteps; i++) {
      const a = -railArc / 2 + (i / railSteps) * railArc;
      railCurvePts.push(
        new THREE.Vector3(Math.sin(a) * RAIL_RADIUS, RAIL_HEIGHT, -Math.cos(a) * RAIL_RADIUS),
      );
    }
    const railCurve = new THREE.CatmullRomCurve3(railCurvePts);
    const railGeo = new THREE.TubeGeometry(railCurve, 128, 0.036, 20, false);
    const railMesh = new THREE.Mesh(railGeo, steelMat);
    railMesh.castShadow = !isSoftwareGl;
    archGroup.add(railMesh);

    const bracketCount = 13;
    const armLen = WALL_RADIUS - RAIL_RADIUS;
    for (let b = 0; b < bracketCount; b++) {
      const a = -railArc / 2 + (b / (bracketCount - 1)) * railArc;
      const bracketGroup = new THREE.Group();
      bracketGroup.position.set(
        Math.sin(a) * WALL_RADIUS,
        RAIL_HEIGHT,
        -Math.cos(a) * WALL_RADIUS,
      );
      bracketGroup.rotation.y = -a;

      const flangeGeo = new THREE.CylinderGeometry(0.09, 0.095, 0.035, 24);
      flangeGeo.rotateX(Math.PI / 2);
      const flange = new THREE.Mesh(flangeGeo, steelMat);
      flange.position.z = 0.015;
      bracketGroup.add(flange);

      const armGeo = new THREE.CylinderGeometry(0.024, 0.028, armLen, 16);
      armGeo.rotateX(Math.PI / 2);
      const arm = new THREE.Mesh(armGeo, steelMat);
      arm.position.z = armLen / 2;
      bracketGroup.add(arm);

      const clampGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.075, 20);
      clampGeo.rotateZ(Math.PI / 2);
      const clamp = new THREE.Mesh(clampGeo, steelMat);
      clamp.position.z = armLen;
      bracketGroup.add(clamp);

      archGroup.add(bracketGroup);
    }

    const itemsGroup = new THREE.Group();
    scene.add(itemsGroup);
    itemsGroupRef.current = itemsGroup;
    sharedRef.current = { steelMat, maxAniso };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const raycaster = new THREE.Raycaster();
    let isDragging = false;
    let pointerDownX = 0;
    let pointerDownY = 0;
    let lastPointerX = 0;
    let dragDistance = 0;
    let lastHoverCheck = 0;

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || !gl.fenceSync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function updateSceneAndCamera(dt: number, elapsedSec: number): boolean {
      const angleDiff = Math.abs(targetAngleRef.current - currentAngleRef.current);
      const radiusDiff = Math.abs(targetCamRadiusRef.current - currentCamRadiusRef.current);
      const zoomDiff = Math.abs(targetZoomPulseRef.current - currentZoomPulseRef.current);

      const lambda = isSoftwareGl ? 14 : 9.5;
      currentAngleRef.current = THREE.MathUtils.damp(
        currentAngleRef.current,
        targetAngleRef.current,
        lambda,
        dt,
      );
      currentCamRadiusRef.current = THREE.MathUtils.damp(
        currentCamRadiusRef.current,
        targetCamRadiusRef.current,
        7.5,
        dt,
      );
      currentZoomPulseRef.current = THREE.MathUtils.damp(
        currentZoomPulseRef.current,
        targetZoomPulseRef.current,
        11,
        dt,
      );

      const a = currentAngleRef.current;
      const rCam = currentCamRadiusRef.current + currentZoomPulseRef.current;
      camera.position.set(
        Math.sin(a) * rCam,
        GARMENT_CENTER_Y + 0.12,
        -Math.cos(a) * rCam,
      );
      _vec3A.set(
        Math.sin(a) * RAIL_RADIUS,
        GARMENT_CENTER_Y - 0.14,
        -Math.cos(a) * RAIL_RADIUS,
      );
      camera.lookAt(_vec3A);

      const nodes = nodesRef.current;
      let nearestIdx = 0;
      let minDelta = Infinity;
      let pullActive = false;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const deltaAngle = Math.abs(node.baseAngle - a);
        if (deltaAngle < minDelta) {
          minDelta = deltaAngle;
          nearestIdx = i;
        }
        const isHovered = hoveredIdRef.current === node.item.id;
        const targetPull = isHovered ? 0.18 : 0;
        if (Math.abs(node.currentPull - targetPull) > 0.002) {
          pullActive = true;
        }
        node.currentPull = THREE.MathUtils.damp(node.currentPull, targetPull, 12, dt);

        node.garmentMesh.position.z = node.currentPull;
        if (!isSoftwareGl) {
          node.garmentMesh.rotation.z = Math.sin(elapsedSec * 1.1 + i * 1.8) * 0.004;
        }
      }

      setActiveIndex((prev) => (prev !== nearestIdx ? nearestIdx : prev));
      return angleDiff > 0.0005 || radiusDiff > 0.002 || zoomDiff > 0.002 || pullActive;
    }

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        renderDirty = false;
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        const stillAnimating = updateSceneAndCamera(dt, now / 1000);
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty || stillAnimating) {
            requestRender();
          }
        };
        if (isSoftwareGl) {
          afterDraw(done);
        } else {
          done();
        }
      });
    }

    requestRenderRef.current = requestRender;
    requestRender();

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      _pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      _pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const performHoverRaycast = (clientX: number, clientY: number) => {
      const now = performance.now();
      if (now - lastHoverCheck < 40) return;
      lastHoverCheck = now;

      updatePointer(clientX, clientY);
      raycaster.setFromCamera(_pointerNdc, camera);
      const hitMeshes = nodesRef.current.map((n) => n.hitMesh);
      const hits = raycaster.intersectObjects(hitMeshes, false);

      if (hits.length > 0) {
        const hitItem = hits[0].object.userData.item as ShowroomItem | undefined;
        if (hitItem && hoveredIdRef.current !== hitItem.id) {
          hoveredIdRef.current = hitItem.id;
          setHoveredItem(hitItem);
          canvas.style.cursor = 'pointer';
          requestRender();
        }
      } else if (hoveredIdRef.current !== null) {
        hoveredIdRef.current = null;
        setHoveredItem(null);
        canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
        requestRender();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      lastPointerX = e.clientX;
      dragDistance = 0;
      canvas.style.cursor = 'grabbing';
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const dx = e.clientX - lastPointerX;
        const dy = e.clientY - pointerDownY;
        dragDistance = Math.max(dragDistance, Math.hypot(e.clientX - pointerDownX, dy));
        lastPointerX = e.clientX;
        if (dragDistance > 6) {
          manualOverrideRef.current = true;
        }
        const sensitivity = 0.0017;
        const limit = maxAngleRef.current;
        targetAngleRef.current = THREE.MathUtils.clamp(
          targetAngleRef.current - dx * sensitivity,
          -limit,
          limit,
        );
        requestRender();
      } else {
        performHoverRaycast(e.clientX, e.clientY);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      canvas.style.cursor = hoveredIdRef.current ? 'pointer' : 'grab';
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      if (dragDistance < 7) {
        updatePointer(e.clientX, e.clientY);
        raycaster.setFromCamera(_pointerNdc, camera);
        const hitMeshes = nodesRef.current.map((n) => n.hitMesh);
        const hits = raycaster.intersectObjects(hitMeshes, false);
        if (hits.length > 0) {
          const hitItem = hits[0].object.userData.item as ShowroomItem | undefined;
          const baseAngle = hits[0].object.userData.baseAngle as number | undefined;
          if (hitItem) {
            if (typeof baseAngle === 'number') {
              manualOverrideRef.current = true;
              targetAngleRef.current = baseAngle;
              targetZoomPulseRef.current = 1.35;
              requestRender();
            }
            window.setTimeout(() => {
              onSelectRef.current(hitItem);
            }, 130);
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      // Allow horizontal trackpad swipe to pan manually; vertical wheel naturally drives sticky runway scroll!
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        manualOverrideRef.current = true;
        const limit = maxAngleRef.current;
        targetAngleRef.current = THREE.MathUtils.clamp(
          targetAngleRef.current + e.deltaX * 0.0008,
          -limit,
          limit,
        );
        requestRender();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const nodes = nodesRef.current;
      if (nodes.length === 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const cur = nodes.reduce(
          (best, n, i) =>
            Math.abs(n.baseAngle - targetAngleRef.current) <
            Math.abs(nodes[best].baseAngle - targetAngleRef.current)
              ? i
              : best,
          0,
        );
        const nextIdx =
          e.key === 'ArrowRight' ? Math.min(nodes.length - 1, cur + 1) : Math.max(0, cur - 1);
        manualOverrideRef.current = true;
        targetAngleRef.current = nodes[nextIdx].baseAngle;
        requestRender();
      }
    };

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      requestRender();
    };

    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose());
          } else {
            m.material.dispose();
          }
        }
      });
      wallTex.dispose();
      floorTex.dispose();
      envTexture.dispose();
      renderer.dispose();
      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  // Populate Full-HD Garment Cutouts on the Curved Brushed-Steel Railing
  useEffect(() => {
    const itemsGroup = itemsGroupRef.current;
    const shared = sharedRef.current;
    if (!itemsGroup || !shared || webglFailed) return;

    let cancelled = false;

    nodesRef.current.forEach((node) => {
      node.group.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry.dispose();
          const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;
          if (mat !== shared.steelMat) {
            if ('map' in mat && mat.map) {
              mat.map.dispose();
            }
            mat.dispose();
          }
        }
      });
      itemsGroup.remove(node.group);
    });
    nodesRef.current = [];
    hoveredIdRef.current = null;
    setHoveredItem(null);
    manualOverrideRef.current = false;

    const count = items.length;
    const totalArc = Math.max(0, count - 1) * ITEM_ARC_STEP;
    const startAngle = -totalArc / 2;
    maxAngleRef.current = Math.max(0.16, totalArc / 2 + 0.04);

    // For rich multi-garment racks, scroll runway starts with 2 items on left so hero view is packed wall-to-wall!
    const scrollStartIdx = count >= 7 ? 2 : 0;
    const scrollEndIdx = count >= 7 ? count - 3 : Math.max(0, count - 1);
    const minScrollAngle = count <= 1 ? 0 : startAngle + scrollStartIdx * ITEM_ARC_STEP;
    const maxScrollAngle = count <= 1 ? 0 : startAngle + scrollEndIdx * ITEM_ARC_STEP;
    scrollRangeRef.current = { min: minScrollAngle, max: maxScrollAngle };

    targetAngleRef.current = minScrollAngle;
    currentAngleRef.current = minScrollAngle;
    targetZoomPulseRef.current = 0;
    currentZoomPulseRef.current = -0.5;
    setActiveIndex(scrollStartIdx);

    items.forEach((item, index) => {
      const angle = count === 1 ? 0 : startAngle + index * ITEM_ARC_STEP;
      const group = new THREE.Group();

      group.position.set(
        Math.sin(angle) * RAIL_RADIUS,
        GARMENT_CENTER_Y,
        -Math.cos(angle) * RAIL_RADIUS,
      );
      group.rotation.y = -angle;

      // Twin Brushed-Steel Rail Clamps & Vertical Suspension Rods holding the pure-white Model Panel
      const topPanelY = GARMENT_HEIGHT * 0.5;
      const railYOffset = topPanelY + PANEL_SUSPENSION_DROP;
      for (const clampX of [-0.52, 0.52]) {
        const ringGeo = new THREE.TorusGeometry(0.044, 0.011, 10, 20);
        ringGeo.rotateY(Math.PI / 2);
        const ring = new THREE.Mesh(ringGeo, shared.steelMat);
        ring.position.set(clampX, railYOffset, 0);
        group.add(ring);

        const rodGeo = new THREE.CylinderGeometry(0.009, 0.009, PANEL_SUSPENSION_DROP, 10);
        const rod = new THREE.Mesh(rodGeo, shared.steelMat);
        rod.position.set(clampX, topPanelY + PANEL_SUSPENSION_DROP * 0.5, 0);
        group.add(rod);

        const clipGeo = new THREE.BoxGeometry(0.09, 0.048, 0.042);
        const clip = new THREE.Mesh(clipGeo, shared.steelMat);
        clip.position.set(clampX, topPanelY + 0.01, 0);
        group.add(clip);
      }

      // Clean architectural soft shadow strictly behind the suspended panel (zero bleed on placard)
      const wallOffsetZ = -(WALL_RADIUS - RAIL_RADIUS) + 0.04;
      const shadowGeo = new THREE.PlaneGeometry(GARMENT_WIDTH * 1.02, GARMENT_HEIGHT * 1.01);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x111317,
        transparent: true,
        opacity: 0.06,
        depthWrite: false,
      });
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.position.set(0.06, -0.04, wallOffsetZ);
      group.add(shadowMesh);

      // Subtle hairline backing border plate
      const frameGeo = new THREE.PlaneGeometry(GARMENT_WIDTH + 0.025, GARMENT_HEIGHT + 0.025);
      const frameMat = new THREE.MeshBasicMaterial({
        color: 0xe6e7eb,
        toneMapped: false,
      });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.position.set(0, 0, -0.008);
      group.add(frameMesh);

      // Pure #FFFFFF Studio Model-Worn Photography Panel (toneMapped: false preserves pure white!)
      const garmentGeo = new THREE.PlaneGeometry(GARMENT_WIDTH, GARMENT_HEIGHT, 1, 1);
      const garmentMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        toneMapped: false,
        side: THREE.DoubleSide,
      });
      const garmentMesh = new THREE.Mesh(garmentGeo, garmentMat);
      garmentMesh.position.set(0, 0, 0);
      group.add(garmentMesh);

      // Showroom wall placard directly beneath suspended panel
      const placardGeo = new THREE.PlaneGeometry(2.05, 0.52);
      const placardTex = createPlacardTexture(item.title, item.subtitle, item.meta, shared.maxAniso);
      const placardMat = new THREE.MeshBasicMaterial({
        map: placardTex,
        transparent: true,
        toneMapped: false,
        depthWrite: false,
      });
      const placardMesh = new THREE.Mesh(placardGeo, placardMat);
      placardMesh.position.set(-0.24, -GARMENT_HEIGHT * 0.5 - 0.34, wallOffsetZ + 0.03);
      group.add(placardMesh);

      const hitGeo = new THREE.BoxGeometry(GARMENT_WIDTH * 0.96, GARMENT_HEIGHT * 0.98, 0.35);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.set(0, -0.05, 0.05);
      hitMesh.userData = { item, baseAngle: angle };
      group.add(hitMesh);

      itemsGroup.add(group);
      nodesRef.current.push({
        group,
        hitMesh,
        garmentMesh,
        shadowMesh,
        placardMesh,
        baseAngle: angle,
        item,
        currentPull: 0,
      });

      if (item.modelWhitePhoto) {
        createModelWhiteThreeTexture(item.modelWhitePhoto, shared.maxAniso).then((modelTex) => {
          if (cancelled) return;
          garmentMat.map = modelTex;
          garmentMat.needsUpdate = true;
          requestRenderRef.current();
        });
      } else {
        createGarmentThreeCutout(
          item.visualKind,
          item.basePhoto,
          item.hookYRatio,
          item.appearance,
          shared.maxAniso,
        ).then(({ garmentTex, shadowTex }) => {
          if (cancelled) {
            garmentTex.dispose();
            shadowTex.dispose();
            return;
          }
          garmentMat.map = garmentTex;
          garmentMat.needsUpdate = true;
          shadowMat.map = shadowTex;
          shadowMat.needsUpdate = true;
          requestRenderRef.current();
        });
      }
    });

    requestRenderRef.current();

    return () => {
      cancelled = true;
    };
  }, [items, levelKey, webglFailed]);

  const jumpToIndex = (idx: number) => {
    const count = items.length;
    if (count === 0) return;
    const clamped = Math.max(0, Math.min(count - 1, idx));
    const totalArc = Math.max(0, count - 1) * ITEM_ARC_STEP;
    const startAngle = -totalArc / 2;
    const nextAngle = count === 1 ? 0 : startAngle + clamped * ITEM_ARC_STEP;

    manualOverrideRef.current = true;
    targetAngleRef.current = nextAngle;
    setActiveIndex(clamped);
    requestRenderRef.current();
  };

  const activeItem = items[activeIndex] || items[0];

  if (webglFailed) {
    return (
      <div className="relative w-full h-full overflow-y-auto bg-white pt-24 pb-28 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-end justify-between border-b border-black/10 pb-4">
            <div>
              <p className="font-mono text-xs tracking-wider text-neutral-500 uppercase">{levelSubtitle}</p>
              <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-[#141413] mt-1">
                {levelTitle}
              </h1>
            </div>
            <span className="font-mono text-xs text-neutral-500 tabular-nums">{items.length} GARMENTS</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="group text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#141413]"
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-white border border-black/8 p-2 relative">
                  {fallbackPreviews[item.id] || item.modelWhitePhoto ? (
                    <>
                      <img
                        src={fallbackPreviews[item.id] || item.modelWhitePhoto}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 shadow-[inset_0_0_24px_12px_#ffffff]"
                        aria-hidden="true"
                      />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-mono text-neutral-500">
                      Loading Model Shot...
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <div className="text-base font-semibold text-[#141413] group-hover:underline">
                    {item.title}
                  </div>
                  <div className="text-sm text-neutral-600 mt-0.5">{item.subtitle}</div>
                  <div className="font-mono text-xs text-neutral-500 mt-1">{item.meta}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-white">
      <div ref={mountRef} className="w-full h-full" />

      {/* Left / Right One-by-One Stepping Arrows */}
      <button
        type="button"
        onClick={() => jumpToIndex(activeIndex - 1)}
        disabled={activeIndex <= 0}
        aria-label="Previous garment on railing"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center bg-[#F7F6F3] border border-black/15 text-[#141413] hover:bg-white disabled:opacity-25 transition-all shadow-sm cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={() => jumpToIndex(activeIndex + 1)}
        disabled={activeIndex >= items.length - 1}
        aria-label="Next garment on railing"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center bg-[#F7F6F3] border border-black/15 text-[#141413] hover:bg-white disabled:opacity-25 transition-all shadow-sm cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Center-Bottom Active Garment Rail Dock */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 flex flex-col items-center px-4 z-20">
        {activeItem && (
          <div className="pointer-events-auto w-full max-w-3xl bg-[#F8F7F3] border border-black/15 border-t-2 border-t-[#C6922D] shadow-lg px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-neutral-500 tabular-nums">
                <span>
                  {String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate">
                  {hoveredItem ? `Inspecting: ${hoveredItem.title}` : levelTitle}
                </span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold uppercase tracking-wide text-[#111317] truncate mt-0.5">
                {activeItem.title}
              </h2>
              <p className="text-xs text-neutral-600 truncate">
                {activeItem.subtitle} · <span className="font-mono">{activeItem.meta}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden md:flex items-center border border-black/15 bg-[#EFEDE8] p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('focus')}
                  className={`px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
                    viewMode === 'focus'
                      ? 'bg-white text-[#111317] shadow-xs'
                      : 'text-neutral-600 hover:text-[#111317]'
                  }`}
                >
                  One-by-One
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('overview')}
                  className={`px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
                    viewMode === 'overview'
                      ? 'bg-white text-[#111317] shadow-xs'
                      : 'text-neutral-600 hover:text-[#111317]'
                  }`}
                >
                  Full Rail
                </button>
              </div>

              <button
                type="button"
                onClick={() => onSelectItem(activeItem)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#111317] text-[#F2F1EE] text-xs font-semibold uppercase tracking-wider hover:bg-[#C6922D] hover:text-[#111317] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {actionLabel}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Garment Selector Strip */}
        <div className="pointer-events-auto mt-2 flex items-center gap-1 bg-[#F7F6F3] border border-black/12 px-2 py-1 overflow-x-auto max-w-[92vw]">
          {items.map((item, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => jumpToIndex(idx)}
                className={`px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#141413] text-[#F2F1EE]'
                    : 'text-neutral-600 hover:text-[#141413] hover:bg-black/5'
                }`}
              >
                {item.title}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
