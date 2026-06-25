"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { getSculptureMorph } from "@/lib/cinematic-scroll";

function useSculptureMorph(scrollYProgress: MotionValue<number>) {
  const opacity = useTransform(scrollYProgress, (value) => getSculptureMorph(value).visibility * 0.94);
  const rotateX = useTransform(scrollYProgress, (value) => getSculptureMorph(value).rotateX);
  const rotateY = useTransform(scrollYProgress, (value) => getSculptureMorph(value).rotateY);
  const rotateZ = useTransform(scrollYProgress, (value) => getSculptureMorph(value).rotateZ);
  const scale = useTransform(scrollYProgress, (value) => getSculptureMorph(value).scale);
  const translateZ = useTransform(scrollYProgress, (value) => getSculptureMorph(value).translateZ);
  const floorRotateX = useTransform(scrollYProgress, (value) => getSculptureMorph(value).floorRotateX);

  const coreRoundness = useTransform(scrollYProgress, (value) => {
    const morph = getSculptureMorph(value);
    return `${morph.coreRoundness}%`;
  });
  const coreScaleX = useTransform(scrollYProgress, (value) => getSculptureMorph(value).coreScaleX);
  const coreScaleY = useTransform(scrollYProgress, (value) => getSculptureMorph(value).coreScaleY);

  const shellRoundness = useTransform(scrollYProgress, (value) => {
    const morph = getSculptureMorph(value);
    return `${morph.shellRoundness}%`;
  });

  const ringScaleA = useTransform(scrollYProgress, (value) => getSculptureMorph(value).ringScaleA);
  const ringScaleB = useTransform(scrollYProgress, (value) => getSculptureMorph(value).ringScaleB);
  const ringScaleC = useTransform(scrollYProgress, (value) => getSculptureMorph(value).ringScaleC);
  const ringRotateA = useTransform(scrollYProgress, (value) => getSculptureMorph(value).ringTiltA);
  const ringRotateB = useTransform(scrollYProgress, (value) => getSculptureMorph(value).ringTiltB);
  const ringRotateC = useTransform(scrollYProgress, (value) => getSculptureMorph(value).ringTiltC);
  const ringRotateY = useTransform(scrollYProgress, (value) => getSculptureMorph(value).ringRotateY);

  const plateRoundnessFront = useTransform(scrollYProgress, (value) => {
    const morph = getSculptureMorph(value);
    return `${morph.plateRoundnessFront}%`;
  });
  const plateRoundnessBack = useTransform(scrollYProgress, (value) => {
    const morph = getSculptureMorph(value);
    return `${morph.plateRoundnessBack}%`;
  });
  const plateZ = useTransform(scrollYProgress, (value) => getSculptureMorph(value).plateDepth);
  const plateZBack = useTransform(plateZ, (z) => -z * 0.88);

  const nucleusScale = useTransform(scrollYProgress, (value) => getSculptureMorph(value).nucleusScale);
  const wireOpacity = useTransform(scrollYProgress, (value) => getSculptureMorph(value).wireOpacity);

  const specularX = useTransform(scrollYProgress, (value) => getSculptureMorph(value).specularX);
  const specularY = useTransform(scrollYProgress, (value) => getSculptureMorph(value).specularY);
  const specularPosition = useTransform(
    [specularX, specularY],
    ([x, y]) => `${x}% ${y}%`,
  );

  return {
    opacity,
    rotateX,
    rotateY,
    rotateZ,
    scale,
    translateZ,
    floorRotateX,
    coreRoundness,
    coreScaleX,
    coreScaleY,
    shellRoundness,
    ringScaleA,
    ringScaleB,
    ringScaleC,
    ringRotateA,
    ringRotateB,
    ringRotateC,
    ringRotateY,
    plateRoundnessFront,
    plateRoundnessBack,
    plateZ,
    plateZBack,
    nucleusScale,
    wireOpacity,
    specularX,
    specularY,
    specularPosition,
  };
}

export function GrandeurSculpture({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  const morph = useSculptureMorph(scrollYProgress);

  return (
    <motion.div style={{ opacity: morph.opacity }} className="sculpture-stage" aria-hidden>
      <motion.div
        className="sculpture-rig"
        style={{
          rotateX: morph.rotateX,
          rotateY: morph.rotateY,
          rotateZ: morph.rotateZ,
          scale: morph.scale,
          z: morph.translateZ,
        }}
      >
        <motion.span style={{ borderRadius: morph.shellRoundness }} className="sculpture-shell" />

        <motion.span
          style={{
            borderRadius: morph.coreRoundness,
            scaleX: morph.coreScaleX,
            scaleY: morph.coreScaleY,
          }}
          className="sculpture-core"
        >
          <motion.span style={{ scale: morph.nucleusScale }} className="sculpture-nucleus" />
          <motion.span style={{ backgroundPosition: morph.specularPosition }} className="sculpture-specular" />
        </motion.span>

        <motion.span
          style={{ scale: morph.ringScaleA, rotateX: morph.ringRotateA, rotateY: morph.ringRotateY }}
          className="sculpture-ring sculpture-ring-a"
        />
        <motion.span
          style={{ scale: morph.ringScaleB, rotateX: morph.ringRotateB, rotateY: 72 }}
          className="sculpture-ring sculpture-ring-b"
        />
        <motion.span
          style={{ scale: morph.ringScaleC, rotateY: -64, rotateX: morph.ringRotateC }}
          className="sculpture-ring sculpture-ring-c"
        />

        <motion.span
          style={{ z: morph.plateZ, borderRadius: morph.plateRoundnessFront }}
          className="sculpture-plate sculpture-plate-front"
        />
        <motion.span
          style={{ z: morph.plateZBack, borderRadius: morph.plateRoundnessBack }}
          className="sculpture-plate sculpture-plate-back"
        />

        <motion.span style={{ opacity: morph.wireOpacity }} className="sculpture-wire sculpture-wire-x" />
        <motion.span style={{ opacity: morph.wireOpacity }} className="sculpture-wire sculpture-wire-y" />
        <motion.span style={{ opacity: morph.wireOpacity }} className="sculpture-wire sculpture-wire-z" />
      </motion.div>

      <motion.div style={{ rotateX: morph.floorRotateX }} className="sculpture-floor">
        <div className="sculpture-floor-grid" />
        <div className="sculpture-floor-glow" />
      </motion.div>
    </motion.div>
  );
}