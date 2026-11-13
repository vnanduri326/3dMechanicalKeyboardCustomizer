
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function ModelViewer() {
  return (
    <div style={{ width: "100%", height: "100%", minHeight: "120px" }}>
      <Canvas camera={{ position: [3, 3, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} />

        <mesh rotation={[0.3, 0.5, 0]}>
          <boxGeometry args={[2, 0.5, 2]} />
          <meshStandardMaterial color="#a8d5ba" />
        </mesh>

        <OrbitControls />
      </Canvas>
    </div>
  );
}
