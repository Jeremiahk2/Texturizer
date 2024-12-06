class CubeObject {

    material = {
        ambient: [1, 1, 1],
        diffuse: [1, 1, 1],
        specular: [1, 1, 1],
        n: 10,
        alpha: 1.0
    }
    translation = vec3.fromValues(0.0, 0.0, 0.0);

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

    texture = "https://jeremiahk2.github.io/textures.github.io/Blue-1.jpg";

    constructor() {
        super();
    }
}

class SpaceshipModel extends CubeObject {
    texture = "https://jeremiahk2.github.io/textures.github.io/Red-1.jpg";

    constructor() {
        super();
    }
}
