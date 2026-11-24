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
  scene.fog = new THREE.FogExp2(0x123e50, 0.018);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 9.1, 17.6);
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
    new THREE.CircleGeometry(9.8, 96),
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
  function addLandmark(parent,index,p){
    const accent=mat(p[2]),cream=mat(0xf0dcb8),dark=mat(0x76513b);
    const box=(w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
    if(index===0){ // Indonesian temple gate
      for(const x of [-.43,.43]){const pillar=box(.12,.8,.13,cream,x,.75,-.45);pillar.rotation.z=x*.13;}
      box(1.25,.13,.22,mat(0x9b4938),0,1.2,-.45);
      box(.98,.1,.2,mat(0xb85e43),0,1.34,-.45);
    } else if(index===1){ // Japanese pagoda
      for(let k=0;k<3;k++){const y=.55+k*.32;box(.48-k*.08,.25,.48-k*.08,cream,0,y,-.5);const roof=new THREE.Mesh(new THREE.ConeGeometry(.52-k*.07,.2,4),mat(0x9f5145));roof.position.set(0,y+.18,-.5);roof.rotation.y=Math.PI/4;roof.castShadow=true;parent.add(roof);}
      const spire=new THREE.Mesh(new THREE.ConeGeometry(.07,.48,6),accent);spire.position.set(0,1.75,-.5);parent.add(spire);
    } else if(index===2){ // Korean pavilion
      box(.78,.13,.6,cream,0,.9,-.48);for(const x of [-.3,.3])box(.07,.65,.07,mat(0x9c5544),x,.57,-.48);
      const roof=new THREE.Mesh(new THREE.ConeGeometry(.65,.32,4),mat(0x326b5c));roof.position.set(0,1.12,-.48);roof.rotation.y=Math.PI/4;parent.add(roof);
    } else if(index===3){ // English clock tower
      const tower=new THREE.Mesh(new THREE.BoxGeometry(.3,1.35,.3),cream);tower.position.set(0,1.05,-.5);tower.castShadow=true;parent.add(tower);
      const roof=new THREE.Mesh(new THREE.ConeGeometry(.26,.38,4),mat(0x455a55));roof.position.set(0,1.9,-.5);roof.rotation.y=Math.PI/4;parent.add(roof);
      const clock=new THREE.Mesh(new THREE.CircleGeometry(.1,16),windowMat);clock.position.set(0,1.35,-.335);parent.add(clock);
    } else if(index===4){ // desert mosque minaret
      const min=new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,1.4,8),cream);min.position.set(0,1,-.48);min.castShadow=true;parent.add(min);
      const dome=new THREE.Mesh(new THREE.SphereGeometry(.22,12,8),mat(0xb98551));dome.scale.y=1.2;dome.position.set(0,1.78,-.48);parent.add(dome);
      const cres=new THREE.Mesh(new THREE.TorusGeometry(.09,.018,5,12),accent);cres.position.set(0,2.04,-.48);parent.add(cres);
    } else if(index===5){ // alpine chalet
      addHouse(parent,0,-.48,0x934f3e,1.15);
      const snow=new THREE.Mesh(new THREE.ConeGeometry(.55,.24,4),cream);snow.position.set(0,1.25,-.48);snow.rotation.y=Math.PI/4;parent.add(snow);
    } else if(index===6){ // Italian arched monument
      const arch=new THREE.Mesh(new THREE.TorusGeometry(.34,.12,8,20,Math.PI),mat(0xd1b48b));arch.position.set(0,1,-.5);arch.rotation.z=Math.PI;parent.add(arch);
      box(.2,.75,.18,cream,-.34,.42,-.5);box(.2,.75,.18,cream,.34,.42,-.5);
    } else if(index===7){ // Paris landmark
      const levels=[.42,.32,.22,.12];levels.forEach((w,k)=>{const bar=box(w,.1,.1,dark,0,.45+k*.34,-.5);});
      const sp=new THREE.Mesh(new THREE.ConeGeometry(.07,.42,5),accent);sp.position.set(0,1.95,-.5);parent.add(sp);
    } else if(index===8){ // pyramids
      for(let k=0;k<2;k++){const py=new THREE.Mesh(new THREE.ConeGeometry(.55-k*.13,.8-k*.12,4),mat(k?0xd9bd87:0xc9a66f));py.position.set((k-.5)*.48,.82,-.48);py.rotation.y=Math.PI/4;py.scale.z=.85;py.castShadow=true;parent.add(py);}
    } else { // Brazilian statue and palms
      const plinth=new THREE.Mesh(new THREE.BoxGeometry(.34,.35,.34),cream);plinth.position.set(0,.55,-.5);parent.add(plinth);
      const figure=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.55,4,7),accent);figure.position.set(0,1.05,-.5);parent.add(figure);
      const arms=box(.75,.07,.07,accent,0,1.22,-.5);
    }
  }

  function makeIsland(index){
    const p=palettes[index],g=new THREE.Group();
    // Irregular, hand-shaped coastline instead of identical round platforms.
    const shape=new THREE.Shape();
    const n=14, phase=index*.73;
    for(let j=0;j<n;j++){
      const a=j/n*Math.PI*2,rad=1.22+.15*Math.sin(j*2.31+phase)+.09*Math.cos(j*3.7+phase);
      const x=Math.cos(a)*rad*1.12,z=Math.sin(a)*rad*.83;
      if(j===0)shape.moveTo(x,z);else shape.lineTo(x,z);
    }
    shape.closePath();
    const landGeo=new THREE.ExtrudeGeometry(shape,{depth:.42,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.07,bevelThickness:.07,curveSegments:5});
    landGeo.rotateX(-Math.PI/2);
    const landMat=mat(p[0]);const land=new THREE.Mesh(landGeo,landMat);land.position.y=.12;land.castShadow=true;land.receiveShadow=true;g.add(land);
    const under=new THREE.Mesh(new THREE.CylinderGeometry(1.27,1.02,.48,12),mat(0x34545a));under.position.y=-.12;under.scale.set(1.08,.9,.82);under.castShadow=true;g.add(under);
    // Varied terrain, not one oversized green dome.
    const hillPositions=[[-.42,-.15,.48],[.32,-.35,.3],[-.12,.42,.22]];
    hillPositions.forEach((v,k)=>{const h=new THREE.Mesh(new THREE.IcosahedronGeometry(v[2],1),mat(k===0?p[1]:p[0]));h.position.set(v[0],.46,v[1]);h.scale.set(1.35,.62,.92);h.castShadow=true;g.add(h);});
    // Coastline rocks, garden patches and a winding path.
    for(let k=0;k<7;k++){const a=k/7*Math.PI*2;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.12+(k%3)*.025,0),stone);rock.position.set(Math.cos(a)*1.12,.22,Math.sin(a)*.78);rock.scale.y=.7;g.add(rock);}
    const pathCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.85,.35,.4),new THREE.Vector3(-.35,.36,.12),new THREE.Vector3(.1,.37,.34),new THREE.Vector3(.55,.36,.12)]);
    const path=new THREE.Mesh(new THREE.TubeGeometry(pathCurve,24,.045,5,false),sand);g.add(path);
    // Country-specific vegetation and architecture.
    for(let j=0;j<4;j++){const a=j*1.7+index*.63;addTree(g,Math.cos(a)*(.75+(j%2)*.12),Math.sin(a)*.55,.62+(j%3)*.1,j+index);}
    addHouse(g,.42,.24,p[2],.68);
    addHouse(g,-.48,.28,p[2],.52);
    addLandmark(g,index,p);
    // A little waterfront dock and boat.
    const dock=new THREE.Mesh(new THREE.BoxGeometry(.56,.08,.18),mat(0x9a704c));dock.position.set(.8,.13,.63);g.add(dock);
    const buoy=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),mat(0xf0bd78));buoy.position.set(.98,.24,.64);g.add(buoy);
    g.userData.countryIndex=index;
    // Generous invisible touch target: easier to select a small island on phones.
    const touchTarget=new THREE.Mesh(new THREE.CylinderGeometry(1.42,1.42,1.45,20),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false}));
    touchTarget.position.y=.68;touchTarget.userData.countryIndex=index;g.add(touchTarget);
    const angle=(index/10)*Math.PI*2-Math.PI/2;
    const radius=index%2===0?5.45:6.55;
    g.position.set(Math.cos(angle)*radius,Math.sin(index*1.7)*.18,Math.sin(angle)*radius*.63);
    g.rotation.y=-angle*.25;
    const scale=.94+(index%3)*.07;g.scale.setScalar(scale);
    world.add(g);islandGroups.push(g);clickable.push(g);return g;
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
