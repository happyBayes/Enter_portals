import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { Canvas, extend, useFrame, useThree, useLoader } from '@react-three/fiber'
import { useCursor, MeshPortalMaterial, CameraControls, Gltf, Text, Preload } from '@react-three/drei'
import { useRoute, useLocation } from 'wouter'
import { easing, geometry } from 'maath'
import { suspend } from 'suspend-react'
// 导入 GLTFLoader
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

extend(geometry)
const regular = import('@pmndrs/assets/fonts/inter_regular.woff')
const medium = import('@pmndrs/assets/fonts/inter_medium.woff')

// export const App = () => (
//   <Canvas flat camera={{ fov: 75, position: [0, 0, 20] }} eventSource={document.getElementById('root')} eventPrefix="client">
//     <color attach="background" args={['#f0f0f0']} />
//     <Frame id="01" name={`pick\nles`} author="Omar Faruq Tawsif" bg="#e4cdac" position={[-1.15, 0, 0]} rotation={[0, 0.5, 0]}>
//       <Gltf src="pickles_3d_version_of_hyuna_lees_illustration-transformed.glb" scale={8} position={[0, -0.7, -2]} />
//     </Frame>
//     <Frame id="02" name="tea" author="Omar Faruq Tawsif">
//       <Gltf src="fiesta_tea-transformed.glb" position={[0, -2, -3]} />
//     </Frame>
//     <Frame id="03" name="still" author="Omar Faruq Tawsif" bg="#d1d1ca" position={[1.15, 0, 0]} rotation={[0, -0.5, 0]}>
//       <Gltf src="still_life_based_on_heathers_artwork-transformed.glb" scale={2} position={[0, -0.8, -4]} />
//     </Frame>
//     <Rig />
//     <Preload all />
//   </Canvas>
// )
/**
 * AutoScaledGltf 组件：自动计算 GLB 模型的尺寸并调整 scale。
 * * @param {string} src - GLB 文件的路径。
 * @param {number} targetSize - 期望模型最大维度被缩放到的目标尺寸 (默认 1.2)。
 * @param {object} props - 传递给底层 <primitive object={gltf.scene}> 的其他属性 (如 position)。
 */
function AutoScaledGltf({ src, targetSize = 1.2, ...props }) {
  // 使用 useLoader 异步加载 GLB 文件
  const gltf = useLoader(GLTFLoader, src);
  // 使用 useState 来存储计算出的缩放值
  const [calculatedScale, setCalculatedScale] = useState(1);

  useEffect(() => {
    if (gltf.scene) {
      // 1. 克隆模型以计算边界框，避免修改原始场景
      const model = gltf.scene.clone();

      // 2. 计算边界框 (Bounding Box)
      const box = new THREE.Box3().setFromObject(model);

      // 3. 获取尺寸 (Width, Height, Depth)
      const size = new THREE.Vector3();
      box.getSize(size);

      // 4. 找到最大维度
      const maxDim = Math.max(size.x, size.y, size.z);

      if (maxDim > 0) {
        // 5. 计算所需缩放因子： (目标尺寸 / 原始最大尺寸)
        // 目标尺寸 1.2 是为了让模型在 1x1.618 的画框中既可见又留有边缘。
        const newScale = targetSize / maxDim;
        setCalculatedScale(newScale);

        // 【调试信息】在控制台打印计算结果
        console.groupCollapsed(`[Auto-Scale] ${src}`);
        console.log(`- 原始尺寸 (Max): ${maxDim.toFixed(4)}`);
        console.log(`- 目标尺寸: ${targetSize}`);
        console.log(`- 最终 Scale: ${newScale.toFixed(4)}`);
        console.groupEnd();
      }
    }
  }, [gltf, src, targetSize]); // 依赖项确保在模型加载后运行

  // 渲染模型，并应用计算出的缩放值
  return (
    <primitive
      object={gltf.scene}
      scale={calculatedScale} // 使用计算出的 scale
      {...props}
    />
  );
}

export const App = () => (
  <Canvas flat camera={{ fov: 75, position: [0, 0, 20] }} eventSource={document.getElementById('root')} eventPrefix="client">
    <color attach="background" args={['#f0f0f0']} />
    <Frame id="01" name={`pick\nles`} author="Omar Faruq Tawsif" bg="#e4cdac" position={[-1.15, 0, 0]} rotation={[0, 0.5, 0]}>
      {/* <Gltf src="wenbo1.glb" scale={8} position={[0, -0.7, -2]} />
    </Frame> */}
      <AutoScaledGltf src="wenbo1.glb" targetSize={1.2} position={[0, -0.7, -2]} />
    </Frame>
    <Frame id="02" name="tea" author="Omar Faruq Tawsif">
      {/* <Gltf src="wenbo2.glb" position={[0, -2, -3]} /> */}
      <AutoScaledGltf src="wenbo2.glb" targetSize={1.2} position={[0, 0, -2.5]} />
    </Frame>
    <Frame id="03" name="still" author="Omar Faruq Tawsif" bg="#d1d1ca" position={[1.15, 0, 0]} rotation={[0, -0.5, 0]}>
      {/* <Gltf src="wenbo3.glb" scale={2} position={[0, -0.8, -4]} /> */}
      <AutoScaledGltf src="wenbo3.glb" targetSize={1.2} position={[0, -0.8, -4]} />
    </Frame>
    <Rig />
    <Preload all />
  </Canvas>
)


function Frame({ id, name, author, bg, width = 1, height = 1.61803398875, children, ...props }) {
  const portal = useRef()
  const [, setLocation] = useLocation()
  const [, params] = useRoute('/item/:id')
  const [hovered, hover] = useState(false)
  useCursor(hovered)
  useFrame((state, dt) => easing.damp(portal.current, 'blend', params?.id === id ? 1 : 0, 0.2, dt))
  return (
    <group {...props}>
      <Text font={suspend(medium).default} fontSize={0.3} anchorY="top" anchorX="left" lineHeight={0.8} position={[-0.375, 0.715, 0.01]} material-toneMapped={false}>
        {name}
      </Text>
      <Text font={suspend(regular).default} fontSize={0.1} anchorX="right" position={[0.4, -0.659, 0.01]} material-toneMapped={false}>
        /{id}
      </Text>
      <Text font={suspend(regular).default} fontSize={0.04} anchorX="right" position={[0.0, -0.677, 0.01]} material-toneMapped={false}>
        {author}
      </Text>
      <mesh name={id} onDoubleClick={(e) => (e.stopPropagation(), setLocation('/item/' + e.object.name))} onPointerOver={(e) => hover(true)} onPointerOut={() => hover(false)}>
        <roundedPlaneGeometry args={[width, height, 0.1]} />
        <MeshPortalMaterial ref={portal} events={params?.id === id} side={THREE.DoubleSide}>
          <color attach="background" args={[bg]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 0, 5]} intensity={1.5} />
          {children}
        </MeshPortalMaterial>
      </mesh>
    </group>
  )
}

function Rig({ position = new THREE.Vector3(0, 0, 2), focus = new THREE.Vector3(0, 0, 0) }) {
  const { controls, scene } = useThree()
  const [, params] = useRoute('/item/:id')
  useEffect(() => {
    const active = scene.getObjectByName(params?.id)
    if (active) {
      active.parent.localToWorld(position.set(0, 0.5, 0.25))
      active.parent.localToWorld(focus.set(0, 0, -2))
    }
    controls?.setLookAt(...position.toArray(), ...focus.toArray(), true)
  })
  return <CameraControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
}
