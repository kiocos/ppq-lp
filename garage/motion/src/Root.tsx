import React from 'react';
import { Composition } from 'remotion';
import { HeroMock } from './Mock';
import { DEMO_FRAMES, Demo } from './Demo';
import { APPLIT_FRAMES, DoorHalf, DoorStage, ROLLUP_FRAMES, RollUp, Threshold, VERIFY_FRAMES, VerifyTour } from './Scenes';

export const Root: React.FC = () => (
  <>
    <Composition id="HeroMock" component={HeroMock} durationInFrames={1} fps={30} width={1440} height={900} defaultProps={{ v: 'A' as const }} />
    {/* hero loop: 10 s, loop-safe */}
    <Composition id="DoorStage" component={DoorStage} durationInFrames={300} fps={30} width={2560} height={1000} defaultProps={{ layout: 'wide' as const }} />
    <Composition id="DoorStageTall" component={DoorStage} durationInFrames={300} fps={30} width={1080} height={1080} defaultProps={{ layout: 'tall' as const }} />
    <Composition id="RollUp" component={RollUp} durationInFrames={ROLLUP_FRAMES} fps={30} width={1920} height={1200} defaultProps={{ layout: 'wide' as const }} />
    <Composition id="RollUpTall" component={RollUp} durationInFrames={ROLLUP_FRAMES} fps={30} width={1080} height={1350} defaultProps={{ layout: 'tall' as const }} />
    <Composition id="DoorHalf" component={DoorHalf} durationInFrames={1} fps={30} width={2560} height={1100} defaultProps={{ layout: 'wide' as const }} />
    <Composition id="DoorHalfTall" component={DoorHalf} durationInFrames={1} fps={30} width={1080} height={1200} defaultProps={{ layout: 'tall' as const }} />
    <Composition id="VerifyTour" component={VerifyTour} durationInFrames={VERIFY_FRAMES} fps={30} width={1920} height={1200} defaultProps={{ layout: 'wide' as const }} />
    <Composition id="VerifyTourTall" component={VerifyTour} durationInFrames={VERIFY_FRAMES} fps={30} width={1080} height={1350} defaultProps={{ layout: 'tall' as const }} />
    {/* Threshold re-take (round 2) */}
    <Composition id="Threshold" component={Threshold} durationInFrames={300} fps={30} width={2880} height={720} defaultProps={{ layout: 'wide' as const }} />
    <Composition id="ThresholdTall" component={Threshold} durationInFrames={300} fps={30} width={1080} height={760} defaultProps={{ layout: 'tall' as const }} />
    <Composition id="AppLit" component={RollUp} durationInFrames={APPLIT_FRAMES} fps={30} width={1920} height={1200} defaultProps={{ layout: 'wide' as const, variant: 'lit' as const }} />
    <Composition id="AppLitTall" component={RollUp} durationInFrames={APPLIT_FRAMES} fps={30} width={1080} height={1350} defaultProps={{ layout: 'tall' as const, variant: 'lit' as const }} />
    {/* round 3: doors fade into the dark at the top */}
    <Composition id="DoorStageFade" component={DoorStage} durationInFrames={300} fps={30} width={2560} height={1000} defaultProps={{ layout: 'wide' as const, fadeTop: true }} />
    <Composition id="DoorStageFadeTall" component={DoorStage} durationInFrames={300} fps={30} width={1080} height={1080} defaultProps={{ layout: 'tall' as const, fadeTop: true }} />
    <Composition id="DoorHalfFade" component={DoorHalf} durationInFrames={1} fps={30} width={2560} height={1100} defaultProps={{ layout: 'wide' as const, fadeTop: true }} />
    <Composition id="DoorHalfFadeTall" component={DoorHalf} durationInFrames={1} fps={30} width={1080} height={1200} defaultProps={{ layout: 'tall' as const, fadeTop: true }} />
    {/* direct page (no star): small demo crops */}
    <Composition id="Demo" component={Demo} durationInFrames={DEMO_FRAMES} fps={30} width={1200} height={900} defaultProps={{ portrait: false }} />
    <Composition id="DemoTall" component={Demo} durationInFrames={DEMO_FRAMES} fps={30} width={960} height={1080} defaultProps={{ portrait: true }} />
  </>
);
