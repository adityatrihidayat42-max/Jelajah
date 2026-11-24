import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js";

(() => {
  const host = document.querySelector(".atlas");
  if (!host) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (err) {
    console.warn("Jelajah 3D unavailable; keeping the illustrated atlas.", err);
    return;
  }

  const canvas = renderer.domElement;
  canvas.className = "atlas-three-canvas";
  canvas.setAttribute("aria-label", "Peta dunia miniatur 3D. Geser untuk memutar dan sentuh pulau untuk menjelajah.");
  host.prepend(canvas);
  document.documentElement.classList.add("has-three-atlas");

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x123e50, 0.026);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 10.5, 19.5);
  camera.lookAt(0, 0.7, 0);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene.add(new THREE.HemisphereLight(0xc8f3ec, 0x24404b, 2.0));
  const sun = new THREE.DirectionalLight(0xffe4b6, 3.1);
  sun.position.set(-7, 13, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -17; sun.shadow.camera.right = 17;
  sun.shadow.camera.top = 17; sun.shadow.camera.bottom = -17;
  scene.add(sun);
  const fill = new THREE.PointLight(0x52c9bd, 32, 30);
  fill.position.set(8, 5, -7); scene.add(fill);

  const sea = new THREE.Mesh(
    new THREE.CircleGeometry(10.8, 96),
    new THREE.MeshStandardMaterial({ color: 0x17677a, roughness: 0.28, metalness: 0.12, transparent: true, opacity: 0.82 })
  );
  sea.rotation.x = -Math.PI / 2; sea.position.y = -0.82; sea.receiveShadow = true; scene.add(sea);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(9.2, 0.018, 5, 160),
    new THREE.MeshBasicMaterial({ color: 0xb5f3dd, transparent: true, opacity: 0.38 })
  );
  halo.rotation.x = Math.PI / 2; halo.position.y = -0.72; scene.add(halo);

  const world = new THREE.Group(); scene.add(world);
  const palettes = [
    [0x76b86d,0x4b956c,0xc86f50],[0x8fbd79,0x5b9669,0xd65e62],
    [0x83b8a2,0x4f8b79,0xd8a16f],[0x83ad83,0x5a806e,0x9a6650],
    [0x9cb8a0,0x668c7a,0xb7a17a],[0x83b2a0,0x548a80,0xd9a96d],
    [0x9ebf9a,0x628c71,0xb66d53],[0x83b6a3,0x568b7b,0xd4b078],
    [0x9ab7a0,0x5f8a72,0xb98b5c],[0x87bca1,0x568b78,0xd28a62]
  ];
  const countryNames = ["Indonesia","Jepang","Korea Selatan","Inggris","Arab Saudi","Swiss","Italia","Prancis","Mesir","Brasil"];
  const islandGroups = [];
  const clickable = [];
  const mat = (color, roughness=0.88) => new THREE.MeshStandardMaterial({ color, roughness });
  const trunkMat = mat(0x76513b), leafMats = [mat(0x367b59),mat(0x55965e),mat(0x82ad65)];
  const stone = mat(0x6d8580), sand = mat(0xe4c28c), windowMat = new THREE.MeshStandardMaterial({color:0xffe4a5,emissive:0xffb85c,emissiveIntensity:0.45});

  function addTree(parent,x,z,scale=1,variant=0){
    const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);
    const t=new THREE.Mesh(new THREE.CylinderGeometry(.055,.085,.48,6),trunkMat);t.position.y=.24;t.castShadow=true;g.add(t);
    const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.34,1),leafMats[variant%3]);crown.position.y=.62;crown.scale.set(1,1.12,1);crown.castShadow=true;g.add(crown);
    const crown2=new THREE.Mesh(new THREE.IcosahedronGeometry(.22,1),leafMats[(variant+1)%3]);crown2.position.set(.15,.78,.06);crown2.castShadow=true;g.add(crown2);
    parent.add(g);return g;
  }
  function addHouse(parent,x,z,roofColor,scale=1){
    const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);
    const base=new THREE.Mesh(new THREE.BoxGeometry(.62,.48,.58),mat(0xf1d9ad));base.position.y=.36;base.castShadow=true;base.receiveShadow=true;g.add(base);
    const roof=new THREE.Mesh(new THREE.ConeGeometry(.52,.42,4),mat(roofColor));roof.position.y=.78;roof.rotation.y=Math.PI/4;roof.castShadow=true;g.add(roof);
    const door=new THREE.Mesh(new THREE.BoxGeometry(.12,.27,.025),mat(0x76513b));door.position.set(0,.19,.3);g.add(door);
    const win=new THREE.Mesh(new THREE.BoxGeometry(.11,.12,.025),windowMat);win.position.set(.2,.48,.3);g.add(win);
    parent.add(g);return g;
  }
  function addTower(parent,x,z,color){
    const g=new THREE.Group();g.position.set(x,0,z);
    const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.16,.2,1.25,8),mat(0xe8d8b7));shaft.position.y=.72;shaft.castShadow=true;g.add(shaft);
    const cap=new THREE.Mesh(new THREE.ConeGeometry(.27,.42,8),mat(color));cap.position.y=1.55;cap.castShadow=true;g.add(cap);
    parent.add(g);
  }
  function makeIsland(index){
    const p=palettes[index],g=new THREE.Group();
    const base=new THREE.Mesh(new THREE.CylinderGeometry(1.42,1.08,.56,9,1,false),mat(0x345f65));
    base.position.y=-.12;base.rotation.y=.18; base.castShadow=true;g.add(base);
    const soil=new THREE.Mesh(new THREE.CylinderGeometry(1.36,1.26,.22,10),mat(p[1]));
    soil.position.y=.2;soil.castShadow=true;soil.receiveShadow=true;g.add(soil);
    const land=new THREE.Mesh(new THREE.CylinderGeometry(1.28,1.2,.28,10),mat(p[0]));
    land.position.y=.4;land.castShadow=true;land.receiveShadow=true;g.add(land);
    const hill=new THREE.Mesh(new THREE.IcosahedronGeometry(.74,1),mat(p[0]));
    hill.position.set(-.15,.79,-.05);hill.scale.set(1.15,.63,.9);hill.castShadow=true;g.add(hill);
    for(let j=0;j<5;j++){
      const a=j*1.256+index*.63, radius=.72+(j%2)*.2;
      addTree(g,Math.cos(a)*radius,.42+Math.sin(a)*radius,.72+(j%3)*.13,j+index);
    }
    addHouse(g,.36,.18,p[2],.82);
    addHouse(g,-.48,.43,p[2],.58);
    if(index===0||index===3||index===6||index===8) addTower(g,-.1,-.48,p[2]);
    if(index===1||index===2||index===5||index===7) {
      const arch=new THREE.Mesh(new THREE.TorusGeometry(.28,.07,7,16,Math.PI),mat(p[2]));
      arch.position.set(.7,.58,-.34);arch.rotation.z=Math.PI;arch.castShadow=true;g.add(arch);
    }
    const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.28,0),stone);rock.position.set(-.85,.53,-.3);rock.scale.y=1.3;rock.castShadow=true;g.add(rock);
    const marker=new THREE.Mesh(new THREE.CylinderGeometry(1.48,1.42,.08,10),new THREE.MeshStandardMaterial({color:0xf0d39b,roughness:.48}));
    marker.position.y=-.34;g.add(marker);
    g.userData.countryIndex=index;
    const angle=(index/10)*Math.PI*2-Math.PI/2;
    const radius=index%2===0?6.0:7.25;
    g.position.set(Math.cos(angle)*radius,Math.sin(index*1.7)*.28,Math.sin(angle)*radius*.68);
    g.rotation.y=-angle*.25;
    const s=.82+(index%3)*.1;g.scale.setScalar(s);
    world.add(g);islandGroups.push(g);clickable.push(g);
    return g;
  }
  for(let i=0;i<10;i++)makeIsland(i);

  // Tiny boats and their wakes make the sea feel inhabited.
  const boats=[];
  for(let i=0;i<3;i++){
    const b=new THREE.Group();
    const hull=new THREE.Mesh(new THREE.ConeGeometry(.23,.9,4),mat(0x8d5844));hull.rotation.z=-Math.PI/2;hull.position.y=0;hull.scale.set(.55,.45,1);b.add(hull);
    const mast=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.65,5),mat(0xf2dfb8));mast.position.y=.38;b.add(mast);
    const sail=new THREE.Mesh(new THREE.ConeGeometry(.24,.48,3),mat(0xf3dfb6));sail.position.set(.08,.45,0);sail.rotation.z=-.35;b.add(sail);
    b.position.set(-5+i*4,-.53,2.6-i*2.5);scene.add(b);boats.push(b);
  }

  // Floating cloud clusters add scale and depth.
  const cloudMat=new THREE.MeshStandardMaterial({color:0xe8f1df,transparent:true,opacity:.72,roughness:1});
  const clouds=[];
  for(let i=0;i<7;i++){
    const c=new THREE.Group();
    for(let j=0;j<4;j++){
      const puff=new THREE.Mesh(new THREE.SphereGeometry(.48+(j%2)*.12,9,7),cloudMat);
      puff.position.set((j-1.5)*.48, j%2*.18, Math.sin(j)*.12);c.add(puff);
    }
    c.position.set(Math.cos(i*.9)*10,3.2+(i%3)*.8,Math.sin(i*.9)*7);c.scale.setScalar(.7+(i%2)*.22);scene.add(c);clouds.push(c);
  }

  // Sparkling markers and fine dotted travel paths.
  const routeMat=new THREE.MeshBasicMaterial({color:0xf3d5a0,transparent:true,opacity:.5});
  for(let i=0;i<10;i++){
    const a=i/10*Math.PI*2-Math.PI/2;
    const dot=new THREE.Mesh(new THREE.SphereGeometry(.045,6,6),routeMat);
    dot.position.set(Math.cos(a)*4.7,-.58,Math.sin(a)*3.3);scene.add(dot);
  }

  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  let downX=0,downY=0,dragging=false,dragged=false,targetRotation=0,zoom=1,selected=-1;
  const pickables=[];
  islandGroups.forEach(g=>g.traverse(o=>{if(o.isMesh){o.userData.countryIndex=g.userData.countryIndex;pickables.push(o)}}));
  canvas.addEventListener("pointerdown",e=>{downX=e.clientX;downY=e.clientY;dragging=true;dragged=false;canvas.setPointerCapture?.(e.pointerId)});
  canvas.addEventListener("pointermove",e=>{if(!dragging)return;const dx=e.clientX-downX,dy=e.clientY-downY;if(Math.abs(dx)+Math.abs(dy)>5)dragged=true;targetRotation+=dx*.004;world.rotation.y=targetRotation;camera.position.y=THREE.MathUtils.clamp(camera.position.y-dy*.012,7.5,14);camera.lookAt(0,.4,0);downX=e.clientX;downY=e.clientY});
  canvas.addEventListener("pointerup",e=>{
    dragging=false;if(dragged)return;
    const rect=canvas.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;
    raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(pickables,false)[0];
    if(hit){const idx=hit.object.userData.countryIndex;selected=idx;document.querySelector('#islands .island[data-i="'+idx+'"]')?.click();}
  });
  canvas.addEventListener("wheel",e=>{e.preventDefault();zoom=THREE.MathUtils.clamp(zoom+(e.deltaY>0?-.08:.08),.78,1.25);camera.position.multiplyScalar(zoom);},{passive:false});
  canvas.addEventListener("pointercancel",()=>dragging=false);

  const resize=()=>{
    const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host);resize();

  const clock=new THREE.Clock();
  renderer.setAnimationLoop(()=>{
    const t=clock.getElapsedTime();
    if(!dragging)world.rotation.y+=(targetRotation-world.rotation.y)*.035;
    world.position.y=Math.sin(t*.55)*.08;
    islandGroups.forEach((g,i)=>{g.position.y=Math.sin(t*.8+i*1.2)*.13+Math.sin(i*1.7)*.28;});
    boats.forEach((b,i)=>{b.position.x=Math.sin(t*.22+i*2)*6;b.position.z=Math.cos(t*.2+i*2)*4;b.rotation.y=Math.sin(t*.3+i)*.3;});
    clouds.forEach((c,i)=>{c.position.x+=Math.sin(t*.08+i)*.0018;c.position.y+=Math.sin(t*.35+i)*.001;});
    renderer.render(scene,camera);
  });

  window.addEventListener("resize",resize);
  console.info("Jelajah 3D atlas ready",renderer.info);
})();
