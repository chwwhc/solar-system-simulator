import { Component, ComponentType } from "./component";

const entities: Map<ComponentType, Component>[] = [];

export type EntityID = number;

export const createEntity = (components: Component[]): EntityID => {
    const id: EntityID = entities.length;

    const entity: Map<ComponentType, Component> = new Map();
    components.forEach((component) => {
        entity.set(component.type, component);
    });

    entities.push(entity);
    return id;
};

export const getEntity = (id: EntityID): Map<ComponentType, Component> => {
    return entities[id];
};

export const entityHasComponent = (id: EntityID, componentType: ComponentType): boolean => {
    return entities[id].has(componentType);
};

export const entityGetComponent = (id: EntityID, componentType: ComponentType): Component => {
    return entities[id].get(componentType);
};

export const addComponent = (id: EntityID, component: Component): void => {
    entities[id].set(component.type, component);
};

export const removeComponent = (id: EntityID, componentType: ComponentType): void => {
    entities[id].delete(componentType);
};

export const removeEntity = (id: EntityID): void => {
    entities.splice(id, 1);
};