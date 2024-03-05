import { GUI } from 'dat.gui';

export const gui = new GUI();

const params = {
    color: '#ff0000',
    scale: 1,
    rotation: 0,
};

gui.addColor(params, 'color');
gui.add(params, 'scale', 0.1, 2);
gui.add(params, 'rotation', 0, Math.PI * 2);
