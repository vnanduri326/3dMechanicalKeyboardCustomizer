
import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, OrbitControls, useGLTF } from "@react-three/drei";
import { Mesh, MeshStandardMaterial, type Material } from "three";

function LoadedModel({ src, modelColor }: { src: string; modelColor?: string }) {
  const { scene } = useGLTF(src);
  const model = useMemo(() => {
    const clonedScene = scene.clone();
    if (modelColor) {
      clonedScene.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        const cloneMaterial = (material: Material) => {
          const clonedMaterial = material.clone();
          if (clonedMaterial instanceof MeshStandardMaterial) {
            clonedMaterial.color.set(modelColor);
          }
          return clonedMaterial;
        };
        object.material = Array.isArray(object.material)
          ? object.material.map(cloneMaterial)
          : cloneMaterial(object.material);
      });
    }
    return clonedScene;
  }, [scene, modelColor]);

  return <primitive object={model} dispose={null} />;
}

export default function ModelViewer({
  src,
  boundsMargin = 1.2,
  modelColor,
}: {
  src: string;
  boundsMargin?: number;
  modelColor?: string;
}) {
  return (
    <div className="kc-model-viewer" aria-label="3D model preview">
      <Canvas camera={{ position: [3, 3, 5], fov: 45 }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={boundsMargin}>
            <LoadedModel src={src} modelColor={modelColor} />
          </Bounds>
        </Suspense>
        <OrbitControls makeDefault enablePan={false} />
      </Canvas>
    </div>
  );
}