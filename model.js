class CubeObject {

    material = {
        ambient: [1, 1, 1],
        diffuse: [0, 0, 0],
        specular: [0, 0, 0],
        n: 10,
        alpha: 1.0
    }
    translation = vec3.fromValues(0.0, 0.0, 0.0);


    backTopRight = vec4.fromValues(1.0, 0.0, -1.0, 1.0);
    frontBottomLeft = vec4.fromValues(0.0, 1.0, 0.0, 1.0);

    scaling = vec3.fromValues(.1, .1, .1);

    vertices = [[0.0, 0.0, 0.0], [1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [1.0, 1.0, 0.0], //Front face
        [1.0, 0.0, 0.0], [1.0, 0.0, -1.0], [1.0, 1.0, 0.0], [1.0, 1.0, -1.0], //Right face
        [0.0, 0.0, -1.0], [0.0, 0.0, 0.0], [0.0, 1.0, -1.0], [0.0, 1.0, 0.0], //Left face
        [1.0, 0.0, -1.0], [0.0,0.0,-1.0], [1.0, 1.0, -1.0], [0.0, 1.0, -1.0], //Back face
        [0.0,0.0,-1.0],[1.0,0.0,-1.0],[0.0,0.0,0.0],[1.0,0.0,0.0], //Top face
        [1.0,1.0,-1.0],[0.0,1.0,-1.0],[0.0,1.0,0.0],[1.0,1.0,0.0], //Bottom face
    ];
    uvs = [[0,0],[1,0],[0,1],[1,1], //Front face
        [0,0],[0,1],[1,0],[1,1], //Right face
        [0,1],[0,0],[1,1],[1,0], //Left face
        [1,0],[0,0],[1,1],[0,1], //Back face
        [0,1],[1,1],[0,0],[1,0], //Top face
        [1,1],[0,1],[0,0],[1,0] //Bottom face
    ];

    triangles = [[0,1,2],[2,3,1], //Front face
        [4, 5, 6], [6, 7, 5], //Right face
        [8, 9, 10], [10, 11, 9], //Left face
        [12, 13, 14], [14, 15, 13], //Back face
        [16, 17, 18], [18, 19, 17], //Top face
        [20, 21, 22], [22, 23, 21], //Bottom face
    ];
    normals = [[0, 0, 1],[0, 0,1],[0, 0,1],[0, 0, 1], //Front face
        [1, 0, 0],[1, 0,0],[1, 0,0],[1, 0, 0], //Right face
        [-1, 0, 0],[-1, 0,0],[-1, 0,0],[-1, 0, 0], //Left face
        [0, 0, -1],[0, 0,-1],[0, 0,-1],[0, 0, -1], //Back face
        [0, 1, 0],[0, 1,0],[0, 1,0],[0, 1, 0], //Top face
        [0, -1, 0],[0, -1,0],[0, -1,0],[0, -1, 0], //Bottom Face

    ];

    constructor() {}
}

class AlienModel extends CubeObject {

    //State information
    state = 0; //0 = Standard, 1 = Descending, 2 = Returning

    //Standard movement fields
    static position = 0.0;
    static upperLimit = .4;
    static lowerLimit = -.4;
    static speed = new vec3.fromValues(-.5, 0, 0);
    static color = [1, 1, 1];
    static reset = false;
    static standardMovement = vec3.create();

    //Descending movement fields.
    amplitude = .3;
    frequency = 2;
    phase = Math.PI / 4;
    descendingMovement = vec3.fromValues(0, -.25, 0);

    //Returning movement
    returningSeparation = 1;
    currentSeparation = 1;

    //Alien-specific fields
    translationLimitMax = vec3.create();
    translationLimitMin = vec3.create();

    texture = "https://jeremiahk2.github.io/textures.github.io/Blue-1.jpg";

    getSinusoidStep(height) {
        const angularFrequency = 2 * Math.PI * this.frequency;
        return this.amplitude * Math.sin(angularFrequency * height * this.phase);
    }

    handleReturningMovement(elapsed) {
        this.standardMovement();
        let timeStepVector = vec3.fromValues(0, elapsed * 1.75, 0);
        vec3.subtract(this.translation, this.translation, timeStepVector);

        if ( this.translation[1] <= this.translationLimitMin[1]) {
            console.log(timeStepVector);
            console.log("Returned");
            this.state = 0;
            this.translation[1] = this.translationLimitMin[1];
        }
    }

    handleDescendingMovement(elapsed) {
        //Set color to match
        this.material.ambient = AlienModel.color;
        //Add descending (-y) movement.
        let temp = vec3.create();
        vec3.scale(temp, this.descendingMovement, elapsed);
        vec3.add(this.translation, this.translation, temp);
        //Add horizontal sinusoidal (+x) movement
        const height = this.translationLimitMin[1] - this.translation[1];
        vec3.scale(temp, vec3.fromValues(this.getSinusoidStep(height), 0, 0), elapsed);
        vec3.add(this.translation, this.translation, temp);

        if (this.translation[1] <= -2.0) {
            this.state = 2; //Set to returning state when it hits the bottom boundary.
            //Align with standard state
            vec3.copy(this.translation, this.translationLimitMin);
            vec3.add(this.translation, this.translation, vec3.fromValues(AlienModel.upperLimit, 0, 0));
            vec3.add(this.translation, this.translation, vec3.fromValues(AlienModel.position, 0, 0));
            const returningVector = vec3.fromValues(0, this.returningSeparation, 0);
            vec3.add(this.translation, this.translation, returningVector);
            // this.handleReturningMovement(elapsed);
            console.log("Returning");
        }
    }

    static setStandardMovement(elapsed) {
        if (!isNaN(elapsed)) {
            if (AlienModel.position < AlienModel.lowerLimit) {
                //Change color
                AlienModel.color = [0, 1, 0];
                //Reverse direction, set new speed
                vec3.scale(AlienModel.speed, AlienModel.speed, -1);
                vec3.scale(AlienModel.standardMovement, AlienModel.speed, elapsed);
                //Reset values, signal all aliens to reset translations.
                AlienModel.position = AlienModel.lowerLimit;
                AlienModel.reset = true;
            }
            else if (AlienModel.position > AlienModel.upperLimit) {
                AlienModel.color = [1, 1, 1];
                vec3.scale(AlienModel.speed, AlienModel.speed, -1);
                vec3.scale(AlienModel.standardMovement, AlienModel.speed, elapsed);
                AlienModel.position = AlienModel.upperLimit
                AlienModel.reset = true;
            }
            else {
                AlienModel.reset = false;
                vec3.scale(AlienModel.standardMovement, AlienModel.speed, elapsed);
                AlienModel.position += AlienModel.standardMovement[0];
            }
        }
    }
    standardMovement() {
        if (AlienModel.reset === true) {
            this.material.ambient = AlienModel.color;
            //If we've swapped to going in the +x direction, reset to min.
            if (AlienModel.speed[0] > 0.0) {
                this.translation[0] = this.translationLimitMin[0];
                // vec3.copy(this.translation, this.translationLimitMin);
            }
            else {
                //If we've swapped to going in the -x direction, reset to max.
                this.translation[0] = this.translationLimitMax[0];
                // vec3.copy(this.translation, this.translationLimitMax);
            }
        }
        else {
            vec3.add(this.translation, this.translation, AlienModel.standardMovement);
        }

    }

    constructor(translation) {
        super();
        this.translation = translation;
        vec3.add(this.translationLimitMin, this.translation, vec3.fromValues(AlienModel.lowerLimit, 0, 0));
        vec3.add(this.translationLimitMax, this.translation, vec3.fromValues(AlienModel.upperLimit, 0, 0));
    }
}

class SpaceshipModel extends CubeObject {
    texture = "https://jeremiahk2.github.io/textures.github.io/Red-1.jpg";

    player = true;

    constructor() {
        super();
    }
}

class BulletModel extends CubeObject {
    texture = "https://jeremiahk2.github.io/textures.github.io/White-1.jpg"

    scaling = vec3.fromValues(.01, .08, .01);

    fired = false;

    constructor() {
        super();
    }
}


//Ideas for make it your own:
//Have the character get attacked from two planes. Ones above and then ones into the Z axis.
