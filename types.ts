export interface Component {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number }; // Percentage 0-100
}

export interface ObjectData {
  id: string;
  name: string;
  description: string;
  components: Component[];
}
