import React from 'react';
import { Composition } from 'remotion';
import { Film, DURATION } from './Film';
import { Teaser } from './Teaser';
import { Mosaic, MOSAIC_LOOP } from './Mosaic';
import { MosaicFilm, MF_DURATION } from './MosaicFilm';

export const Root: React.FC = () => (
  <>
    <Composition id="EnclaveFilm" component={Film} durationInFrames={DURATION * 30} fps={30} width={1920} height={1080} defaultProps={{ portrait: false }} />
    <Composition id="EnclaveFilmTall" component={Film} durationInFrames={DURATION * 30} fps={30} width={1080} height={1350} defaultProps={{ portrait: true }} />
    <Composition id="EnclaveTeaser" component={Teaser} durationInFrames={240} fps={30} width={1920} height={1080} defaultProps={{ portrait: false }} />
    <Composition id="EnclaveTeaserTall" component={Teaser} durationInFrames={240} fps={30} width={1080} height={1350} defaultProps={{ portrait: true }} />
    <Composition id="EnclaveMosaicTall" component={Mosaic} durationInFrames={MOSAIC_LOOP * 30} fps={30} width={1080} height={1350} />
    <Composition id="EnclaveMosaicFilm" component={MosaicFilm} durationInFrames={MF_DURATION * 30} fps={30} width={1920} height={1080} defaultProps={{ portrait: false }} />
    <Composition id="EnclaveMosaicFilmTall" component={MosaicFilm} durationInFrames={MF_DURATION * 30} fps={30} width={1080} height={1350} defaultProps={{ portrait: true }} />
  </>
);
