import { Composition } from "remotion";
import { Main } from "./Main.jsx";
import { Thumb } from "./Thumb.jsx";
import { PullDay } from "./PullDay.jsx";
import { PullThumb } from "./PullThumb.jsx";
import { LegDay } from "./LegDay.jsx";
import { ChestBack } from "./ChestBack.jsx";
import { DeltsArms } from "./DeltsArms.jsx";
import { DeltsArmsThumb } from "./DeltsArmsThumb.jsx";
import { DeltsArmsPage, DP } from "./DeltsArmsPage.jsx";
import { ChestBackThumb } from "./ChestBackThumb.jsx";
import { LegThumb } from "./LegThumb.jsx";
import { LatPulldown, LP } from "./LatPulldown.jsx";
import { LegPress, LPR } from "./LegPress.jsx";
import { DbRow, DR } from "./DbRow.jsx";
import { HowItWorks, HowItWorksThumb, HW } from "./HowItWorks.jsx";
import { DbRowThumb } from "./DbRowThumb.jsx";
import { BicepsCurl, BC } from "./BicepsCurl.jsx";
import { BicepsCurlThumb } from "./BicepsCurlThumb.jsx";
import { StepsToon, StepsThumb, ST } from "./StepsToon.jsx";
import { ChartStory, ChartProof, CHS } from "./ChartStory.jsx";
import { ChartTop3, CT3 } from "./ChartTop3.jsx";
import { AppPreview, AP } from "./AppPreview.jsx";
import { LegPressThumb } from "./LegPressThumb.jsx";
import { LatThumb } from "./LatThumb.jsx";
import { CarouselCreatine, CarouselCover, CC, CCV } from "./CarouselCreatine.jsx";
import { CarouselOverload, OverloadCover, CO, COV } from "./CarouselOverload.jsx";
import { BenchElbows, BE } from "./BenchElbows.jsx";
import { BenchThumb } from "./BenchThumb.jsx";
import { Commercial, CM } from "./Commercial.jsx";
import { CommercialThumb } from "./CommercialThumb.jsx";
import { StoryCreatine, SC } from "./StoryCreatine.jsx";
import { CreatineStory, CS } from "./CreatineStory.jsx";
import { CreatineThumb } from "./CreatineThumb.jsx";
import { CreatineVO, CV } from "./CreatineVO.jsx";
import { ToonTest } from "./ToonTest.jsx";
import { MythsCartoon, MC } from "./MythsCartoon.jsx";
import { MythsThumb } from "./MythsThumb.jsx";
import { MythsMascot, MM } from "./MythsMascot.jsx";
import { MythsMascotThumb } from "./MythsMascotThumb.jsx";
import { MythsMascot45, MM45 } from "./MythsMascot45.jsx";
import { MythsMascot60, MM60 } from "./MythsMascot60.jsx";
import { FormCheck, FC } from "./FormCheck.jsx";
import { FormClip, FL } from "./FormClip.jsx";
import { FPS, DURATION } from "./timing.js";

export const Root = () => (
  <>
    <Composition id="PushDay" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="PushDay-NoMusic" component={Main} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="DeltsArmsPage" component={DeltsArmsPage} durationInFrames={DP.DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="DeltsArmsPage-NoMusic" component={DeltsArmsPage} durationInFrames={DP.DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="DeltsArms" component={DeltsArms} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="DeltsArms-NoMusic" component={DeltsArms} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="DeltsArms-Thumb" component={DeltsArmsThumb} durationInFrames={1} fps={FPS} width={1080} height={1920} />
    <Composition id="ChestBack" component={ChestBack} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="ChestBack-NoMusic" component={ChestBack} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="ChestBack-Thumb" component={ChestBackThumb} durationInFrames={1} fps={FPS} width={1080} height={1920} />
    <Composition id="LegDay" component={LegDay} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="LegDay-NoMusic" component={LegDay} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="LegDay-Thumb" component={LegThumb} durationInFrames={1} fps={FPS} width={1080} height={1920} />
    <Composition id="PullDay" component={PullDay} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="PullDay-NoMusic" component={PullDay} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="PullDay-Thumb" component={PullThumb} durationInFrames={1} fps={FPS} width={1080} height={1920} />
    <Composition id="OverloadCover" component={OverloadCover} durationInFrames={COV.DURATION} fps={30} width={CO.W} height={CO.H} defaultProps={{ sound: true }} />
    <Composition id="OverloadCover-Silent" component={OverloadCover} durationInFrames={COV.DURATION} fps={30} width={CO.W} height={CO.H} defaultProps={{ sound: false }} />
    <Composition id="CarouselOverload" component={CarouselOverload} durationInFrames={CO.N} fps={30} width={CO.W} height={CO.H} />
    <Composition id="CarouselCover" component={CarouselCover} durationInFrames={CCV.DURATION} fps={30} width={CC.W} height={CC.H} defaultProps={{ sound: true }} />
    <Composition id="CarouselCover-Silent" component={CarouselCover} durationInFrames={CCV.DURATION} fps={30} width={CC.W} height={CC.H} defaultProps={{ sound: false }} />
    <Composition id="CarouselCreatine" component={CarouselCreatine} durationInFrames={CC.N} fps={30} width={CC.W} height={CC.H} />
    <Composition id="HowItWorks-Thumb" component={HowItWorksThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="HowItWorks" component={HowItWorks} durationInFrames={HW.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="HowItWorks-NoMusic" component={HowItWorks} durationInFrames={HW.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="AppPreview" component={AppPreview} durationInFrames={AP.DURATION} fps={30} width={886} height={1920} defaultProps={{ music: true }} />
    <Composition id="AppPreview-Silent" component={AppPreview} durationInFrames={AP.DURATION} fps={30} width={886} height={1920} defaultProps={{ music: false }} />
    <Composition id="AppPreview-Social" component={AppPreview} durationInFrames={AP.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="ChartTop3" component={ChartTop3} durationInFrames={CT3.DURATION} fps={30} width={1080} height={1920} defaultProps={{ sound: true }} />
    <Composition id="ChartTop3-Silent" component={ChartTop3} durationInFrames={CT3.DURATION} fps={30} width={1080} height={1920} defaultProps={{ sound: false }} />
    <Composition id="ChartProof" component={ChartProof} durationInFrames={CHS.DURATION} fps={30} width={1080} height={1920} defaultProps={{ sound: true }} />
    <Composition id="ChartProof-Silent" component={ChartProof} durationInFrames={CHS.DURATION} fps={30} width={1080} height={1920} defaultProps={{ sound: false }} />
    <Composition id="ChartStory" component={ChartStory} durationInFrames={CHS.DURATION} fps={30} width={1080} height={1920} defaultProps={{ sound: true }} />
    <Composition id="ChartStory-Silent" component={ChartStory} durationInFrames={CHS.DURATION} fps={30} width={1080} height={1920} defaultProps={{ sound: false }} />
    <Composition id="StepsToon-Thumb" component={StepsThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="StepsToon" component={StepsToon} durationInFrames={ST.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="StepsToon-NoMusic" component={StepsToon} durationInFrames={ST.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="BicepsCurl-Thumb" component={BicepsCurlThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="BicepsCurl" component={BicepsCurl} durationInFrames={BC.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="BicepsCurl-NoMusic" component={BicepsCurl} durationInFrames={BC.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="DbRow-Thumb" component={DbRowThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="DbRow" component={DbRow} durationInFrames={DR.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="DbRow-NoMusic" component={DbRow} durationInFrames={DR.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="LegPress-Thumb" component={LegPressThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="LegPress" component={LegPress} durationInFrames={LPR.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="LegPress-NoMusic" component={LegPress} durationInFrames={LPR.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="LatPulldown-Thumb" component={LatThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="LatPulldown" component={LatPulldown} durationInFrames={LP.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="LatPulldown-NoMusic" component={LatPulldown} durationInFrames={LP.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="PushDay-Thumb" component={Thumb} durationInFrames={1} fps={FPS} width={1080} height={1920} />
    <Composition id="MythsMascot60" component={MythsMascot60} durationInFrames={MM60.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="MythsMascot60-NoMusic" component={MythsMascot60} durationInFrames={MM60.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="MythsMascot45" component={MythsMascot45} durationInFrames={MM45.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="MythsMascot45-NoMusic" component={MythsMascot45} durationInFrames={MM45.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="MythsMascot-Thumb" component={MythsMascotThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="MythsMascot" component={MythsMascot} durationInFrames={MM.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="MythsMascot-NoMusic" component={MythsMascot} durationInFrames={MM.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="Myths-Thumb" component={MythsThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Myths" component={MythsCartoon} durationInFrames={MC.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="Myths-NoMusic" component={MythsCartoon} durationInFrames={MC.DURATION} fps={30} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="ToonTest" component={ToonTest} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="CreatineVO" component={CreatineVO} durationInFrames={CV.DURATION} fps={CV.FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="CreatineVO-NoMusic" component={CreatineVO} durationInFrames={CV.DURATION} fps={CV.FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="CreatineStory-Thumb" component={CreatineThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="CreatineStory" component={CreatineStory} durationInFrames={CS.DURATION} fps={CS.FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="CreatineStory-NoMusic" component={CreatineStory} durationInFrames={CS.DURATION} fps={CS.FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="Creatine" component={StoryCreatine} durationInFrames={SC.DURATION} fps={SC.FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="Creatine-NoMusic" component={StoryCreatine} durationInFrames={SC.DURATION} fps={SC.FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="Commercial-Thumb" component={CommercialThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="Commercial" component={Commercial} durationInFrames={CM.DURATION} fps={CM.FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="Commercial-NoMusic" component={Commercial} durationInFrames={CM.DURATION} fps={CM.FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="BenchElbows-Thumb" component={BenchThumb} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="BenchElbows" component={BenchElbows} durationInFrames={BE.DURATION} fps={BE.FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="BenchElbows-NoMusic" component={BenchElbows} durationInFrames={BE.DURATION} fps={BE.FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="FormCheck" component={FormCheck} durationInFrames={FC.DURATION} fps={FC.FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="FormCheck-NoMusic" component={FormCheck} durationInFrames={FC.DURATION} fps={FC.FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="FormClip" component={FormClip} durationInFrames={FL.DURATION} fps={FL.FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="FormClip-NoMusic" component={FormClip} durationInFrames={FL.DURATION} fps={FL.FPS} width={1080} height={1920} defaultProps={{ music: false }} />
  </>
);
