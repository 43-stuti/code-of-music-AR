
let pcanvas;
let play1 = 0;
async function activateXR() {
    // Add a canvas element and initialize a WebGL context that is compatible with WebXR.
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    const gl = canvas.getContext("webgl", {xrCompatible: true});
  
    // To be continued in upcoming steps.

    const scene = new THREE.Scene();

    var texture = new THREE.CanvasTexture(pcanvas);

    // The cube will have a different color on each side.
    const materials = [
    new THREE.MeshBasicMaterial({ map: texture}),
    new THREE.MeshBasicMaterial({ map: texture}),
    new THREE.MeshBasicMaterial({ map: texture}),
    new THREE.MeshBasicMaterial({ map: texture}),
    new THREE.MeshBasicMaterial({ map: texture}),
    new THREE.MeshBasicMaterial({ map: texture})
    ];

    // Create the cube and add it to the demo scene.
    //create canvas 
    //add the canvas as texture 
    //attach p5 text to the canvas 
    const cube = new THREE.Mesh(new THREE.BoxBufferGeometry(0.5, 0.5, 0.5), materials);
    cube.position.set(1, 1, 1);
    cube.name = "HAHA"
    scene.add(cube);

    // Set up the WebGLRenderer, which handles rendering to the session's base layer.
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        preserveDrawingBuffer: true,
        canvas: canvas,
        context: gl
    });
    renderer.autoClear = false;
    
    // The API directly updates the camera matrices.
    // Disable matrix auto updates so three.js doesn't attempt
    // to handle the matrices independently.
    const camera = new THREE.PerspectiveCamera();
    camera.matrixAutoUpdate = false;

    // Initialize a WebXR session using "immersive-ar".
    const session = await navigator.xr.requestSession("immersive-ar");
    session.updateRenderState({
    baseLayer: new XRWebGLLayer(session, gl)

    
    });

    // A 'local' reference space has a native origin that is located
    // near the viewer's position at the time the session was created.
    const referenceSpace = await session.requestReferenceSpace('local');

    const onXRFrame = (time, frame) => {
        if(play1 == 0) {
          play1 = 1
        }
        // Queue up the next draw request.
        session.requestAnimationFrame(onXRFrame);
      
        // Bind the graphics framebuffer to the baseLayer's framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer)
      
        // Retrieve the pose of the device.
        // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
        const pose = frame.getViewerPose(referenceSpace);
        if (pose) {
          // In mobile AR, we only have one view.
          const view = pose.views[0];
          
          const viewport = session.renderState.baseLayer.getViewport(view);
          renderer.setSize(viewport.width, viewport.height)
          console.log('VV',view)

          // Use the view's transform matrix and projection matrix to configure the THREE.camera.
          camera.matrix.fromArray(view.transform.matrix)
          camera.projectionMatrix.fromArray(view.projectionMatrix);
          camera.updateMatrixWorld(true);
      
          // Render the scene with THREE.WebGLRenderer.
          renderer.render(scene, camera)
        }
      }
      console.log(scene.children)
      session.requestAnimationFrame(onXRFrame);
  }

function setup() {
  let can = createCanvas(400, 400);
  pcanvas = can.elt;
  console.log("pcan",pcanvas);
  background(255, 204, 100);
  
}
function draw() {
  background(255, 204, 100);
  ellipse(50,50,80,80);
  if(play1 == 1) {
    console.log('START PLAY');
    startPlay();
  }
}

function startPlay() {
  play1 = 2;
  const synth = new Tone.Synth().toDestination();
  const now = Tone.now()
  // trigger the attack immediately
  synth.triggerAttack("C4", now)
  // wait one second before triggering the release
  synth.triggerRelease(now+500)
}