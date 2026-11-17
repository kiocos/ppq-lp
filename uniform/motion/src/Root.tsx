import React from 'react';
import { Composition } from 'remotion';
import { Sealed } from './Sealed';
import { Wheel } from './Wheel';
import { Ledger } from './Ledger';
import { OneLine } from './OneLine';
import { Night } from './Night';
import { AppTour } from './AppTour';

export const Root: React.FC = () => (
  <>
    <Composition id="Sealed" component={Sealed} durationInFrames={450} fps={30} width={1600} height={700} defaultProps={{ palette: 'ink' as const }} />
    <Composition id="Wheel" component={Wheel} durationInFrames={480} fps={30} width={1920} height={1080} defaultProps={{ palette: 'graphite' as const }} />
    <Composition id="Ledger" component={Ledger} durationInFrames={450} fps={30} width={1200} height={1400} defaultProps={{ palette: 'paper' as const }} />
    <Composition id="OneLine" component={OneLine} durationInFrames={460} fps={30} width={1920} height={1080} defaultProps={{ palette: 'amber' as const }} />
    <Composition id="Night" component={Night} durationInFrames={600} fps={30} width={1920} height={1080} defaultProps={{ fireX: 300 }} />
    <Composition id="TourSearch" component={AppTour} durationInFrames={383} fps={30} width={1920} height={1200} defaultProps={{ cut: 'search' as const, palette: 'ink' as const }} />
    <Composition id="TourBrowse" component={AppTour} durationInFrames={504} fps={30} width={1920} height={1200} defaultProps={{ cut: 'browse' as const, palette: 'ink' as const }} />
    <Composition id="TourVerify" component={AppTour} durationInFrames={368} fps={30} width={1920} height={1200} defaultProps={{ cut: 'verify' as const, palette: 'ink' as const }} />
    <Composition id="SealedTall" component={Sealed} durationInFrames={450} fps={30} width={1080} height={1440} defaultProps={{ palette: 'ink' as const, layout: 'tall' as const }} />
    <Composition id="WheelTall" component={Wheel} durationInFrames={480} fps={30} width={1080} height={1350} defaultProps={{ palette: 'graphite' as const, layout: 'tall' as const }} />
    <Composition id="TourSearchTall" component={AppTour} durationInFrames={383} fps={30} width={1080} height={1350} defaultProps={{ cut: 'search' as const, palette: 'ink' as const, portrait: true }} />
    <Composition id="TourBrowseTall" component={AppTour} durationInFrames={504} fps={30} width={1080} height={1350} defaultProps={{ cut: 'browse' as const, palette: 'ink' as const, portrait: true }} />
    <Composition id="TourVerifyTall" component={AppTour} durationInFrames={368} fps={30} width={1080} height={1350} defaultProps={{ cut: 'verify' as const, palette: 'ink' as const, portrait: true }} />
  </>
);
