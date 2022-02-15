
let pcanvas;
let play1 = 0;
let x =0;
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
    const cube = new THREE.Mesh(new THREE.BoxBufferGeometry(3,1.5, 0.1), materials);
    cube.position.set(0, -1, -3);
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
        texture.needsUpdate = true;

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

//p5 stuff
const colorPrimary = '#ff3100';
const colorSecondary = '#176beb';
const assetsUrl = './assets';

let midiData, audioDuration;

let showTimeGrid = true;
let showNoteGrid = false;
Midi.fromUrl(`${assetsUrl}/kill_bill.mid`).then(
  (data) => {
    midiData = data;

    const { endOfTrackTicks } = midiData.tracks[0];

    /* Duration of audio sample */
    const sPerTick = 60000 / (111.96 * 96);
    audioDuration = (endOfTrackTicks * sPerTick) / 1000;

    Tone.Transport.loop = true;
    Tone.Transport.loopEnd = audioDuration;

    const audio = new Tone.Player(`${assetsUrl}/whistle_2.mp3`);
    audio.toDestination();
    audio.sync().start(0);
  }
);
function setup() {
  let can = createCanvas(400, 400);
  pcanvas = can.elt;
  //background(255, 204, 100);
  
}
function draw() {
  if (!midiData) return;

    const { endOfTrackTicks, notes } = midiData.tracks[0];
    const noteHeight = 30;
    const minNote = 84;
    const numLines = 6;

    background(0,0,0,0.2);
    stroke(0, 50);

    if (showTimeGrid) {
      for (let i = 0; i < width; i += width / numLines) {
        line(i, 0, i, height);
      }
    }

    if (showNoteGrid) {
      for (let i = 0; i < height; i += noteHeight) {
        line(0, i, width, i);
      }
    }
    const currentTime = Tone.Transport.seconds / audioDuration;

    notes.forEach(({ ticks, time, durationTicks, midi }, i) => {
      /* Don't show last note which is used to set the end time */
      if (i === notes.length - 1) return;

      const x = map(ticks, 0, endOfTrackTicks, 0, width);
      const y = height - (midi - minNote) * noteHeight;
      const w = map(durationTicks, 0, endOfTrackTicks, 0, width);

      var c = color(colorPrimary);

      if (currentTime > ticks / endOfTrackTicks) {
        c.setAlpha(255);
      } else {
        c.setAlpha(50);
      }

      fill(c);
      noStroke();
      rect(x, y, w, noteHeight);
    });
    const overlayC = color(colorSecondary);
    const rectWidth = map(currentTime, 0, 1, 0, width);

    overlayC.setAlpha(20);
    fill(overlayC);
    rect(0, 0, rectWidth, height);
    overlayC.setAlpha(100);
    fill(overlayC);
    rect(rectWidth - 2, 0, 4, height);
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