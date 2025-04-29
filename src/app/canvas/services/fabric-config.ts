import { FabricObject, Circle } from 'fabric';

declare module 'fabric' {
  interface FabricObject {
    id: string;
  }

  interface SerializedObjectProps {
    id: string;
  }
}

// Registrar las propiedades personalizadas para la serialización
FabricObject.customProperties = ['id'];
