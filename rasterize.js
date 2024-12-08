/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
let defaultEye = vec3.fromValues(0.0,0.0,0.5); // default eye position in world space
let defaultCenter = vec3.fromValues(0.0,0.0,0.0); // default view direction in world space
let defaultUp = vec3.fromValues(0,1,0); // default view up vector
let lightAmbient = vec3.fromValues(1,1,1); // default light ambient emission
let lightDiffuse = vec3.fromValues(1,1,1); // default light diffuse emission
let lightSpecular = vec3.fromValues(1,1,1); // default light specular emission
let lightPosition = vec3.fromValues(-0.5,1.5,-0.5); // default light position
let rotateTheta = Math.PI/50; // how much to rotate models by with each key press

const ALIEN_ROWS = 2;
const ALIENS_PER_ROW = 6;
const ALIEN_SPACING = .2;
const ALIEN_START_X = -1.0;
const ALIEN_START_Y = -.0

const SPACESHIP_START = vec3.fromValues(-.5, -.9, 0.0);

let player = new SpaceshipModel();
let playerBullet = new BulletModel();

let input  = [0,0,0] //Left, Right, Fire (A, D, Fire)

let background = "https://ncsucgclass.github.io/prog4/stars.jpg";

/* webgl and geometry data */
let gl = null; // the all powerful gl object. It's all here folks!
let numTriangleSets = 0; // how many triangle sets in input scene
let vertexBuffers = []; // this contains vertex coordinate lists by set, in triples
let normalBuffers = []; // this contains normal component lists by set, in triples
let textureBuffers = [];
let triSetSizes = []; // this contains the size of each triangle set
let triangleBuffers = []; // lists of indices into vertexBuffers by set, in triples
let viewDelta = .02; // how much to displace view with each key press
let colorMultiplier = 1.0;

/* shader parameter locations */
let vPosAttribLoc; // where to put position for vertex shader
let mMatrixULoc; // where to put model matrix for vertex shader
let pvmMatrixULoc; // where to put project model view matrix for vertex shader
let ambientULoc; // where to put ambient reflecivity for fragment shader
let diffuseULoc; // where to put diffuse reflecivity for fragment shader
let specularULoc; // where to put specular reflecivity for fragment shader
let shininessULoc; // where to put specular exponent for fragment shader
let alphaLoc
let texCoordLoc;
let multiplierLoc;
let sourceBlending;

/* interaction variables */
let Eye = vec3.clone(defaultEye); // eye position in world space
let Center = vec3.clone(defaultCenter); // view direction in world space
let Up = vec3.clone(defaultUp); // view up vector in world space

//Texture buffers
let textures = [];

function translatePlayer(offset) {
    vec3.add(player.translation,player.translation,offset);
    if (playerBullet.fired === false) {
        vec3.add(playerBullet.translation,playerBullet.translation,offset);
    }
} // end translate model

function translateObject(offset, object) {
    vec3.add(object.translation,object.translation,offset);
}

// function rotateModel(axis,direction) {
//     if (handleKeyDown.modelOn != null) {
//         let newRotation = mat4.create();
//
//         mat4.fromRotation(newRotation,direction*rotateTheta,axis); // get a rotation matrix around passed axis
//         vec3.transformMat4(handleKeyDown.modelOn.xAxis,handleKeyDown.modelOn.xAxis,newRotation); // rotate model x axis tip
//         vec3.transformMat4(handleKeyDown.modelOn.yAxis,handleKeyDown.modelOn.yAxis,newRotation); // rotate model y axis tip
//     } // end if there is a highlighted model
// } // end rotate model
// function highlightModel(modelType,whichModel) {
//     if (handleKeyDown.modelOn != null)
//         handleKeyDown.modelOn.on = false;
//     handleKeyDown.whichOn = whichModel;
//     handleKeyDown.modelOn = gameObjects[whichModel];
//     handleKeyDown.modelOn.on = true;
// } // end highlight model

// does stuff when keys are pressed
function handleKeyDown(event) {
    switch (event.code) {
            
        // model transformation
        case "KeyA": // translate left, rotate left with shift
            input[0] = 1;
            break;
        case "KeyD": // translate right, rotate right with shift
            input[1] = 1;
            break;
        case "Space":
            input[2] = 1;
            break;
    } // end switch
} // end handleKeyDown


function handleKeyUp(event) {
    switch (event.code) {

        // model transformation
        case "KeyA": // translate left, rotate left with shift
            input[0] = 0;
            break;
        case "KeyD": // translate right, rotate right with shift
            input[1] = 0;
            break;
        case "Space":
            input[2] = 0;
            break;
    } // end switch
}


let bkgdImage = new Image();
// set up the webGL environment
function setupWebGL() {

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    let imageCanvas = document.getElementById("myImageCanvas"); // create a 2d canvas
    let cw = imageCanvas.width, ch = imageCanvas.height;
      imageContext = imageCanvas.getContext("2d");
      bkgdImage.crossOrigin = "Anonymous";
      bkgdImage.src = background;
      bkgdImage.onload = function(){
          let iw = bkgdImage.width, ih = bkgdImage.height;
          imageContext.drawImage(bkgdImage,0,0,iw,ih,0,0,cw,ch);   
     }

     
    // Get the canvas and context
    let canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl", {premultipliedAlpha: true}); // get a webgl object from it
    
    try {
      if (gl == null) {
        throw "unable to create gl context -- is your browser gl ready?";
      } else {
        gl.clearDepth(1.0); // use max when we clear the depth buffer
        gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      }
    } // end try
    
    catch(e) {
      console.log(e);
    } // end catch
} // end setupWebGL

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel,
    );

    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image,
        );

        // WebGL1 has different requirements for power of 2 images
        // vs. non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            // gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            // Prevents s-coordinate wrapping (repeating).
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            // Prevents t-coordinate wrapping (repeating).
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
    };
    image.crossOrigin = "";
    image.src = url;

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

let gameObjects = [];

function  createObjects() {
    gameObjects = [];

    let currentY = ALIEN_START_Y;
    for (let i = 0; i < ALIEN_ROWS; i++) {
        let currentX = ALIEN_START_X;
        for (let j = 0; j < ALIENS_PER_ROW; j++) {
            let translation = vec3.fromValues(currentX, currentY, 0.0);
            let alien = new AlienModel(translation);
            gameObjects.push(alien);
            currentX += ALIEN_SPACING;
        }
        currentY -= ALIEN_SPACING;
    }
    player.translation = SPACESHIP_START;
    gameObjects.push(player);

    playerBullet.translation = vec3.fromValues(-.5, -.9, 0.0);
    gameObjects.push(playerBullet);
}

// read models in, load them into webgl buffers
function loadModels() {

    // aliens.sort((a, b) => b.material.alpha - a.material.alpha)

    try {
        if (gameObjects == String.null)
            throw "Unable to load triangles file!";
        else {
            let whichSetVert; // index of vertex in current triangle set
            let whichSetTri; // index of triangle in current triangle set
            let vtxToAdd; // vtx coords to add to the coord array
            let normToAdd; // vtx normal to add to the coord array
            let textureToAdd;
            let triToAdd; // tri indices to add to the index array
            let maxCorner = vec3.fromValues(Number.MIN_VALUE,Number.MIN_VALUE,Number.MIN_VALUE); // bbox corner
            let minCorner = vec3.fromValues(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE); // other corner
        
            // process each triangle set to load webgl vertex and triangle buffers
            numTriangleSets = gameObjects.length; // remember how many tri sets
            for (let whichSet=0; whichSet<gameObjects.length; whichSet++) { // for each tri set
                
                // set up hilighting, modeling translation and rotation
                gameObjects[whichSet].center = vec3.fromValues(0,0,0);  // center point of tri set
                gameObjects[whichSet].on = false; // not highlighted
                // gameObjects[whichSet].translation = vec3.fromValues(0,0,0); // no translation
                gameObjects[whichSet].xAxis = vec3.fromValues(1,0,0); // model X axis
                gameObjects[whichSet].yAxis = vec3.fromValues(0,1,0); // model Y axis

                // set up the vertex and normal arrays, define model center and axes
                gameObjects[whichSet].glVertices = []; // flat coord list for webgl
                gameObjects[whichSet].glNormals = []; // flat normal list for webgl
                gameObjects[whichSet].glTextures = [];
                let numVerts = gameObjects[whichSet].vertices.length; // num vertices in tri set
                for (whichSetVert=0; whichSetVert<numVerts; whichSetVert++) { // verts in set
                    vtxToAdd = gameObjects[whichSet].vertices[whichSetVert]; // get vertex to add
                    normToAdd = gameObjects[whichSet].normals[whichSetVert]; // get normal to add
                    textureToAdd = gameObjects[whichSet].uvs[whichSetVert]; //Get uvs to add
                    gameObjects[whichSet].glVertices.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]); // put coords in set coord list
                    gameObjects[whichSet].glNormals.push(normToAdd[0],normToAdd[1],normToAdd[2]); // put normal in set coord list
                    gameObjects[whichSet].glTextures.push(textureToAdd[0], textureToAdd[1]); //Put uvs in set coord list
                    vec3.max(maxCorner,maxCorner,vtxToAdd); // update world bounding box corner maxima
                    vec3.min(minCorner,minCorner,vtxToAdd); // update world bounding box corner minima
                    vec3.add(gameObjects[whichSet].center,gameObjects[whichSet].center,vtxToAdd); // add to ctr sum
                } // end for vertices in set
                vec3.scale(gameObjects[whichSet].center,gameObjects[whichSet].center,1/numVerts); // avg ctr sum

                // send the vertex coords and normals to webGL
                vertexBuffers[whichSet] = gl.createBuffer(); // init empty webgl set vertex coord buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(gameObjects[whichSet].glVertices),gl.STATIC_DRAW); // data in
                normalBuffers[whichSet] = gl.createBuffer(); // init empty webgl set normal component buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(gameObjects[whichSet].glNormals),gl.STATIC_DRAW); // data in
                textureBuffers[whichSet] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffers[whichSet]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gameObjects[whichSet].glTextures),gl.STATIC_DRAW); //pin
            
                // set up the triangle index array, adjusting indices across sets
                gameObjects[whichSet].glTriangles = []; // flat index list for webgl
                triSetSizes[whichSet] = gameObjects[whichSet].triangles.length; // number of tris in this set
                for (whichSetTri=0; whichSetTri<triSetSizes[whichSet]; whichSetTri++) {
                    triToAdd = gameObjects[whichSet].triangles[whichSetTri]; // get tri to add
                    gameObjects[whichSet].glTriangles.push(triToAdd[0],triToAdd[1],triToAdd[2]); // put indices in set list
                } // end for triangles in set

                // send the triangle indices to webGL
                triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(gameObjects[whichSet].glTriangles),gl.STATIC_DRAW); // data in

            } // end for each triangle set
        } // end if triangle file loaded
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end load models

// setup the webGL shaders
function setupShaders() {
    
    // define vertex shader in essl using es6 template strings
    let vShaderCode = `
        attribute vec3 aVertexPosition; // vertex position
        attribute vec3 aVertexNormal; // vertex normal
        attribute vec2 a_texcoord; //UV values.
        
        uniform mat4 umMatrix; // the model matrix
        uniform mat4 upvmMatrix; // the project view model matrix
        
        varying vec3 vWorldPos; // interpolated world position of vertex
        varying vec3 vVertexNormal; // interpolated normal for frag shader
        varying vec2 v_texcoord;

        void main(void) {
            
            // vertex position
            vec4 vWorldPos4 = umMatrix * vec4(aVertexPosition, 1.0);
            vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);
            gl_Position = upvmMatrix * vec4(aVertexPosition, 1.0);

            // vertex normal (assume no non-uniform scale)
            vec4 vWorldNormal4 = umMatrix * vec4(aVertexNormal, 0.0);
            vVertexNormal = normalize(vec3(vWorldNormal4.x,vWorldNormal4.y,vWorldNormal4.z)); 
            
            //Pass the texcoord to the fragment shader
            vec2 altered_texcoord = a_texcoord;
            altered_texcoord.x = 1.0 - altered_texcoord.x;
            v_texcoord = altered_texcoord;
        }
    `;
    
    // define fragment shader in essl using es6 template strings
    let fShaderCode = `
        precision mediump float; // set float to medium precision

        // eye location
        uniform vec3 uEyePosition; // the eye's position in world
        
        // light properties
        uniform vec3 uLightAmbient; // the light's ambient color
        uniform vec3 uLightDiffuse; // the light's diffuse color
        uniform vec3 uLightSpecular; // the light's specular color
        uniform vec3 uLightPosition; // the light's position
        
        // material properties
        uniform vec3 uAmbient; // the ambient reflectivity
        uniform vec3 uDiffuse; // the diffuse reflectivity
        uniform vec3 uSpecular; // the specular reflectivity
        uniform float uShininess; // the specular exponent
        uniform float uAlpha; //The alpha (transparency) component.
        uniform float colorMultiplier;
        
        // geometry properties
        varying vec3 vWorldPos; // world xyz of fragment
        varying vec3 vVertexNormal; // normal of fragment
        
        //Texture properties
        varying vec2 v_texcoord;
        uniform sampler2D uSampler;
            
        void main(void) {
        
            // ambient term
            vec3 ambient = uAmbient*uLightAmbient; 
            
            // diffuse term
            vec3 normal = normalize(vVertexNormal); 
            vec3 light = normalize(uLightPosition - vWorldPos);
            float lambert = max(0.0,dot(normal,light));
            vec3 diffuse = uDiffuse*uLightDiffuse*lambert; // diffuse term
            
            // specular term
            vec3 eye = normalize(uEyePosition - vWorldPos);
            vec3 halfVec = normalize(light+eye);
            float highlight = pow(max(0.0,dot(normal,halfVec)),uShininess);
            vec3 specular = uSpecular*uLightSpecular*highlight; // specular term
            
            // combine to output color
            vec3 colorOut = ambient + diffuse + specular; // no specular yet
            vec4 texColor = texture2D(uSampler, v_texcoord);
            if (texColor.a <= 0.5) {
                discard;
            }
            vec4 finalColor;
            if (colorMultiplier >= .5) {
                finalColor = texColor * vec4(colorOut, uAlpha);
            }
            else {
                finalColor = texColor;
            }
            gl_FragColor = finalColor;
        }
    `;
    
    try {
        let fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        let vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
            
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            let shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                
                // locate and enable vertex attributes
                vPosAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition"); // ptr to vertex pos attrib
                gl.enableVertexAttribArray(vPosAttribLoc); // connect attrib to array
                vNormAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexNormal"); // ptr to vertex normal attrib
                gl.enableVertexAttribArray(vNormAttribLoc); // connect attrib to array
                texCoordLoc = gl.getAttribLocation(shaderProgram, "a_texcoord");
                gl.enableVertexAttribArray(texCoordLoc);

                
                // locate vertex uniforms
                mMatrixULoc = gl.getUniformLocation(shaderProgram, "umMatrix"); // ptr to mmat
                pvmMatrixULoc = gl.getUniformLocation(shaderProgram, "upvmMatrix"); // ptr to pvmmat
                uSampler = gl.getUniformLocation(shaderProgram, "uSampler");

                
                // locate fragment uniforms
                let eyePositionULoc = gl.getUniformLocation(shaderProgram, "uEyePosition"); // ptr to eye position
                let lightAmbientULoc = gl.getUniformLocation(shaderProgram, "uLightAmbient"); // ptr to light ambient
                let lightDiffuseULoc = gl.getUniformLocation(shaderProgram, "uLightDiffuse"); // ptr to light diffuse
                let lightSpecularULoc = gl.getUniformLocation(shaderProgram, "uLightSpecular"); // ptr to light specular
                let lightPositionULoc = gl.getUniformLocation(shaderProgram, "uLightPosition"); // ptr to light position
                ambientULoc = gl.getUniformLocation(shaderProgram, "uAmbient"); // ptr to ambient
                diffuseULoc = gl.getUniformLocation(shaderProgram, "uDiffuse"); // ptr to diffuse
                specularULoc = gl.getUniformLocation(shaderProgram, "uSpecular"); // ptr to specular
                shininessULoc = gl.getUniformLocation(shaderProgram, "uShininess"); // ptr to shininess
                alphaLoc = gl.getUniformLocation(shaderProgram, "uAlpha");
                multiplierLoc = gl.getUniformLocation(shaderProgram, "colorMultiplier")
                
                // pass global constants into fragment uniforms
                gl.uniform3fv(eyePositionULoc,Eye); // pass in the eye's position
                gl.uniform3fv(lightAmbientULoc,lightAmbient); // pass in the light's ambient emission
                gl.uniform3fv(lightDiffuseULoc,lightDiffuse); // pass in the light's diffuse emission
                gl.uniform3fv(lightSpecularULoc,lightSpecular); // pass in the light's specular emission
                gl.uniform3fv(lightPositionULoc,lightPosition); // pass in the light's position
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

let lastFrameTime = performance.now();


// render the loaded model
function renderModels(time) {

    let elapsed = time - lastFrameTime; //Elapsed time in milliseconds
    elapsed /= 1000; //Elapsed time in seconds.
    lastFrameTime = time;

    //Handle game loop input.
    if (input[0] === 1) {//Translate left if A is pressed down
        translatePlayer(vec3.fromValues(elapsed * -1.5, 0, 0));
    }
    if (input[1] === 1) {//Translate right if D is pressed down
        translatePlayer(vec3.fromValues(elapsed * 1.5, 0, 0));
    }
    if (input[2] === 1) {
        if (playerBullet.fired === false) {
            playerBullet.fired = true;
        }
    }


    // construct the model transform matrix, based on model state
    function makeModelTransform(currModel) {
        let zAxis = vec3.create(), sumRotation = mat4.create(), temp = mat4.create(), negCtr = vec3.create();

        // move the model to the origin
        mat4.fromTranslation(mMatrix,vec3.negate(negCtr,currModel.center));

        // scale for highlighting if needed
        mat4.multiply(mMatrix,mat4.fromScaling(temp,currModel.scaling),mMatrix); // S(1.2) * T(-ctr)

        // rotate the model to current interactive orientation
        vec3.normalize(zAxis,vec3.cross(zAxis,currModel.xAxis,currModel.yAxis)); // get the new model z axis
        mat4.set(sumRotation, // get the composite rotation
            currModel.xAxis[0], currModel.yAxis[0], zAxis[0], 0,
            currModel.xAxis[1], currModel.yAxis[1], zAxis[1], 0,
            currModel.xAxis[2], currModel.yAxis[2], zAxis[2], 0,
            0, 0,  0, 1);
        mat4.multiply(mMatrix,sumRotation,mMatrix); // R(ax) * S(1.2) * T(-ctr)

        // translate back to model center
        mat4.multiply(mMatrix,mat4.fromTranslation(temp,currModel.center),mMatrix); // T(ctr) * R(ax) * S(1.2) * T(-ctr)

        // translate model to current interactive orientation
        mat4.multiply(mMatrix,mat4.fromTranslation(temp,currModel.translation),mMatrix); // T(pos)*T(ctr)*R(ax)*S(1.2)*T(-ctr)

    } // end make model transform

    function checkCollisions(currModel, index) {
        if (currModel.player || currModel.fired !== undefined) {
            return;
        }
        //Get current model bounding boxes
        let currSetBackTopRight = vec4.create();
        let currSetFrontBotLeft = vec4.create();
        vec4.transformMat4(currSetBackTopRight, currModel.backTopRight, currModel.mMatrix);
        vec4.transformMat4(currSetFrontBotLeft, currModel.frontBottomLeft, currModel.mMatrix);
        let curMinX = currSetFrontBotLeft[0];
        let curMaxX = currSetBackTopRight[0];
        let curMinY = currSetBackTopRight[1];
        let curMaxY = currSetFrontBotLeft[1];
        let curMinZ = currSetBackTopRight[2];
        let curMaxZ = currSetFrontBotLeft[2];

        //Get player model bounding boxes
        let playerBackTopRight = vec4.create();
        let playerFrontBotLeft = vec4.create();
        vec4.transformMat4(playerBackTopRight, player.backTopRight, playerMatrix);
        vec4.transformMat4(playerFrontBotLeft, player.frontBottomLeft, playerMatrix);
        let playMinX = playerFrontBotLeft[0];
        let playMaxX = playerBackTopRight[0];
        let playMinY = playerBackTopRight[1];
        let playMaxY = playerFrontBotLeft[1];
        let playMinZ = playerBackTopRight[2];
        let playMaxZ = playerFrontBotLeft[2];

        //Get bullet model bounding boxes
        let bulletBackTopRight = vec4.create();
        let bulletFrontBotLeft = vec4.create();
        vec4.transformMat4(bulletBackTopRight, playerBullet.backTopRight, bulletMatrix);
        vec4.transformMat4(bulletFrontBotLeft, playerBullet.frontBottomLeft, bulletMatrix);
        let bullMinX = bulletFrontBotLeft[0];
        let bullMaxX = bulletBackTopRight[0];
        let bullMinY = bulletBackTopRight[1];
        let bullMaxY = bulletFrontBotLeft[1];
        let bullMinZ = bulletBackTopRight[2];
        let bullMaxZ = bulletFrontBotLeft[2];

        if (playMinX <= curMaxX && playMaxX >= curMinX) {
            if (playMinY <= curMaxY && playMaxY >= curMinY) {
                if (playMinZ <= curMaxZ && playMaxZ >= curMinZ) {
                    console.log("Player-Alien collision detected Detected");
                }
            }
        }

        if (bullMinX <= curMaxX && bullMaxX >= curMinX) {
            if (bullMinY <= curMaxY && bullMaxY >= curMinY) {
                if (bullMinZ <= curMaxZ && bullMaxZ >= curMinZ) {
                    if (playerBullet.fired === true && currModel.material.alpha > 0.0) {
                        playerBullet.translation = vec3.clone(player.translation);
                        playerBullet.fired = false;
                        gameObjects.splice(index, 1);
                        textures.splice(index, 1);
                        console.log("Bullet-Alien collision detected Detected");
                    }
                }
            }
        }




    }

    let pMatrix = mat4.create(); // projection matrix
    let vMatrix = mat4.create(); // view matrix
    let mMatrix = mat4.create(); // model matrix
    let playerMatrix = mat4.create();
    let bulletMatrix = mat4.create();
    let pvMatrix = mat4.create(); // hand * proj * view matrices
    let pvmMatrix = mat4.create(); // hand * proj * view * model matrices

    window.requestAnimationFrame(renderModels); // set up frame render callback

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers


    // set up projection and view
    // mat4.fromScaling(hMatrix,vec3.fromValues(-1,1,1)); // create handedness matrix
    mat4.perspective(pMatrix,0.5*Math.PI,1,0.1,10); // create projection matrix
    mat4.lookAt(vMatrix,Eye,Center,Up); // create view matrix
    mat4.multiply(pvMatrix,pvMatrix,pMatrix); // projection
    mat4.multiply(pvMatrix,pvMatrix,vMatrix); // projection * view

    // render each triangle set
    let currSet; // the tri set and its material properties
    let numTransparent = 0;
    gl.depthMask(true);

    makeModelTransform(player);
    mat4.multiply(playerMatrix, playerMatrix, mMatrix);
    makeModelTransform(playerBullet);
    mat4.multiply(bulletMatrix, bulletMatrix, mMatrix);


    for (let whichTriSet=0; whichTriSet<gameObjects.length; whichTriSet++) {
        gl.enable(gl.BLEND);
        gl.blendFunc(sourceBlending || gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        currSet = gameObjects[whichTriSet];

        // make model transform, add to view project
        makeModelTransform(currSet);
        currSet.mMatrix = mat4.clone(mMatrix);

        mat4.multiply(pvmMatrix,pvMatrix,mMatrix); // project * view * model

        gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in the m matrix
        gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in the hpvm matrix

        // reflectivity: feed to the fragment shader
        gl.uniform3fv(ambientULoc,currSet.material.ambient); // pass in the ambient reflectivity
        gl.uniform3fv(diffuseULoc,currSet.material.diffuse); // pass in the diffuse reflectivity
        gl.uniform3fv(specularULoc,currSet.material.specular); // pass in the specular reflectivity
        gl.uniform1f(shininessULoc,currSet.material.n); // pass in the specular exponent
        gl.uniform1f(alphaLoc, currSet.material.alpha);
        gl.uniform1f(multiplierLoc, colorMultiplier);

        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichTriSet]); // activate
        gl.vertexAttribPointer(vPosAttribLoc,3,gl.FLOAT,false,0,0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[whichTriSet]); // activate
        gl.vertexAttribPointer(vNormAttribLoc,3,gl.FLOAT,false,0,0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffers[whichTriSet]);
        gl.vertexAttribPointer(texCoordLoc,2,gl.FLOAT,false,0,0); // feed
        gl.activeTexture(gl.TEXTURE0 + whichTriSet);
        gl.bindTexture(gl.TEXTURE_2D, textures[whichTriSet]);
        gl.uniform1i(uSampler, whichTriSet);

        if (currSet.material.alpha <= .5) {
            if (numTransparent === 0) {
                gl.depthMask(false);
                numTransparent++;
            }
        }

        // triangle buffer: activate and render
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffers[whichTriSet]); // activate
        gl.drawElements(gl.TRIANGLES,3*triSetSizes[whichTriSet],gl.UNSIGNED_SHORT,0); // render

    } // end for each triangle set

    //Check and handle collisions
    for (let i = gameObjects.length - 1; i >= 0; i--) {
        checkCollisions(gameObjects[i], i);
    }

    //Handle physics

    //Handle bullet physics
    if (playerBullet.fired === true) {

        let temp = vec4.create();
        vec4.transformMat4(temp, playerBullet.frontBottomLeft, playerBullet.mMatrix);

        //If out of bounds, reset bullet
        if (temp[1] > 1.0) {
            playerBullet.translation = vec3.clone(player.translation);
            playerBullet.fired = false;
        }
        //Otherwise keep moving upwards.
        else {
            console.log("Bullet-Boundary Collision");
            translateObject(vec3.fromValues(0, elapsed * 1.5, 0), playerBullet);
        }
    }

    //Handle Alien movement
    AlienModel.setStandardMovement(elapsed);
    gameObjects.forEach(model => {
        if (model.translationLimitMax !== undefined) {
            model.standardMovement();
        }
    })



} // end render model

/* MAIN -- HERE is where execution begins after window load */
function main() {

    setupWebGL(); // set up the webGL environment
    createObjects();
    loadModels(); // load in the models from tri file
    setupShaders(); // setup the webGL shaders
    for (let i = 0; i < gameObjects.length; i++) {
        textures[i] = loadTexture(gl, gameObjects[i].texture);
    }
    renderModels(); // draw the triangles using webGL
  
} // end main
