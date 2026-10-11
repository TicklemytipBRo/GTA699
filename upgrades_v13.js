// PROJECT THREE v0.13 — aiming, living city, traffic, scenery, interiors, occurrences and heist systems.
(() => {
  const V13_VERSION='0.13';
  try{document.querySelector('#versionBadge')?.remove();}catch(e){}
  const v13Badge=document.createElement('div');
  v13Badge.id='versionBadge';
  v13Badge.textContent='v0.13 • LIVING CITY UPDATE';
  Object.assign(v13Badge.style,{position:'fixed',right:'14px',top:'14px',zIndex:'16',padding:'7px 10px',borderRadius:'999px',background:'rgba(4,8,12,.72)',border:'1px solid rgba(255,255,255,.16)',font:'800 11px Arial',letterSpacing:'.08em',color:'#dbefff',pointerEvents:'none'});
  document.body.appendChild(v13Badge);

  // ---------- Visual quality / scenery ----------
  renderer.setPixelRatio(Math.min(devicePixelRatio,isMobile?1.7:2.5));
  renderer.shadowMap.autoUpdate=true;
  camera.far=2200;camera.updateProjectionMatrix();

  const v13SceneryRoot=new THREE.Group();v13SceneryRoot.name='V13_SCENERY';scene.add(v13SceneryRoot);
  const v13WindowMat=new THREE.MeshStandardMaterial({color:0xa9c9dc,emissive:0x6e8494,emissiveIntensity:.25,roughness:.22,metalness:.08});
  const v13BrickMats=[0x6e6a64,0x7a665b,0x5d6770,0x8a806f,0x655f5d].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.86,metalness:.02}));
  const v13RoofMat=new THREE.MeshStandardMaterial({color:0x252a2e,roughness:.8,metalness:.1});
  const v13Concrete=new THREE.MeshStandardMaterial({color:0x777b78,roughness:.92});
  const v13Metal=new THREE.MeshStandardMaterial({color:0x30363b,roughness:.42,metalness:.72});
  const v13Leaf=new THREE.MeshStandardMaterial({color:0x2d633b,roughness:.98});
  const v13Bark=new THREE.MeshStandardMaterial({color:0x5d4430,roughness:1});

  function v13Shadow(o){o.castShadow=true;o.receiveShadow=true;return o;}
  function v13Building(x,z,w,d,h,seed=0){
    const g=new THREE.Group();g.position.set(x,0,z);
    const body=v13Shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),v13BrickMats[seed%v13BrickMats.length]));body.position.y=h/2;g.add(body);
    const roof=v13Shadow(new THREE.Mesh(new THREE.BoxGeometry(w*1.02,.35,d*1.02),v13RoofMat));roof.position.y=h+.16;g.add(roof);
    const rows=Math.max(2,Math.floor(h/4.2)),cols=Math.max(2,Math.floor(w/3.6));
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      if((r+c+seed)%5===0)continue;
      const win=new THREE.Mesh(new THREE.PlaneGeometry(1.55,1.55),v13WindowMat);
      win.position.set(-w/2+2+(c*(w-4)/Math.max(1,cols-1)),2.6+r*4.1,d/2+.012);g.add(win);
    }
    const unit=v13Shadow(new THREE.Mesh(new THREE.BoxGeometry(Math.min(3,w*.28),.9,Math.min(3,d*.28)),v13Metal));unit.position.set((seed%3-1)*w*.18,h+.65,0);g.add(unit);
    v13SceneryRoot.add(g);cameraObstacles.push(body);registerWetMaterial(body.material);return g;
  }
  const v13Skyline=[];
  for(let i=0;i<28;i++){
    const ring=310+(i%3)*68,ang=(i/28)*Math.PI*2+(i%2)*.08;
    const x=Math.cos(ang)*ring,z=Math.sin(ang)*ring;
    const w=22+(i*13)%28,d=20+(i*17)%30,h=18+(i*19)%56;
    v13Skyline.push(v13Building(x,z,w,d,h,i));
  }
  function v13Tree(x,z,s=1){
    const g=new THREE.Group();g.position.set(x,0,z);
    const trunk=v13Shadow(new THREE.Mesh(new THREE.CylinderGeometry(.22*s,.3*s,2.5*s,8),v13Bark));trunk.position.y=1.25*s;g.add(trunk);
    const crown=v13Shadow(new THREE.Mesh(new THREE.IcosahedronGeometry(1.35*s,1),v13Leaf));crown.position.y=3.25*s;g.add(crown);v13SceneryRoot.add(g);
  }
  for(let i=0;i<54;i++){
    const ang=i*2.399,rad=150+(i%7)*42;const x=Math.cos(ang)*rad,z=Math.sin(ang)*rad;
    if(!pointBlocked(x,z,2.2))v13Tree(x,z,.75+(i%4)*.08);
  }
  function v13StreetProp(x,z,type=0,rot=0){
    const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;
    if(type===0){
      const seat=v13Shadow(new THREE.Mesh(new THREE.BoxGeometry(2,.12,.52),v13Bark));seat.position.y=.62;g.add(seat);
      for(const y of [.2,.62]){const bar=v13Shadow(new THREE.Mesh(new THREE.BoxGeometry(2,.1,.1),v13Metal));bar.position.set(0,y,-.23);g.add(bar)}
    }else if(type===1){
      const can=v13Shadow(new THREE.Mesh(new THREE.CylinderGeometry(.34,.38,.9,12),v13Metal));can.position.y=.45;g.add(can);
    }else{
      const box=v13Shadow(new THREE.Mesh(new THREE.BoxGeometry(.35,.65,.35),new THREE.MeshStandardMaterial({color:0xa13b2f,roughness:.72,metalness:.15})));box.position.y=.33;g.add(box);
      const cap=v13Shadow(new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.22,10),box.material));cap.position.y=.77;g.add(cap);
    }
    v13SceneryRoot.add(g);
  }
  for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++){
    if((i+j)%2===0)v13StreetProp(i*55+12,j*55+12,(Math.abs(i*3+j)%3),((i+j)&1)*Math.PI/2);
  }

  // ---------- Traffic lights and denser traffic ----------
  const v13TrafficLights=[];
  function v13MakeTrafficLight(x,z,axis='NS',corner=1){
    const g=new THREE.Group();g.position.set(x,0,z);
    const pole=v13Shadow(new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,4.8,10),v13Metal));pole.position.y=2.4;g.add(pole);
    const arm=v13Shadow(new THREE.Mesh(new THREE.BoxGeometry(2.2,.12,.12),v13Metal));arm.position.set(corner*1.0,4.55,0);g.add(arm);
    const box=v13Shadow(new THREE.Mesh(new THREE.BoxGeometry(.48,1.22,.38),new THREE.MeshStandardMaterial({color:0x16191c,roughness:.54,metalness:.45})));box.position.set(corner*2.0,4.08,0);g.add(box);
    const mats=[0xe63b2e,0xe5b52d,0x35c35b].map(c=>new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.15,roughness:.35}));
    const lamps=[];[.38,0,-.38].forEach((dy,k)=>{const l=new THREE.Mesh(new THREE.SphereGeometry(.115,12,8),mats[k]);l.position.set(corner*2.0,4.08+dy,.205);g.add(l);lamps.push(l)});
    v13SceneryRoot.add(g);v13TrafficLights.push({x,z,axis,lamps,group:g,state:'red'});return g;
  }
  const v13Intersections=[];for(let gx=-2;gx<=2;gx++)for(let gz=-2;gz<=2;gz++)v13Intersections.push([gx*55,gz*55]);
  for(const [x,z] of v13Intersections){v13MakeTrafficLight(x+8.2,z+8.2,'NS',1);v13MakeTrafficLight(x-8.2,z-8.2,'EW',-1)}
  function v13TrafficPhase(){const p=(worldElapsed%24);return p<9?'NS':p<12?'YNS':p<21?'EW':'YEW';}
  function v13UpdateSignals(){
    const phase=v13TrafficPhase();
    for(const l of v13TrafficLights){
      let state='red';if((l.axis==='NS'&&(phase==='NS'||phase==='YNS'))||(l.axis==='EW'&&(phase==='EW'||phase==='YEW')))state=phase[0]==='Y'?'yellow':'green';
      l.state=state;l.lamps[0].material.emissiveIntensity=state==='red'?3.0:.12;l.lamps[1].material.emissiveIntensity=state==='yellow'?3.0:.12;l.lamps[2].material.emissiveIntensity=state==='green'?3.0:.12;
    }
  }
  const v13BaseTrafficObstacleAhead=trafficObstacleAhead;
  trafficObstacleAhead=function(car){
    let nearest=v13BaseTrafficObstacleAhead(car);const fw=new THREE.Vector3(Math.sin(car.rotation.y),0,Math.cos(car.rotation.y));const rt=new THREE.Vector3(Math.cos(car.rotation.y),0,-Math.sin(car.rotation.y));
    const axis=Math.abs(fw.z)>=Math.abs(fw.x)?'NS':'EW';
    for(const l of v13TrafficLights){if(l.axis!==axis||l.state==='green')continue;const rel=new THREE.Vector3(l.x-car.position.x,0,l.z-car.position.z),long=rel.dot(fw),lat=Math.abs(rel.dot(rt));if(long>1.5&&long<24&&lat<11.5)nearest=Math.min(nearest,Math.max(.6,long-7.3));}
    return nearest;
  };
  const v13ExtraTraffic=isMobile?8:18;
  const v13TrafficColors=[0x2c4d70,0xb23d37,0xd3b446,0x343a40,0xf0efea,0x2f6445,0x77537f,0x596d81,0x9b7a4d,0x6f2330];
  for(let i=0;i<v13ExtraTraffic;i++){
    const route=trafficRoutes[i%trafficRoutes.length],idx=(i*3+1)%route.length,p=route[idx];
    const car=makeCar(p[0]+((i%3)-1)*2.4,p[1]+((i%2)-.5)*2.0,v13TrafficColors[i%v13TrafficColors.length]);
    car.userData.aiTraffic=true;car.userData.route=route;car.userData.routeIndex=(idx+1)%route.length;car.userData.cruiseSpeed=8.5+Math.random()*8.5;car.userData.velocity.set(0,0,0);trafficCars.push(car);
  }

  // ---------- Population boom ----------
  const v13TargetPopulation=isMobile?68:100;
  const v13Skins=[0x6b4434,0x7c4d39,0x9d674d,0xb97b5c,0xd2a17c,0x5d392e,0xc48b68,0xe0b38b];
  function v13SpawnCitizen(i){
    const zone=citizenZones[i%citizenZones.length];
    const d={color:new THREE.Color().setHSL((i*.091+Math.random()*.05)%1,.30,.34+Math.random()*.13).getHex(),skin:v13Skins[i%v13Skins.length],hair:[0x17120f,0x2a211b,0x443126,0x101214,0x604229][i%5],pants:[0x252a31,0x30343b,0x171b21,0x3b352f,0x253647][i%5],shoe:0x141619,build:.86+Math.random()*.24};
    const n=makeCharacter(d,false);n.scale.setScalar(.86+Math.random()*.11);
    for(let tries=0;tries<16;tries++){n.position.set(zone.x+(Math.random()-.5)*zone.rx*2,0,zone.z+(Math.random()-.5)*zone.rz*2);if(!pointBlocked(n.position.x,n.position.z,.6))break;}
    n.rotation.y=Math.random()*Math.PI*2;n.userData.wander=n.rotation.y;n.userData.ai={state:Math.random()<.18?'idle':'wander',zone,target:new THREE.Vector3(n.position.x,0,n.position.z),velocity:new THREE.Vector3(),timer:Math.random()*5,speed:.72+Math.random()*.62,personality:i%5,voiceIndex:i,voiceCooldown:0,panicUntil:0,socialCooldown:Math.random()*10,relationship:0,met:false,combatHealth:100,hostileUntil:0,combatCooldown:0,blockUntil:0,attackAnim:0,guarding:false,targetCitizen:null,lastInteraction:0};
    addCitizenAccessory?.(n,i+50);addRiggedFaceDetail?.(n,i+50);scene.add(n);npcs.push(n);
  }
  for(let i=npcs.length;i<v13TargetPopulation;i++)v13SpawnCitizen(i);

  // ---------- Enterable interiors ----------
  const v13InteriorRoot=new THREE.Group();v13InteriorRoot.name='V13_INTERIORS';scene.add(v13InteriorRoot);
  const v13Locations=[];let v13ActiveInterior=null;let v13ReturnPosition=new THREE.Vector3();
  const v13InteriorDefs=[
    {name:'Beanline Coffee',kind:'coffee',door:[28,12]},
    {name:'Bayview Central Bank',kind:'bank',door:[-28,12]},
    {name:'Harbor Coffee',kind:'coffee',door:[82,67]},
    {name:'Northshore Savings',kind:'bank',door:[-82,-43]},
    {name:'Corner Market',kind:'market',door:[137,122]},
    {name:'Westside Garage',kind:'garage',door:[-137,122]},
    {name:'Bayview Diner',kind:'diner',door:[82,-98]},
    {name:'Pixel Palace',kind:'arcade',door:[-82,98]}
  ];
  function v13TextSprite(text,bg='#101820',fg='#ffffff',scale=3.2){
    const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);x.fillStyle=fg;x.font='800 43px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(text,256,64);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));sp.scale.set(scale,scale*.25,1);return sp;
  }
  function v13MakeInterior(def,i){
    const bx=780+i*42,bz=-40+(i%2)*52;const g=new THREE.Group();g.position.set(bx,0,bz);v13InteriorRoot.add(g);
    const floor=v13Shadow(new THREE.Mesh(new THREE.BoxGeometry(30,.16,24),new THREE.MeshStandardMaterial({color:def.kind==='bank'?0x9b978d:0x5b5248,roughness:.82})));floor.position.y=.08;g.add(floor);
    const wallMat=new THREE.MeshStandardMaterial({color:def.kind==='bank'?0xd5d1c7:0xc7b69c,roughness:.9});
    const walls=[[0,2.5,-12,30,5,.3],[-15,2.5,0,.3,5,24],[15,2.5,0,.3,5,24]];
    for(const [x,y,z,w,h,d] of walls){const m=v13Shadow(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wallMat));m.position.set(x,y,z);g.add(m);}
    const counter=v13Shadow(new THREE.Mesh(new THREE.BoxGeometry(8,1.05,1.4),def.kind==='bank'?v13Concrete:v13Bark));counter.position.set(0,.53,-5.2);g.add(counter);
    const sign=v13TextSprite(def.name,def.kind==='bank'?'#203850':'#4f2c20','#f5eee1',6.2);sign.position.set(0,3.7,-11.65);g.add(sign);
    if(def.kind==='coffee'||def.kind==='diner'){
      for(let t=-1;t<=1;t++){const table=v13Shadow(new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.05,.12,18),v13Bark));table.position.set(t*5,.8,2.8);g.add(table);const stem=v13Shadow(new THREE.Mesh(new THREE.CylinderGeometry(.10,.14,.75,10),v13Metal));stem.position.set(t*5,.4,2.8);g.add(stem);}
    }else if(def.kind==='bank'){
      const vault=v13Shadow(new THREE.Mesh(new THREE.BoxGeometry(5.5,3.8,.55),v13Metal));vault.position.set(0,1.9,-10.9);g.add(vault);
      const wheel=new THREE.Mesh(new THREE.TorusGeometry(.7,.09,10,24),new THREE.MeshStandardMaterial({color:0xa9aeb3,metalness:.9,roughness:.2}));wheel.position.set(0,1.9,-10.58);g.add(wheel);
    }else{
      for(let s=-2;s<=2;s++){const shelf=v13Shadow(new THREE.Mesh(new THREE.BoxGeometry(2.2,1.7,.8),v13Metal));shelf.position.set(s*4,.86,3.2);g.add(shelf);}
    }
    const entrance=new THREE.Vector3(def.door[0],0,def.door[1]);
    const marker=new THREE.Mesh(new THREE.CylinderGeometry(.75,.75,.06,24),new THREE.MeshStandardMaterial({color:0x59b9ff,emissive:0x2a83b8,emissiveIntensity:1.8,transparent:true,opacity:.72}));marker.position.set(entrance.x,.06,entrance.z);scene.add(marker);
    const label=v13TextSprite(def.name,'#102231','#dff5ff',3.8);label.position.set(entrance.x,2.6,entrance.z);scene.add(label);
    const loc={...def,index:i,base:new THREE.Vector3(bx,0,bz),entrance,marker,label,insideCounter:new THREE.Vector3(bx,0,bz-3.8),insideExit:new THREE.Vector3(bx,0,bz+9.4),vault:new THREE.Vector3(bx,0,bz-9.2)};v13Locations.push(loc);return loc;
  }
  v13InteriorDefs.forEach(v13MakeInterior);

  // ---------- Heist storyline (fictional gameplay only) ----------
  const v13Heist={active:false,stage:0,bank:null,safe:new THREE.Vector3(355,0,-330),reward:3500};
  const v13SafeMarker=new THREE.Mesh(new THREE.TorusGeometry(3.0,.24,12,32),new THREE.MeshStandardMaterial({color:0xffd23f,emissive:0xd59f12,emissiveIntensity:1.8}));v13SafeMarker.rotation.x=Math.PI/2;v13SafeMarker.position.copy(v13Heist.safe).setY(.18);v13SafeMarker.visible=false;scene.add(v13SafeMarker);
  function v13StartHeist(bank){
    if(v13Heist.active)return;v13Heist.active=true;v13Heist.stage=1;v13Heist.bank=bank;document.querySelector('#objective').textContent='Storyline: Bayview Bank Job — reach the glowing vault marker inside.';showToast('BANK JOB STARTED • Reach the vault marker');
  }
  function v13AdvanceHeist(){
    if(!v13Heist.active)return;
    if(v13Heist.stage===1){v13Heist.stage=2;wanted=Math.max(wanted,3);wantedTimer=45;v13SafeMarker.visible=true;document.querySelector('#objective').textContent='Storyline: Bank Job — leave the bank and reach the yellow escape zone.';showToast('PACKAGE SECURED • Get clear of the bank');}
    else if(v13Heist.stage===2){v13Heist.stage=3;document.querySelector('#objective').textContent='Storyline: Bank Job — lose the wanted level in the escape zone.';showToast('ESCAPE ZONE • Lose the wanted level');}
  }
  function v13FinishHeist(){v13Heist.active=false;v13Heist.stage=0;v13SafeMarker.visible=false;cash+=v13Heist.reward;wanted=Math.min(wanted,.5);document.querySelector('#objective').textContent=`Bank Job complete • +$${v13Heist.reward.toLocaleString()}`;showToast(`BANK JOB COMPLETE • +$${v13Heist.reward.toLocaleString()}`);updateHUD();}

  function v13TryInteriorInteraction(){
    if(currentVehicle)return false;
    if(!v13ActiveInterior){
      for(const loc of v13Locations){if(player.position.distanceTo(loc.entrance)<3.2){v13ReturnPosition.copy(player.position);v13ActiveInterior=loc;player.position.copy(loc.base).add(new THREE.Vector3(0,0,7.5));playerVelocity.set(0,0,0);showToast(`Entered ${loc.name}`);return true;}}
      return false;
    }
    const loc=v13ActiveInterior;
    if(player.position.distanceTo(loc.insideExit)<3.2){player.position.copy(v13ReturnPosition).add(new THREE.Vector3(0,0,1.2));v13ActiveInterior=null;showToast(`Left ${loc.name}`);return true;}
    if(player.position.distanceTo(loc.insideCounter)<3.3){
      if(loc.kind==='coffee'||loc.kind==='diner'){if(cash>=8){cash-=8;stamina=100;health=Math.min(100,health+8);showToast(`${loc.name} • Coffee + stamina`);updateHUD();}else showToast('Not enough cash');return true;}
      if(loc.kind==='bank'){if(!v13Heist.active)v13StartHeist(loc);else showToast('Bank services unavailable during the active job');return true;}
      if(loc.kind==='market'){if(cash>=35){cash-=35;health=Math.min(100,health+20);showToast('Corner Market • Supplies purchased');updateHUD();}return true;}
      if(loc.kind==='garage'){if(currentVehicle)currentVehicle.userData.health=1000;showToast('Garage service menu • Park a vehicle outside for service');return true;}
      if(loc.kind==='arcade'){cash=Math.max(0,cash-5);showToast('Pixel Palace • High score +1');updateHUD();return true;}
    }
    if(loc.kind==='bank'&&v13Heist.active&&v13Heist.stage===1&&player.position.distanceTo(loc.vault)<3.4){v13AdvanceHeist();return true;}
    return false;
  }

  // ---------- Random street occurrences ----------
  const v13Occurrence={active:false,type:null,marker:null,props:[],nextAt:performance.now()+18000};
  const v13OccurrenceTypes=[
    {id:'stalled',label:'STALLED CAR',reward:180,msg:'A driver needs roadside help nearby.'},
    {id:'wallet',label:'LOST WALLET',reward:240,msg:'A lost wallet was reported nearby.'},
    {id:'performer',label:'STREET PERFORMER',reward:0,msg:'A crowd is gathering around a street performer.'},
    {id:'argument',label:'STREET ARGUMENT',reward:120,msg:'A heated argument is drawing attention.'}
  ];
  function v13ClearOccurrence(){if(v13Occurrence.marker)v13Occurrence.marker.removeFromParent();for(const p of v13Occurrence.props)p.removeFromParent();v13Occurrence.active=false;v13Occurrence.marker=null;v13Occurrence.props=[];v13Occurrence.nextAt=performance.now()+28000+Math.random()*36000;}
  function v13SpawnOccurrence(){
    if(v13Occurrence.active||v13ActiveInterior)return;const t=currentVehicle||player;let pos=null;
    for(let k=0;k<20;k++){const a=Math.random()*Math.PI*2,r=28+Math.random()*34,x=t.position.x+Math.cos(a)*r,z=t.position.z+Math.sin(a)*r;if(Math.abs(x)<480&&Math.abs(z)<480&&!pointBlocked(x,z,2.2)){pos=new THREE.Vector3(x,0,z);break;}}
    if(!pos)return;const type=v13OccurrenceTypes[Math.floor(Math.random()*v13OccurrenceTypes.length)];
    const marker=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,.08,24),new THREE.MeshStandardMaterial({color:0x65d1ff,emissive:0x2488aa,emissiveIntensity:2,transparent:true,opacity:.78}));marker.position.copy(pos).setY(.08);scene.add(marker);
    const props=[];
    if(type.id==='stalled'){const car=makeCar(pos.x+2,pos.z,0x7c3540);car.userData.aiTraffic=false;car.userData.velocity.set(0,0,0);props.push(car);}
    if(type.id==='wallet'){const wallet=v13Shadow(new THREE.Mesh(new THREE.BoxGeometry(.32,.06,.24),new THREE.MeshStandardMaterial({color:0x3d2518,roughness:.9})));wallet.position.copy(pos).setY(.12);scene.add(wallet);props.push(wallet);}
    if(type.id==='performer'){const stage=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,.18,20),v13Concrete);stage.position.copy(pos).setY(.09);scene.add(stage);props.push(stage);}
    if(type.id==='argument'){
      const nearby=npcs.filter(n=>n.position.distanceTo(pos)<35).slice(0,2);if(nearby.length===2){nearby[0].position.copy(pos).add(new THREE.Vector3(-1,0,0));nearby[1].position.copy(pos).add(new THREE.Vector3(1,0,0));nearby[0].userData.ai.socialCooldown=0;nearby[1].userData.ai.socialCooldown=0;}
    }
    v13Occurrence.active=true;v13Occurrence.type=type;v13Occurrence.marker=marker;v13Occurrence.props=props;showToast(`RANDOM EVENT • ${type.msg}`);
  }
  function v13TryOccurrenceInteraction(){
    if(!v13Occurrence.active||currentVehicle)return false;const d=player.position.distanceTo(v13Occurrence.marker.position);if(d>4)return false;const type=v13Occurrence.type;
    if(type.id==='performer'){showToast('You stopped to watch the performer.');}
    else{cash+=type.reward;showToast(`${type.label} RESOLVED • +$${type.reward}`);updateHUD();}
    v13ClearOccurrence();return true;
  }

  // ---------- Better aiming ----------
  const v13Crosshair=document.querySelector('#crosshair');
  Object.assign(v13Crosshair.style,{width:'18px',height:'18px',margin:'-9px 0 0 -9px',border:'2px solid rgba(255,255,255,.92)',boxShadow:'0 0 0 1px rgba(0,0,0,.85),0 0 10px rgba(255,255,255,.28)',transition:'width .08s,height .08s,margin .08s,border-color .08s'});
  function v13AimSpread(){const moving=Math.hypot(playerVelocity.x,playerVelocity.z);return actionDown('aim')?(0.0009+moving*.00018):(0.0055+moving*.00055);}
  const v13BaseShoot=shoot;
  shoot=function(){
    const now=performance.now();if(currentVehicle)return;if(reloading||now-lastShot<205||ammo<=0){if(ammo<=0)reload();return;}
    lastShot=now;ammo--;wanted=Math.min(5,Math.max(1,wanted+.22));wantedTimer=18;worldAlert.gunshotUntil=now+6500;worldAlert.gunshotPos.copy(player.position);
    for(const n of npcs){const ai=n.userData.ai;if(ai&&n.position.distanceTo(player.position)<70&&Math.random()<.11){wanted=Math.max(wanted,.8);wantedTimer=18;}}
    gunSound();flashWeapon(player);
    const camDir=new THREE.Vector3();camera.getWorldDirection(camDir);const spread=v13AimSpread();camDir.x+=(Math.random()-.5)*spread;camDir.y+=(Math.random()-.5)*spread;camDir.z+=(Math.random()-.5)*spread;camDir.normalize();
    const cameraOrigin=camera.position.clone();raycaster.set(cameraOrigin,camDir);raycaster.far=220;const hit=raycaster.intersectObjects([...npcs,...police,...cameraObstacles],true);let aimPoint=cameraOrigin.clone().addScaledVector(camDir,170);
    if(hit.length)aimPoint.copy(hit[0].point);
    let muzzlePos=player.position.clone().add(new THREE.Vector3(0,1.35,0));try{player.userData.weaponGroup?.userData?.muzzle?.getWorldPosition(muzzlePos);}catch(e){}
    const bulletDir=aimPoint.clone().sub(muzzlePos).normalize();raycaster.set(muzzlePos,bulletDir);raycaster.far=220;const finalHit=raycaster.intersectObjects([...npcs,...police,...cameraObstacles],true);let end=muzzlePos.clone().addScaledVector(bulletDir,170);
    if(finalHit.length){end.copy(finalHit[0].point);const root=findCharacterRoot(finalHit[0].object);if(root){characterImpact(root,bulletDir.clone().multiplyScalar(5.0).add(new THREE.Vector3(0,.6,0)),'shot');const rai=root.userData.ai;if(rai){rai.relationship-=5;rai.combatHealth=Math.max(0,rai.combatHealth-36);if(rai.personality===0&&rai.combatHealth>20)setCitizenHostile(root,player,9000);else{rai.panicUntil=now+8500;rai.state='flee';}}v13Crosshair.style.borderColor='#74ff9a';setTimeout(()=>v13Crosshair.style.borderColor='rgba(255,255,255,.92)',90);}}
    makeTracer(muzzlePos,end);camera.userData.kick=(camera.userData.kick||0)+(actionDown('aim')?.014:.024);updateHUD();
  };
  const v13BaseUpdatePlayer=updatePlayer;
  updatePlayer=function(dt){v13BaseUpdatePlayer(dt);if(actionDown('aim')&&!currentVehicle){const desired=yaw;let diff=((desired-player.rotation.y+Math.PI)%(Math.PI*2))-Math.PI;player.rotation.y+=diff*Math.min(1,dt*18);}};
  const v13BaseUpdateCamera=updateCamera;
  updateCamera=function(dt){v13BaseUpdateCamera(dt);const aiming=actionDown('aim')&&!currentVehicle&&gamePhase==='playing'&&!paused;const target=aiming?55:(currentVehicle?70+Math.min(12,Math.abs(currentVehicle.userData.speed||0)*.24):70);camera.fov=THREE.MathUtils.damp(camera.fov,target,10,dt);camera.updateProjectionMatrix();const moving=Math.hypot(playerVelocity.x,playerVelocity.z);const sz=aiming?14:Math.min(28,18+moving*1.1);v13Crosshair.style.width=sz+'px';v13Crosshair.style.height=sz+'px';v13Crosshair.style.margin=`${-sz/2}px 0 0 ${-sz/2}px`;};

  // ---------- More grounded player vehicle physics ----------
  updateCar=function(dt){
    const v=currentVehicle,u=v.userData,def=characterDefs[activeIndex];
    const throttle=(actionDown('forward')?1:0)-(actionDown('backward')?1:0)-touchState.my;const steerInput=(actionDown('right')?1:0)-(actionDown('left')?1:0)+touchState.mx;const handbrake=actionDown('jump');
    let forward=new THREE.Vector3(Math.sin(v.rotation.y),0,Math.cos(v.rotation.y)),right=new THREE.Vector3(Math.cos(v.rotation.y),0,-Math.sin(v.rotation.y));let longitudinal=u.velocity.dot(forward),lateral=u.velocity.dot(right);const speed=u.velocity.length(),absLong=Math.abs(longitudinal);
    const directionMismatch=(throttle>0&&longitudinal<-.8)||(throttle<0&&longitudinal>.8);const engineFade=1-Math.min(.92,absLong/(u.maxSpeed*1.02));let drive=directionMismatch?u.brake*1.25:u.accel*def.drive*engineFade;
    if(throttle<0&&!directionMismatch)drive*=.58;u.velocity.addScaledVector(forward,throttle*drive*dt);
    const rolling=throttle?0.12:0.72,aero=.00195*speed;u.velocity.multiplyScalar(Math.exp(-(rolling+aero)*dt));
    const speedNorm=Math.min(1,absLong/38),steerLimit=THREE.MathUtils.lerp(.62,.23,speedNorm);u.steer=THREE.MathUtils.damp(u.steer,steerInput*steerLimit,13,dt);
    const slip=Math.atan2(lateral,Math.abs(longitudinal)+1.2);u.driftAngle=THREE.MathUtils.damp(u.driftAngle,slip,10,dt);const wet=weatherBlend||0;const baseGrip=THREE.MathUtils.lerp(10.8,7.4,wet);const grip=handbrake&&absLong>5?THREE.MathUtils.lerp(1.25,.9,wet):baseGrip;u.velocity.addScaledVector(right,-lateral*(1-Math.exp(-grip*dt)));
    const yawTarget=Math.tan(u.steer)*(longitudinal/u.wheelBase);const rearStep=handbrake&&absLong>6?steerInput*Math.min(1.15,absLong/18):0;const selfAlign=-slip*Math.min(1.1,absLong/18)*.38;u.yawVelocity=THREE.MathUtils.damp(u.yawVelocity,yawTarget+rearStep+selfAlign,handbrake?5.0:10.5,dt);v.rotation.y+=u.yawVelocity*dt;
    forward.set(Math.sin(v.rotation.y),0,Math.cos(v.rotation.y));right.set(Math.cos(v.rotation.y),0,-Math.sin(v.rotation.y));if(u.velocity.length()>u.maxSpeed)u.velocity.setLength(u.maxSpeed);
    v.position.addScaledVector(u.velocity,dt);v.position.y=0;vehicleVsCharacters(v,dt);const impacted=resolveCircleVsBuildings(v.position,1.18);if(impacted&&u.impactCooldown<=0){u.velocity.multiplyScalar(-.10);u.yawVelocity*=-.16;u.health=Math.max(0,u.health-Math.min(80,speed*1.7));u.impactCooldown=.30;}u.impactCooldown=Math.max(0,u.impactCooldown-dt);
    longitudinal=u.velocity.dot(forward);lateral=u.velocity.dot(right);u.speed=longitudinal;const driftDeg=Math.abs(Math.atan2(lateral,Math.abs(longitudinal)+.1)*180/Math.PI),drifting=driftDeg>10&&Math.abs(longitudinal)>7;if(drifting){u.driftScore+=driftDeg*dt*2.0;spawnDriftSmoke(v)}else u.driftScore=Math.max(0,u.driftScore-dt*20);
    const driftHud=document.querySelector('#driftHUD');driftHud.style.display=drifting?'block':'none';driftHud.textContent=`DRIFT ${Math.round(driftDeg)}°`;
    const braking=directionMismatch||handbrake,roll=-steerInput*Math.min(1,absLong/20)*.085+Math.sign(lateral)*Math.min(.055,Math.abs(lateral)*.0065),pitch=(braking?.045:-throttle*.032)*Math.min(1,absLong/18);u.visual.rotation.z=THREE.MathUtils.damp(u.visual.rotation.z,roll,7.5,dt);u.visual.rotation.x=THREE.MathUtils.damp(u.visual.rotation.x,pitch,7,dt);u.visual.position.y=THREE.MathUtils.damp(u.visual.position.y,impacted?.07:Math.sin(performance.now()*.018)*Math.min(.012,speed*.00045),12,dt);
    u.wheels.forEach(w=>{w.tire.rotation.x+=longitudinal*dt*2.25;if(w.front)w.pivot.rotation.y=u.steer;const compression=(w.front?-pitch:roll*Math.sign(w.side))*.16;w.pivot.position.y=.46+compression;});u.brakeLights.forEach(l=>l.material.emissiveIntensity=braking?2.6:.8);
  };

  // ---------- Interactions / update hooks ----------
  const v13BaseInteract=interact;
  interact=function(){if(v13TryInteriorInteraction())return;if(v13TryOccurrenceInteraction())return;v13BaseInteract();};
  const v13BaseUpdateWorld=updateWorld;
  updateWorld=function(dt){
    v13BaseUpdateWorld(dt);v13UpdateSignals();
    const now=performance.now();if(now>v13Occurrence.nextAt&&!v13Occurrence.active)v13SpawnOccurrence();
    if(v13Occurrence.active){v13Occurrence.marker.rotation.y+=dt*1.4;v13Occurrence.marker.position.y=.08+Math.sin(now*.003)*.06;}
    if(v13Heist.active&&v13Heist.stage===2&&!v13ActiveInterior&&(currentVehicle||player).position.distanceTo(v13Heist.safe)<7){v13AdvanceHeist();}
    if(v13Heist.active&&v13Heist.stage===3&&(currentVehicle||player).position.distanceTo(v13Heist.safe)<12&&wanted<1)v13FinishHeist();
    if(v13ActiveInterior){document.querySelector('#area').textContent=v13ActiveInterior.name;}
    // Window glow responds to the 10-minute day/night system.
    const p=(worldElapsed%DAY_LENGTH_SECONDS)/DAY_LENGTH_SECONDS,night=Math.max(0,1-Math.max(0,Math.sin(p*Math.PI*2-Math.PI/2)));
    v13WindowMat.emissiveIntensity=.18+night*1.5;
  };

  // Make the interaction prompt recognize storefronts and random events.
  const v13BaseSocial=updateSocialInteractions;
  updateSocialInteractions=function(dt){
    v13BaseSocial(dt);if(currentVehicle||paused)return;const ih=document.querySelector('#interactionHUD');
    if(v13ActiveInterior){const loc=v13ActiveInterior;if(player.position.distanceTo(loc.insideExit)<3.4)ih.textContent=`${keyPretty(binds.interact)} • EXIT ${loc.name.toUpperCase()}`;else if(player.position.distanceTo(loc.insideCounter)<3.5||loc.kind==='bank'&&player.position.distanceTo(loc.vault)<3.5)ih.textContent=`${keyPretty(binds.interact)} • INTERACT`;return;}
    for(const loc of v13Locations)if(player.position.distanceTo(loc.entrance)<3.5){ih.style.display='block';ih.textContent=`${keyPretty(binds.interact)} • ENTER ${loc.name.toUpperCase()}`;return;}
    if(v13Occurrence.active&&player.position.distanceTo(v13Occurrence.marker.position)<4.2){ih.style.display='block';ih.textContent=`${keyPretty(binds.interact)} • ${v13Occurrence.type.label}`;}
  };

  showToast('v0.13 loaded • population, traffic, interiors, aiming & city events upgraded');
})();
