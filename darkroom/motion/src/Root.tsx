import React from 'react';
import { Composition } from 'remotion';
import { Develop, DEVELOP_FRAMES } from './Develop';
import { Develop as DevelopR1, DEVELOP_FRAMES as R1_FRAMES } from './DevelopR1';
import { PickerDevelop, PICKER_FRAMES } from './PickerDevelop';

export const Root: React.FC = () => (
  <>
    {/* round 2 onwards */}
    <Composition id="Develop" component={Develop} durationInFrames={DEVELOP_FRAMES} fps={30} width={1920} height={1200} defaultProps={{ layout: 'wide' as const }} />
    <Composition id="DevelopPhone" component={Develop} durationInFrames={DEVELOP_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ layout: 'phone' as const }} />
    <Composition id="PickerDevelop" component={PickerDevelop} durationInFrames={PICKER_FRAMES} fps={30} width={1240} height={1100} />
    {/* round 1, kept so its renders stay reproducible */}
    <Composition id="DevelopR1" component={DevelopR1} durationInFrames={R1_FRAMES} fps={30} width={1920} height={1200} defaultProps={{ layout: 'wide' as const }} />
    <Composition id="DevelopR1Phone" component={DevelopR1} durationInFrames={R1_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ layout: 'phone' as const }} />
  </>
);
