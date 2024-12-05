class GameObject {

    material = {
        ambient: [1, 1, 1],
        diffuse: [1, 1, 1],
        specular: [1, 1, 1],
        n: 10,
        alpha: 1.0,
    }
    vertices = [];
    normals = [];
    uvs= [];
    triangles= [];

    constructor() {}
}

class AlienModel extends GameObject {
    
    texture = undefined;

    constructor() {
        super();
        this.vertices = [[0.0, 0.0, 0.0], [1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [1.0, 1.0, 0.0],
                         [0.0, 0.0, 1.0], [1.0, 0.0, 1.0], [0.0, 1.0, 1.0], [1.0, 1.0, 1.0]];
        this.uvs = [[0,0], [0,1], [1,1], [1,0],
            [0,0], [0,1], [1,1], [1,0],
            [0,0], [0,1], [1,1], [1,0]];

        this.triangles = [[0,1,2],[2,3,1], [4,5,6],[6, 7, 5],
                          [0, 4, 6], [0, 2, 6], [1, 5, 7], [1, 3, 7],
                          [2, 3, 7], [2, 6, 7], [0, 1, 5], [0, 4, 5]];
    }
}
