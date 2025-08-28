//  Example:
//
//  ScrollHero3D.loadDependencies().then(()=>{
//    window.hero=new ScrollHero3D(my_canvas_element, "path_to_my_model.glb");
//  });
//
//  ScrollHero3D.scene : <Three.Scene>
//  ScrollHero3D.camera : <Three.PerspectiveCamera>
//  ScrollHero3D.light : <Object> contains references to all the lights in the scene.
//  ScrollHero3D.mouseSensitivity : <Float> multiplier for the mosemove effect


class ScrollHero3D{
  canvas;
  scene;
  camera;
  light={};
  mouseSensitivity = 4.8;

  #renderer;
  #model;
  #gltfScene;
  #animationMixer;
  #currentRotationY = 0;
  #currentRotationX = 0;


  constructor(canvas, path, debug=null){
    this.canvas=canvas;
    this.debug=debug?debug:((a,b)=>{console.log(a);});
    this.#initHero(path);
  }

  static debug(a,b){
    console.log(a);
  }

  static async loadDependencies() {
    this.debug('Crystal Hero Complete initializing...', 'info');

    let importMap = document.createElement("script");
    importMap.type = "importMap";
    importMap.text = `
      {"imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js",
        "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/"
      }}
    `;
    document.head.appendChild(importMap);

    // Load Three.js
    const threeLoaded = await this.#loadThreeJS();
    if (!threeLoaded) {
        this.debug('Failed to load Three.js - cannot continue', 'error');
        document.getElementById('model-status').innerHTML = '❌ Three.js Error';
        return;
    }

    // Load GLTFLoader
    const gltfLoaded = await this.#loadGLTFLoader();
    if (!gltfLoaded) {
        this.debug('GLTFLoader not available - will use fallback', 'warning');
    }
  }

  static #loadScript(src, callback, isModule=false) {
      return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          if(isModule){script.type = "module";}
          script.src = src;
          script.onload = () => {
              this.debug(`Loaded: ${src}`, 'success');
              resolve();
          };
          script.onerror = () => {
              this.debug(`Failed to load: ${src}`, 'error');
              reject();
          };
          document.head.appendChild(script);
      });
  }

  static async #loadThreeJS() {
      this.debug('Starting Three.js loading...', 'info');

      const THREE_CDNS = [
        'https://unpkg.com/three@0.158.0/build/three.min.js'
        ,'https://cdnjs.cloudflare.com/ajax/libs/three.js/r158/three.min.js'
        ,'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js'
        //,'lib/three.min.js'
      ];

      for (let i = 0; i < THREE_CDNS.length; i++) {
          try {
              await this.#loadScript(THREE_CDNS[i]);
              if (typeof THREE !== 'undefined') {
                  this.debug(`Three.js loaded successfully from ${THREE_CDNS[i]}`, 'success');
                  return true;
              }
          } catch (error) {
              this.debug(`CDN ${i + 1} failed, trying next...`, 'warning');
          }
      }

      this.debug('All Three.js CDNs failed', 'error');
      return false;
  }

  static async #loadGLTFLoader() {
      this.debug('Loading GLTFLoader...', 'info');

      const GLTF_CDNS = [
        'https://unpkg.com/three@0.158.0/examples/jsm/loaders/GLTFLoader.js'
        ,'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js'
        //,'lib/GLTFLoader.js'
      ];

      for (let i = 0; i < GLTF_CDNS.length; i++) {
          try {
              await this.#loadScript(GLTF_CDNS[i], null, true);

              let getGLTFLoader = document.createElement("script");
              getGLTFLoader.type = "module";
              getGLTFLoader.text = "import { GLTFLoader } from '"+GLTF_CDNS[i]+"'; window.THREE.GLTFLoader = GLTFLoader; ";
              document.head.appendChild(getGLTFLoader);

              if (typeof THREE.GLTFLoader !== 'undefined') {
                  this.debug(`GLTFLoader loaded successfully from ${GLTF_CDNS[i]}`, 'success');
                  return true;
              }
          } catch (error) {
              this.debug(`GLTF CDN ${i + 1} failed, trying next...`, 'warning');
          }
      }

      this.debug('All GLTFLoader CDNs failed', 'error');
      return false;
  }

  #initHero(path){
    this.debug('Initializing Crystal Hero...', 'info');

    // Check WebGL support
    if (!window.WebGLRenderingContext) {
        this.debug('WebGL not supported', 'error');
        document.getElementById('model-status').innerHTML = '❌ WebGL Not Supported';
        return;
    }

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;
    this.camera.position.y = 1;

    // Renderer
    this.#renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true, // Transparent background
        antialias: true
    });
    this.#renderer.setSize(window.innerWidth, window.innerHeight);
    this.#renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance

    // Enable transparency and proper material rendering
    this.#renderer.outputEncoding = THREE.sRGBEncoding;
    this.#renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.#renderer.toneMappingExposure = 1.2;

    // Enhanced lighting setup for crystal materials
    this.light = {};
    this.light.ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.light.ambientLight.range = {"intensity": [0.6, 9.6]};
    this.scene.add(this.light.ambientLight);

    this.light.directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
    this.light.directionalLight1.position.set(5, 5, 5);
    this.light.directionalLight1.range = {"intensity": [1.0, 16.0]};
    this.scene.add(this.light.directionalLight1);

    this.light.directionalLight2 = new THREE.DirectionalLight(0xa0c4ff, 0.5);
    this.light.directionalLight2.position.set(-5, -5, -5);
    this.light.directionalLight2.range = {"intensity": [0.5, 8.0]};
    this.scene.add(this.light.directionalLight2);

    // Point light for internal illumination
    this.light.pointLight = new THREE.PointLight(0xffffff, 1, 100);
    this.light.pointLight.position.set(0, 0, 0);
    this.light.pointLight.range = {"intensity": [0.5, 8.0]};
    this.scene.add(this.light.pointLight);

    // Environment map for reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.#renderer);
    const envTexture = pmremGenerator.fromScene(this.#createEnvironment()).texture;
    this.scene.environment = envTexture;
    pmremGenerator.dispose();

    this.debug('Three.js scene initialized successfully', 'success');

    // Bind animation function to scroll event
    var self=this;
    document.addEventListener("scroll", (event)=>{
      requestAnimationFrame(()=>self.#animate(self));
    });

    // Load the GLB model
    setTimeout(() => {
        this.#loadHostedGLB(path);
        this.#setEventListeners();
    }, 500);
  }

  static lerp(startValue, endValue, k){
    let diff = endValue - startValue;
    let prog = diff * k;
    return startValue + prog;
  }

  #createEnvironment(){
      const envScene = new THREE.Scene();
      envScene.background = new THREE.Color(0x1a1a2e);
      return envScene;
  }

  #loadHostedGLB(path) {
      var self=this;
      //const modelStatus = document.getElementById('model-status');
      //const loading = document.getElementById('loading');

      this.debug('Starting GLB load process...', 'info');
      //loading.style.display = 'block';
      //modelStatus.textContent = 'Loading GLB...';

      // Check if GLTFLoader is available
      if (typeof THREE.GLTFLoader === 'undefined') {
          this.debug('GLTFLoader not available, using fallback', 'warning');
          //modelStatus.innerHTML = '⚠️ Using Fallback';
          //loading.style.display = 'none';
          this.#createDefaultCrystal();
          return;
      }

      const loader = new THREE.GLTFLoader();

      // Load your hosted GLB file
      this.debug(`Attempting to load: ${path}`, 'info');

      const loadTimeout = setTimeout(() => {
          this.debug('GLB loading timeout, using fallback', 'warning');
          //loading.style.display = 'none';
          //modelStatus.innerHTML = '⏰ Load Timeout';
          this.#createDefaultCrystal();
      }, 15000); // 15 second timeout

      loader.load(
          path,
          function(gltf) {
              clearTimeout(loadTimeout);
              self.debug('GLB model loaded successfully', 'success');

              // Success callback
              if (self.#model) {
                  self.scene.remove(self.#model);
              }

              self.#model = gltf.scene;

              // Enhance materials for better crystal effect
              self.#model.traverse((child) => {
                  if (child.isMesh) {
                      const material = child.material;
                      if (material) {
                          // Enhance transparency and refraction
                          material.transparent = true;
                          material.opacity = Math.max(material.opacity || 0.8, 0.3);

                          // Check if material has these properties before setting them
                          if (material.roughness !== undefined) {
                              material.roughness = Math.min(material.roughness || 0.1, 0.1);
                          }
                          if (material.metalness !== undefined) {
                              material.metalness = material.metalness || 0.1;
                          }
                          if (material.envMapIntensity !== undefined) {
                              material.envMapIntensity = 2.0;
                          }

                          // If it's a physical material, enhance transmission
                          if (material.type === 'MeshPhysicalMaterial' || material.isMeshPhysicalMaterial) {
                              material.transmission = 0.9;
                              material.thickness = 0.5;
                              material.ior = 1.5;
                          }
                      }
                  }
              });

              // Center and scale the model
              const box = new THREE.Box3().setFromObject(self.#model);
              const center = box.getCenter(new THREE.Vector3());
              const size = box.getSize(new THREE.Vector3());

              self.#model.position.sub(center);

              // Scale to appropriate size
              const maxDim = Math.max(size.x, size.y, size.z);
              const scale = 3 / maxDim;
              self.#model.scale.setScalar(scale);

              self.scene.add(self.#model);
              ///loading.style.display = 'none';
              //modelStatus.innerHTML = '✅ GLB Loaded';
              self.#animate()

              self.debug(`Model added to scene - ${gltf.scene.children.length} children`, 'success');

              self.#gltfScene = gltf;
              self.#animationMixer = new THREE.AnimationMixer(self.#model);
              const scrollAction = self.#animationMixer.clipAction(gltf.animations[0]);
              scrollAction.play();
              scrollAction.time = 0;
              self.#animationMixer.update(0);
          },
          function(progress) {
              // Progress callback
              const percent = Math.round((progress.loaded / progress.total) * 100);
              //modelStatus.textContent = `Loading: ${percent}%`;
              self.debug(`Loading progress: ${percent}%`, 'info');
          },
          function(error) {
              // Error callback
              clearTimeout(loadTimeout);
              self.debug(`Error loading GLB: ${error.message}`, 'error');
              //loading.style.display = 'none';
              //modelStatus.innerHTML = '❌ GLB Not Found';

              // Fall back to default crystal
              self.#createDefaultCrystal();
          }
      );
  }

  #updateObeliskRotation() {
      if (!this.#model) return;

      try {
          const scrollPercent = window.pageYOffset / (document.body.scrollHeight - window.innerHeight);
          // const targetRotationY = scrollPercent * Math.PI * 4; // 2 full rotations
          // const targetRotationX = Math.sin(scrollPercent * Math.PI * 4) * 0.2; // Gentle oscillation

          // Smooth rotation interpolation
          // currentRotationY += (targetRotationY - currentRotationY) * 0.1;
          // currentRotationX += (targetRotationX - currentRotationX) * 0.1;
          //
          // obeliskModel.rotation.y = currentRotationY;
          // obeliskModel.rotation.x = currentRotationX;

          // Interpolate lighting envMapIntensity
          for(let lightName in this.light){
            let intensityRange = this.light[lightName].range.intensity;
            this.light[lightName].intensity = ScrollHero3D.lerp(intensityRange[0], intensityRange[1], scrollPercent);
          }

          // Advance animation
          const scrollAction = this.#animationMixer.clipAction(this.#gltfScene.animations[0]);
          scrollAction.time = ScrollHero3D.lerp(0, scrollAction._clip.duration, scrollPercent);
          this.#animationMixer.update(0);
      } catch (error) {
          this.debug(`Error updating rotation: ${error.message}`, 'error');
      }
  }

  #animate() {
      this.#updateObeliskRotation();

      try {
          if (this.#renderer && this.scene && this.camera) {
              this.#renderer.render(this.scene, this.camera);
          }
      } catch (error) {
          this.debug(`Error in render loop: ${error.message}`, 'error');
      }
  }

  #createDefaultCrystal() {
      this.debug('Creating fallback crystal geometry', 'info');

      const verts = new Float32Array([
        0,2.5,0,
        -.4,1.5,.4,
        .4,1.5,.4,
        .4,1.5,-.4,
        -.4,1.5,-.4,
        -.5,-5,.5,
        .5,-5,.5,
        .5,-5,-.5,
        -.5,-5,-.5
      ]);
      const faces = [
        2,1,0,
        3,2,0,
        4,3,0,
        1,4,0,
        1,2,6,
        2,3,7,
        3,4,8,
        4,1,5,
        6,5,1,
        7,6,2,
        8,7,3,
        5,8,4,
        8,5,6,
        8,6,7
      ];
      const geometry = new THREE.BufferGeometry();
      geometry.setIndex(faces);
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      geometry.computeVertexNormals();
      const material = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.3,
          roughness: 0.0,
          metalness: 0.1,
          transmission: 0.9,
          thickness: 0.5,
          ior: 1.5,
          envMapIntensity: 2.0
      });
      material.flatShading = true;

      this.#model = new THREE.Mesh(geometry, material);
      this.scene.add(this.#model);

      // Update status
      //const modelStatus = document.getElementById('model-status');
      //modelStatus.innerHTML = '💎 Default Crystal';
      this.#animate()

      this.debug('Fallback crystal created successfully', 'success');
  }

  #setEventListeners(){
    // Event listeners
    window.addEventListener('resize', () => {
        if (this.camera && this.#renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.#renderer.setSize(window.innerWidth, window.innerHeight);
            this.debug('Window resized', 'info');
        }
    });

    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            requestAnimationFrame(() => {
                this.#updateObeliskRotation();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });

    // Optional: Mouse interaction
    var self = this;
    document.addEventListener('mousemove', (e) => {
        if (!self.#model) return;

        const mouseX = (e.clientX / window.innerWidth - 0.5) * self.mouseSensitivity;
        const mouseY = (e.clientY / window.innerHeight - 0.5) * self.mouseSensitivity;

        self.camera.position.x = mouseX;
        self.camera.position.y = 1 + mouseY;
        self.camera.lookAt(0, 0, 0);

        requestAnimationFrame(()=>self.#animate(self));
    });

    // Keyboard shortcuts
    // document.addEventListener('keydown', (e) => {
    //     if (e.key === 'd' || e.key === 'D') {
    //         toggleDebug();
    //     }
    // });

    this.debug('Crystal Hero Complete ready!', 'success');
  }
}
